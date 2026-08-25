// The Hono app. createApp() builds a fresh app over a fresh database so tests
// can spin one up per case with `:memory:`; index.ts builds the real one.

import { Hono } from 'hono';
import { configFrom, type Config } from './config.ts';
import { randomBytes } from 'node:crypto';
import { migrate, openDb, type Db } from './db.ts';
import { clientIp, hashIp } from './iphash.ts';
import { saveMemorial } from './memorials.ts';
import { standardLimits } from './ratelimit.ts';
import { isReportReason, reportMemorial } from './reports.ts';
import { rankOf, saveRun } from './runs.ts';
import { sampleMemorials } from './sample.ts';
import { turnstileGate } from './turnstile.ts';
import { validateMemorial, validateRun } from './validate.ts';

export interface AppOptions {
  dbPath?: string;
  env?: Record<string, string | undefined>;
  /** Injected for tests; the Turnstile verify is the only outbound call. */
  fetch?: typeof fetch;
}

export interface App {
  fetch: Hono['fetch'];
  request: Hono['request'];
  config: Config;
  db: Db;
  limits: ReturnType<typeof standardLimits>;
}

export const BODY_LIMIT = 4096;

type Parsed = { ok: true; body: unknown } | { ok: false; status: 400 | 413 | 415; error: string };

async function readJson(req: Request): Promise<Parsed> {
  const type = req.headers.get('content-type') ?? '';
  if (!/^application\/json\b/i.test(type)) return { ok: false, status: 415, error: 'json-only' };
  const text = await req.text();
  if (text.length > BODY_LIMIT) return { ok: false, status: 413, error: 'too-big' };
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, error: 'bad-json' };
  }
}

export function createApp(opts: AppOptions = {}): App {
  const config = configFrom({ ...(opts.env ?? {}), ...(opts.dbPath ? { DB_PATH: opts.dbPath } : {}) });
  const db = openDb(config.dbPath);
  migrate(db);
  const app = new Hono();
  const ipSecret = config.ipHashSecret ?? randomBytes(32).toString('hex');
  const ipHashOf = (req: Request) => hashIp(clientIp(req.headers), ipSecret);
  const limits = standardLimits();
  const human = turnstileGate(config.turnstileSecret, opts.fetch ?? fetch);
  const notHuman = (c: { json: (o: unknown, s: 403) => Response }) => c.json({ error: 'not-verified' }, 403);
  const over = (c: { json: (o: unknown, s: 429) => Response }) => c.json({ error: 'slow-down' }, 429);

  app.get('/api/health', (c) => c.json({ ok: true }));

  app.get('/api/memorials', (c) => {
    if (!limits.get.take(ipHashOf(c.req.raw))) return over(c);
    const seed = (c.req.query('seed') ?? '').slice(0, 64);
    c.header('Cache-Control', 'public, max-age=300');
    return c.json(sampleMemorials(db, seed));
  });

  app.post('/api/memorials', async (c) => {
    if (!limits.memorialPost.take(ipHashOf(c.req.raw))) return over(c);
    if (!(await human(c.req.raw, clientIp(c.req.raw.headers)))) return notHuman(c);
    const parsed = await readJson(c.req.raw);
    if (!parsed.ok) return c.json({ error: parsed.error }, parsed.status);
    const valid = validateMemorial(parsed.body);
    if (!valid.ok) return c.json({ error: valid.error }, 400);
    const saved = saveMemorial(db, valid.value, ipHashOf(c.req.raw));
    if (!saved.ok) return c.json({ error: saved.error }, 422);
    return c.json({ id: saved.id, status: saved.status }, 201);
  });

  app.post('/api/memorials/:id/report', async (c) => {
    if (!limits.report.take(ipHashOf(c.req.raw))) return over(c);
    if (!(await human(c.req.raw, clientIp(c.req.raw.headers)))) return notHuman(c);
    const parsed = await readJson(c.req.raw);
    if (!parsed.ok) return c.json({ error: parsed.error }, parsed.status);
    const reason = (parsed.body as { reason?: unknown } | null)?.reason;
    if (!isReportReason(reason)) return c.json({ error: 'bad-reason' }, 400);
    const outcome = reportMemorial(db, c.req.param('id'), reason, ipHashOf(c.req.raw));
    if (outcome === 'missing') return c.json({ error: 'not-found' }, 404);
    return c.body(null, 204);
  });

  app.post('/api/runs', async (c) => {
    if (!limits.runPost.take(ipHashOf(c.req.raw))) return over(c);
    if (!(await human(c.req.raw, clientIp(c.req.raw.headers)))) return notHuman(c);
    const playerToken = c.req.header('x-player-token');
    if (!playerToken) return c.json({ error: 'no-player-token' }, 400);
    const parsed = await readJson(c.req.raw);
    if (!parsed.ok) return c.json({ error: parsed.error }, parsed.status);
    const valid = validateRun(parsed.body);
    if (!valid.ok) return c.json({ error: valid.error }, 400);
    const saved = saveRun(db, valid.value, playerToken, ipHashOf(c.req.raw));
    if (!saved.ok) return c.json({ error: saved.error }, saved.status);
    const { rank, total } = rankOf(db, saved.row);
    return c.json({ id: saved.row.id, rank, total, claimed: false }, 201);
  });

  return { fetch: app.fetch, request: app.request.bind(app), config, db, limits };
}

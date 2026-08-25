// The Hono app. createApp() builds a fresh app over a fresh database so tests
// can spin one up per case with `:memory:`; index.ts builds the real one.

import { Hono } from 'hono';
import { configFrom, type Config } from './config.ts';
import { migrate, openDb, type Db } from './db.ts';
import { saveMemorial } from './memorials.ts';
import { validateMemorial } from './validate.ts';

export interface AppOptions {
  dbPath?: string;
  env?: Record<string, string | undefined>;
}

export interface App {
  fetch: Hono['fetch'];
  request: Hono['request'];
  config: Config;
  db: Db;
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

  app.get('/api/health', (c) => c.json({ ok: true }));

  app.post('/api/memorials', async (c) => {
    const parsed = await readJson(c.req.raw);
    if (!parsed.ok) return c.json({ error: parsed.error }, parsed.status);
    const valid = validateMemorial(parsed.body);
    if (!valid.ok) return c.json({ error: valid.error }, 400);
    const saved = saveMemorial(db, valid.value, null);
    if (!saved.ok) return c.json({ error: saved.error }, 422);
    return c.json({ id: saved.id, status: saved.status }, 201);
  });

  return { fetch: app.fetch, request: app.request.bind(app), config, db };
}

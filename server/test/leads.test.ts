import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createApp, type App } from '../src/app.ts';
import { CONSENT_TEXT, CONSENT_VERSION, leadsCsv, normaliseEmail } from '../src/leads.ts';
import { purge } from '../src/purge.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;
const RUN = '4c1d3f0a-2b7e-4c0d-9d6e-1f2a3b4c5d6e';
const good = { runId: RUN, score: 1200, occupation: 'sysadmin', days: 41, survivorNames: ['Dana'], summitRoute: 'grade', celebration: 'swan', displayName: 'Dana' };
let ip = 0;
const post = (app: App, payload: unknown) =>
  app.request('/api/runs', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-player-token': 'tok-A', 'x-forwarded-for': `10.8.0.${++ip}` },
    body: JSON.stringify(payload),
  });
const leads = (app: App) => app.db.all<Record<string, unknown>>('select * from leads');

describe('the consent sentence', () => {
  it('is the plan’s, versioned', () => {
    expect(CONSENT_VERSION).toBe('consent-v1');
    expect(CONSENT_TEXT).toBe('I’m 18 or older, and I’d like occasional email from 8 West IT. I can unsubscribe with one click, any time.');
  });
});

describe('normaliseEmail', () => {
  it('trims and lowercases, and rejects what is not an address', () => {
    expect(normaliseEmail('  Dana@Example.COM ')).toBe('dana@example.com');
    expect(normaliseEmail('nope')).toBeNull();
    expect(normaliseEmail('a@b')).toBeNull();
    expect(normaliseEmail('two@@x.com')).toBeNull();
    expect(normaliseEmail('')).toBeNull();
  });
});

describe('lead capture on POST /api/runs', () => {
  it('no consent → no lead row, even with an email', async () => {
    const app = createApp({ dbPath: ':memory:' });
    const json: Json = await (await post(app, { ...good, email: 'dana@example.com' })).json();
    expect(json.claimed).toBe(false);
    expect(leads(app)).toHaveLength(0);
    const again: Json = await (await post(app, { ...good, email: 'dana@example.com', consent: false })).json();
    expect(again.claimed).toBe(false);
    expect(leads(app)).toHaveLength(0);
  });

  it('consent + email → a lead with the exact sentence, a token, and the unsubscribe link in the answer', async () => {
    const app = createApp({ dbPath: ':memory:', env: { PUBLIC_URL: 'https://8wt.8westit.com' } });
    const res = await post(app, { ...good, email: ' Dana@Example.com ', consent: true });
    const json: Json = await res.json();
    expect(json.claimed).toBe(true);
    expect(json.unsubscribeUrl).toMatch(/^https:\/\/8wt\.8westit\.com\/unsubscribe\/[A-Za-z0-9_-]{32,}$/);
    const rows = leads(app);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ email: 'dana@example.com', display_name: 'Dana', consent_text: CONSENT_TEXT, unsubscribed_at: null, source_run_id: RUN });
    expect(rows[0]!['consent_at']).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(json.unsubscribeUrl.endsWith(rows[0]!['unsubscribe_token'])).toBe(true);
    expect(app.db.get<{ lead_id: string }>('select lead_id from runs')?.lead_id).toBe(rows[0]!['id']);
  });

  it('a bad email with consent is rejected, and nothing is stored', async () => {
    const app = createApp({ dbPath: ':memory:' });
    const res = await post(app, { ...good, email: 'not-an-email', consent: true });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'bad-email' });
    expect(app.db.all('select id from runs')).toHaveLength(0);
  });

  it('a duplicate email updates the display name only and keeps the first consent and token', async () => {
    const app = createApp({ dbPath: ':memory:' });
    const first: Json = await (await post(app, { ...good, email: 'dana@example.com', consent: true })).json();
    const second: Json = await (await post(app, { ...good, runId: RUN.replace(/.$/, 'a'), displayName: 'The Dane', email: 'DANA@example.com', consent: true })).json();
    const rows = leads(app);
    expect(rows).toHaveLength(1);
    expect(rows[0]!['display_name']).toBe('The Dane');
    expect(rows[0]!['source_run_id']).toBe(RUN);
    expect(second.unsubscribeUrl).toBe(first.unsubscribeUrl);
  });

  it('re-consenting after an unsubscribe puts them back on the list', async () => {
    const app = createApp({ dbPath: ':memory:' });
    await post(app, { ...good, email: 'dana@example.com', consent: true });
    app.db.run("update leads set unsubscribed_at = '2026-08-01T00:00:00Z'");
    await post(app, { ...good, runId: RUN.replace(/.$/, 'b'), email: 'dana@example.com', consent: true });
    expect(leads(app)[0]!['unsubscribed_at']).toBeNull();
  });

  it('the email is never in a public response', async () => {
    const app = createApp({ dbPath: ':memory:' });
    const text = await (await post(app, { ...good, email: 'dana@example.com', consent: true })).text();
    expect(text).not.toContain('dana@example.com');
  });
});

describe('the list', () => {
  it('leads.csv has the consented, minus the unsubscribed, with a header', () => {
    const app = createApp({ dbPath: ':memory:' });
    app.db.run(`insert into leads (id, email, display_name, consent_text, consent_at, unsubscribe_token, source_run_id) values ('L1', 'a@example.com', 'A', 'c', '2026-08-01T00:00:00Z', 't1', 'r1')`);
    app.db.run(`insert into leads (id, email, display_name, consent_text, consent_at, unsubscribe_token, unsubscribed_at) values ('L2', 'b@example.com', 'B, "Bee"', 'c', '2026-08-02T00:00:00Z', 't2', '2026-08-03T00:00:00Z')`);
    app.db.run(`insert into leads (id, email, display_name, consent_text, consent_at, unsubscribe_token) values ('L3', 'c@example.com', 'C', 'c', '2026-08-03T00:00:00Z', 't3')`);
    expect(leadsCsv(app.db)).toBe('email,display_name,consent_at,source_run_id\r\na@example.com,A,2026-08-01T00:00:00Z,r1\r\nc@example.com,C,2026-08-03T00:00:00Z,\r\n');
  });

  it('admin.mjs leads.csv prints the same', () => {
    const dir = mkdtempSync(join(tmpdir(), '8wt-leads-'));
    try {
      const dbPath = join(dir, 'test.db');
      const app = createApp({ dbPath });
      app.db.run(`insert into leads (id, email, display_name, consent_text, consent_at, unsubscribe_token) values ('L1', 'a@example.com', 'A', 'c', '2026-08-01T00:00:00Z', 't1')`);
      app.db.close();
      const out = execFileSync(process.execPath, ['admin.mjs', 'leads.csv'], { env: { ...process.env, DB_PATH: dbPath }, encoding: 'utf8' });
      expect(out).toBe('email,display_name,consent_at,source_run_id\r\na@example.com,A,2026-08-01T00:00:00Z,\r\n');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('the purge and the unsubscribed', () => {
  it('replaces the email with its sha256 thirty days after unsubscribing; the row and the token stay', () => {
    const app = createApp({ dbPath: ':memory:' });
    app.db.run(`insert into leads (id, email, display_name, consent_text, consent_at, unsubscribe_token, unsubscribed_at) values ('OLD', 'old@example.com', 'O', 'c', '2026-06-01T00:00:00Z', 't1', '2026-07-01T00:00:00Z')`);
    app.db.run(`insert into leads (id, email, display_name, consent_text, consent_at, unsubscribe_token, unsubscribed_at) values ('NEW', 'new@example.com', 'N', 'c', '2026-06-01T00:00:00Z', 't2', '2026-08-20T00:00:00Z')`);
    const r = purge(app.db, new Date('2026-08-25T00:00:00Z'));
    expect(r.leads).toBe(1);
    const emails = Object.fromEntries(app.db.all<{ id: string; email: string }>('select id, email from leads').map((x) => [x.id, x.email]));
    expect(emails['NEW']).toBe('new@example.com');
    expect(emails['OLD']).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(purge(app.db, new Date('2026-08-25T00:00:00Z')).leads).toBe(0);
  });
});

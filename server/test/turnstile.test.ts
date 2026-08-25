import { describe, expect, it, vi } from 'vitest';
import { createApp, type App } from '../src/app.ts';
import { verifyTurnstile } from '../src/turnstile.ts';

type FetchLike = typeof fetch;
function fakeFetch(success: boolean, status = 200): FetchLike & { calls: { url: string; body: string }[] } {
  const calls: { url: string; body: string }[] = [];
  const f = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), body: String(init?.body ?? '') });
    return new Response(JSON.stringify({ success }), { status, headers: { 'content-type': 'application/json' } });
  }) as unknown as FetchLike & { calls: typeof calls };
  f.calls = calls;
  return f;
}

describe('verifyTurnstile', () => {
  it('passes when siteverify says success, posting secret, token and ip', async () => {
    const f = fakeFetch(true);
    expect(await verifyTurnstile('tok', '1.2.3.4', 'SECRET', f)).toBe(true);
    expect(f.calls[0]!.url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(f.calls[0]!.body).toContain('secret=SECRET');
    expect(f.calls[0]!.body).toContain('response=tok');
    expect(f.calls[0]!.body).toContain('remoteip=1.2.3.4');
  });
  it('fails when siteverify says no, when it errors, or when the token is missing', async () => {
    expect(await verifyTurnstile('tok', '1.2.3.4', 'SECRET', fakeFetch(false))).toBe(false);
    expect(await verifyTurnstile('tok', '1.2.3.4', 'SECRET', fakeFetch(true, 500))).toBe(false);
    expect(await verifyTurnstile('tok', '1.2.3.4', 'SECRET', (async () => { throw new Error('down'); }) as unknown as FetchLike)).toBe(false);
    const f = fakeFetch(true);
    expect(await verifyTurnstile(null, '1.2.3.4', 'SECRET', f)).toBe(false);
    expect(f.calls).toHaveLength(0);
  });
});

const body = { runId: '4c1d3f0a-2b7e-4c0d-9d6e-1f2a3b4c5d6e', mile: 212, day: 14, cause: 'THIRST', names: ['Dana'], epitaph: 'X' };
const post = (app: App, token: string | null) =>
  app.request('/api/memorials', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { 'turnstile-token': token } : {}) },
    body: JSON.stringify(body),
  });

describe('the POSTs behind Turnstile', () => {
  it('with a secret set, a bad or missing token is 403 and nothing is saved', async () => {
    const app = createApp({ dbPath: ':memory:', env: { TURNSTILE_SECRET: 'S' }, fetch: fakeFetch(false) });
    expect((await post(app, 'bad')).status).toBe(403);
    expect((await post(app, null)).status).toBe(403);
    expect(app.db.all('select id from memorials')).toHaveLength(0);
  });
  it('with a secret set, a good token goes through', async () => {
    const app = createApp({ dbPath: ':memory:', env: { TURNSTILE_SECRET: 'S' }, fetch: fakeFetch(true) });
    expect((await post(app, 'good')).status).toBe(201);
  });
  it('with no secret (dev), verification is skipped and a warning logs once', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const f = fakeFetch(true);
    const app = createApp({ dbPath: ':memory:', env: {}, fetch: f });
    expect((await post(app, null)).status).toBe(201);
    expect((await post(app, null)).status).toBe(201);
    expect(f.calls).toHaveLength(0);
    expect(warn.mock.calls.filter((c) => /TURNSTILE_SECRET/.test(String(c[0])))).toHaveLength(1);
    warn.mockRestore();
  });
  it('reports need the token too', async () => {
    const app = createApp({ dbPath: ':memory:', env: { TURNSTILE_SECRET: 'S' }, fetch: fakeFetch(false) });
    app.db.run(`insert into memorials (id, run_id, mile, day, cause, names, epitaph, created_at) values ('M1', 'r', 1, 1, 'THIRST', '["A"]', 'E', 'now')`);
    const res = await app.request('/api/memorials/M1/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reason: 'rude' }) });
    expect(res.status).toBe(403);
  });
});

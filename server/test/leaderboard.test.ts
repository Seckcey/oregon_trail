import { describe, expect, it } from 'vitest';
import { createApp, type App } from '../src/app.ts';
import { hashPlayerToken } from '../src/runs.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

function seedRun(app: App, i: number, score: number, opts: { status?: string; token?: string; createdAt?: string } = {}): void {
  app.db.run(
    `insert into runs (id, run_id, player_token, score, occupation, days, survivors, survivor_names, summit_route, celebration, display_name, status, created_at)
     values (?, ?, ?, ?, 'intern', 40, 4, '["A","B","C","D"]', 'grade', 'swan', ?, ?, ?)`,
    [`ID${String(i).padStart(3, '0')}`, `run-${i}`, hashPlayerToken(opts.token ?? 'someone-else'), score, `Player ${i}`, opts.status ?? 'visible', opts.createdAt ?? `2026-08-${String(1 + (i % 28)).padStart(2, '0')}T00:00:00Z`],
  );
}
const get = (app: App, query = '', token?: string) =>
  app.request(`/api/leaderboard${query}`, { headers: token ? { 'x-player-token': token } : {} });

describe('GET /api/leaderboard', () => {
  it('answers the top 25 visible runs with ranks, and no email-shaped anything', async () => {
    const app = createApp({ dbPath: ':memory:' });
    for (let i = 0; i < 40; i++) seedRun(app, i, 100 * i);
    seedRun(app, 99, 99_999, { status: 'hidden' });
    const res = await get(app);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('public, max-age=60');
    const json: Json = await res.json();
    expect(json.top).toHaveLength(25);
    expect(json.top[0]).toEqual({ rank: 1, displayName: 'Player 39', score: 3900, occupation: 'intern', days: 40, survivors: 4, summitRoute: 'grade', celebration: 'swan' });
    expect(json.top[24].rank).toBe(25);
    expect(json.yours).toBeNull();
    expect(JSON.stringify(json)).not.toMatch(/@|player_token|lead_id|ip_hash/);
  });

  it('ties keep the earlier run ahead', async () => {
    const app = createApp({ dbPath: ':memory:' });
    seedRun(app, 1, 500, { createdAt: '2026-08-02T00:00:00Z' });
    seedRun(app, 2, 500, { createdAt: '2026-08-01T00:00:00Z' });
    const json: Json = await (await get(app)).json();
    expect(json.top.map((r: { displayName: string }) => r.displayName)).toEqual(['Player 2', 'Player 1']);
  });

  it('empty board → top [] and yours null', async () => {
    const app = createApp({ dbPath: ':memory:' });
    expect(await (await get(app)).json()).toEqual({ top: [], yours: null });
  });

  it('with ?run= and the token that posted it, yours carries the rank; the response is private', async () => {
    const app = createApp({ dbPath: ':memory:' });
    for (let i = 0; i < 30; i++) seedRun(app, i, 100 * i);
    seedRun(app, 50, 150, { token: 'mine' });
    const res = await get(app, '?run=run-50', 'mine');
    expect(res.headers.get('cache-control')).toBe('private, max-age=60');
    const json: Json = await res.json();
    expect(json.yours).toEqual({ rank: 29, score: 150, total: 31 });
  });

  it('yours is null without the token, with the wrong token, with an unknown run, or when the run is hidden', async () => {
    const app = createApp({ dbPath: ':memory:' });
    seedRun(app, 1, 100, { token: 'mine' });
    seedRun(app, 2, 200, { token: 'mine', status: 'hidden' });
    expect(((await (await get(app, '?run=run-1')).json()) as Json).yours).toBeNull();
    expect(((await (await get(app, '?run=run-1', 'theirs')).json()) as Json).yours).toBeNull();
    expect(((await (await get(app, '?run=nope', 'mine')).json()) as Json).yours).toBeNull();
    expect(((await (await get(app, '?run=run-2', 'mine')).json()) as Json).yours).toBeNull();
  });

  it('shares the GET rate limit', async () => {
    const app = createApp({ dbPath: ':memory:' });
    for (let i = 0; i < 60; i++) expect((await app.request('/api/leaderboard', { headers: { 'x-forwarded-for': '10.0.0.9' } })).status).toBe(200);
    expect((await app.request('/api/leaderboard', { headers: { 'x-forwarded-for': '10.0.0.9' } })).status).toBe(429);
  });
});

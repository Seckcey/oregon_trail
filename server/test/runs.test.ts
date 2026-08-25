import { describe, expect, it } from 'vitest';
import { createApp, type App } from '../src/app.ts';
import { rankOf } from '../src/runs.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;
const RUN = '4c1d3f0a-2b7e-4c0d-9d6e-1f2a3b4c5d6e';
const good = { runId: RUN, score: 1800, occupation: 'sysadmin', days: 41, survivorNames: ['Dana', 'Wes', 'Kit'], summitRoute: 'grade', celebration: 'swan', displayName: 'Dana' };

async function post(app: App, payload: unknown, headers: Record<string, string> = {}): Promise<Response> {
  return app.request('/api/runs', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-player-token': 'tok-A', ...headers },
    body: JSON.stringify(payload),
  });
}
function seedRun(app: App, id: string, score: number, createdAt: string, status = 'visible'): void {
  app.db.run(
    `insert into runs (id, run_id, player_token, score, occupation, days, survivors, survivor_names, display_name, status, created_at)
     values (?, ?, 'p', ?, 'ceo', 30, 5, '["A"]', ?, ?, ?)`,
    [id, `run-${id}`, score, id, status, createdAt],
  );
}

describe('POST /api/runs', () => {
  it('saves a finished run and answers 201 with its rank out of the visible total', async () => {
    const app = createApp({ dbPath: ':memory:' });
    seedRun(app, 'HIGH', 3000, '2026-08-01T00:00:00Z');
    seedRun(app, 'LOW', 100, '2026-08-01T00:00:00Z');
    seedRun(app, 'HIDDEN', 9000, '2026-08-01T00:00:00Z', 'hidden');
    const res = await post(app, good);
    expect(res.status).toBe(201);
    const json: Json = await res.json();
    expect(json).toMatchObject({ rank: 2, total: 3, claimed: false });
    expect(json.id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    expect(json.unsubscribeUrl).toBeUndefined();
    const row = app.db.get<Record<string, unknown>>('select * from runs where run_id = ?', [RUN])!;
    expect(row).toMatchObject({ score: 1800, occupation: 'sysadmin', days: 41, survivors: 3, survivor_names: '["Dana","Wes","Kit"]', summit_route: 'grade', celebration: 'swan', display_name: 'Dana', status: 'visible', lead_id: null });
    expect(row['player_token']).toMatch(/^[0-9a-f]{64}$/);
    expect(row['player_token']).not.toContain('tok-A');
  });

  it('is idempotent on runId: a second post updates the row (the claim screen re-posts with a nickname)', async () => {
    const app = createApp({ dbPath: ':memory:' });
    const first: Json = await (await post(app, good)).json();
    const second: Json = await (await post(app, { ...good, displayName: 'The Dane' })).json();
    expect(second.id).toBe(first.id);
    expect(app.db.all('select id from runs')).toHaveLength(1);
    expect(app.db.get<{ display_name: string }>('select display_name from runs')?.display_name).toBe('The Dane');
  });

  it('defaults the display name to the first survivor, filtered', async () => {
    const app = createApp({ dbPath: ':memory:' });
    await post(app, { ...good, displayName: undefined });
    expect(app.db.get<{ display_name: string }>('select display_name from runs')?.display_name).toBe('Dana');
  });

  it('a rude nickname hides the run from the board but still answers 201', async () => {
    const app = createApp({ dbPath: ':memory:' });
    const res = await post(app, { ...good, displayName: 'sh1thead' });
    expect(res.status).toBe(201);
    expect(app.db.get<{ status: string }>('select status from runs')?.status).toBe('hidden');
  });

  it('rejects a score the occupation and survivor count cannot reach', async () => {
    const app = createApp({ dbPath: ':memory:' });
    // sysadmin ×2, 3 survivors: max = 2 × (3 × 500 + 54 + 200) = 3508
    expect((await post(app, { ...good, score: 3508 })).status).toBe(201);
    const res = await post(app, { ...good, runId: RUN.replace(/.$/, 'f'), score: 3509 });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'bad-score' });
  });

  it('validates the rest of the body', async () => {
    const app = createApp({ dbPath: ':memory:' });
    let n = 0;
    const bad = async (patch: Record<string, unknown>, error: string) => {
      const res = await post(app, { ...good, ...patch }, { 'x-forwarded-for': `10.9.0.${++n}` }); // one address per try: the limiter is 6/hour
      expect(res.status, error).toBe(400);
      expect(await res.json()).toEqual({ error });
    };
    await bad({ runId: 'x' }, 'bad-run-id');
    await bad({ score: -1 }, 'bad-score');
    await bad({ score: 1.5 }, 'bad-score');
    await bad({ occupation: 'banker' }, 'bad-occupation');
    await bad({ days: 0 }, 'bad-days');
    await bad({ days: 401 }, 'bad-days');
    await bad({ survivorNames: [] }, 'bad-survivors');
    await bad({ survivorNames: ['a', 'b', 'c', 'd', 'e', 'f'] }, 'bad-survivors');
    await bad({ summitRoute: 'helicopter' }, 'bad-summit');
    await bad({ celebration: 'nap' }, 'bad-celebration');
    await bad({ displayName: 'x' }, 'bad-display-name');
    await bad({ displayName: 'x'.repeat(17) }, 'bad-display-name');
    await bad({ email: 42 }, 'bad-email');
    await bad({ consent: 'yes' }, 'bad-consent');
  });

  it('a display name with contact info is rejected with the one message', async () => {
    const app = createApp({ dbPath: ':memory:' });
    const res = await post(app, { ...good, displayName: 'insta dana' });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: 'no-contact' });
  });

  it('needs the player token header', async () => {
    const app = createApp({ dbPath: ':memory:' });
    const res = await app.request('/api/runs', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(good) });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'no-player-token' });
  });

  it('allows null summit route and celebration', async () => {
    const app = createApp({ dbPath: ':memory:' });
    expect((await post(app, { ...good, summitRoute: null, celebration: null })).status).toBe(201);
  });
});

describe('rankOf', () => {
  it('ranks by score, ties by the earlier run, over visible rows only', () => {
    const app = createApp({ dbPath: ':memory:' });
    seedRun(app, 'A', 1000, '2026-08-01T00:00:00Z');
    seedRun(app, 'B', 1000, '2026-08-02T00:00:00Z');
    seedRun(app, 'C', 1000, '2026-08-03T00:00:00Z');
    seedRun(app, 'D', 500, '2026-08-01T00:00:00Z', 'hidden');
    expect(rankOf(app.db, { score: 1000, created_at: '2026-08-02T00:00:00Z' })).toEqual({ rank: 2, total: 3 });
    expect(rankOf(app.db, { score: 1000, created_at: '2026-08-01T00:00:00Z' })).toEqual({ rank: 1, total: 3 });
    expect(rankOf(app.db, { score: 999, created_at: '2026-08-09T00:00:00Z' })).toEqual({ rank: 4, total: 3 });
  });
});

import { describe, expect, it } from 'vitest';
import { createApp, type App } from '../src/app.ts';
import { BUCKETS, bucketOf, sampleMemorials } from '../src/sample.ts';

function seedRows(app: App, count: number, opts: { hidden?: boolean; mileOf?: (i: number) => number } = {}): void {
  for (let i = 0; i < count; i++) {
    const mile = opts.mileOf ? opts.mileOf(i) : (i * 37) % 731;
    app.db.run(
      `insert into memorials (id, run_id, mile, day, cause, names, epitaph, status, created_at)
       values (?, ?, ?, ?, 'THIRST', '["A"]', ?, ?, ?)`,
      [`ID${String(i).padStart(4, '0')}`, `run-${i}`, mile, 1 + (i % 100), `E${i}`, opts.hidden ? 'hidden' : 'visible', new Date(1700000000000 + i * 1000).toISOString()],
    );
  }
}

describe('the route-wide sample', () => {
  it('cuts the 730 miles into 20 buckets, the last one closed at 730', () => {
    expect(BUCKETS).toBe(20);
    expect(bucketOf(0)).toBe(0);
    expect(bucketOf(36)).toBe(0);
    expect(bucketOf(37)).toBe(1);
    expect(bucketOf(730)).toBe(19);
  });

  it('returns [] from an empty table', () => {
    const app = createApp({ dbPath: ':memory:' });
    expect(sampleMemorials(app.db, 'seed')).toEqual([]);
  });

  it('returns at most 40 rows and at most 2 per bucket', () => {
    const app = createApp({ dbPath: ':memory:' });
    seedRows(app, 500);
    const rows = sampleMemorials(app.db, 'seed');
    expect(rows.length).toBeLessThanOrEqual(40);
    expect(rows.length).toBeGreaterThan(30);
    const perBucket = new Map<number, number>();
    for (const r of rows) perBucket.set(bucketOf(r.mile), (perBucket.get(bucketOf(r.mile)) ?? 0) + 1);
    for (const n of perBucket.values()) expect(n).toBeLessThanOrEqual(2);
  });

  it('never returns a hidden or removed row', () => {
    const app = createApp({ dbPath: ':memory:' });
    seedRows(app, 100, { hidden: true });
    expect(sampleMemorials(app.db, 'seed')).toEqual([]);
    app.db.run("update memorials set status = 'removed'");
    expect(sampleMemorials(app.db, 'seed')).toEqual([]);
    app.db.run("update memorials set status = 'reviewed_ok'");
    expect(sampleMemorials(app.db, 'seed').length).toBeGreaterThan(0);
  });

  it('is deterministic for a seed and differs between seeds', () => {
    const app = createApp({ dbPath: ':memory:' });
    seedRows(app, 500);
    const a = sampleMemorials(app.db, 'alpha').map((r) => r.id);
    const b = sampleMemorials(app.db, 'alpha').map((r) => r.id);
    const c = sampleMemorials(app.db, 'bravo').map((r) => r.id);
    expect(a).toEqual(b);
    expect(c).not.toEqual(a);
  });

  it('leans recent: with 100 rows in one bucket, the pick is usually from the newest few', () => {
    const app = createApp({ dbPath: ':memory:' });
    seedRows(app, 100, { mileOf: () => 212 });
    let recent = 0;
    for (let s = 0; s < 200; s++) {
      for (const r of sampleMemorials(app.db, `seed-${s}`)) if (Number(r.id.slice(2)) >= 95) recent += 1;
    }
    // 400 picks; 70% aimed at the newest five, 30% anywhere → well over half land recent.
    expect(recent).toBeGreaterThan(220);
    expect(recent).toBeLessThan(380);
  });

  it('rows carry only what the road needs, names parsed back to an array', () => {
    const app = createApp({ dbPath: ':memory:' });
    seedRows(app, 1);
    expect(sampleMemorials(app.db, 'seed')).toEqual([{ id: 'ID0000', names: ['A'], mile: 0, day: 1, cause: 'THIRST', epitaph: 'E0' }]);
  });
});

describe('GET /api/memorials', () => {
  it('answers the sample with a five-minute public cache', async () => {
    const app = createApp({ dbPath: ':memory:' });
    seedRows(app, 10);
    const res = await app.request('/api/memorials?seed=abc');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('public, max-age=300');
    const rows = (await res.json()) as { id: string }[];
    expect(rows.length).toBeGreaterThan(0);
    expect(rows).toEqual(sampleMemorials(app.db, 'abc'));
  });

  it('a missing seed still answers', async () => {
    const app = createApp({ dbPath: ':memory:' });
    expect((await app.request('/api/memorials')).status).toBe(200);
  });
});

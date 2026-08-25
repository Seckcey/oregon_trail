import { describe, expect, it } from 'vitest';
import { createApp, type App } from '../src/app.ts';
import { purge, RETENTION_DAYS } from '../src/purge.ts';

function memorial(app: App, id: string, createdAt: string): void {
  app.db.run(
    `insert into memorials (id, run_id, mile, day, cause, names, epitaph, ip_hash, created_at) values (?, ?, 1, 1, 'THIRST', '["A"]', 'E', 'hash', ?)`,
    [id, `run-${id}`, createdAt],
  );
  app.db.run(`insert into reports (id, memorial_id, reason, ip_hash, created_at) values (?, ?, 'rude', 'hash', ?)`, [`R${id}`, id, createdAt]);
}

describe('the 30-day purge', () => {
  it('nulls ip_hash only on rows older than 30 days, and touches nothing else', () => {
    const app = createApp({ dbPath: ':memory:' });
    memorial(app, 'OLD', '2026-07-01T00:00:00Z');
    memorial(app, 'EDGE', '2026-07-26T12:00:00Z'); // 29.5 days before now
    memorial(app, 'NEW', '2026-08-24T00:00:00Z');
    expect(RETENTION_DAYS).toBe(30);
    const result = purge(app.db, new Date('2026-08-25T00:00:00Z'));
    expect(result).toEqual({ memorials: 1, reports: 1, runs: 0, leads: 0 });
    const hashes = Object.fromEntries(app.db.all<{ id: string; ip_hash: string | null }>('select id, ip_hash from memorials').map((r) => [r.id, r.ip_hash]));
    expect(hashes).toEqual({ OLD: null, EDGE: 'hash', NEW: 'hash' });
    expect(app.db.get<{ ip_hash: string | null }>("select ip_hash from reports where id = 'ROLD'")?.ip_hash).toBeNull();
    expect(app.db.get<{ ip_hash: string | null }>("select ip_hash from reports where id = 'RNEW'")?.ip_hash).toBe('hash');
    expect(app.db.all('select id from memorials')).toHaveLength(3);
  });
  it('is idempotent', () => {
    const app = createApp({ dbPath: ':memory:' });
    memorial(app, 'OLD', '2026-07-01T00:00:00Z');
    purge(app.db, new Date('2026-08-25T00:00:00Z'));
    expect(purge(app.db, new Date('2026-08-25T00:00:00Z'))).toEqual({ memorials: 0, reports: 0, runs: 0, leads: 0 });
  });
});

import { describe, expect, it } from 'vitest';
import { createApp, type App } from '../src/app.ts';
import { hashIp } from '../src/iphash.ts';
import { reportMemorial } from '../src/reports.ts';

function seed(app: App, id = 'M1'): void {
  app.db.run(
    `insert into memorials (id, run_id, mile, day, cause, names, epitaph, status, created_at)
     values (?, ?, 212, 14, 'THIRST', '["A"]', 'E', 'visible', '2026-08-25T00:00:00Z')`,
    [id, `run-${id}`],
  );
}
function status(app: App, id = 'M1'): { status: string; hide_reason: string | null; report_count: number } {
  return app.db.get('select status, hide_reason, report_count from memorials where id = ?', [id])!;
}
const day1 = new Date('2026-08-25T10:00:00Z');
const day2 = new Date('2026-08-26T10:00:00Z');

describe('the report state machine', () => {
  it('one report counts; a second distinct reporter hides it', () => {
    const app = createApp({ dbPath: ':memory:' });
    seed(app);
    expect(reportMemorial(app.db, 'M1', 'rude', 'ipA', day1)).toBe('counted');
    expect(status(app)).toEqual({ status: 'visible', hide_reason: null, report_count: 1 });
    expect(reportMemorial(app.db, 'M1', 'spam', 'ipB', day1)).toBe('hidden');
    expect(status(app)).toEqual({ status: 'hidden', hide_reason: 'reports', report_count: 2 });
  });

  it('the same reporter on the same day counts once', () => {
    const app = createApp({ dbPath: ':memory:' });
    seed(app);
    const ip = '203.0.113.9';
    reportMemorial(app.db, 'M1', 'rude', hashIp(ip, 's', day1), day1);
    expect(reportMemorial(app.db, 'M1', 'rude', hashIp(ip, 's', day1), day1)).toBe('duplicate');
    expect(status(app).report_count).toBe(1);
    // "Per day" is the daily salt: tomorrow the same address hashes differently and counts again.
    expect(reportMemorial(app.db, 'M1', 'rude', hashIp(ip, 's', day2), day2)).toBe('hidden');
  });

  it('a real-name report hides on the first report from anyone', () => {
    const app = createApp({ dbPath: ':memory:' });
    seed(app);
    expect(reportMemorial(app.db, 'M1', 'real-name', 'ipC', day1)).toBe('hidden');
    expect(status(app)).toEqual({ status: 'hidden', hide_reason: 'reports', report_count: 1 });
  });

  it('a third reporter still counts but nothing else changes; Frank’s verdicts are not overturned', () => {
    const app = createApp({ dbPath: ':memory:' });
    seed(app);
    reportMemorial(app.db, 'M1', 'rude', 'ipA', day1);
    reportMemorial(app.db, 'M1', 'rude', 'ipB', day1);
    expect(reportMemorial(app.db, 'M1', 'other', 'ipC', day1)).toBe('counted');
    expect(status(app).report_count).toBe(3);
    app.db.run("update memorials set status = 'reviewed_ok' where id = 'M1'");
    reportMemorial(app.db, 'M1', 'rude', 'ipD', day1);
    reportMemorial(app.db, 'M1', 'real-name', 'ipE', day1);
    expect(status(app).status).toBe('reviewed_ok');
  });

  it('unknown memorial → missing', () => {
    const app = createApp({ dbPath: ':memory:' });
    expect(reportMemorial(app.db, 'NOPE', 'rude', 'ipA', day1)).toBe('missing');
  });
});

describe('POST /api/memorials/:id/report', () => {
  const post = (app: App, id: string, reason: unknown, ip: string) =>
    app.request(`/api/memorials/${id}/report`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify({ reason }),
    });

  it('answers 204 and hides on the second network', async () => {
    const app = createApp({ dbPath: ':memory:' });
    seed(app);
    expect((await post(app, 'M1', 'rude', '10.0.0.1')).status).toBe(204);
    expect(status(app).status).toBe('visible');
    expect((await post(app, 'M1', 'rude', '10.0.0.1')).status).toBe(204); // same network again: still 204, still one
    expect(status(app).report_count).toBe(1);
    expect((await post(app, 'M1', 'spam', '10.0.0.2')).status).toBe(204);
    expect(status(app).status).toBe('hidden');
  });

  it('rejects a bad reason with 400 and an unknown id with 404', async () => {
    const app = createApp({ dbPath: ':memory:' });
    seed(app);
    expect((await post(app, 'M1', 'because', '10.0.0.1')).status).toBe(400);
    expect((await post(app, 'NOPE', 'rude', '10.0.0.1')).status).toBe(404);
  });

  it('stores a hash, never the address', async () => {
    const app = createApp({ dbPath: ':memory:' });
    seed(app);
    await post(app, 'M1', 'rude', '203.0.113.9');
    const row = app.db.get<{ ip_hash: string }>('select ip_hash from reports')!;
    expect(row.ip_hash).not.toContain('203.0.113.9');
    expect(row.ip_hash).toMatch(/^[0-9a-f]{32,}$/);
  });
});

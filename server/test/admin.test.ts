import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp, type App } from '../src/app.ts';

let dir: string;
let dbPath: string;
let app: App;

function admin(...args: string[]): string {
  return execFileSync(process.execPath, ['admin.mjs', ...args], { env: { ...process.env, DB_PATH: dbPath }, encoding: 'utf8' }).replace(/\r\n/g, '\n');
}
function insert(id: string, status: string, hideReason: string | null, epitaph: string, reports = 0): void {
  app.db.run(
    `insert into memorials (id, run_id, mile, day, cause, names, epitaph, status, hide_reason, report_count, created_at)
     values (?, ?, 212, 14, 'THIRST', '["Dana","Wes"]', ?, ?, ?, ?, '2026-08-25T10:00:00Z')`,
    [id, `run-${id}`, epitaph, status, hideReason, reports],
  );
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), '8wt-admin-'));
  dbPath = join(dir, 'test.db');
  app = createApp({ dbPath });
  insert('01HFILTERHIT00000000000000', 'hidden', 'filter', 'SH1T HAPPENS');
  insert('01HREPORTED000000000000000', 'hidden', 'reports', 'DANA SMITH OF TUCSON', 2);
  app.db.run(`insert into reports (id, memorial_id, reason, created_at) values ('R1', '01HREPORTED000000000000000', 'real-name', '2026-08-25T11:00:00Z')`);
  app.db.run(`insert into reports (id, memorial_id, reason, created_at) values ('R2', '01HREPORTED000000000000000', 'rude', '2026-08-25T12:00:00Z')`);
  insert('01HVISIBLE0000000000000000', 'visible', null, 'REST EASY');
  app.db.close();
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('admin.mjs', () => {
  it('queue lists the hidden memorials with why, and their reports', () => {
    expect(admin('queue')).toMatchInlineSnapshot(`
      "HIDDEN MEMORIALS (2)

      01HFILTERHIT00000000000000  filter   mile 212  day 14  THIRST  2026-08-25
        Dana, Wes — "SH1T HAPPENS"

      01HREPORTED000000000000000  reports  mile 212  day 14  THIRST  2026-08-25
        Dana, Wes — "DANA SMITH OF TUCSON"
        reports (2): real-name, rude

      ok <id> to show it again · remove <id> to take it down for good
      "
    `);
  });

  it('ok makes a memorial reviewed_ok (visible on the road again)', () => {
    expect(admin('ok', '01HFILTERHIT00000000000000')).toBe('01HFILTERHIT00000000000000 → reviewed_ok\n');
    const db = createApp({ dbPath }).db;
    expect(db.get<{ status: string; hide_reason: string | null }>("select status, hide_reason from memorials where id = '01HFILTERHIT00000000000000'")).toEqual({ status: 'reviewed_ok', hide_reason: null });
    db.close();
    expect(admin('queue')).toContain('HIDDEN MEMORIALS (1)');
  });

  it('remove takes a memorial down for good', () => {
    expect(admin('remove', '01HVISIBLE0000000000000000')).toBe('01HVISIBLE0000000000000000 → removed\n');
    const db = createApp({ dbPath }).db;
    expect(db.get<{ status: string; hide_reason: string }>("select status, hide_reason from memorials where id = '01HVISIBLE0000000000000000'")).toEqual({ status: 'removed', hide_reason: 'admin' });
    db.close();
  });

  it('an unknown id or command fails loudly', () => {
    expect(() => admin('ok', 'NOPE')).toThrow(/no memorial NOPE/);
    expect(() => admin('dance')).toThrow(/usage/);
  });
});

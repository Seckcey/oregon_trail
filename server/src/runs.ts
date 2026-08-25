// The leaderboard's write path and the rank query (docs/PHASE4-PLAN.md §3, §7).
// The server recomputes nothing — the sim is client-side — but it bounds the
// score by what the occupation and survivor count can produce, filters the
// nickname, and stores sha256(player token) so the same browser can ask
// "which of these are mine?".

import { createHash } from 'node:crypto';
import type { Db } from './db.ts';
import { filterField } from './filter.ts';
import { ulid } from './ulid.ts';
import { LIMITS, type RunBody } from './validate.ts';

export interface RunRow {
  id: string;
  run_id: string;
  player_token: string;
  score: number;
  occupation: 'ceo' | 'sysadmin' | 'intern';
  days: number;
  survivors: number;
  survivor_names: string;
  summit_route: string | null;
  celebration: string | null;
  display_name: string;
  lead_id: string | null;
  status: string;
  ip_hash: string | null;
  created_at: string;
}

export function hashPlayerToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** The best score this occupation can post with this many survivors. */
export function scoreCeiling(occupation: RunBody['occupation'], survivors: number): number {
  const p = LIMITS.score;
  return p.multiplier[occupation] * (survivors * p.healthMax + p.supplyCap + p.cashCap[occupation]);
}

export function rankOf(db: Db, run: { score: number; created_at: string }): { rank: number; total: number } {
  const ahead = db.get<{ n: number }>(
    `select count(*) as n from runs where status in ('visible', 'reviewed_ok') and (score > ? or (score = ? and created_at < ?))`,
    [run.score, run.score, run.created_at],
  )!.n;
  const total = db.get<{ n: number }>(`select count(*) as n from runs where status in ('visible', 'reviewed_ok')`)!.n;
  return { rank: ahead + 1, total };
}

export type SaveRunResult =
  | { ok: true; row: RunRow; hidden: boolean }
  | { ok: false; status: 400 | 422; error: string };

export function saveRun(db: Db, body: RunBody, playerToken: string, ipHash: string | null, now = new Date()): SaveRunResult {
  const survivors: string[] = [];
  let hidden = false;
  for (const raw of body.survivorNames) {
    const name = filterField(raw, { max: LIMITS.nameMax, min: 1 });
    if (name.reject === 'no-contact') return { ok: false, status: 422, error: 'no-contact' };
    if (name.reject === 'too-short') continue;
    hidden ||= name.hidden;
    survivors.push(name.text);
  }
  if (survivors.length === 0) return { ok: false, status: 400, error: 'bad-survivors' };
  if (body.score > scoreCeiling(body.occupation, survivors.length)) return { ok: false, status: 400, error: 'bad-score' };

  const display = filterField(body.displayName ?? survivors[0]!, { max: LIMITS.nameMax, min: 2 });
  if (display.reject === 'no-contact') return { ok: false, status: 422, error: 'no-contact' };
  if (display.reject === 'too-short') return { ok: false, status: 400, error: 'bad-display-name' };
  hidden ||= display.hidden;
  const status = hidden ? 'hidden' : 'visible';

  const existing = db.get<RunRow>('select * from runs where run_id = ?', [body.runId]);
  const params = [
    body.score,
    body.occupation,
    body.days,
    survivors.length,
    JSON.stringify(survivors),
    body.summitRoute,
    body.celebration,
    display.text,
    status,
    ipHash,
  ];
  if (existing) {
    db.run(
      `update runs set score = ?, occupation = ?, days = ?, survivors = ?, survivor_names = ?, summit_route = ?, celebration = ?, display_name = ?, status = ?, ip_hash = ? where id = ?`,
      [...params, existing.id],
    );
  } else {
    db.run(
      `insert into runs (score, occupation, days, survivors, survivor_names, summit_route, celebration, display_name, status, ip_hash, id, run_id, player_token, created_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...params, ulid(now.getTime()), body.runId, hashPlayerToken(playerToken), now.toISOString()],
    );
  }
  const row = db.get<RunRow>('select * from runs where run_id = ?', [body.runId])!;
  return { ok: true, row, hidden };
}

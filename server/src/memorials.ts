// Memorials: the filtered, validated write path. Route handlers in app.ts
// call this; the rules live here so admin.mjs and tests share them.

import type { Db } from './db.ts';
import { filterField } from './filter.ts';
import { ulid } from './ulid.ts';
import { LIMITS, type MemorialBody } from './validate.ts';

export const EPITAPH_DEFAULT = 'THE BEACH WAS THAT WAY.';

export type MemorialStatus = 'visible' | 'hidden';

export interface MemorialRow {
  id: string;
  run_id: string;
  mile: number;
  day: number;
  cause: string;
  names: string;
  epitaph: string;
  status: string;
  hide_reason: string | null;
  report_count: number;
  ip_hash: string | null;
  created_at: string;
}

export type SaveResult = { ok: true; id: string; status: MemorialStatus } | { ok: false; error: 'no-contact' };

/** Filter every text field, then insert — or update the row that already carries this runId. */
export function saveMemorial(db: Db, body: MemorialBody, ipHash: string | null, now = new Date()): SaveResult {
  const epitaph = filterField(body.epitaph, { max: LIMITS.epitaphMax, min: 0, upper: true });
  if (epitaph.reject === 'no-contact') return { ok: false, error: 'no-contact' };
  const names: string[] = [];
  let hidden = epitaph.hidden;
  for (const raw of body.names) {
    const name = filterField(raw, { max: LIMITS.nameMax, min: 1 });
    if (name.reject === 'no-contact') return { ok: false, error: 'no-contact' };
    if (name.reject === 'too-short') continue;
    hidden ||= name.hidden;
    names.push(name.text);
  }
  if (names.length === 0) names.push('SOMEBODY');
  const text = epitaph.text || EPITAPH_DEFAULT;
  const status: MemorialStatus = hidden ? 'hidden' : 'visible';
  const hideReason = hidden ? 'filter' : null;

  const existing = db.get<{ id: string }>('select id from memorials where run_id = ?', [body.runId]);
  if (existing) {
    db.run(
      `update memorials set mile = ?, day = ?, cause = ?, names = ?, epitaph = ?, status = ?, hide_reason = ?, ip_hash = ? where id = ?`,
      [body.mile, body.day, body.cause, JSON.stringify(names), text, status, hideReason, ipHash, existing.id],
    );
    return { ok: true, id: existing.id, status };
  }
  const id = ulid(now.getTime());
  db.run(
    `insert into memorials (id, run_id, mile, day, cause, names, epitaph, status, hide_reason, ip_hash, created_at)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, body.runId, body.mile, body.day, body.cause, JSON.stringify(names), text, status, hideReason, ipHash, now.toISOString()],
  );
  return { ok: true, id, status };
}

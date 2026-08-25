// Reports: one per (memorial, ip_hash) per day; the second distinct report
// hides the memorial until Frank reviews it; 'real-name' hides on the first.
// A memorial Frank has already ruled on (reviewed_ok / removed) is not
// re-hidden by reports — the queue still counts them. (§4.1–4.2)

import type { Db } from './db.ts';
import { ulid } from './ulid.ts';

export const REPORT_REASONS = ['rude', 'real-name', 'spam', 'other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
export const REPORTS_TO_HIDE = 2;

export function isReportReason(x: unknown): x is ReportReason {
  return typeof x === 'string' && (REPORT_REASONS as readonly string[]).includes(x);
}

export type ReportOutcome = 'counted' | 'hidden' | 'duplicate' | 'missing';

export function reportMemorial(db: Db, memorialId: string, reason: ReportReason, ipHash: string, now = new Date()): ReportOutcome {
  const row = db.get<{ status: string; report_count: number }>('select status, report_count from memorials where id = ?', [memorialId]);
  if (!row) return 'missing';
  const dup = db.get('select 1 from reports where memorial_id = ? and ip_hash = ?', [memorialId, ipHash]);
  if (dup) return 'duplicate';
  db.run('insert into reports (id, memorial_id, reason, ip_hash, created_at) values (?, ?, ?, ?, ?)', [
    ulid(now.getTime()),
    memorialId,
    reason,
    ipHash,
    now.toISOString(),
  ]);
  const count = row.report_count + 1;
  const shouldHide = row.status === 'visible' && (reason === 'real-name' || count >= REPORTS_TO_HIDE);
  if (shouldHide) {
    db.run("update memorials set report_count = ?, status = 'hidden', hide_reason = 'reports' where id = ?", [count, memorialId]);
    return 'hidden';
  }
  db.run('update memorials set report_count = ? where id = ?', [count, memorialId]);
  return 'counted';
}

// Retention (§2): ip_hash columns are nulled after 30 days; a lead
// unsubscribed 30 days ago has its email replaced by its hash (a re-subscribe
// is recognisable, the address is gone). Memorials, runs and reports are
// kept — they are the game. index.ts runs this nightly.

import type { Db } from './db.ts';
import { emailHash, type LeadRow } from './leads.ts';

export const RETENTION_DAYS = 30;

export function purge(db: Db, now = new Date()): { memorials: number; reports: number; runs: number; leads: number } {
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * 86_400_000).toISOString();
  const memorials = db.run('update memorials set ip_hash = null where ip_hash is not null and created_at < ?', [cutoff]).changes;
  const reports = db.run('update reports set ip_hash = null where ip_hash is not null and created_at < ?', [cutoff]).changes;
  const runs = db.run('update runs set ip_hash = null where ip_hash is not null and created_at < ?', [cutoff]).changes;
  db.run('update leads set ip_hash = null where ip_hash is not null and consent_at < ?', [cutoff]);
  let leads = 0;
  for (const lead of db.all<LeadRow>("select * from leads where unsubscribed_at is not null and unsubscribed_at < ? and email not like 'sha256:%'", [cutoff])) {
    db.run('update leads set email = ? where id = ?', [emailHash(lead.email), lead.id]);
    leads += 1;
  }
  return { memorials, reports, runs, leads };
}

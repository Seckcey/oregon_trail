// Retention (§2): ip_hash columns are nulled after 30 days. Memorials and
// reports themselves are kept — they are the game. index.ts runs this nightly.

import type { Db } from './db.ts';

export const RETENTION_DAYS = 30;

export function purge(db: Db, now = new Date()): { memorials: number; reports: number } {
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * 86_400_000).toISOString();
  const memorials = db.run('update memorials set ip_hash = null where ip_hash is not null and created_at < ?', [cutoff]).changes;
  const reports = db.run('update reports set ip_hash = null where ip_hash is not null and created_at < ?', [cutoff]).changes;
  return { memorials, reports };
}

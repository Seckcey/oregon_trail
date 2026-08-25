// The 8 West IT 365 list (docs/PHASE4-PLAN.md §2, §5, B2). A lead exists only
// when an adult ticked the consent sentence; the sentence is stored verbatim,
// versioned. No email ever leaves this table in a public response.

import { createHash, randomBytes } from 'node:crypto';
import type { Db } from './db.ts';
import { ulid } from './ulid.ts';

export const CONSENT_VERSION = 'consent-v1';
export const CONSENT_TEXT = 'I’m 18 or older, and I’d like occasional email from 8 West IT. I can unsubscribe with one click, any time.';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normaliseEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL.test(email)) return null;
  return email;
}

export interface LeadRow {
  id: string;
  email: string;
  display_name: string;
  consent_text: string;
  consent_at: string;
  unsubscribe_token: string;
  unsubscribed_at: string | null;
  source_run_id: string | null;
  ip_hash: string | null;
}

function newToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Insert or refresh a consented lead; returns the row (the token is what the unsubscribe link needs). */
export function upsertLead(db: Db, email: string, displayName: string, sourceRunId: string, ipHash: string | null, now = new Date()): LeadRow {
  const existing = db.get<LeadRow>('select * from leads where email = ?', [email]);
  if (existing) {
    // A duplicate updates the display name only — and re-consenting after an unsubscribe puts them back.
    db.run('update leads set display_name = ?, unsubscribed_at = null where id = ?', [displayName, existing.id]);
  } else {
    db.run(
      `insert into leads (id, email, display_name, consent_text, consent_at, unsubscribe_token, source_run_id, ip_hash) values (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ulid(now.getTime()), email, displayName, CONSENT_TEXT, now.toISOString(), newToken(), sourceRunId, ipHash],
    );
  }
  return db.get<LeadRow>('select * from leads where email = ?', [email])!;
}

/** One click, idempotent, no oracle: true only when a live lead was just turned off. */
export function unsubscribe(db: Db, token: string, now = new Date()): boolean {
  return db.run('update leads set unsubscribed_at = ? where unsubscribe_token = ? and unsubscribed_at is null', [now.toISOString(), token]).changes > 0;
}

export function emailHash(email: string): string {
  return `sha256:${createHash('sha256').update(email).digest('hex')}`;
}

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** The list for the mailing tool: consented, not unsubscribed, oldest first. */
export function leadsCsv(db: Db): string {
  const rows = db.all<LeadRow>('select * from leads where unsubscribed_at is null order by consent_at, id');
  const lines = ['email,display_name,consent_at,source_run_id'];
  for (const r of rows) lines.push([r.email, r.display_name, r.consent_at, r.source_run_id].map(csvCell).join(','));
  return `${lines.join('\r\n')}\r\n`;
}

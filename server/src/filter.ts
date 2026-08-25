// The automatic text filter (docs/PHASE4-PLAN.md §4.1): charset and length,
// the contact-info reject (the one thing the player is told about), and the
// word list after normalisation (which hides silently). Pure; no I/O.

import { WORDS } from './words/list.ts';

/** A–Z 0–9 space . , ' ! ? - & and the curly apostrophe. Everything else is dropped. */
const ALLOWED = /[^A-Za-z0-9 .,'’!?&-]/g;

export function cleanText(raw: string, max: number): string {
  let text = raw.replace(ALLOWED, '');
  text = text.replace(/\s+/g, ' ');
  // Runs of the same character collapse to two (!!!!!! → !!).
  text = text.replace(/(.)\1{2,}/g, '$1$1');
  return text.trim().slice(0, max).trim();
}

const CONTACT_PATTERNS: readonly RegExp[] = [
  /\d{7,}/, // a phone number with no separators
  /\d{3}[\s.-]\d{3}[\s.-]\d{4}/, // 555-123-4567
  /\(\d{3}\)\s*\d{3}/, // (555) 123
  /@/,
  /https?:/i,
  /\bwww\b/i,
  /\.com\b/i,
  /\b[a-z0-9-]+\.(com|net|org|io|co|us|me|gg|tv|xyz)\b/i,
  /\bsnap(chat)?\b/i,
  /\binsta(gram)?\b/i,
  /\bdiscord/i,
  /\bwhatsapp/i,
  /\btelegram\b/i,
  /\btiktok\b/i,
];

export function hasContactInfo(text: string): boolean {
  return CONTACT_PATTERNS.some((re) => re.test(text));
}

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's' };

/** Lowercase, leet folded, spaced letters collapsed, non-letters stripped. */
export function normalise(text: string): string {
  let t = text.toLowerCase().replace(/[01345 7@$]/g, (ch) => LEET[ch] ?? ch);
  t = t.replace(/\b(?:[a-z] )+[a-z]\b/g, (m) => m.replace(/ /g, ''));
  t = t.replace(/[^a-z ]/g, '');
  return t.replace(/\s+/g, ' ').trim();
}

export function hasListedWord(text: string): boolean {
  const tokens = normalise(text).split(' ');
  return tokens.some((token) => WORDS.some((w) => (w.length <= 3 ? token === w : token.startsWith(w))));
}

export interface FieldRules {
  max: number;
  min: number;
  upper?: boolean;
}

export interface FieldResult {
  text: string;
  reject: 'no-contact' | 'too-short' | null;
  hidden: boolean;
}

/** Clean one field. `reject` means the request fails; `hidden` means it is saved but not shown. */
export function filterField(raw: string, rules: FieldRules): FieldResult {
  const original = String(raw ?? '');
  if (hasContactInfo(original)) return { text: original, reject: 'no-contact', hidden: false };
  let text = cleanText(original, rules.max);
  if (rules.upper) text = text.toUpperCase();
  if (text.length < rules.min) return { text, reject: 'too-short', hidden: false };
  if (hasContactInfo(text)) return { text, reject: 'no-contact', hidden: false };
  return { text, reject: null, hidden: hasListedWord(text) };
}

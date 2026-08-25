// ip_hash = HMAC-SHA256(secret ‖ YYYY-MM-DD, ip). The date in the key means
// hashes from different days cannot be joined; the secret means nobody can
// brute-force the IPv4 space against the table. Raw addresses never touch
// disk. (docs/PHASE4-PLAN.md §5.1)

import { createHmac } from 'node:crypto';

export function hashIp(ip: string, secret: string, now = new Date()): string {
  const day = now.toISOString().slice(0, 10);
  return createHmac('sha256', `${secret}|${day}`).update(ip).digest('hex');
}

/** The client address as nginx/Cloudflare hand it over; never trusted for anything but rate keys. */
export function clientIp(headers: Headers): string {
  const cf = headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return '0.0.0.0';
}

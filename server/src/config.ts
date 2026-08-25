// Configuration from the environment. Everything has a default so the API
// boots with no env at all; the secrets are optional and their absence is a
// logged warning, never a crash (dev and tests run without them).

export interface Config {
  port: number;
  dbPath: string;
  /** Cloudflare Turnstile secret; unset = verification skipped (dev). */
  turnstileSecret: string | null;
  /** Secret for the daily-salted IP hash; unset = a random per-process one. */
  ipHashSecret: string | null;
  /** Where the game lives, for the unsubscribe link. */
  publicUrl: string;
}

export function configFrom(env: Record<string, string | undefined>): Config {
  const port = Number(env['PORT'] ?? 3000);
  return {
    port: Number.isFinite(port) && port > 0 ? port : 3000,
    dbPath: env['DB_PATH'] ?? './data/8wt.db',
    turnstileSecret: env['TURNSTILE_SECRET'] || null,
    ipHashSecret: env['IP_HASH_SECRET'] || null,
    publicUrl: (env['PUBLIC_URL'] || 'https://8wt.8westit.com').replace(/\/+$/, ''),
  };
}

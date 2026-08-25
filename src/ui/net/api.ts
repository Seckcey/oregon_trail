// The only place in the game that knows a network exists. One base URL from
// the build (VITE_8WT_API; empty = there is no network), one runtime switch
// (?offline=1), a 3-second timeout, and every failure of any kind swallowed
// to null — the game with the API gone is exactly the game without it.
// src/sim/ never imports this.

export interface NetConfig {
  /** Base URL of the API, or null: no network at all. */
  base: string | null;
}

export const TIMEOUT_MS = 3000;

export function netConfig(env: Record<string, string | undefined>, search: string): NetConfig {
  const raw = (env['VITE_8WT_API'] ?? '').trim().replace(/\/+$/, '');
  if (!raw) return { base: null };
  if (new URLSearchParams(search).get('offline') === '1') return { base: null };
  return { base: raw };
}

export interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  turnstile?: string | null;
  playerToken?: string | null;
}

/** JSON in, JSON out; 204 → {}; anything that is not a 2xx with a JSON body → null. */
export async function apiRequest<T = unknown>(cfg: NetConfig, path: string, opts: RequestOptions = {}, fetchImpl: typeof fetch = fetch): Promise<T | null> {
  if (!cfg.base) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const headers: Record<string, string> = { accept: 'application/json' };
    if (opts.body !== undefined) headers['content-type'] = 'application/json';
    if (opts.turnstile) headers['turnstile-token'] = opts.turnstile;
    if (opts.playerToken) headers['x-player-token'] = opts.playerToken;
    const res = await fetchImpl(`${cfg.base}${path}`, {
      method: opts.method ?? 'GET',
      headers,
      ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    if (res.status === 204) return {} as T;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Cloudflare Turnstile server-side verification (§4.1.6). The widget runs in
// managed mode in the game; every POST carries its token in `Turnstile-Token`.
// No secret configured = verification skipped with one warning (dev, tests).

export const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: string | null, ip: string, secret: string, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  if (!token) return false;
  try {
    const params = new URLSearchParams({ secret, response: token, remoteip: ip });
    const res = await fetchImpl(SITEVERIFY, { method: 'POST', body: params, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return false;
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

/** A gate for the routes: true means "let it through". */
export function turnstileGate(secret: string | null, fetchImpl: typeof fetch): (req: Request, ip: string) => Promise<boolean> {
  let warned = false;
  return async (req, ip) => {
    if (!secret) {
      if (!warned) {
        warned = true;
        console.warn('TURNSTILE_SECRET is not set: POSTs are not verified (fine in dev, not in production)');
      }
      return true;
    }
    return verifyTurnstile(req.headers.get('turnstile-token'), ip, secret, fetchImpl);
  };
}

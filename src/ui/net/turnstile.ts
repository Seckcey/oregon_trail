// Cloudflare Turnstile on the client: a managed, interaction-only widget
// rendered on demand right before a POST, resolved to its token. If the
// script never loaded (ad blocker, old browser), the answer is null and the
// caller simply does not post — no error, no nagging.

export interface TurnstileRenderOptions {
  sitekey: string;
  appearance?: 'always' | 'execute' | 'interaction-only';
  callback: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
}

export interface TurnstileApi {
  render(el: HTMLElement, opts: TurnstileRenderOptions): string;
  remove(widgetId: string): void;
}

export const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
export const WIDGET_TIMEOUT_MS = 15_000;

function windowApi(): TurnstileApi | null {
  const w = globalThis as { turnstile?: TurnstileApi };
  return w.turnstile ?? null;
}

function widgetHost(): HTMLElement {
  let host = document.getElementById('turnstile-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'turnstile-host';
    host.className = 'turnstile-host';
    document.body.appendChild(host);
  }
  return host;
}

/**
 * The token for one POST, or null. An empty site key means the build has no
 * Turnstile (dev): null too — callers decide whether to post without one.
 */
export function turnstileToken(siteKey: string, api: () => TurnstileApi | null = windowApi, host: () => HTMLElement = widgetHost): Promise<string | null> {
  if (!siteKey) return Promise.resolve(null);
  const ts = api();
  if (!ts) return Promise.resolve(null);
  return new Promise((resolve) => {
    let widget: string | null = null;
    let settled = false;
    const finish = (token: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (widget !== null) {
        try {
          ts.remove(widget);
        } catch {
          /* already gone */
        }
      }
      resolve(token);
    };
    const timer = setTimeout(() => finish(null), WIDGET_TIMEOUT_MS);
    try {
      widget = ts.render(host(), {
        sitekey: siteKey,
        appearance: 'interaction-only',
        callback: (token) => finish(token),
        'error-callback': () => finish(null),
        'expired-callback': () => finish(null),
      });
    } catch {
      finish(null);
    }
  });
}

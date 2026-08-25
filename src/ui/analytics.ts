// Google Analytics 4 (docs/PHASE4-PLAN.md §5.1): the tag itself is in
// index.html behind VITE_GA4_ID (anonymize_ip on, Google signals off). From
// the game, only outcomes go out — screen/phase names and numbers — never a
// name, an epitaph, or an email. This file enforces that shape.

import type { Outcome } from './session';

type Gtag = (command: 'event', name: string, params?: Record<string, string | number>) => void;

function windowGtag(): Gtag | null {
  const w = globalThis as { gtag?: Gtag };
  return typeof w.gtag === 'function' ? w.gtag : null;
}

/** Only short, enum-like strings and numbers survive; free text is dropped. */
function scrub(params: Record<string, string | number> = {}): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'number') out[k] = v;
    else if (typeof v === 'string' && /^[a-z0-9_-]{1,24}$/i.test(v)) out[k] = v;
  }
  return out;
}

export function createTracker(measurementId: string, gtag: () => Gtag | null = windowGtag): (outcome: Outcome, params?: Record<string, string | number>) => void {
  const id = measurementId.trim();
  return (outcome, params) => {
    if (!id) return;
    const g = gtag();
    if (!g) return;
    try {
      g('event', outcome, scrub(params));
    } catch {
      /* analytics must never break the game */
    }
  };
}

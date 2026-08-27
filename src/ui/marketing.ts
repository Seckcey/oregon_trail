export type OutcomeSurface = 'victory' | 'dead' | 'leaderboard';

export const PRODUCT_BRIDGE_COPY = 'See how 8 West IT 365 keeps alerts, tickets, time, and invoices moving.';
export const PRODUCT_BRIDGE_STEPS = ['Alert', 'Ticket', 'Time', 'Invoice'] as const;

const WORKFLOW_URL = 'https://8westit.com/trail/';
const INCOMING_CAMPAIGN_FIELDS = ['utm_id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_source_platform', 'utm_term', 'utm_content'] as const;
const CAMPAIGN_VALUE = /^[a-z0-9_-]{1,64}$/;

/**
 * The campaign link is intentionally closed over a three-value surface enum.
 * Nothing from a run, crew, memorial, leaderboard name, or form can enter it.
 */
export function workflowUrl(surface: OutcomeSurface, incomingSearch = ''): string {
  const url = new URL(WORKFLOW_URL);
  const incoming = new URLSearchParams(incomingSearch);
  for (const field of INCOMING_CAMPAIGN_FIELDS) {
    const value = incoming.get(field)?.trim().toLowerCase();
    if (value && CAMPAIGN_VALUE.test(value)) url.searchParams.set(field, value);
  }
  if (!url.searchParams.has('utm_id')) url.searchParams.set('utm_id', '8w365-ft-2026-09');
  if (!url.searchParams.has('utm_source')) url.searchParams.set('utm_source', '8wt');
  if (!url.searchParams.has('utm_medium')) url.searchParams.set('utm_medium', 'game');
  if (!url.searchParams.has('utm_campaign')) url.searchParams.set('utm_campaign', 'founding_trail_sep_2026');
  if (!url.searchParams.has('utm_source_platform')) url.searchParams.set('utm_source_platform', '8wt');
  if (!url.searchParams.has('utm_content')) url.searchParams.set('utm_content', `postgame_${surface}`);
  url.hash = 'workflow';
  return url.toString();
}

export function outcomeSurface(phase: string): OutcomeSurface | null {
  if (phase === 'victory' || phase === 'dead' || phase === 'leaderboard') return phase;
  return null;
}

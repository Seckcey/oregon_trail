// The memorial calls: the road-wide sample at game start, the post at death,
// the report. Shapes are checked on the way in; nothing here throws.

import type { Memorial } from '../../sim/types';
import { apiRequest, type NetConfig } from './api';

export type ReportReason = 'rude' | 'real-name' | 'spam' | 'other';

function isMemorial(x: unknown): x is Memorial & { id: string } {
  if (typeof x !== 'object' || x === null) return false;
  const m = x as Record<string, unknown>;
  return (
    typeof m['id'] === 'string' &&
    Array.isArray(m['names']) &&
    m['names'].every((n) => typeof n === 'string') &&
    typeof m['mile'] === 'number' &&
    typeof m['day'] === 'number' &&
    typeof m['cause'] === 'string' &&
    typeof m['epitaph'] === 'string'
  );
}

export async function fetchMemorials(cfg: NetConfig, seed: string, fetchImpl: typeof fetch = fetch): Promise<Memorial[] | null> {
  const rows = await apiRequest<unknown>(cfg, `/memorials?seed=${encodeURIComponent(seed)}`, {}, fetchImpl);
  if (!Array.isArray(rows)) return null;
  return rows.filter(isMemorial).map((m) => ({ id: m.id, names: m.names, mile: m.mile, day: m.day, cause: m.cause, epitaph: m.epitaph }));
}

export interface Posted {
  id: string;
  status: 'visible' | 'hidden';
}

export async function postMemorial(cfg: NetConfig, runId: string, m: Memorial, turnstile: string | null, fetchImpl: typeof fetch = fetch): Promise<Posted | null> {
  const body = { runId, mile: m.mile, day: m.day, cause: m.cause, names: m.names, epitaph: m.epitaph };
  const res = await apiRequest<Partial<Posted>>(cfg, '/memorials', { method: 'POST', body, turnstile }, fetchImpl);
  if (!res || typeof res.id !== 'string' || (res.status !== 'visible' && res.status !== 'hidden')) return null;
  return { id: res.id, status: res.status };
}

export async function reportMemorial(cfg: NetConfig, id: string, reason: ReportReason, turnstile: string | null, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  const res = await apiRequest(cfg, `/memorials/${encodeURIComponent(id)}/report`, { method: 'POST', body: { reason }, turnstile }, fetchImpl);
  return res !== null;
}

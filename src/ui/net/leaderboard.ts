// The leaderboard calls (docs/PHASE4-PLAN.md §3, 4B): post a finished run
// (idempotent on runId — the claim screens re-post with a nickname, then
// with an email and consent), and fetch the board. Shapes are checked on the
// way in; nothing here throws.

import type { Board, BoardRow, Celebration, Occupation, SummitRoute } from '../../sim/types';
import { apiRequest, type NetConfig } from './api';

export interface RunPost {
  runId: string;
  score: number;
  occupation: Occupation;
  days: number;
  survivorNames: string[];
  summitRoute: SummitRoute | null;
  celebration: Celebration | null;
  displayName: string;
  email: string | null;
  consent: boolean;
}

export interface RunPosted {
  rank: number;
  total: number;
  claimed: boolean;
  unsubscribeUrl: string | null;
}

export async function postRun(cfg: NetConfig, run: RunPost, playerToken: string, turnstile: string | null, fetchImpl: typeof fetch = fetch): Promise<RunPosted | null> {
  const res = await apiRequest<Partial<RunPosted>>(cfg, '/runs', { method: 'POST', body: run, turnstile, playerToken }, fetchImpl);
  if (!res || typeof res.rank !== 'number' || typeof res.total !== 'number') return null;
  return { rank: res.rank, total: res.total, claimed: res.claimed === true, unsubscribeUrl: typeof res.unsubscribeUrl === 'string' ? res.unsubscribeUrl : null };
}

const OCCUPATIONS: readonly string[] = ['ceo', 'sysadmin', 'intern'];
const SUMMITS: readonly string[] = ['grade', 'old80'];
const CELEBRATIONS: readonly string[] = ['cannonball', 'swan', 'towels'];

function isRow(x: unknown): x is BoardRow {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r['rank'] === 'number' &&
    typeof r['displayName'] === 'string' &&
    typeof r['score'] === 'number' &&
    typeof r['occupation'] === 'string' &&
    OCCUPATIONS.includes(r['occupation']) &&
    typeof r['days'] === 'number' &&
    typeof r['survivors'] === 'number' &&
    (r['summitRoute'] === null || (typeof r['summitRoute'] === 'string' && SUMMITS.includes(r['summitRoute']))) &&
    (r['celebration'] === null || (typeof r['celebration'] === 'string' && CELEBRATIONS.includes(r['celebration'])))
  );
}

function isYours(x: unknown): x is NonNullable<Board['yours']> {
  if (typeof x !== 'object' || x === null) return false;
  const y = x as Record<string, unknown>;
  return typeof y['rank'] === 'number' && typeof y['score'] === 'number' && typeof y['total'] === 'number';
}

export async function fetchLeaderboard(cfg: NetConfig, runId: string | null, playerToken: string, fetchImpl: typeof fetch = fetch): Promise<Board | null> {
  const path = runId ? `/leaderboard?run=${encodeURIComponent(runId)}` : '/leaderboard';
  const res = await apiRequest<{ top?: unknown; yours?: unknown }>(cfg, path, { playerToken }, fetchImpl);
  if (!res || !Array.isArray(res.top)) return null;
  const top = res.top.filter(isRow).map((r) => ({
    rank: r.rank,
    displayName: r.displayName,
    score: r.score,
    occupation: r.occupation,
    days: r.days,
    survivors: r.survivors,
    summitRoute: r.summitRoute,
    celebration: r.celebration,
  }));
  const yours = isYours(res.yours) ? { rank: res.yours.rank, score: res.yours.score, total: res.yours.total } : null;
  return { top, yours };
}

// The route-wide sample (docs/PHASE4-PLAN.md §3): 20 buckets of 36.5 miles,
// up to 2 per bucket, chosen by hash(seed, bucket) over the visible rows in
// that bucket, 70/30 recent/random. Deterministic for a seed so the edge
// cache can key on it; different seeds see different roads.

import type { Db } from './db.ts';
import type { MemorialRow } from './memorials.ts';
import { LIMITS } from './validate.ts';

export const BUCKETS = 20;
export const PER_BUCKET = 2;
export const RECENT_POOL = 5;
export const RECENT_WEIGHT = 0.7;
const WIDTH = LIMITS.maxMile / BUCKETS;

export interface SampledMemorial {
  id: string;
  names: string[];
  mile: number;
  day: number;
  cause: string;
  epitaph: string;
}

export function bucketOf(mile: number): number {
  return Math.min(BUCKETS - 1, Math.floor(mile / WIDTH));
}

/** FNV-1a over the seed and bucket, then a tiny xorshift for the picks. */
function rngFor(seed: string, bucket: number): () => number {
  let h = 0x811c9dc5;
  for (const ch of `${seed}#${bucket}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let x = h || 1;
  return () => {
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x / 0x100000000;
  };
}

export function sampleMemorials(db: Db, seed: string): SampledMemorial[] {
  const out: SampledMemorial[] = [];
  for (let b = 0; b < BUCKETS; b++) {
    const lo = b * WIDTH;
    const hi = b === BUCKETS - 1 ? LIMITS.maxMile + 1 : (b + 1) * WIDTH;
    const rows = db.all<MemorialRow>(
      `select * from memorials where status in ('visible', 'reviewed_ok') and mile >= ? and mile < ? order by created_at desc, id desc`,
      [lo, hi],
    );
    if (rows.length === 0) continue;
    const rand = rngFor(seed, b);
    const taken = new Set<number>();
    for (let k = 0; k < PER_BUCKET && taken.size < rows.length; k++) {
      const poolSize = rand() < RECENT_WEIGHT ? Math.min(RECENT_POOL, rows.length) : rows.length;
      const candidates = [];
      for (let i = 0; i < poolSize; i++) if (!taken.has(i)) candidates.push(i);
      if (candidates.length === 0) for (let i = 0; i < rows.length; i++) if (!taken.has(i)) candidates.push(i);
      const idx = candidates[Math.floor(rand() * candidates.length)]!;
      taken.add(idx);
      const r = rows[idx]!;
      out.push({ id: r.id, names: JSON.parse(r.names) as string[], mile: r.mile, day: r.day, cause: r.cause, epitaph: r.epitaph });
    }
  }
  return out;
}

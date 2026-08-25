// Remote sample + local memorials → one list for createGame. Dedupe by id,
// local wins on a collision (the player's own copy is the truth), sorted by
// mile so the road passes them in order. Pure.

import type { Memorial } from '../../sim/types';

export function mergeMemorials(local: Memorial[], remote: Memorial[]): Memorial[] {
  const seen = new Set<string>();
  const out: Memorial[] = [];
  for (const m of local) {
    if (m.id) seen.add(m.id);
    out.push(m);
  }
  for (const m of remote) {
    if (!m.id || seen.has(m.id)) continue;
    seen.add(m.id);
    out.push(m);
  }
  return out.sort((a, b) => a.mile - b.mile);
}

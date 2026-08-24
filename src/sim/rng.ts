// Seeded deterministic RNG (mulberry32). State is a plain serializable
// object so the whole game state (RNG included) survives JSON save/load.

export interface RngState {
  s: number;
}

/** FNV-1a hash of a string into a 32-bit seed. */
export function seedFromString(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function createRng(seed: number): RngState {
  return { s: seed >>> 0 };
}

export function nextFloat(r: RngState): number {
  r.s = (r.s + 0x6d2b79f5) >>> 0;
  let t = r.s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Uniform integer in [min, max], inclusive on both ends. */
export function nextInt(r: RngState, min: number, max: number): number {
  return min + Math.floor(nextFloat(r) * (max - min + 1));
}

export function chance(r: RngState, p: number): boolean {
  if (p <= 0) return false;
  if (p >= 1) return true;
  return nextFloat(r) < p;
}

export function pick<T>(r: RngState, arr: readonly T[]): T {
  if (arr.length === 0) throw new Error('pick from empty array');
  const item = arr[nextInt(r, 0, arr.length - 1)];
  return item as T;
}

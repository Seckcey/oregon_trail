import { SNACK_WORDS } from './data/text';
import type { RngState } from './rng';
import { nextInt } from './rng';
import type { SnackResult } from './types';
import { TUNING } from './types';

/** Deal distinct words from the menu for one snack run. */
export function snackWordsFor(rng: RngState, rounds: number): string[] {
  const pool = [...SNACK_WORDS];
  const words: string[] = [];
  for (let i = 0; i < rounds && pool.length > 0; i++) {
    const idx = nextInt(rng, 0, pool.length - 1);
    words.push(pool[idx] as string);
    pool.splice(idx, 1);
  }
  return words;
}

/**
 * Pounds earned for one typed word. Longer words are worth more, speed
 * multiplies the haul, and every run since the last stop cuts the take —
 * the taco truck sees you coming.
 */
export function snackYield(
  word: string,
  typed: string,
  ms: number,
  runsSinceStop: number,
): { hit: boolean; lbs: number } {
  const hit = typed.trim().toUpperCase() === word.toUpperCase();
  if (!hit) return { hit: false, lbs: 0 };
  const base = word.length * 10;
  const speed = Math.min(1.75, Math.max(0.25, 2.0 - ms / 2000));
  const diminish = Math.pow(TUNING.snackDiminish, runsSinceStop);
  return { hit: true, lbs: Math.max(1, Math.round(base * speed * diminish)) };
}

/** Total haul for a run — capped at what you can carry back to the van. */
export function snackTotal(results: SnackResult[]): number {
  const sum = results.reduce((acc, r) => acc + (r.hit ? r.lbs : 0), 0);
  return Math.min(TUNING.snackCarryCapLbs, sum);
}

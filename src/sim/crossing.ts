// River crossings: the Gila at Gila Bend and the Colorado at Yuma — our
// answer to the old ford / caulk / ferry / wait. Pure helpers over the
// seeded RNG; the reducer in game.ts applies the consequences.

import type { RngState } from './rng';
import { chance, nextFloat, nextInt } from './rng';
import type { Month } from './types';

export type RiverId = 'gila-bend' | 'yuma';

export interface RiverSpec {
  id: RiverId;
  /** "the Gila River" — reads inside a sentence. */
  name: string;
  /** Screen title. */
  title: string;
  /** Depth range in feet outside monsoon season. */
  depthFt: readonly [number, number];
  /** Extra feet a July/August roll can add. */
  monsoonExtraFt: number;
  currentMph: readonly [number, number];
  /** The ferry hand's rule: under this, ford. Over it, pay. */
  fordSafeFt: number;
  ferryCents: number;
  /** Sentence-initial: "The 8 West Ventures ferry will take you across…" */
  ferryName: string;
  dropPerDayFt: readonly [number, number];
  blurb: string;
}

export const RIVERS: Record<RiverId, RiverSpec> = {
  'gila-bend': {
    id: 'gila-bend',
    name: 'the Gila River',
    title: 'THE GILA RIVER',
    depthFt: [0.4, 3.2],
    monsoonExtraFt: 2.5,
    currentMph: [1, 4],
    fordSafeFt: 2.5,
    ferryCents: 4500,
    ferryName: 'A rancher with a flatbed',
    dropPerDayFt: [0.4, 0.9],
    blurb: 'The Gila is a rumor of a river most of the year. You walk down to the bank to find out what kind of year it is.',
  },
  yuma: {
    id: 'yuma',
    name: 'the Colorado River',
    title: 'THE COLORADO RIVER AT YUMA',
    depthFt: [2.0, 6.5],
    monsoonExtraFt: 1.5,
    currentMph: [2, 7],
    fordSafeFt: 2.5,
    ferryCents: 8500,
    ferryName: 'The 8 West Ventures ferry',
    dropPerDayFt: [0.3, 0.7],
    blurb: 'Green, cold, and wider than it looked from the bluff. California is the far bank. Everything you own is on this one.',
  },
};

export function isRiverId(id: string): id is RiverId {
  return id === 'gila-bend' || id === 'yuma';
}

export interface CrossingState {
  river: RiverId;
  depthFt: number;
  currentMph: number;
  daysWaited: number;
}

function tenth(x: number): number {
  return Math.round(x * 10) / 10;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

/** Roll the river as you find it. Monsoon months can swell it past its banks. */
export function rollRiver(rng: RngState, river: RiverId, month: Month): CrossingState {
  const spec = RIVERS[river];
  const [lo, hi] = spec.depthFt;
  let depth = lo + nextFloat(rng) * (hi - lo);
  if (month === 7 || month === 8) depth += nextFloat(rng) * spec.monsoonExtraFt;
  const currentMph = nextInt(rng, spec.currentMph[0], spec.currentMph[1]);
  return { river, depthFt: tenth(depth), currentMph, daysWaited: 0 };
}

/** Chance the ford goes wrong: a little for the current, a lot per foot over the rule. */
export function fordRisk(c: CrossingState): number {
  const over = Math.max(0, c.depthFt - RIVERS[c.river].fordSafeFt);
  return clamp(0.03 + c.currentMph * 0.02 + over * 0.28, 0, 0.95);
}

/** Floating the van across on a flatbed: depth is irrelevant, current is everything. */
export function floatRisk(c: CrossingState): number {
  return clamp(0.12 + c.currentMph * 0.06, 0, 0.7);
}

export function riskLabel(risk: number): string {
  if (risk < 0.15) return 'looks easy';
  if (risk < 0.45) return 'looks dicey';
  if (risk < 0.75) return 'looks bad';
  return 'looks like a funeral';
}

/** A day on the bank: the river comes down, the current may ease. */
export function waitADay(rng: RngState, c: CrossingState): CrossingState {
  const [lo, hi] = RIVERS[c.river].dropPerDayFt;
  const drop = lo + nextFloat(rng) * (hi - lo);
  const currentMph = chance(rng, 0.5) ? Math.max(1, c.currentMph - 1) : c.currentMph;
  return {
    ...c,
    depthFt: Math.max(0.3, tenth(c.depthFt - drop)),
    currentMph,
    daysWaited: c.daysWaited + 1,
  };
}

export interface FordResult {
  success: boolean;
  /** 0 = across clean, 1 = swamped, 2 = the van rolls. */
  severity: 0 | 1 | 2;
  drowned: boolean;
}

export function resolveFord(rng: RngState, c: CrossingState): FordResult {
  if (!chance(rng, fordRisk(c))) return { success: true, severity: 0, drowned: false };
  const severity = c.depthFt > RIVERS[c.river].fordSafeFt + 1.5 ? 2 : 1;
  const drowned = severity === 2 && chance(rng, 0.5);
  return { success: false, severity, drowned };
}

export function resolveFloat(rng: RngState, c: CrossingState): { success: boolean } {
  return { success: !chance(rng, floatRisk(c)) };
}

// The numbers the API needs to validate a memorial (and later a run) without
// running the sim: every death cause it can print, the end of the road, the
// input caps, and the best score each occupation can reach. Pure data-out;
// `npm run shared` writes it to shared/limits.json for server/ to import, and
// test/limits.test.ts fails if the file drifts from the sim.

import { DEATH_CAUSES } from './data/text';
import { ROUTE } from './data/route';
import type { Occupation } from './types';
import { TUNING } from './types';

export interface SharedLimits {
  causes: string[];
  maxMile: number;
  maxDay: number;
  crewSize: number;
  nameMax: number;
  epitaphMax: number;
  scoreMax: Record<Occupation, number>;
  /** The parts of the formula, so the API can bound a score by how many survived. */
  score: { healthMax: number; supplyCap: number; cashCap: Record<Occupation, number>; multiplier: Record<Occupation, number> };
}

const OCCUPATIONS: readonly Occupation[] = ['ceo', 'sysadmin', 'intern'];

export function sharedLimits(): SharedLimits {
  const supplyCap =
    Math.floor(TUNING.foodMax / 25) +
    Math.floor(TUNING.waterMax / 5) +
    Math.floor(TUNING.fuelTankMax / 5) +
    3 * TUNING.partsMax * 2;
  const scoreMax = {} as Record<Occupation, number>;
  const cashCap = {} as Record<Occupation, number>;
  const multiplier = {} as Record<Occupation, number>;
  for (const occ of OCCUPATIONS) {
    cashCap[occ] = Math.floor(TUNING.startingCashCents[occ] / 500);
    multiplier[occ] = TUNING.scoreMultiplier[occ];
    scoreMax[occ] = multiplier[occ] * (TUNING.crewSize * TUNING.healthPoints.good + supplyCap + cashCap[occ]);
  }
  return {
    causes: [...new Set([...Object.values(DEATH_CAUSES), 'THE ROAD'])],
    maxMile: ROUTE[ROUTE.length - 1]!.mile,
    maxDay: 400,
    crewSize: TUNING.crewSize,
    nameMax: 16,
    epitaphMax: 60,
    scoreMax,
    score: { healthMax: TUNING.healthPoints.good, supplyCap, cashCap, multiplier },
  };
}

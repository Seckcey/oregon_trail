import type { CrewMember, Occupation, Supplies } from './types';
import { healthStatus, TUNING } from './types';

export interface ScoreBreakdown {
  crewPoints: number;
  supplyPoints: number;
  cashPoints: number;
  subtotal: number;
  multiplier: number;
  total: number;
}

/**
 * Scoring, adapted straight from the 1985 manual's table: points per
 * surviving member by health, points for what you still carry, and the
 * occupation multiplier that rewards the harder start.
 */
export function computeScore(
  crew: CrewMember[],
  supplies: Supplies,
  cashCents: number,
  occupation: Occupation,
): ScoreBreakdown {
  let crewPoints = 0;
  for (const m of crew) {
    if (!m.alive) continue;
    crewPoints += TUNING.healthPoints[healthStatus(m.health)];
  }

  const parts = supplies.tires + supplies.belts + supplies.hoses;
  const supplyPoints =
    Math.floor(supplies.food / 25) +
    Math.floor(supplies.water / 5) +
    Math.floor(supplies.fuel / 5) +
    parts * 2;

  const cashPoints = Math.floor(cashCents / 500);

  const subtotal = crewPoints + supplyPoints + cashPoints;
  const multiplier = TUNING.scoreMultiplier[occupation];
  return {
    crewPoints,
    supplyPoints,
    cashPoints,
    subtotal,
    multiplier,
    total: subtotal * multiplier,
  };
}

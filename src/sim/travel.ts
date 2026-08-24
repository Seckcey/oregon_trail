import type { RngState } from './rng';
import { nextFloat } from './rng';
import type { Pace, Rations, Weather } from './types';
import { TUNING } from './types';

/**
 * Miles covered in one driving day. The van's condition and the weather
 * throttle the pace; a ±10% jitter keeps days from feeling metronomic.
 */
export function milesForDay(rng: RngState, pace: Pace, vanCondition: number, weather: Weather): number {
  const base = TUNING.paceMiles[pace];
  const vanFactor = Math.min(1, Math.max(0.6, 0.6 + 0.4 * (vanCondition / 100)));
  const heatFactor = weather.heat === 3 ? 0.9 : 1;
  const jitter = 0.9 + nextFloat(rng) * 0.2;
  return Math.max(0, Math.round(base * vanFactor * heatFactor * jitter));
}

export function dailyFoodNeed(aliveCount: number, rations: Rations): number {
  return aliveCount * TUNING.rationsLbsPerPersonDay[rations];
}

export function dailyWaterNeed(aliveCount: number, heat: 0 | 1 | 2 | 3): number {
  return Math.ceil(aliveCount * TUNING.waterPerPersonByHeat[heat]);
}

/** Gallons burned for a day's miles. The old tank drinks harder when worn. */
export function fuelNeed(miles: number, vanCondition: number): number {
  const mpg = vanCondition < 50 ? TUNING.vanMpgWorn : TUNING.vanMpgGood;
  return Math.ceil(miles / mpg);
}

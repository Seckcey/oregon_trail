import type { RngState } from './rng';
import { chance, nextFloat } from './rng';
import type { Month, Weather } from './types';

// Heat tier ranges by month (min..max). The desert's real calendar:
// spring is windy and mild, June turns the oven on, July-August own you.
const HEAT_RANGE: Record<Month, readonly [number, number]> = {
  3: [0, 1],
  4: [0, 1],
  5: [1, 2],
  6: [2, 3],
  7: [2, 3],
  8: [2, 3],
  9: [1, 2],
  10: [0, 1],
};

// Real regional weather: spring dust storms plague I-10 between Las Cruces
// and the Arizona line; summer monsoons build over the high desert east of
// the lowlands.
const DUST_MONTHS: readonly Month[] = [3, 4, 5];
const DUST_MAX_MILE = 200;
const DUST_CHANCE = 0.08;

const MONSOON_MONTHS: readonly Month[] = [7, 8];
const MONSOON_MIN_MILE = 150;
const MONSOON_CHANCE = 0.12;

// The Imperial Valley, Yuma to El Centro, sits below sea level and the heat
// sits on it: one tier hotter than the calendar says, all season.
const VALLEY_MILES: readonly [number, number] = [540, 625];

export const HEAT_LABELS = ['mild', 'warm', 'hot', 'scorching'] as const;

export function regionHeatBonus(mile: number): 0 | 1 {
  return mile >= VALLEY_MILES[0] && mile <= VALLEY_MILES[1] ? 1 : 0;
}

/** The same day, seen from a parked van: storms don't apply, heat does. */
export function heatOnly(w: Weather): Weather {
  if (w.event === 'none') return w;
  return { label: HEAT_LABELS[w.heat], heat: w.heat, event: 'none' };
}

export function rollWeather(rng: RngState, month: Month, mile: number): Weather {
  const [min, max] = HEAT_RANGE[month];
  // Bias toward the top of the range in July: the worst month is the worst.
  const roll = nextFloat(rng);
  const biased = month === 7 ? Math.pow(roll, 0.6) : roll;
  const heat = Math.min(
    3,
    Math.max(0, min + Math.floor(biased * (max - min + 1)) + regionHeatBonus(mile)),
  ) as Weather['heat'];

  let event: Weather['event'] = 'none';
  if (DUST_MONTHS.includes(month) && mile < DUST_MAX_MILE && chance(rng, DUST_CHANCE)) {
    event = 'dust';
  } else if (MONSOON_MONTHS.includes(month) && mile >= MONSOON_MIN_MILE && chance(rng, MONSOON_CHANCE)) {
    event = 'monsoon';
  }

  const label = event === 'dust' ? 'dust storm' : event === 'monsoon' ? 'monsoon' : HEAT_LABELS[heat];
  return { label, heat, event };
}

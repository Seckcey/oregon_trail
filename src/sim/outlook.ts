// The supply outlook: how far what's aboard will take the crew, measured
// against the next place that sells more. Pure arithmetic on the state —
// no RNG — so the road screen and every store stop can warn a player before
// the desert does. Pessimistic on purpose: it plans for the month's worst
// heat and a steady pace, because the cost of being wrong is a grave.

import { ROUTE } from './data/route';
import { dailyWaterNeed } from './travel';
import type { GameState } from './types';
import { TUNING } from './types';
import { typicalHeat } from './weather';

export interface NextShop {
  name: string;
  miles: number;
  days: number;
  /** False when the next target is the end of the road, not a store. */
  shop: boolean;
}

export interface Outlook {
  nextShop: NextShop | null;
  daysOfWater: number;
  daysOfFood: number;
  milesOfFuel: number;
  /** Plain sentences, worst first. Empty when the crew can make the next shop. */
  warnings: string[];
}

function daysFor(miles: number, s: GameState): number {
  return Math.max(1, Math.ceil(miles / TUNING.paceMiles[s.pace]));
}

/** The next shop past where the van is, or the beach if there is none. */
function nextShopFrom(s: GameState): NextShop | null {
  const from = s.atStopIndex !== null ? ROUTE[s.atStopIndex]!.mile : s.mile;
  const startIndex = s.atStopIndex !== null ? s.atStopIndex + 1 : s.nextStopIndex;
  for (let i = startIndex; i < ROUTE.length; i++) {
    const stop = ROUTE[i]!;
    if (!stop.hasShop) continue;
    const miles = stop.mile - from;
    return { name: stop.name, miles, days: daysFor(miles, s), shop: true };
  }
  const end = ROUTE[ROUTE.length - 1]!;
  const miles = end.mile - from;
  if (miles <= 0) return null;
  return { name: end.name, miles, days: daysFor(miles, s), shop: false };
}

export function supplyOutlook(s: GameState): Outlook {
  const alive = s.crew.filter((m) => m.alive).length;
  const heat = s.weatherToday?.heat ?? typicalHeat(s.month);
  const waterPerDay = dailyWaterNeed(alive, heat);
  const foodPerDay = alive * TUNING.rationsLbsPerPersonDay[s.rations];
  const mpg = s.van.condition < 50 ? TUNING.vanMpgWorn : TUNING.vanMpgGood;

  const daysOfWater = waterPerDay > 0 ? Math.floor(s.supplies.water / waterPerDay) : Infinity;
  const daysOfFood = foodPerDay > 0 ? Math.floor(s.supplies.food / foodPerDay) : Infinity;
  const milesOfFuel = s.supplies.fuel * mpg;

  const nextShop = nextShopFrom(s);
  const warnings: string[] = [];
  if (nextShop) {
    const where = nextShop.shop ? `${nextShop.name} is the next shop` : `${nextShop.name} is the end of the road, and there are no more shops`;
    const leg = `${nextShop.miles} miles, about ${nextShop.days} ${nextShop.days === 1 ? 'day' : 'days'}`;
    if (daysOfWater < nextShop.days) {
      warnings.push(`WATER: ${plural(daysOfWater, 'day')} aboard. ${where}: ${leg}.`);
    }
    if (milesOfFuel < nextShop.miles) {
      warnings.push(`GAS: ${milesOfFuel} miles in the tank. ${where}: ${leg}.`);
    }
    if (daysOfFood < nextShop.days) {
      warnings.push(`FOOD: ${plural(daysOfFood, 'day')} aboard. ${where}: ${leg}.`);
    }
  }
  return { nextShop, daysOfWater, daysOfFood, milesOfFuel, warnings };
}

function plural(n: number, unit: string): string {
  return `${n} ${n === 1 ? unit : `${unit}s`}`;
}

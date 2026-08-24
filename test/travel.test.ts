import { describe, expect, test } from 'vitest';
import { createRng } from '../src/sim/rng';
import { dailyFoodNeed, dailyWaterNeed, fuelNeed, milesForDay } from '../src/sim/travel';
import type { Weather } from '../src/sim/types';

const weather = (heat: Weather['heat'] = 0): Weather => ({
  label: 'mild',
  heat,
  event: 'none',
});

function averageMiles(seed: number, pace: 'steady' | 'strenuous' | 'grueling', vanCondition: number, w: Weather): number {
  const r = createRng(seed);
  let total = 0;
  for (let i = 0; i < 300; i++) total += milesForDay(r, pace, vanCondition, w);
  return total / 300;
}

describe('milesForDay', () => {
  test('same rng state gives the same miles', () => {
    expect(milesForDay(createRng(77), 'steady', 100, weather())).toBe(
      milesForDay(createRng(77), 'steady', 100, weather()),
    );
  });

  test('a healthy van at steady pace makes roughly 40 miles', () => {
    const r = createRng(1);
    for (let i = 0; i < 200; i++) {
      const m = milesForDay(r, 'steady', 100, weather());
      expect(m).toBeGreaterThanOrEqual(35);
      expect(m).toBeLessThanOrEqual(45);
    }
  });

  test('grueling pace beats steady pace on average', () => {
    expect(averageMiles(2, 'grueling', 100, weather())).toBeGreaterThan(
      averageMiles(2, 'steady', 100, weather()) + 20,
    );
  });

  test('a battered van is a slower van', () => {
    expect(averageMiles(3, 'steady', 30, weather())).toBeLessThan(
      averageMiles(3, 'steady', 100, weather()) - 5,
    );
  });

  test('scorching heat slows the day', () => {
    expect(averageMiles(4, 'steady', 100, weather(3))).toBeLessThan(
      averageMiles(4, 'steady', 100, weather(0)),
    );
  });

  test('miles are whole numbers and never negative', () => {
    const r = createRng(5);
    for (let i = 0; i < 200; i++) {
      const m = milesForDay(r, 'steady', 10, weather(3));
      expect(Number.isInteger(m)).toBe(true);
      expect(m).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('consumption', () => {
  test('five crew on filling rations eat 15 lbs a day', () => {
    expect(dailyFoodNeed(5, 'filling')).toBe(15);
  });

  test('three crew on barebones eat 3 lbs a day', () => {
    expect(dailyFoodNeed(3, 'barebones')).toBe(3);
  });

  test('five crew drink 4 gallons on a mild day and 15 when it scorches', () => {
    expect(dailyWaterNeed(5, 0)).toBe(4);
    expect(dailyWaterNeed(5, 3)).toBe(15);
  });

  test('the van drinks a gallon per 10 miles, worse when battered', () => {
    expect(fuelNeed(40, 100)).toBe(4);
    expect(fuelNeed(40, 40)).toBe(5);
  });

  test('fuel need rounds up the partial gallon', () => {
    expect(fuelNeed(35, 100)).toBe(4);
  });
});

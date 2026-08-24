import { describe, expect, test } from 'vitest';
import { ROUTE } from '../src/sim/data/route';
import { isRiverId } from '../src/sim/crossing';
import { createRng } from '../src/sim/rng';
import { repairQuote } from '../src/sim/store';
import { rollWeather } from '../src/sim/weather';

describe('the full route', () => {
  test('runs seventeen stops from Las Cruces to Ocean Beach, 730 miles, in order', () => {
    expect(ROUTE).toHaveLength(17);
    expect(ROUTE[0]).toMatchObject({ id: 'las-cruces', mile: 0, kind: 'start' });
    expect(ROUTE[16]).toMatchObject({ id: 'ocean-beach', mile: 730, kind: 'finish' });
    for (let i = 1; i < ROUTE.length; i++) expect(ROUTE[i]!.mile).toBeGreaterThan(ROUTE[i - 1]!.mile);
  });

  test('every stop has real flavor text and no leftover phase gating', () => {
    for (const stop of ROUTE) {
      expect(stop.flavor.length, stop.id).toBeGreaterThan(60);
      expect('phase2' in stop, stop.id).toBe(false);
    }
  });

  test('the crossings are the two stops with rivers; the summit is the climax', () => {
    const crossings = ROUTE.filter((s) => s.kind === 'crossing').map((s) => s.id);
    expect(crossings).toEqual(['gila-bend', 'yuma']);
    for (const id of crossings) expect(isRiverId(id)).toBe(true);
    expect(ROUTE.filter((s) => s.kind === 'climax').map((s) => s.id)).toEqual(['laguna-summit']);
    expect(ROUTE.filter((s) => s.kind === 'hazard').map((s) => s.id)).toEqual(['imperial-dunes', 'in-ko-pah']);
  });

  test('the words that are not ours never appear in the route copy', () => {
    for (const stop of ROUTE) expect(stop.flavor.toLowerCase()).not.toContain('oregon');
  });
});

describe('the Imperial Valley heat spike', () => {
  test('below sea level the heat runs one tier hotter than the calendar says', () => {
    let desertMax = 0;
    let valleyMin = 3;
    for (let i = 0; i < 200; i++) {
      desertMax = Math.max(desertMax, rollWeather(createRng(i), 3, 100).heat);
      valleyMin = Math.min(valleyMin, rollWeather(createRng(i), 3, 600).heat);
    }
    expect(desertMax).toBe(1); // March desert: mild or warm
    expect(valleyMin).toBeGreaterThanOrEqual(1); // March in the valley: never mild
    for (let i = 0; i < 100; i++) expect(rollWeather(createRng(i), 6, 600).heat).toBe(3); // June: always scorching
  });

  test('the spike ends once you climb out of the valley', () => {
    let seenMild = false;
    for (let i = 0; i < 200; i++) if (rollWeather(createRng(i), 3, 680).heat === 0) seenMild = true;
    expect(seenMild).toBe(true);
  });
});

describe('van repairs', () => {
  test('a tune-up restores up to 25 points and costs more the farther west you are', () => {
    const home = repairQuote(60, 0)!;
    expect(home.points).toBe(25);
    expect(home.cents).toBeGreaterThan(0);
    expect(home.cents % 5).toBe(0);
    const west = repairQuote(60, 12)!; // El Centro
    expect(west.points).toBe(25);
    expect(west.cents).toBeGreaterThan(home.cents * 2);
  });

  test('you only pay for the points you get', () => {
    const nearly = repairQuote(90, 0)!;
    expect(nearly.points).toBe(10);
    expect(nearly.cents).toBeLessThan(repairQuote(60, 0)!.cents);
    expect(repairQuote(100, 0)).toBeNull();
  });

  test('the mechanic will not bother with a scratch', () => {
    expect(repairQuote(99.5, 0)).toBeNull();
    expect(repairQuote(97, 0)).toBeNull();
    expect(repairQuote(95, 0)).toEqual({ points: 5, cents: 750 });
  });
});

import { describe, expect, test } from 'vitest';
import { SNACK_WORDS } from '../src/sim/data/text';
import { createRng } from '../src/sim/rng';
import { snackTotal, snackWordsFor, snackYield } from '../src/sim/snack';

describe('snackWordsFor', () => {
  test('deals the requested number of distinct words from the menu', () => {
    const words = snackWordsFor(createRng(21), 3);
    expect(words).toHaveLength(3);
    expect(new Set(words).size).toBe(3);
    for (const w of words) expect(SNACK_WORDS).toContain(w);
  });

  test('same seed deals the same menu', () => {
    expect(snackWordsFor(createRng(22), 3)).toEqual(snackWordsFor(createRng(22), 3));
  });
});

describe('snackYield', () => {
  test('typing the word fast earns more than typing it slow', () => {
    const fast = snackYield('CARNE', 'CARNE', 600, 0);
    const slow = snackYield('CARNE', 'CARNE', 3500, 0);
    expect(fast.hit).toBe(true);
    expect(slow.hit).toBe(true);
    expect(fast.lbs).toBeGreaterThan(slow.lbs);
  });

  test('the wrong word earns nothing', () => {
    expect(snackYield('CARNE', 'CRANE', 500, 0)).toEqual({ hit: false, lbs: 0 });
  });

  test('matching is forgiving about case and stray spaces', () => {
    expect(snackYield('CARNE', '  carne ', 900, 0).hit).toBe(true);
  });

  test('the taco truck sees you coming: repeat runs yield 60% of the last', () => {
    const first = snackYield('BURRITO', 'BURRITO', 1000, 0);
    const second = snackYield('BURRITO', 'BURRITO', 1000, 1);
    expect(second.lbs).toBe(Math.round(first.lbs * 0.6));
  });

  test('a hit always earns at least a little something', () => {
    expect(snackYield('TACO', 'TACO', 30000, 3).lbs).toBeGreaterThan(0);
  });
});

describe('snackTotal', () => {
  test('you can only carry 100 lbs back to the van', () => {
    const results = [
      { word: 'CARNE', typed: 'CARNE', ms: 400, hit: true, lbs: 80 },
      { word: 'ASADA', typed: 'ASADA', ms: 400, hit: true, lbs: 80 },
    ];
    expect(snackTotal(results)).toBe(100);
  });

  test('misses contribute nothing', () => {
    const results = [
      { word: 'CARNE', typed: 'X', ms: 400, hit: false, lbs: 0 },
      { word: 'TACO', typed: 'TACO', ms: 900, hit: true, lbs: 30 },
    ];
    expect(snackTotal(results)).toBe(30);
  });
});

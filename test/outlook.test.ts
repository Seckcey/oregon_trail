// The supply outlook: how far the water, food and gas aboard will take the
// crew, measured against the next place that sells more. It is what the
// road screen and every store stop use to warn a player before the desert
// does it for them.

import { describe, expect, test } from 'vitest';
import { supplyOutlook } from '../src/sim/outlook';
import { arriveAt, departed } from './helpers';

describe('supplyOutlook', () => {
  test('from Las Cruces the next shop is Deming, 60 miles, about two days at a steady pace', () => {
    const o = supplyOutlook(departed());
    expect(o.nextShop).toEqual({ name: 'Deming', miles: 60, days: 2, shop: true });
  });

  test('a full larder raises no warnings', () => {
    expect(supplyOutlook(departed()).warnings).toEqual([]);
  });

  test('days of water count the whole crew against the season', () => {
    // June plans for scorching days: 3 gal each, 15 a day, 40 aboard → two whole days.
    expect(supplyOutlook(departed('june', 6)).daysOfWater).toBe(2);
    // March plans for a mild spring: 1.2 gal each, 6 a day → six whole days.
    expect(supplyOutlook(departed('march', 3)).daysOfWater).toBe(6);
  });

  test('warns, naming the shop, when the water will not reach it', () => {
    const s = structuredClone(departed());
    s.supplies.water = 12;
    const o = supplyOutlook(s);
    expect(o.daysOfWater).toBe(0);
    expect(o.warnings).toHaveLength(1);
    expect(o.warnings[0]).toMatch(/^WATER/);
    expect(o.warnings[0]).toContain('Deming');
  });

  test('warns about gas by miles, and food by days', () => {
    const s = structuredClone(departed());
    s.supplies.fuel = 3;
    s.supplies.food = 10;
    const o = supplyOutlook(s);
    expect(o.milesOfFuel).toBe(30);
    expect(o.warnings.some((w) => /^GAS/.test(w) && w.includes('30 miles'))).toBe(true);
    expect(o.warnings.some((w) => /^FOOD/.test(w))).toBe(true);
  });

  test('the worst news comes first: water, then gas, then food', () => {
    const s = structuredClone(departed());
    s.supplies = { ...s.supplies, water: 5, fuel: 2, food: 5 };
    expect(supplyOutlook(s).warnings.map((w) => w.split(':')[0])).toEqual(['WATER', 'GAS', 'FOOD']);
  });

  test('at Lordsburg the next shop is Tucson, 155 miles and four days out — the long dry leg', () => {
    const o = supplyOutlook(arriveAt(departed(), 'lordsburg'));
    expect(o.nextShop).toEqual({ name: 'Tucson', miles: 155, days: 4, shop: true });
  });

  test('past the last shop, the beach itself is the target', () => {
    const o = supplyOutlook(arriveAt(departed(), 'jacumba'));
    expect(o.nextShop?.name).toBe('Sunset Cliffs');
    expect(o.nextShop?.shop).toBe(false);
  });

  test('a bigger water tank does not change the arithmetic, only what fits', () => {
    const s = structuredClone(departed('june', 6));
    s.upgrades = { ...s.upgrades, waterTank: true };
    s.supplies.water = 65;
    expect(supplyOutlook(s).daysOfWater).toBe(4);
  });
});

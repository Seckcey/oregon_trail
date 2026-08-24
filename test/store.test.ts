import { describe, expect, test } from 'vitest';
import { fmtCents, priceCentsAt, purchase, STORE_ITEMS } from '../src/sim/store';
import type { Supplies } from '../src/sim/types';

const emptySupplies = (): Supplies => ({ food: 0, water: 0, fuel: 0, tires: 0, belts: 0, hoses: 0 });

describe('pricing', () => {
  test('the outfitter stocks exactly food, water, fuel, tire, belt, hose', () => {
    expect(STORE_ITEMS.map((i) => i.id).sort()).toEqual(
      ['belt', 'food', 'fuel', 'hose', 'tire', 'water'],
    );
  });

  test('every price at the Las Cruces outfitter ends in 85 cents', () => {
    expect(STORE_ITEMS.length).toBe(6);
    for (const item of STORE_ITEMS) {
      expect(priceCentsAt(item.id, 0) % 100).toBe(85);
    }
  });

  test('prices rise at each shop down the trail', () => {
    expect(STORE_ITEMS.length).toBe(6);
    // stop 1 = Deming, stop 2 = Lordsburg, stop 4 = Tucson (stop 3 has no shop)
    for (const item of STORE_ITEMS) {
      const lasCruces = priceCentsAt(item.id, 0);
      const deming = priceCentsAt(item.id, 1);
      const lordsburg = priceCentsAt(item.id, 2);
      const tucson = priceCentsAt(item.id, 4);
      expect(deming).toBeGreaterThan(lasCruces);
      expect(lordsburg).toBeGreaterThan(deming);
      expect(tucson).toBeGreaterThan(lordsburg);
    }
  });

  test('escalated prices are rounded to a 5-cent nickel', () => {
    expect(STORE_ITEMS.length).toBe(6);
    for (const item of STORE_ITEMS) {
      expect(priceCentsAt(item.id, 2) % 5).toBe(0);
    }
  });
});

describe('purchase', () => {
  test('buying a food case adds 25 lbs and deducts the price', () => {
    const result = purchase(100000, emptySupplies(), 'food', 1, 0);
    if (!result.ok) throw new Error('expected ok');
    expect(result.supplies.food).toBe(25);
    expect(result.cash).toBe(100000 - priceCentsAt('food', 0));
  });

  test('buying multiple fuel gallons multiplies price and quantity', () => {
    const result = purchase(100000, emptySupplies(), 'fuel', 10, 0);
    if (!result.ok) throw new Error('expected ok');
    expect(result.supplies.fuel).toBe(10);
    expect(result.cash).toBe(100000 - 10 * priceCentsAt('fuel', 0));
  });

  test('rejects with reason funds when cash is short', () => {
    const result = purchase(100, emptySupplies(), 'tire', 1, 0);
    expect(result).toEqual({ ok: false, reason: 'funds' });
  });

  test('rejects with reason capacity when water would exceed 40 gallons', () => {
    const supplies = { ...emptySupplies(), water: 38 };
    const result = purchase(100000, supplies, 'water', 1, 0); // jug = 5 gal
    expect(result).toEqual({ ok: false, reason: 'capacity' });
  });

  test('rejects with reason capacity beyond 3 spare tires', () => {
    const supplies = { ...emptySupplies(), tires: 3 };
    const result = purchase(100000, supplies, 'tire', 1, 0);
    expect(result).toEqual({ ok: false, reason: 'capacity' });
  });

  test('does not mutate the supplies object passed in', () => {
    const supplies = emptySupplies();
    purchase(100000, supplies, 'food', 2, 0);
    expect(supplies.food).toBe(0);
  });
});

describe('fmtCents', () => {
  test('formats cents as dollars with two decimals', () => {
    expect(fmtCents(1285)).toBe('$12.85');
    expect(fmtCents(40000)).toBe('$400.00');
    expect(fmtCents(5)).toBe('$0.05');
  });
});

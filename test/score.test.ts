import { describe, expect, test } from 'vitest';
import { computeScore } from '../src/sim/score';
import type { CrewMember, Supplies } from '../src/sim/types';

const crewAt = (healths: number[]): CrewMember[] =>
  healths.map((h, i) => ({
    name: `M${i}`,
    health: Math.max(0, h),
    alive: h > 0,
    conditions: [],
  }));

const supplies = (overrides: Partial<Supplies> = {}): Supplies => ({
  food: 0,
  water: 0,
  fuel: 0,
  tires: 0,
  belts: 0,
  hoses: 0,
  ...overrides,
});

describe('computeScore', () => {
  test('five healthy crew for a CEO score 2500 with nothing else', () => {
    const s = computeScore(crewAt([100, 100, 100, 100, 100]), supplies(), 0, 'ceo');
    expect(s.crewPoints).toBe(2500);
    expect(s.multiplier).toBe(1);
    expect(s.total).toBe(2500);
  });

  test('the intern multiplier triples the subtotal', () => {
    const s = computeScore(crewAt([100]), supplies(), 0, 'intern');
    expect(s.multiplier).toBe(3);
    expect(s.total).toBe(1500);
  });

  test('health tiers pay 500/400/300/200', () => {
    const s = computeScore(crewAt([80, 50, 30, 10]), supplies(), 0, 'ceo');
    expect(s.crewPoints).toBe(500 + 400 + 300 + 200);
  });

  test('the dead score nothing', () => {
    const s = computeScore(crewAt([100, 0, 0, 0, 0]), supplies(), 0, 'ceo');
    expect(s.crewPoints).toBe(500);
  });

  test('supplies pay out like the old manual: food/25, water/5, fuel/5, parts x2', () => {
    const s = computeScore(
      crewAt([100]),
      supplies({ food: 110, water: 23, fuel: 17, tires: 1, belts: 1, hoses: 2 }),
      0,
      'ceo',
    );
    // 110/25=4, 23/5=4, 17/5=3, parts 4*2=8
    expect(s.supplyPoints).toBe(4 + 4 + 3 + 8);
  });

  test('every five dollars left is a point', () => {
    const s = computeScore(crewAt([100]), supplies(), 5230, 'ceo'); // $52.30
    expect(s.cashPoints).toBe(10);
  });

  test('total = (crew + supplies + cash) x multiplier', () => {
    const s = computeScore(
      crewAt([100, 100]),
      supplies({ food: 50 }),
      1000,
      'sysadmin',
    );
    expect(s.total).toBe((1000 + 2 + 2) * 2);
  });
});

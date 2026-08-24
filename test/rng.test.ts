import { describe, expect, test } from 'vitest';
import { chance, createRng, nextFloat, nextInt, pick, seedFromString } from '../src/sim/rng';

describe('seedFromString', () => {
  test('same string produces same seed', () => {
    expect(seedFromString('wagon')).toBe(seedFromString('wagon'));
  });

  test('different strings produce different seeds', () => {
    expect(seedFromString('wagon')).not.toBe(seedFromString('van'));
  });
});

describe('nextFloat', () => {
  test('same seed produces identical sequence', () => {
    const a = createRng(seedFromString('route-8'));
    const b = createRng(seedFromString('route-8'));
    const seqA = [nextFloat(a), nextFloat(a), nextFloat(a), nextFloat(a), nextFloat(a)];
    const seqB = [nextFloat(b), nextFloat(b), nextFloat(b), nextFloat(b), nextFloat(b)];
    expect(seqA).toEqual(seqB);
  });

  test('different seeds diverge', () => {
    const a = createRng(seedFromString('route-8'));
    const b = createRng(seedFromString('route-80'));
    const seqA = [nextFloat(a), nextFloat(a), nextFloat(a)];
    const seqB = [nextFloat(b), nextFloat(b), nextFloat(b)];
    expect(seqA).not.toEqual(seqB);
  });

  test('stays within [0, 1)', () => {
    const r = createRng(123456);
    for (let i = 0; i < 1000; i++) {
      const f = nextFloat(r);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(1);
    }
  });

  test('state survives JSON round-trip and continues the same sequence', () => {
    const a = createRng(42);
    nextFloat(a);
    nextFloat(a);
    const restored = JSON.parse(JSON.stringify(a)) as typeof a;
    expect(nextFloat(restored)).toBe(nextFloat(a));
  });
});

describe('nextInt', () => {
  test('respects inclusive bounds and reaches both endpoints', () => {
    const r = createRng(7);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const n = nextInt(r, 2, 5);
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(5);
      seen.add(n);
    }
    expect(seen.has(2)).toBe(true);
    expect(seen.has(5)).toBe(true);
  });
});

describe('chance', () => {
  test('probability 0 never fires and 1 always fires', () => {
    const r = createRng(9);
    for (let i = 0; i < 100; i++) {
      expect(chance(r, 0)).toBe(false);
      expect(chance(r, 1)).toBe(true);
    }
  });

  test('rough frequency matches probability', () => {
    const r = createRng(11);
    let hits = 0;
    for (let i = 0; i < 5000; i++) if (chance(r, 0.3)) hits++;
    expect(hits / 5000).toBeGreaterThan(0.25);
    expect(hits / 5000).toBeLessThan(0.35);
  });
});

describe('pick', () => {
  test('returns a member of the array', () => {
    const r = createRng(13);
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(pick(r, arr));
    }
  });

  test('throws on empty array', () => {
    const r = createRng(13);
    expect(() => pick(r, [])).toThrow();
  });
});

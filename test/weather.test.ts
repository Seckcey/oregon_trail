import { describe, expect, test } from 'vitest';
import { createRng } from '../src/sim/rng';
import { rollWeather } from '../src/sim/weather';

describe('rollWeather', () => {
  test('same rng state produces the same weather', () => {
    const a = rollWeather(createRng(500), 6, 100);
    const b = rollWeather(createRng(500), 6, 100);
    expect(a).toEqual(b);
  });

  test('March never exceeds heat tier 1', () => {
    const r = createRng(1);
    for (let i = 0; i < 500; i++) {
      expect(rollWeather(r, 3, 100).heat).toBeLessThanOrEqual(1);
    }
  });

  test('July and August never drop below heat tier 2', () => {
    const r = createRng(2);
    for (let i = 0; i < 500; i++) {
      expect(rollWeather(r, 7, 100).heat).toBeGreaterThanOrEqual(2);
      expect(rollWeather(r, 8, 100).heat).toBeGreaterThanOrEqual(2);
    }
  });

  test('July can reach scorching (tier 3)', () => {
    const r = createRng(3);
    let sawTier3 = false;
    for (let i = 0; i < 500; i++) {
      if (rollWeather(r, 7, 100).heat === 3) sawTier3 = true;
    }
    expect(sawTier3).toBe(true);
  });

  test('dust storms happen in spring in the New Mexico stretch', () => {
    const r = createRng(4);
    let dust = 0;
    for (let i = 0; i < 1000; i++) {
      if (rollWeather(r, 4, 90).event === 'dust') dust++;
    }
    expect(dust).toBeGreaterThan(20); // ~8% of 1000
    expect(dust).toBeLessThan(200);
  });

  test('dust storms never happen in July or past the dust country', () => {
    const r = createRng(5);
    for (let i = 0; i < 500; i++) {
      expect(rollWeather(r, 7, 90).event).not.toBe('dust');
      expect(rollWeather(r, 4, 250).event).not.toBe('dust');
    }
  });

  test('monsoons happen in July toward Tucson but never in April', () => {
    const r = createRng(6);
    let monsoon = 0;
    for (let i = 0; i < 1000; i++) {
      if (rollWeather(r, 7, 200).event === 'monsoon') monsoon++;
    }
    expect(monsoon).toBeGreaterThan(40); // ~12% of 1000
    const r2 = createRng(7);
    for (let i = 0; i < 500; i++) {
      expect(rollWeather(r2, 4, 200).event).not.toBe('monsoon');
    }
  });

  test('monsoons never happen in the far-west lowlands before mile 150', () => {
    const r = createRng(8);
    for (let i = 0; i < 500; i++) {
      expect(rollWeather(r, 7, 60).event).not.toBe('monsoon');
    }
  });

  test('labels reflect the day: storm events name themselves, heat names the rest', () => {
    const r = createRng(9);
    for (let i = 0; i < 300; i++) {
      const w = rollWeather(r, 7, 200);
      if (w.event === 'monsoon') expect(w.label).toBe('monsoon');
      else if (w.event === 'dust') expect(w.label).toBe('dust storm');
      else expect(['mild', 'warm', 'hot', 'scorching'][w.heat]).toBe(w.label);
    }
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DEATH_CAUSES } from '../src/sim/data/text';
import { ROUTE } from '../src/sim/data/route';
import { sharedLimits } from '../src/sim/limits';
import { TUNING } from '../src/sim/types';

describe('the limits the API shares with the sim', () => {
  const limits = sharedLimits();

  it('lists every death cause the sim can print, and THE ROAD', () => {
    for (const cause of Object.values(DEATH_CAUSES)) expect(limits.causes).toContain(cause);
    expect(limits.causes).toContain('THE ROAD');
    expect(new Set(limits.causes).size).toBe(limits.causes.length);
  });

  it('caps mile at the end of the road and day at 400', () => {
    expect(limits.maxMile).toBe(ROUTE[ROUTE.length - 1]!.mile);
    expect(limits.maxMile).toBe(730);
    expect(limits.maxDay).toBe(400);
  });

  it('caps names and epitaphs the way the input fields do', () => {
    expect(limits.crewSize).toBe(TUNING.crewSize);
    expect(limits.nameMax).toBe(16);
    expect(limits.epitaphMax).toBe(60);
  });

  it('bounds the score per occupation: multiplier × (5 × 500 + supply cap + cash cap)', () => {
    const supplyCap = Math.floor((TUNING.foodMax + TUNING.upgradeFoodLbs) / 25) + Math.floor((TUNING.waterMax + TUNING.upgradeWaterGallons) / 5) + Math.floor((TUNING.fuelTankMax + TUNING.upgradeFuelGallons) / 5) + 3 * TUNING.partsMax * 2;
    for (const occ of ['ceo', 'sysadmin', 'intern'] as const) {
      const cashCap = Math.floor(TUNING.startingCashCents[occ] / 500);
      expect(limits.scoreMax[occ]).toBe(TUNING.scoreMultiplier[occ] * (5 * 500 + supplyCap + cashCap));
    }
  });

  it('shared/limits.json is up to date (npm run shared rewrites it)', () => {
    const onDisk = JSON.parse(readFileSync(new URL('../shared/limits.json', import.meta.url), 'utf8'));
    expect(onDisk).toEqual(limits);
  });
});

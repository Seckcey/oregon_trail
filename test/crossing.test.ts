import { describe, expect, test } from 'vitest';
import {
  RIVERS,
  floatRisk,
  fordRisk,
  isRiverId,
  resolveFloat,
  resolveFord,
  riskLabel,
  rollRiver,
  waitADay,
  type CrossingState,
} from '../src/sim/crossing';
import { createRng } from '../src/sim/rng';

const river = (over: Partial<CrossingState> = {}): CrossingState => ({
  river: 'yuma',
  depthFt: 3,
  currentMph: 3,
  daysWaited: 0,
  ...over,
});

describe('the rivers', () => {
  test('Gila Bend and Yuma are the two crossings, and the ferry at Yuma is the company boat', () => {
    expect(isRiverId('gila-bend')).toBe(true);
    expect(isRiverId('yuma')).toBe(true);
    expect(isRiverId('deming')).toBe(false);
    expect(RIVERS.yuma.ferryName).toMatch(/8 West Ventures/);
    expect(RIVERS.yuma.ferryCents).toBeGreaterThan(RIVERS['gila-bend'].ferryCents);
  });

  test('both rivers use the two-and-a-half-foot ford rule', () => {
    expect(RIVERS.yuma.fordSafeFt).toBe(2.5);
    expect(RIVERS['gila-bend'].fordSafeFt).toBe(2.5);
  });
});

describe('rollRiver', () => {
  test('is deterministic for a given rng state', () => {
    expect(rollRiver(createRng(9), 'yuma', 6)).toEqual(rollRiver(createRng(9), 'yuma', 6));
  });

  test('the Colorado runs deeper than the Gila, and monsoon months swell both', () => {
    let gila = 0;
    let colorado = 0;
    let gilaMonsoon = 0;
    const r = createRng(3);
    for (let i = 0; i < 300; i++) {
      gila += rollRiver(r, 'gila-bend', 6).depthFt;
      colorado += rollRiver(r, 'yuma', 6).depthFt;
      gilaMonsoon += rollRiver(r, 'gila-bend', 8).depthFt;
    }
    expect(colorado / 300).toBeGreaterThan(gila / 300 + 1);
    expect(gilaMonsoon / 300).toBeGreaterThan(gila / 300 + 0.5);
  });

  test('stays inside the river spec', () => {
    const r = createRng(11);
    for (let i = 0; i < 200; i++) {
      const c = rollRiver(r, 'yuma', 5);
      const spec = RIVERS.yuma;
      expect(c.depthFt).toBeGreaterThanOrEqual(spec.depthFt[0]);
      expect(c.depthFt).toBeLessThanOrEqual(spec.depthFt[1]);
      expect(c.currentMph).toBeGreaterThanOrEqual(spec.currentMph[0]);
      expect(c.currentMph).toBeLessThanOrEqual(spec.currentMph[1]);
      expect(c.daysWaited).toBe(0);
      expect(Math.abs(c.depthFt * 10 - Math.round(c.depthFt * 10))).toBeLessThan(1e-9);
    }
  });
});

describe('risk', () => {
  test('fording under the safe depth is nearly safe; over it gets ugly fast', () => {
    expect(fordRisk(river({ depthFt: 1, currentMph: 1 }))).toBeLessThan(0.1);
    expect(fordRisk(river({ depthFt: 2.5, currentMph: 2 }))).toBeLessThan(0.15);
    expect(fordRisk(river({ depthFt: 4, currentMph: 3 }))).toBeGreaterThan(0.4);
    expect(fordRisk(river({ depthFt: 6.5, currentMph: 7 }))).toBeGreaterThanOrEqual(0.9);
    expect(fordRisk(river({ depthFt: 6.5, currentMph: 7 }))).toBeLessThanOrEqual(0.95);
  });

  test('ford risk rises with depth and with current', () => {
    expect(fordRisk(river({ depthFt: 3.5 }))).toBeGreaterThan(fordRisk(river({ depthFt: 3 })));
    expect(fordRisk(river({ currentMph: 5 }))).toBeGreaterThan(fordRisk(river({ currentMph: 3 })));
  });

  test('floating the van cares about current, not depth', () => {
    expect(floatRisk(river({ depthFt: 1 }))).toBe(floatRisk(river({ depthFt: 6 })));
    expect(floatRisk(river({ currentMph: 6 }))).toBeGreaterThan(floatRisk(river({ currentMph: 2 })));
    expect(floatRisk(river({ currentMph: 7 }))).toBeLessThanOrEqual(0.7);
  });

  test('risk labels read like a ferry hand talking', () => {
    expect(riskLabel(0.05)).toBe('looks easy');
    expect(riskLabel(0.3)).toBe('looks dicey');
    expect(riskLabel(0.6)).toBe('looks bad');
    expect(riskLabel(0.9)).toBe('looks like a funeral');
  });
});

describe('waiting', () => {
  test('a day of waiting lowers the river and counts the day', () => {
    const before = river({ depthFt: 5, currentMph: 5 });
    const after = waitADay(createRng(1), before);
    expect(after.depthFt).toBeLessThan(before.depthFt);
    expect(after.depthFt).toBeGreaterThanOrEqual(0.3);
    expect(after.currentMph).toBeLessThanOrEqual(before.currentMph);
    expect(after.daysWaited).toBe(1);
    expect(before.daysWaited).toBe(0); // pure
  });

  test('the river never drops below a trickle', () => {
    let c = river({ depthFt: 0.5, currentMph: 1 });
    for (let i = 0; i < 10; i++) c = waitADay(createRng(i), c);
    expect(c.depthFt).toBeGreaterThanOrEqual(0.3);
    expect(c.currentMph).toBeGreaterThanOrEqual(1);
  });
});

describe('resolving a crossing', () => {
  test('a shallow ford almost always succeeds; a deep fast one almost always fails', () => {
    const r = createRng(5);
    let shallowOk = 0;
    let deepOk = 0;
    for (let i = 0; i < 400; i++) {
      if (resolveFord(r, river({ depthFt: 1, currentMph: 1 })).success) shallowOk++;
      if (resolveFord(r, river({ depthFt: 6.5, currentMph: 7 })).success) deepOk++;
    }
    expect(shallowOk).toBeGreaterThan(360);
    expect(deepOk).toBeLessThan(40);
  });

  test('a failed ford in deep water can roll the van and drown someone; shallow failures only swamp', () => {
    const r = createRng(8);
    let rolled = 0;
    let drowned = 0;
    for (let i = 0; i < 400; i++) {
      const deep = resolveFord(r, river({ depthFt: 6, currentMph: 6 }));
      if (!deep.success && deep.severity === 2) rolled++;
      if (deep.drowned) drowned++;
      const shallow = resolveFord(r, river({ depthFt: 3, currentMph: 6 }));
      if (!shallow.success) {
        expect(shallow.severity).toBe(1);
        expect(shallow.drowned).toBe(false);
      }
    }
    expect(rolled).toBeGreaterThan(100);
    expect(drowned).toBeGreaterThan(20);
    expect(drowned).toBeLessThan(rolled);
  });

  test('a successful ford reports no damage', () => {
    const ok = resolveFord(createRng(2), river({ depthFt: 0.5, currentMph: 1 }));
    expect(ok).toEqual({ success: true, severity: 0, drowned: false });
  });

  test('floating follows its own risk', () => {
    const r = createRng(4);
    let calmOk = 0;
    let fastOk = 0;
    for (let i = 0; i < 400; i++) {
      if (resolveFloat(r, river({ currentMph: 1 })).success) calmOk++;
      if (resolveFloat(r, river({ currentMph: 7 })).success) fastOk++;
    }
    expect(calmOk).toBeGreaterThan(fastOk + 100);
  });
});

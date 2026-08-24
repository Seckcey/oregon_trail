import { describe, expect, test } from 'vitest';
import { GRADE, gradeStep, speedLabel, startGrade, tempLabel, type GradeState } from '../src/sim/grade';
import { createRng } from '../src/sim/rng';

function grade(over: Partial<GradeState> = {}): GradeState {
  return {
    segment: 0,
    brakeTemp: GRADE.startTemp,
    speed: GRADE.startSpeed,
    steep: [true, false, true, false, true, false],
    heat: 0,
    lastLine: null,
    outcome: null,
    rampReason: null,
    ...over,
  };
}

describe('startGrade', () => {
  test('deals six segments with exactly three steep ones, seeded', () => {
    const g = startGrade(createRng(1), 2);
    expect(g.steep).toHaveLength(GRADE.segments);
    expect(g.steep.filter(Boolean)).toHaveLength(GRADE.steepCount);
    expect(g.segment).toBe(0);
    expect(g.brakeTemp).toBe(GRADE.startTemp);
    expect(g.speed).toBe(GRADE.startSpeed);
    expect(g.heat).toBe(2);
    expect(g.outcome).toBeNull();
    expect(startGrade(createRng(1), 2)).toEqual(g);
  });

  test('different seeds deal different steep patterns', () => {
    const patterns = new Set<string>();
    for (let i = 0; i < 30; i++) patterns.add(startGrade(createRng(i), 0).steep.join(','));
    expect(patterns.size).toBeGreaterThan(3);
  });
});

describe('gradeStep', () => {
  test('is pure', () => {
    const g = grade();
    gradeStep(g, 'brake');
    expect(g).toEqual(grade());
  });

  test('gravity pulls harder on a steep segment; braking sheds speed and makes heat', () => {
    const steep = gradeStep(grade({ steep: [true] }), 'brake');
    // +2 for steep, -2 for the brakes: speed unchanged, temp up by the brake heat
    expect(steep.speed).toBe(GRADE.startSpeed);
    expect(steep.brakeTemp).toBe(GRADE.startTemp + GRADE.brakeHeat);
    expect(steep.segment).toBe(1);

    const flat = gradeStep(grade({ steep: [false] }), 'brake');
    expect(flat.speed).toBe(Math.max(1, GRADE.startSpeed + 1 - 2));
  });

  test('downshifting holds speed on a flat stretch for a little heat', () => {
    const g = gradeStep(grade({ steep: [false] }), 'downshift');
    expect(g.speed).toBe(GRADE.startSpeed);
    expect(g.brakeTemp).toBe(GRADE.startTemp + GRADE.downshiftHeat);
  });

  test('coasting cools the brakes and lets the van run', () => {
    const g = gradeStep(grade({ steep: [false], brakeTemp: 50 }), 'coast');
    expect(g.speed).toBe(GRADE.startSpeed + 1);
    expect(g.brakeTemp).toBe(50 - GRADE.coastCool);
  });

  test('heat makes every brake application hotter', () => {
    const cool = gradeStep(grade({ heat: 0 }), 'brake');
    const scorching = gradeStep(grade({ heat: 3 }), 'brake');
    expect(scorching.brakeTemp).toBe(cool.brakeTemp + 3 * GRADE.heatPerTier);
  });

  test('speed never drops below one; temperature never below zero', () => {
    const g = gradeStep(grade({ steep: [false], speed: 1, brakeTemp: 0 }), 'coast');
    expect(g.brakeTemp).toBe(0);
    const b = gradeStep(grade({ steep: [false], speed: 1 }), 'brake');
    expect(b.speed).toBe(1);
  });

  test('too much speed means the runaway ramp', () => {
    const g = gradeStep(grade({ steep: [true], speed: GRADE.maxSpeed - 1 }), 'coast');
    expect(g.outcome).toBe('ramp');
    expect(g.rampReason).toBe('runaway');
  });

  test('cooked brakes fade, and that is the ramp too', () => {
    const g = gradeStep(grade({ steep: [false], brakeTemp: GRADE.fadeTemp - 1 }), 'brake');
    expect(g.outcome).toBe('ramp');
    expect(g.rampReason).toBe('fade');
  });

  test('a finished descent is clean or smoking depending on the brakes', () => {
    const last = grade({ segment: GRADE.segments - 1, steep: new Array(GRADE.segments).fill(false), brakeTemp: 10 });
    expect(gradeStep(last, 'downshift').outcome).toBe('clean');
    const hot = { ...last, brakeTemp: GRADE.smokingTemp };
    expect(gradeStep(hot, 'downshift').outcome).toBe('smoking');
  });

  test('a careful driver gets down alive on a cool day', () => {
    let g = grade({ heat: 0 });
    while (g.outcome === null) {
      const steepNext = g.steep[g.segment];
      g = gradeStep(g, g.speed >= 3 || steepNext ? 'brake' : g.brakeTemp >= 60 ? 'coast' : 'downshift');
    }
    expect(g.outcome).not.toBe('ramp');
  });

  test('riding the brakes the whole way on a scorching day cooks them', () => {
    let g = grade({ heat: 3 });
    while (g.outcome === null) g = gradeStep(g, 'brake');
    expect(g.outcome).toBe('ramp');
    expect(g.rampReason).toBe('fade');
  });

  test('letting it roll the whole way runs away', () => {
    let g = grade({ heat: 0 });
    while (g.outcome === null) g = gradeStep(g, 'coast');
    expect(g.outcome).toBe('ramp');
    expect(g.rampReason).toBe('runaway');
  });

  test('every step leaves a line for the screen and ignores moves after the outcome', () => {
    const g = gradeStep(grade(), 'brake');
    expect(g.lastLine).toBeTruthy();
    const done = { ...g, outcome: 'clean' as const };
    expect(gradeStep(done, 'coast')).toEqual(done);
  });
});

describe('every deal is survivable', () => {
  const MOVES = ['brake', 'downshift', 'coast'] as const;

  function bestOutcome(g: GradeState): 'clean' | 'smoking' | 'ramp' {
    if (g.outcome !== null) return g.outcome;
    let best: 'clean' | 'smoking' | 'ramp' = 'ramp';
    for (const move of MOVES) {
      const o = bestOutcome(gradeStep(g, move));
      if (o === 'clean') return 'clean';
      if (o === 'smoking') best = 'smoking';
    }
    return best;
  }

  function patterns(): boolean[][] {
    const out: boolean[][] = [];
    for (let mask = 0; mask < 1 << GRADE.segments; mask++) {
      const bits = Array.from({ length: GRADE.segments }, (_, i) => Boolean(mask & (1 << i)));
      if (bits.filter(Boolean).length === GRADE.steepCount) out.push(bits);
    }
    return out;
  }

  test('on any pattern in any heat there is a way down that is not the ramp', () => {
    for (const steep of patterns()) {
      for (const heat of [0, 1, 2, 3] as const) {
        expect(bestOutcome(grade({ steep, heat })), `${steep.map((b) => (b ? 'S' : 'f')).join('')} heat ${heat}`).not.toBe('ramp');
      }
    }
  });

  test('on a cool day every pattern can be driven clean', () => {
    for (const steep of patterns()) {
      expect(bestOutcome(grade({ steep, heat: 0 })), steep.map((b) => (b ? 'S' : 'f')).join('')).toBe('clean');
    }
  });

  test('on a mild day a driver who only watches the next stretch still gets down; in real heat you read the profile', () => {
    for (const steep of patterns()) {
      for (const heat of [0, 1] as const) {
        let g = grade({ steep, heat });
        while (g.outcome === null) {
          const steepNext = g.steep[g.segment] ?? false;
          const move =
            g.speed >= 4 ? 'brake' : steepNext && g.speed >= 3 ? 'brake' : steepNext ? 'downshift' : g.brakeTemp >= 40 ? 'coast' : 'downshift';
          g = gradeStep(g, move);
        }
        expect(g.outcome, `${steep.map((b) => (b ? 'S' : 'f')).join('')} heat ${heat}`).not.toBe('ramp');
      }
    }
  });
});

describe('labels', () => {
  test('brake temperature reads as a gauge', () => {
    expect(tempLabel(0)).toBe('cool');
    expect(tempLabel(45)).toBe('warm');
    expect(tempLabel(GRADE.smokingTemp)).toBe('smoking');
    expect(tempLabel(GRADE.fadeTemp)).toBe('fading');
  });

  test('speed reads like a passenger describing it', () => {
    expect(speedLabel(1)).toMatch(/crawl/i);
    expect(speedLabel(GRADE.maxSpeed)).toMatch(/too fast/i);
  });
});

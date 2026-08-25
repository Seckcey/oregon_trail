// Shared helpers for the sim tests: setup, teleporting to a stop, and an
// auto-pilot that can drive the whole route with sensible choices.

import { ROUTE } from '../src/sim/data/route';
import { RIVERS } from '../src/sim/crossing';
import { createGame, reduce, type Action } from '../src/sim/game';
import { gradeStep, type GradeMove, type GradeState } from '../src/sim/grade';
import type { DepartureMonth, GameState, Occupation } from '../src/sim/types';

const GRADE_MOVES: readonly GradeMove[] = ['brake', 'downshift', 'coast'];

/**
 * Brute-force a move sequence that gets the van down without the ramp,
 * preferring a clean descent over a smoking one. Null if none exists.
 */
export function planDescent(start: GradeState): GradeMove[] | null {
  let smoking: GradeMove[] | null = null;
  const search = (g: GradeState, moves: GradeMove[]): GradeMove[] | null => {
    if (g.outcome === 'ramp') return null;
    if (g.outcome === 'clean') return moves;
    if (g.outcome === 'smoking') {
      if (!smoking) smoking = moves;
      return null;
    }
    for (const move of GRADE_MOVES) {
      const found = search(gradeStep(g, move), [...moves, move]);
      if (found) return found;
    }
    return null;
  };
  return search(start, []) ?? smoking;
}

/** What a careful driver who can only see the next stretch would do. */
export function gradeHeuristic(g: GradeState): GradeMove {
  const steepNext = g.steep[g.segment] ?? false;
  if (g.speed >= 4) return 'brake';
  if (steepNext && g.speed >= 3) return 'brake';
  if (steepNext) return 'downshift';
  if (g.brakeTemp >= 40) return 'coast';
  return 'downshift';
}

export function run(state: GameState, ...actions: Action[]): GameState {
  return actions.reduce((s, a) => reduce(s, a), state);
}

/** Walk the setup flow to the moment the van leaves Las Cruces. */
export function departed(seed = 'test-seed', month: DepartureMonth = 6, occupation: Occupation = 'ceo'): GameState {
  return departedWith(['M0', 'M1', 'M2', 'M3', 'M4'], seed, month, occupation);
}

/** The same, with a crew of your choosing. */
export function departedWith(
  names: readonly string[],
  seed = 'test-seed',
  month: DepartureMonth = 6,
  occupation: Occupation = 'ceo',
): GameState {
  let s = createGame(seed);
  s = run(s, { type: 'START_NEW' }, { type: 'CHOOSE_OCCUPATION', occupation }, { type: 'CHOOSE_MONTH', month });
  for (let i = 0; i < 5; i++) s = reduce(s, { type: 'SUBMIT_NAME', name: names[i] ?? `M${i}` });
  s = run(
    s,
    { type: 'BUY', item: 'food', units: 8 },
    { type: 'BUY', item: 'water', units: 8 },
    { type: 'BUY', item: 'fuel', units: 35 },
    { type: 'BUY', item: 'tire', units: 1 },
    { type: 'BUY', item: 'belt', units: 1 },
    { type: 'BUY', item: 'hose', units: 1 },
    { type: 'LEAVE_STORE' },
  );
  return s;
}

export function stopIndexOf(id: string): number {
  const index = ROUTE.findIndex((stop) => stop.id === id);
  if (index < 0) throw new Error(`no stop ${id}`);
  return index;
}

/**
 * Put the van one mile short of a stop with a full larder and drive in.
 * June by default in departed(): no dust, no monsoon, so the arrival is clean.
 */
export function arriveAt(state: GameState, id: string, topUp = true): GameState {
  const index = stopIndexOf(id);
  const s = structuredClone(state);
  s.mile = ROUTE[index]!.mile - 1;
  s.nextStopIndex = index;
  s.atStopIndex = null;
  s.phase = 'travel';
  s.pendingEvent = null;
  s.crossing = null;
  s.grade = null;
  if (topUp) s.supplies = { ...s.supplies, food: 200, water: 40, fuel: 40 };
  return reduce(s, { type: 'DRIVE' });
}

export interface PilotOptions {
  summit?: 'grade' | 'old80';
  /** Choice index for events not otherwise handled (default 0). */
  eventIndex?: number;
}

/** One sensible action for the current phase, or null if the run is over. */
export function pilotAction(s: GameState, shopped: Set<number>, opts: PilotOptions = {}): Action | null {
  switch (s.phase) {
    case 'travel':
      return { type: 'DRIVE' };
    case 'event': {
      const ev = s.pendingEvent!;
      if (!ev.choices) return { type: 'EVENT_CONTINUE' };
      if (ev.id === 'summit') return { type: 'EVENT_CHOICE', index: opts.summit === 'old80' ? 1 : 0 };
      if (ev.id === 'dunes') return { type: 'EVENT_CHOICE', index: ev.choices.length - 1 }; // wait it out
      if (ev.id === 'in-ko-pah') return { type: 'EVENT_CHOICE', index: 0 }; // low gear
      return { type: 'EVENT_CHOICE', index: opts.eventIndex ?? 0 };
    }
    case 'stop': {
      const index = s.atStopIndex ?? -1;
      const stop = ROUTE[index];
      if (stop?.hasShop && !shopped.has(index)) {
        shopped.add(index);
        return { type: 'STOP_SHOP' };
      }
      return { type: 'STOP_LEAVE' };
    }
    case 'store': {
      if (s.supplies.fuel < 40) return { type: 'BUY', item: 'fuel', units: 40 - s.supplies.fuel };
      if (s.supplies.water <= 30) return { type: 'BUY', item: 'water', units: 2 };
      if (s.supplies.food < 100) return { type: 'BUY', item: 'food', units: 4 };
      return { type: 'LEAVE_STORE' };
    }
    case 'crossing': {
      const c = s.crossing!;
      const spec = RIVERS[c.river];
      if (s.cash >= spec.ferryCents) return { type: 'CROSS', method: 'ferry' };
      if (c.daysWaited >= 3 || c.depthFt <= spec.fordSafeFt) return { type: 'CROSS', method: 'ford' };
      return { type: 'CROSS', method: 'wait' };
    }
    case 'grade': {
      // The pilot reads the whole profile, like a player would, and plans.
      const plan = planDescent(s.grade!);
      return { type: 'GRADE_STEP', move: plan?.[0] ?? gradeHeuristic(s.grade!) };
    }
    default:
      return null; // epitaph / dead / victory / menus — caller inspects
  }
}

/** Drive with the auto-pilot until a predicate holds or the run ends. */
export function pilot(
  state: GameState,
  done: (s: GameState) => boolean,
  opts: PilotOptions = {},
  maxSteps = 2000,
): GameState {
  let s = state;
  const shopped = new Set<number>();
  for (let i = 0; i < maxSteps; i++) {
    if (done(s)) return s;
    const action = pilotAction(s, shopped, opts);
    if (!action) return s;
    s = reduce(s, action);
  }
  return s;
}

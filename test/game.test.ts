import { describe, expect, test } from 'vitest';
import { createGame, reduce, view, type Action } from '../src/sim/game';
import type { GameState, Memorial } from '../src/sim/types';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function run(state: GameState, ...actions: Action[]): GameState {
  return actions.reduce((s, a) => reduce(s, a), state);
}

/** Walk the setup flow to the moment the van leaves Las Cruces. */
function departed(seed = 'test-seed', month: 3 | 4 | 5 | 6 | 7 | 8 = 6): GameState {
  let s = createGame(seed);
  s = run(
    s,
    { type: 'START_NEW' },
    { type: 'CHOOSE_OCCUPATION', occupation: 'ceo' },
    { type: 'CHOOSE_MONTH', month },
  );
  for (let i = 0; i < 5; i++) s = reduce(s, { type: 'SUBMIT_NAME', name: `M${i}` });
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

/** Drive until a predicate holds, auto-dismissing notices and stops. */
function driveUntil(
  state: GameState,
  done: (s: GameState) => boolean,
  maxSteps = 400,
): GameState {
  let s = state;
  for (let i = 0; i < maxSteps; i++) {
    if (done(s)) return s;
    if (s.phase === 'event') {
      s = reduce(s, s.pendingEvent?.choices ? { type: 'EVENT_CHOICE', index: 0 } : { type: 'EVENT_CONTINUE' });
    } else if (s.phase === 'stop') {
      s = reduce(s, { type: 'STOP_LEAVE' });
    } else if (s.phase === 'travel') {
      s = reduce(s, { type: 'DRIVE' });
    } else {
      return s; // epitaph / dead / victory — caller inspects
    }
  }
  return s;
}

// ---------------------------------------------------------------------------
// setup flow
// ---------------------------------------------------------------------------

describe('setup flow', () => {
  test('a new game opens on the title screen', () => {
    const s = createGame('a');
    expect(s.phase).toBe('title');
    expect(view(s).choices.length).toBeGreaterThanOrEqual(2);
  });

  test('choosing the CEO grants $2,500.00 like the old banker', () => {
    const s = run(createGame('a'), { type: 'START_NEW' }, { type: 'CHOOSE_OCCUPATION', occupation: 'ceo' });
    expect(s.cash).toBe(250000);
    expect(s.phase).toBe('month');
  });

  test('choosing the intern grants $400.00', () => {
    const s = run(createGame('a'), { type: 'START_NEW' }, { type: 'CHOOSE_OCCUPATION', occupation: 'intern' });
    expect(s.cash).toBe(40000);
  });

  test('after month choice you name five crew members, blank uses a suggestion', () => {
    let s = run(
      createGame('a'),
      { type: 'START_NEW' },
      { type: 'CHOOSE_OCCUPATION', occupation: 'ceo' },
      { type: 'CHOOSE_MONTH', month: 5 },
    );
    expect(s.phase).toBe('naming');
    s = reduce(s, { type: 'SUBMIT_NAME', name: 'Frank' });
    for (let i = 0; i < 4; i++) s = reduce(s, { type: 'SUBMIT_NAME', name: '' });
    expect(s.phase).toBe('store');
    expect(s.crew).toHaveLength(5);
    expect(s.crew[0]?.name).toBe('Frank');
    for (const m of s.crew) {
      expect(m.name.length).toBeGreaterThan(0);
      expect(m.health).toBe(100);
      expect(m.alive).toBe(true);
    }
  });

  test('the store sells and the ledger balances', () => {
    let s = run(
      createGame('a'),
      { type: 'START_NEW' },
      { type: 'CHOOSE_OCCUPATION', occupation: 'ceo' },
      { type: 'CHOOSE_MONTH', month: 5 },
    );
    for (let i = 0; i < 5; i++) s = reduce(s, { type: 'SUBMIT_NAME', name: '' });
    const before = s.cash;
    s = reduce(s, { type: 'BUY', item: 'food', units: 2 });
    expect(s.supplies.food).toBe(50);
    expect(s.cash).toBe(before - 2 * 1285);
  });

  test('a purchase you cannot afford changes nothing but the notice', () => {
    let s = run(
      createGame('a'),
      { type: 'START_NEW' },
      { type: 'CHOOSE_OCCUPATION', occupation: 'intern' },
      { type: 'CHOOSE_MONTH', month: 5 },
    );
    for (let i = 0; i < 5; i++) s = reduce(s, { type: 'SUBMIT_NAME', name: '' });
    const cashBefore = s.cash;
    s = reduce(s, { type: 'BUY', item: 'tire', units: 100 });
    expect(s.cash).toBe(cashBefore);
    expect(s.supplies.tires).toBe(0);
    expect(s.storeNotice).toBeTruthy();
  });

  test('leaving the Las Cruces store starts the journey on day 1', () => {
    const s = departed();
    expect(s.phase).toBe('travel');
    expect(s.day).toBe(1);
    expect(s.mile).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// the daily drive
// ---------------------------------------------------------------------------

describe('driving', () => {
  test('a day on the road moves the van and burns supplies', () => {
    const s0 = departed();
    const s1 = driveUntil(s0, (s) => s.day >= 2 && s.phase === 'travel');
    expect(s1.mile).toBeGreaterThan(0);
    expect(s1.supplies.food).toBeLessThan(s0.supplies.food);
    expect(s1.supplies.fuel).toBeLessThan(s0.supplies.fuel);
    expect(s1.supplies.water).toBeLessThan(s0.supplies.water);
  });

  test('the calendar turns with the odometer', () => {
    const s0 = departed('cal-seed', 6);
    const s1 = driveUntil(s0, (s) => s.day >= 3 && s.phase === 'travel');
    expect(s1.dayOfMonth).toBe(s1.day); // June 1 departure: day N = June N
  });

  test('with no food aboard the crew starves rather than eats', () => {
    let s = departed();
    s = structuredClone(s);
    s.supplies.food = 0;
    const healthBefore = s.crew.map((m) => m.health);
    const after = driveUntil(s, (x) => x.day >= 2);
    for (let i = 0; i < 5; i++) {
      expect(after.crew[i]!.health).toBeLessThan(healthBefore[i]!);
    }
    expect(after.daysWithoutFood).toBeGreaterThan(0);
  });

  test('the van arrives at Deming, mile 60, and stops there', () => {
    const s = driveUntil(departed(), (x) => x.phase === 'stop');
    expect(s.mile).toBe(60);
    expect(s.atStopIndex).toBe(1);
    expect(view(s).lines.join(' ')).toContain('Deming');
  });

  test('resting heals the hurt without moving the van', () => {
    let s = departed();
    s = structuredClone(s);
    s.crew[2]!.health = 40;
    const mile = s.mile;
    const rested = reduce(s, { type: 'REST' });
    const expectRested = rested.phase === 'event' ? reduce(rested, { type: 'EVENT_CONTINUE' }) : rested;
    expect(expectRested.mile).toBe(mile);
    expect(expectRested.crew[2]!.health).toBeGreaterThan(40);
    expect(expectRested.day).toBe(s.day + 1);
  });

  test('pace and rations screens change the dials and return', () => {
    let s = departed();
    s = run(s, { type: 'OPEN', screen: 'pace' }, { type: 'SET_PACE', pace: 'grueling' });
    expect(s.phase).toBe('travel');
    expect(s.pace).toBe('grueling');
    s = run(s, { type: 'OPEN', screen: 'rations' }, { type: 'SET_RATIONS', rations: 'barebones' });
    expect(s.rations).toBe('barebones');
  });
});

// ---------------------------------------------------------------------------
// events
// ---------------------------------------------------------------------------

describe('events', () => {
  test('the road throws trouble at you sooner or later', () => {
    let sawEvent = false;
    let s = departed('event-seed');
    for (let i = 0; i < 60 && !s.gameOver; i++) {
      if (s.phase === 'event') {
        sawEvent = true;
        s = reduce(s, s.pendingEvent?.choices ? { type: 'EVENT_CHOICE', index: 0 } : { type: 'EVENT_CONTINUE' });
      } else if (s.phase === 'stop') s = reduce(s, { type: 'STOP_LEAVE' });
      else if (s.phase === 'travel') s = reduce(s, { type: 'DRIVE' });
      else break;
    }
    expect(sawEvent).toBe(true);
  });

  test('spring dust storms demand a choice, and both answers cost something', () => {
    // Find a deterministic seed whose first March day whips up a dust storm.
    let base: GameState | null = null;
    for (let i = 0; i < 300; i++) {
      const candidate = reduce(departed(`dust-${i}`, 3), { type: 'DRIVE' });
      if (candidate.phase === 'event' && candidate.pendingEvent?.choices) {
        base = candidate;
        break;
      }
    }
    expect(base).not.toBeNull();
    const pushed = reduce(base!, { type: 'EVENT_CHOICE', index: 0 });
    const holed = reduce(base!, { type: 'EVENT_CHOICE', index: 1 });
    expect(pushed.day).toBe(base!.day + 1);
    expect(holed.day).toBe(base!.day + 1);
    expect(pushed.mile).toBeGreaterThanOrEqual(holed.mile);
    expect(pushed.van.condition).toBeLessThan(100);
  });

  test('the ransomware bites at most once, and 8 West IT gets its wink', () => {
    for (const seed of ['r1', 'r2', 'r3', 'r4']) {
      const s = driveUntil(departed(seed), (x) => x.gameOver || x.phase === 'victory');
      const winks = s.log.filter((l) => l.text.includes('8 West IT 365')).length;
      expect(winks).toBeLessThanOrEqual(1);
    }
  });

  test('running dry with cash buys a tow: a day and $85 for five gallons', () => {
    let s = departed();
    s = structuredClone(s);
    s.supplies.fuel = 0;
    const day = s.day;
    const cash = s.cash;
    const out = reduce(s, { type: 'DRIVE' });
    expect(out.phase).toBe('event');
    const resolved = reduce(out, { type: 'EVENT_CONTINUE' });
    expect(resolved.day).toBe(day + 1);
    expect(resolved.cash).toBe(cash - 8500);
    expect(resolved.supplies.fuel).toBe(5);
    expect(resolved.mile).toBe(s.mile);
  });

  test('running dry broke costs two days and hurts', () => {
    let s = departed('broke');
    s = structuredClone(s);
    s.supplies.fuel = 0;
    s.cash = 100;
    const day = s.day;
    const health = s.crew[0]!.health;
    const out = reduce(s, { type: 'DRIVE' });
    const resolved = reduce(out, { type: 'EVENT_CONTINUE' });
    expect(resolved.day).toBe(day + 2);
    expect(resolved.supplies.fuel).toBe(5);
    expect(resolved.crew[0]!.health).toBeLessThan(health);
  });
});

// ---------------------------------------------------------------------------
// the snack run
// ---------------------------------------------------------------------------

describe('the snack run', () => {
  test('fast fingers bring food back to the van, one day spent', () => {
    let s = driveUntil(departed(), (x) => x.phase === 'travel' && x.mile > 0);
    const food = s.supplies.food;
    const day = s.day;
    s = reduce(s, { type: 'SNACK_START' });
    expect(s.phase).toBe('snack');
    expect(s.snack?.words).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      const word = s.snack!.words[s.snack!.round]!;
      s = reduce(s, { type: 'SNACK_SUBMIT', typed: word, ms: 700 });
    }
    if (s.phase === 'event') s = reduce(s, { type: 'EVENT_CONTINUE' });
    expect(s.phase).toBe('travel');
    expect(s.day).toBe(day + 1);
    expect(s.supplies.food).toBeGreaterThan(food - 20); // gained more than the day consumed
    expect(s.supplies.food).toBeLessThanOrEqual(food + 100);
    expect(s.snackRunsSinceStop).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// death and the memorial
// ---------------------------------------------------------------------------

describe('death', () => {
  test('one lost crew member gets a notice and a roadside memorial', () => {
    let s = departed();
    s = structuredClone(s);
    s.crew[1]!.health = 1;
    s.crew[1]!.conditions = [{ kind: 'snakebite', daysLeft: 3 }];
    const out = reduce(s, { type: 'DRIVE' });
    expect(out.phase).toBe('event');
    expect(out.pendingEvent!.text.join(' ')).toContain(s.crew[1]!.name);
    const cont = reduce(out, { type: 'EVENT_CONTINUE' });
    expect(cont.crew.filter((m) => m.alive)).toHaveLength(4);
    expect(cont.runMemorials).toHaveLength(1);
    expect(cont.runMemorials[0]!.cause).toBe('SNAKEBITE');
    expect(cont.gameOver).toBe(false);
  });

  test('losing everyone ends the run: cause, epitaph, memorial', () => {
    let s = departed();
    s = structuredClone(s);
    for (const m of s.crew) m.health = 1;
    s.supplies.water = 0;
    const out = reduce(s, { type: 'DRIVE' });
    expect(out.phase).toBe('epitaph');
    expect(out.deathCause).toBe('THIRST');
    const done = reduce(out, { type: 'SUBMIT_EPITAPH', text: 'WE NEVER SAW THE BEACH' });
    expect(done.phase).toBe('dead');
    expect(done.gameOver).toBe(true);
    expect(done.epitaph).toBe('WE NEVER SAW THE BEACH');
    const wipe = done.runMemorials[done.runMemorials.length - 1]!;
    expect(wipe.epitaph).toBe('WE NEVER SAW THE BEACH');
    expect(view(done).lines.join(' ')).toContain('THIRST');
  });

  test('past travelers haunt the roadside where they fell', () => {
    const grave: Memorial = { names: ['OLD TIMER'], mile: 25, day: 3, cause: 'THIRST', epitaph: 'DUST TO DUST', };
    let s = createGame('memorial-seed', [grave]);
    s = run(
      s,
      { type: 'START_NEW' },
      { type: 'CHOOSE_OCCUPATION', occupation: 'ceo' },
      { type: 'CHOOSE_MONTH', month: 6 },
    );
    for (let i = 0; i < 5; i++) s = reduce(s, { type: 'SUBMIT_NAME', name: '' });
    s = run(
      s,
      { type: 'BUY', item: 'food', units: 8 },
      { type: 'BUY', item: 'water', units: 8 },
      { type: 'BUY', item: 'fuel', units: 35 },
      { type: 'LEAVE_STORE' },
    );
    const after = driveUntil(s, (x) => x.mile >= 25);
    expect(after.log.map((l) => l.text).join(' ')).toContain('DUST TO DUST');
  });
});

// ---------------------------------------------------------------------------
// victory
// ---------------------------------------------------------------------------

describe('the end of the desert leg', () => {
  // Phase 1 ended the run here. Phase 2 opened the road: Tucson is a town
  // like any other, and the finish is Ocean Beach (see test/west.test.ts).
  test('reaching Tucson is a milestone stop, not the finish', () => {
    let s = departed();
    s = structuredClone(s);
    s.mile = 270;
    s.nextStopIndex = 4;
    const there = driveUntil(s, (x) => x.phase === 'stop' && x.mile === 275, 20);
    expect(there.phase).toBe('stop');
    expect(there.mile).toBe(275);
    expect(there.gameOver).toBe(false);
    expect(view(there).title).toBe('TUCSON');
  });
});

// ---------------------------------------------------------------------------
// determinism
// ---------------------------------------------------------------------------

describe('determinism', () => {
  test('same seed, same choices, same fate', () => {
    const a = driveUntil(departed('twin'), (x) => x.day >= 6 || x.gameOver);
    const b = driveUntil(departed('twin'), (x) => x.day >= 6 || x.gameOver);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test('a different seed writes a different diary', () => {
    const a = driveUntil(departed('twin'), (x) => x.day >= 6 || x.gameOver);
    const b = driveUntil(departed('other'), (x) => x.day >= 6 || x.gameOver);
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });
});

// ---------------------------------------------------------------------------
// the view layer
// ---------------------------------------------------------------------------

describe('view', () => {
  test('the store screen quotes the .85 prices', () => {
    let s = run(
      createGame('v'),
      { type: 'START_NEW' },
      { type: 'CHOOSE_OCCUPATION', occupation: 'ceo' },
      { type: 'CHOOSE_MONTH', month: 5 },
    );
    for (let i = 0; i < 5; i++) s = reduce(s, { type: 'SUBMIT_NAME', name: '' });
    const screen = view(s);
    expect(screen.lines.join('\n')).toContain('$12.85');
    expect(screen.choices.some((c) => c.label.toLowerCase().includes('road'))).toBe(true);
  });

  test('the travel screen carries a full status report', () => {
    const s = departed();
    const screen = view(s);
    expect(screen.status).not.toBeNull();
    expect(screen.status!.date).toBe('June 1');
    expect(screen.status!.nextStop).toBe('Deming');
    expect(screen.status!.crew).toHaveLength(5);
    expect(screen.choices.some((c) => c.label.toLowerCase().includes('drive'))).toBe(true);
  });

  test('the status bar reports the van as a whole number', () => {
    const s = driveUntil(departed(), (x) => x.phase === 'travel' && x.day >= 2);
    const status = view(s).status!;
    expect(Number.isInteger(s.van.condition) || !`${status.van}`.includes('.')).toBe(true);
    expect(Number.isInteger(status.van)).toBe(true);
  });

  test('standing in a town, NEXT points at the town ahead', () => {
    const s = driveUntil(departed(), (x) => x.phase === 'stop');
    const status = view(s).status!;
    expect(s.atStopIndex).toBe(1); // Deming
    expect(status.nextStop).toBe('Lordsburg');
    expect(status.nextStopMiles).toBe(60);
  });

  test('parked days never roll a storm: rest and snack weather is heat only', () => {
    for (let i = 0; i < 60; i++) {
      const rested = reduce(departed(`park-${i}`, 3), { type: 'REST' });
      expect(rested.weatherToday?.event).toBe('none');
      expect(rested.weatherToday?.label).not.toBe('dust storm');
    }
  });

  test('the epitaph screen asks for input', () => {
    let s = departed();
    s = structuredClone(s);
    for (const m of s.crew) m.health = 1;
    s.supplies.water = 0;
    const out = reduce(s, { type: 'DRIVE' });
    expect(view(out).input?.kind).toBe('epitaph');
  });
});

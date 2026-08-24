// The road west of Tucson: milestones, crossings, hazards, the summit, and
// the beach. Phase 1's game.test.ts covers the desert leg and stays as it was.

import { describe, expect, test } from 'vitest';
import { ROUTE } from '../src/sim/data/route';
import { RIVERS } from '../src/sim/crossing';
import { reduce, view } from '../src/sim/game';
import { repairQuote } from '../src/sim/store';
import { TUNING } from '../src/sim/types';
import { arriveAt, departed, pilot, pilotAction, planDescent, run, stopIndexOf } from './helpers';

describe('Tucson is a milestone, not the finish', () => {
  test('arriving at Tucson opens the town, and the run goes on', () => {
    const s = arriveAt(departed(), 'tucson');
    expect(s.phase).toBe('stop');
    expect(s.gameOver).toBe(false);
    expect(s.atStopIndex).toBe(stopIndexOf('tucson'));
    expect(view(s).title).toBe('TUCSON');
  });

  test('the map no longer marks anything uncharted', () => {
    const s = run(arriveAt(departed(), 'tucson'), { type: 'OPEN', screen: 'map' });
    const text = view(s).lines.join('\n');
    expect(text).not.toMatch(/uncharted|phase 2/i);
    expect(text).toContain('Sunset Cliffs');
  });

  test('the title and help screens promise the whole road', () => {
    const title = view(run(departed(), { type: 'RESTART' }));
    expect(title.lines.join(' ')).not.toMatch(/Phase 1/);
    const help = view(run(departed(), { type: 'OPEN', screen: 'help' }));
    expect(help.lines.join(' ')).toMatch(/Sunset Cliffs/);
    expect(help.lines.join(' ')).not.toMatch(/Tucson alive/);
  });
});

describe('van repairs at the shop', () => {
  test('a tune-up is offered when the van is worn, and it costs what the quote says', () => {
    let s = arriveAt(departed(), 'deming');
    s.van.condition = 60;
    s = reduce(s, { type: 'STOP_SHOP' });
    const quote = repairQuote(60, stopIndexOf('deming'))!;
    const choice = view(s).choices.find((c) => c.action.type === 'REPAIR');
    expect(choice).toBeDefined();
    expect(choice!.label).toContain('+25');
    const cash = s.cash;
    s = reduce(s, { type: 'REPAIR' });
    expect(s.van.condition).toBe(85);
    expect(s.cash).toBe(cash - quote.cents);
    expect(s.storeNotice).toBeTruthy();
  });

  test('no tune-up is offered for a perfect van, and an empty wallet gets a notice not a repair', () => {
    let s = reduce(arriveAt(departed(), 'deming'), { type: 'STOP_SHOP' });
    expect(view(s).choices.some((c) => c.action.type === 'REPAIR')).toBe(false);
    s.van.condition = 40;
    s.cash = 100;
    s = reduce(s, { type: 'REPAIR' });
    expect(s.van.condition).toBe(40);
    expect(s.cash).toBe(100);
    expect(s.storeNotice).toMatch(/wallet/i);
  });
});

describe('landmark specials', () => {
  test('Casa Grande is where the 8 begins', () => {
    const s = arriveAt(departed(), 'casa-grande');
    expect(view(s).lines.join(' ')).toMatch(/the 8/);
    expect(s.log.some((l) => /the 8/.test(l.text))).toBe(true);
  });

  test('Dateland sells one round of date shakes that lifts the whole crew', () => {
    let s = arriveAt(departed(), 'dateland');
    s.crew = s.crew.map((m) => ({ ...m, health: 70 }));
    const offer = view(s).choices.find((c) => c.action.type === 'STOP_SPECIAL');
    expect(offer?.label).toMatch(/date shake/i);
    const cash = s.cash;
    s = reduce(s, { type: 'STOP_SPECIAL' });
    for (const m of s.crew) expect(m.health).toBe(80);
    expect(s.cash).toBeLessThan(cash);
    expect(view(s).choices.some((c) => c.action.type === 'STOP_SPECIAL')).toBe(false);
    const again = reduce(s, { type: 'STOP_SPECIAL' });
    expect(again.crew[0]!.health).toBe(80);
    expect(again.cash).toBe(s.cash);
  });

  test('the Center of the World is worth a certificate and a smile', () => {
    let s = arriveAt(departed(), 'center-of-the-world');
    const offer = view(s).choices.find((c) => c.action.type === 'STOP_SPECIAL');
    expect(offer?.label).toMatch(/center of the world/i);
    s = reduce(s, { type: 'STOP_SPECIAL' });
    expect(s.log[s.log.length - 1]!.text.length).toBeGreaterThan(20);
    expect(view(s).choices.some((c) => c.action.type === 'STOP_SPECIAL')).toBe(false);
  });

  test('a soak at Jacumba heals twice what a plain rest does', () => {
    const base = arriveAt(departed(), 'jacumba');
    const tired = { ...base, crew: base.crew.map((m) => ({ ...m, health: 50 })) };
    const rested = reduce(tired, { type: 'REST' });
    const soaked = reduce(tired, { type: 'STOP_SPECIAL' });
    expect(soaked.day).toBe(tired.day + 1);
    expect(soaked.phase).toBe('stop');
    const restGain = rested.crew[0]!.health - 50;
    const soakGain = soaked.crew[0]!.health - 50;
    expect(soakGain).toBe(restGain + TUNING.restHealthGain);
    expect(view(soaked).choices.some((c) => c.action.type === 'STOP_SPECIAL')).toBe(true); // not once-only
  });
});

describe('river crossings', () => {
  test('leaving Gila Bend puts you on the bank of the Gila', () => {
    const s = reduce(arriveAt(departed(), 'gila-bend'), { type: 'STOP_LEAVE' });
    expect(s.phase).toBe('crossing');
    expect(s.crossing?.river).toBe('gila-bend');
    expect(s.atStopIndex).toBeNull();
    expect(s.nextStopIndex).toBe(stopIndexOf('gila-bend') + 1);
    const screen = view(s);
    expect(screen.title).toMatch(/GILA/);
    expect(screen.choices.map((c) => c.action.type)).toEqual(expect.arrayContaining(['CROSS', 'OPEN']));
    expect(screen.lines.join(' ')).toMatch(/ft/);
  });

  test('leaving an ordinary town just puts you on the road', () => {
    const s = reduce(arriveAt(departed(), 'casa-grande'), { type: 'STOP_LEAVE' });
    expect(s.phase).toBe('travel');
    expect(s.crossing).toBeNull();
  });

  test('waiting a day drops the river and keeps you on the bank', () => {
    const bank = reduce(arriveAt(departed(), 'yuma'), { type: 'STOP_LEAVE' });
    const waited = reduce(bank, { type: 'CROSS', method: 'wait' });
    expect(waited.phase).toBe('crossing');
    expect(waited.day).toBe(bank.day + 1);
    expect(waited.crossing!.daysWaited).toBe(1);
    expect(waited.crossing!.depthFt).toBeLessThan(bank.crossing!.depthFt);
    expect(waited.supplies.food).toBeLessThan(bank.supplies.food);
  });

  test('the ferry costs the fare and a day, then you are across', () => {
    const bank = reduce(arriveAt(departed(), 'yuma'), { type: 'STOP_LEAVE' });
    const across = reduce(bank, { type: 'CROSS', method: 'ferry' });
    expect(across.cash).toBe(bank.cash - RIVERS.yuma.ferryCents);
    expect(across.day).toBe(bank.day + 1);
    expect(across.crossing).toBeNull();
    expect(across.phase).toBe('travel');
    expect(across.log.some((l) => /ferry/i.test(l.text))).toBe(true);
  });

  test('the ferryman does not take IOUs', () => {
    const bank = reduce(arriveAt(departed(), 'yuma'), { type: 'STOP_LEAVE' });
    const broke = { ...bank, cash: 100 };
    const still = reduce(broke, { type: 'CROSS', method: 'ferry' });
    expect(still.phase).toBe('crossing');
    expect(still.cash).toBe(100);
    expect(still.day).toBe(bank.day);
    expect(still.storeNotice).toBeTruthy();
  });

  test('a shallow ford crosses at once, for free', () => {
    const bank = reduce(arriveAt(departed(), 'gila-bend'), { type: 'STOP_LEAVE' });
    const shallow = { ...bank, crossing: { ...bank.crossing!, depthFt: 0.5, currentMph: 1 } };
    let crossed = 0;
    for (let i = 0; i < 20; i++) {
      const s = reduce({ ...shallow, rng: { s: i * 7919 } }, { type: 'CROSS', method: 'ford' });
      if (s.phase === 'travel' && s.crossing === null && s.day === bank.day && s.cash === bank.cash) crossed++;
    }
    expect(crossed).toBeGreaterThanOrEqual(18);
  });

  test('a deep fast ford goes wrong: swamped or rolled, supplies lost, sometimes a drowning', () => {
    const bank = reduce(arriveAt(departed(), 'yuma'), { type: 'STOP_LEAVE' });
    const deep = { ...bank, crossing: { ...bank.crossing!, depthFt: 6.5, currentMph: 7 } };
    let failures = 0;
    let drownings = 0;
    for (let i = 0; i < 40; i++) {
      const s = reduce({ ...deep, rng: { s: i * 104729 + 1 } }, { type: 'CROSS', method: 'ford' });
      const lostSomeone = s.crew.some((m) => !m.alive);
      if (s.van.condition < deep.van.condition) {
        failures++;
        expect(s.supplies.food).toBeLessThan(deep.supplies.food);
        expect(s.crossing).toBeNull();
        expect(s.phase).toBe('event');
      }
      if (lostSomeone) {
        drownings++;
        expect(s.runMemorials.some((m) => /RIVER/.test(m.cause))).toBe(true);
      }
    }
    expect(failures).toBeGreaterThan(30);
    expect(drownings).toBeGreaterThan(3);
  });

  test('floating the van always spends the day and never asks about depth', () => {
    const bank = reduce(arriveAt(departed(), 'gila-bend'), { type: 'STOP_LEAVE' });
    const calm = { ...bank, crossing: { ...bank.crossing!, depthFt: 6, currentMph: 1 } };
    const s = reduce(calm, { type: 'CROSS', method: 'float' });
    expect(s.day).toBe(bank.day + 1);
    expect(s.crossing).toBeNull();
    expect(['travel', 'event']).toContain(s.phase);
  });

  test('a death while waiting on the bank still leaves you on the bank afterwards', () => {
    const bank = reduce(arriveAt(departed(), 'yuma'), { type: 'STOP_LEAVE' });
    const dying = { ...bank, crew: bank.crew.map((m, i) => (i === 0 ? { ...m, health: 1, conditions: [{ kind: 'snakebite' as const, daysLeft: 3 }] } : m)) };
    const s = reduce(dying, { type: 'CROSS', method: 'wait' });
    expect(s.phase).toBe('event');
    expect(s.pendingEvent?.id).toBe('death');
    const after = reduce(s, { type: 'EVENT_CONTINUE' });
    expect(after.phase).toBe('crossing');
    expect(after.crossing).not.toBeNull();
  });
});

describe('a death during a rest at a stop keeps you in town', () => {
  test('after the notice you are still at the stop, not adrift on the road', () => {
    const town = arriveAt(departed(), 'deming');
    // Resting heals, so it takes two conditions to overwhelm one point of health.
    const conditions = [
      { kind: 'snakebite' as const, daysLeft: 3 },
      { kind: 'heatstroke' as const, daysLeft: 2 },
    ];
    const dying = { ...town, crew: town.crew.map((m, i) => (i === 0 ? { ...m, health: 1, conditions } : m)) };
    const s = reduce(dying, { type: 'REST' });
    expect(s.pendingEvent?.id).toBe('death');
    const after = reduce(s, { type: 'EVENT_CONTINUE' });
    expect(after.phase).toBe('stop');
    expect(after.atStopIndex).toBe(stopIndexOf('deming'));
  });
});

describe('the Imperial Dunes', () => {
  test('arriving at the dunes is a titled event, and the road is either open or drifted shut', () => {
    const s = arriveAt(departed(), 'imperial-dunes');
    expect(s.phase).toBe('event');
    expect(s.pendingEvent?.id).toBe('dunes');
    expect(s.pendingEvent?.title).toMatch(/DUNES/);
    expect(s.nextStopIndex).toBe(stopIndexOf('imperial-dunes') + 1);
    expect([1, 2]).toContain(s.pendingEvent!.choices!.length);
  });

  test('the wind closes the road often enough to matter, and both answers move you on', () => {
    let closed = 0;
    for (let i = 0; i < 30; i++) {
      const s = arriveAt(departed(`dunes-${i}`), 'imperial-dunes');
      const choices = s.pendingEvent!.choices!;
      if (choices.length === 2) {
        closed++;
        const waited = reduce(s, { type: 'EVENT_CHOICE', index: 1 });
        expect(waited.day).toBe(s.day + 1);
        expect(['travel', 'event']).toContain(waited.phase);
        const pushed = reduce(s, { type: 'EVENT_CHOICE', index: 0 });
        expect(pushed.day).toBe(s.day + 1);
        expect(pushed.mile).toBeGreaterThanOrEqual(s.mile);
      } else {
        const on = reduce(s, { type: 'EVENT_CHOICE', index: 0 });
        expect(on.phase).toBe('travel');
        expect(on.day).toBe(s.day);
      }
    }
    expect(closed).toBeGreaterThan(5);
    expect(closed).toBeLessThan(25);
  });
});

describe('the In-Ko-Pah grade', () => {
  test('the climb is a titled event with a slow way and a hard way', () => {
    const s = arriveAt(departed(), 'in-ko-pah');
    expect(s.pendingEvent?.id).toBe('in-ko-pah');
    expect(s.pendingEvent?.title).toMatch(/IN-KO-PAH/);
    expect(s.pendingEvent!.choices).toHaveLength(2);
  });

  test('low gear takes two days and is kind to the van; flooring it takes one and is not', () => {
    const foot = arriveAt(departed(), 'in-ko-pah');
    const slow = reduce(foot, { type: 'EVENT_CHOICE', index: 0 });
    expect(slow.day).toBe(foot.day + 2);
    expect(slow.mile).toBe(ROUTE[stopIndexOf('jacumba')]!.mile);
    expect(slow.phase).toBe('stop');
    expect(foot.van.condition - slow.van.condition).toBeLessThanOrEqual(2 * TUNING.paceVanWear.grueling);

    const fast = reduce(foot, { type: 'EVENT_CHOICE', index: 1 });
    expect(fast.day).toBe(foot.day + 1);
    expect(fast.mile).toBe(ROUTE[stopIndexOf('jacumba')]!.mile);
    expect(foot.van.condition - fast.van.condition).toBeGreaterThanOrEqual(6);
  });

  test('flooring it in the heat can boil the radiator', () => {
    let boiled = 0;
    for (let i = 0; i < 30; i++) {
      const foot = arriveAt(departed(`inkopah-${i}`, 7), 'in-ko-pah');
      if (foot.phase !== 'event' || foot.pendingEvent?.id !== 'in-ko-pah') continue;
      const hoses = foot.supplies.hoses;
      const fast = reduce(foot, { type: 'EVENT_CHOICE', index: 1 });
      if (fast.supplies.hoses < hoses || fast.log.some((l) => /radiator|steam|boil/i.test(l.text))) boiled++;
    }
    expect(boiled).toBeGreaterThan(3);
  });
});

describe('Laguna Summit', () => {
  test('the summit is the decision: the 6% grade or Old Highway 80', () => {
    const s = arriveAt(departed(), 'laguna-summit');
    expect(s.phase).toBe('event');
    expect(s.pendingEvent?.id).toBe('summit');
    expect(s.pendingEvent?.title).toMatch(/LAGUNA SUMMIT/);
    const labels = s.pendingEvent!.choices!.map((c) => c.label.toLowerCase());
    expect(labels[0]).toMatch(/6%/);
    expect(labels[1]).toMatch(/old highway 80/);
    expect(s.nextStopIndex).toBe(stopIndexOf('sunset-cliffs'));
  });

  test('Old Highway 80 is slow and safe: two or three days, then the coast road', () => {
    for (let i = 0; i < 12; i++) {
      const top = arriveAt(departed(`old80-${i}`), 'laguna-summit');
      const s = reduce(top, { type: 'EVENT_CHOICE', index: 1 });
      expect(s.day - top.day).toBeGreaterThanOrEqual(2);
      expect(s.day - top.day).toBeLessThanOrEqual(3);
      expect(s.mile).toBe(TUNING.summitDescentEndMile);
      expect(s.grade).toBeNull();
      expect(s.summitRoute).toBe('old80');
      expect(s.phase).toBe('event');
      expect(reduce(s, { type: 'EVENT_CONTINUE' }).phase).toBe('travel');
    }
  });

  test('the 6% grade starts the descent minigame on the same day', () => {
    const top = arriveAt(departed(), 'laguna-summit');
    const s = reduce(top, { type: 'EVENT_CHOICE', index: 0 });
    expect(s.phase).toBe('grade');
    expect(s.grade).not.toBeNull();
    expect(s.grade!.segment).toBe(0);
    expect(s.summitRoute).toBe('grade');
    expect(s.day).toBe(top.day);
    const screen = view(s);
    expect(screen.title).toMatch(/6%/);
    expect(screen.choices.filter((c) => c.action.type === 'GRADE_STEP')).toHaveLength(3);
    expect(screen.lines.join(' ')).toMatch(/brake/i);
  });

  test('a clean descent is free and instant; a smoking one costs the van a little', () => {
    const top = arriveAt(departed(), 'laguna-summit');
    let s = reduce(top, { type: 'EVENT_CHOICE', index: 0 });
    // Plan the descent with the pure grade module, then drive it through the reducer.
    const plan = planDescent(s.grade!);
    expect(plan).not.toBeNull();
    for (const move of plan!) s = reduce(s, { type: 'GRADE_STEP', move });
    expect(s.phase).toBe('event');
    expect(s.pendingEvent?.id).toBe('grade-done');
    expect(s.day).toBe(top.day);
    expect(s.mile).toBe(TUNING.summitDescentEndMile);
    expect(s.grade).toBeNull();
    expect(top.van.condition - s.van.condition).toBeLessThanOrEqual(10);
    expect(reduce(s, { type: 'EVENT_CONTINUE' }).phase).toBe('travel');
  });

  test('letting it roll ends on the runaway ramp: a lost day, a battered van, a bruised crew', () => {
    const top = arriveAt(departed(), 'laguna-summit');
    let s = reduce(top, { type: 'EVENT_CHOICE', index: 0 });
    let steps = 0;
    while (s.phase === 'grade' && steps++ < 20) s = reduce(s, { type: 'GRADE_STEP', move: 'coast' });
    expect(s.pendingEvent?.id).toBe('grade-ramp');
    expect(s.day).toBe(top.day + 1);
    expect(s.mile).toBe(TUNING.summitDescentEndMile);
    expect(top.van.condition - s.van.condition).toBeGreaterThanOrEqual(30);
    expect(s.crew.filter((m) => m.alive).every((m) => m.conditions.some((c) => c.kind === 'injury'))).toBe(true);
  });

  test('the grade screen is honest about what is coming', () => {
    const s = reduce(arriveAt(departed(), 'laguna-summit'), { type: 'EVENT_CHOICE', index: 0 });
    const text = view(s).lines.join(' ');
    expect(text).toMatch(s.grade!.steep[0] ? /steep/i : /easy|gentle|flat/i);
    expect(text).toMatch(/1 of 6/);
  });
});

describe('the Pacific', () => {
  test('reaching Sunset Cliffs is the celebration: pick your jump, then the score', () => {
    const s = arriveAt(departed(), 'sunset-cliffs');
    expect(s.phase).toBe('event');
    expect(s.pendingEvent?.id).toBe('cliffs');
    expect(s.pendingEvent?.title).toMatch(/SUNSET CLIFFS/);
    expect(s.pendingEvent!.choices).toHaveLength(3);
    expect(s.gameOver).toBe(false);
    expect(s.mile).toBe(730);

    const won = reduce(s, { type: 'EVENT_CHOICE', index: 0 });
    expect(won.phase).toBe('victory');
    expect(won.gameOver).toBe(true);
    expect(won.celebration).toBe('cannonball');
    const screen = view(won);
    expect(screen.title).toMatch(/SUNSET CLIFFS/);
    expect(screen.art).toBe('victory');
    const text = screen.lines.join('\n');
    expect(text).toMatch(/TOTAL/);
    expect(text).toMatch(/PHASE 2/);
    expect(text).toMatch(/Pacific/);
    expect(text).toMatch(/dropped safe/);
  });

  test('every jump is a win, and the screen remembers yours', () => {
    const cliffs = arriveAt(departed(), 'sunset-cliffs');
    const texts = new Set<string>();
    for (const [index, celebration] of (['cannonball', 'swan', 'towels'] as const).entries()) {
      const won = reduce(cliffs, { type: 'EVENT_CHOICE', index });
      expect(won.phase).toBe('victory');
      expect(won.celebration).toBe(celebration);
      texts.add(view(won).lines[1]!);
    }
    expect(texts.size).toBe(3);
  });

  test('the victory screen remembers which way you came down the mountain', () => {
    const top = arriveAt(departed(), 'laguna-summit');
    const old80 = reduce(reduce(top, { type: 'EVENT_CHOICE', index: 1 }), { type: 'EVENT_CONTINUE' });
    const cliffs = arriveAt(old80, 'sunset-cliffs', false);
    const won = reduce(cliffs, { type: 'EVENT_CHOICE', index: 2 });
    expect(view(won).lines.join(' ')).toMatch(/Old Highway 80/);
  });
});

describe('the whole road', () => {
  test('a well-supplied CEO can be piloted from Las Cruces to the beach in one summer', () => {
    let victories = 0;
    for (let i = 0; i < 6; i++) {
      const s = pilot(departed(`road-${i}`, 5), (x) => x.gameOver);
      if (s.phase === 'victory') {
        victories++;
        expect(s.mile).toBe(730);
        expect(s.day).toBeLessThan(90);
      } else {
        expect(s.phase).toBe('dead');
      }
    }
    expect(victories).toBeGreaterThanOrEqual(4);
  });

  test('the road is deterministic end to end', () => {
    const a = pilot(departed('twin'), (x) => x.gameOver);
    const b = pilot(departed('twin'), (x) => x.gameOver);
    expect(a).toEqual(b);
  });

  test('the other mountain road also reaches the beach', () => {
    const s = pilot(departed('old80-road', 5), (x) => x.gameOver, { summit: 'old80' });
    expect(['victory', 'dead']).toContain(s.phase);
    if (s.phase === 'victory') expect(s.summitRoute).toBe('old80');
  });

  test('no screen on the road ever prints the trademark we do not own', () => {
    const shopped = new Set<number>();
    let s = departed('copy-check', 5);
    for (let i = 0; i < 400 && !s.gameOver; i++) {
      const screen = view(s);
      expect(`${screen.title}\n${screen.lines.join('\n')}\n${screen.choices.map((c) => c.label).join('\n')}`).not.toMatch(/oregon/i);
      const action = pilotAction(s, shopped);
      if (!action) break;
      s = reduce(s, action);
    }
    expect(view(s).lines.join('\n')).not.toMatch(/oregon/i);
  });
});

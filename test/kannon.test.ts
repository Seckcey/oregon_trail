// Kannon rides with the crew and lives with Type 1 diabetes. These tests
// pin the rules that make that respectful: he's always offered, the Dexcom
// alert is a lesson and not a punishment, and T1D never kills him.

import { describe, expect, test } from 'vitest';
import { CREW_NAME_POOL } from '../src/sim/data/text';
import { POOL_EVENTS } from '../src/sim/events';
import { createGame, reduce, view } from '../src/sim/game';
import { isKannon, KANNON, T1D_LINKS } from '../src/sim/t1d';
import type { GameState } from '../src/sim/types';
import { ALL_SLOTS } from '../src/ui/assets';
import { assignBalloons } from '../src/ui/comic/balloons';
import { castMember } from '../src/ui/comic/cast';
import { eventStripFor } from '../src/ui/comic/layout';
import { departed, departedWith, pilot, run } from './helpers';

const WITH_KANNON = ['Wes', 'Kannon', 'Dot', 'Sol', 'Piper'];
const ALERT = /Kannon’s phone buzzes/;

function kannonIndex(s: GameState): number {
  return s.crew.findIndex(isKannon);
}

/** Drive a Kannon crew until the Dexcom alert is on screen, or give up. */
function untilDexcom(seed: string): GameState | null {
  const s = pilot(departedWith(WITH_KANNON, seed, 5), (x) => x.pendingEvent?.id === 'dexcom-low' || x.gameOver);
  return s.pendingEvent?.id === 'dexcom-low' ? s : null;
}

function firstDexcom(): GameState {
  for (let i = 0; i < 40; i++) {
    const found = untilDexcom(`dexcom-${i}`);
    if (found) return found;
  }
  throw new Error('no seed produced the Dexcom alert');
}

describe('Kannon on the crew', () => {
  test('rides in the name pool where Sky used to', () => {
    expect(CREW_NAME_POOL).toContain(KANNON);
    expect(CREW_NAME_POOL).not.toContain('Sky');
  });

  test('every new game suggests Kannon among the five names', () => {
    for (let i = 0; i < 40; i++) {
      const names = createGame(`seed-${i}`).suggestedNames;
      expect(names).toHaveLength(5);
      expect(new Set(names).size).toBe(5);
      expect(names).toContain(KANNON);
    }
  });

  test('is recognised by name, whatever the capitalisation', () => {
    expect(isKannon({ name: 'kannon', health: 100, alive: true, conditions: [] })).toBe(true);
    expect(isKannon({ name: ' KANNON ', health: 100, alive: true, conditions: [] })).toBe(true);
    expect(isKannon({ name: 'Kit', health: 100, alive: true, conditions: [] })).toBe(false);
  });

  test('the comic casts him in slot seven', () => {
    expect(castMember(7).name).toBe('Kannon');
  });

  test('the status bar marks him with the blue circle', () => {
    const status = view(departedWith(WITH_KANNON)).status!;
    expect(status.crew.find((m) => m.name === 'Kannon')?.badge).toBe('t1d');
    expect(status.crew.filter((m) => m.badge === null)).toHaveLength(4);
  });
});

describe('the Dexcom alert', () => {
  test('fires at most once a run, and never without Kannon aboard', () => {
    let fired = 0;
    for (const seed of ['k1', 'k2', 'k3', 'k4', 'k5']) {
      const s = pilot(departedWith(WITH_KANNON, seed, 5), (x) => x.gameOver);
      const alerts = s.log.filter((l) => ALERT.test(l.text)).length;
      expect(alerts).toBeLessThanOrEqual(1);
      fired += alerts;
    }
    expect(fired).toBeGreaterThan(0);
    for (const seed of ['n1', 'n2', 'n3']) {
      const s = pilot(departed(seed, 5), (x) => x.gameOver);
      expect(s.log.some((l) => ALERT.test(l.text))).toBe(false);
    }
  });

  test('is a choice between pulling over and rolling on', () => {
    const s = firstDexcom();
    expect(s.pendingEvent!.choices).toHaveLength(2);
    expect(s.pendingEvent!.text.join(' ')).toMatch(/Type 1/);
  });

  test('pulling over spends the day, teaches the rule of 15, and Kannon is fine', () => {
    let taught = false;
    for (let i = 0; i < 40 && !taught; i++) {
      const base = untilDexcom(`dexcom-${i}`);
      if (!base) continue;
      const k = kannonIndex(base);
      const a = reduce(base, { type: 'EVENT_CHOICE', index: 0 });
      expect(a.day).toBe(base.day + 1);
      expect(a.crew[k]!.alive).toBe(true);
      expect(a.crew[k]!.health).toBeGreaterThanOrEqual(base.crew[k]!.health - 2);
      if (a.phase === 'event' && a.pendingEvent?.id === 'dexcom-15') {
        taught = true;
        expect(a.pendingEvent.text.join(' ')).toMatch(/fifteen grams/i);
        expect(a.pendingEvent.text.join(' ')).toContain(T1D_LINKS.ada);
        expect(a.pendingEvent.text.join(' ')).toContain(T1D_LINKS.breakthrough);
      }
    }
    expect(taught).toBe(true);
  });

  test('rolling on costs Kannon health and the crew more road — but can never kill him', () => {
    const base = structuredClone(firstDexcom());
    const k = kannonIndex(base);
    base.crew[k] = { ...base.crew[k]!, health: 1, conditions: [] };
    base.supplies = { ...base.supplies, food: 200, water: 40, fuel: 40 };
    base.pace = 'steady';
    base.rations = 'filling';
    const late = reduce(base, { type: 'EVENT_CHOICE', index: 1 });
    expect(late.day).toBe(base.day + 1);
    expect(late.crew[k]!.alive).toBe(true);
    expect(late.crew[k]!.health).toBeGreaterThanOrEqual(1);
    expect(late.log.some((l) => /shaky/.test(l.text))).toBe(true);

    const healthy = structuredClone(firstDexcom());
    healthy.crew[k] = { ...healthy.crew[k]!, health: 60, conditions: [] };
    healthy.supplies = { ...healthy.supplies, food: 200, water: 40, fuel: 40 };
    const cost = reduce(healthy, { type: 'EVENT_CHOICE', index: 1 });
    expect(cost.crew[k]!.health).toBeLessThan(60);
  });

  test('in the comic, "keep rolling" is Kannon’s line and "pull over" is someone else’s', () => {
    const { balloons } = assignBalloons(view(firstDexcom()));
    expect(balloons).toHaveLength(2);
    expect(balloons[0]!.speaker).not.toBe('Kannon');
    expect(balloons[1]!.speaker).toBe('Kannon');
  });

  test('has an art slot in the comic strip list', () => {
    expect(eventStripFor('dexcom-low')).toBe('dexcom');
    expect(eventStripFor('dexcom-15')).toBe('dexcom');
    expect(eventStripFor('dexcom-late')).toBe('dexcom');
    expect(ALL_SLOTS).toContain('events/dexcom');
  });
});

describe('the small stuff', () => {
  test('the insulin goes in the cooler on scorching days, once, only with Kannon aboard', () => {
    const ev = POOL_EVENTS.find((e) => e.id === 'insulin-cooler')!;
    expect(ev.once).toBe(true);
    const hot = structuredClone(departedWith(WITH_KANNON));
    hot.weatherToday = { label: 'scorching', heat: 3, event: 'none' };
    expect(ev.when(hot)).toBe(true);
    expect(ev.fire(hot).join(' ')).toMatch(/insulin/i);
    const warm = structuredClone(hot);
    warm.weatherToday = { label: 'hot', heat: 2, event: 'none' };
    expect(ev.when(warm)).toBe(false);
    const nobody = structuredClone(departed());
    nobody.weatherToday = { label: 'scorching', heat: 3, event: 'none' };
    expect(ev.when(nobody)).toBe(false);
  });

  test('the snack run counts carbs when Kannon is aboard', () => {
    let s = pilot(departedWith(WITH_KANNON), (x) => x.phase === 'travel' && x.mile > 0);
    s = reduce(s, { type: 'SNACK_START' });
    for (let i = 0; i < 3; i++) {
      const word = s.snack!.words[s.snack!.round]!;
      s = reduce(s, { type: 'SNACK_SUBMIT', typed: word, ms: 700 });
    }
    expect(s.phase).toBe('event');
    expect(s.pendingEvent!.text.join(' ')).toMatch(/carb counting/i);
  });

  test('the About page names both organizations', () => {
    const about = run(createGame('about'), { type: 'OPEN', screen: 'about' });
    const text = view(about).lines.join(' ');
    expect(text).toContain(T1D_LINKS.ada);
    expect(text).toContain(T1D_LINKS.breakthrough);
    expect(text).toMatch(/Type 1 diabetes/);
  });
});

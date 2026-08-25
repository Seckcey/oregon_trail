// Phase 4A in the sim: the words on the screens (docs/PHASE4-PLAN.md §6), the
// report Screen, and the CTA line. Data in, data out — the sim never fetches.
import { describe, expect, test } from 'vitest';
import { createGame, reduce, view } from '../src/sim/game';
import { sceneOf } from '../src/sim/scene';
import type { GameState, Memorial } from '../src/sim/types';
import { departed, run } from './helpers';

const CTA = 'Presented by 8 West IT 365 — the company named for the highway. 8westit.com';

function driveUntil(state: GameState, done: (s: GameState) => boolean, maxSteps = 400): GameState {
  let s = state;
  for (let i = 0; i < maxSteps; i++) {
    if (done(s)) return s;
    if (s.phase === 'event') s = reduce(s, s.pendingEvent?.choices ? { type: 'EVENT_CHOICE', index: 0 } : { type: 'EVENT_CONTINUE' });
    else if (s.phase === 'stop') s = reduce(s, { type: 'STOP_LEAVE' });
    else if (s.phase === 'travel') s = reduce(s, { type: 'DRIVE' });
    else return s;
  }
  return s;
}

function dead(): GameState {
  let s = structuredClone(departed());
  for (const m of s.crew) m.health = 1;
  s.supplies.water = 0;
  s = reduce(s, { type: 'DRIVE' });
  return reduce(s, { type: 'SUBMIT_EPITAPH', text: 'WE NEVER SAW THE BEACH' });
}

/** A run that has just passed `grave` on the road. */
function passed(grave: Memorial, seed = 'report-seed'): GameState {
  let s = createGame(seed, [grave]);
  s = run(s, { type: 'START_NEW' }, { type: 'CHOOSE_OCCUPATION', occupation: 'ceo' }, { type: 'CHOOSE_MONTH', month: 6 });
  for (let i = 0; i < 5; i++) s = reduce(s, { type: 'SUBMIT_NAME', name: '' });
  s = run(s, { type: 'BUY', item: 'food', units: 8 }, { type: 'BUY', item: 'water', units: 8 }, { type: 'BUY', item: 'fuel', units: 35 }, { type: 'LEAVE_STORE' });
  return driveUntil(s, (x) => x.mile >= grave.mile && x.phase === 'travel');
}

const remote: Memorial = { id: 'SRV1', names: ['OLD TIMER'], mile: 25, day: 3, cause: 'THIRST', epitaph: 'DUST TO DUST' };
const local: Memorial = { names: ['OLD TIMER'], mile: 25, day: 3, cause: 'THIRST', epitaph: 'DUST TO DUST' };

describe('the words on the screens', () => {
  test('the naming screen says nicknames ride on the road', () => {
    const s = run(createGame('x'), { type: 'START_NEW' }, { type: 'CHOOSE_OCCUPATION', occupation: 'ceo' }, { type: 'CHOOSE_MONTH', month: 5 });
    expect(view(s).lines).toContain('Nicknames, please — these ride on the road for other players to see.');
  });

  test('the epitaph screen says other crews will read it', () => {
    let s = structuredClone(departed());
    for (const m of s.crew) m.health = 1;
    s.supplies.water = 0;
    s = reduce(s, { type: 'DRIVE' });
    expect(s.phase).toBe('epitaph');
    expect(view(s).lines).toContain('Other crews will read this. Keep it clean, keep it yours, no phone numbers.');
  });

  test('the dead screen keeps the old line until the road takes the memorial, then says where it stands', () => {
    const s = dead();
    expect(view(s).lines).toContain('The memorial will stand by the road for the next crew to pass.');
    const posted = reduce(s, { type: 'MEMORIAL_POSTED', id: 'SRV', mile: s.mile });
    expect(view(posted).lines).toContain(`Your memorial stands at mile ${s.mile}. The next crew through will pass it.`);
    expect(view(posted).lines).not.toContain('The memorial will stand by the road for the next crew to pass.');
  });

  test('MEMORIAL_POSTED is ignored anywhere but the dead screen', () => {
    const s = reduce(departed(), { type: 'MEMORIAL_POSTED', id: 'SRV', mile: 1 });
    expect(s.memorialPosted).toBeNull();
  });

  test('MEMORIALS_LOADED replaces the road’s memorials and nothing else', () => {
    const before = departed();
    const after = reduce(structuredClone(before), { type: 'MEMORIALS_LOADED', memorials: [remote] });
    expect(after.memorials).toEqual([remote]);
    expect({ ...after, memorials: before.memorials }).toEqual(before);
  });

  test('the CTA line closes both endings, and nothing on any screen says the other game’s name', () => {
    expect(view(dead()).lines.at(-1)).toBe(CTA);
    const cliffs = { ...departed(), phase: 'victory' as const, celebration: 'swan' as const, summitRoute: 'grade' as const };
    expect(view(cliffs).lines.at(-1)).toBe(CTA);
  });
});

describe('reporting a memorial from the road', () => {
  test('the day a posted memorial is passed, the travel screen offers to report it; a local one is not reportable', () => {
    const s = passed(remote);
    expect(s.log.map((l) => l.text).join(' ')).toContain('DUST TO DUST');
    const choice = view(s).choices.find((c) => /report/i.test(c.label));
    expect(choice).toBeDefined();
    expect(choice!.action).toEqual({ type: 'OPEN', screen: 'report' });
    expect(choice!.label).toBe('Report that memorial');
    const next = reduce(s, { type: 'DRIVE' });
    expect(view(driveUntil(next, (x) => x.phase === 'travel')).choices.some((c) => /report/i.test(c.label))).toBe(false);
    expect(view(passed(local)).choices.some((c) => /report/i.test(c.label))).toBe(false);
  });

  test('the report Screen asks why, in the plan’s words, with four reasons and a way back', () => {
    const s = reduce(passed(remote), { type: 'OPEN', screen: 'report' });
    expect(s.phase).toBe('report');
    expect(sceneOf(s).kind).toBe('menu');
    const screen = view(s);
    expect(screen.title).toBe('REPORT A MEMORIAL');
    expect(screen.lines).toContain('Why should this come down?');
    expect(screen.lines.join(' ')).toContain('DUST TO DUST');
    expect(screen.choices.map((c) => `${c.key}) ${c.label}`)).toEqual(['1) Rude', '2) Someone’s real name', '3) Spam', '4) Something else', '0) Back']);
    expect(screen.choices[0]!.action).toEqual({ type: 'REPORT_MEMORIAL', id: 'SRV1', reason: 'rude' });
    expect(screen.choices[1]!.action).toEqual({ type: 'REPORT_MEMORIAL', id: 'SRV1', reason: 'real-name' });
    expect(screen.choices[2]!.action).toEqual({ type: 'REPORT_MEMORIAL', id: 'SRV1', reason: 'spam' });
    expect(screen.choices[3]!.action).toEqual({ type: 'REPORT_MEMORIAL', id: 'SRV1', reason: 'other' });
    expect(reduce(s, { type: 'BACK' }).phase).toBe('travel');
  });

  test('reporting thanks the player on the road, remembers it, and does not offer twice', () => {
    const s = reduce(reduce(passed(remote), { type: 'OPEN', screen: 'report' }), { type: 'REPORT_MEMORIAL', id: 'SRV1', reason: 'spam' });
    expect(s.phase).toBe('travel');
    expect(view(s).lines.join(' ')).toContain('Thanks. We’ll take a look.');
    expect(s.reportedMemorialIds).toEqual(['SRV1']);
    expect(view(s).choices.some((c) => /report/i.test(c.label))).toBe(false);
    expect(reduce(s, { type: 'OPEN', screen: 'report' }).phase).toBe('travel'); // nothing to report: no-op
  });

  test('a report keeps the day: no miles move, no rations eaten', () => {
    const s = passed(remote);
    const after = reduce(reduce(s, { type: 'OPEN', screen: 'report' }), { type: 'REPORT_MEMORIAL', id: 'SRV1', reason: 'rude' });
    expect(after.day).toBe(s.day);
    expect(after.mile).toBe(s.mile);
    expect(after.supplies).toEqual(s.supplies);
  });
});

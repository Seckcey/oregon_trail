import { describe, expect, test } from 'vitest';
import { createGame, reduce, view } from '../src/sim/game';
import type { GameState } from '../src/sim/types';
import { LIVE_BILLBOARD_FACES, billboardsFor, eventStripFor, layoutPage } from '../src/ui/comic/layout';
import { arriveAt, departed, run } from './helpers';

function page(s: GameState) {
  return layoutPage(view(s));
}

function storeState(): GameState {
  let s = run(createGame('layout'), { type: 'START_NEW' }, { type: 'CHOOSE_OCCUPATION', occupation: 'ceo' }, { type: 'CHOOSE_MONTH', month: 5 });
  for (let i = 0; i < 5; i++) s = reduce(s, { type: 'SUBMIT_NAME', name: `M${i}` });
  return s;
}

describe('every screen is a comic page', () => {
  test('the page kind follows the moment', () => {
    expect(page(run(departed(), { type: 'RESTART' })).kind).toBe('cover');
    expect(page(reduce(createGame('x'), { type: 'START_NEW' })).kind).toBe('setup');
    expect(page(storeState()).kind).toBe('store');
    expect(page(departed()).kind).toBe('road');
    expect(page(arriveAt(departed(), 'imperial-dunes')).kind).toBe('strip');
    expect(page(arriveAt(departed(), 'deming')).kind).toBe('postcard');
    expect(page(reduce(arriveAt(departed(), 'yuma'), { type: 'STOP_LEAVE' })).kind).toBe('crossing');
    expect(page(reduce(arriveAt(departed(), 'laguna-summit'), { type: 'EVENT_CHOICE', index: 0 })).kind).toBe('grade');
    expect(page(reduce(departed(), { type: 'SNACK_START' })).kind).toBe('snack');
    for (const screen of ['supplies', 'map', 'pace', 'rations', 'help', 'about'] as const) {
      expect(page(reduce(departed(), { type: 'OPEN', screen })).kind).toBe('overlay');
    }
    // The report Screen (Phase 4A) is a menu overlay too, drawn by the same code as help/about.
    const reportable = { ...departed(), lastMemorial: { id: 'SRV1', names: ['A'], mile: 1, day: 1, cause: 'THIRST', epitaph: 'E' }, memorialSeenDay: departed().day };
    const report = page(reduce(reportable, { type: 'OPEN', screen: 'report' }));
    expect(report.kind).toBe('overlay');
    // 4B: the leaderboard and the claim flow are overlays too — captions and one balloon.
    expect(page(reduce(createGame('x'), { type: 'OPEN', screen: 'leaderboard' })).kind).toBe('overlay');
    const cliffs = reduce(arriveAt(departed(), 'sunset-cliffs'), { type: 'EVENT_CHOICE', index: 1 });
    const claim = page(reduce(cliffs, { type: 'CLAIM_START' }));
    expect(claim.kind).toBe('overlay');
    expect(claim.input?.kind).toBe('name');
    expect(report.title).toBe('REPORT A MEMORIAL');
    expect(report.balloons.length + report.signs.length).toBe(5);
    expect(page({ ...departed(), phase: 'epitaph', deathCause: 'THIRST' }).kind).toBe('grave');
    expect(page(reduce(arriveAt(departed(), 'sunset-cliffs'), { type: 'EVENT_CHOICE', index: 1 })).kind).toBe('victory');
  });

  test('the title and the words come through untouched, and the crew is cast', () => {
    const p = page(departed());
    expect(p.title).toBe('THE ROAD');
    expect(p.status?.crew.map((m) => m.name)).toEqual(['M0', 'M1', 'M2', 'M3', 'M4']);
    expect(p.cast).toEqual([1, 2, 3, 4, 5]);
    expect(p.input).toBeNull();
    expect(page(reduce(departed(), { type: 'SNACK_START' })).input?.kind).toBe('snack');
  });
});

describe('the road page', () => {
  test('opens on a wide establishing shot with the van in it, then captions, crew, balloons', () => {
    const p = page(departed());
    expect(p.panels[0]).toMatchObject({ span: 'wide', art: { kind: 'region', region: 1, van: 'clean', moving: false } });
    expect(p.balloons.length).toBe(3);
    expect(p.signs.length).toBe(4);
  });

  test('the day’s narration is lettered inside the establishing shot: the date up top, the log below', () => {
    const p = page(departed());
    const shot = p.panels[0]!;
    expect(shot.head).toEqual([expect.stringMatching(/^Day 1\./)]);
    expect(shot.lines.length).toBeGreaterThan(0);
    expect(shot.lines[0]).toMatch(/pull out of Las Cruces/);
    expect(p.lines).toEqual([]);
    const driven = reduce(departed(), { type: 'DRIVE' });
    if (driven.phase === 'travel') {
      expect(page(driven).panels[0]!.head).toEqual([expect.stringMatching(/^Day 2\./), expect.stringMatching(/^Yesterday the van made/)]);
    }
  });

  test('after a day of driving the van is moving and the region follows the mile', () => {
    const driven = reduce(departed(), { type: 'DRIVE' });
    if (driven.phase !== 'travel') return; // an event interrupted this seed's first day
    const art = page(driven).panels[0]!.art;
    expect(art).toMatchObject({ kind: 'region', moving: true });
    const far = { ...departed(), mile: 600 };
    expect(page(far).panels[0]!.art).toMatchObject({ kind: 'region', region: 9 });
  });

  test('billboards ride past in a steady, deterministic rotation along the mile', () => {
    expect(billboardsFor(0)).toHaveLength(2);
    expect(billboardsFor(0)).toEqual(billboardsFor(0));
    expect(billboardsFor(0)).not.toEqual(billboardsFor(120));
    for (let mile = 0; mile <= 730; mile += 10) {
      for (const n of billboardsFor(mile)) {
        expect(LIVE_BILLBOARD_FACES).toContain(n);
        expect(n).not.toBe(5);
        expect(n).not.toBe(7);
      }
      expect(new Set(billboardsFor(mile)).size).toBe(2);
    }
    expect(page({ ...departed(), mile: 120 }).billboards).toEqual(billboardsFor(120));
  });
});

describe('the event strip', () => {
  test('sim event ids map onto the strips in the asset list', () => {
    expect(eventStripFor('flat-tire')).toBe('flat-tire');
    expect(eventStripFor('dust')).toBe('dust-storm');
    expect(eventStripFor('gas-tow')).toBe('tow-truck');
    expect(eventStripFor('gas-wait')).toBe('siphon');
    expect(eventStripFor('death')).toBe('memorial');
    expect(eventStripFor('snack-done')).toBe('snack-stand');
    expect(eventStripFor('dunes')).toBe('dunes-closure');
    expect(eventStripFor('ford-swamped')).toBe('river-ford');
    expect(eventStripFor('ford-rolled')).toBe('river-ford');
    expect(eventStripFor('grade-ramp')).toBe('runaway-ramp');
    expect(eventStripFor('grade-done')).toBe('the-grade');
    expect(eventStripFor('old80-done')).toBe('old-80');
    expect(eventStripFor('border-checkpoint')).toBeNull();
    expect(eventStripFor('summit')).toBeNull();
  });

  test('a strip is three panels with the words distributed across them', () => {
    const p = page(arriveAt(departed(), 'in-ko-pah'));
    expect(p.kind).toBe('strip');
    expect(p.panels).toHaveLength(3);
    expect(p.panels.every((panel) => panel.span === 'third')).toBe(true);
    const words = p.panels.flatMap((panel) => panel.lines);
    expect(words.length).toBeGreaterThan(0);
    expect(p.lines).toEqual([]); // nothing left over for a loose caption
    expect(p.balloons).toHaveLength(2);
  });

  test('an event with a strip in the list draws that strip; one without gets the road, the van, and the crew', () => {
    const dunes = page(arriveAt(departed(), 'imperial-dunes'));
    expect(dunes.panels.map((panel) => panel.art.kind)).toEqual(['event', 'event', 'event']);
    expect(dunes.panels[0]!.art).toMatchObject({ kind: 'event', stripId: 'dunes-closure', frame: 0 });
    expect(dunes.panels[2]!.art).toMatchObject({ kind: 'event', stripId: 'dunes-closure', frame: 2 });
    const climb = page(arriveAt(departed(), 'in-ko-pah'));
    expect(climb.panels.map((panel) => panel.art.kind)).toEqual(['region', 'van', 'crew']);
  });

  test('the two big decisions are splash pages with balloons', () => {
    const summit = page(arriveAt(departed(), 'laguna-summit'));
    expect(summit.kind).toBe('strip');
    expect(summit.panels).toHaveLength(1);
    expect(summit.panels[0]!.art).toEqual({ kind: 'scene', sceneId: 'laguna-decision' });
    const cliffs = page(arriveAt(departed(), 'sunset-cliffs'));
    expect(cliffs.panels[0]!.art).toEqual({ kind: 'stop', stopId: 'sunset-cliffs' });
  });

  test('action panels tilt; the tilt is deterministic per event', () => {
    const a = page(arriveAt(departed(), 'imperial-dunes'));
    const b = page(arriveAt(departed(), 'imperial-dunes'));
    expect(a.panels.map((panel) => panel.tilt)).toEqual(b.panels.map((panel) => panel.tilt));
    expect(a.panels.some((panel) => panel.tilt !== 0)).toBe(true);
    expect(page(departed()).panels[0]!.tilt).toBe(0);
  });
});

describe('the other pages', () => {
  test('a stop is a postcard of that stop', () => {
    const p = page(arriveAt(departed(), 'tucson'));
    expect(p.panels[0]!.art).toEqual({ kind: 'stop', stopId: 'tucson' });
    expect(p.balloons.map((b) => b.label)).toContain('Shop for supplies');
  });

  test('the Colorado is the Yuma splash; the Gila is just the road', () => {
    const yuma = page(reduce(arriveAt(departed(), 'yuma'), { type: 'STOP_LEAVE' }));
    expect(yuma.panels[0]!.art).toEqual({ kind: 'scene', sceneId: 'yuma-decision' });
    expect(yuma.set?.kind).toBe('crossing');
    const gila = page(reduce(arriveAt(departed(), 'gila-bend'), { type: 'STOP_LEAVE' }));
    expect(gila.panels[0]!.art.kind).toBe('region');
  });

  test('the grade and the snack run keep their set pieces on the page', () => {
    expect(page(reduce(arriveAt(departed(), 'laguna-summit'), { type: 'EVENT_CHOICE', index: 0 })).set?.kind).toBe('grade');
    expect(page(reduce(departed(), { type: 'SNACK_START' })).set?.kind).toBe('snack');
  });

  test('the store is the outfitter splash with the chalkboard', () => {
    const p = page(storeState());
    expect(p.panels[0]!.art).toEqual({ kind: 'scene', sceneId: 'outfitter' });
    expect(p.set?.kind).toBe('store');
  });

  test('an overlay keeps the road behind it', () => {
    const p = page(reduce(departed(), { type: 'OPEN', screen: 'map' }));
    expect(p.panels[0]!.art.kind).toBe('region');
    expect(p.title).toBe('THE MAP');
    expect(p.signs.map((s) => s.label)).toEqual(['Back']);
  });

  test('the grave is the memorial splash, then the game-over splash; victory is the cliff jump', () => {
    expect(page({ ...departed(), phase: 'epitaph', deathCause: 'THIRST' }).panels[0]!.art).toEqual({ kind: 'scene', sceneId: 'memorial' });
    expect(page({ ...departed(), phase: 'dead', deathCause: 'THIRST' }).panels[0]!.art).toEqual({ kind: 'scene', sceneId: 'game-over' });
    const won = page(reduce(arriveAt(departed(), 'sunset-cliffs'), { type: 'EVENT_CHOICE', index: 1 }));
    expect(won.panels[0]!.art).toEqual({ kind: 'scene', sceneId: 'victory' });
    expect(won.set?.kind).toBe('victory');
  });

  test('the cover is issue No. 1', () => {
    const p = page(run(departed(), { type: 'RESTART' }));
    expect(p.panels[0]!.art).toEqual({ kind: 'cover' });
    expect(p.balloons[0]!.shape).toBe('burst');
  });
});

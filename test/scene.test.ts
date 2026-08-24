import { describe, expect, test } from 'vitest';
import { reduce, view } from '../src/sim/game';
import { REGION_STARTS, regionAt, sceneOf, vanLook } from '../src/sim/scene';
import { arriveAt, departed, run } from './helpers';

describe('regions', () => {
  test('twelve regions tile the road from Las Cruces to the cliffs', () => {
    expect(REGION_STARTS).toHaveLength(12);
    expect(REGION_STARTS[0]).toBe(0);
    for (let i = 1; i < REGION_STARTS.length; i++) expect(REGION_STARTS[i]).toBeGreaterThan(REGION_STARTS[i - 1]!);
    expect(regionAt(0)).toBe(1); // Mesilla valley
    expect(regionAt(59)).toBe(1);
    expect(regionAt(60)).toBe(2); // Deming: the dust flats
    expect(regionAt(190)).toBe(3); // Texas Canyon boulders
    expect(regionAt(275)).toBe(4); // Tucson: saguaros
    expect(regionAt(340)).toBe(5); // Casa Grande: Picacho and the farmland
    expect(regionAt(480)).toBe(6); // Dateland: the lowlands
    expect(regionAt(550)).toBe(7); // Yuma
    expect(regionAt(585)).toBe(8); // the dunes
    expect(regionAt(610)).toBe(9); // El Centro: the Imperial Valley
    expect(regionAt(660)).toBe(10); // Jacumba: In-Ko-Pah country
    expect(regionAt(690)).toBe(11); // Laguna Summit
    expect(regionAt(705)).toBe(12); // Alpine down to the cliffs
    expect(regionAt(730)).toBe(12);
    expect(regionAt(9999)).toBe(12);
    expect(regionAt(-5)).toBe(1);
  });
});

describe('the van as it looks', () => {
  test('clean above 70, dusty above 40, battered below', () => {
    expect(vanLook(100)).toBe('clean');
    expect(vanLook(70)).toBe('clean');
    expect(vanLook(69.5)).toBe('dusty');
    expect(vanLook(40)).toBe('dusty');
    expect(vanLook(39)).toBe('battered');
    expect(vanLook(5)).toBe('battered');
  });
});

describe('sceneOf', () => {
  test('the title screen is region one, a clean van, not moving', () => {
    const s = run(departed(), { type: 'RESTART' });
    const scene = sceneOf(s);
    expect(scene).toMatchObject({ kind: 'title', region: 1, van: 'clean', moving: false, stopId: null, eventId: null, weather: 'none' });
    expect(view(s).scene).toEqual(scene);
  });

  test('every screen carries a scene', () => {
    const s = departed();
    for (const screen of ['supplies', 'map', 'pace', 'rations', 'help', 'about'] as const) {
      expect(view(reduce(s, { type: 'OPEN', screen })).scene.kind).toBe('menu');
    }
    expect(view(reduce(run(departed(), { type: 'RESTART' }), { type: 'START_NEW' })).scene.kind).toBe('setup');
  });

  test('a stop knows where it is; an event knows what it is', () => {
    const yuma = arriveAt(departed(), 'yuma');
    expect(sceneOf(yuma)).toMatchObject({ kind: 'stop', stopId: 'yuma', region: 7 });
    const bank = reduce(yuma, { type: 'STOP_LEAVE' });
    expect(sceneOf(bank)).toMatchObject({ kind: 'crossing', region: 7, stopId: null });
    const dunes = arriveAt(departed(), 'imperial-dunes');
    expect(sceneOf(dunes)).toMatchObject({ kind: 'event', eventId: 'dunes', region: 8 });
    const store = reduce(yuma, { type: 'STOP_SHOP' });
    expect(sceneOf(store)).toMatchObject({ kind: 'store', stopId: 'yuma' });
  });

  test('a day of driving is a moving scene with the weather it drove through', () => {
    const s = departed();
    const driven = reduce(s, { type: 'DRIVE' });
    const scene = sceneOf(driven);
    expect(scene.moving).toBe(true);
    expect(scene.day).toBe(driven.day);
    expect(scene.heat).toBe(driven.weatherToday?.heat ?? 0);
    expect(['none', 'dust', 'monsoon']).toContain(scene.weather);
    // Opening the map does not make the van drive again.
    expect(sceneOf(reduce(driven, { type: 'OPEN', screen: 'map' })).moving).toBe(false);
  });

  test('the grade, the grave, and the cliffs each have their own scene kind', () => {
    const top = arriveAt(departed(), 'laguna-summit');
    expect(sceneOf(top)).toMatchObject({ kind: 'event', eventId: 'summit', region: 11 });
    const grade = reduce(top, { type: 'EVENT_CHOICE', index: 0 });
    expect(sceneOf(grade)).toMatchObject({ kind: 'grade', region: 11 });
    const cliffs = arriveAt(departed(), 'sunset-cliffs');
    expect(sceneOf(cliffs)).toMatchObject({ kind: 'event', eventId: 'cliffs', region: 12 });
    const won = reduce(cliffs, { type: 'EVENT_CHOICE', index: 1 });
    expect(sceneOf(won)).toMatchObject({ kind: 'victory', region: 12 });
    const dead = { ...departed(), phase: 'epitaph' as const, deathCause: 'THIRST' };
    expect(sceneOf(dead).kind).toBe('grave');
  });

  test('a pool event names itself so the art and the SFX can match it', () => {
    let s = departed('event-seed');
    let found: string | null = null;
    for (let i = 0; i < 60 && !found; i++) {
      s = reduce(s, s.phase === 'event' ? { type: 'EVENT_CONTINUE' } : s.phase === 'stop' ? { type: 'STOP_LEAVE' } : { type: 'DRIVE' });
      if (s.phase === 'event' && s.pendingEvent && !['dust', 'monsoon', 'death', 'gas-tow', 'gas-wait'].includes(s.pendingEvent.id)) {
        found = s.pendingEvent.id;
      }
    }
    expect(found).not.toBeNull();
    expect(found).not.toBe('pool');
    expect(sceneOf(s).eventId).toBe(found);
  });
});

describe('set pieces carry their numbers', () => {
  test('the crossing is structured: depth, the safe line, the current, the ferry', () => {
    const bank = reduce(arriveAt(departed(), 'yuma'), { type: 'STOP_LEAVE' });
    const set = view(bank).set;
    expect(set?.kind).toBe('crossing');
    if (set?.kind !== 'crossing') return;
    expect(set.river).toBe('yuma');
    expect(set.depthFt).toBe(bank.crossing!.depthFt);
    expect(set.safeFt).toBe(2.5);
    expect(set.currentMph).toBe(bank.crossing!.currentMph);
    expect(set.daysWaited).toBe(0);
    expect(set.ferryName).toMatch(/8 West Ventures/);
    expect(set.ferryCents).toBe(8500);
    expect(set.fordRisk).toBeGreaterThan(0);
    expect(set.fordRisk).toBeLessThanOrEqual(0.95);
    expect(set.floatRisk).toBeGreaterThan(0);
  });

  test('the grade is structured: brake temperature against the fade line, the profile ahead', () => {
    const set = view(reduce(arriveAt(departed(), 'laguna-summit'), { type: 'EVENT_CHOICE', index: 0 })).set;
    expect(set?.kind).toBe('grade');
    if (set?.kind !== 'grade') return;
    expect(set.steep).toHaveLength(6);
    expect(set.segment).toBe(0);
    expect(set.brakeTemp).toBeLessThan(set.smokingTemp);
    expect(set.smokingTemp).toBeLessThan(set.fadeTemp);
    expect(set.speed).toBeLessThanOrEqual(set.maxSpeed);
  });

  test('the snack run is structured: the word to shout, the round, the last result', () => {
    const started = reduce(departed(), { type: 'SNACK_START' });
    const set = view(started).set;
    expect(set?.kind).toBe('snack');
    if (set?.kind !== 'snack') return;
    expect(set.word.length).toBeGreaterThan(0);
    expect(set.round).toBe(0);
    expect(set.rounds).toBe(3);
    expect(set.last).toBeNull();
    expect(set.gainedLbs).toBe(0);
    const hit = reduce(started, { type: 'SNACK_SUBMIT', typed: set.word, ms: 900 });
    const after = view(hit).set;
    if (after?.kind === 'snack') {
      expect(after.round).toBe(1);
      expect(after.last).toMatchObject({ word: set.word, hit: true });
      expect(after.last!.lbs).toBeGreaterThan(0);
    } else {
      // Three-round runs end on the third hit; one hit cannot end it.
      throw new Error(`expected the snack run to continue, got ${after?.kind}`);
    }
  });

  test('the store is structured: a price list the chalkboard can letter', () => {
    const outfitting = run(run(departed(), { type: 'RESTART' }), { type: 'START_NEW' }, { type: 'CHOOSE_OCCUPATION', occupation: 'ceo' }, { type: 'CHOOSE_MONTH', month: 5 });
    let s = outfitting;
    for (let i = 0; i < 5; i++) s = reduce(s, { type: 'SUBMIT_NAME', name: `M${i}` });
    const set = view(s).set;
    expect(set?.kind).toBe('store');
    if (set?.kind !== 'store') return;
    expect(set.items).toHaveLength(6);
    expect(set.items[0]).toMatchObject({ id: 'food', label: 'Food', cents: 1285 });
    expect(set.items.map((i) => i.id)).toEqual(['food', 'water', 'fuel', 'tire', 'belt', 'hose']);
    expect(set.cashCents).toBe(250000);
    expect(set.tuneUp).toBeNull(); // a new van has nothing to fix
    expect(set.outfitting).toBe(true);
    const shop = reduce(arriveAt(departed(), 'tucson'), { type: 'STOP_SHOP' });
    const later = view(shop).set;
    if (later?.kind === 'store') {
      expect(later.outfitting).toBe(false);
      expect(later.items[0]!.cents).toBeGreaterThan(1285); // prices climb westward
    }
  });

  test('the grave is structured for both the epitaph prompt and the tombstone', () => {
    const dying = { ...departed(), phase: 'epitaph' as const, deathCause: 'THIRST' };
    const set = view(dying).set;
    expect(set?.kind).toBe('grave');
    if (set?.kind !== 'grave') return;
    expect(set.cause).toBe('THIRST');
    expect(set.names).toHaveLength(5);
    expect(set.day).toBe(dying.day);
    expect(set.mile).toBe(dying.mile);
    const buried = reduce(dying, { type: 'SUBMIT_EPITAPH', text: 'Should have bought water.' });
    const stone = view(buried).set;
    expect(stone?.kind).toBe('grave');
    if (stone?.kind === 'grave') expect(stone.epitaph).toBe('SHOULD HAVE BOUGHT WATER.'); // the sim letters epitaphs in capitals;
  });

  test('the finish is structured: survivors, the jump, the way down, the whole score', () => {
    const won = view(reduce(arriveAt(departed(), 'sunset-cliffs'), { type: 'EVENT_CHOICE', index: 1 })).set;
    expect(won?.kind).toBe('victory');
    if (won?.kind !== 'victory') return;
    expect(won.survivors).toEqual(['M0', 'M1', 'M2', 'M3', 'M4']);
    expect(won.celebration).toBe('swan');
    expect(won.summitRoute).toBeNull(); // teleported past the summit
    expect(won.score.total).toBeGreaterThan(0);
    expect(won.score.multiplier).toBe(1);
    expect(won.occupation).toBe('ceo');
    expect(won.days).toBeGreaterThan(0);
  });

  test('ordinary screens carry no set piece', () => {
    expect(view(departed()).set).toBeNull();
    expect(view(arriveAt(departed(), 'deming')).set).toBeNull();
    expect(view(reduce(departed(), { type: 'OPEN', screen: 'map' })).set).toBeNull();
  });
});

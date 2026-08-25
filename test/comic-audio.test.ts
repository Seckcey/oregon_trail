import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { createGame, reduce, view, type Action } from '../src/sim/game';
import type { GameState } from '../src/sim/types';
import { AUDIO_IDS, AUDIO_SFX_IDS, MUSIC_LOOPS, SFX_IDS } from '../src/ui/assets';
import { ambienceFor, engineFor, foleyForEvent, musicFor, planAudio, uiSoundFor, type AudioCue } from '../src/ui/comic/audio';
import { sfxForTransition } from '../src/ui/comic/sfx';
import { arriveAt, departed, run } from './helpers';

/** Dispatch one action and report what the mixer would be told. */
function cue(state: GameState, action: Action, previous: AudioCue | null = null): { cue: AudioCue; next: GameState } {
  const next = reduce(state, action);
  const before = view(state);
  const after = view(next);
  return { cue: planAudio(before, after, action, sfxForTransition(before, after, action), previous), next };
}

function outfitting(): GameState {
  let s = run(createGame('audio-seed'), { type: 'START_NEW' }, { type: 'CHOOSE_OCCUPATION', occupation: 'ceo' }, { type: 'CHOOSE_MONTH', month: 5 });
  for (let i = 0; i < 5; i++) s = reduce(s, { type: 'SUBMIT_NAME', name: `M${i}` });
  return s;
}

describe('the audio slot table matches the files on disk', () => {
  const audioDir = join(process.cwd(), 'public', 'assets', 'audio');
  const onDisk = (dir: string): string[] =>
    existsSync(dir)
      ? readdirSync(dir)
          .filter((f) => f.endsWith('.mp3'))
          .map((f) => f.slice(0, -4))
      : [];

  test('eleven music tracks and seventy-four sound effects, no duplicates', () => {
    expect(AUDIO_IDS).toHaveLength(11);
    expect(AUDIO_SFX_IDS).toHaveLength(74);
    expect(new Set(AUDIO_SFX_IDS).size).toBe(AUDIO_SFX_IDS.length);
    for (const id of SFX_IDS) expect(AUDIO_SFX_IDS).toContain(id);
    expect(MUSIC_LOOPS.has('title-loop')).toBe(true);
    expect(MUSIC_LOOPS.has('victory')).toBe(false);
    expect(MUSIC_LOOPS.has('death-sting')).toBe(false);
  });

  test.skipIf(!existsSync(audioDir))('every registered id has its file, and every file is registered', () => {
    expect(onDisk(audioDir).sort()).toEqual([...AUDIO_IDS].sort());
    expect(onDisk(join(audioDir, 'sfx')).sort()).toEqual([...AUDIO_SFX_IDS].sort());
  });
});

describe('music, bed and engine by moment', () => {
  test('the cover hums the theme; the outfitter and setup share a groove; the road is day or night', () => {
    const title = view(createGame('m')).scene;
    expect(musicFor(title, null)).toBe('title-loop');
    expect(musicFor(view(outfitting()).scene, null)).toBe('outfitter-loop');
    const road = view(departed()).scene;
    expect(musicFor(road, null)).toBe('travel-day');
    expect(musicFor({ ...road, region: 10 }, null)).toBe('travel-night');
    expect(musicFor({ ...road, region: 11 }, null)).toBe('travel-night');
    expect(musicFor({ ...road, region: 12 }, null)).toBe('travel-day');
  });

  test('a menu keeps whatever was playing underneath it', () => {
    const road = view(departed()).scene;
    const menu = { ...road, kind: 'menu' as const };
    expect(musicFor(menu, 'stop-loop')).toBe('stop-loop');
    expect(musicFor(menu, null)).toBe('travel-day');
    expect(ambienceFor(menu, 'amb-town')).toBe('amb-town');
    expect(engineFor(menu, 'van-idle')).toBe('van-idle');
  });

  test('the beds follow the weather first, then the country', () => {
    const road = view(departed()).scene;
    expect(ambienceFor(road, null)).toBe('amb-desert-day');
    expect(ambienceFor({ ...road, weather: 'dust' }, null)).toBe('amb-dust-storm');
    expect(ambienceFor({ ...road, weather: 'monsoon' }, null)).toBe('amb-monsoon');
    expect(ambienceFor({ ...road, heat: 3 }, null)).toBe('amb-heat');
    expect(ambienceFor({ ...road, region: 10 }, null)).toBe('amb-mountain');
    expect(ambienceFor({ ...road, region: 12 }, null)).toBe('amb-ocean');
    expect(ambienceFor({ ...road, kind: 'store' }, null)).toBe('amb-store');
    expect(ambienceFor({ ...road, kind: 'stop' }, null)).toBe('amb-town');
    expect(ambienceFor({ ...road, kind: 'title' }, null)).toBeNull();
  });

  test('the van idles at the roadside, cruises when it moved, strains on the grade', () => {
    const road = view(departed()).scene;
    expect(engineFor({ ...road, moving: false }, null)).toBe('van-idle');
    expect(engineFor({ ...road, moving: true }, null)).toBe('van-cruise-day');
    expect(engineFor({ ...road, kind: 'grade' }, null)).toBe('van-cruise-strain');
    expect(engineFor({ ...road, kind: 'event' }, null)).toBe('van-idle');
    expect(engineFor({ ...road, kind: 'stop' }, null)).toBeNull();
    expect(engineFor({ ...road, kind: 'title' }, null)).toBeNull();
  });
});

describe('what each moment fires', () => {
  test('events play their foley by strip, or their word, or the notice chime', () => {
    expect(foleyForEvent('flat-tire')).toBe('ev-flat-tire');
    expect(foleyForEvent('gas-tow')).toBe('ev-tow-truck');
    expect(foleyForEvent('grade-ramp')).toBe('ev-runaway-ramp');
    expect(foleyForEvent('old80-done')).toBe('ev-historic-80');
    expect(foleyForEvent('dexcom-low')).toBe('ev-insulin-cooler');
    expect(foleyForEvent('insulin-cooler')).toBe('ev-insulin-cooler');
    expect(foleyForEvent('sea-level')).toBe('ev-sea-level');
    expect(foleyForEvent('border-checkpoint')).toBe('ev-border-checkpoint');
    expect(foleyForEvent('dust')).toBeNull(); // WHOOSH is the sound
    expect(foleyForEvent('summit')).toBeNull();
  });

  test('actions click, turn pages, and ding', () => {
    expect(uiSoundFor({ type: 'OPEN', screen: 'map' })).toBe('ui-page-turn');
    expect(uiSoundFor({ type: 'BACK' })).toBe('ui-back');
    expect(uiSoundFor({ type: 'SUBMIT_NAME', name: 'x' })).toBe('ui-type-ding');
    expect(uiSoundFor({ type: 'EVENT_CONTINUE' })).toBe('ui-select');
    expect(uiSoundFor({ type: 'DRIVE' })).toBeNull();
  });

  test('a purchase rings the register; a refused one blats', () => {
    const store = outfitting();
    expect(cue(store, { type: 'BUY', item: 'food', units: 1 }).cue.sfx).toEqual(['kaching']);
    expect(cue(store, { type: 'BUY', item: 'fuel', units: 9999 }).cue.sfx).toEqual(['ui-error']);
  });

  test('pulling out of the outfitter starts the van and goes VROOOM, onto the day bed with the engine cruising', () => {
    const loaded = run(outfitting(), { type: 'BUY', item: 'fuel', units: 20 }, { type: 'BUY', item: 'water', units: 4 });
    const { cue: c } = cue(loaded, { type: 'LEAVE_STORE' });
    expect(c.sfx).toEqual(['van-start', 'vroom']);
    expect(c.music).toBe('travel-day');
    expect(c.ambience).toBe('amb-desert-day');
    expect(c.engine).toBe('van-idle');
  });

  test('arriving in town: the van pulls in, a door slams, the diner twang starts', () => {
    const road = departed();
    const town = arriveAt(road, 'tucson');
    const c = planAudio(view(road), view(town), { type: 'DRIVE' }, null, null);
    expect(c.sfx).toEqual(['stop-arrive', 'van-door']);
    expect(c.music).toBe('stop-loop');
    expect(c.ambience).toBe('amb-town');
    expect(c.engine).toBeNull();
    // Coming back from the shop is not an arrival.
    const shop = reduce(town, { type: 'STOP_SHOP' });
    expect(cue(shop, { type: 'LEAVE_STORE' }).cue.sfx).toEqual([]);
  });

  test('an event lands with its foley, once; a menu over it is a page turn', () => {
    let s = departed('event-seed');
    let landed: { prev: GameState; action: Action; next: GameState } | null = null;
    for (let i = 0; i < 80 && !landed; i++) {
      const action: Action = s.phase === 'event' ? { type: 'EVENT_CONTINUE' } : s.phase === 'stop' ? { type: 'STOP_LEAVE' } : { type: 'DRIVE' };
      const next = reduce(s, action);
      if (next.phase === 'event' && foleyForEvent(next.pendingEvent!.id)) landed = { prev: s, action, next };
      s = next;
    }
    if (!landed) throw new Error('no foley event in 80 days');
    const foley = foleyForEvent(landed.next.pendingEvent!.id)!;
    const before = view(landed.prev);
    const after = view(landed.next);
    const c = planAudio(before, after, landed.action, sfxForTransition(before, after, landed.action), null);
    expect(c.sfx[0]).toBe(foley);
    expect(c.sfx).not.toContain(sfxForTransition(before, after, landed.action) ?? 'nothing');
    expect(c.engine).toBe('van-idle');
    const opened = reduce(landed.next, { type: 'OPEN', screen: 'supplies' });
    const menu = planAudio(after, view(opened), { type: 'OPEN', screen: 'supplies' }, null, c);
    expect(menu.sfx).toEqual(['ui-page-turn']);
    expect(menu.music).toBe(c.music);
  });

  test('the snack run: the stand opens, a hit pings, a miss splats, no CHOMP doubled on top', () => {
    const started = cue(departed(), { type: 'SNACK_START' });
    expect(started.cue.sfx).toEqual(['ev-snack-stand']);
    expect(started.cue.music).toBe('snack-loop');
    const set = view(started.next).set;
    if (set?.kind !== 'snack') throw new Error('no snack set piece');
    expect(cue(started.next, { type: 'SNACK_SUBMIT', typed: set.word, ms: 800 }).cue.sfx).toEqual(['snack-hit']);
    expect(cue(started.next, { type: 'SNACK_SUBMIT', typed: 'wrong', ms: 800 }).cue.sfx).toEqual(['snack-miss']);
  });

  test('the river: the ferry honks, the ford sploshes, waiting snores, all over the standoff music', () => {
    const bank = reduce(arriveAt(departed(), 'yuma'), { type: 'STOP_LEAVE' });
    expect(bank.phase).toBe('crossing');
    expect(planAudio(null, view(bank), null, null, null).music).toBe('crossing-tension');
    expect(cue(bank, { type: 'CROSS', method: 'ferry' }).cue.sfx).toEqual(['ev-river-ferry']);
    expect(cue(bank, { type: 'CROSS', method: 'wait' }).cue.sfx).toEqual(['zzz']);
    const ford = cue(bank, { type: 'CROSS', method: 'ford' });
    if (ford.next.phase !== 'event') expect(ford.cue.sfx).toEqual(['sploosh']);
  });

  test('the grade: brakes groan, a downshift clunks, and the chase music runs over the straining engine', () => {
    const grade = reduce(arriveAt(departed(), 'laguna-summit'), { type: 'EVENT_CHOICE', index: 0 });
    expect(grade.phase).toBe('grade');
    const brake = cue(grade, { type: 'GRADE_STEP', move: 'brake' });
    expect(brake.cue.sfx[0]).toBe('van-brakes');
    expect(brake.cue.music).toBe('grade-tension');
    expect(brake.cue.engine).toBe('van-cruise-strain');
    expect(cue(grade, { type: 'GRADE_STEP', move: 'downshift' }).cue.sfx[0]).toBe('van-downshift');
    expect(cue(grade, { type: 'GRADE_STEP', move: 'coast' }).cue.sfx).toEqual([]);
  });

  test('death is the sting, then the shovel; the cliffs are a cheer and fireworks over the surf', () => {
    const alive = departed();
    const dying = { ...alive, phase: 'epitaph' as const, deathCause: 'THIRST' };
    const grave = planAudio(view(alive), view(dying), { type: 'DRIVE' }, 'wah-wah', null);
    expect(grave.stings).toEqual(['death-sting']);
    expect(grave.sfx).toEqual([]); // the sting is the trombone
    expect(grave.music).toBe('grave-theme');
    expect(grave.ambience).toBe('amb-desert-night');
    expect(grave.engine).toBeNull();
    const buried = cue(dying, { type: 'SUBMIT_EPITAPH', text: 'x' }, grave);
    expect(buried.cue.sfx).toEqual(['grave-shovel']);
    expect(buried.cue.stings).toEqual([]);

    const cliffs = arriveAt(departed(), 'sunset-cliffs');
    const won = cue(cliffs, { type: 'EVENT_CHOICE', index: 0 });
    expect(won.next.phase).toBe('victory');
    expect(won.cue.sfx).toEqual(['hooray', 'victory-fireworks']);
    expect(won.cue.music).toBe('victory');
    expect(won.cue.ambience).toBe('amb-ocean');
  });
});

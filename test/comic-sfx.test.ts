import { describe, expect, test } from 'vitest';
import { createGame, reduce, view, type Action } from '../src/sim/game';
import type { GameState } from '../src/sim/types';
import { SFX_IDS } from '../src/ui/assets';
import { SFX_COLORS, SFX_WORDS, sfxForEvent, sfxForTransition } from '../src/ui/comic/sfx';
import { arriveAt, departed, run } from './helpers';

/** Dispatch one action and report what the renderer would slam on screen. */
function slam(state: GameState, action: Action): { sfx: ReturnType<typeof sfxForTransition>; next: GameState } {
  const next = reduce(state, action);
  return { sfx: sfxForTransition(view(state), view(next), action), next };
}

function outfitting(occupation: 'ceo' | 'intern' = 'ceo'): GameState {
  let s = run(createGame('sfx-seed'), { type: 'START_NEW' }, { type: 'CHOOSE_OCCUPATION', occupation }, { type: 'CHOOSE_MONTH', month: 5 });
  for (let i = 0; i < 5; i++) s = reduce(s, { type: 'SUBMIT_NAME', name: `M${i}` });
  return s;
}

describe('the lettering pack', () => {
  test('every SFX id has its word and its colours', () => {
    for (const id of SFX_IDS) {
      expect(SFX_WORDS[id].length).toBeGreaterThan(2);
      expect(SFX_COLORS[id].fill).toMatch(/^#[0-9a-f]{6}$/i);
    }
    expect(SFX_WORDS.bang).toBe('BANG!');
    expect(SFX_WORDS.hisss).toBe('HISSSSS');
    expect(SFX_WORDS.kaching).toBe('KA-CHING!');
    expect(SFX_WORDS['wah-wah']).toBe('WAH-WAAAH');
    expect(SFX_WORDS.hooray).toBe('HOORAY!');
  });
});

describe('sfxForEvent — which word an event slams on', () => {
  test('breakdowns, storms, the ramp, the river, the tow truck', () => {
    expect(sfxForEvent('flat-tire')).toBe('bang');
    expect(sfxForEvent('radiator')).toBe('hisss');
    expect(sfxForEvent('belt')).toBe('snap');
    expect(sfxForEvent('snake')).toBe('rattle');
    expect(sfxForEvent('dust')).toBe('whoosh');
    expect(sfxForEvent('monsoon')).toBe('kraka-boom');
    expect(sfxForEvent('gas-tow')).toBe('beep-beep');
    expect(sfxForEvent('grade-ramp')).toBe('krashh');
    expect(sfxForEvent('ford-rolled')).toBe('krashh');
    expect(sfxForEvent('ford-swamped')).toBe('sploosh');
    expect(sfxForEvent('tailwind')).toBe('vroom');
    expect(sfxForEvent('speed-trap')).toBe('screech');
  });

  test('the jokes: sushi chomps, ransomware rings the register, a death is a sad trombone', () => {
    expect(sfxForEvent('sushi')).toBe('chomp');
    expect(sfxForEvent('snack-done')).toBe('chomp');
    expect(sfxForEvent('ransomware')).toBe('kaching');
    expect(sfxForEvent('death')).toBe('wah-wah');
  });

  test('decisions are balloons, not slams', () => {
    expect(sfxForEvent('summit')).toBeNull();
    expect(sfxForEvent('cliffs')).toBeNull();
    expect(sfxForEvent('in-ko-pah')).toBeNull();
    expect(sfxForEvent('dunes')).toBeNull();
    expect(sfxForEvent('no-such-event')).toBeNull();
  });
});

describe('sfxForTransition — what a dispatched action sounds like', () => {
  test('a purchase rings the register; a refused one does not', () => {
    const store = outfitting('intern');
    expect(slam(store, { type: 'BUY', item: 'food', units: 1 }).sfx).toBe('kaching');
    expect(slam(store, { type: 'BUY', item: 'tire', units: 40 }).sfx).toBeNull(); // capacity
    expect(slam(store, { type: 'BUY', item: 'fuel', units: 9999 }).sfx).toBeNull(); // funds
  });

  test('pulling out of the outfitter goes VROOOM', () => {
    const loaded = run(outfitting(), { type: 'BUY', item: 'fuel', units: 20 }, { type: 'BUY', item: 'water', units: 4 });
    expect(slam(loaded, { type: 'LEAVE_STORE' }).sfx).toBe('vroom');
    // Leaving a mid-route shop just goes back to town.
    const shop = reduce(arriveAt(departed(), 'tucson'), { type: 'STOP_SHOP' });
    expect(slam(shop, { type: 'LEAVE_STORE' }).sfx).toBeNull();
  });

  test('a rest day snores unless the road interrupts it', () => {
    const { sfx, next } = slam(departed(), { type: 'REST' });
    expect(sfx).toBe(next.phase === 'event' ? (sfxForEvent(next.pendingEvent!.id) ?? null) : 'zzz');
  });

  test('a snack-run hit chomps; a miss is silence', () => {
    const started = reduce(departed(), { type: 'SNACK_START' });
    const set = view(started).set;
    if (set?.kind !== 'snack') throw new Error('no snack set piece');
    expect(slam(started, { type: 'SNACK_SUBMIT', typed: set.word, ms: 800 }).sfx).toBe('chomp');
    expect(slam(started, { type: 'SNACK_SUBMIT', typed: 'wrong', ms: 800 }).sfx).toBeNull();
  });

  test('arriving on an event slams its word once, not again when a menu opens and closes over it', () => {
    let s = departed('event-seed');
    let landed: { prev: GameState; action: Action; next: GameState } | null = null;
    for (let i = 0; i < 80 && !landed; i++) {
      const action: Action = s.phase === 'event' ? { type: 'EVENT_CONTINUE' } : s.phase === 'stop' ? { type: 'STOP_LEAVE' } : { type: 'DRIVE' };
      const next = reduce(s, action);
      if (next.phase === 'event' && sfxForEvent(next.pendingEvent!.id)) landed = { prev: s, action, next };
      s = next;
    }
    if (!landed) throw new Error('no slamming event in 80 days');
    const word = sfxForEvent(landed.next.pendingEvent!.id);
    expect(sfxForTransition(view(landed.prev), view(landed.next), landed.action)).toBe(word);
    // A first paint with no previous screen still slams it.
    expect(sfxForTransition(null, view(landed.next), null)).toBe(word);
    // Not if the same event is still on screen after a detour through the supplies list.
    const opened = reduce(landed.next, { type: 'OPEN', screen: 'supplies' });
    const back = reduce(opened, { type: 'BACK' });
    expect(sfxForTransition(view(opened), view(back), { type: 'BACK' })).toBeNull();
  });

  test('the grave is a sad trombone, the cliffs are a cheer', () => {
    const dying = { ...departed(), phase: 'epitaph' as const, deathCause: 'THIRST' };
    expect(sfxForTransition(view(departed()), view(dying), { type: 'DRIVE' })).toBe('wah-wah');
    const buried = reduce(dying, { type: 'SUBMIT_EPITAPH', text: 'x' });
    expect(sfxForTransition(view(dying), view(buried), { type: 'SUBMIT_EPITAPH', text: 'x' })).toBeNull();
    const cliffs = arriveAt(departed(), 'sunset-cliffs');
    expect(slam(cliffs, { type: 'EVENT_CHOICE', index: 0 }).sfx).toBe('hooray');
  });

  test('fording or floating the river goes SPLOOSH; the ferry stays dry; waiting is a nap', () => {
    const bank = reduce(arriveAt(departed(), 'yuma'), { type: 'STOP_LEAVE' });
    expect(bank.phase).toBe('crossing');
    const ford = slam(bank, { type: 'CROSS', method: 'ford' });
    if (ford.next.phase === 'event') {
      expect(ford.sfx).toBe(sfxForEvent(ford.next.pendingEvent!.id));
    } else {
      expect(ford.sfx).toBe('sploosh');
    }
    expect(slam(bank, { type: 'CROSS', method: 'ferry' }).sfx).toBeNull();
    expect(slam(bank, { type: 'CROSS', method: 'wait' }).sfx).toBe('zzz');
  });

  test('the brakes SCREEECH the moment they start smoking', () => {
    let s = reduce(arriveAt(departed(), 'laguna-summit'), { type: 'EVENT_CHOICE', index: 0 });
    expect(s.phase).toBe('grade');
    let smoked = false;
    for (let i = 0; i < 4 && !smoked; i++) {
      const { sfx, next } = slam(s, { type: 'GRADE_STEP', move: 'brake' });
      const set = view(next).set;
      if (set?.kind === 'grade' && set.brakeTemp >= set.smokingTemp) {
        expect(sfx).toBe('screech');
        smoked = true;
      } else if (next.phase === 'grade') {
        expect(sfx).toBeNull();
      }
      s = next;
    }
    expect(smoked).toBe(true);
  });
});

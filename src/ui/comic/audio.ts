// The audio plan: which music, which ambience bed, which engine bed, and
// which one-shots a moment calls for. Pure — the renderer asks after every
// dispatch and hands the answer to the mixer, which does the actual playing.
// Ids are the slots in src/ui/assets.ts (audio-asset-brief.md is the source).

import type { Action, Screen } from '../../sim/game';
import type { SceneHint } from '../../sim/scene';
import type { AudioId, AudioSfxId, SfxId } from '../assets';
import { eventStripFor } from './layout';

export type EngineBed = 'van-idle' | 'van-cruise-day' | 'van-cruise-strain';

export interface AudioCue {
  /** The music track that should be playing (loops, or plays once for victory). */
  music: AudioId | null;
  /** The ambience bed under it. */
  ambience: AudioSfxId | null;
  /** The engine bed under that. */
  engine: EngineBed | null;
  /** Sound effects to fire right now. */
  sfx: AudioSfxId[];
  /** One-shot tracks from the music folder to fire right now (the death sting). */
  stings: AudioId[];
}

export const SILENCE: AudioCue = { music: null, ambience: null, engine: null, sfx: [], stings: [] };

/** The night drive: the mountain regions are the ones with night plates in the art list. */
export function isNightRegion(region: number): boolean {
  return region === 10 || region === 11;
}

function travelMusic(scene: SceneHint): AudioId {
  return isNightRegion(scene.region) ? 'travel-night' : 'travel-day';
}

export function musicFor(scene: SceneHint, previous: AudioId | null): AudioId | null {
  switch (scene.kind) {
    case 'title':
      return 'title-loop';
    case 'setup':
    case 'store':
      return 'outfitter-loop';
    case 'road':
    case 'event':
      return travelMusic(scene);
    case 'stop':
      return 'stop-loop';
    case 'crossing':
      return 'crossing-tension';
    case 'grade':
      return 'grade-tension';
    case 'snack':
      return 'snack-loop';
    case 'menu':
      return previous ?? travelMusic(scene);
    case 'grave':
      return 'grave-theme';
    case 'victory':
      return 'victory';
  }
}

export function ambienceFor(scene: SceneHint, previous: AudioSfxId | null): AudioSfxId | null {
  switch (scene.kind) {
    case 'title':
    case 'setup':
      return null;
    case 'store':
      return 'amb-store';
    case 'stop':
      return 'amb-town';
    case 'victory':
      return 'amb-ocean';
    case 'grave':
      return 'amb-desert-night';
    case 'menu':
      return previous;
    default:
      break;
  }
  if (scene.weather === 'dust') return 'amb-dust-storm';
  if (scene.weather === 'monsoon') return 'amb-monsoon';
  if (scene.heat >= 3) return 'amb-heat';
  if (scene.region >= 12) return 'amb-ocean';
  if (isNightRegion(scene.region)) return 'amb-mountain';
  return 'amb-desert-day';
}

export function engineFor(scene: SceneHint, previous: EngineBed | null): EngineBed | null {
  switch (scene.kind) {
    case 'road':
      return scene.moving ? 'van-cruise-day' : 'van-idle';
    case 'event':
    case 'crossing':
      return 'van-idle';
    case 'grade':
      return 'van-cruise-strain';
    case 'menu':
      return previous;
    default:
      return null;
  }
}

/** Sim event → its foley, by way of the strip it is drawn with. Events without foley slam a word or ring the notice chime. */
const STRIP_FOLEY: Partial<Record<string, AudioSfxId>> = {
  'flat-tire': 'ev-flat-tire',
  radiator: 'ev-radiator',
  belt: 'ev-belt',
  sushi: 'ev-sushi',
  heatstroke: 'ev-heatstroke',
  snake: 'ev-snake',
  'speed-trap': 'ev-speed-trap',
  thief: 'ev-thief',
  ransomware: 'ev-ransomware',
  'wrong-turn': 'ev-wrong-turn',
  tailwind: 'ev-tailwind',
  'pecan-stand': 'ev-pecan-stand',
  'historic-80': 'ev-historic-80',
  'old-80': 'ev-historic-80',
  'tow-truck': 'ev-tow-truck',
  memorial: 'ev-memorial',
  'snack-stand': 'ev-snack-stand',
  'date-shake': 'ev-date-shake',
  'river-ford': 'ev-river-ford',
  'river-ferry': 'ev-river-ferry',
  'dunes-closure': 'ev-dunes',
  'hot-springs': 'ev-hot-springs',
  'runaway-ramp': 'ev-runaway-ramp',
  dexcom: 'ev-insulin-cooler',
};

/** Events whose id is not a strip name but still has its own sound. */
const EVENT_FOLEY: Partial<Record<string, AudioSfxId>> = {
  'insulin-cooler': 'ev-insulin-cooler',
  'border-checkpoint': 'ev-border-checkpoint',
  'sea-level': 'ev-sea-level',
};

export function foleyForEvent(eventId: string): AudioSfxId | null {
  const direct = EVENT_FOLEY[eventId];
  if (direct) return direct;
  const strip = eventStripFor(eventId);
  return (strip && STRIP_FOLEY[strip]) ?? null;
}

/** The click, page-turn or chime a dispatched action makes, before the world reacts to it. */
export function uiSoundFor(action: Action): AudioSfxId | null {
  switch (action.type) {
    case 'OPEN':
    case 'STOP_SHOP':
    case 'RESTART':
      return 'ui-page-turn';
    case 'BACK':
      return 'ui-back';
    case 'STOP_TALK':
      return 'ui-balloon-pop';
    case 'SUBMIT_NAME':
    case 'SUBMIT_EPITAPH':
      return 'ui-type-ding';
    case 'START_NEW':
    case 'CHOOSE_OCCUPATION':
    case 'CHOOSE_MONTH':
    case 'SET_PACE':
    case 'SET_RATIONS':
    case 'EVENT_CHOICE':
    case 'EVENT_CONTINUE':
      return 'ui-select';
    default:
      return null;
  }
}

function cashOf(screen: Screen | null): number | null {
  return screen?.set?.kind === 'store' ? screen.set.cashCents : null;
}

/**
 * The cue for `next`, reached from `prev` by `action`. `word` is the lettering the
 * renderer is slamming for the same transition (sfxForTransition), so the two stay in
 * sync; `previous` is the last cue, so menus can keep what was playing underneath.
 */
export function planAudio(
  prev: Screen | null,
  next: Screen,
  action: Action | null,
  word: SfxId | null,
  previous: AudioCue | null,
): AudioCue {
  const scene = next.scene;
  const prevKind = prev?.scene.kind ?? null;
  const sfx: AudioSfxId[] = [];
  const stings: AudioId[] = [];
  let wordPlayed = false;

  const play = (id: AudioSfxId | null): void => {
    if (id && !sfx.includes(id)) sfx.push(id);
  };

  // The moment itself.
  if (scene.kind === 'event') {
    const landed = !(prevKind === 'event' && prev?.scene.eventId === scene.eventId);
    if (landed) {
      const foley = foleyForEvent(scene.eventId ?? '');
      if (foley) {
        play(foley); // the foley opens with the same beat the word would
        wordPlayed = true;
      } else if (word) {
        play(word);
        wordPlayed = true;
      } else play('ui-notice');
    }
  } else if (scene.kind === 'grave') {
    if (prevKind !== 'grave') {
      stings.push('death-sting');
      wordPlayed = true; // the sting is the sad trombone
    }
  } else if (scene.kind === 'victory') {
    if (prevKind !== 'victory') {
      play('hooray');
      play('victory-fireworks');
      wordPlayed = true;
    }
  } else if (scene.kind === 'stop') {
    const arrived = prevKind !== null && prevKind !== 'stop' && prevKind !== 'store' && prevKind !== 'menu';
    if (arrived) {
      play('stop-arrive');
      play('van-door');
    }
  }

  // What the action sounded like. A click under a fanfare, a sting or a crash is just noise.
  const momentSounded = sfx.length > 0 || stings.length > 0;
  if (action) {
    switch (action.type) {
      case 'STOP_LEAVE':
      case 'LEAVE_STORE':
        if (scene.kind !== 'stop' && scene.kind !== 'store' && scene.kind !== 'menu') play('van-start');
        break;
      case 'SNACK_START':
        play('ev-snack-stand');
        break;
      case 'SNACK_SUBMIT':
        if (next.set?.kind === 'snack' && next.set.last) {
          play(next.set.last.hit ? 'snack-hit' : 'snack-miss');
          wordPlayed = true;
        }
        break;
      case 'GRADE_STEP':
        if (action.move === 'brake') play('van-brakes');
        else if (action.move === 'downshift') play('van-downshift');
        break;
      case 'CROSS':
        if (action.method === 'ferry') play('ev-river-ferry');
        break;
      case 'SUBMIT_EPITAPH':
        play(scene.kind === 'grave' ? 'grave-shovel' : 'ui-type-ding');
        break;
      case 'BUY':
      case 'REPAIR': {
        const before = cashOf(prev);
        const after = cashOf(next);
        if (before !== null && after !== null && after >= before) play('ui-error');
        break;
      }
      default:
        if (!momentSounded) play(uiSoundFor(action));
    }
  }

  if (word && !wordPlayed) play(word);

  const music = musicFor(scene, previous?.music ?? null);
  return {
    music,
    ambience: ambienceFor(scene, previous?.ambience ?? null),
    engine: engineFor(scene, previous?.engine ?? null),
    sfx,
    stings,
  };
}

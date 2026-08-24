// SFX lettering: which word gets slammed on the page, and when. Pure —
// the renderer asks after every dispatch and animates whatever comes back.
// Words and colours follow docs/ASSET-LIST.md §8.

import type { Action, Screen } from '../../sim/game';
import type { SfxId } from '../assets';

export const SFX_WORDS: Record<SfxId, string> = {
  screech: 'SCREEECH',
  krashh: 'KRASHH',
  vroom: 'VROOOM',
  bang: 'BANG!',
  hisss: 'HISSSSS',
  snap: 'SNAP!',
  kaching: 'KA-CHING!',
  zzz: 'ZZZ',
  chomp: 'CHOMP!',
  sploosh: 'SPLOOSH',
  whoosh: 'WHOOSH',
  'kraka-boom': 'KRAKA-BOOM',
  rattle: 'RATTLE RATTLE',
  'beep-beep': 'BEEP BEEP',
  'wah-wah': 'WAH-WAAAH',
  hooray: 'HOORAY!',
};

export interface SfxColor {
  /** Letter fill. */
  fill: string;
  /** Second fill for a two-tone word (top half), when the list asks for one. */
  fill2?: string;
  /** Burst behind the word. */
  burst: string;
}

export const SFX_COLORS: Record<SfxId, SfxColor> = {
  screech: { fill: '#FFC72C', fill2: '#F58220', burst: '#111111' },
  krashh: { fill: '#C41E2A', burst: '#FFC72C' },
  vroom: { fill: '#1F8FD6', burst: '#FFFFFF' },
  bang: { fill: '#C41E2A', burst: '#FFC72C' },
  hisss: { fill: '#FFFFFF', fill2: '#BDBDBD', burst: '#5BC0EB' },
  snap: { fill: '#F58220', burst: '#FFC72C' },
  kaching: { fill: '#7AC143', burst: '#FFC72C' },
  zzz: { fill: '#6A4C93', burst: '#5BC0EB' },
  chomp: { fill: '#F58220', burst: '#FFC72C' },
  sploosh: { fill: '#1F8FD6', burst: '#5BC0EB' },
  whoosh: { fill: '#D9A66B', burst: '#F58220' },
  'kraka-boom': { fill: '#6A4C93', fill2: '#FFC72C', burst: '#FFFFFF' },
  rattle: { fill: '#7AC143', burst: '#FFC72C' },
  'beep-beep': { fill: '#FFC72C', burst: '#C41E2A' },
  'wah-wah': { fill: '#9E9E9E', burst: '#6A4C93' },
  hooray: { fill: '#C41E2A', fill2: '#1F8FD6', burst: '#FFC72C' },
};

/** Events that slam a word when they land. Decisions (summit, cliffs, dunes…) are balloons instead. */
const EVENT_SFX: Record<string, SfxId> = {
  'flat-tire': 'bang',
  radiator: 'hisss',
  belt: 'snap',
  snake: 'rattle',
  dust: 'whoosh',
  monsoon: 'kraka-boom',
  'gas-tow': 'beep-beep',
  'grade-ramp': 'krashh',
  'grade-done': 'screech',
  'ford-rolled': 'krashh',
  'ford-swamped': 'sploosh',
  tailwind: 'vroom',
  'speed-trap': 'screech',
  sushi: 'chomp',
  'snack-done': 'chomp',
  ransomware: 'kaching',
  death: 'wah-wah',
};

export function sfxForEvent(eventId: string): SfxId | null {
  return EVENT_SFX[eventId] ?? null;
}

/** The special each landmark is famous for, by stop id. */
const SPECIAL_SFX: Record<string, SfxId> = {
  dateland: 'chomp',
  jacumba: 'zzz',
  'center-of-the-world': 'kaching',
};

/**
 * What to slam after `action` took the page from `prev` to `next`.
 * `prev` is null on the first paint; `action` is null when nothing was
 * dispatched (a theme switch, a resumed save).
 */
export function sfxForTransition(prev: Screen | null, next: Screen, action: Action | null): SfxId | null {
  // Menus opening and closing over a moment never re-slam it.
  if (action && (action.type === 'OPEN' || action.type === 'BACK')) return null;

  const kind = next.scene.kind;
  const prevKind = prev?.scene.kind ?? null;

  if (kind === 'event') {
    const sameEvent = prevKind === 'event' && prev?.scene.eventId === next.scene.eventId;
    return sameEvent ? null : sfxForEvent(next.scene.eventId ?? '');
  }
  if (kind === 'grave') return prevKind === 'grave' ? null : 'wah-wah';
  if (kind === 'victory') return prevKind === 'victory' ? null : 'hooray';
  if (!action) return null;

  switch (action.type) {
    case 'SNACK_SUBMIT':
      return next.set?.kind === 'snack' && next.set.last?.hit ? 'chomp' : null;
    case 'BUY':
    case 'REPAIR': {
      const before = prev?.set?.kind === 'store' ? prev.set.cashCents : null;
      const after = next.set?.kind === 'store' ? next.set.cashCents : null;
      return before !== null && after !== null && after < before ? 'kaching' : null;
    }
    case 'LEAVE_STORE':
      return prev?.set?.kind === 'store' && prev.set.outfitting && kind === 'road' ? 'vroom' : null;
    case 'REST':
      return 'zzz';
    case 'CROSS':
      if (action.method === 'wait') return 'zzz';
      if (action.method === 'ferry') return null;
      return 'sploosh';
    case 'GRADE_STEP': {
      if (next.set?.kind !== 'grade') return null;
      const was = prev?.set?.kind === 'grade' ? prev.set.brakeTemp : 0;
      return next.set.brakeTemp >= next.set.smokingTemp && was < next.set.smokingTemp ? 'screech' : null;
    }
    case 'STOP_SPECIAL': {
      const changed = prev?.status?.cash !== next.status?.cash || prev?.status?.day !== next.status?.day;
      return changed && next.scene.stopId ? (SPECIAL_SFX[next.scene.stopId] ?? null) : null;
    }
    default:
      return null;
  }
}

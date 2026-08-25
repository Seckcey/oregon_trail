// The scene hint: what a graphical renderer needs to know to draw the
// moment — where on the road we are, what the sky is doing, how the van
// looks, whether it just moved, which stop or event this is. Pure, derived
// from state, tested here so the renderers stay dumb. The terminal theme
// ignores it entirely. Nothing in here changes how the game plays.

import { stopAt } from './data/route';
import type { GameState, Weather } from './types';

export type SceneKind =
  | 'title'
  | 'setup'
  | 'road'
  | 'stop'
  | 'store'
  | 'event'
  | 'crossing'
  | 'grade'
  | 'snack'
  | 'menu'
  | 'grave'
  | 'victory';

export type Region = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type VanLook = 'clean' | 'dusty' | 'battered';

export interface SceneHint {
  kind: SceneKind;
  /** Which establishing shot to draw (docs/ASSET-LIST.md §5). */
  region: Region;
  heat: Weather['heat'];
  weather: Weather['event'];
  van: VanLook;
  /** The last action moved the van: renderers may animate the drive. */
  moving: boolean;
  /** The route id of the stop we are standing at (stop and store screens). */
  stopId: string | null;
  /** The id of the pending event (event screens): art and SFX key off it. */
  eventId: string | null;
  mile: number;
  day: number;
}

/**
 * Where each establishing-shot region begins, by mile. Region 1 is the
 * Mesilla valley; 12 is Alpine down to the cliffs. Matches the twelve
 * panels in the asset list, cut so every stop sits in the region that
 * looks like it.
 */
export const REGION_STARTS: readonly number[] = [0, 60, 190, 230, 300, 380, 530, 575, 600, 630, 680, 705];

export function regionAt(mile: number): Region {
  let region = 1;
  for (let i = 1; i < REGION_STARTS.length; i++) {
    if (mile >= REGION_STARTS[i]!) region = i + 1;
  }
  return region as Region;
}

export function vanLook(condition: number): VanLook {
  if (condition >= 70) return 'clean';
  if (condition >= 40) return 'dusty';
  return 'battered';
}

function kindOf(s: GameState): SceneKind {
  switch (s.phase) {
    case 'title':
      return 'title';
    case 'occupation':
    case 'month':
    case 'naming':
      return 'setup';
    case 'store':
      return 'store';
    case 'travel':
      return 'road';
    case 'event':
      return 'event';
    case 'stop':
      return 'stop';
    case 'crossing':
      return 'crossing';
    case 'grade':
      return 'grade';
    case 'snack':
      return 'snack';
    case 'supplies':
    case 'map':
    case 'pace':
    case 'rations':
    case 'help':
    case 'about':
    case 'report':
    case 'claim':
    case 'leaderboard':
      return 'menu';
    case 'epitaph':
    case 'dead':
      return 'grave';
    case 'victory':
      return 'victory';
  }
}

const MOVING_KINDS: readonly SceneKind[] = ['road', 'event', 'crossing'];

export function sceneOf(s: GameState): SceneHint {
  const kind = kindOf(s);
  const atStop = (kind === 'stop' || kind === 'store') && s.atStopIndex !== null ? stopAt(s.atStopIndex).id : null;
  return {
    kind,
    region: regionAt(s.mile),
    heat: s.weatherToday?.heat ?? 0,
    weather: s.weatherToday?.event ?? 'none',
    van: vanLook(s.van.condition),
    moving: MOVING_KINDS.includes(kind) && s.milesToday > 0,
    stopId: atStop,
    eventId: kind === 'event' ? (s.pendingEvent?.id ?? null) : null,
    mile: s.mile,
    day: s.day,
  };
}

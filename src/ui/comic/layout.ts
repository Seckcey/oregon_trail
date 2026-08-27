// The page compositor: a Screen becomes a ComicPage — which panels, with
// which art, carrying which words; which choices are balloons and which
// are signs; which billboards ride past. Pure; the DOM layer just draws it.

import type { Screen, SetPiece, StatusData } from '../../sim/game';
import type { Region, SceneHint, VanLook } from '../../sim/scene';
import type { Weather } from '../../sim/types';
import { EVENT_STRIPS, type EventStripId, type SceneId, type VanPose } from '../assets';
import { assignBalloons, castCrew, distributeLines, type Balloon } from './balloons';

export type PageKind =
  | 'cover'
  | 'setup'
  | 'store'
  | 'road'
  | 'strip'
  | 'postcard'
  | 'crossing'
  | 'grade'
  | 'snack'
  | 'overlay'
  | 'grave'
  | 'victory';

export type CrewMood = 'good' | 'fair' | 'poor' | 'critical' | 'lost';

export type ArtRef =
  | { kind: 'region'; region: Region; weather: Weather['event']; heat: Weather['heat']; van: VanLook; moving: boolean }
  | { kind: 'event'; stripId: EventStripId; frame: 0 | 1 | 2; cast?: readonly number[] }
  | { kind: 'stop'; stopId: string }
  | { kind: 'scene'; sceneId: SceneId }
  | { kind: 'cover' }
  | { kind: 'van'; pose: VanPose }
  | { kind: 'crew'; cast: readonly number[]; moods: readonly CrewMood[] };

export type PanelSpan = 'wide' | 'third' | 'splash';

export interface Panel {
  id: string;
  art: ArtRef;
  /** Caption boxes lettered inside this panel, along the bottom. */
  lines: string[];
  /** Caption boxes lettered along the top (the date line on the road). */
  head?: string[];
  /** Degrees; action panels tilt. */
  tilt: number;
  span: PanelSpan;
}

export interface ComicPage {
  kind: PageKind;
  title: string;
  /** Narration not placed inside a panel: caption boxes under the art. */
  lines: string[];
  panels: Panel[];
  balloons: Balloon[];
  signs: Balloon[];
  input: Screen['input'];
  status: StatusData | null;
  scene: SceneHint;
  set: SetPiece | null;
  /** Billboard faces (1–8) riding past on this page. */
  billboards: number[];
  /** Character id (1–12) playing each crew slot. */
  cast: number[];
}

/** Sim event ids → the strips in the asset list. Decisions have no strip. */
const EVENT_STRIP_ALIASES: Record<string, EventStripId> = {
  dust: 'dust-storm',
  'gas-tow': 'tow-truck',
  'gas-wait': 'siphon',
  death: 'memorial',
  'snack-done': 'snack-stand',
  dunes: 'dunes-closure',
  'ford-swamped': 'river-ford',
  'ford-rolled': 'river-ford',
  'grade-ramp': 'runaway-ramp',
  'grade-done': 'the-grade',
  'old80-done': 'old-80',
  'dexcom-low': 'dexcom',
  'dexcom-15': 'dexcom',
  'dexcom-late': 'dexcom',
};

export function eventStripFor(eventId: string): EventStripId | null {
  const alias = EVENT_STRIP_ALIASES[eventId];
  if (alias) return alias;
  return (EVENT_STRIPS as readonly string[]).includes(eventId) ? (eventId as EventStripId) : null;
}

/**
 * Faces 5 and 7 make absolute security claims, so they are not eligible for
 * the live road. Keep their asset slots for archive continuity; rotate only
 * the reviewed faces below.
 */
export const LIVE_BILLBOARD_FACES = [1, 2, 3, 4, 6, 8] as const;

/** Two different reviewed billboard faces, rotating every forty miles. */
export function billboardsFor(mile: number): number[] {
  const step = Math.max(0, Math.floor(mile / 40));
  const count = LIVE_BILLBOARD_FACES.length;
  return [LIVE_BILLBOARD_FACES[step % count]!, LIVE_BILLBOARD_FACES[(step + 3) % count]!];
}

export function moodOf(label: string): CrewMood {
  const key = label.toLowerCase();
  if (key === 'good' || key === 'fair' || key === 'poor' || key === 'critical' || key === 'lost') return key;
  return 'good';
}

function hash(text: string): number {
  let h = 7;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

const STRIP_TILTS = [-1.5, 2, -1];

function regionArt(scene: SceneHint): ArtRef {
  return { kind: 'region', region: scene.region, weather: scene.weather, heat: scene.heat, van: scene.van, moving: scene.moving };
}

function panel(id: string, art: ArtRef, span: PanelSpan, lines: string[] = [], tilt = 0): Panel {
  return { id, art, lines, tilt, span };
}

function pageKind(screen: Screen): PageKind {
  switch (screen.scene.kind) {
    case 'title':
      return 'cover';
    case 'setup':
      return 'setup';
    case 'store':
      return 'store';
    case 'road':
      return 'road';
    case 'event':
      return 'strip';
    case 'stop':
      return 'postcard';
    case 'crossing':
      return 'crossing';
    case 'grade':
      return 'grade';
    case 'snack':
      return 'snack';
    case 'menu':
      return 'overlay';
    case 'grave':
      return 'grave';
    case 'victory':
      return 'victory';
  }
}

function stripPanels(screen: Screen, cast: number[]): { panels: Panel[]; leftover: string[] } {
  const { scene } = screen;
  const eventId = scene.eventId ?? '';
  if (eventId === 'summit') return { panels: [panel('splash', { kind: 'scene', sceneId: 'laguna-decision' }, 'splash')], leftover: screen.lines };
  if (eventId === 'cliffs') return { panels: [panel('splash', { kind: 'stop', stopId: 'sunset-cliffs' }, 'splash')], leftover: screen.lines };

  const words = distributeLines(screen.lines, 3);
  const spin = hash(eventId) % STRIP_TILTS.length;
  const tilt = (i: number) => STRIP_TILTS[(i + spin) % STRIP_TILTS.length]!;
  const stripId = eventStripFor(eventId);
  // The opening frame carries its caption along the top, like a real first panel.
  const opener = (art: ArtRef): Panel => {
    const p = panel('frame-0', art, 'third', [], tilt(0));
    p.head = words[0]!;
    return p;
  };
  if (stripId) {
    return {
      panels: [
        opener({ kind: 'event', stripId, frame: 0, cast }),
        panel('frame-1', { kind: 'event', stripId, frame: 1, cast }, 'third', words[1]!, tilt(1)),
        panel('frame-2', { kind: 'event', stripId, frame: 2, cast }, 'third', words[2]!, tilt(2)),
      ],
      leftover: [],
    };
  }
  const moods = (screen.status?.crew ?? []).map((m) => moodOf(m.label));
  return {
    panels: [
      opener(regionArt(scene)),
      panel('frame-1', { kind: 'van', pose: scene.van }, 'third', words[1]!, tilt(1)),
      panel('frame-2', { kind: 'crew', cast, moods }, 'third', words[2]!, tilt(2)),
    ],
    leftover: [],
  };
}

export function layoutPage(screen: Screen): ComicPage {
  const kind = pageKind(screen);
  const { balloons, signs } = assignBalloons(screen);
  const cast = castCrew((screen.status?.crew ?? []).map((m) => m.name));
  const { scene } = screen;
  let panels: Panel[];
  let lines = screen.lines;

  switch (kind) {
    case 'cover':
      panels = [panel('cover', { kind: 'cover' }, 'splash')];
      break;
    case 'setup':
      panels = [panel('loading', { kind: 'scene', sceneId: 'loading' }, 'splash')];
      break;
    case 'store':
      panels = [panel('outfitter', { kind: 'scene', sceneId: 'outfitter' }, 'splash')];
      break;
    case 'road': {
      // The date and yesterday's miles ride along the top of the shot; the log along the bottom.
      const text = screen.lines.filter((l) => l.trim().length > 0);
      const head = text.filter((l) => !l.startsWith('· '));
      const log = text.filter((l) => l.startsWith('· ')).map((l) => l.slice(2));
      const shot = panel('establishing', regionArt(scene), 'wide', log);
      shot.head = head;
      panels = [shot];
      lines = [];
      break;
    }
    case 'overlay':
    case 'grade':
      panels = [panel('establishing', regionArt(scene), 'wide')];
      break;
    case 'strip': {
      const strip = stripPanels(screen, cast);
      panels = strip.panels;
      lines = strip.leftover;
      break;
    }
    case 'postcard':
      panels = [panel('postcard', { kind: 'stop', stopId: scene.stopId ?? 'las-cruces' }, 'splash')];
      break;
    case 'crossing':
      panels = [
        screen.set?.kind === 'crossing' && screen.set.river === 'yuma'
          ? panel('river', { kind: 'scene', sceneId: 'yuma-decision' }, 'splash')
          : panel('river', regionArt(scene), 'wide'),
      ];
      break;
    case 'snack': {
      const round = screen.set?.kind === 'snack' ? screen.set.round : 0;
      panels = [panel('stand', { kind: 'event', stripId: 'snack-stand', frame: (round % 3) as 0 | 1 | 2, cast }, 'third')];
      break;
    }
    case 'grave':
      panels = [panel('grave', { kind: 'scene', sceneId: screen.input?.kind === 'epitaph' ? 'memorial' : 'game-over' }, 'splash')];
      break;
    case 'victory':
      panels = [panel('cliffs', { kind: 'scene', sceneId: 'victory' }, 'splash')];
      break;
  }

  return {
    kind,
    title: screen.title,
    lines,
    panels,
    balloons,
    signs,
    input: screen.input,
    status: screen.status,
    scene,
    set: screen.set,
    billboards: kind === 'road' || kind === 'overlay' ? billboardsFor(scene.mile) : [],
    cast,
  };
}

// Balloons and captions: who says which choice, which choices are road
// signs instead, and how narration spreads across a strip. Pure.

import type { Action, Screen, ScreenChoice } from '../../sim/game';
import { CAST } from './cast';

export type BalloonShape = 'speech' | 'shout' | 'whisper' | 'burst';

export interface Balloon {
  key: string;
  label: string;
  action: Action;
  /** Crew member speaking, by name, or null for a burst nobody says. */
  speaker: string | null;
  /** Index into status.crew of the speaker (drives the tail and the headshot). */
  speakerIndex: number | null;
  shape: BalloonShape;
}

export interface BalloonLayout {
  balloons: Balloon[];
  signs: Balloon[];
}

/**
 * Cast the crew: a slot named after one of the twelve gets that character;
 * every other slot takes the next unused character. More than twelve wrap.
 */
export function castCrew(names: readonly string[]): number[] {
  const parts: number[] = names.map(() => 0);
  const used = new Set<number>();
  names.forEach((name, i) => {
    const key = name.trim().toLowerCase();
    const member = CAST.find((c) => c.name.toLowerCase() === key);
    if (member && !used.has(member.id)) {
      parts[i] = member.id;
      used.add(member.id);
    }
  });
  let next = 1;
  names.forEach((_, i) => {
    if (parts[i]) return;
    while (used.has(next)) next++;
    if (next > CAST.length) {
      parts[i] = (i % CAST.length) + 1;
    } else {
      parts[i] = next;
      used.add(next);
    }
  });
  return parts;
}

/** Utility choices are highway signs, not things the crew says. */
function isSign(choice: ScreenChoice): boolean {
  const t = choice.action.type;
  return t === 'OPEN' || t === 'BACK' || t === 'BUY' || t === 'REPAIR' || t === 'STORE_TAB' || t === 'UPGRADE';
}

const SHOUT = /!|snack|ride the|floor it|push|ford|cannonball|swan|hit the road/i;
const WHISPER = /\brest\b|\bwait\b|hold the towels/i;

function shapeFor(label: string, spoken: boolean): BalloonShape {
  if (!spoken) return 'burst';
  if (SHOUT.test(label)) return 'shout';
  if (WHISPER.test(label)) return 'whisper';
  return 'speech';
}

/**
 * The Dexcom alert is Kannon's scene: "keep rolling" is his line, and
 * "pull over" belongs to whoever is nearest. Everything else goes round
 * the van in order. Returns an index into the crew, or null for nobody.
 */
function speakerFor(screen: Screen, choiceIndex: number, alive: readonly number[]): number | null {
  if (alive.length === 0) return null;
  const crew = screen.status?.crew ?? [];
  if (screen.scene.eventId === 'dexcom-low') {
    const kannon = alive.find((i) => crew[i]?.badge === 't1d');
    if (kannon !== undefined) {
      if (choiceIndex === 1) return kannon;
      const other = alive.find((i) => i !== kannon);
      if (other !== undefined) return other;
    }
  }
  return alive[choiceIndex % alive.length]!;
}

export function assignBalloons(screen: Screen): BalloonLayout {
  const crew = screen.status?.crew ?? [];
  const alive = crew.map((m, i) => (m.label === 'LOST' ? -1 : i)).filter((i) => i >= 0);
  const balloons: Balloon[] = [];
  const signs: Balloon[] = [];
  for (const choice of screen.choices) {
    if (isSign(choice)) {
      signs.push({ key: choice.key, label: choice.label, action: choice.action, speaker: null, speakerIndex: null, shape: 'speech' });
      continue;
    }
    const speakerIndex = speakerFor(screen, balloons.length, alive);
    balloons.push({
      key: choice.key,
      label: choice.label,
      action: choice.action,
      speaker: speakerIndex === null ? null : crew[speakerIndex]!.name,
      speakerIndex,
      shape: shapeFor(choice.label, speakerIndex !== null),
    });
  }
  return { balloons, signs };
}

/**
 * Spread narration across the panels of a strip: the first line opens on
 * panel one, the last closes on the final panel, the middle carries the rest.
 */
export function distributeLines(lines: readonly string[], panels: number): string[][] {
  const text = lines.filter((l) => l.trim().length > 0);
  const out: string[][] = Array.from({ length: panels }, () => []);
  if (panels === 0) return out;
  if (text.length === 0) return out;
  if (panels === 1 || text.length === 1) {
    out[0] = [...text];
    return out;
  }
  const first = text[0]!;
  const last = text[text.length - 1]!;
  const middle = text.slice(1, -1);
  out[0]!.push(first);
  out[panels - 1]!.push(last);
  const inner = Math.max(1, panels - 2);
  middle.forEach((line, i) => {
    const slot = 1 + Math.floor((i * inner) / Math.max(1, middle.length));
    out[Math.min(slot, panels - 2)]!.push(line);
  });
  return out;
}

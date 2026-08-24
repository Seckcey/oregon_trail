// The 6% grade: a turn-based descent from Laguna Summit. Six stretches of
// road, three of them steep; gravity adds speed every stretch, the brakes
// shed it at the cost of heat. Too fast or too hot and it's the runaway
// ramp. Pure: state in, state out, seeded pattern.

import type { RngState } from './rng';
import { nextInt } from './rng';
import type { Weather } from './types';

export type GradeMove = 'brake' | 'downshift' | 'coast';
export type GradeOutcome = 'clean' | 'smoking' | 'ramp';

export interface GradeState {
  segment: number; // 0-based index of the stretch ahead
  brakeTemp: number; // 0..
  speed: number; // 1..
  steep: boolean[]; // one flag per stretch
  heat: Weather['heat'];
  lastLine: string | null;
  outcome: GradeOutcome | null;
  rampReason: 'fade' | 'runaway' | null;
}

export const GRADE = {
  segments: 6,
  steepCount: 3,
  startTemp: 20,
  startSpeed: 2,
  maxSpeed: 5, // one more than this and you're on the ramp
  fadeTemp: 100,
  smokingTemp: 70,
  brakeHeat: 20,
  downshiftHeat: 5,
  coastCool: 15,
  heatPerTier: 3, // extra brake heat per weather tier
} as const;

const BRAKE_LINES = [
  'You stand on the brakes. Something under the van starts to smell like a campfire.',
  'Brakes again. The pedal is getting long and soft, the way the trucker at Jacumba warned.',
  'You ride the brakes through the curve. The rotors tick and glow in the mirror.',
];
const DOWNSHIFT_LINES = [
  'You drop a gear. The engine howls and holds the van like a hand on its collar.',
  'Second gear, revs climbing, the whole van humming. It works. It sounds like it hurts.',
  'You downshift and let the engine do the arguing with gravity.',
];
const COAST_LINES = [
  'You let it roll. The brakes cool, the speedometer climbs, and the crew stops talking.',
  'Foot off everything. The wind noise rises a note. Somebody whispers a number.',
  'You coast, counting on the next curve to be kinder than it looks.',
];

/** Deal the descent: a seeded pattern of steep and gentle stretches. */
export function startGrade(rng: RngState, heat: Weather['heat']): GradeState {
  const order = Array.from({ length: GRADE.segments }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = nextInt(rng, 0, i);
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  const steepIdx = new Set(order.slice(0, GRADE.steepCount));
  return {
    segment: 0,
    brakeTemp: GRADE.startTemp,
    speed: GRADE.startSpeed,
    steep: Array.from({ length: GRADE.segments }, (_, i) => steepIdx.has(i)),
    heat,
    lastLine: null,
    outcome: null,
    rampReason: null,
  };
}

/** One stretch of the descent. Ignored once the outcome is decided. */
export function gradeStep(g: GradeState, move: GradeMove): GradeState {
  if (g.outcome !== null) return g;
  const steepNow = g.steep[g.segment] ?? false;
  const heatPenalty = g.heat * GRADE.heatPerTier;
  let speed = g.speed + (steepNow ? 2 : 1);
  let temp = g.brakeTemp;
  let line: string;
  switch (move) {
    case 'brake':
      speed = Math.max(1, speed - 2);
      temp += GRADE.brakeHeat + heatPenalty;
      line = BRAKE_LINES[g.segment % BRAKE_LINES.length]!;
      break;
    case 'downshift':
      speed = Math.max(1, speed - 1);
      temp += GRADE.downshiftHeat + heatPenalty;
      line = DOWNSHIFT_LINES[g.segment % DOWNSHIFT_LINES.length]!;
      break;
    case 'coast':
      temp = Math.max(0, temp - GRADE.coastCool);
      line = COAST_LINES[g.segment % COAST_LINES.length]!;
      break;
  }

  const next: GradeState = { ...g, segment: g.segment + 1, speed, brakeTemp: temp, lastLine: line };
  if (speed > GRADE.maxSpeed) return { ...next, outcome: 'ramp', rampReason: 'runaway' };
  if (temp >= GRADE.fadeTemp) return { ...next, outcome: 'ramp', rampReason: 'fade' };
  if (next.segment >= GRADE.segments) {
    return { ...next, outcome: temp >= GRADE.smokingTemp ? 'smoking' : 'clean' };
  }
  return next;
}

export function tempLabel(temp: number): 'cool' | 'warm' | 'hot' | 'smoking' | 'fading' {
  if (temp >= GRADE.fadeTemp) return 'fading';
  if (temp >= GRADE.smokingTemp) return 'smoking';
  if (temp >= 55) return 'hot';
  if (temp >= 30) return 'warm';
  return 'cool';
}

export function speedLabel(speed: number): string {
  if (speed <= 1) return 'a crawl';
  if (speed === 2) return 'steady';
  if (speed === 3) return 'fast';
  if (speed === 4) return 'very fast';
  return 'too fast';
}

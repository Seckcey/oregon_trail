// Core types and tuning constants for The 8 West Trail simulation.
// The sim is pure and deterministic: state in, state out, all randomness
// flows through the seeded RNG stored in GameState.

import type { CrossingState } from './crossing';
import type { GradeState } from './grade';

export type Occupation = 'ceo' | 'sysadmin' | 'intern';
export type Pace = 'steady' | 'strenuous' | 'grueling';
export type Rations = 'filling' | 'meager' | 'barebones';
/** Calendar months the trail can touch. Departures are offered March-August;
 * September/October exist so a long, slow run can limp across the line. */
export type Month = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type DepartureMonth = 3 | 4 | 5 | 6 | 7 | 8;

export type ConditionKind = 'food-poisoning' | 'heatstroke' | 'snakebite' | 'injury';

export interface Condition {
  kind: ConditionKind;
  daysLeft: number;
}

export interface CrewMember {
  name: string;
  health: number; // 0..100
  alive: boolean;
  conditions: Condition[];
}

export interface Supplies {
  food: number; // lbs
  water: number; // gallons
  fuel: number; // gallons
  tires: number;
  belts: number;
  hoses: number;
}

export interface Van {
  condition: number; // 0..100
}

export interface Weather {
  label: string;
  heat: 0 | 1 | 2 | 3;
  event: 'none' | 'dust' | 'monsoon';
}

export type StopKind = 'start' | 'town' | 'landmark' | 'crossing' | 'hazard' | 'climax' | 'finish';

export interface Stop {
  id: string;
  name: string;
  mile: number;
  kind: StopKind;
  hasShop: boolean;
  flavor: string;
}

export type GamePhase =
  | 'title'
  | 'occupation'
  | 'month'
  | 'naming'
  | 'store'
  | 'travel'
  | 'event'
  | 'stop'
  | 'crossing'
  | 'grade'
  | 'snack'
  | 'supplies'
  | 'map'
  | 'pace'
  | 'rations'
  | 'help'
  | 'about'
  | 'report'
  | 'epitaph'
  | 'dead'
  | 'victory';

export interface EventChoice {
  label: string;
}

export interface PendingEvent {
  id: string;
  text: string[];
  choices: EventChoice[] | null; // null = single "continue"
  title: string | null; // null = the anonymous "* * *" notice
}

export interface SnackResult {
  word: string;
  typed: string;
  ms: number;
  hit: boolean;
  lbs: number;
}

export interface SnackState {
  round: number; // 0-based index of current word
  words: string[];
  results: SnackResult[];
  gainedLbs: number;
}

export interface Memorial {
  /** The server's id once a memorial has been posted or fetched; local-only memorials have none. */
  id?: string;
  names: string[];
  mile: number;
  day: number;
  cause: string;
  epitaph: string;
}

export interface LogEntry {
  day: number;
  text: string;
}

export type SummitRoute = 'grade' | 'old80';

/** How you went off the cliffs at the finish. */
export type Celebration = 'cannonball' | 'swan' | 'towels';

export interface GameState {
  phase: GamePhase;
  returnPhase: GamePhase; // where sub-screens (supplies/map/pace/rations) return to
  resumePhase: GamePhase; // where the road resumes after a day-consuming notice
  seed: string;
  rng: { s: number };

  month: Month;
  dayOfMonth: number;
  day: number; // day of journey; 0 = still outfitting

  mile: number;
  nextStopIndex: number; // next ROUTE stop not yet reached
  atStopIndex: number | null; // stop currently visited (phase 'stop' / start store)

  occupation: Occupation | null;
  cash: number; // cents
  crew: CrewMember[];
  namingIndex: number;

  supplies: Supplies;
  van: Van;
  pace: Pace;
  rations: Rations;

  weatherToday: Weather | null;
  milesToday: number;
  daysWithoutFood: number;
  daysWithoutWater: number;

  pendingEvent: PendingEvent | null;
  snack: SnackState | null;
  snackRunsSinceStop: number;
  usedEventIds: string[];

  crossing: CrossingState | null; // on a river bank
  grade: GradeState | null; // on the 6% descent
  summitRoute: SummitRoute | null; // which way you came down the mountain
  celebration: Celebration | null; // the jump at Sunset Cliffs

  memorials: Memorial[]; // environment: past runs' graves (injected at init)
  memorialSeenDay: number; // last day a memorial line fired
  runMemorials: Memorial[]; // this run's dead, for the UI to persist
  memorialPosted: { id: string; mile: number } | null; // the UI says the road took this run's memorial
  lastMemorial: Memorial | null; // the memorial passed most recently (reportable on the day it was passed)
  reportedMemorialIds: string[]; // reported this run; never offered twice

  suggestedNames: string[]; // deterministic name suggestions for blank entries
  storeNotice: string | null; // last outfitter message (sold-out wallet, full van)
  pendingArrival: boolean; // a stop was reached but a notice interrupted first

  log: LogEntry[];
  deathCause: string | null;
  epitaph: string;
  gameOver: boolean;
}

// ---------------------------------------------------------------------------
// Tuning constants
// ---------------------------------------------------------------------------

export const TUNING = {
  crewSize: 5,
  buildPhase: 2, // printed on the score screen so runs stay comparable across builds

  startingCashCents: { ceo: 250000, sysadmin: 100000, intern: 40000 } as Record<Occupation, number>,
  scoreMultiplier: { ceo: 1, sysadmin: 2, intern: 3 } as Record<Occupation, number>,

  paceMiles: { steady: 40, strenuous: 55, grueling: 70 } as Record<Pace, number>,
  paceHealth: { steady: 0, strenuous: -1, grueling: -3 } as Record<Pace, number>,
  paceVanWear: { steady: 0.5, strenuous: 1, grueling: 2 } as Record<Pace, number>,

  rationsLbsPerPersonDay: { filling: 3, meager: 2, barebones: 1 } as Record<Rations, number>,
  rationsHealth: { filling: 2, meager: 0, barebones: -2 } as Record<Rations, number>,

  /** gallons per person per day at heat tiers 0..3 */
  waterPerPersonByHeat: [0.8, 1.2, 2, 3] as const,

  vanMpgGood: 10,
  vanMpgWorn: 8, // when condition < 50
  fuelTankMax: 40, // gallons
  waterMax: 40, // gallons
  foodMax: 500, // lbs
  partsMax: 3,

  hungerHealthPerDay: -10,
  thirstBaseHealth: -8,
  thirstHeatFactor: -4, // extra per heat tier
  heatHealthTier2: -2,
  heatHealthTier3: -3,

  restHealthGain: 8,

  conditionHealthPerDay: {
    'food-poisoning': -7,
    heatstroke: -6,
    snakebite: -8,
    injury: -4,
  } as Record<ConditionKind, number>,

  snackCarryCapLbs: 100,
  snackRounds: 3,
  snackDiminish: 0.6, // multiplier per prior run since last stop

  healthPoints: { good: 500, fair: 400, poor: 300, critical: 200 },

  // The road west of Tucson
  dateShakeCents: 1500,
  dateShakeHealth: 10,
  centerOfWorldCents: 300,
  dunesClosureChance: 0.45,
  dunesStuckChance: 0.5,
  inKoPahFloorWear: 8,
  inKoPahBoilChance: 0.45,
  old80WashoutChance: 0.3,
  summitDescentEndMile: 705, // Alpine: where both ways down the mountain rejoin the 8
  smokingVanDamage: 10,
  rampVanDamage: 30,

  logMax: 120,
} as const;

/** Health status label for a 0..100 health value (living members). */
export function healthStatus(health: number): 'good' | 'fair' | 'poor' | 'critical' {
  if (health >= 75) return 'good';
  if (health >= 50) return 'fair';
  if (health >= 25) return 'poor';
  return 'critical';
}

export const MONTH_NAMES: Record<Month, string> = {
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
};

export const DAYS_IN_MONTH: Record<Month, number> = {
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
};

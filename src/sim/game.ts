import { CREW_NAME_POOL, DEATH_CAUSES, DRIVE_LINES, EPITAPH_DEFAULT, TOWN_TALK } from './data/text';
import { PRIVACY_NOTE } from './data/privacy';
import { ROUTE, stopAt } from './data/route';
import {
  floatRisk,
  fordRisk,
  isRiverId,
  resolveFloat,
  type RiverId,
  resolveFord,
  riskLabel,
  RIVERS,
  rollRiver,
  waitADay,
} from './crossing';
import { rollPoolEvent } from './events';
import { GRADE, gradeStep, speedLabel, startGrade, tempLabel, type GradeMove } from './grade';
import { addCondition, deathCauseFor, tickMember, type DayContext } from './health';
import { chance, createRng, nextInt, pick, seedFromString } from './rng';
import { sceneOf, type SceneHint } from './scene';
import { computeScore, type ScoreBreakdown } from './score';
import { snackTotal, snackWordsFor, snackYield } from './snack';
import { supplyOutlook } from './outlook';
import { capacities, fmtCents, priceCentsAt, purchase, purchaseUpgrade, repairQuote, STORE_ITEMS, UPGRADE_ITEMS, type StoreItemId } from './store';
import { ABOUT_T1D_LINES, DEXCOM, isKannon, KANNON, kannonAboard, kannonIndex, SNACK_CARB_LINE, T1D_RULES } from './t1d';
import { dailyFoodNeed, dailyWaterNeed, fuelNeed, milesForDay } from './travel';
import type {
  Board,
  Celebration,
  DepartureMonth,
  EventChoice,
  GamePhase,
  GameState,
  Memorial,
  Month,
  Occupation,
  Pace,
  PendingEvent,
  Rations,
  Stop,
  StoreTab,
  SummitRoute,
  UpgradeId,
  Weather,
} from './types';
import { DAYS_IN_MONTH, healthStatus, MONTH_NAMES, TUNING } from './types';
import { heatOnly, rollWeather } from './weather';

// ---------------------------------------------------------------------------
// Actions and screens
// ---------------------------------------------------------------------------

export type CrossMethod = 'ford' | 'float' | 'ferry' | 'wait';

export type Action =
  | { type: 'START_NEW' }
  | { type: 'CHOOSE_OCCUPATION'; occupation: Occupation }
  | { type: 'CHOOSE_MONTH'; month: DepartureMonth }
  | { type: 'SUBMIT_NAME'; name: string }
  | { type: 'BUY'; item: StoreItemId; units: number }
  | { type: 'STORE_TAB'; tab: StoreTab }
  | { type: 'UPGRADE'; id: UpgradeId }
  | { type: 'REPAIR' }
  | { type: 'LEAVE_STORE' }
  | { type: 'DRIVE' }
  | { type: 'REST' }
  | { type: 'OPEN'; screen: 'supplies' | 'map' | 'pace' | 'rations' | 'help' | 'about' | 'report' | 'leaderboard' }
  | { type: 'BACK' }
  | { type: 'SET_PACE'; pace: Pace }
  | { type: 'SET_RATIONS'; rations: Rations }
  | { type: 'EVENT_CHOICE'; index: number }
  | { type: 'EVENT_CONTINUE' }
  | { type: 'STOP_SHOP' }
  | { type: 'STOP_TALK' }
  | { type: 'STOP_SPECIAL' }
  | { type: 'STOP_LEAVE' }
  | { type: 'CROSS'; method: CrossMethod }
  | { type: 'GRADE_STEP'; move: GradeMove }
  | { type: 'SNACK_START' }
  | { type: 'SNACK_SUBMIT'; typed: string; ms: number }
  | { type: 'SUBMIT_EPITAPH'; text: string }
  | { type: 'RESTART' }
  // Data in from the UI layer (the sim never fetches): the road's memorials, and word that ours was posted.
  | { type: 'MEMORIALS_LOADED'; memorials: Memorial[] }
  | { type: 'MEMORIAL_POSTED'; id: string; mile: number }
  | { type: 'REPORT_MEMORIAL'; id: string; reason: ReportReason }
  // 4B: the leaderboard. The UI posts the run and fetches the board; the sim only renders.
  | { type: 'RUN_POSTED'; rank: number; total: number }
  | { type: 'CLAIM_START' }
  | { type: 'CLAIM_SKIP' }
  | { type: 'CLAIM_CONSENT' }
  | { type: 'SUBMIT_EMAIL'; email: string }
  | { type: 'CLAIM_POSTED'; unsubscribeUrl: string }
  | { type: 'LEADERBOARD_LOADED'; board: Board | null };

export type ReportReason = 'rude' | 'real-name' | 'spam' | 'other';

// The words Phase 4 put on the screens (docs/PHASE4-PLAN.md §6), verbatim.
export const COPY = {
  nicknames: 'Nicknames, please — these ride on the road for other players to see.',
  epitaphWarning: 'Other crews will read this. Keep it clean, keep it yours, no phone numbers.',
  memorialLocal: 'The memorial will stand by the road for the next crew to pass.',
  memorialPosted: (mile: number) => `Your memorial stands at mile ${mile}. The next crew through will pass it.`,
  reportWhy: 'Why should this come down?',
  reportThanks: 'Thanks. We’ll take a look.',
  cta: 'Presented by 8 West IT 365 — the company named for the highway. 8westit.com',
  // 4B
  boardTitle: 'THE 8 WEST LEADERBOARD',
  offlineBoard: 'The leaderboard is out of range here. Try again from a town with signal.',
  claimAsk: 'Put a nickname on the board? (2–16 letters; this is all anyone sees)',
  emailAsk: 'Want 8 West IT to email you now and then — news about the company, the game, and what’s new on the road? Grown-ups only; if you’re under 18, skip this.',
  consent: 'I’m 18 or older, and I’d like occasional email from 8 West IT. I can unsubscribe with one click, any time.',
  savedHere: '(it’s saved on this device too)',
  boardLoading: 'Checking the board…',
  boardEmpty: 'Nobody has made the cliffs yet. Be the first.',
  boardCta1: 'Every run on this board got here on a 1985 van. Your business should be on something newer.',
  boardCta2: '8 West IT 365 — flat-rate IT for small business — 8westit.com/365',
} as const;

export interface ScreenChoice {
  key: string;
  label: string;
  action: Action;
}

export interface StatusData {
  date: string;
  day: number;
  mile: number;
  nextStop: string;
  nextStopMiles: number;
  cash: string;
  food: number;
  water: number;
  fuel: number;
  parts: string;
  pace: Pace;
  rations: Rations;
  van: number;
  weather: string | null;
  /** badge: 't1d' marks Kannon, who lives with Type 1 diabetes — the blue circle. */
  crew: { name: string; label: string; badge: 't1d' | null }[];
}

export type ScreenArt = 'title' | 'grave' | 'victory' | 'crossing' | 'grade' | 'summit' | 'hazard' | null;

/** Structured numbers behind the set-piece screens, so renderers never parse prose. */
export type SetPiece =
  | {
      kind: 'crossing';
      river: RiverId;
      depthFt: number;
      safeFt: number;
      currentMph: number;
      daysWaited: number;
      ferryName: string;
      ferryCents: number;
      fordRisk: number;
      floatRisk: number;
    }
  | {
      kind: 'grade';
      brakeTemp: number;
      fadeTemp: number;
      smokingTemp: number;
      speed: number;
      maxSpeed: number;
      steep: boolean[];
      segment: number;
    }
  | {
      kind: 'snack';
      word: string;
      round: number;
      rounds: number;
      last: { word: string; typed: string; hit: boolean; lbs: number } | null;
      gainedLbs: number;
    }
  | {
      kind: 'store';
      outfitting: boolean;
      stopName: string;
      cashCents: number;
      tab: StoreTab;
      items: { id: StoreItemId; label: string; unitLabel: string; cents: number }[];
      upgrades: { id: UpgradeId; label: string; blurb: string; cents: number; owned: boolean }[];
      tuneUp: { cents: number; points: number } | null;
    }
  | { kind: 'grave'; cause: string; epitaph: string; names: string[]; day: number; mile: number }
  | {
      kind: 'victory';
      survivors: string[];
      celebration: Celebration | null;
      summitRoute: SummitRoute | null;
      score: ScoreBreakdown;
      occupation: Occupation;
      days: number;
      miles: number;
    };

export interface Screen {
  title: string;
  lines: string[];
  choices: ScreenChoice[];
  input: { prompt: string; kind: 'name' | 'epitaph' | 'snack' | 'email'; placeholder: string } | null;
  status: StatusData | null;
  art: ScreenArt;
  /** What a graphical renderer needs to draw the moment. See scene.ts. */
  scene: SceneHint;
  /** Numbers behind the set pieces (crossing, grade, snack, store, grave, victory). */
  set: SetPiece | null;
}

// ---------------------------------------------------------------------------
// Game construction
// ---------------------------------------------------------------------------

export function createGame(seed: string, memorials: Memorial[] = []): GameState {
  const rng = createRng(seedFromString(seed));
  // Deal name suggestions up front so the naming screen is stable. Kannon
  // always rides; where he sits in the line-up is the seed's call. (Still
  // five RNG draws, so every seed's road plays out exactly as before.)
  const pool = CREW_NAME_POOL.filter((n) => n !== KANNON);
  const suggestedNames: string[] = [];
  for (let i = 0; i < TUNING.crewSize - 1; i++) {
    const idx = nextInt(rng, 0, pool.length - 1);
    suggestedNames.push(pool[idx]!);
    pool.splice(idx, 1);
  }
  suggestedNames.splice(nextInt(rng, 0, TUNING.crewSize - 1), 0, KANNON);

  return {
    phase: 'title',
    returnPhase: 'travel',
    resumePhase: 'travel',
    seed,
    rng,
    month: 5,
    dayOfMonth: 1,
    day: 0,
    mile: 0,
    nextStopIndex: 1,
    atStopIndex: 0,
    occupation: null,
    cash: 0,
    crew: [],
    namingIndex: 0,
    supplies: { food: 0, water: 0, fuel: 0, tires: 0, belts: 0, hoses: 0 },
    upgrades: { waterTank: false, fuelTank: false, cargo: false, ac: false },
    storeTab: 'supplies',
    van: { condition: 100 },
    pace: 'steady',
    rations: 'filling',
    weatherToday: null,
    milesToday: 0,
    daysWithoutFood: 0,
    daysWithoutWater: 0,
    pendingEvent: null,
    snack: null,
    snackRunsSinceStop: 0,
    usedEventIds: [],
    crossing: null,
    grade: null,
    summitRoute: null,
    celebration: null,
    memorials,
    memorialSeenDay: 0,
    runMemorials: [],
    memorialPosted: null,
    lastMemorial: null,
    reportedMemorialIds: [],
    runRank: null,
    claim: null,
    board: null,
    boardStatus: 'idle',
    suggestedNames,
    storeNotice: null,
    pendingArrival: false,
    log: [],
    deathCause: null,
    epitaph: '',
    gameOver: false,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers (operate on a draft state)
// ---------------------------------------------------------------------------

function log(s: GameState, text: string): void {
  s.log.push({ day: s.day, text });
  if (s.log.length > TUNING.logMax) s.log.splice(0, s.log.length - TUNING.logMax);
}

function advanceCalendar(s: GameState): void {
  s.day += 1;
  s.dayOfMonth += 1;
  if (s.dayOfMonth > DAYS_IN_MONTH[s.month]) {
    s.dayOfMonth = 1;
    if (s.month < 10) s.month = (s.month + 1) as Month;
  }
}

function aliveCount(s: GameState): number {
  return s.crew.filter((m) => m.alive).length;
}

function healAll(s: GameState, points: number): void {
  for (let i = 0; i < s.crew.length; i++) {
    const m = s.crew[i]!;
    if (m.alive) s.crew[i] = { ...m, health: Math.max(0, Math.min(100, m.health + points)) };
  }
}

function wearVan(s: GameState, points: number): void {
  s.van.condition = Math.max(5, s.van.condition - points);
}

function parkedWeather(s: GameState): void {
  s.weatherToday = heatOnly(rollWeather(s.rng, s.month, s.mile));
}

function notice(
  s: GameState,
  id: string,
  text: string[],
  choices: EventChoice[] | null = null,
  title: string | null = null,
): void {
  s.pendingEvent = { id, text, choices, title };
  s.phase = 'event';
  for (const t of text) log(s, t);
}

function recordDeath(s: GameState, name: string, cause: string): void {
  s.runMemorials.push({
    names: [name],
    mile: s.mile,
    day: s.day,
    cause,
    epitaph: `REST EASY, ${name.toUpperCase()}`,
  });
}

/** The memorial passed today, if it came from the road (has an id) and has not been reported. */
function reportableMemorial(s: GameState): Memorial | null {
  const m = s.lastMemorial;
  if (!m || !m.id || s.memorialSeenDay !== s.day || s.reportedMemorialIds.includes(m.id)) return null;
  return m;
}

/** Where the road picks up after a day that ended in a notice. */
function resumeFor(phase: GamePhase): GamePhase {
  if (phase === 'stop') return 'stop';
  if (phase === 'crossing') return 'crossing';
  return 'travel';
}

function arrive(s: GameState): void {
  const index = s.nextStopIndex;
  const stop = stopAt(index);
  s.mile = stop.mile;
  s.snackRunsSinceStop = 0;
  s.pendingArrival = false;
  if (stop.kind === 'finish') {
    s.atStopIndex = index;
    log(s, `You made it to ${stop.name}. The 8 dead-ends at the Pacific, and you are parked on it.`);
    notice(
      s,
      'cliffs',
      [
        stop.flavor,
        '',
        'The crew is already out of the van and lining up on the sandstone. Seven hundred and thirty miles of desert say you have earned this. Somebody has to go first.',
      ],
      [{ label: 'Cannonball' }, { label: 'Swan dive' }, { label: 'Hold the towels and cheer' }],
      'SUNSET CLIFFS',
    );
    return;
  }
  log(s, `You reach ${stop.name}, mile ${stop.mile}.`);
  if (stop.kind === 'hazard' || stop.kind === 'climax') {
    // No town here: the place itself is the event, and the road carries on past it.
    s.atStopIndex = null;
    s.nextStopIndex = index + 1;
    fireArrivalEvent(s, stop);
    return;
  }
  s.atStopIndex = index;
  s.phase = 'stop';
  if (stop.id === 'casa-grande') {
    log(s, 'Casa Grande: the 10 lets go, and the 8 begins. From here on, the highway has your name on it.');
  }
}

function fireArrivalEvent(s: GameState, stop: Stop): void {
  switch (stop.id) {
    case 'imperial-dunes': {
      if (chance(s.rng, TUNING.dunesClosureChance)) {
        notice(
          s,
          'dunes',
          [
            stop.flavor,
            'Today the wind is up. A CHP cruiser sits crossways at the on-ramp with its lights going: SAND ON ROADWAY — I-8 CLOSED. Beyond it the highway is a suggestion under a moving beige tide.',
          ],
          [{ label: 'Push through the sand on the frontage road' }, { label: 'Wait for the wind to drop and the plows to come' }],
          'THE IMPERIAL SAND DUNES',
        );
      } else {
        notice(
          s,
          'dunes',
          [stop.flavor, 'Today the wind is down. The dunes hold still for you, gold and enormous, and the road runs through them clean.'],
          [{ label: 'Drive on through' }],
          'THE IMPERIAL SAND DUNES',
        );
      }
      return;
    }
    case 'in-ko-pah':
      notice(
        s,
        'in-ko-pah',
        [
          stop.flavor,
          'Eleven miles of climb, no shade, no shoulder to speak of. Semis crawl it at twenty with their flashers on. You have a 1985 Econoline and opinions.',
        ],
        [{ label: 'Low gear, all the way up — slow, and kind to the van' }, { label: 'Floor it — fast, hot, and hard on everything' }],
        'THE IN-KO-PAH GRADE',
      );
      return;
    case 'laguna-summit':
      notice(
        s,
        'summit',
        [
          stop.flavor,
          '',
          'Two ways down. The interstate drops six percent for six miles — fast, free, and hard on the brakes. Or Old Highway 80 winds down the back way through Descanso and Alpine — slow, safe, and at the mercy of the weather.',
        ],
        [{ label: 'Ride the 6% grade' }, { label: 'Old Highway 80 — the slow way down' }],
        'LAGUNA SUMMIT',
      );
      return;
    default:
      s.phase = 'travel';
  }
}

interface DayOptions {
  miles: number;
  resting: boolean;
  allowPool: boolean;
  extraHealthAll?: number;
  extraWater?: number;
}

/**
 * Resolve one calendar day: consumption, health, movement, deaths,
 * memorials, arrival, and (maybe) a pool event. The weather for the day
 * must already be in weatherToday.
 */
function completeDay(s: GameState, opts: DayOptions): void {
  s.resumePhase = resumeFor(s.phase);
  const weather: Weather = s.weatherToday ?? { label: 'mild', heat: 0, event: 'none' };
  advanceCalendar(s);

  const alive = aliveCount(s);

  // Rations and water
  const foodNeed = dailyFoodNeed(alive, s.rations);
  const hasFood = s.supplies.food >= foodNeed;
  if (hasFood) {
    s.supplies.food -= foodNeed;
    s.daysWithoutFood = 0;
  } else {
    s.supplies.food = 0;
    s.daysWithoutFood += 1;
  }
  const waterNeed = dailyWaterNeed(alive, weather.heat) + (opts.extraWater ?? 0);
  const hasWater = s.supplies.water >= waterNeed;
  if (hasWater) {
    s.supplies.water -= waterNeed;
    s.daysWithoutWater = 0;
  } else {
    s.supplies.water = 0;
    s.daysWithoutWater += 1;
  }

  // Movement and the van
  let miles = opts.miles;
  if (miles > 0) {
    const mpgCap = s.supplies.fuel * (s.van.condition < 50 ? TUNING.vanMpgWorn : TUNING.vanMpgGood);
    miles = Math.min(miles, mpgCap);
    const burned = fuelNeed(miles, s.van.condition);
    s.supplies.fuel = Math.max(0, s.supplies.fuel - burned);
    s.van.condition = Math.max(5, s.van.condition - TUNING.paceVanWear[s.pace]);
  }
  const prevMile = s.mile;
  s.mile += miles;
  s.milesToday = miles;

  // Health
  // Air conditioning makes the day feel a tier cooler; the water math above
  // already ran on the real heat, because the crew still sweats it out.
  const ctx: DayContext = {
    rations: s.rations,
    pace: s.pace,
    heat: s.upgrades.ac ? (Math.max(0, weather.heat - 1) as 0 | 1 | 2 | 3) : weather.heat,
    hasFood,
    hasWater,
    resting: opts.resting,
  };
  const newlyDead: { name: string; cause: string }[] = [];
  for (let i = 0; i < s.crew.length; i++) {
    const before = s.crew[i]!;
    if (!before.alive) continue;
    let after = tickMember(before, ctx);
    if (opts.extraHealthAll && after.alive) {
      const h = Math.max(0, Math.min(100, after.health + opts.extraHealthAll));
      after = { ...after, health: h, alive: h > 0 };
    }
    if (!after.alive) {
      newlyDead.push({ name: before.name, cause: deathCauseFor(before, ctx) });
    }
    s.crew[i] = after;
  }

  // Roadside memorials from past runs (one sighting per day, max)
  if (miles > 0 && s.memorialSeenDay !== s.day) {
    const passed = s.memorials.find((g) => g.mile > prevMile && g.mile <= s.mile);
    if (passed) {
      s.memorialSeenDay = s.day;
      s.lastMemorial = passed;
      log(s, `You pass a small roadside memorial at mile ${passed.mile}: “${passed.epitaph}”`);
    }
  }

  // Full wipe: straight to the epitaph.
  if (aliveCount(s) === 0) {
    const worst = newlyDead[0];
    s.deathCause = worst ? worst.cause : 'THE ROAD';
    s.phase = 'epitaph';
    log(s, 'The road has taken everyone.');
    return;
  }

  // Arrival detection (may be deferred behind a death notice)
  const nextStop = ROUTE[s.nextStopIndex];
  const arrived = nextStop !== undefined && s.mile >= nextStop.mile;
  if (arrived) s.mile = nextStop.mile;

  // A death interrupts everything else.
  if (newlyDead.length > 0) {
    for (const d of newlyDead) recordDeath(s, d.name, d.cause);
    s.pendingArrival = arrived;
    const names = newlyDead.map((d) => d.name).join(' and ');
    const causes = newlyDead.map((d) => d.cause.toLowerCase()).join(', ');
    notice(s, 'death', [
      `${names} ${newlyDead.length > 1 ? 'have' : 'has'} died. (${causes}.)`,
      'You dig by the roadside in the hard caliche and mark the place with a cross of lath and a hubcap.',
      'The van is quieter now.',
    ]);
    return;
  }

  if (arrived) {
    arrive(s);
    return;
  }

  // Pool events, then plain-day flavor
  if (opts.allowPool) {
    const fired = rollPoolEvent(s);
    if (fired) {
      notice(s, fired.id, fired.lines);
      return;
    }
  }

  // Every driving day leaves a line, so the road screen never shows a stale
  // one: a random pick a quarter of the time (the same RNG draws as before),
  // otherwise the calendar chooses.
  if (!opts.resting) {
    if (chance(s.rng, 0.25)) log(s, pick(s.rng, DRIVE_LINES));
    else log(s, DRIVE_LINES[s.day % DRIVE_LINES.length]!);
  }
  s.phase = s.resumePhase;
}

function driveDay(s: GameState): void {
  if (s.supplies.fuel <= 0) {
    parkedWeather(s);
    if (s.cash >= 8500) {
      notice(s, 'gas-tow', [
        'The needle has been lying. The van coasts onto the shoulder, out of gas, miles from anything.',
        'A tow truck happens by an hour later. Eighty-five dollars buys you five gallons and a short lecture.',
      ]);
    } else {
      notice(s, 'gas-wait', [
        'Out of gas, out of money, out of luck — the van dies on the shoulder.',
        'It takes two long days before a trucker takes pity and siphons you five gallons. The desert keeps the difference.',
      ]);
    }
    return;
  }
  s.weatherToday = rollWeather(s.rng, s.month, s.mile);
  const w = s.weatherToday;
  if (w.event === 'dust') {
    notice(
      s,
      'dust',
      [
        'A brown wall swallows the horizon behind you — dust storm, the real kind, the kind the signs warn about.',
        'Visibility is dying fast.',
      ],
      [{ label: 'Push through it' }, { label: 'Pull off and wait it out' }],
    );
    return;
  }
  if (w.event === 'monsoon') {
    notice(
      s,
      'monsoon',
      [
        'The afternoon sky turns green-black and drops a monsoon on the desert.',
        'The washes ahead are running fast and mean.',
      ],
      [{ label: 'Ford the washes now' }, { label: 'Wait for the water to drop' }],
    );
    return;
  }
  if (dexcomDue(s)) {
    s.usedEventIds.push('dexcom-low');
    notice(s, 'dexcom-low', [...DEXCOM.alert], [...DEXCOM.choices], DEXCOM.title);
    return;
  }
  const miles = milesForDay(s.rng, s.pace, s.van.condition, w);
  completeDay(s, { miles, resting: false, allowPool: true });
}

// ---------------------------------------------------------------------------
// Kannon and the Dexcom: a lesson, not a punishment. See t1d.ts.
// ---------------------------------------------------------------------------

/** The RNG is only consulted when Kannon is aboard, so other runs play out unchanged. */
function dexcomDue(s: GameState): boolean {
  if (!kannonAboard(s)) return false;
  if (s.usedEventIds.includes('dexcom-low')) return false;
  if (s.mile <= T1D_RULES.minMile) return false;
  return chance(s.rng, T1D_RULES.dailyChance);
}

function resolveDexcom(s: GameState, index: number, w: Weather): void {
  const rolled = milesForDay(s.rng, s.pace, s.van.condition, w);
  if (index === 0) {
    log(s, DEXCOM.pullOverLine);
    completeDay(s, { miles: Math.max(0, rolled - T1D_RULES.pullOverMiles), resting: false, allowPool: false });
    if (s.phase === 'travel') notice(s, 'dexcom-15', [...DEXCOM.lesson15], null, 'THE RULE OF 15');
    return;
  }
  // The low gets ahead of him. It costs him, and it costs the day — and it never kills him.
  const k = kannonIndex(s);
  const m = s.crew[k];
  if (m && m.alive) s.crew[k] = { ...m, health: Math.max(1, m.health - T1D_RULES.lateHealth) };
  log(s, DEXCOM.lateLine);
  completeDay(s, { miles: Math.max(0, rolled - T1D_RULES.lateMiles), resting: false, allowPool: false });
  if (s.phase === 'travel') notice(s, 'dexcom-late', [...DEXCOM.lessonLate], null, 'THE RULE OF 15');
}

// ---------------------------------------------------------------------------
// The road west of Tucson: hazards and the summit
// ---------------------------------------------------------------------------

function resolveDunes(s: GameState, ev: PendingEvent, index: number): void {
  if (!ev.choices || ev.choices.length === 1) {
    s.phase = 'travel';
    return;
  }
  parkedWeather(s);
  if (index === 0) {
    if (chance(s.rng, TUNING.dunesStuckChance)) {
      wearVan(s, 10);
      log(s, 'The frontage road is a rumor under the sand. Forty minutes in, the van buries itself to the hubs. You dig. You dig all day. Nothing is faster than sand.');
      completeDay(s, { miles: 0, resting: false, allowPool: false, extraHealthAll: -3, extraWater: 2 });
    } else {
      wearVan(s, 4);
      log(s, 'Low range, no stopping, sand hissing off the doors like rain. You punch through the drifts with the crew shouting and come out the far side with the paint sanded to primer.');
      completeDay(s, { miles: 25, resting: false, allowPool: false });
    }
    return;
  }
  log(s, 'You pull into the lee of the van, rig a tarp, and let the wind have its day. By evening the plows are out and the road is a road again.');
  completeDay(s, { miles: 0, resting: true, allowPool: false });
}

function resolveInKoPah(s: GameState, index: number): void {
  if (index === 0) {
    log(s, 'First gear, flashers on, twenty miles an hour with the semis. The engine sings one long note for the whole climb, and the climb takes all day and half the next.');
    parkedWeather(s);
    completeDay(s, { miles: 10, resting: false, allowPool: false });
    if (s.phase !== 'travel') return;
    parkedWeather(s);
    completeDay(s, { miles: 10, resting: false, allowPool: false });
    return;
  }
  parkedWeather(s);
  wearVan(s, TUNING.inKoPahFloorWear);
  log(s, 'You floor it. The van screams up the grade past the crawling semis, temperature needle climbing with the altitude, every rattle it owns going at once.');
  if ((s.weatherToday?.heat ?? 0) >= 2 && chance(s.rng, TUNING.inKoPahBoilChance)) {
    if (s.supplies.hoses > 0) {
      s.supplies.hoses -= 1;
      s.supplies.water = Math.max(0, s.supplies.water - 3);
      log(s, 'Halfway up, steam: the radiator boils over and takes the hose with it. You fit the spare on the shoulder with trucks blasting past, and pour three gallons of drinking water into the engine.');
    } else {
      wearVan(s, 15);
      s.supplies.water = Math.max(0, s.supplies.water - 5);
      log(s, 'Halfway up, steam: the radiator boils over. No spare hose. Duct tape, five gallons of drinking water, and a prayer to the god of Econolines.');
    }
  }
  completeDay(s, { miles: 20, resting: false, allowPool: false });
}

function startDescent(s: GameState): void {
  s.summitRoute = 'grade';
  s.grade = startGrade(s.rng, s.weatherToday?.heat ?? 1);
  s.phase = 'grade';
  log(s, 'You take the interstate down. Six percent, six miles, and the whole Pacific side of the mountain opening up below the hood.');
}

function takeOld80(s: GameState): void {
  s.summitRoute = 'old80';
  log(s, 'You take Old Highway 80 — the road the 8 replaced — down the back way through the oaks, one switchback at a time.');
  let washout = chance(s.rng, TUNING.old80WashoutChance);
  for (const miles of [8, 7]) {
    const w = rollWeather(s.rng, s.month, s.mile);
    if (w.event !== 'none') washout = true;
    s.weatherToday = heatOnly(w);
    completeDay(s, { miles, resting: false, allowPool: false });
    if (s.phase !== 'travel') return;
  }
  if (washout) {
    log(s, 'A wash has taken a bite out of Old 80 below Descanso. A county crew waves you back to wait, and the day goes with it.');
    parkedWeather(s);
    completeDay(s, { miles: 0, resting: false, allowPool: false });
    if (s.phase !== 'travel') return;
  }
  s.mile = TUNING.summitDescentEndMile;
  notice(
    s,
    'old80-done',
    [
      'Old Highway 80 lets you down easy: oaks, then chaparral, then the first palm tree, then Alpine and the interstate again — the van cool and the brakes untouched.',
      'Slow and sure. The trucks that know better nodded as you passed.',
    ],
    null,
    'OLD HIGHWAY 80',
  );
}

function finishGrade(s: GameState): void {
  const g = s.grade!;
  s.grade = null;
  s.mile = TUNING.summitDescentEndMile;
  if (g.outcome === 'clean') {
    notice(
      s,
      'grade-done',
      [
        'The grade lets go. The road flattens into Alpine, the brakes tick as they cool, and somebody in the back starts breathing again.',
        'Six miles, six percent, and not a rotor harmed. The crew applauds the driver. The driver applauds the van.',
      ],
      null,
      'THE 6% GRADE',
    );
    return;
  }
  if (g.outcome === 'smoking') {
    wearVan(s, TUNING.smokingVanDamage);
    notice(
      s,
      'grade-done',
      [
        'You roll into Alpine trailing a thin blue smoke and a smell like a burning tire fort. The brakes held — barely, and not for free.',
        'You let them cool in the shade of a gas station while the crew pretends that was fine.',
      ],
      null,
      'THE 6% GRADE',
    );
    return;
  }
  wearVan(s, TUNING.rampVanDamage);
  for (let i = 0; i < s.crew.length; i++) {
    const m = s.crew[i]!;
    if (m.alive) s.crew[i] = addCondition(m, 'injury', 3);
  }
  const why =
    g.rampReason === 'fade'
      ? 'The pedal goes to the floor and stays there — the brakes are gone, cooked to nothing.'
      : 'The van is going faster than a van should, and the next curve is not going to negotiate.';
  log(s, `${why} RUNAWAY TRUCK RAMP, 1/4 MILE. You take it.`);
  completeDay(s, { miles: 0, resting: false, allowPool: false });
  if (s.phase === 'travel') {
    notice(
      s,
      'grade-ramp',
      [
        why,
        'You aim for the runaway ramp and hit the gravel at speed. The van buries its nose, the crew hits the seatbacks, and everything in the back comes forward to say hello.',
        'Everyone is bruised. The van is bent. It takes the rest of the day and a wrecker with 8 WEST IT — ROADSIDE DIV. on the door to drag you back to the highway.',
      ],
      null,
      'THE RUNAWAY RAMP',
    );
  }
}

// ---------------------------------------------------------------------------
// River crossings
// ---------------------------------------------------------------------------

function beginCrossing(s: GameState, stop: Stop): boolean {
  if (!isRiverId(stop.id)) return false;
  s.crossing = rollRiver(s.rng, stop.id, s.month);
  s.phase = 'crossing';
  log(s, `You come down to the bank of ${RIVERS[stop.id].name}.`);
  return true;
}

function swamp(s: GameState, line: string): void {
  s.supplies.food = Math.round(s.supplies.food * 0.8);
  s.supplies.fuel = Math.round(s.supplies.fuel * 0.9);
  wearVan(s, 15);
  log(s, line);
}

function resolveCrossing(s: GameState, method: CrossMethod): void {
  const c = s.crossing!;
  const spec = RIVERS[c.river];
  switch (method) {
    case 'wait': {
      s.crossing = waitADay(s.rng, c);
      log(s, 'You camp on the bank and watch the river think it over.');
      parkedWeather(s);
      completeDay(s, { miles: 0, resting: false, allowPool: false });
      return;
    }
    case 'ferry': {
      if (s.cash < spec.ferryCents) {
        s.storeNotice = 'The ferryman counts your cash twice and shakes his head. No IOUs on the river.';
        return;
      }
      s.cash -= spec.ferryCents;
      s.crossing = null;
      s.phase = 'travel';
      log(s, `${spec.ferryName} takes the van across for ${fmtCents(spec.ferryCents)}. It takes the day, and it takes nothing else.`);
      parkedWeather(s);
      completeDay(s, { miles: 0, resting: false, allowPool: false });
      return;
    }
    case 'float': {
      const r = resolveFloat(s.rng, c);
      s.crossing = null;
      s.phase = 'travel';
      if (r.success) {
        log(s, 'You bribe a flatbed, chain the van down, and float it across like a very expensive raft. It works. Nobody breathes until the far bank.');
      } else {
        swamp(s, 'The flatbed lists in the current and the van slides off in the shallows of the far side — across, but soaked, battered, and lighter.');
      }
      parkedWeather(s);
      completeDay(s, { miles: 0, resting: false, allowPool: false });
      return;
    }
    case 'ford': {
      const r = resolveFord(s.rng, c);
      s.crossing = null;
      s.phase = 'travel';
      if (r.success) {
        log(s, `You ford ${spec.name} in low range, water at the rocker panels, and climb the far bank dripping and cheering.`);
        return;
      }
      if (r.severity === 1) {
        swamp(s, 'Deeper than it looked. Water over the floorboards, the engine coughing, the van wallowing to the far bank on momentum and prayer.');
        parkedWeather(s);
        completeDay(s, { miles: 0, resting: false, allowPool: false });
        if (s.phase === 'travel') {
          notice(
            s,
            'ford-swamped',
            [
              'Deeper than it looked. Water over the floorboards, the engine coughing, the van wallowing to the far bank on momentum and prayer.',
              'You spend the day on the bank drying everything you own. Some of the food is river now. So is some of the gas.',
            ],
            null,
            spec.title,
          );
        }
        return;
      }
      // The van rolls.
      s.supplies.food = Math.round(s.supplies.food * 0.6);
      s.supplies.water = Math.round(s.supplies.water * 0.6);
      s.supplies.fuel = Math.round(s.supplies.fuel * 0.7);
      wearVan(s, 35);
      const lines = [
        'The current takes the van broadside. It rolls once, slow as a nightmare, and comes to rest on its side in the shallows of the far bank.',
      ];
      if (r.drowned) {
        const alive = s.crew.map((m, i) => (m.alive ? i : -1)).filter((i) => i >= 0);
        const i = alive[nextInt(s.rng, 0, alive.length - 1)]!;
        const lost = s.crew[i]!;
        s.crew[i] = { ...lost, health: 0, alive: false, conditions: [] };
        recordDeath(s, lost.name, DEATH_CAUSES.drowning);
        lines.push(`${lost.name} does not come up. The river keeps what it takes.`);
        if (aliveCount(s) === 0) {
          for (const t of lines) log(s, t);
          s.deathCause = DEATH_CAUSES.drowning;
          s.phase = 'epitaph';
          log(s, 'The road has taken everyone.');
          return;
        }
      }
      lines.push('A wrecker with 8 WEST IT — ROADSIDE DIV. on the door rights the van by nightfall. Everything you own has been in the river. Some of it is still there.');
      for (const t of lines) log(s, t);
      parkedWeather(s);
      completeDay(s, { miles: 0, resting: false, allowPool: false });
      if (s.phase === 'travel') notice(s, 'ford-rolled', lines, null, spec.title);
      return;
    }
  }
}

// ---------------------------------------------------------------------------
// Stop specials: the one thing a landmark is famous for
// ---------------------------------------------------------------------------

interface StopSpecial {
  label: string;
  once: boolean;
  costCents: number;
  apply(s: GameState): void;
}

const STOP_SPECIALS: Record<string, StopSpecial> = {
  dateland: {
    label: 'Date shakes for everyone ($15)',
    once: true,
    costCents: TUNING.dateShakeCents,
    apply(s) {
      healAll(s, TUNING.dateShakeHealth);
      log(s, 'Five date shakes, cold enough to hurt and sweet enough to forgive the desert. The crew goes quiet in the good way. Everyone feels better than they have since Texas Canyon.');
    },
  },
  'center-of-the-world': {
    label: 'Stand on the Center of the World ($3)',
    once: true,
    costCents: TUNING.centerOfWorldCents,
    apply(s) {
      healAll(s, 2);
      log(s, 'You pay three dollars, stand on the bronze plaque at the exact Center of the World, and receive a certificate saying so. It is laminated. Nobody can argue with laminated.');
    },
  },
  jacumba: {
    label: 'Soak a day in the hot springs (rest — heals double)',
    once: false,
    costCents: 0,
    apply(s) {
      log(s, 'A day in the hot springs at Jacumba: the mineral water takes the road out of everyone’s shoulders, and the van cools in the shade of a palm older than the highway.');
      parkedWeather(s);
      completeDay(s, { miles: 0, resting: true, allowPool: false, extraHealthAll: TUNING.restHealthGain });
    },
  },
};

function specialAt(s: GameState): { id: string; special: StopSpecial } | null {
  if (s.phase !== 'stop' || s.atStopIndex === null) return null;
  const stop = stopAt(s.atStopIndex);
  const special = STOP_SPECIALS[stop.id];
  if (!special) return null;
  if (special.once && s.usedEventIds.includes(`special:${stop.id}`)) return null;
  if (s.cash < special.costCents) return null;
  return { id: stop.id, special };
}

// ---------------------------------------------------------------------------
// Event resolution
// ---------------------------------------------------------------------------

function resolveEventChoice(s: GameState, index: number): void {
  const ev = s.pendingEvent;
  s.pendingEvent = null;
  if (!ev) return;
  const w = s.weatherToday ?? { label: 'mild', heat: 0 as const, event: 'none' as const };
  if (ev.id === 'dust') {
    if (index === 0) {
      const miles = Math.round(milesForDay(s.rng, s.pace, s.van.condition, w) / 2);
      s.van.condition = Math.max(5, s.van.condition - 15);
      log(s, 'You push into the brown-out at a crawl, sand hissing through every seam. The paint will never forgive you.');
      completeDay(s, { miles, resting: false, allowPool: false, extraHealthAll: -3 });
    } else {
      log(s, 'You pull off, seal the windows, and let the storm walk over you. A lost day, but everyone keeps their lungs.');
      completeDay(s, { miles: 0, resting: false, allowPool: false, extraWater: 2 });
    }
    return;
  }
  if (ev.id === 'monsoon') {
    if (index === 0) {
      const swamped = chance(s.rng, 0.35);
      const miles = milesForDay(s.rng, s.pace, s.van.condition, w);
      if (swamped) {
        const foodLost = Math.round(s.supplies.food * 0.15);
        s.supplies.food = Math.max(0, s.supplies.food - foodLost);
        s.van.condition = Math.max(5, s.van.condition - 15);
        log(s, `The second wash is deeper than it looked. Water over the floorboards — ${foodLost} lbs of food ruined and the van coughing.`);
      } else {
        log(s, 'You thread the washes between surges, white-knuckled, and come out the other side lighter of heart only.');
      }
      completeDay(s, { miles, resting: false, allowPool: false });
    } else {
      log(s, 'Desert rule: never argue with moving water. You camp on high ground and watch the flood spend itself.');
      completeDay(s, { miles: 0, resting: false, allowPool: false });
    }
    return;
  }
  if (ev.id === 'dunes') {
    resolveDunes(s, ev, index);
    return;
  }
  if (ev.id === 'in-ko-pah') {
    resolveInKoPah(s, index);
    return;
  }
  if (ev.id === 'summit') {
    if (index === 0) startDescent(s);
    else takeOld80(s);
    return;
  }
  if (ev.id === 'cliffs') {
    finishAtTheCliffs(s, index);
    return;
  }
  if (ev.id === 'dexcom-low') {
    resolveDexcom(s, index, w);
    return;
  }
  s.phase = s.resumePhase;
}

const CELEBRATIONS: readonly Celebration[] = ['cannonball', 'swan', 'towels'];

const CELEBRATION_LINES: Record<Celebration, string> = {
  cannonball:
    'You went first, and you went in like a dropped safe. The splash reached the top of the cliff. The crew is still yelling about it.',
  swan: 'You went first: a swan dive, or something the crew agreed afterwards to call a swan dive. You came up laughing salt water.',
  towels:
    'You held the towels and the phones and cheered the whole crew off the edge one by one. Somebody has to. It was still the best day of the run.',
};

function finishAtTheCliffs(s: GameState, index: number): void {
  s.celebration = CELEBRATIONS[index] ?? 'cannonball';
  s.phase = 'victory';
  s.gameOver = true;
  log(s, CELEBRATION_LINES[s.celebration]);
}

function resolveEventContinue(s: GameState): void {
  const ev = s.pendingEvent;
  s.pendingEvent = null;
  if (ev?.id === 'gas-tow') {
    s.cash -= 8500;
    s.supplies.fuel = 5;
    completeDay(s, { miles: 0, resting: false, allowPool: false });
    return;
  }
  if (ev?.id === 'gas-wait') {
    s.supplies.fuel = 5;
    completeDay(s, { miles: 0, resting: false, allowPool: false, extraHealthAll: -5 });
    if (s.phase === 'travel' || s.phase === 'stop') {
      completeDay(s, { miles: 0, resting: false, allowPool: false });
    }
    return;
  }
  if (s.gameOver) {
    s.phase = s.deathCause ? 'dead' : 'victory';
    return;
  }
  if (s.pendingArrival) {
    arrive(s);
    return;
  }
  s.phase = s.resumePhase;
}

function finishSnackRun(s: GameState): void {
  const snack = s.snack!;
  const gained = snackTotal(snack.results);
  snack.gainedLbs = gained;
  s.supplies.food = Math.min(TUNING.foodMax, s.supplies.food + gained);
  s.snackRunsSinceStop += 1;
  const overshoot = snack.results.reduce((a, r) => a + r.lbs, 0);
  parkedWeather(s);
  s.snack = null;
  const lines =
    overshoot > gained
      ? [
          `You grabbed ${overshoot} lbs of roadside provisions — but could only carry ${gained} lbs back to the van.`,
          'The rest becomes legend, and coyote breakfast.',
        ]
      : gained > 0
        ? [`You haul ${gained} lbs of roadside provisions back to the van. The day is spent, and worth it.`]
        : ['The stand was picked clean and your order came out wrong. A day lost for a lesson learned.'];
  if (gained > 0 && kannonAboard(s)) lines.push(SNACK_CARB_LINE);
  completeDay(s, { miles: 0, resting: false, allowPool: false });
  if (s.phase === 'travel' || s.phase === 'stop') {
    notice(s, 'snack-done', lines);
  }
}

// ---------------------------------------------------------------------------
// The reducer
// ---------------------------------------------------------------------------

export function reduce(state: GameState, action: Action): GameState {
  const s = structuredClone(state);
  s.storeNotice = null;

  switch (action.type) {
    case 'START_NEW':
      s.phase = 'occupation';
      return s;

    case 'CHOOSE_OCCUPATION':
      s.occupation = action.occupation;
      s.cash = TUNING.startingCashCents[action.occupation];
      s.phase = 'month';
      return s;

    case 'CHOOSE_MONTH':
      s.month = action.month;
      s.dayOfMonth = 1;
      s.phase = 'naming';
      s.namingIndex = 0;
      s.crew = [];
      return s;

    case 'SUBMIT_NAME': {
      if (s.phase === 'claim') {
        if (!s.claim || s.claim.step !== 'name') return s;
        const nick = action.name.trim().slice(0, 16);
        if (nick.length >= 2) s.claim.name = nick;
        s.claim.step = 'email';
        return s;
      }
      const name = action.name.trim() || s.suggestedNames[s.namingIndex] || `Crew ${s.namingIndex + 1}`;
      s.crew.push({ name: name.slice(0, 16), health: 100, alive: true, conditions: [] });
      s.namingIndex += 1;
      if (s.namingIndex >= TUNING.crewSize) {
        s.phase = 'store';
        s.atStopIndex = 0;
      }
      return s;
    }

    case 'BUY': {
      const stopIndex = s.atStopIndex ?? 0;
      const result = purchase(s.cash, s.supplies, action.item, action.units, stopIndex, capacities(s.upgrades));
      if (result.ok) {
        s.cash = result.cash;
        s.supplies = result.supplies;
        s.storeNotice = 'Sold. The register drawer sticks, like always.';
      } else {
        s.storeNotice =
          result.reason === 'funds'
            ? 'Your wallet says no. The register agrees.'
            : 'The van is full. Physics says no. (Van upgrades make it bigger.)';
      }
      return s;
    }

    case 'STORE_TAB':
      if (s.phase !== 'store') return s;
      s.storeTab = action.tab;
      s.storeNotice = null;
      return s;

    case 'UPGRADE': {
      if (s.phase !== 'store') return s;
      const stopIndex = s.atStopIndex ?? 0;
      const result = purchaseUpgrade(s.cash, s.upgrades, action.id, stopIndex);
      const def = UPGRADE_ITEMS.find((u) => u.id === action.id)!;
      if (result.ok) {
        s.cash = result.cash;
        s.upgrades = result.upgrades;
        s.storeNotice = `${def.label}: bolted on. ${fmtCents(priceCentsAt(action.id, stopIndex))}, and it stays with the van.`;
        log(s, `${def.label} fitted at the shop for ${fmtCents(priceCentsAt(action.id, stopIndex))}.`);
      } else {
        s.storeNotice =
          result.reason === 'owned'
            ? `You already have the ${def.label.toLowerCase()}. One is plenty.`
            : 'Your wallet says no. The mechanic goes back to his radio.';
      }
      return s;
    }

    case 'REPAIR': {
      if (s.phase !== 'store') return s;
      const quote = repairQuote(s.van.condition, s.atStopIndex ?? 0);
      if (!quote) {
        s.storeNotice = 'The mechanic looks under the hood and finds nothing to bill you for. Suspicious.';
        return s;
      }
      if (s.cash < quote.cents) {
        s.storeNotice = 'Your wallet says no. The mechanic shrugs and goes back to his radio.';
        return s;
      }
      s.cash -= quote.cents;
      s.van.condition = Math.min(100, s.van.condition + quote.points);
      s.storeNotice = `Tune-up done: +${quote.points} to the van, ${fmtCents(quote.cents)} to the mechanic. He says something about the belts.`;
      log(s, `Tune-up at the shop: the van is back to ${Math.round(s.van.condition)}/100 for ${fmtCents(quote.cents)}.`);
      return s;
    }

    case 'LEAVE_STORE':
      if (s.day === 0) {
        s.day = 1;
        s.phase = 'travel';
        log(s, 'You pull out of Las Cruces with the morning sun behind you and 730 miles of desert ahead.');
      } else {
        s.phase = 'stop';
      }
      return s;

    case 'DRIVE':
      if (s.phase !== 'travel' || s.gameOver) return s;
      driveDay(s);
      return s;

    case 'REST': {
      if (s.gameOver) return s;
      parkedWeather(s);
      completeDay(s, { miles: 0, resting: true, allowPool: false });
      return s;
    }

    case 'OPEN':
      if (action.screen === 'report' && !reportableMemorial(s)) return s;
      if (action.screen === 'leaderboard') {
        s.board = null;
        s.boardStatus = 'loading';
      }
      s.returnPhase = s.phase;
      s.phase = action.screen;
      return s;

    case 'BACK':
      s.phase = s.returnPhase;
      return s;

    case 'SET_PACE':
      s.pace = action.pace;
      s.phase = s.returnPhase;
      return s;

    case 'SET_RATIONS':
      s.rations = action.rations;
      s.phase = s.returnPhase;
      return s;

    case 'EVENT_CHOICE':
      if (s.phase !== 'event') return s;
      resolveEventChoice(s, action.index);
      return s;

    case 'EVENT_CONTINUE':
      if (s.phase !== 'event') return s;
      resolveEventContinue(s);
      return s;

    case 'STOP_SHOP':
      if (s.phase === 'stop') {
        s.phase = 'store';
        s.storeTab = 'supplies';
        s.storeNotice = null;
      }
      return s;

    case 'STOP_TALK': {
      if (s.phase !== 'stop') return s;
      const tip = pick(s.rng, TOWN_TALK);
      s.storeNotice = tip;
      log(s, tip);
      return s;
    }

    case 'STOP_SPECIAL': {
      const found = specialAt(s);
      if (!found) return s;
      if (found.special.once) s.usedEventIds.push(`special:${found.id}`);
      s.cash -= found.special.costCents;
      found.special.apply(s);
      return s;
    }

    case 'STOP_LEAVE': {
      if (s.phase !== 'stop') return s;
      const index = s.atStopIndex ?? s.nextStopIndex - 1;
      const stop = stopAt(index);
      s.nextStopIndex = index + 1;
      s.atStopIndex = null;
      if (!beginCrossing(s, stop)) s.phase = 'travel';
      return s;
    }

    case 'CROSS':
      if (s.phase !== 'crossing' || !s.crossing) return s;
      resolveCrossing(s, action.method);
      return s;

    case 'GRADE_STEP':
      if (s.phase !== 'grade' || !s.grade) return s;
      s.grade = gradeStep(s.grade, action.move);
      if (s.grade.lastLine) log(s, s.grade.lastLine);
      if (s.grade.outcome !== null) finishGrade(s);
      return s;

    case 'SNACK_START':
      if (s.phase !== 'travel' || s.gameOver) return s;
      s.snack = {
        round: 0,
        words: snackWordsFor(s.rng, TUNING.snackRounds),
        results: [],
        gainedLbs: 0,
      };
      s.phase = 'snack';
      return s;

    case 'SNACK_SUBMIT': {
      if (s.phase !== 'snack' || !s.snack) return s;
      const word = s.snack.words[s.snack.round];
      if (word === undefined) return s;
      const y = snackYield(word, action.typed, action.ms, s.snackRunsSinceStop);
      s.snack.results.push({ word, typed: action.typed, ms: action.ms, hit: y.hit, lbs: y.lbs });
      s.snack.round += 1;
      if (s.snack.round >= s.snack.words.length) finishSnackRun(s);
      return s;
    }

    case 'SUBMIT_EPITAPH': {
      const text = action.text.trim().toUpperCase() || EPITAPH_DEFAULT;
      s.epitaph = text.slice(0, 60);
      s.gameOver = true;
      s.runMemorials.push({
        names: s.crew.map((m) => m.name),
        mile: s.mile,
        day: s.day,
        cause: s.deathCause ?? 'THE ROAD',
        epitaph: s.epitaph,
      });
      s.phase = 'dead';
      return s;
    }

    case 'RESTART':
      return createGame(`${s.seed}*`, [...s.memorials, ...s.runMemorials]);

    case 'MEMORIALS_LOADED':
      s.memorials = action.memorials;
      return s;

    case 'MEMORIAL_POSTED':
      if (s.phase === 'dead') s.memorialPosted = { id: action.id, mile: action.mile };
      return s;

    case 'REPORT_MEMORIAL': {
      if (s.phase !== 'report') return s;
      if (!s.reportedMemorialIds.includes(action.id)) s.reportedMemorialIds.push(action.id);
      log(s, COPY.reportThanks);
      s.phase = s.returnPhase;
      return s;
    }

    case 'RUN_POSTED':
      s.runRank = { rank: action.rank, total: action.total };
      return s;

    case 'CLAIM_START': {
      if (s.phase !== 'victory') return s;
      const first = s.crew.find((m) => m.alive)?.name ?? 'Somebody';
      s.claim = { step: 'name', name: first.slice(0, 16), email: null, consented: false, unsubscribeUrl: null };
      s.returnPhase = 'victory';
      s.phase = 'claim';
      return s;
    }

    case 'CLAIM_SKIP': {
      if (s.phase !== 'claim' || !s.claim) return s;
      if (s.claim.step === 'name') {
        s.claim = null;
        s.phase = 'victory';
      } else {
        s.claim.email = null;
        s.claim.consented = false;
        s.claim.step = 'done';
      }
      return s;
    }

    case 'SUBMIT_EMAIL': {
      if (s.phase !== 'claim' || !s.claim || s.claim.step !== 'email') return s;
      const email = action.email.trim().slice(0, 80);
      if (email) {
        s.claim.email = email;
        s.claim.step = 'consent';
      } else {
        s.claim.email = null;
        s.claim.step = 'done';
      }
      return s;
    }

    case 'CLAIM_CONSENT': {
      if (s.phase !== 'claim' || !s.claim || s.claim.step !== 'consent') return s;
      s.claim.consented = true;
      s.claim.step = 'done';
      return s;
    }

    case 'CLAIM_POSTED':
      if (s.claim) s.claim.unsubscribeUrl = action.unsubscribeUrl;
      return s;

    case 'LEADERBOARD_LOADED':
      s.board = action.board;
      s.boardStatus = action.board ? 'ready' : 'failed';
      return s;
  }
}

// ---------------------------------------------------------------------------
// The view
// ---------------------------------------------------------------------------

function statusOf(s: GameState): StatusData {
  const nextIndex = s.atStopIndex !== null ? s.atStopIndex + 1 : s.nextStopIndex;
  const next = ROUTE[Math.min(nextIndex, ROUTE.length - 1)]!;
  return {
    date: `${MONTH_NAMES[s.month]} ${s.dayOfMonth}`,
    day: s.day,
    mile: s.mile,
    nextStop: next.name,
    nextStopMiles: Math.max(0, next.mile - s.mile),
    cash: fmtCents(s.cash),
    food: s.supplies.food,
    water: s.supplies.water,
    fuel: s.supplies.fuel,
    parts: `${s.supplies.tires}t ${s.supplies.belts}b ${s.supplies.hoses}h`,
    pace: s.pace,
    rations: s.rations,
    van: Math.round(s.van.condition),
    weather: s.weatherToday?.label ?? null,
    crew: s.crew.map((m) => ({
      name: m.name,
      label: m.alive ? healthStatus(m.health).toUpperCase() : 'LOST',
      badge: isKannon(m) ? 't1d' : null,
    })),
  };
}

function screen(s: GameState, partial: Partial<Screen>): Screen {
  return {
    scene: sceneOf(s),
    set: null,
    title: '',
    lines: [],
    choices: [],
    input: null,
    status: null,
    art: null,
    ...partial,
  };
}

const PACE_DESCRIPTIONS: Record<Pace, string> = {
  steady: 'Steady — 8 easy hours. The van approves.',
  strenuous: 'Strenuous — dawn to dusk. Wears on everyone.',
  grueling: 'Grueling — drive till the lines blur. Fast, and it costs you.',
};

const RATION_DESCRIPTIONS: Record<Rations, string> = {
  filling: 'Filling — 3 lbs each per day. Morale rides on burritos.',
  meager: 'Meager — 2 lbs each per day. Stomachs grumble, wallets don’t.',
  barebones: 'Bare-bones — 1 lb each per day. Survivable. Barely. For a while.',
};

function eventArt(id: string): ScreenArt {
  if (id === 'summit') return 'summit';
  if (id === 'dunes' || id === 'in-ko-pah') return 'hazard';
  if (id === 'grade-done' || id === 'grade-ramp' || id === 'old80-done') return 'grade';
  if (id === 'ford-swamped' || id === 'ford-rolled') return 'crossing';
  return null;
}

function graveSet(s: GameState): SetPiece {
  return {
    kind: 'grave',
    cause: s.deathCause ?? 'THE ROAD',
    epitaph: s.epitaph,
    names: s.crew.map((m) => m.name),
    day: s.day,
    mile: s.mile,
  };
}

function victorySet(s: GameState): SetPiece {
  const occupation = s.occupation!;
  return {
    kind: 'victory',
    survivors: s.crew.filter((m) => m.alive).map((m) => m.name),
    celebration: s.celebration,
    summitRoute: s.summitRoute,
    score: computeScore(s.crew, s.supplies, s.cash, occupation),
    occupation,
    days: s.day,
    miles: s.mile,
  };
}

export function view(s: GameState): Screen {
  switch (s.phase) {
    case 'title':
      return screen(s, {
        title: 'THE 8 WEST TRAIL',
        art: 'title',
        lines: [
          'Las Cruces to the Pacific. 730 miles. One 1985 Econoline.',
          'A road game from 8 WEST IT — in loving memory of every green screen in every school computer lab.',
          '',
          'Seventeen stops. One river. One 6% grade. The 8 dead-ends at the beach — and so, one way or another, will you.',
        ],
        choices: [
          { key: '1', label: 'Hit the road', action: { type: 'START_NEW' } },
          { key: '2', label: 'How to play', action: { type: 'OPEN', screen: 'help' } },
          { key: '3', label: 'About 8 West', action: { type: 'OPEN', screen: 'about' } },
          { key: '4', label: 'The 8 West leaderboard', action: { type: 'OPEN', screen: 'leaderboard' } },
        ],
      });

    case 'occupation':
      return screen(s, {
        title: 'WHO SIGNS THE EXPENSE REPORT?',
        lines: [
          'Choose your role. Less money means more glory: the final score is multiplied.',
          '',
          'CEO        — $2,500 to spend, score x1. The comfortable start.',
          'SYSADMIN   — $1,000 to spend, score x2. The sensible start.',
          'INTERN     — $400 to spend,   score x3. The legend start.',
        ],
        choices: [
          { key: '1', label: 'CEO ($2,500, x1)', action: { type: 'CHOOSE_OCCUPATION', occupation: 'ceo' } },
          { key: '2', label: 'Sysadmin ($1,000, x2)', action: { type: 'CHOOSE_OCCUPATION', occupation: 'sysadmin' } },
          { key: '3', label: 'Intern ($400, x3)', action: { type: 'CHOOSE_OCCUPATION', occupation: 'intern' } },
        ],
      });

    case 'month':
      return screen(s, {
        title: 'WHEN DO YOU LEAVE LAS CRUCES?',
        lines: [
          'Spring is mild but the dust storms hunt the I-10 corridor.',
          'Summer is honest: it simply tries to kill you. July brings the monsoon, and the monsoon raises the rivers.',
          'The old hands leave in May.',
        ],
        choices: [
          { key: '1', label: 'March (dust season)', action: { type: 'CHOOSE_MONTH', month: 3 } },
          { key: '2', label: 'April (dust season)', action: { type: 'CHOOSE_MONTH', month: 4 } },
          { key: '3', label: 'May (the sweet spot)', action: { type: 'CHOOSE_MONTH', month: 5 } },
          { key: '4', label: 'June (the oven)', action: { type: 'CHOOSE_MONTH', month: 6 } },
          { key: '5', label: 'July (heat + monsoon)', action: { type: 'CHOOSE_MONTH', month: 7 } },
          { key: '6', label: 'August (heat + monsoon)', action: { type: 'CHOOSE_MONTH', month: 8 } },
        ],
      });

    case 'naming':
      return screen(s, {
        title: 'THE CREW',
        lines: [
          'Five seats in the van. Five names on the manifest.',
          COPY.nicknames,
          s.crew.length > 0 ? `Aboard so far: ${s.crew.map((m) => m.name).join(', ')}.` : 'The manifest is blank.',
        ],
        input: {
          kind: 'name',
          prompt: `Name crew member ${s.namingIndex + 1} of ${TUNING.crewSize} (ENTER for “${s.suggestedNames[s.namingIndex] ?? 'Crew'}”)`,
          placeholder: s.suggestedNames[s.namingIndex] ?? '',
        },
      });

    case 'store': {
      const stopIndex = s.atStopIndex ?? 0;
      const stop = stopAt(stopIndex);
      const quote = repairQuote(s.van.condition, stopIndex);
      const caps = capacities(s.upgrades);
      const aboard = `Aboard: ${s.supplies.food}/${caps.food} lbs food · ${s.supplies.water}/${caps.water} gal water · ${s.supplies.fuel}/${caps.fuel} gal fuel · spares ${s.supplies.tires}t/${s.supplies.belts}b/${s.supplies.hoses}h · van ${Math.round(s.van.condition)}/100`;
      const outlook = supplyOutlook(s);
      const heads = stopIndex === 0 ? ['THE OUTFITTER, LAS CRUCES. Everything ends in .85 — the owner says it’s a tribute.'] : [`SUPPLIES AT ${stop.name.toUpperCase()}. Prices climb the farther west you get.`];
      let lines: string[];
      let buys: ScreenChoice[];
      if (s.storeTab === 'upgrades') {
        lines = [
          ...heads,
          `Cash: ${fmtCents(s.cash)}`,
          '',
          'THE BACK COUNTER. Bolt it on once, keep it for the run.',
          ...UPGRADE_ITEMS.map(
            (u, i) =>
              `${i + 1}) ${u.label.padEnd(18)} ${s.upgrades[u.id] ? 'OWNED'.padEnd(8) : fmtCents(priceCentsAt(u.id, stopIndex)).padEnd(8)} ${u.blurb}`,
          ),
          '',
          aboard,
          ...(s.storeNotice ? ['', s.storeNotice] : []),
        ];
        buys = UPGRADE_ITEMS.map((u, i) => ({
          key: String(i + 1),
          label: s.upgrades[u.id] ? `${u.label} (owned)` : `${u.label} (${fmtCents(priceCentsAt(u.id, stopIndex))})`,
          action: { type: 'UPGRADE', id: u.id } as Action,
        }));
        buys.push({ key: '8', label: 'Back to supplies', action: { type: 'STORE_TAB', tab: 'supplies' } });
      } else {
        lines = [
          ...heads,
          `Cash: ${fmtCents(s.cash)}`,
          '',
          ...STORE_ITEMS.map(
            (item, i) =>
              `${i + 1}) ${item.label.padEnd(16)} ${fmtCents(priceCentsAt(item.id, stopIndex))} per ${item.unitLabel}`,
          ),
          ...(quote ? [`7) ${'Tune-up'.padEnd(16)} ${fmtCents(quote.cents)} for +${quote.points} van condition`] : []),
          '',
          aboard,
          ...(outlook.nextShop ? [`Next shop after this one: ${outlook.nextShop.shop ? outlook.nextShop.name : 'none — ' + outlook.nextShop.name + ' is the end of the road'}, ${outlook.nextShop.miles} miles (about ${outlook.nextShop.days} ${outlook.nextShop.days === 1 ? 'day' : 'days'}).`] : []),
          ...outlook.warnings.map((w) => `⚠ ${w}`),
          ...(s.storeNotice ? ['', s.storeNotice] : []),
        ];
        buys = [
          { key: '1', label: 'Buy food (1 case, 25 lbs)', action: { type: 'BUY', item: 'food', units: 1 } },
          { key: '2', label: 'Buy water (2 jugs, 10 gal)', action: { type: 'BUY', item: 'water', units: 2 } },
          { key: '3', label: 'Buy gas (5 gal)', action: { type: 'BUY', item: 'fuel', units: 5 } },
          { key: '4', label: 'Buy a spare tire', action: { type: 'BUY', item: 'tire', units: 1 } },
          { key: '5', label: 'Buy a belt', action: { type: 'BUY', item: 'belt', units: 1 } },
          { key: '6', label: 'Buy a radiator hose', action: { type: 'BUY', item: 'hose', units: 1 } },
        ];
        if (quote) {
          buys.push({ key: '7', label: `Tune-up the van (+${quote.points}, ${fmtCents(quote.cents)})`, action: { type: 'REPAIR' } });
        }
        buys.push({ key: '8', label: 'Van upgrades (bigger tanks, A/C)', action: { type: 'STORE_TAB', tab: 'upgrades' } });
      }
      return screen(s, {
        title: stopIndex === 0 && s.day === 0 ? 'OUTFITTING' : `SHOP — ${stop.name.toUpperCase()}`,
        set: {
          kind: 'store',
          outfitting: stopIndex === 0 && s.day === 0,
          stopName: stop.name,
          cashCents: s.cash,
          tab: s.storeTab,
          items: STORE_ITEMS.map((item) => ({
            id: item.id,
            label: item.label,
            unitLabel: item.unitLabel,
            cents: priceCentsAt(item.id, stopIndex),
          })),
          upgrades: UPGRADE_ITEMS.map((u) => ({
            id: u.id,
            label: u.label,
            blurb: u.blurb,
            cents: priceCentsAt(u.id, stopIndex),
            owned: s.upgrades[u.id],
          })),
          tuneUp: quote ? { cents: quote.cents, points: quote.points } : null,
        },
        lines,
        choices: [
          ...buys,
          {
            key: '0',
            label: s.day === 0 ? 'Load up and hit the road' : 'Back to town',
            action: { type: 'LEAVE_STORE' },
          },
        ],
        status: statusOf(s),
      });
    }

    case 'travel': {
      const w = s.weatherToday;
      const outlook = supplyOutlook(s);
      // Today's news only: yesterday's event must not ride along as if it were new.
      const today = s.log.filter((l) => l.day === s.day).slice(-3);
      return screen(s, {
        title: 'THE ROAD',
        lines: [
          `Day ${s.day}. ${MONTH_NAMES[s.month]} ${s.dayOfMonth}. ${w ? `Weather: ${w.label}.` : 'Morning, and the key is in the ignition.'}`,
          s.milesToday > 0 ? `Yesterday the van made ${s.milesToday} miles.` : '',
          ...today.map((l) => `· ${l.text}`),
          ...outlook.warnings.slice(0, 2).map((wn) => `· ⚠ ${wn}`),
        ].filter(Boolean),
        choices: [
          { key: '1', label: 'Drive on', action: { type: 'DRIVE' } },
          { key: '2', label: 'Rest a day (heal up — everyone still eats and drinks)', action: { type: 'REST' } },
          { key: '3', label: 'Snack run (a day foraging — food only, no water)', action: { type: 'SNACK_START' } },
          { key: '4', label: 'Change pace', action: { type: 'OPEN', screen: 'pace' } },
          { key: '5', label: 'Change rations', action: { type: 'OPEN', screen: 'rations' } },
          { key: '6', label: 'Check supplies', action: { type: 'OPEN', screen: 'supplies' } },
          { key: '7', label: 'Look at the map', action: { type: 'OPEN', screen: 'map' } },
          ...(reportableMemorial(s) ? [{ key: '8', label: 'Report that memorial', action: { type: 'OPEN', screen: 'report' } as Action }] : []),
        ],
        status: statusOf(s),
      });
    }

    case 'report': {
      const m = reportableMemorial(s);
      const id = m?.id ?? '';
      const report = (reason: ReportReason): Action => ({ type: 'REPORT_MEMORIAL', id, reason });
      return screen(s, {
        title: 'REPORT A MEMORIAL',
        lines: [
          m ? `Mile ${m.mile}: “${m.epitaph}” — ${m.names.join(', ')}` : 'Nothing to report today.',
          '',
          COPY.reportWhy,
        ],
        choices: [
          { key: '1', label: 'Rude', action: report('rude') },
          { key: '2', label: 'Someone’s real name', action: report('real-name') },
          { key: '3', label: 'Spam', action: report('spam') },
          { key: '4', label: 'Something else', action: report('other') },
          { key: '0', label: 'Back', action: { type: 'BACK' } },
        ],
      });
    }

    case 'event': {
      const ev = s.pendingEvent!;
      return screen(s, {
        title: ev.title ?? '* * *',
        art: eventArt(ev.id),
        lines: ev.text,
        choices: ev.choices
          ? ev.choices.map((c, i) => ({ key: String(i + 1), label: c.label, action: { type: 'EVENT_CHOICE', index: i } }))
          : [{ key: '1', label: 'Press on', action: { type: 'EVENT_CONTINUE' } }],
        status: statusOf(s),
      });
    }

    case 'stop': {
      const stop = stopAt(s.atStopIndex ?? 0);
      const special = specialAt(s);
      const outlook = supplyOutlook(s);
      // The shop comes first where there is one: the next one may be 155 miles off.
      const choices: ScreenChoice[] = [];
      if (stop.hasShop) choices.push({ key: '1', label: 'Shop for supplies', action: { type: 'STOP_SHOP' } });
      choices.push({ key: stop.hasShop ? '2' : '1', label: 'Back on the road', action: { type: 'STOP_LEAVE' } });
      choices.push(
        { key: '3', label: 'Talk to the locals', action: { type: 'STOP_TALK' } },
        { key: '4', label: 'Rest a day (heal up — everyone still eats and drinks)', action: { type: 'REST' } },
        { key: '5', label: 'Check supplies', action: { type: 'OPEN', screen: 'supplies' } },
        { key: '6', label: 'Look at the map', action: { type: 'OPEN', screen: 'map' } },
      );
      if (special) choices.push({ key: '7', label: special.special.label, action: { type: 'STOP_SPECIAL' } });
      const ahead = outlook.nextShop
        ? outlook.nextShop.shop
          ? `Next shop: ${outlook.nextShop.name}, ${outlook.nextShop.miles} miles (about ${outlook.nextShop.days} ${outlook.nextShop.days === 1 ? 'day' : 'days'}).`
          : `No more shops: ${outlook.nextShop.name} is ${outlook.nextShop.miles} miles (about ${outlook.nextShop.days} days). What you carry is what you have.`
        : '';
      return screen(s, {
        title: stop.name.toUpperCase(),
        lines: [
          stop.flavor,
          ...(stop.hasShop && ahead ? ['', ahead] : []),
          ...outlook.warnings.map((wn) => `⚠ ${wn}${stop.hasShop ? ' Stock up here.' : ''}`),
          ...(s.storeNotice ? ['', s.storeNotice] : []),
        ],
        choices,
        status: statusOf(s),
      });
    }

    case 'crossing': {
      const c = s.crossing!;
      const spec = RIVERS[c.river];
      const ford = fordRisk(c);
      const float = floatRisk(c);
      return screen(s, {
        title: spec.title,
        art: 'crossing',
        set: {
          kind: 'crossing',
          river: c.river,
          depthFt: c.depthFt,
          safeFt: spec.fordSafeFt,
          currentMph: c.currentMph,
          daysWaited: c.daysWaited,
          ferryName: spec.ferryName,
          ferryCents: spec.ferryCents,
          fordRisk: ford,
          floatRisk: float,
        },
        lines: [
          spec.blurb,
          '',
          `Depth: ${c.depthFt.toFixed(1)} ft (the ferry hand's rule says ${spec.fordSafeFt} ft). Current: ${c.currentMph} mph.`,
          c.daysWaited > 0 ? `You have waited ${c.daysWaited} ${c.daysWaited === 1 ? 'day' : 'days'} on this bank. The river has come down some.` : '',
          '',
          `Fording it ${riskLabel(ford)}. Floating the van across on a flatbed ${riskLabel(float)}.`,
          `${spec.ferryName} will take you across for ${fmtCents(spec.ferryCents)}. You'd lose the day.`,
          ...(s.storeNotice ? ['', s.storeNotice] : []),
        ].filter((l, i, arr) => l !== '' || (i > 0 && arr[i - 1] !== '')),
        choices: [
          { key: '1', label: 'Ford it', action: { type: 'CROSS', method: 'ford' } },
          { key: '2', label: 'Float the van across on a flatbed', action: { type: 'CROSS', method: 'float' } },
          { key: '3', label: `Take the ferry (${fmtCents(spec.ferryCents)})`, action: { type: 'CROSS', method: 'ferry' } },
          { key: '4', label: 'Wait a day for the river to drop', action: { type: 'CROSS', method: 'wait' } },
          { key: '5', label: 'Check supplies', action: { type: 'OPEN', screen: 'supplies' } },
          { key: '6', label: 'Look at the map', action: { type: 'OPEN', screen: 'map' } },
        ],
        status: statusOf(s),
      });
    }

    case 'grade': {
      const g = s.grade!;
      const steepNext = g.steep[g.segment] ?? false;
      return screen(s, {
        title: 'THE 6% GRADE',
        art: 'grade',
        set: {
          kind: 'grade',
          brakeTemp: g.brakeTemp,
          fadeTemp: GRADE.fadeTemp,
          smokingTemp: GRADE.smokingTemp,
          speed: g.speed,
          maxSpeed: GRADE.maxSpeed,
          steep: [...g.steep],
          segment: g.segment,
        },
        lines: [
          g.lastLine ??
            'The sign at the top: 6% GRADE — NEXT 6 MILES — TRUCKS USE LOW GEAR. The van is not a truck, and it is not in low gear yet.',
          '',
          `The profile, as the sign at the top drew it: ${g.steep.map((st, i) => (i < g.segment ? '✓' : st ? 'STEEP' : 'easy')).join(' → ')}`,
          `Stretch ${g.segment + 1} of ${GRADE.segments}: ${steepNext ? 'STEEP — the road drops away like a bad idea.' : 'a gentle run between the curves.'}`,
          `Brakes: ${Math.round(g.brakeTemp)}° (${tempLabel(g.brakeTemp)}) · Speed: ${speedLabel(g.speed)}`,
          '',
          'Ride the brakes to shed speed (they heat up). Downshift to hold it (a little heat). Let it roll to cool them (and speed up).',
        ],
        choices: [
          { key: '1', label: 'Ride the brakes', action: { type: 'GRADE_STEP', move: 'brake' } },
          { key: '2', label: 'Downshift', action: { type: 'GRADE_STEP', move: 'downshift' } },
          { key: '3', label: 'Let it roll', action: { type: 'GRADE_STEP', move: 'coast' } },
        ],
        status: statusOf(s),
      });
    }

    case 'snack': {
      const snack = s.snack!;
      const last = snack.results[snack.results.length - 1];
      return screen(s, {
        title: 'THE SNACK RUN',
        set: {
          kind: 'snack',
          word: snack.words[snack.round] ?? '',
          round: snack.round,
          rounds: snack.words.length,
          last: last ? { word: last.word, typed: last.typed, hit: last.hit, lbs: last.lbs } : null,
          gainedLbs: snack.gainedLbs,
        },
        lines: [
          'A roadside stand shimmers into view. You have one shot at each order — call it out FAST and EXACTLY.',
          `Round ${snack.round + 1} of ${snack.words.length}.`,
          last
            ? last.hit
              ? `“${last.word}” — nailed it. ${last.lbs} lbs secured.`
              : `You yelled “${last.typed || '...'}”. The word was “${last.word}”. Nothing gained.`
            : '',
          '',
          `>>> ${snack.words[snack.round] ?? ''} <<<`,
        ].filter(Boolean),
        input: { kind: 'snack', prompt: 'Type the word and hit ENTER', placeholder: '' },
        status: statusOf(s),
      });
    }

    case 'supplies':
      return screen(s, {
        title: 'THE MANIFEST',
        lines: [
          `Cash        ${fmtCents(s.cash)}`,
          `Food        ${s.supplies.food} lbs`,
          `Water       ${s.supplies.water} gal`,
          `Fuel        ${s.supplies.fuel} gal`,
          `Spares      ${s.supplies.tires} tire · ${s.supplies.belts} belt · ${s.supplies.hoses} hose`,
          `Van         ${Math.round(s.van.condition)}/100`,
          '',
          ...s.crew.map(
            (m) =>
              `${m.name.padEnd(12)} ${m.alive ? `${healthStatus(m.health).toUpperCase()}${m.conditions.length ? ` (${m.conditions.map((c) => c.kind).join(', ')})` : ''}` : 'LOST'}`,
          ),
        ],
        choices: [{ key: '0', label: 'Back', action: { type: 'BACK' } }],
        status: statusOf(s),
      });

    case 'map': {
      const lines: string[] = ['LAS CRUCES → SUNSET CLIFFS · 730 MILES', ''];
      for (const stop of ROUTE) {
        const here = s.mile >= stop.mile ? '■' : '·';
        lines.push(`${here} mile ${String(stop.mile).padStart(3)}  ${stop.name}`);
        const next = ROUTE[ROUTE.indexOf(stop) + 1];
        if (next && s.mile > stop.mile && s.mile < next.mile) {
          lines.push(`  ↓ YOU ARE HERE — mile ${s.mile}`);
        }
      }
      return screen(s, {
        title: 'THE MAP',
        lines,
        choices: [{ key: '0', label: 'Back', action: { type: 'BACK' } }],
        status: statusOf(s),
      });
    }

    case 'pace':
      return screen(s, {
        title: 'PACE',
        lines: [PACE_DESCRIPTIONS.steady, PACE_DESCRIPTIONS.strenuous, PACE_DESCRIPTIONS.grueling, '', `Current: ${s.pace}.`],
        choices: [
          { key: '1', label: 'Steady', action: { type: 'SET_PACE', pace: 'steady' } },
          { key: '2', label: 'Strenuous', action: { type: 'SET_PACE', pace: 'strenuous' } },
          { key: '3', label: 'Grueling', action: { type: 'SET_PACE', pace: 'grueling' } },
          { key: '0', label: 'Back', action: { type: 'BACK' } },
        ],
        status: statusOf(s),
      });

    case 'rations':
      return screen(s, {
        title: 'RATIONS',
        lines: [RATION_DESCRIPTIONS.filling, RATION_DESCRIPTIONS.meager, RATION_DESCRIPTIONS.barebones, '', `Current: ${s.rations}.`],
        choices: [
          { key: '1', label: 'Filling', action: { type: 'SET_RATIONS', rations: 'filling' } },
          { key: '2', label: 'Meager', action: { type: 'SET_RATIONS', rations: 'meager' } },
          { key: '3', label: 'Bare-bones', action: { type: 'SET_RATIONS', rations: 'barebones' } },
          { key: '0', label: 'Back', action: { type: 'BACK' } },
        ],
        status: statusOf(s),
      });

    case 'help':
      return screen(s, {
        title: 'HOW TO PLAY',
        lines: [
          'Get the crew from Las Cruces to Sunset Cliffs alive — 730 miles, until the 8 dead-ends at the Pacific. Then jump.',
          '',
          '· Every DRIVE is one day: the van moves, everyone eats and drinks, the desert rolls its dice.',
          '· PACE trades health for miles. RATIONS trade food for health.',
          '· Heat is the enemy. Water is the answer. Five people drink 4 to 15 gallons a DAY depending on the heat — the road screen tells you how many days are aboard.',
          '· SHOPS are only in some towns, and the gaps are long (Lordsburg to Tucson is 155 miles). When a stop warns you, buy before you leave. Prices climb westward.',
          '· VAN UPGRADES at any shop: a bigger water tank, an auxiliary gas tank, a cargo rack, air conditioning. Bought once, kept for the run. This is what the money is for.',
          '· Spares (tire, belt, hose) turn disasters into anecdotes. Shops sell a TUNE-UP for the van, too.',
          '· The SNACK RUN spends a day to type for your supper. Food only, no water, and you can only carry 100 lbs.',
          '· RESTING heals (and doubles the healing of the sick and bitten) — but everyone still eats and drinks that day.',
          '· RIVERS: ford it under two and a half feet, float it on a flatbed, pay the ferry, or wait for the water to drop.',
          '· The DUNES close the road when the wind is up. The IN-KO-PAH grade eats vans. LAGUNA SUMMIT is the big decision.',
          '· When someone dies, they stay dead. This is that kind of game.',
          '',
          'Score at the beach: crew health + supplies + cash, times your role multiplier.',
        ],
        choices: [{ key: '0', label: 'Back', action: { type: 'BACK' } }],
      });

    case 'about':
      return screen(s, {
        title: 'ABOUT',
        lines: [
          'THE 8 WEST TRAIL is a road-survival game from 8 West Ventures — the folks behind 8 West IT 365.',
          'The company is named for the highway that dead-ends at the Pacific. Now the highway has a game.',
          '',
          'It is a loving homage to the green-screen trail games of the school computer lab,',
          'built with our own words, our own desert, and our own terrible van.',
          '',
          ...ABOUT_T1D_LINES,
          '',
          ...PRIVACY_NOTE,
          '',
          '8westit.com',
        ],
        choices: [{ key: '0', label: 'Back', action: { type: 'BACK' } }],
      });

    case 'epitaph':
      return screen(s, {
        title: 'THE ROAD HAS TAKEN EVERYONE',
        art: 'grave',
        set: graveSet(s),
        lines: [
          `YOU HAVE DIED OF ${s.deathCause ?? 'THE ROAD'}.`,
          '',
          `Day ${s.day}, mile ${s.mile}. The desert closes over the story.`,
          'Someone will pass this place. Leave them a few words.',
          COPY.epitaphWarning,
        ],
        input: { kind: 'epitaph', prompt: 'Epitaph for the roadside memorial', placeholder: EPITAPH_DEFAULT },
      });

    case 'dead':
      return screen(s, {
        title: 'HERE ENDS THE RUN',
        art: 'grave',
        set: graveSet(s),
        lines: [
          `YOU HAVE DIED OF ${s.deathCause ?? 'THE ROAD'}.`,
          '',
          `“${s.epitaph}”`,
          '',
          `${s.crew.map((m) => m.name).join(' · ')}`,
          `Day ${s.day} · mile ${s.mile} of 730 · ${MONTH_NAMES[s.month]} ${s.dayOfMonth}`,
          '',
          s.memorialPosted ? COPY.memorialPosted(s.memorialPosted.mile) : COPY.memorialLocal,
          '',
          COPY.cta,
        ],
        choices: [{ key: '1', label: 'Load a new van', action: { type: 'RESTART' } }],
      });

    case 'victory': {
      if (!s.occupation) throw new Error('victory without occupation');
      return screen(s, {
        title: 'SUNSET CLIFFS, SAN DIEGO',
        art: 'victory',
        set: victorySet(s),
        lines: buildVictoryLines(s),
        choices: [
          { key: '1', label: 'Run it again', action: { type: 'RESTART' } },
          { key: '2', label: 'Put your name on the board', action: { type: 'CLAIM_START' } },
          { key: '3', label: 'See the leaderboard', action: { type: 'OPEN', screen: 'leaderboard' } },
        ],
        status: statusOf(s),
      });
    }

    case 'claim':
      return claimScreen(s);

    case 'leaderboard':
      return screen(s, { title: COPY.boardTitle, lines: boardLines(s), choices: [{ key: '0', label: 'Back', action: { type: 'BACK' } }] });
  }
}

const n = (x: number) => x.toLocaleString('en-US');

function claimScreen(s: GameState): Screen {
  const c = s.claim;
  if (!c || !s.occupation) return screen(s, { title: COPY.boardTitle, lines: [COPY.offlineBoard], choices: [{ key: '0', label: 'Back', action: { type: 'CLAIM_SKIP' } }] });
  const score = computeScore(s.crew, s.supplies, s.cash, s.occupation).total;
  const rank = s.runRank;
  switch (c.step) {
    case 'name':
      return screen(s, {
        title: COPY.boardTitle,
        lines: [
          rank ? `You made the cliffs with a score of ${n(score)}. That’s good for #${n(rank.rank)} of ${n(rank.total)} runs.` : `You made the cliffs with a score of ${n(score)}.`,
          ...(rank ? [] : [COPY.offlineBoard]),
          '',
          COPY.claimAsk,
        ],
        input: { kind: 'name', prompt: 'Nickname', placeholder: c.name },
        choices: [{ key: '0', label: 'Skip it', action: { type: 'CLAIM_SKIP' } }],
      });
    case 'email':
      return screen(s, {
        title: COPY.boardTitle,
        lines: [COPY.emailAsk],
        input: { kind: 'email', prompt: 'Email (optional)', placeholder: '' },
        choices: [{ key: '0', label: 'No thanks', action: { type: 'CLAIM_SKIP' } }],
      });
    case 'consent':
      return screen(s, {
        title: COPY.boardTitle,
        lines: [`☐ ${COPY.consent}`],
        choices: [
          { key: '1', label: 'That’s right, sign me up', action: { type: 'CLAIM_CONSENT' } },
          { key: '0', label: 'Actually, no', action: { type: 'CLAIM_SKIP' } },
        ],
      });
    case 'done':
      return screen(s, {
        title: COPY.boardTitle,
        lines: [
          rank ? `You’re #${n(rank.rank)}.` : COPY.offlineBoard,
          ...(c.unsubscribeUrl ? [`Your unsubscribe link, if you ever want it: ${c.unsubscribeUrl}`, COPY.savedHere] : []),
        ],
        choices: [
          { key: '1', label: 'See the leaderboard', action: { type: 'OPEN', screen: 'leaderboard' } },
          { key: '2', label: 'Run it again', action: { type: 'RESTART' } },
        ],
      });
  }
}

const SUMMIT_LABEL: Record<SummitRoute, string> = { grade: 'the 6% grade', old80: 'Old Highway 80' };
const CELEBRATION_LABEL: Record<Celebration, string> = { cannonball: 'cannonball', swan: 'swan dive', towels: 'held the towels' };

function boardRow(r: Board['top'][number], you: boolean): string {
  const bits = [r.displayName, n(r.score), r.occupation.toUpperCase(), `${r.days} days`, `${r.survivors} made it`];
  if (r.summitRoute) bits.push(SUMMIT_LABEL[r.summitRoute]);
  if (r.celebration) bits.push(CELEBRATION_LABEL[r.celebration]);
  return `#${r.rank} · ${bits.join(' · ')}${you ? ' — that’s you' : ''}`;
}

function boardLines(s: GameState): string[] {
  const lines: string[] = [];
  if (s.boardStatus === 'loading' || s.boardStatus === 'idle') lines.push(COPY.boardLoading);
  else if (s.boardStatus === 'failed' || !s.board) lines.push(COPY.offlineBoard);
  else {
    const { top, yours } = s.board;
    if (top.length === 0) lines.push(COPY.boardEmpty);
    for (const r of top) lines.push(boardRow(r, yours !== null && yours.rank === r.rank));
    if (yours && yours.rank > top.length) {
      lines.push('…', `#${n(yours.rank)} · You · ${n(yours.score)} · of ${n(yours.total)} runs`);
    }
  }
  lines.push('', COPY.boardCta1, COPY.boardCta2);
  return lines;
}

function buildVictoryLines(s: GameState): string[] {
  const occupation = s.occupation!;
  const score = computeScore(s.crew, s.supplies, s.cash, occupation);
  const survivors = s.crew.filter((m) => m.alive);
  const descent =
    s.summitRoute === 'old80'
      ? 'You came down the mountain on Old Highway 80 — the slow way, the sure way, the way the trucks that know better take.'
      : s.summitRoute === 'grade'
        ? 'You rode the 6% grade down with the brakes talking the whole way, and the brakes held.'
        : 'You came down the mountain somehow. The log is vague on the details.';
  return [
    'The 8 ran out of continent. You followed the boulevard to the edge, and the whole crew went off the sandstone into the Pacific to celebrate.',
    CELEBRATION_LINES[s.celebration ?? 'towels'],
    descent,
    '',
    `Survivors: ${survivors.length ? survivors.map((m) => m.name).join(', ') : 'none'} — ${s.day} days, ${s.mile} miles.`,
    '',
    `SCORE`,
    `  Crew ......... ${score.crewPoints}`,
    `  Supplies ..... ${score.supplyPoints}`,
    `  Cash ......... ${score.cashPoints}`,
    `  Subtotal ..... ${score.subtotal}  x${score.multiplier} (${occupation.toUpperCase()})`,
    `  TOTAL ........ ${score.total}`,
    '',
    `PHASE ${TUNING.buildPhase} ROUTE · LAS CRUCES → SUNSET CLIFFS · brought to you by 8 WEST IT 365`,
    '',
    COPY.cta,
  ];
}

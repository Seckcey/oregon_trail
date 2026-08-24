// QA helper: writes real game states for every set-piece page to
// public/qa-states.json so a browser session can drop one into localStorage
// (8wt.save.v2), hit "Continue the last run", and land on that page.
// Dev tool only — the output file is gitignored and never shipped.
//
//   npx vite-node scripts/qa-states.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { reduce, type Action } from '../src/sim/game';
import type { GameState } from '../src/sim/types';
import { arriveAt, departed, run } from '../test/helpers';

function ready(seed = 'qa', month: 3 | 4 | 5 | 6 | 7 | 8 = 5): GameState {
  return departed(seed, month, 'ceo');
}

function step(s: GameState, ...actions: Action[]): GameState {
  return run(s, ...actions);
}

const summit = arriveAt(ready(), 'laguna-summit');
const cliffs = arriveAt(ready(), 'sunset-cliffs');
const yumaStop = arriveAt(ready(), 'yuma');

const states: Record<string, GameState> = {
  road: ready(),
  map: step(ready(), { type: 'OPEN', screen: 'map' }),
  supplies: step(ready(), { type: 'OPEN', screen: 'supplies' }),
  snack: step(ready(), { type: 'SNACK_START' }),
  'road-dunes': { ...ready(), mile: 590 },
  'road-laguna': { ...ready(), mile: 692 },
  tucson: arriveAt(ready(), 'tucson'),
  dateland: arriveAt(ready(), 'dateland'),
  'yuma-stop': yumaStop,
  'yuma-crossing': step(yumaStop, { type: 'STOP_LEAVE' }),
  'gila-crossing': step(arriveAt(ready(), 'gila-bend'), { type: 'STOP_LEAVE' }),
  dunes: arriveAt(ready(), 'imperial-dunes'),
  'in-ko-pah': arriveAt(ready(), 'in-ko-pah'),
  summit,
  grade: step(summit, { type: 'EVENT_CHOICE', index: 0 }),
  'grade-hot': step(summit, { type: 'EVENT_CHOICE', index: 0 }, { type: 'GRADE_STEP', move: 'brake' }, { type: 'GRADE_STEP', move: 'brake' }),
  cliffs,
  victory: step(cliffs, { type: 'EVENT_CHOICE', index: 1 }),
};

// A crew that has seen some road: mixed health for the headshots.
const worn = ready('qa-worn');
worn.crew = worn.crew.map((m, i) => ({ ...m, health: [92, 60, 40, 15, 70][i]!, alive: i !== 3 || true }));
worn.crew[4] = { ...worn.crew[4]!, alive: false, health: 0 };
worn.van.condition = 35;
worn.mile = 500;
worn.day = 14;
states['road-worn'] = worn;

mkdirSync('public', { recursive: true });
writeFileSync('public/qa-states.json', JSON.stringify(states));
console.log(`wrote ${Object.keys(states).length} states: ${Object.keys(states).join(', ')}`);

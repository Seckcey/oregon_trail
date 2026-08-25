// localStorage persistence: the current run (with its run id, in the v3
// envelope), and the roadside memorials left by every run before it.
// Everything is wrapped in try/catch — a private window must never crash
// the game.

import type { GameState, Memorial } from '../sim/types';
import { newRunId } from './net/identity';

const SAVE_KEY_V2 = '8wt.save.v2'; // v2: Phase 2–3 — the bare GameState
const SAVE_KEY = '8wt.save.v3'; // v3: Phase 4 — { runId, state }
const MEMORIAL_KEY = '8wt.memorials.v1';
const MEMORIAL_CAP = 60;

export interface SaveEnvelope {
  runId: string;
  state: GameState;
}

function looksLikeState(x: unknown): x is GameState {
  return typeof x === 'object' && x !== null && typeof (x as GameState).seed === 'string' && typeof (x as GameState).phase === 'string';
}

/** Fields added since a save was written get their defaults. */
function upgradeState(state: GameState): GameState {
  return { ...state, memorialPosted: state.memorialPosted ?? null };
}

export function loadSave(): SaveEnvelope | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const env = JSON.parse(raw) as Partial<SaveEnvelope>;
      if (typeof env.runId !== 'string' || !looksLikeState(env.state)) return null;
      return { runId: env.runId, state: upgradeState(env.state) };
    }
    // A v2 save: adopt it under a fresh run id, once.
    const old = localStorage.getItem(SAVE_KEY_V2);
    if (!old) return null;
    const state = JSON.parse(old) as unknown;
    if (!looksLikeState(state)) return null;
    const env = { runId: newRunId(), state: upgradeState(state) };
    storeSave(env);
    localStorage.removeItem(SAVE_KEY_V2);
    return env;
  } catch {
    return null;
  }
}

export function storeSave(env: SaveEnvelope | null): void {
  try {
    if (env === null) {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(SAVE_KEY_V2);
    } else {
      localStorage.setItem(SAVE_KEY, JSON.stringify(env));
    }
  } catch {
    /* storage unavailable — play on without saves */
  }
}

export function loadMemorials(): Memorial[] {
  try {
    const raw = localStorage.getItem(MEMORIAL_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(
      (m): m is Memorial =>
        m && typeof m.mile === 'number' && typeof m.epitaph === 'string' && Array.isArray(m.names),
    );
  } catch {
    return [];
  }
}

function writeMemorials(all: Memorial[]): void {
  localStorage.setItem(MEMORIAL_KEY, JSON.stringify(all.slice(-MEMORIAL_CAP)));
}

export function addMemorials(memorials: Memorial[]): void {
  if (memorials.length === 0) return;
  try {
    writeMemorials([...loadMemorials(), ...memorials]);
  } catch {
    /* storage unavailable */
  }
}

function sameMemorial(a: Memorial, b: Memorial): boolean {
  return a.mile === b.mile && a.day === b.day && a.epitaph === b.epitaph && a.cause === b.cause && a.names.join(' ') === b.names.join(' ');
}

/** Once the server has taken a memorial, remember its id so a later sample does not show it twice. */
export function tagMemorial(memorial: Memorial, id: string): void {
  try {
    const all = loadMemorials();
    const i = all.findIndex((m) => sameMemorial(m, memorial));
    if (i < 0) return;
    all[i] = { ...all[i]!, id };
    writeMemorials(all);
  } catch {
    /* storage unavailable */
  }
}

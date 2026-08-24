// localStorage persistence: the current run, and the roadside memorials
// left by every run before it. Everything is wrapped in try/catch — a
// private window must never crash the game.

import type { GameState, Memorial } from '../sim/types';

const SAVE_KEY = '8wt.save.v1';
const MEMORIAL_KEY = '8wt.memorials.v1';
const MEMORIAL_CAP = 60;

export function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as GameState;
    if (typeof state.seed !== 'string' || typeof state.phase !== 'string') return null;
    return state;
  } catch {
    return null;
  }
}

export function storeSave(state: GameState | null): void {
  try {
    if (state === null) localStorage.removeItem(SAVE_KEY);
    else localStorage.setItem(SAVE_KEY, JSON.stringify(state));
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

export function addMemorials(memorials: Memorial[]): void {
  if (memorials.length === 0) return;
  try {
    const all = [...loadMemorials(), ...memorials];
    localStorage.setItem(MEMORIAL_KEY, JSON.stringify(all.slice(-MEMORIAL_CAP)));
  } catch {
    /* storage unavailable */
  }
}

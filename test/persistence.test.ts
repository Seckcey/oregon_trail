import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createGame } from '../src/sim/game';
import { addMemorials, loadMemorials, loadSave, storeSave, tagMemorial } from '../src/ui/persistence';

class FakeStorage implements Storage {
  private m = new Map<string, string>();
  get length() {
    return this.m.size;
  }
  clear() {
    this.m.clear();
  }
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null;
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
  setItem(k: string, v: string) {
    this.m.set(k, String(v));
  }
}

beforeEach(() => {
  (globalThis as { localStorage?: Storage }).localStorage = new FakeStorage();
});
afterEach(() => {
  delete (globalThis as { localStorage?: Storage }).localStorage;
});

describe('the save envelope', () => {
  it('v3 stores the run id beside the state and reads it back', () => {
    const state = createGame('s');
    storeSave({ runId: 'run-1', state });
    expect(loadSave()).toEqual({ runId: 'run-1', state });
    expect(localStorage.getItem('8wt.save.v3')).toContain('"runId":"run-1"');
  });
  it('a v2 save (bare state, from Phase 3 and the e2e fixtures) loads with a fresh run id and is not lost', () => {
    const state = createGame('s');
    localStorage.setItem('8wt.save.v2', JSON.stringify(state));
    const loaded = loadSave();
    expect(loaded?.state).toEqual(state);
    expect(loaded?.runId).toMatch(/^[0-9a-f-]{36}$/);
    expect(loadSave()?.runId).toBe(loaded?.runId); // stable: it was re-saved as v3
    expect(localStorage.getItem('8wt.save.v2')).toBeNull();
  });
  it('null clears both keys', () => {
    localStorage.setItem('8wt.save.v2', '{"seed":"x","phase":"travel"}');
    storeSave({ runId: 'r', state: createGame('s') });
    storeSave(null);
    expect(loadSave()).toBeNull();
  });
  it('garbage is null', () => {
    localStorage.setItem('8wt.save.v3', '{"runId":1}');
    expect(loadSave()).toBeNull();
  });
});

describe('memorials in storage', () => {
  it('round-trips and keeps an id when one is given', () => {
    addMemorials([{ names: ['A'], mile: 1, day: 1, cause: 'THIRST', epitaph: 'E' }]);
    expect(loadMemorials()).toEqual([{ names: ['A'], mile: 1, day: 1, cause: 'THIRST', epitaph: 'E' }]);
    addMemorials([{ id: 'X', names: ['B'], mile: 2, day: 2, cause: 'THIRST', epitaph: 'F' }]);
    expect(loadMemorials()[1]).toEqual({ id: 'X', names: ['B'], mile: 2, day: 2, cause: 'THIRST', epitaph: 'F' });
  });
  it('tagMemorial writes the server id onto the stored memorial that matches', () => {
    const grave = { names: ['A', 'B'], mile: 212, day: 14, cause: 'THIRST', epitaph: 'REST EASY' };
    addMemorials([{ names: ['A'], mile: 100, day: 9, cause: 'HUNGER', epitaph: 'X' }, grave]);
    tagMemorial(grave, 'SRV1');
    expect(loadMemorials().map((m) => m.id ?? null)).toEqual([null, 'SRV1']);
  });
});

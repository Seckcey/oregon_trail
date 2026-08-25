import { describe, expect, it } from 'vitest';
import { loadPlayerToken, newRunId } from '../src/ui/net/identity';

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

describe('identity without accounts', () => {
  it('a run id is a uuid, new every time', () => {
    expect(newRunId()).toMatch(/^[0-9a-f-]{36}$/);
    expect(newRunId()).not.toBe(newRunId());
  });
  it('the player token is minted once per browser (32 random bytes, base64url) and kept', () => {
    const storage = new FakeStorage();
    const a = loadPlayerToken(storage);
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(loadPlayerToken(storage)).toBe(a);
    expect(storage.getItem('8wt.player.v1')).toBe(a);
    expect(loadPlayerToken(new FakeStorage())).not.toBe(a);
  });
  it('with no storage at all, a token still exists for the session', () => {
    const t = loadPlayerToken(null);
    expect(t).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
  it('a corrupt stored value is replaced', () => {
    const storage = new FakeStorage();
    storage.setItem('8wt.player.v1', 'short');
    expect(loadPlayerToken(storage)).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
});

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  isThemeId,
  loadTheme,
  otherTheme,
  resolveTheme,
  saveTheme,
  toggleLabel,
  type KeyValueStore,
} from '../src/ui/theme';

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k]! : null),
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

const throwingStore: KeyValueStore = {
  getItem() {
    throw new Error('storage disabled');
  },
  setItem() {
    throw new Error('storage disabled');
  },
};

describe('theme ids', () => {
  it('coastal is the default (marketing wants the flash)', () => {
    expect(DEFAULT_THEME).toBe('coastal');
  });

  it('recognises exactly the two theme ids', () => {
    expect(isThemeId('coastal')).toBe(true);
    expect(isThemeId('heritage')).toBe(true);
    expect(isThemeId('COASTAL')).toBe(false);
    expect(isThemeId('')).toBe(false);
    expect(isThemeId(null)).toBe(false);
    expect(isThemeId(42)).toBe(false);
  });

  it('otherTheme flips between the two', () => {
    expect(otherTheme('coastal')).toBe('heritage');
    expect(otherTheme('heritage')).toBe('coastal');
  });

  it('toggle label invites the player to the theme they are NOT on', () => {
    expect(toggleLabel('coastal')).toBe('Play it like 1985');
    expect(toggleLabel('heritage')).toBe('Back to color');
  });
});

describe('loadTheme', () => {
  it('returns null when nothing is stored', () => {
    expect(loadTheme(memoryStore())).toBeNull();
  });

  it('returns the stored theme', () => {
    expect(loadTheme(memoryStore({ [THEME_STORAGE_KEY]: 'heritage' }))).toBe('heritage');
    expect(loadTheme(memoryStore({ [THEME_STORAGE_KEY]: 'coastal' }))).toBe('coastal');
  });

  it('ignores garbage in storage', () => {
    expect(loadTheme(memoryStore({ [THEME_STORAGE_KEY]: 'neon' }))).toBeNull();
  });

  it('survives missing or throwing storage (private windows)', () => {
    expect(loadTheme(null)).toBeNull();
    expect(loadTheme(undefined)).toBeNull();
    expect(loadTheme(throwingStore)).toBeNull();
  });
});

describe('saveTheme', () => {
  it('writes the theme under the versioned key', () => {
    const store = memoryStore();
    saveTheme(store, 'heritage');
    expect(store.data[THEME_STORAGE_KEY]).toBe('heritage');
    saveTheme(store, 'coastal');
    expect(store.data[THEME_STORAGE_KEY]).toBe('coastal');
  });

  it('never throws when storage is unavailable', () => {
    expect(() => saveTheme(null, 'heritage')).not.toThrow();
    expect(() => saveTheme(throwingStore, 'heritage')).not.toThrow();
  });
});

describe('resolveTheme', () => {
  const both = ['coastal', 'heritage'] as const;

  it('falls back to the default when nothing is stored or requested', () => {
    expect(resolveTheme({ stored: null, requested: null, available: both })).toBe('coastal');
  });

  it('prefers the stored theme over the default', () => {
    expect(resolveTheme({ stored: 'heritage', requested: null, available: both })).toBe('heritage');
  });

  it('lets a ?theme= request beat the stored theme', () => {
    expect(resolveTheme({ stored: 'heritage', requested: 'coastal', available: both })).toBe('coastal');
    expect(resolveTheme({ stored: 'coastal', requested: 'heritage', available: both })).toBe('heritage');
  });

  it('only ever resolves to a theme that has a renderer registered', () => {
    // Step A of Phase 2: only Heritage is registered, Coastal comes later.
    expect(resolveTheme({ stored: 'coastal', requested: null, available: ['heritage'] })).toBe('heritage');
    expect(resolveTheme({ stored: null, requested: 'coastal', available: ['heritage'] })).toBe('heritage');
    expect(resolveTheme({ stored: 'heritage', requested: null, available: ['heritage'] })).toBe('heritage');
  });

  it('throws when no renderer is registered at all', () => {
    expect(() => resolveTheme({ stored: null, requested: null, available: [] })).toThrow();
  });
});

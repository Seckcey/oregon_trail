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
  it('the comic book is the default (marketing wants the flash)', () => {
    expect(DEFAULT_THEME).toBe('comic');
  });

  it('recognises exactly the two theme ids', () => {
    expect(isThemeId('comic')).toBe(true);
    expect(isThemeId('heritage')).toBe(true);
    expect(isThemeId('COMIC')).toBe(false);
    expect(isThemeId('')).toBe(false);
    expect(isThemeId(null)).toBe(false);
    expect(isThemeId(42)).toBe(false);
  });

  it('the cancelled Coastal theme is not a theme id any more', () => {
    expect(isThemeId('coastal')).toBe(false);
  });

  it('otherTheme flips between the two', () => {
    expect(otherTheme('comic')).toBe('heritage');
    expect(otherTheme('heritage')).toBe('comic');
  });

  it('toggle label invites the player to the theme they are NOT on', () => {
    expect(toggleLabel('comic')).toBe('Play it like 1985');
    expect(toggleLabel('heritage')).toBe('Back to color');
  });
});

describe('loadTheme', () => {
  it('returns null when nothing is stored', () => {
    expect(loadTheme(memoryStore())).toBeNull();
  });

  it('returns the stored theme', () => {
    expect(loadTheme(memoryStore({ [THEME_STORAGE_KEY]: 'heritage' }))).toBe('heritage');
    expect(loadTheme(memoryStore({ [THEME_STORAGE_KEY]: 'comic' }))).toBe('comic');
  });

  it('migrates a remembered "coastal" choice to the comic book', () => {
    // Phase 2 shipped with coastal as the stored default; those players get the comic.
    expect(loadTheme(memoryStore({ [THEME_STORAGE_KEY]: 'coastal' }))).toBe('comic');
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
    saveTheme(store, 'comic');
    expect(store.data[THEME_STORAGE_KEY]).toBe('comic');
  });

  it('keeps the Phase 2 storage key so remembered choices survive the pivot', () => {
    expect(THEME_STORAGE_KEY).toBe('8wt.theme.v1');
  });

  it('never throws when storage is unavailable', () => {
    expect(() => saveTheme(null, 'heritage')).not.toThrow();
    expect(() => saveTheme(throwingStore, 'heritage')).not.toThrow();
  });
});

describe('resolveTheme', () => {
  const both = ['comic', 'heritage'] as const;

  it('falls back to the default when nothing is stored or requested', () => {
    expect(resolveTheme({ stored: null, requested: null, available: both })).toBe('comic');
  });

  it('prefers the stored theme over the default', () => {
    expect(resolveTheme({ stored: 'heritage', requested: null, available: both })).toBe('heritage');
  });

  it('lets a ?theme= request beat the stored theme', () => {
    expect(resolveTheme({ stored: 'heritage', requested: 'comic', available: both })).toBe('comic');
    expect(resolveTheme({ stored: 'comic', requested: 'heritage', available: both })).toBe('heritage');
  });

  it('only ever resolves to a theme that has a renderer registered', () => {
    // Step A of Phase 3: only Heritage is registered, the Comic renderer comes in Step B.
    expect(resolveTheme({ stored: 'comic', requested: null, available: ['heritage'] })).toBe('heritage');
    expect(resolveTheme({ stored: null, requested: 'comic', available: ['heritage'] })).toBe('heritage');
    expect(resolveTheme({ stored: 'heritage', requested: null, available: ['heritage'] })).toBe('heritage');
  });

  it('throws when no renderer is registered at all', () => {
    expect(() => resolveTheme({ stored: null, requested: null, available: [] })).toThrow();
  });
});

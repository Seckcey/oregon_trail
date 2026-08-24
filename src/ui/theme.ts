// Theme identity and persistence. Pure: storage is injected so this is
// unit-testable without a DOM. Which renderer draws a theme lives in
// renderer.ts; the sim knows nothing about any of this.

export type ThemeId = 'comic' | 'heritage';

export const THEME_IDS: readonly ThemeId[] = ['comic', 'heritage'];

/** Marketing wants the flash: the comic book is the default. */
export const DEFAULT_THEME: ThemeId = 'comic';

/** Unchanged since Phase 2 so remembered choices survive the pivot. */
export const THEME_STORAGE_KEY = '8wt.theme.v1';

/**
 * Ids that used to be stored under the key and what they mean now. Phase 2
 * shipped "coastal" as the stored default; that theme was cancelled for the
 * comic book, so those players get the comic.
 */
const LEGACY_THEME_IDS: Record<string, ThemeId> = { coastal: 'comic' };

/** The slice of localStorage we need — injectable for tests. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEME_IDS as readonly string[]).includes(value);
}

/** The theme the player last chose (legacy ids migrated), or null if none / storage unusable. */
export function loadTheme(store: KeyValueStore | null | undefined): ThemeId | null {
  try {
    const raw = store?.getItem(THEME_STORAGE_KEY) ?? null;
    if (isThemeId(raw)) return raw;
    return raw !== null ? (LEGACY_THEME_IDS[raw] ?? null) : null;
  } catch {
    return null;
  }
}

export function saveTheme(store: KeyValueStore | null | undefined, theme: ThemeId): void {
  try {
    store?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — the choice lives for this page load only */
  }
}

export function otherTheme(theme: ThemeId): ThemeId {
  return theme === 'comic' ? 'heritage' : 'comic';
}

/** Toggle button label: names the theme the player would switch TO. */
export function toggleLabel(current: ThemeId): string {
  return current === 'comic' ? 'Play it like 1985' : 'Back to color';
}

export interface ResolveThemeOptions {
  /** What localStorage remembers. */
  stored: ThemeId | null;
  /** A ?theme= request in the URL. */
  requested: ThemeId | null;
  /** Themes that actually have a renderer registered. */
  available: readonly ThemeId[];
}

/**
 * Pick the theme to show: URL request, then remembered choice, then the
 * default — but never one without a renderer. Throws if none is registered.
 */
export function resolveTheme({ stored, requested, available }: ResolveThemeOptions): ThemeId {
  const fallback = available[0];
  if (fallback === undefined) throw new Error('no theme renderer registered');
  for (const candidate of [requested, stored, DEFAULT_THEME]) {
    if (candidate !== null && available.includes(candidate)) return candidate;
  }
  return fallback;
}

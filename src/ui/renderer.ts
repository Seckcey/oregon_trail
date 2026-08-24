// The renderer contract: one sim, one Screen model, one renderer per theme.
// main.ts owns game state and persistence and hands each renderer the same
// handlers; a renderer owns only its shell, its stylesheet, and its input.

import type { Action, Screen } from '../sim/game';
import { createComicRenderer } from './comic/index';
import { createHeritageRenderer } from './heritage/index';
import type { ThemeId } from './theme';

export interface UiHandlers {
  dispatch(action: Action): void;
  /** Extra UI-level buttons (continue-save, share) appended per screen. */
  extraButtons(): { label: string; onClick(): void }[];
  /** The theme toggle, or null while only one theme is registered. */
  themeToggle(): { label: string; onClick(): void } | null;
}

export interface Renderer {
  readonly theme: ThemeId;
  /** Build this theme's shell inside root and wire its input handling. */
  mount(root: HTMLElement, handlers: UiHandlers): void;
  /** Draw a Screen. Called after mount and again on every state change. */
  render(screen: Screen): void;
  /** Tear the shell (and stylesheet, and listeners) down for the next renderer. */
  unmount(): void;
}

/** Every theme with a renderer. */
export const RENDERERS: Partial<Record<ThemeId, () => Renderer>> = {
  comic: createComicRenderer,
  heritage: createHeritageRenderer,
};

export function availableThemes(): ThemeId[] {
  return (Object.keys(RENDERERS) as ThemeId[]).filter((id) => RENDERERS[id] !== undefined);
}

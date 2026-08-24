// URL query support: ?theme= to force a theme, ?seed= for a reproducible
// run (QA and screenshots). Pure.

import { isThemeId, type ThemeId } from './theme';

export interface GameQuery {
  theme: ThemeId | null;
  seed: string | null;
}

const SEED_MAX_LENGTH = 64;

export function parseQuery(search: string): GameQuery {
  const params = new URLSearchParams(search);
  const theme = params.get('theme');
  const seed = (params.get('seed') ?? '').trim();
  return {
    theme: isThemeId(theme) ? theme : null,
    seed: seed.length > 0 && seed.length <= SEED_MAX_LENGTH ? seed : null,
  };
}

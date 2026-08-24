import { describe, expect, it } from 'vitest';
import { RENDERERS, availableThemes } from '../src/ui/renderer';
import { resolveTheme } from '../src/ui/theme';

describe('renderer registry', () => {
  it('has the Heritage terminal registered', () => {
    expect(availableThemes()).toContain('heritage');
  });

  it('every registered factory builds a renderer for its own theme id', () => {
    for (const id of availableThemes()) {
      expect(RENDERERS[id]!().theme).toBe(id);
    }
  });

  it('resolves a default theme from what is actually registered', () => {
    expect(availableThemes()).toContain(resolveTheme({ stored: null, requested: null, available: availableThemes() }));
  });
});

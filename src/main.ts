import { createGame, reduce, view, type Action } from './sim/game';
import { computeScore } from './sim/score';
import type { GameState } from './sim/types';
import { addMemorials, loadMemorials, loadSave, storeSave } from './ui/persistence';
import { parseQuery } from './ui/query';
import { RENDERERS, availableThemes, type Renderer, type UiHandlers } from './ui/renderer';
import { loadTheme, otherTheme, resolveTheme, saveTheme, toggleLabel, type ThemeId } from './ui/theme';

function freshSeed(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function themeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function requireRoot(): HTMLElement {
  const node = document.getElementById('app');
  if (!node) throw new Error('index.html is missing the #app root');
  return node;
}

const query = parseQuery(window.location.search);
let state: GameState = createGame(query.seed ?? freshSeed(), loadMemorials());

function shareText(s: GameState): string {
  const header = `THE 8 WEST TRAIL — day ${s.day}, mile ${s.mile} of 730`;
  if (s.phase === 'victory' && s.occupation) {
    const score = computeScore(s.crew, s.supplies, s.cash, s.occupation);
    const survivors = s.crew.filter((m) => m.alive).map((m) => m.name).join(', ');
    return `${header}\nMade Tucson with ${survivors || 'no one'}. Score ${score.total} (${s.occupation.toUpperCase()} x${score.multiplier}).\nPlay at 8wt.8westit.com`;
  }
  return `${header}\nI died of ${s.deathCause ?? 'THE ROAD'}. "${s.epitaph}"\nPlay at 8wt.8westit.com`;
}

async function copyShare(): Promise<void> {
  const text = shareText(state);
  try {
    await navigator.clipboard.writeText(text);
    flashShareButton('COPIED — go brag');
  } catch {
    window.prompt('Copy your story:', text);
  }
}

function flashShareButton(label: string): void {
  const btn = document.querySelector<HTMLButtonElement>('.share-btn');
  if (btn) btn.textContent = label;
}

// ---------------------------------------------------------------------------
// Themes: one sim, one Screen, one renderer per theme. The choice persists.
// ---------------------------------------------------------------------------

const root = requireRoot();
let theme: ThemeId = resolveTheme({
  stored: loadTheme(themeStorage()),
  requested: query.theme,
  available: availableThemes(),
});
let renderer: Renderer | null = null;

const handlers: UiHandlers = {
  dispatch(action: Action): void {
    const prevPhase = state.phase;
    state = reduce(state, action);

    // Persistence side effects
    const ended = state.phase === 'dead' || state.phase === 'victory';
    if (ended && prevPhase !== state.phase) {
      addMemorials(state.runMemorials);
      storeSave(null);
    } else if (state.day > 0 && !state.gameOver) {
      storeSave(state);
    }
    render();
  },
  extraButtons() {
    const buttons: { label: string; onClick(): void }[] = [];
    if (state.phase === 'title') {
      const save = loadSave();
      if (save && !save.gameOver) {
        buttons.push({
          label: 'Continue the last run',
          onClick() {
            state = save;
            render();
          },
        });
      }
    }
    if (state.phase === 'dead' || state.phase === 'victory') {
      buttons.push({ label: 'Copy your story', onClick: () => void copyShare() });
    }
    return buttons;
  },
  themeToggle() {
    if (availableThemes().length < 2) return null;
    return { label: toggleLabel(theme), onClick: () => switchTheme(otherTheme(theme)) };
  },
};

function mountTheme(id: ThemeId): void {
  const create = RENDERERS[id];
  if (!create) throw new Error(`no renderer registered for theme "${id}"`);
  renderer?.unmount();
  document.documentElement.dataset['theme'] = id;
  renderer = create();
  renderer.mount(root, handlers);
  render();
}

function switchTheme(id: ThemeId): void {
  if (id === theme) return;
  theme = id;
  saveTheme(themeStorage(), id);
  mountTheme(id);
}

function render(): void {
  renderer?.render(view(state));
}

mountTheme(theme);

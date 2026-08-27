import { view } from './sim/game';
import { computeScore } from './sim/score';
import type { GameState } from './sim/types';
import { createTracker } from './ui/analytics';
import { outcomeSurface, workflowUrl, type OutcomeSurface } from './ui/marketing';
import { netConfig } from './ui/net/api';
import { loadPlayerToken, newRunId } from './ui/net/identity';
import { fetchLeaderboard, postRun } from './ui/net/leaderboard';
import { fetchMemorials, postMemorial, reportMemorial } from './ui/net/memorials';
import { turnstileToken } from './ui/net/turnstile';
import { addMemorials, loadMemorials, loadSave, storeSave, storeUnsubscribeUrl, tagMemorial } from './ui/persistence';
import { parseQuery } from './ui/query';
import { RENDERERS, availableThemes, type ExtraAction, type Renderer, type UiHandlers } from './ui/renderer';
import { createSession } from './ui/session';
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
const net = netConfig(import.meta.env, window.location.search);
const TURNSTILE_SITE_KEY = (import.meta.env['VITE_TURNSTILE_SITE_KEY'] ?? '').trim();

const track = createTracker(import.meta.env['VITE_GA4_ID'] ?? '');

const session = createSession(query.seed ?? freshSeed(), {
  net,
  runIdFactory: newRunId,
  loadSave,
  loadMemorials,
  storeSave,
  addMemorials,
  tagMemorial,
  fetchMemorials,
  postMemorial,
  reportMemorial,
  // No site key in the build → '' (post without a token; the dev server accepts it).
  turnstile: () => (TURNSTILE_SITE_KEY ? turnstileToken(TURNSTILE_SITE_KEY) : Promise.resolve('')),
  track,
  playerToken: loadPlayerToken(themeStorage()),
  postRun,
  fetchLeaderboard,
  storeUnsubscribeUrl,
});

function shareText(s: GameState): string {
  const header = `THE 8 WEST TRAIL — day ${s.day}, mile ${s.mile} of 730`;
  if (s.phase === 'victory' && s.occupation) {
    const score = computeScore(s.crew, s.supplies, s.cash, s.occupation);
    const survivors = s.crew.filter((m) => m.alive).map((m) => m.name).join(', ');
    return `${header}\nMade Sunset Cliffs with ${survivors || 'no one'}. Score ${score.total} (${s.occupation.toUpperCase()} x${score.multiplier}).\nPlay at 8wt.8westit.com`;
  }
  return `${header}\nI died of ${s.deathCause ?? 'THE ROAD'}. "${s.epitaph}"\nPlay at 8wt.8westit.com`;
}

async function copyShare(): Promise<void> {
  const text = shareText(session.state);
  try {
    await navigator.clipboard.writeText(text);
    flashShareButton('COPIED — go brag');
  } catch {
    window.prompt('Copy your story:', text);
  }
}

function flashShareButton(label: string): void {
  const btn = document.querySelector<HTMLButtonElement>('.extra-action--share');
  if (btn) btn.textContent = label;
}

function dispatch(action: Parameters<UiHandlers['dispatch']>[0]): void {
  const surface = outcomeSurface(session.state.phase);
  if (action.type === 'RESTART' && surface) track('trail_replay_click', { surface });
  session.dispatch(action);
}

function productAction(surface: OutcomeSurface): ExtraAction {
  return {
    kind: 'product',
    label: 'See the real workflow',
    href: workflowUrl(surface, window.location.search),
    surface,
    onClick: () => track('trail_product_click', { surface }),
  };
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
  dispatch,
  extraButtons() {
    const buttons: ExtraAction[] = [];
    const state = session.state;
    if (state.phase === 'title') {
      const save = loadSave();
      if (save && !save.state.gameOver) {
        buttons.push({ kind: 'continue', label: 'Continue the last run', onClick: () => void session.continueSave() });
      }
    }
    const surface = outcomeSurface(state.phase);
    if (surface === 'leaderboard' && state.gameOver) {
      buttons.push({ kind: 'replay', label: 'Run it again', surface, onClick: () => dispatch({ type: 'RESTART' }) });
    }
    if (surface) {
      buttons.push(productAction(surface));
      if (state.phase === 'dead' || state.phase === 'victory') {
        buttons.push({ kind: 'share', label: 'Copy your story', surface, onClick: () => void copyShare() });
      }
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
  renderer?.render(view(session.state));
}

session.onChange = render;
mountTheme(theme);

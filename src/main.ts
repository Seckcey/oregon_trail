import './style.css';
import { createGame, reduce, view, type Action, type Screen } from './sim/game';
import { computeScore } from './sim/score';
import type { GameState } from './sim/types';
import { addMemorials, loadMemorials, loadSave, storeSave } from './ui/persistence';
import { renderScreen, wireGlobalInput, type TerminalHandlers } from './ui/terminal';

function freshSeed(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

let state: GameState = createGame(freshSeed(), loadMemorials());

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

const handlers: TerminalHandlers = {
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
};

function render(): void {
  const screen: Screen = view(state);
  renderScreen(screen, handlers);
}

wireGlobalInput(handlers);
render();

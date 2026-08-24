// DOM renderer for the sim's Screen model. All game logic lives in the
// sim; this file only draws screens, forwards input, and measures the
// snack-run typing time.

import type { Action, Screen, StatusData } from '../sim/game';

export interface TerminalHandlers {
  dispatch(action: Action): void;
  /** Extra UI-level buttons (continue-save, share) appended per screen. */
  extraButtons(): { label: string; onClick(): void }[];
}

const el = {
  title: () => document.getElementById('screen-title')!,
  lines: () => document.getElementById('screen-lines')!,
  input: () => document.getElementById('screen-input') as HTMLFormElement,
  inputPrompt: () => document.getElementById('input-prompt')!,
  inputField: () => document.getElementById('input-field') as HTMLInputElement,
  choices: () => document.getElementById('screen-choices')!,
  status: () => document.getElementById('status')!,
};

let typewriterTimer: number | null = null;
let currentScreen: Screen | null = null;
let inputStartedAt = 0;
let submitLocked = false;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function cancelTypewriter(): void {
  if (typewriterTimer !== null) {
    window.clearInterval(typewriterTimer);
    typewriterTimer = null;
  }
}

function revealAll(): void {
  cancelTypewriter();
  for (const line of el.lines().querySelectorAll<HTMLElement>('.line.pending')) {
    line.classList.remove('pending');
    line.textContent = line.dataset['full'] ?? '';
  }
}

function renderLines(lines: string[]): void {
  cancelTypewriter();
  const host = el.lines();
  host.innerHTML = '';
  const nodes: HTMLElement[] = [];
  for (const text of lines) {
    const div = document.createElement('div');
    div.className = 'line pending';
    div.dataset['full'] = text;
    div.textContent = text;
    host.appendChild(div);
    nodes.push(div);
  }
  if (reducedMotion || nodes.length === 0) {
    revealAll();
    return;
  }
  // Reveal character by character across all lines, budgeted to finish fast.
  const totalChars = lines.reduce((a, l) => a + Math.max(1, l.length), 0);
  const perTick = Math.max(2, Math.ceil(totalChars / 45)); // ~45 ticks total
  let lineIdx = 0;
  let charIdx = 0;
  for (const n of nodes) {
    n.classList.remove('pending');
    n.textContent = '';
  }
  typewriterTimer = window.setInterval(() => {
    let budget = perTick;
    while (budget > 0 && lineIdx < nodes.length) {
      const node = nodes[lineIdx]!;
      const full = node.dataset['full'] ?? '';
      if (charIdx >= full.length) {
        node.textContent = full;
        lineIdx += 1;
        charIdx = 0;
        continue;
      }
      const take = Math.min(budget, full.length - charIdx);
      charIdx += take;
      node.textContent = full.slice(0, charIdx);
      budget -= take;
    }
    if (lineIdx >= nodes.length) cancelTypewriter();
  }, 16);
}

function renderChoices(screen: Screen, handlers: TerminalHandlers): void {
  const host = el.choices();
  host.innerHTML = '';
  for (const choice of screen.choices) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'menuitem');
    const key = document.createElement('span');
    key.className = 'key';
    key.textContent = `${choice.key})`;
    btn.appendChild(key);
    btn.appendChild(document.createTextNode(choice.label));
    btn.addEventListener('click', () => handlers.dispatch(choice.action));
    host.appendChild(btn);
  }
  for (const extra of handlers.extraButtons()) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'share-btn';
    btn.textContent = extra.label;
    btn.addEventListener('click', extra.onClick);
    host.appendChild(btn);
  }
}

function renderInput(screen: Screen): void {
  const form = el.input();
  if (!screen.input) {
    form.hidden = true;
    return;
  }
  form.hidden = false;
  el.inputPrompt().textContent = screen.input.prompt;
  const field = el.inputField();
  field.value = '';
  field.maxLength = screen.input.kind === 'epitaph' ? 60 : screen.input.kind === 'name' ? 16 : 24;
  field.placeholder = screen.input.placeholder;
  inputStartedAt = performance.now();
  submitLocked = false;
  window.setTimeout(() => field.focus(), 0);
}

function statusStat(label: string, value: string, warn = false): string {
  return `<span class="stat${warn ? ' warn' : ''}">${label} <b>${value}</b></span>`;
}

function renderStatus(status: StatusData | null): void {
  const host = el.status();
  if (!status) {
    host.hidden = true;
    return;
  }
  host.hidden = false;
  const crew = status.crew
    .map((m) => {
      const cls = `hp-${m.label.toLowerCase()}`;
      return `<span class="crew-chip">${m.name} <span class="${cls}">${m.label}</span></span>`;
    })
    .join('');
  host.innerHTML = `
    <div class="stat-row">
      ${statusStat('DATE', status.date)}
      ${statusStat('MILE', `${status.mile}`)}
      ${statusStat('NEXT', `${status.nextStop} ${status.nextStopMiles}mi`)}
      ${statusStat('CASH', status.cash)}
      ${statusStat('FOOD', `${status.food}lb`, status.food < 30)}
      ${statusStat('WATER', `${status.water}gal`, status.water < 10)}
      ${statusStat('GAS', `${status.fuel}gal`, status.fuel < 8)}
      ${statusStat('SPARES', status.parts)}
      ${statusStat('VAN', `${status.van}/100`, status.van < 40)}
      ${statusStat('PACE', status.pace)}
      ${statusStat('MEALS', status.rations)}
      ${status.weather ? statusStat('WEATHER', status.weather) : ''}
    </div>
    <div class="crew-row">${crew}</div>
  `;
}

export function renderScreen(screen: Screen, handlers: TerminalHandlers): void {
  currentScreen = screen;
  el.title().textContent = screen.title;
  renderLines(screen.lines);
  renderInput(screen);
  renderChoices(screen, handlers);
  renderStatus(screen.status);
  window.scrollTo({ top: 0 });
}

export function wireGlobalInput(handlers: TerminalHandlers): void {
  // Click anywhere in the lines area: reveal the typewriter instantly.
  el.lines().addEventListener('click', revealAll);

  // Number keys trigger choices when the text field is not focused.
  document.addEventListener('keydown', (e) => {
    if (!currentScreen) return;
    if (document.activeElement === el.inputField()) return;
    const choice = currentScreen.choices.find((c) => c.key === e.key);
    if (choice) {
      e.preventDefault();
      revealAll();
      handlers.dispatch(choice.action);
    }
  });

  el.input().addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentScreen?.input || submitLocked) return;
    submitLocked = true;
    const value = el.inputField().value;
    const kind = currentScreen.input.kind;
    if (kind === 'name') handlers.dispatch({ type: 'SUBMIT_NAME', name: value });
    else if (kind === 'epitaph') handlers.dispatch({ type: 'SUBMIT_EPITAPH', text: value });
    else handlers.dispatch({ type: 'SNACK_SUBMIT', typed: value, ms: Math.round(performance.now() - inputStartedAt) });
  });
}

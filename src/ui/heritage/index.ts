// Heritage theme: the Phase 1 green-phosphor terminal, kept exactly as it
// was. A DOM renderer for the sim's Screen model — it draws screens,
// forwards input, and measures the snack-run typing time. No game logic.

import type { Screen, StatusData } from '../../sim/game';
import { INPUT_MAX_LENGTH, inputAction } from '../input';
import type { Renderer, UiHandlers } from '../renderer';
import heritageCss from './heritage.css?inline';

const SHELL = `
<div id="crt">
  <header class="masthead">
    <span class="mast-title">THE 8 WEST TRAIL</span>
    <a class="mast-brand" href="https://8westit.com" target="_blank" rel="noopener">a road game from 8 WEST IT</a>
  </header>
  <main id="screen" aria-live="polite">
    <h1 id="screen-title"></h1>
    <div id="screen-lines"></div>
    <form id="screen-input" hidden>
      <label id="input-prompt" for="input-field"></label>
      <div class="input-row">
        <span class="input-caret">&gt;</span>
        <input id="input-field" autocomplete="off" autocapitalize="characters" spellcheck="false" />
      </div>
    </form>
    <div id="screen-choices" role="menu"></div>
  </main>
  <aside id="status" hidden></aside>
  <footer class="colophon">
    <span>&copy; 2026 8 West Ventures, LLC</span>
    <span>an homage to the computer-lab classics</span>
    <a href="https://8westit.com" target="_blank" rel="noopener">8westit.com</a>
  </footer>
</div>`;

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}

export function createHeritageRenderer(): Renderer {
  let root: HTMLElement | null = null;
  let handlers: UiHandlers | null = null;
  let styleEl: HTMLStyleElement | null = null;
  let listeners: AbortController | null = null;
  let typewriterTimer: number | null = null;
  let currentScreen: Screen | null = null;
  let inputStartedAt = 0;
  let submitLocked = false;
  let reducedMotion = false;

  function q<T extends HTMLElement>(selector: string): T {
    const node = root?.querySelector<T>(selector);
    if (!node) throw new Error(`heritage shell is missing ${selector}`);
    return node;
  }

  const el = {
    masthead: () => q<HTMLElement>('.masthead'),
    title: () => q<HTMLElement>('#screen-title'),
    lines: () => q<HTMLElement>('#screen-lines'),
    input: () => q<HTMLFormElement>('#screen-input'),
    inputPrompt: () => q<HTMLElement>('#input-prompt'),
    inputField: () => q<HTMLInputElement>('#input-field'),
    choices: () => q<HTMLElement>('#screen-choices'),
    status: () => q<HTMLElement>('#status'),
  };

  function cancelTypewriter(): void {
    if (typewriterTimer !== null) {
      window.clearInterval(typewriterTimer);
      typewriterTimer = null;
    }
  }

  function revealAll(): void {
    cancelTypewriter();
    for (const line of el.lines().querySelectorAll<HTMLElement>('.line')) {
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

  function renderChoices(screen: Screen, h: UiHandlers): void {
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
      btn.addEventListener('click', () => h.dispatch(choice.action));
      host.appendChild(btn);
    }
    for (const extra of h.extraButtons()) {
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
    field.maxLength = INPUT_MAX_LENGTH[screen.input.kind];
    field.type = screen.input.kind === 'email' ? 'email' : 'text';
    field.autocapitalize = screen.input.kind === 'email' ? 'off' : 'characters';
    field.autocomplete = screen.input.kind === 'email' ? 'email' : 'off';
    field.placeholder = screen.input.placeholder;
    inputStartedAt = performance.now();
    submitLocked = false;
    window.setTimeout(() => field.focus(), 0);
  }

  function statusStat(label: string, value: string, warn = false): string {
    return `<span class="stat${warn ? ' warn' : ''}">${label} <b>${escapeHtml(value)}</b></span>`;
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
        return `<span class="crew-chip">${escapeHtml(m.name)} <span class="${cls}">${escapeHtml(m.label)}</span></span>`;
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

  function wireInput(h: UiHandlers, signal: AbortSignal): void {
    // Click anywhere in the lines area: reveal the typewriter instantly.
    el.lines().addEventListener('click', revealAll, { signal });

    // Number keys trigger choices when the text field is not focused.
    document.addEventListener(
      'keydown',
      (e) => {
        if (!currentScreen) return;
        if (document.activeElement === el.inputField()) return;
        const choice = currentScreen.choices.find((c) => c.key === e.key);
        if (choice) {
          e.preventDefault();
          revealAll();
          h.dispatch(choice.action);
        }
      },
      { signal },
    );

    el.input().addEventListener(
      'submit',
      (e) => {
        e.preventDefault();
        if (!currentScreen?.input || submitLocked) return;
        submitLocked = true;
        h.dispatch(inputAction(currentScreen.input.kind, el.inputField().value, performance.now() - inputStartedAt));
      },
      { signal },
    );
  }

  return {
    theme: 'heritage',

    mount(nextRoot, nextHandlers) {
      root = nextRoot;
      handlers = nextHandlers;
      styleEl = document.createElement('style');
      styleEl.dataset['theme'] = 'heritage';
      styleEl.textContent = heritageCss;
      document.head.appendChild(styleEl);
      root.innerHTML = SHELL;
      const toggle = nextHandlers.themeToggle();
      if (toggle) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mast-theme';
        btn.textContent = toggle.label;
        btn.addEventListener('click', toggle.onClick);
        el.masthead().appendChild(btn);
      }
      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      listeners = new AbortController();
      wireInput(nextHandlers, listeners.signal);
    },

    render(screen) {
      if (!root || !handlers) throw new Error('heritage renderer used before mount');
      currentScreen = screen;
      el.title().textContent = screen.title;
      renderLines(screen.lines);
      renderInput(screen);
      renderChoices(screen, handlers);
      renderStatus(screen.status);
      window.scrollTo({ top: 0 });
    },

    unmount() {
      cancelTypewriter();
      listeners?.abort();
      listeners = null;
      styleEl?.remove();
      styleEl = null;
      if (root) root.innerHTML = '';
      root = null;
      handlers = null;
      currentScreen = null;
    },
  };
}

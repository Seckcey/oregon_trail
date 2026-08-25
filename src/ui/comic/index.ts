// Comic theme: the Saturday-morning mystery comic. A DOM renderer for the
// sim's Screen model — every screen is a comic page, choices are balloons,
// status rides in caption boxes, and events slam SFX lettering on the sheet.
// No game logic: layout.ts decides the page, page.ts draws it.

import type { Action, Screen } from '../../sim/game';
import { MUSIC_LOOPS, assets } from '../assets';
import { INPUT_MAX_LENGTH, inputAction } from '../input';
import { loadAudioEnabled, saveAudioEnabled } from '../persistence';
import type { Renderer, UiHandlers } from '../renderer';
import { burst } from './art-shared';
import { planAudio, type AudioCue } from './audio';
import comicCss from './comic.css?inline';
import { layoutPage, type ComicPage } from './layout';
import { createMixer, type Mixer } from './mixer';
import { preloadArt, renderPage } from './page';
import { SFX_COLORS, SFX_WORDS, sfxForTransition } from './sfx';
import type { SfxId } from '../assets';

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Bangers&family=Luckiest+Guy&family=Comic+Neue:wght@400;700&display=swap';

const SHELL = `
<div id="comic">
  <div class="sheet">
    <header class="masthead">
      <div class="issue"><span class="issue-no">No. 1</span><span class="issue-date">MAY 1985</span></div>
      <h1 class="mast-title">THE 8 WEST TRAIL</h1>
      <div class="mast-right">
        <a class="presents" href="https://8westit.com" target="_blank" rel="noopener">8 WEST IT PRESENTS</a>
      </div>
    </header>
    <main class="page" id="page" aria-live="polite"></main>
  </div>
  <div class="sfx-layer" id="sfx" aria-hidden="true"></div>
  <footer class="colophon">
    <span>&copy; 2026 8 West Ventures, LLC</span>
    <span>an 8 West Ventures company</span>
    <a href="https://8westit.com" target="_blank" rel="noopener">8westit.com</a>
  </footer>
</div>`;

/** Load the comic's web fonts once; they stay cached for the next visit. */
function ensureFonts(): void {
  if (document.querySelector(`link[href="${FONTS_HREF}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONTS_HREF;
  document.head.appendChild(link);
}

/** A page is "new" when the moment changes, not on every keypress in the store. */
function pageIdentity(page: ComicPage): string {
  const s = page.scene;
  return `${page.kind}|${page.title}|${s.day}|${s.mile}|${s.eventId ?? ''}|${s.stopId ?? ''}`;
}

export function createComicRenderer(): Renderer {
  let root: HTMLElement | null = null;
  let handlers: UiHandlers | null = null;
  let styleEl: HTMLStyleElement | null = null;
  let listeners: AbortController | null = null;
  let currentScreen: Screen | null = null;
  let lastIdentity = '';
  let lastAction: Action | null = null;
  let inputField: HTMLInputElement | null = null;
  let inputStartedAt = 0;
  let submitLocked = false;
  let reducedMotion = false;
  let sfxTimer: number | null = null;
  let mixer: Mixer | null = null;
  let lastCue: AudioCue | null = null;

  function q<T extends HTMLElement>(selector: string): T {
    const node = root?.querySelector<T>(selector);
    if (!node) throw new Error(`comic shell is missing ${selector}`);
    return node;
  }

  function fire(action: Action): void {
    if (!handlers) return;
    lastAction = action;
    try {
      handlers.dispatch(action);
    } finally {
      lastAction = null;
    }
  }

  function slam(id: SfxId | null): void {
    const layer = q<HTMLElement>('#sfx');
    if (sfxTimer !== null) {
      window.clearTimeout(sfxTimer);
      sfxTimer = null;
    }
    layer.innerHTML = '';
    if (!id) return;
    const color = SFX_COLORS[id];
    const node = document.createElement('div');
    node.className = `sfx sfx-${id}`;
    node.style.setProperty('--fill', color.fill);
    node.innerHTML = `<svg class="burst" viewBox="0 0 1200 500" xmlns="http://www.w3.org/2000/svg">${burst(600, 250, 560, color.burst, 16)}</svg><div class="word">${SFX_WORDS[id]}</div>`;
    layer.appendChild(node);
    sfxTimer = window.setTimeout(() => {
      node.remove();
      sfxTimer = null;
    }, reducedMotion ? 900 : 1500);
  }

  function wireInput(h: UiHandlers, signal: AbortSignal): void {
    document.addEventListener(
      'keydown',
      (e) => {
        if (!currentScreen || !root) return;
        if (document.activeElement === inputField) return;
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const choice = currentScreen.choices.find((c) => c.key === e.key);
        if (choice) {
          e.preventDefault();
          fire(choice.action);
        }
      },
      { signal },
    );
    root!.addEventListener(
      'submit',
      (e) => {
        const form = e.target as HTMLElement | null;
        if (!form?.classList.contains('ask')) return;
        e.preventDefault();
        if (!currentScreen?.input || submitLocked || !inputField) return;
        submitLocked = true;
        fire(inputAction(currentScreen.input.kind, inputField.value, performance.now() - inputStartedAt));
      },
      { signal },
    );
    void h;
  }

  /** The SOUND: ON / OFF sign in the masthead, and the gesture that unlocks the browser's audio. */
  function wireSound(signal: AbortSignal): void {
    const created = createMixer(assets, { enabled: loadAudioEnabled() ?? true, loops: MUSIC_LOOPS });
    mixer = created;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sign mast-sound';
    const paint = (): void => {
      const on = created.isEnabled();
      btn.textContent = on ? 'SOUND: ON' : 'SOUND: OFF';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Turn the sound off' : 'Turn the sound on');
    };
    btn.addEventListener('click', () => {
      const on = !created.isEnabled();
      saveAudioEnabled(on);
      created.setEnabled(on);
      paint();
    });
    paint();
    q<HTMLElement>('.mast-right').appendChild(btn);
    // Browsers keep audio locked until the first real gesture on the page.
    const unlock = (): void => created.unlock();
    document.addEventListener('pointerdown', unlock, { signal, capture: true });
    document.addEventListener('keydown', unlock, { signal, capture: true });
  }

  return {
    theme: 'comic',

    mount(nextRoot, nextHandlers) {
      root = nextRoot;
      handlers = nextHandlers;
      ensureFonts();
      styleEl = document.createElement('style');
      styleEl.dataset['theme'] = 'comic';
      styleEl.textContent = comicCss;
      document.head.appendChild(styleEl);
      root.innerHTML = SHELL;
      const toggle = nextHandlers.themeToggle();
      if (toggle) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sign mast-theme';
        btn.textContent = toggle.label;
        btn.addEventListener('click', toggle.onClick);
        q<HTMLElement>('.mast-right').appendChild(btn);
      }
      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      listeners = new AbortController();
      wireInput(nextHandlers, listeners.signal);
      wireSound(listeners.signal);
      // Frank's masthead replaces the lettering once it lands as a vector; the
      // raw raster is a generation sheet, so only an SVG counts as finished.
      const masthead = assets.brand('masthead');
      if (masthead?.endsWith('.svg')) {
        q<HTMLElement>('.mast-title').innerHTML = `<img src="${masthead}" alt="The 8 West Trail" class="mast-art">`;
      }
      const icon = assets.brand('icon');
      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (icon && favicon) {
        favicon.dataset['heritage'] ??= favicon.href;
        favicon.href = icon;
      }
      // Warm the cache for the first pages — splash, outfitter, the first
      // stretch of road, the van, the cast — so turning them never shows the
      // placeholder under art that is still on its way.
      preloadArt([
        assets.scene('loading'),
        assets.scene('outfitter'),
        assets.region(1),
        assets.region(2),
        assets.van('clean'),
        assets.van('dusty'),
        ...Array.from({ length: 12 }, (_, i) => assets.crew(i + 1)),
        ...Array.from({ length: 8 }, (_, i) => assets.slot(`billboards/8westit-${String(i + 1).padStart(2, '0')}`)),
      ]);
    },

    render(screen) {
      if (!root || !handlers) throw new Error('comic renderer used before mount');
      const prev = currentScreen;
      currentScreen = screen;
      const page = layoutPage(screen);
      const host = q<HTMLElement>('#page');
      root.querySelector('#comic')!.className = `page-${page.kind}`;
      inputField = renderPage(host, page, { handlers, resolver: assets, fire }, {
        extras: handlers.extraButtons(),
        inputMaxLength: screen.input ? INPUT_MAX_LENGTH[screen.input.kind] : 0,
      });
      if (inputField) {
        inputStartedAt = performance.now();
        submitLocked = false;
        inputField.addEventListener('input', () => mixer?.play('ui-type-key'));
        // Focus now, not on a timer: the field is rebuilt every render and the
        // next keystroke (a fast typist, a test runner) must land in it.
        inputField.focus();
      }
      const identity = pageIdentity(page);
      if (identity !== lastIdentity) {
        lastIdentity = identity;
        if (!reducedMotion) {
          host.classList.remove('enter');
          void host.offsetWidth; // restart the animation
          host.classList.add('enter');
        }
        window.scrollTo({ top: 0 });
      }
      const word = sfxForTransition(prev, screen, lastAction);
      slam(word);
      lastCue = planAudio(prev, screen, lastAction, word, lastCue);
      mixer?.apply(lastCue);
    },

    unmount() {
      if (sfxTimer !== null) window.clearTimeout(sfxTimer);
      sfxTimer = null;
      mixer?.dispose();
      mixer = null;
      lastCue = null;
      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (favicon?.dataset['heritage']) favicon.href = favicon.dataset['heritage'];
      listeners?.abort();
      listeners = null;
      styleEl?.remove();
      styleEl = null;
      if (root) root.innerHTML = '';
      root = null;
      handlers = null;
      currentScreen = null;
      inputField = null;
      lastIdentity = '';
    },
  };
}

export type { ComicPage };

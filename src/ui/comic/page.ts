// The DOM half of the comic: turns a ComicPage into markup on the sheet and
// wires its buttons. No game logic; everything it draws is decided in
// layout.ts / balloons.ts, and everything it shows comes from the Screen.

import type { SetPiece, StatusData } from '../../sim/game';
import { fmtCents } from '../../sim/store';
import { T1D_LINKS } from '../../sim/t1d';
import { type AssetResolver, type CrewSheet } from '../assets';
import type { UiHandlers } from '../renderer';
import { artSource } from './art';
import { crewHeadSvg } from './art-crew';
import { billboardSvg } from './art-scenes';
import { esc } from './art-shared';
import { vanSvg } from './art-van';
import { weatherSvg } from './art-regions';
import type { Balloon } from './balloons';
import { castMember } from './cast';
import { moodOf, type ArtRef, type ComicPage, type CrewMood, type Panel } from './layout';

export interface PageContext {
  handlers: UiHandlers;
  resolver: AssetResolver;
  /** Dispatch wrapper that remembers the action for the SFX decision. */
  fire(action: Balloon['action']): void;
}

// ---------------------------------------------------------------------------
// Art
// ---------------------------------------------------------------------------

// Art the reader has already seen this session. A repeat is shown at once,
// no fade, so turning a page never flashes the placeholder under it.
const shownArt = new Set<string>();

function artHtml(ref: ArtRef, resolver: AssetResolver): string {
  const src = artSource(ref, resolver);
  const frame = ref.kind === 'event' ? ` strip-frame f${ref.frame}` : '';
  const real = src.url ? `<img class="real${frame}" src="${esc(src.url)}" alt="${esc(src.alt)}" decoding="async">` : '';
  return `<div class="panel-art" aria-label="${esc(src.alt)}">${src.placeholder}${real}</div>`;
}

function headHtml(castId: number, mood: CrewMood, resolver: AssetResolver): string {
  const sheet: CrewSheet | undefined = mood === 'critical' ? 'critical' : mood === 'poor' ? 'rough' : undefined;
  const url = (sheet ? resolver.crew(castId, sheet) : null) ?? resolver.crew(castId);
  const member = castMember(castId);
  const real = url ? `<img class="real" src="${esc(url)}" alt="${esc(member.name)}" decoding="async">` : '';
  return `${crewHeadSvg(castId, mood)}${real}`;
}

/** Fetch art ahead of the page that needs it, so it is in cache when it turns up. */
export function preloadArt(urls: (string | null | undefined)[]): void {
  for (const url of urls) {
    if (!url || shownArt.has(url)) continue;
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  }
}

function stageHtml(panel: Panel, page: ComicPage, resolver: AssetResolver): string {
  const art = panel.art;
  if (art.kind !== 'region') return artHtml(art, resolver);
  const vanUrl = resolver.van(art.van);
  const van = vanUrl ? `<img src="${esc(vanUrl)}" alt="The van" decoding="async">` : vanSvg(art.van);
  const billboards = page.billboards
    .map((n, i) => {
      const url = resolver.slot(`billboards/8westit-${String(n).padStart(2, '0')}`);
      return `<div class="billboard b${i + 1}">${url ? `<img src="${esc(url)}" alt="8 West IT billboard" decoding="async">` : billboardSvg(n)}</div>`;
    })
    .join('');
  const weather =
    art.weather === 'dust'
      ? `<div class="weather">${weatherSvg('dust-wall')}</div>`
      : art.weather === 'monsoon'
        ? `<div class="weather">${weatherSvg('monsoon')}</div>`
        : art.heat >= 3
          ? `<div class="weather">${weatherSvg('heat')}</div>`
          : '';
  return `${artHtml(art, resolver)}<div class="stage${art.moving ? ' moving' : ''}">${billboards}${weather}<div class="dust">${dustSvg()}</div><div class="van">${van}</div></div>`;
}

function dustSvg(): string {
  return `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><g fill="#E9C46A" stroke="#111" stroke-width="4"><circle cx="30" cy="40" r="16"/><circle cx="55" cy="34" r="20"/><circle cx="78" cy="42" r="14"/></g></svg>`;
}

function panelHtml(panel: Panel, page: ComicPage, resolver: AssetResolver): string {
  const cls = ['panel', panel.span];
  if (panel.art.kind === 'cover') cls.push('portrait');
  if (panel.art.kind === 'stop') cls.push('postcard');
  const captions = panel.lines.length ? `<div class="panel-captions">${panel.lines.map((l) => `<span class="caption narration">${esc(l)}</span>`).join('')}</div>` : '';
  const head = panel.head?.length ? `<div class="panel-captions top">${panel.head.map((l) => `<span class="caption">${esc(l)}</span>`).join('')}</div>` : '';
  const style = panel.tilt ? ` style="--tilt:${panel.tilt}deg"` : '';
  // Frank's cover plate leaves its top blank for the masthead: letter it in-engine.
  const masthead =
    panel.art.kind === 'cover' && resolver.brand('cover-01')
      ? `<div class="cover-masthead"><span class="cover-title">THE 8 WEST TRAIL</span></div>`
      : '';
  return `<section class="${cls.join(' ')}" data-panel="${esc(panel.id)}"${style}>${stageHtml(panel, page, resolver)}${masthead}${head}${captions}</section>`;
}

// ---------------------------------------------------------------------------
// Captions, crew, balloons, signs
// ---------------------------------------------------------------------------

function cap(label: string, value: string, warn = false): string {
  return `<span class="caption${warn ? ' warn' : ''}">${esc(label)} <b>${esc(value)}</b></span>`;
}

function statusHtml(status: StatusData): string {
  return `<div class="captions" aria-label="Status">
${cap('Day', `${status.day} · ${status.date}`)}
${cap('Mile', `${status.mile}`)}
${cap('Next', `${status.nextStop} ${status.nextStopMiles} mi`)}
${cap('Cash', status.cash)}
${cap('Food', `${status.food} lb`, status.food < 30)}
${cap('Water', `${status.water} gal`, status.water < 10)}
${cap('Gas', `${status.fuel} gal`, status.fuel < 8)}
${cap('Spares', status.parts)}
${cap('Van', `${status.van}/100`, status.van < 40)}
${cap('Pace', status.pace)}
${cap('Meals', status.rations)}
${status.weather ? cap('Weather', status.weather) : ''}
</div>`;
}

/** The blue circle beside Kannon's name: tap it and the crew panel explains, with links. */
function t1dBadgeHtml(name: string): string {
  return `<button type="button" class="t1d-badge" data-t1d="toggle" aria-expanded="false" title="${esc(name)} lives with Type 1 diabetes — tap to learn more"><span class="dot"></span>T1D</button>`;
}

function t1dNoteHtml(name: string): string {
  return `<div class="t1d-note" data-t1d="note" hidden><span class="caption narration">${esc(name)} lives with Type 1 diabetes: an autoimmune condition where the pancreas makes little or no insulin. He manages it with a sensor on his arm, insulin for every meal, and a juice box for the lows. He handles it like it’s nothing. It isn’t nothing.</span><span class="caption narration">Learn more, or help: <a href="https://${T1D_LINKS.ada}" target="_blank" rel="noopener">American Diabetes Association</a> · <a href="https://www.${T1D_LINKS.breakthrough}" target="_blank" rel="noopener">Breakthrough T1D (formerly JDRF)</a></span></div>`;
}

function crewHtml(page: ComicPage, resolver: AssetResolver): string {
  if (!page.status) return '';
  const mates = page.status.crew
    .map((m, i) => {
      const mood = moodOf(m.label);
      const badge = m.badge === 't1d' ? t1dBadgeHtml(m.name) : '';
      return `<div class="mate${mood === 'lost' ? ' lost' : ''}"><div class="head">${headHtml(page.cast[i] ?? i + 1, mood, resolver)}</div><div class="tag">${esc(m.name)}</div><div class="mood ${mood}">${esc(m.label)}</div>${badge}</div>`;
    })
    .join('');
  const kannon = page.status.crew.find((m) => m.badge === 't1d');
  return `<div class="crew-panel" aria-label="The crew">${mates}${kannon ? t1dNoteHtml(kannon.name) : ''}</div>`;
}

function balloonHtml(b: Balloon, page: ComicPage, resolver: AssetResolver): string {
  const button = `<button type="button" class="balloon ${b.shape}" data-key="${esc(b.key)}" role="menuitem"><span class="key">${esc(b.key)}</span><span class="words">${esc(b.label)}</span></button>`;
  if (b.speakerIndex === null) return button;
  const mood = moodOf(page.status?.crew[b.speakerIndex]?.label ?? 'GOOD');
  const who = `<div class="who" title="${esc(b.speaker ?? '')}">${headHtml(page.cast[b.speakerIndex] ?? b.speakerIndex + 1, mood, resolver)}</div>`;
  return `<div class="say ${b.shape}">${who}${button}</div>`;
}

function signHtml(b: Balloon): string {
  const cls = b.action.type === 'BUY' || b.action.type === 'REPAIR' ? 'sign buy' : 'sign';
  return `<button type="button" class="${cls}" data-key="${esc(b.key)}" role="menuitem"><span class="key">${esc(b.key)}</span>${esc(b.label)}</button>`;
}

function extrasHtml(extras: { label: string }[]): string {
  return extras.map((e, i) => `<button type="button" class="sign extra" data-extra="${i}">${esc(e.label)}</button>`).join('');
}

// ---------------------------------------------------------------------------
// Set pieces
// ---------------------------------------------------------------------------

function rowsHtml(lines: string[]): string {
  const cells = lines
    .filter((l) => l.trim().length > 0)
    .map((l) => {
      const stop = /^([■·]) mile\s+(\d+)\s+(.+)$/.exec(l);
      if (stop) return `<div class="k">${stop[1]} mile ${stop[2]}</div><div class="v">${esc(stop[3]!)}</div>`;
      const m = /^(\S.*?)\s{2,}(\S.*)$/.exec(l);
      if (!m) return `<div class="full${/YOU ARE HERE/.test(l) ? ' here' : ''}">${esc(l.trim())}</div>`;
      return `<div class="k">${esc(m[1]!)}</div><div class="v">${esc(m[2]!.replace(/\s{2,}/g, ' '))}</div>`;
    })
    .join('');
  return `<div class="rows">${cells}</div>`;
}

function overlayHtml(page: ComicPage): string {
  return `<div class="sheet-inset">${rowsHtml(page.lines)}</div>`;
}

function storeHtml(set: Extract<SetPiece, { kind: 'store' }>, page: ComicPage): string {
  const rows = set.items
    .map((item, i) => `<div class="k">${i + 1}) ${esc(item.label)}</div><div class="v">per ${esc(item.unitLabel)}</div><div class="price">${esc(fmtCents(item.cents))}</div>`)
    .join('');
  const tune = set.tuneUp ? `<div class="k">7) Tune-up</div><div class="v">+${set.tuneUp.points} van condition</div><div class="price">${esc(fmtCents(set.tuneUp.cents))}</div>` : '';
  const notice = page.lines.filter((l) => /^(Aboard:|Sold|Your wallet|The van is full|Tune-up done|The mechanic)/.test(l));
  return `<div class="chalkboard"><h3>${set.outfitting ? 'THE OUTFITTER · LAS CRUCES' : esc(set.stopName.toUpperCase())}</h3><div class="rows">${rows}${tune}</div><div class="cash">Cash ${esc(fmtCents(set.cashCents))}</div></div>${
    notice.length ? `<div class="narration-row">${notice.map((l) => `<span class="caption narration">${esc(l)}</span>`).join('')}</div>` : ''
  }`;
}

function crossingHtml(set: Extract<SetPiece, { kind: 'crossing' }>): string {
  const max = Math.max(set.depthFt, set.safeFt) * 1.4;
  const pct = (x: number) => `${Math.min(100, (x / max) * 100).toFixed(1)}%`;
  const danger = set.depthFt > set.safeFt;
  return `<div class="sheet-inset"><h3>The river</h3><div class="gauge">
<span class="label">Depth</span><div class="bar"><div class="fill${danger ? ' danger' : ''}" style="width:${pct(set.depthFt)}"></div><div class="mark line" style="left:${pct(set.safeFt)}" title="ford it under ${set.safeFt} ft"></div></div><span class="label">${set.depthFt.toFixed(1)} ft</span>
<span class="label">Current</span><div class="bar"><div class="fill${set.currentMph >= 5 ? ' hot' : ''}" style="width:${Math.min(100, set.currentMph * 12)}%"></div></div><span class="label">${set.currentMph} mph</span>
<span class="label">Ford</span><div class="bar"><div class="fill${set.fordRisk > 0.45 ? ' danger' : set.fordRisk > 0.15 ? ' hot' : ''}" style="width:${(set.fordRisk * 100).toFixed(0)}%"></div></div><span class="label">${Math.round(set.fordRisk * 100)}% risk</span>
<span class="label">Float</span><div class="bar"><div class="fill${set.floatRisk > 0.45 ? ' danger' : set.floatRisk > 0.15 ? ' hot' : ''}" style="width:${(set.floatRisk * 100).toFixed(0)}%"></div></div><span class="label">${Math.round(set.floatRisk * 100)}% risk</span>
</div><p style="margin:10px 0 0;font-weight:700">${esc(set.ferryName)} will take you across for ${esc(fmtCents(set.ferryCents))}.${set.daysWaited ? ` You have waited ${set.daysWaited} ${set.daysWaited === 1 ? 'day' : 'days'}.` : ''}</p></div>`;
}

function gradeHtml(set: Extract<SetPiece, { kind: 'grade' }>): string {
  const pct = Math.min(100, (set.brakeTemp / (set.fadeTemp * 1.1)) * 100).toFixed(0);
  const state = set.brakeTemp >= set.fadeTemp ? 'danger' : set.brakeTemp >= set.smokingTemp ? 'hot' : '';
  const segs = set.steep
    .map((steep, i) => {
      const cls = ['seg', steep ? 'steep' : 'easy', i < set.segment ? 'done' : '', i === set.segment ? 'next' : ''].filter(Boolean).join(' ');
      return `<div class="${cls}">${i < set.segment ? '✓' : steep ? 'STEEP' : 'easy'}</div>`;
    })
    .join('');
  return `<div class="sheet-inset"><h3>The 6% grade</h3><div class="gauge">
<span class="label">Brakes</span><div class="bar"><div class="fill ${state}" style="width:${pct}%"></div><div class="mark" style="left:${((set.smokingTemp / (set.fadeTemp * 1.1)) * 100).toFixed(0)}%" title="smoking"></div><div class="mark line" style="left:${((set.fadeTemp / (set.fadeTemp * 1.1)) * 100).toFixed(0)}%" title="fade"></div></div><span class="label">${Math.round(set.brakeTemp)}°</span>
<span class="label">Speed</span><div class="bar"><div class="fill${set.speed >= set.maxSpeed ? ' danger' : set.speed >= set.maxSpeed - 1 ? ' hot' : ''}" style="width:${Math.min(100, (set.speed / set.maxSpeed) * 100).toFixed(0)}%"></div></div><span class="label">${set.speed} / ${set.maxSpeed}</span>
</div><div class="profile">${segs}</div></div>`;
}

function scoreHtml(set: Extract<SetPiece, { kind: 'victory' }>): string {
  const s = set.score;
  return `<div class="sheet-inset"><h3>Score</h3><div class="score">
<span>Crew</span><span class="v">${s.crewPoints}</span>
<span>Supplies</span><span class="v">${s.supplyPoints}</span>
<span>Cash</span><span class="v">${s.cashPoints}</span>
<span>Subtotal</span><span class="v">${s.subtotal} × ${s.multiplier} (${esc(set.occupation.toUpperCase())})</span>
<span class="total">Total</span><span class="v total">${s.total}</span>
</div></div>`;
}

function setPieceHtml(page: ComicPage): string {
  const set = page.set;
  if (!set) return '';
  switch (set.kind) {
    case 'store':
      return storeHtml(set, page);
    case 'crossing':
      return crossingHtml(set);
    case 'grade':
      return gradeHtml(set);
    case 'victory':
      return scoreHtml(set);
    case 'snack':
    case 'grave':
      return '';
  }
}

function narrationHtml(page: ComicPage): string {
  if (page.kind === 'overlay') return overlayHtml(page);
  if (page.kind === 'store') return '';
  let lines = page.lines.filter((l) => l.trim().length > 0);
  if (page.kind === 'victory') lines = lines.filter((l) => !/^(SCORE|  )/.test(l));
  if (page.kind === 'crossing') lines = lines.slice(0, 1);
  if (page.kind === 'grade') lines = lines.slice(0, 1);
  if (page.kind === 'snack') lines = lines.filter((l) => !/^>>>/.test(l) && !/^A roadside stand/.test(l));
  if (!lines.length) return '';
  return `<div class="narration-row">${lines.map((l) => `<span class="caption narration">${esc(l)}</span>`).join('')}</div>`;
}

function askHtml(page: ComicPage, maxLength: number): string {
  const input = page.input;
  if (!input) return '';
  const word = page.set?.kind === 'snack' ? `<div class="shout-word" aria-label="Shout this">${esc(page.set.word)}</div>` : '';
  return `${word}<form class="ask" data-kind="${input.kind}"><label class="caption ask-prompt" for="comic-input">${esc(input.prompt)}</label><div class="ask-row"><input id="comic-input" type="${input.kind === 'email' ? 'email' : 'text'}" autocomplete="${input.kind === 'email' ? 'email' : 'off'}" autocapitalize="${input.kind === 'email' ? 'off' : 'characters'}" spellcheck="false" maxlength="${maxLength}" placeholder="${esc(input.placeholder)}"><button type="submit" class="sign">${input.kind === 'snack' ? 'Shout it!' : 'That’s it'}</button></div></form>`;
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

export interface RenderOptions {
  extras: { label: string; onClick(): void }[];
  inputMaxLength: number;
}

/** Draw the page into host and wire its buttons. Returns the text field, if any. */
export function renderPage(host: HTMLElement, page: ComicPage, ctx: PageContext, opts: RenderOptions): HTMLInputElement | null {
  const panelsCls = page.panels.length === 3 ? 'panels three' : 'panels';
  const panels = `<div class="${panelsCls}">${page.panels.map((p) => panelHtml(p, page, ctx.resolver)).join('')}</div>`;
  const status = page.status && page.kind !== 'store' && page.kind !== 'overlay' ? statusHtml(page.status) : '';
  const crew = page.kind === 'road' || page.kind === 'grade' || page.kind === 'crossing' || page.kind === 'postcard' ? crewHtml(page, ctx.resolver) : '';
  const balloons = page.balloons.map((b) => balloonHtml(b, page, ctx.resolver)).join('');
  const signs = `${page.signs.map(signHtml).join('')}${extrasHtml(opts.extras)}`;

  host.innerHTML = `
<h2 class="title-caption">${esc(page.title)}</h2>
${panels}
${narrationHtml(page)}
${setPieceHtml(page)}
${status}
${crew}
${askHtml(page, opts.inputMaxLength)}
${balloons ? `<div class="balloons" role="menu">${balloons}</div>` : ''}
${signs ? `<div class="signs" role="menu">${signs}</div>` : ''}`;

  for (const btn of host.querySelectorAll<HTMLButtonElement>('button[data-key]')) {
    const key = btn.dataset['key'];
    const choice = [...page.balloons, ...page.signs].find((b) => b.key === key);
    if (choice) btn.addEventListener('click', () => ctx.fire(choice.action));
  }
  for (const btn of host.querySelectorAll<HTMLButtonElement>('button[data-extra]')) {
    const extra = opts.extras[Number(btn.dataset['extra'])];
    if (extra) btn.addEventListener('click', extra.onClick);
  }
  const t1dNote = host.querySelector<HTMLElement>('[data-t1d="note"]');
  for (const btn of host.querySelectorAll<HTMLButtonElement>('button[data-t1d="toggle"]')) {
    btn.addEventListener('click', () => {
      if (!t1dNote) return;
      t1dNote.hidden = !t1dNote.hidden;
      btn.setAttribute('aria-expanded', String(!t1dNote.hidden));
    });
  }
  for (const img of host.querySelectorAll<HTMLImageElement>('img.real')) {
    const src = img.getAttribute('src') ?? '';
    if (shownArt.has(src) || (img.complete && img.naturalWidth > 0)) {
      img.classList.add('loaded', 'instant');
      shownArt.add(src);
    } else {
      img.addEventListener(
        'load',
        () => {
          img.classList.add('loaded');
          shownArt.add(src);
        },
        { once: true },
      );
    }
  }
  return host.querySelector<HTMLInputElement>('#comic-input');
}

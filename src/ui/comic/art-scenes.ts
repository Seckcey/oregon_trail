// Splash pages, the cover, postcards, billboards, SFX bursts, and signage —
// the rest of the placeholder art. §2, §7, §8, §9, §11.

import { ROUTE } from '../../sim/data/route';
import { regionAt } from '../../sim/scene';
import type { SceneId, SignageId } from '../assets';
import {
  ASPHALT,
  BLUE,
  CREAM,
  GRAPE,
  INK,
  LIME,
  NAVY,
  ORANGE,
  PAPER,
  RED,
  SAND,
  SILVER,
  SKY,
  TAN,
  YELLOW,
  burst,
  caption,
  cloud,
  diamondSign,
  guideSign,
  ink,
  puff,
  road,
  shield,
  star,
  sun,
  svg,
  text,
} from './art-shared';
import { crewHeadSvg } from './art-crew';
import { regionSvg } from './art-regions';
import { vanSvg } from './art-van';
import { SFX_COLORS, SFX_WORDS } from './sfx';
import type { SfxId } from '../assets';

function inner(svgText: string): string {
  return svgText.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
}

/** A region horizon scaled to fill a 16:9 frame, centred. */
function regionBackdrop(region: number): string {
  return `<g transform="translate(-300 0) scale(1.5)">${inner(regionSvg(region))}</g>`;
}

function head(id: number, x: number, y: number, s: number, mood: 'good' | 'fair' | 'poor' | 'critical' | 'lost' = 'good'): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">${inner(crewHeadSvg(id, mood))}</g>`;
}

function jumper(x: number, y: number, rot: number, shirt: string, id: number): string {
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
<rect x="-14" y="0" width="28" height="60" rx="8" fill="${shirt}" ${ink()}/>
<path d="M-14 10 l-40 -30 M14 10 l40 -34 M-8 60 l-20 50 M8 60 l24 46" fill="none" ${ink()} stroke-width="10"/>
${head(id, -40, -80, 0.4)}
</g>`;
}

const SCENE_ART: Record<SceneId, () => string> = {
  outfitter: () => `
<rect width="1200" height="675" fill="${CREAM}"/>
<rect x="0" y="500" width="1200" height="175" fill="${TAN}" ${ink()}/>
${[120, 260, 400].map((y) => `<rect x="60" y="${y}" width="520" height="14" fill="#7A4E2D" ${ink()}/>`).join('')}
${[100, 190, 280, 370, 460].map((x) => `<rect x="${x}" y="70" width="56" height="50" rx="6" fill="${SILVER}" ${ink()}/>`).join('')}
${[100, 190, 280, 370, 460].map((x) => `<rect x="${x}" y="200" width="56" height="60" rx="10" fill="${BLUE}" ${ink()}/>`).join('')}
${[100, 220, 340, 460].map((x) => `<rect x="${x}" y="336" width="70" height="64" rx="8" fill="${RED}" ${ink()}/>`).join('')}
${[660, 740, 820].map((x) => `<circle cx="${x}" cy="440" r="40" fill="${INK}"/><circle cx="${x}" cy="440" r="16" fill="${SILVER}"/>`).join('')}
<rect x="680" y="80" width="460" height="300" fill="#1E2B23" ${ink()} stroke-width="10"/>
${text(910, 140, 'THE OUTFITTER', { size: 44, fill: PAPER, spacing: 2 })}
${['FOOD ......... 12.85', 'WATER ......... 2.85', 'GAS ........... 1.85', 'TIRE ......... 34.85'].map((l, i) => text(910, 200 + i * 44, l, { size: 30, fill: YELLOW, font: 'body', weight: 'bold' }))}
<rect x="900" y="420" width="220" height="90" rx="8" fill="#8E6B3E" ${ink()}/><rect x="920" y="400" width="180" height="30" rx="4" fill="${SILVER}" ${ink()}/>
${text(1010, 480, '$', { size: 48, fill: YELLOW })}
<line x1="580" y1="40" x2="580" y2="120" ${ink()} stroke-width="8"/><ellipse cx="580" cy="40" rx="120" ry="14" fill="${SILVER}" ${ink()}/>
`,
  loading: () => `
<rect width="1200" height="675" fill="${SKY}"/>
<rect y="0" width="1200" height="180" fill="${YELLOW}"/>
${sun(1000, 190, 70)}
<rect y="420" width="1200" height="255" fill="${SAND}"/>
<rect x="40" y="200" width="420" height="240" fill="${TAN}" ${ink()}/>
<rect x="20" y="170" width="460" height="50" fill="${RED}" ${ink()}/>
${text(250, 208, 'OUTFITTER', { size: 34, fill: PAPER, spacing: 2 })}
<rect x="200" y="300" width="100" height="140" fill="${GRAPE}" ${ink()}/>
<g transform="translate(520 240) scale(1.4)">${inner(vanSvg('clean'))}</g>
${head(1, 640, 60, 0.7)}${head(2, 470, 330, 0.6)}${head(3, 1040, 330, 0.6)}${head(4, 880, 380, 0.6)}${head(5, 1090, 180, 0.6)}
<rect x="1080" y="470" width="80" height="60" rx="6" fill="${BLUE}" ${ink()}/>
`,
  tucson: () => `${regionBackdrop(4)}<g transform="translate(420 380) scale(1.1)">${inner(vanSvg('clean'))}</g>${puff(880, 590, 30)}${puff(420, 600, 24)}${head(1, 470, 300, 0.4)}${head(5, 700, 300, 0.4)}`,
  'yuma-decision': () => `${regionBackdrop(7)}${cloud(100, 90, 1.3, GRAPE)}${cloud(260, 60, 1, GRAPE)}
${[420, 470, 520, 570].map((x) => `<rect x="${x}" y="360" width="10" height="70" fill="${PAPER}" ${ink()} stroke-width="3"/>`).join('')}
<g transform="translate(60 380) scale(1.1)">${inner(vanSvg('dusty'))}</g>
<g transform="translate(900 300)"><rect x="-80" y="-70" width="160" height="70" fill="${PAPER}" ${ink()}/>${text(0, -24, 'FERRY $85', { size: 30 })}<rect x="-6" y="0" width="12" height="60" fill="${TAN}" ${ink()}/></g>`,
  'laguna-decision': () => `${regionBackdrop(11)}
<polygon points="600,675 300,675 420,520 780,520" fill="${ASPHALT}" ${ink()}/>
<polygon points="780,520 1200,470 1200,560 820,600" fill="${ASPHALT}" ${ink()}/>
<polygon points="420,520 0,470 0,560 380,600" fill="#5E5E5E" ${ink()}/>
${diamondSign(180, 420, 46, `<polygon points="-24,16 24,16 24,-6" fill="${INK}"/><rect x="-14" y="-16" width="20" height="14" fill="${INK}"/>`)}
${text(180, 520, '6% GRADE', { size: 30, fill: RED, stroke: PAPER, strokeWidth: 6 })}
<g transform="translate(1020 420)"><path d="M-40 -46 h80 c0 0 6 28 -2 52 c-8 26 -26 40 -38 46 c-12 -6 -30 -20 -38 -46 c-8 -24 -2 -52 -2 -52z" fill="${CREAM}" ${ink()}/>${text(0, 20, '80', { size: 44 })}<rect x="-5" y="52" width="10" height="60" fill="${TAN}" ${ink()}/></g>
${text(1020, 560, 'OLD HIGHWAY 80', { size: 26, fill: PAPER, stroke: INK, strokeWidth: 6 })}
<g transform="translate(400 430) scale(0.9)">${inner(vanSvg('night'))}</g>`,
  victory: () => `${regionBackdrop(12)}
<polygon points="0,675 0,420 220,400 420,440 520,520 560,675" fill="${SAND}" ${ink()}/>
<g transform="translate(40 300) scale(1)">${inner(vanSvg('clean'))}</g>
${jumper(560, 330, -20, YELLOW, 1)}${jumper(660, 300, 15, BLUE, 2)}${jumper(760, 360, -8, RED, 3)}${jumper(850, 320, 25, LIME, 4)}${jumper(940, 390, -15, ORANGE, 5)}
${burst(600, 120, 130, YELLOW, 10)}${text(600, 135, 'END 8', { size: 54 })}
${puff(1000, 640, 40, PAPER)}${puff(800, 660, 36, PAPER)}`,
  'victory-night': () => `${regionBackdrop(12)}<rect width="1200" height="675" fill="${GRAPE}" opacity=".6"/>
${star(120, 60, 9)}${star(300, 120, 6)}${star(520, 50, 8)}${star(900, 80, 7)}${star(1100, 140, 5)}<circle cx="760" cy="110" r="56" fill="${CREAM}" ${ink()}/>
<polygon points="0,675 0,420 220,400 420,440 520,520 560,675" fill="#8A6A3C" ${ink()}/>
<g transform="translate(40 300)">${inner(vanSvg('night'))}</g>
<polygon points="300,560 340,470 380,560" fill="${ORANGE}" ${ink()}/><polygon points="320,560 340,505 360,560" fill="${YELLOW}"/>
${head(1, 200, 430, 0.5)}${head(2, 400, 440, 0.5)}${head(3, 300, 470, 0.45)}`,
  memorial: () => `
<rect width="1200" height="675" fill="${GRAPE}"/><rect y="300" width="1200" height="60" fill="${ORANGE}"/><rect y="360" width="1200" height="315" fill="#3E2A5C"/>
${star(120, 80, 8)}${star(400, 50, 6)}${star(1000, 90, 9)}
<polygon points="560,360 640,360 1200,675 0,675" fill="${ASPHALT}" ${ink()}/>
<rect x="590" y="500" width="20" height="8" fill="${YELLOW}"/><rect x="580" y="580" width="40" height="12" fill="${YELLOW}"/>
<circle cx="596" cy="372" r="6" fill="${RED}"/><circle cx="606" cy="372" r="6" fill="${RED}"/>
<g transform="translate(980 470)"><rect x="-16" y="-160" width="32" height="200" fill="${PAPER}" ${ink()}/><rect x="-80" y="-110" width="160" height="32" fill="${PAPER}" ${ink()}/><circle cx="0" cy="-94" r="28" fill="${SILVER}" ${ink()}/><circle cx="0" cy="-94" r="10" fill="${INK}"/>${[-50, 50].map((x) => `<circle cx="${x}" cy="40" r="16" fill="${RED}" ${ink()} stroke-width="3"/><circle cx="${x}" cy="40" r="6" fill="${YELLOW}"/>`).join('')}<path d="M40 60 l30 -8 l10 20 l-36 6z" fill="${TAN}" ${ink()}/></g>`,
  'game-over': () => `${regionBackdrop(2)}
<g transform="translate(360 330) scale(1.3)">${inner(vanSvg('steam'))}</g>
<g transform="translate(560 250)"><ellipse cx="0" cy="0" rx="40" ry="50" fill="${INK}"/><circle cx="0" cy="-60" r="26" fill="#7A4E2D" ${ink()}/><path d="M-26 -66 h52 v14 h-52z" fill="${INK}"/><path d="M-6 -46 l12 0 l-6 14z" fill="${YELLOW}" ${ink()} stroke-width="3"/><path d="M-30 -10 l-40 -10 M30 -10 l40 -10" ${ink()} stroke-width="8"/></g>
${guideSign(1040, 380, 90, '8', 40)}`,
};

export function sceneSvg(id: SceneId): string {
  return svg('0 0 1200 675', `<g data-scene="${id}">${SCENE_ART[id]()}</g>`);
}

/** Cover No. 1: masthead, the van, the crew, the price, the plate. */
export function coverSvg(): string {
  const rays: string[] = [];
  for (let a = 0; a < 360; a += 20) {
    const r = (a * Math.PI) / 180;
    const r2 = ((a + 10) * Math.PI) / 180;
    rays.push(`<polygon points="400,560 ${400 + Math.cos(r) * 1400},${560 + Math.sin(r) * 1400} ${400 + Math.cos(r2) * 1400},${560 + Math.sin(r2) * 1400}" fill="${ORANGE}"/>`);
  }
  return svg(
    '0 0 800 1200',
    `<rect width="800" height="1200" fill="${YELLOW}"/>${rays.join('')}
<rect x="0" y="0" width="800" height="150" fill="${RED}" ${ink()} stroke-width="10"/>
${text(400, 80, 'THE 8 WEST', { size: 70, font: 'mast', fill: PAPER, stroke: INK, strokeWidth: 8 })}
${text(400, 136, 'TRAIL', { size: 62, font: 'mast', fill: PAPER, stroke: INK, strokeWidth: 8 })}
<rect x="30" y="170" width="160" height="70" fill="${PAPER}" ${ink()}/>${text(110, 218, 'No. 1', { size: 40 })}
<rect x="610" y="170" width="160" height="70" fill="${PAPER}" ${ink()}/>${text(690, 218, '85¢', { size: 40 })}
${road(1010, 800, 120)}
<g transform="translate(150 520) scale(1.7)">${inner(vanSvg('hero'))}</g>
${head(1, 40, 300, 0.9)}${head(2, 600, 300, 0.9)}${head(3, 20, 780, 0.8)}${head(4, 620, 780, 0.8)}${head(5, 320, 260, 0.7)}
${burst(400, 960, 200, PAPER, 12)}${text(400, 950, '730 MILES', { size: 48, fill: RED })}${text(400, 1000, 'OF DESERT!', { size: 40, fill: RED })}
<rect x="200" y="1130" width="400" height="50" fill="${NAVY}" ${ink()}/>${text(400, 1165, '8 WEST IT PRESENTS', { size: 26, fill: PAPER, spacing: 2 })}
${shield(700, 1100, 0.7)}`,
    { attrs: 'data-cover="1"' },
  );
}

/** A postcard: the region this stop sits in, with its name in a caption box. 8:5. */
export function stopSvg(stopId: string): string {
  const stop = ROUTE.find((s) => s.id === stopId);
  const region = regionAt(stop?.mile ?? 0);
  const name = (stop?.name ?? stopId.replace(/-/g, ' ')).toUpperCase();
  return svg(
    '0 0 1200 750',
    `<g transform="translate(-400 0) scale(1.6667)">${inner(regionSvg(region))}</g>${caption(40, 40, Math.max(300, name.length * 28 + 60), name, 40)}`,
    { attrs: `data-stop="${stopId}"` },
  );
}

export const BILLBOARD_TAGLINES: readonly string[] = [
  'WE FIX IT BEFORE IT BREAKS!',
  '365 DAYS. ZERO FIRE DRILLS.',
  'YOUR IT, RIDING SHOTGUN.',
  'NEXT EXIT: PEACE OF MIND',
  'RANSOMWARE? NOT ON OUR ROAD.',
  "SAN DIEGO'S IT CREW. NOW SERVING THE WHOLE 8.",
  'PATCHED. BACKED UP. BEACH-READY.',
  'MANAGED IT. UNMANAGED SUNSETS.',
];

const BILLBOARD_FACES: readonly { fill: string; text: string }[] = [
  { fill: PAPER, text: RED },
  { fill: NAVY, text: PAPER },
  { fill: ORANGE, text: PAPER },
  { fill: '#1E7B3A', text: PAPER },
  { fill: PAPER, text: NAVY },
  { fill: SKY, text: NAVY },
  { fill: YELLOW, text: NAVY },
  { fill: PAPER, text: NAVY },
];

function wrapWords(line: string, max: number): string[] {
  const words = line.split(' ');
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) out.push(cur);
  return out;
}

/** A roadside billboard on two posts, 3:1. Face 0 is the blank plate. */
export function billboardSvg(n: number): string {
  const idx = Math.max(0, Math.min(BILLBOARD_TAGLINES.length, Math.round(n)));
  const face = idx === 0 ? { fill: PAPER, text: INK } : BILLBOARD_FACES[idx - 1]!;
  const lines = idx === 0 ? [] : wrapWords(BILLBOARD_TAGLINES[idx - 1]!, 22);
  const size = lines.length > 1 ? 52 : 64;
  const outline = face.fill === PAPER ? {} : { stroke: INK, strokeWidth: 6 };
  const lettering = lines.map((l, i) => text(600, 150 + i * (size + 6) - (lines.length - 1) * 20, l, { size, fill: face.text, ...outline })).join('');
  return svg(
    '0 0 1200 400',
    `<rect x="240" y="300" width="24" height="100" fill="${SILVER}" ${ink()}/><rect x="936" y="300" width="24" height="100" fill="${SILVER}" ${ink()}/>
<rect x="60" y="30" width="1080" height="280" fill="${face.fill}" ${ink()} stroke-width="10"/>
${lettering}
${idx === 0 ? '' : `${shield(1040, 250, 0.7)}${text(880, 270, '8 WEST IT 365', { size: 34, fill: face.text, spacing: 2 })}`}`,
    { attrs: `data-billboard="${idx}"` },
  );
}

/** SFX lettering on a burst, 3:1. The live page letters SFX in HTML; this fills the asset slot. */
export function sfxSvg(id: SfxId): string {
  const word = SFX_WORDS[id];
  const color = SFX_COLORS[id];
  return svg(
    '0 0 1200 400',
    `${burst(600, 200, 560, color.burst, 16)}
<g transform="rotate(-6 600 200)">
${text(612, 262, word, { size: 170, fill: INK, spacing: 4 })}
${text(600, 250, word, { size: 170, fill: color.fill, stroke: INK, strokeWidth: 14, spacing: 4 })}
</g>`,
    { attrs: `data-sfx="${id}"` },
  );
}

export function signageSvg(id: SignageId): string {
  switch (id) {
    case 'shield-i8':
      return svg('0 0 200 200', shield(100, 100, 1.8), { bare: true });
    case 'shield-historic-80':
      return svg('0 0 200 200', `<path d="M40 30 h120 c0 0 8 50 -6 84 c-14 34 -50 52 -74 62 c-24 -10 -60 -28 -74 -62 c-14 -34 -6 -84 -6 -84z" fill="#7A4E2D" ${ink()}/>${text(100, 80, 'HISTORIC', { size: 20, fill: CREAM })}${text(100, 136, 'US 80', { size: 40, fill: CREAM })}`, { bare: true });
    case 'guide-sign-blank':
      return svg('0 0 600 240', guideSign(300, 20, 560, '', 40));
    case 'exit-sign':
      return svg('0 0 600 240', guideSign(300, 20, 560, 'EXIT  →', 44));
    case 'mile-marker':
      return svg('0 0 120 300', `<rect x="40" y="0" width="40" height="300" fill="#1E7B3A" ${ink()}/>${text(60, 80, '8', { size: 40, fill: PAPER })}`);
    case 'sign-sea-level':
      return svg('0 0 600 240', guideSign(300, 20, 560, 'ELEVATION SEA LEVEL', 34));
    case 'sign-end-8':
      return svg('0 0 600 300', `${guideSign(300, 20, 400, 'END 8', 60)}${shield(300, 250, 0.5)}`);
    case 'sign-dust-storms':
      return svg('0 0 300 300', `${diamondSign(150, 130, 100, `${text(150 - 150, 120 - 130, 'DUST', { size: 30 })}${text(0, 24, 'STORMS', { size: 30 })}`)}`);
    case 'sign-flash-flood':
      return svg('0 0 300 300', `${diamondSign(150, 130, 100, `${text(0, -10, 'WATCH FOR', { size: 22 })}${text(0, 24, 'FLASH FLOODS', { size: 22 })}`)}`);
    case 'sign-grade':
      return svg('0 0 300 300', `${diamondSign(150, 130, 100, `<polygon points="-60,40 60,40 60,-10" fill="${INK}"/><rect x="-40,-30" y="-30" width="40" height="30" fill="${INK}"/>${text(0, 70, '6% GRADE', { size: 22 })}`)}`);
    case 'sign-runaway-ramp':
      return svg('0 0 600 240', guideSign(300, 20, 560, 'RUNAWAY TRUCK RAMP', 34, YELLOW).replace(`fill="${PAPER}"`, `fill="${INK}"`));
    case 'sign-outfitter':
      return svg('0 0 600 300', `<rect x="40" y="40" width="520" height="160" rx="10" fill="#8E6B3E" ${ink()} stroke-width="8"/>${text(300, 140, 'THE OUTFITTER', { size: 60, fill: CREAM })}${text(520, 190, '.85', { size: 28, fill: PAPER })}<rect x="280" y="200" width="40" height="100" fill="#7A4E2D" ${ink()}/>`);
    case 'tow-truck':
      return svg('0 0 400 400', `<rect x="40" y="190" width="300" height="90" fill="${PAPER}" ${ink()}/><path d="M40 190 v-70 h110 l40 70z" fill="${PAPER}" ${ink()}/><rect x="58" y="134" width="70" height="40" fill="${SKY}" ${ink()} stroke-width="3"/><rect x="40" y="230" width="300" height="12" fill="${RED}"/><rect x="40" y="242" width="300" height="10" fill="${BLUE}"/><path d="M220 190 l100 -110 l14 10 l-96 100z" fill="${INK}"/><rect x="60" y="106" width="70" height="14" rx="4" fill="${YELLOW}" ${ink()} stroke-width="3"/><circle cx="100" cy="290" r="28" fill="${INK}"/><circle cx="280" cy="290" r="28" fill="${INK}"/>${text(180, 218, '8 WEST IT', { size: 20, fill: NAVY })}${text(180, 272, 'ROADSIDE DIV.', { size: 14, fill: NAVY })}`);
    case 'water-tower':
      return svg('0 0 300 400', `<line x1="90" y1="400" x2="110" y2="180" ${ink()}/><line x1="210" y1="400" x2="190" y2="180" ${ink()}/><line x1="100" y1="300" x2="200" y2="300" ${ink()} stroke-width="4"/><rect x="60" y="80" width="180" height="120" rx="24" fill="${PAPER}" ${ink()}/><path d="M60 80 q90 -60 180 0z" fill="${PAPER}" ${ink()}/>${text(150, 150, '8 WEST', { size: 40, fill: '#1E3A66' })}${text(150, 184, 'VENTURES', { size: 16, fill: '#1E3A66' })}`);
    case 'ghost-sign':
      return svg('0 0 600 400', `<rect width="600" height="400" fill="#9E4B3B" ${ink()}/>${Array.from({ length: 8 }, (_, r) => Array.from({ length: 6 }, (_, c) => `<rect x="${c * 100 + (r % 2) * 50 - 50}" y="${r * 50}" width="96" height="46" fill="none" stroke="#7A3A2E" stroke-width="3"/>`).join('')).join('')}${text(300, 170, '8 WEST VENTURES', { size: 56, fill: PAPER, spacing: 3 })}<rect x="0" y="0" width="600" height="400" fill="url(#ht)" opacity=".5"/><rect x="420" y="300" width="60" height="30" fill="${PAPER}" ${ink()} stroke-width="3"/>${text(450, 322, '8 WEST IT', { size: 12, fill: NAVY })}`);
  }
}

/** A plain paper plate with the slot name, for anything without a drawing of its own. */
export function plateSvg(label: string, w = 600, h = 300): string {
  return svg(`0 0 ${w} ${h}`, `<rect x="10" y="10" width="${w - 20}" height="${h - 20}" fill="${CREAM}" ${ink()} stroke-width="8"/><rect x="10" y="10" width="${w - 20}" height="${h - 20}" fill="url(#ht)" opacity=".35"/>${text(w / 2, h / 2 + 12, label.toUpperCase(), { size: Math.min(48, (w / Math.max(6, label.length)) * 1.4), spacing: 2 })}`);
}

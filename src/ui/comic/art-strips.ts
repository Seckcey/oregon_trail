// Event strips: three square frames per event — the wide shot, the thing
// itself up close, and the crew's faces. Every strip in the asset list has
// a setting, a prop, and a mood; the drawings come from a small prop box. §10.

import type { EventStripId } from '../assets';
import {
  ASPHALT,
  BLUE,
  CREAM,
  DUST,
  GRAPE,
  INK,
  LIME,
  NAVY,
  ORANGE,
  PALE,
  PAPER,
  RED,
  SAND,
  SILVER,
  SKY,
  TAN,
  YELLOW,
  burst,
  cloud,
  ink,
  puff,
  road,
  saguaro,
  star,
  sun,
  svg,
  text,
} from './art-shared';
import { crewHeadSvg } from './art-crew';
import { vanSvg } from './art-van';
import type { CrewMood } from './layout';

type Setting = 'desert' | 'town' | 'night' | 'river' | 'mountain' | 'dunes' | 'storm' | 'dusk';
type Prop =
  | 'tire'
  | 'steam'
  | 'belt'
  | 'sushi'
  | 'sun'
  | 'snake'
  | 'cruiser'
  | 'thief'
  | 'laptop'
  | 'crossroads'
  | 'wind'
  | 'pecans'
  | 'shield-80'
  | 'dust-wall'
  | 'storm'
  | 'tow-truck'
  | 'jerry-can'
  | 'cross'
  | 'taco-stand'
  | 'shake'
  | 'wave'
  | 'ferry'
  | 'barricade'
  | 'hot-spring'
  | 'ramp'
  | 'grade-sign'
  | 'old-80';

interface StripSpec {
  setting: Setting;
  prop: Prop;
  mood: CrewMood;
  /** Van pose in the wide shot. */
  van: 'clean' | 'dusty' | 'battered' | 'steam' | 'night' | 'splash' | 'skid' | 'airborne';
}

const STRIPS: Record<EventStripId, StripSpec> = {
  'flat-tire': { setting: 'desert', prop: 'tire', mood: 'poor', van: 'skid' },
  radiator: { setting: 'mountain', prop: 'steam', mood: 'poor', van: 'steam' },
  belt: { setting: 'desert', prop: 'belt', mood: 'critical', van: 'clean' },
  sushi: { setting: 'night', prop: 'sushi', mood: 'critical', van: 'night' },
  heatstroke: { setting: 'desert', prop: 'sun', mood: 'poor', van: 'dusty' },
  snake: { setting: 'desert', prop: 'snake', mood: 'critical', van: 'clean' },
  'speed-trap': { setting: 'desert', prop: 'cruiser', mood: 'fair', van: 'airborne' },
  thief: { setting: 'night', prop: 'thief', mood: 'poor', van: 'night' },
  ransomware: { setting: 'night', prop: 'laptop', mood: 'poor', van: 'night' },
  'wrong-turn': { setting: 'desert', prop: 'crossroads', mood: 'fair', van: 'dusty' },
  tailwind: { setting: 'desert', prop: 'wind', mood: 'good', van: 'airborne' },
  'pecan-stand': { setting: 'town', prop: 'pecans', mood: 'good', van: 'clean' },
  'historic-80': { setting: 'dusk', prop: 'shield-80', mood: 'good', van: 'dusty' },
  'dust-storm': { setting: 'storm', prop: 'dust-wall', mood: 'poor', van: 'dusty' },
  monsoon: { setting: 'storm', prop: 'storm', mood: 'fair', van: 'clean' },
  'tow-truck': { setting: 'dusk', prop: 'tow-truck', mood: 'fair', van: 'battered' },
  siphon: { setting: 'night', prop: 'jerry-can', mood: 'poor', van: 'night' },
  memorial: { setting: 'dusk', prop: 'cross', mood: 'poor', van: 'dusty' },
  'snack-stand': { setting: 'dusk', prop: 'taco-stand', mood: 'good', van: 'clean' },
  'date-shake': { setting: 'desert', prop: 'shake', mood: 'good', van: 'clean' },
  'river-ford': { setting: 'river', prop: 'wave', mood: 'fair', van: 'splash' },
  'river-ferry': { setting: 'river', prop: 'ferry', mood: 'good', van: 'clean' },
  'dunes-closure': { setting: 'dunes', prop: 'barricade', mood: 'fair', van: 'dusty' },
  'hot-springs': { setting: 'night', prop: 'hot-spring', mood: 'good', van: 'night' },
  'runaway-ramp': { setting: 'mountain', prop: 'ramp', mood: 'critical', van: 'skid' },
  'the-grade': { setting: 'mountain', prop: 'grade-sign', mood: 'fair', van: 'skid' },
  'old-80': { setting: 'dusk', prop: 'old-80', mood: 'good', van: 'night' },
};

const VIEW = '0 0 400 400';

function backdrop(setting: Setting): string {
  switch (setting) {
    case 'desert':
      return `<rect width="400" height="400" fill="${SKY}"/>${sun(320, 70, 34)}<rect y="230" width="400" height="170" fill="${SAND}"/>${saguaro(60, 260, 120)}${saguaro(330, 250, 80)}`;
    case 'town':
      return `<rect width="400" height="400" fill="${SKY}"/><rect y="230" width="400" height="170" fill="${SAND}"/><rect x="40" y="150" width="120" height="80" fill="${TAN}" ${ink()}/><rect x="240" y="170" width="130" height="60" fill="${PAPER}" ${ink()}/>`;
    case 'night':
      return `<rect width="400" height="400" fill="${GRAPE}"/>${star(60, 50, 8)}${star(160, 30, 6)}${star(300, 60, 9)}${star(360, 120, 5)}<circle cx="250" cy="80" r="30" fill="${CREAM}" ${ink()}/><rect y="230" width="400" height="170" fill="#3E2A5C"/>`;
    case 'river':
      return `<rect width="400" height="400" fill="${SKY}"/><rect y="180" width="400" height="120" fill="${TAN}"/><rect y="230" width="400" height="120" fill="${BLUE}"/><path d="M0 260 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="${PAPER}" stroke-width="4"/><rect y="350" width="400" height="50" fill="${SAND}"/>`;
    case 'mountain':
      return `<rect width="400" height="400" fill="${SKY}"/><polygon points="0,260 90,120 180,220 260,90 340,200 400,150 400,400 0,400" fill="${TAN}" ${ink()}/><polygon points="180,220 260,90 340,200 300,260 200,270" fill="url(#ht)"/>`;
    case 'dunes':
      return `<rect width="400" height="400" fill="${PALE}"/><polygon points="0,300 0,200 120,140 240,220 330,150 400,200 400,400 0,400" fill="${SAND}" ${ink()}/><polygon points="0,400 0,320 150,260 300,330 400,290 400,400" fill="${ORANGE}" opacity=".8"/>`;
    case 'storm':
      return `<rect width="400" height="400" fill="#7C8C9A"/>${cloud(120, 80, 1.4, GRAPE)}${cloud(300, 60, 1.1, GRAPE)}<rect y="240" width="400" height="160" fill="${DUST}"/>`;
    case 'dusk':
      return `<rect width="400" height="400" fill="${ORANGE}"/><rect y="120" width="400" height="80" fill="${YELLOW}"/>${sun(200, 200, 44)}<rect y="220" width="400" height="180" fill="${GRAPE}"/>`;
  }
}

function inner(svgText: string): string {
  return svgText.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
}

function wideShot(spec: StripSpec): string {
  return `${backdrop(spec.setting)}${road(300, 400, 100)}<g transform="translate(40 200) scale(0.8)">${inner(vanSvg(spec.van))}</g>`;
}

function propArt(prop: Prop): string {
  switch (prop) {
    case 'tire':
      return `${burst(200, 200, 170, YELLOW, 12)}<circle cx="200" cy="200" r="90" fill="${INK}"/><circle cx="200" cy="200" r="44" fill="${SILVER}" ${ink()}/><path d="M120 120 l-40 -40 M290 130 l50 -40 M110 280 l-50 40 M300 290 l40 40" ${ink()} stroke-width="10"/>${[60, 340, 80, 330].map((x, i) => `<rect x="${x}" y="${i % 2 ? 60 : 330}" width="18" height="12" rx="4" fill="${INK}" transform="rotate(${i * 40} ${x} 200)"/>`).join('')}`;
    case 'steam':
      return `<rect x="60" y="260" width="280" height="80" fill="${PAPER}" ${ink()}/><path d="M60 260 l-20 -120 h300 z" fill="${PAPER}" ${ink()}/>${[
        [200, 140, 80],
        [120, 170, 55],
        [290, 170, 60],
        [170, 80, 50],
        [250, 70, 45],
      ]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" ${ink()}/>`)
        .join('')}`;
    case 'belt':
      return `<rect width="400" height="400" fill="${NAVY}"/><circle cx="110" cy="200" r="60" fill="${SILVER}" ${ink()}/><circle cx="300" cy="200" r="40" fill="${SILVER}" ${ink()}/><path d="M110 140 q100 -40 190 20" fill="none" ${ink()} stroke-width="18"/><path d="M110 260 q60 30 120 12" fill="none" ${ink()} stroke-width="18"/><path d="M230 272 l20 -30 M300 240 l-20 30" ${ink()} stroke-width="18" stroke-linecap="round"/>${star(260, 250, 22, YELLOW)}${star(290, 290, 14, YELLOW)}${star(230, 300, 12, YELLOW)}`;
    case 'sushi':
      return `<rect width="400" height="400" fill="${PALE}"/><rect x="30" y="80" width="340" height="260" rx="10" fill="${PAPER}" ${ink()}/><rect x="30" y="80" width="340" height="30" fill="${SKY}" ${ink()}/>${[90, 170, 250, 330].map((x) => `<circle cx="${x}" cy="200" r="34" fill="${PAPER}" ${ink()}/><circle cx="${x}" cy="200" r="16" fill="${ORANGE}"/><path d="M${x - 34} 200 a34 34 0 0 0 68 0" fill="${INK}" opacity=".85"/>`).join('')}<rect x="200" y="260" width="150" height="50" fill="${YELLOW}" ${ink()}/>${text(275, 295, '2 FOR $8.85', { size: 24 })}`;
    case 'sun':
      return `<rect width="400" height="400" fill="${SKY}"/>${[0, 30, 60, 90, 120, 150].map((a) => `<line x1="${200 + Math.cos((a * Math.PI) / 180) * 120}" y1="${200 + Math.sin((a * Math.PI) / 180) * 120}" x2="${200 - Math.cos((a * Math.PI) / 180) * 120}" y2="${200 - Math.sin((a * Math.PI) / 180) * 120}" ${ink()} stroke-width="8"/>`).join('')}${sun(200, 200, 90)}<circle cx="170" cy="185" r="7" fill="${INK}"/><circle cx="230" cy="185" r="7" fill="${INK}"/><path d="M160 220 q40 40 80 0z" fill="${INK}"/><path d="M170 226 q30 10 60 0" fill="${PAPER}"/>`;
    case 'snake':
      return `<rect width="400" height="400" fill="${TAN}"/><ellipse cx="200" cy="230" rx="160" ry="120" fill="${INK}" opacity=".25"/><path d="M80 280 q60 -120 140 -60 t120 40 q-40 60 -100 20 t-80 -40 q-30 20 -80 40z" fill="${LIME}" ${ink()}/><path d="M100 250 l20 -20 l20 20 l20 -20 l20 20" fill="none" ${ink()} stroke-width="4"/><circle cx="300" cy="230" r="28" fill="${LIME}" ${ink()}/><circle cx="310" cy="222" r="5" fill="${YELLOW}" ${ink()} stroke-width="2"/><path d="M326 236 l30 -6 l-24 14z" fill="${RED}" ${ink()} stroke-width="3"/><path d="M60 300 q10 -30 30 0 q10 -30 30 0" fill="none" ${ink()} stroke-width="6"/>`;
    case 'cruiser':
      return `<rect width="400" height="400" fill="${NAVY}"/><rect x="80" y="180" width="240" height="90" rx="12" fill="${PAPER}" ${ink()}/><path d="M110 180 l30 -50 h120 l30 50z" fill="${PAPER}" ${ink()}/><rect x="150" y="140" width="100" height="36" fill="${SKY}"/><rect x="140" y="100" width="120" height="30" rx="6" fill="${INK}"/><rect x="150" y="106" width="40" height="18" fill="${RED}"/><rect x="210" y="106" width="40" height="18" fill="${BLUE}"/>${burst(170, 115, 70, RED, 8)}${burst(230, 115, 70, BLUE, 8)}<circle cx="130" cy="280" r="26" fill="${INK}"/><circle cx="270" cy="280" r="26" fill="${INK}"/>`;
    case 'thief':
      return `<rect width="400" height="400" fill="${GRAPE}"/><rect x="40" y="60" width="200" height="90" fill="${RED}" ${ink()}/>${text(140, 120, 'VACANCY', { size: 34, fill: PAPER })}<path d="M230 360 l20 -140 q30 -60 60 0 l20 140z" fill="${INK}"/><circle cx="280" cy="210" r="26" fill="#3E2A5C" ${ink()}/><rect x="200" y="250" width="44" height="60" rx="8" fill="${BLUE}" ${ink()}/><rect x="316" y="260" width="50" height="60" fill="${TAN}" ${ink()}/>`;
    case 'laptop':
      return `<rect width="400" height="400" fill="${NAVY}"/><rect x="60" y="80" width="280" height="180" rx="8" fill="${SILVER}" ${ink()}/><rect x="76" y="94" width="248" height="150" fill="${RED}"/><path d="M40 260 h320 l20 40 h-360z" fill="${SILVER}" ${ink()}/><rect x="170" y="140" width="60" height="50" rx="6" fill="${YELLOW}" ${ink()}/><path d="M182 140 v-16 a18 18 0 0 1 36 0 v16" fill="none" ${ink()} stroke-width="8"/>${text(200, 228, '$185', { size: 34, fill: PAPER })}`;
    case 'crossroads':
      return `<rect width="400" height="400" fill="${SKY}"/><rect y="240" width="400" height="160" fill="${SAND}"/><rect x="190" y="120" width="20" height="240" fill="${TAN}" ${ink()}/>${[-16, 0, 16].map((r, i) => `<g transform="rotate(${r} 200 ${150 + i * 50})"><polygon points="120,${140 + i * 50} 280,${140 + i * 50} 300,${155 + i * 50} 280,${170 + i * 50} 120,${170 + i * 50}" fill="${PAPER}" ${ink()}/>${text(200, 165 + i * 50, '?', { size: 24 })}</g>`).join('')}<path d="M40 60 q10 -10 20 0 q10 -10 20 0 M320 80 q10 -10 20 0 q10 -10 20 0" fill="none" ${ink()} stroke-width="4"/>`;
    case 'wind':
      return `<rect width="400" height="400" fill="${SKY}"/>${cloud(120, 200, 1.6)}<circle cx="128" cy="184" r="7" fill="${INK}"/><circle cx="154" cy="184" r="7" fill="${INK}"/><ellipse cx="150" cy="214" rx="14" ry="10" fill="${INK}"/>${[170, 200, 230].map((y, i) => `<path d="M170 ${y} q60 ${i % 2 ? 20 : -20} 190 0" fill="none" ${ink()} stroke-width="8"/>`).join('')}`;
    case 'pecans':
      return `<rect width="400" height="400" fill="${SKY}"/><rect y="250" width="400" height="150" fill="${SAND}"/><rect x="60" y="180" width="280" height="80" fill="${TAN}" ${ink()}/><rect x="40" y="150" width="320" height="40" fill="${RED}" ${ink()}/>${text(200, 180, 'PECANS', { size: 30, fill: PAPER })}${[100, 200, 300].map((x) => `<path d="M${x - 40} 260 q0 -60 40 -60 q40 0 40 60z" fill="${TAN}" ${ink()}/>${[-14, 0, 14].map((dx) => `<ellipse cx="${x + dx}" cy="230" rx="6" ry="9" fill="#7A4E2D" ${ink()} stroke-width="2"/>`).join('')}`).join('')}${[60, 340].map((x) => `<path d="M${x} 120 q0 40 10 60 M${x + 8} 120 q0 40 -10 60" stroke="${RED}" stroke-width="8" stroke-linecap="round"/>`).join('')}`;
    case 'shield-80':
      return `<rect width="400" height="400" fill="${YELLOW}"/><rect y="280" width="400" height="120" fill="${SAND}"/><rect x="190" y="200" width="20" height="120" fill="${TAN}" ${ink()}/><path d="M110 80 h180 c0 0 10 60 -6 100 c-16 40 -60 60 -84 70 c-24 -10 -68 -30 -84 -70 c-16 -40 -6 -100 -6 -100z" fill="#7A4E2D" ${ink()}/>${text(200, 130, 'HISTORIC', { size: 22, fill: CREAM })}${text(200, 190, 'US 80', { size: 46, fill: CREAM })}`;
    case 'dust-wall':
      return `<rect width="400" height="400" fill="${SKY}"/><rect y="300" width="400" height="100" fill="${SAND}"/><path d="M400 400 v-380 q-60 20 -110 90 q-40 -30 -90 40 q-60 -20 -80 60 q-50 20 -60 100 q-30 40 -60 90z" fill="${DUST}" ${ink()}/><path d="M400 400 v-300 q-60 30 -100 100 q-50 -10 -70 70 q-60 0 -80 130z" fill="${ORANGE}" opacity=".5"/>${puff(80, 380, 40, DUST)}${puff(250, 390, 46, DUST)}<path d="M330 40 q-50 0 -60 40" fill="none" stroke="${YELLOW}" stroke-width="10"/>`;
    case 'storm':
      return `<rect width="400" height="400" fill="#5B6B7B"/>${cloud(200, 110, 2.4, GRAPE)}<polygon points="180,150 240,150 200,220 240,220 150,330 180,250 140,250" fill="${YELLOW}" ${ink()}/>${Array.from({ length: 10 }, (_, i) => `<line x1="${30 + i * 40}" y1="200" x2="${20 + i * 40}" y2="400" stroke="${SILVER}" stroke-width="5" opacity=".8"/>`).join('')}`;
    case 'tow-truck':
      return `<rect width="400" height="400" fill="${ORANGE}"/><rect y="300" width="400" height="100" fill="${ASPHALT}"/><rect x="40" y="190" width="300" height="90" fill="${PAPER}" ${ink()}/><path d="M40 190 v-70 h110 l40 70z" fill="${PAPER}" ${ink()}/><rect x="58" y="134" width="70" height="40" fill="${SKY}" ${ink()} stroke-width="3"/><rect x="40" y="230" width="300" height="12" fill="${RED}"/><rect x="40" y="242" width="300" height="10" fill="${BLUE}"/><path d="M220 190 l100 -110 l14 10 l-96 100z" fill="${INK}"/><path d="M320 80 q30 30 10 60" fill="none" ${ink()} stroke-width="6"/><rect x="60" y="106" width="70" height="14" rx="4" fill="${YELLOW}" ${ink()} stroke-width="3"/><circle cx="100" cy="290" r="28" fill="${INK}"/><circle cx="280" cy="290" r="28" fill="${INK}"/>${text(180, 218, '8 WEST IT', { size: 20, fill: NAVY })}${text(180, 272, 'ROADSIDE DIV.', { size: 14, fill: NAVY })}`;
    case 'jerry-can':
      return `<rect width="400" height="400" fill="${GRAPE}"/><rect x="120" y="120" width="160" height="200" rx="14" fill="${RED}" ${ink()}/><rect x="150" y="90" width="50" height="40" rx="8" fill="${RED}" ${ink()}/><rect x="170" y="150" width="60" height="120" fill="none" ${ink()} stroke-width="4"/><path d="M280 180 q80 -60 80 60 q0 80 -60 120" fill="none" ${ink()} stroke-width="10"/><path d="M280 180 q80 -60 80 60 q0 80 -60 120" fill="none" stroke="${LIME}" stroke-width="5"/>`;
    case 'cross':
      return `<rect width="400" height="400" fill="${GRAPE}"/><rect y="180" width="400" height="80" fill="${ORANGE}"/><rect y="260" width="400" height="140" fill="#3E2A5C"/><rect x="185" y="120" width="30" height="220" fill="${PAPER}" ${ink()}/><rect x="120" y="170" width="160" height="30" fill="${PAPER}" ${ink()}/><circle cx="200" cy="185" r="26" fill="${SILVER}" ${ink()}/><circle cx="200" cy="185" r="10" fill="${INK}"/>${[150, 250].map((x) => `<circle cx="${x}" cy="330" r="14" fill="${RED}" ${ink()} stroke-width="3"/><circle cx="${x}" cy="330" r="5" fill="${YELLOW}"/>`).join('')}${star(60, 60, 8)}${star(330, 40, 6)}`;
    case 'taco-stand':
      return `<rect width="400" height="400" fill="${ORANGE}"/><rect y="280" width="400" height="120" fill="${SAND}"/><rect x="50" y="160" width="300" height="130" fill="${PAPER}" ${ink()}/><path d="M30 160 l40 -60 h260 l40 60z" fill="${RED}" ${ink()}/><rect x="80" y="200" width="240" height="40" fill="${YELLOW}" ${ink()}/>${text(200, 230, 'TACOS', { size: 30 })}<rect x="280" y="120" width="60" height="40" fill="${INK}"/>${[300, 320].map((x) => `<path d="M${x} 110 q-10 -30 0 -50" fill="none" stroke="${SILVER}" stroke-width="6" opacity=".9"/>`).join('')}`;
    case 'shake':
      return `<rect width="400" height="400" fill="${SKY}"/><path d="M130 120 h140 l-20 220 h-100z" fill="${CREAM}" ${ink()}/><path d="M130 120 h140 l-6 60 h-128z" fill="${TAN}" ${ink()}/><rect x="120" y="100" width="160" height="24" rx="6" fill="${PAPER}" ${ink()}/><path d="M220 100 l30 -70" ${ink()} stroke-width="12"/><path d="M220 100 l30 -70" stroke="${RED}" stroke-width="6"/>${[110, 300].map((x) => `<circle cx="${x}" cy="${x === 110 ? 200 : 260}" r="6" fill="${SKY}" ${ink()} stroke-width="2"/>`).join('')}${text(200, 240, 'DATE', { size: 26, fill: '#7A4E2D' })}${text(200, 272, 'SHAKE', { size: 26, fill: '#7A4E2D' })}`;
    case 'wave':
      return `<rect width="400" height="400" fill="${SKY}"/><rect y="200" width="400" height="200" fill="${BLUE}"/><path d="M0 240 q40 -70 90 -30 q30 -80 90 -30 q40 -70 90 -20 q30 -60 130 -10 v100 h-400z" fill="${SKY}" ${ink()}/><path d="M0 300 q30 -12 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="${PAPER}" stroke-width="6"/><g transform="translate(300 120) rotate(-30)"><path d="M0 0 q24 -18 48 0 q-24 18 -48 0z M48 0 l18 -14 v28z" fill="${ORANGE}" ${ink()}/><circle cx="14" cy="-4" r="3" fill="${INK}"/></g>`;
    case 'ferry':
      return `<rect width="400" height="400" fill="${SKY}"/><rect y="220" width="400" height="180" fill="${BLUE}"/><path d="M60 260 h280 l-30 50 h-220z" fill="${PAPER}" ${ink()}/><rect x="120" y="190" width="160" height="70" fill="${RED}" ${ink()}/><rect x="180" y="150" width="30" height="40" fill="${INK}"/><rect x="60" y="120" width="120" height="60" fill="${PAPER}" ${ink()}/>${text(120, 158, 'FERRY $', { size: 22 })}<path d="M0 240 h400" ${ink()} stroke-width="3"/>`;
    case 'barricade':
      return `<rect width="400" height="400" fill="${PALE}"/><polygon points="0,400 0,260 120,200 260,270 400,220 400,400" fill="${SAND}" ${ink()}/><g transform="translate(200 240)"><rect x="-140" y="-40" width="280" height="50" fill="${PAPER}" ${ink()}/>${[-140, -80, -20, 40, 100].map((x) => `<polygon points="${x},-40 ${x + 30},-40 ${x + 60},10 ${x + 30},10" fill="${ORANGE}"/>`).join('')}<rect x="-140" y="-40" width="280" height="50" fill="none" ${ink()}/><rect x="-120" y="10" width="14" height="50" fill="${PAPER}" ${ink()}/><rect x="106" y="10" width="14" height="50" fill="${PAPER}" ${ink()}/></g>${text(200, 140, 'ROAD CLOSED', { size: 34, fill: RED, stroke: PAPER, strokeWidth: 6 })}`;
    case 'hot-spring':
      return `<rect width="400" height="400" fill="${GRAPE}"/>${star(60, 50, 7)}${star(330, 70, 6)}<ellipse cx="200" cy="260" rx="170" ry="70" fill="${TAN}" ${ink()}/><ellipse cx="200" cy="260" rx="140" ry="50" fill="${SKY}" ${ink()}/>${[120, 200, 280].map((x) => `<path d="M${x} 200 q-10 -30 0 -60" fill="none" stroke="${PAPER}" stroke-width="8" opacity=".85"/>`).join('')}<g transform="translate(230 250)"><ellipse cx="0" cy="0" rx="28" ry="18" fill="${YELLOW}" ${ink()}/><circle cx="-18" cy="-16" r="12" fill="${YELLOW}" ${ink()}/><path d="M-30 -16 l-10 4 l10 4z" fill="${ORANGE}" ${ink()} stroke-width="2"/></g>`;
    case 'ramp':
      return `<rect width="400" height="400" fill="${SKY}"/><polygon points="0,400 0,300 400,200 400,400" fill="${TAN}" ${ink()}/><polygon points="60,400 120,300 400,260 400,400" fill="#8C8C8C" ${ink()}/>${puff(160, 330, 30, SILVER)}${puff(240, 300, 26, SILVER)}<g transform="translate(180 170) rotate(28) scale(0.6)">${inner(vanSvg('clean'))}</g>`;
    case 'grade-sign':
      return `<rect width="400" height="400" fill="${SKY}"/><rect y="320" width="400" height="80" fill="#5E8F3A"/><rect x="190" y="230" width="20" height="100" fill="${SILVER}" ${ink()}/><rect x="90" y="60" width="220" height="220" rx="12" transform="rotate(45 200 170)" fill="${YELLOW}" ${ink()}/><polygon points="120,200 280,200 280,150" fill="${INK}"/><rect x="150" y="130" width="50" height="34" fill="${INK}"/>${text(200, 240, '6% GRADE', { size: 24 })}`;
    case 'old-80':
      return `<rect width="400" height="400" fill="${ORANGE}"/><rect y="260" width="400" height="140" fill="${GRAPE}"/><rect x="190" y="200" width="20" height="120" fill="${TAN}" ${ink()}/><path d="M120 90 h160 c0 0 8 50 -6 84 c-14 34 -50 52 -74 62 c-24 -10 -60 -28 -74 -62 c-14 -34 -6 -84 -6 -84z" fill="${CREAM}" ${ink()}/>${text(200, 138, 'US', { size: 28 })}${text(200, 190, '80', { size: 54 })}<g transform="translate(330 200)"><ellipse cx="0" cy="0" rx="26" ry="34" fill="#7A4E2D" ${ink()}/><circle cx="-9" cy="-8" r="8" fill="${YELLOW}" ${ink()} stroke-width="2"/><circle cx="9" cy="-8" r="8" fill="${YELLOW}" ${ink()} stroke-width="2"/><circle cx="-9" cy="-8" r="3" fill="${INK}"/><circle cx="9" cy="-8" r="3" fill="${INK}"/></g>`;
  }
}

function reaction(mood: CrewMood, setting: Setting): string {
  const ids = [1, 2, 3];
  return `${backdrop(setting)}<rect x="0" y="0" width="400" height="400" fill="${INK}" opacity=".15"/>${ids
    .map((id, i) => `<g transform="translate(${20 + i * 120} ${140 + (i % 2) * 40}) scale(0.62)">${inner(crewHeadSvg(id, mood))}</g>`)
    .join('')}`;
}

/** One frame of a strip, 1:1. */
export function stripFrameSvg(stripId: EventStripId, frame: 0 | 1 | 2): string {
  const spec = STRIPS[stripId];
  const body = frame === 0 ? wideShot(spec) : frame === 1 ? propArt(spec.prop) : reaction(spec.mood, spec.setting);
  return svg(VIEW, body, { attrs: `data-strip="${stripId}" data-frame="${frame}"` });
}

/** The whole three-panel strip in one image, 3:1, for the asset slot. */
export function stripSvg(stripId: EventStripId): string {
  const frames = ([0, 1, 2] as const).map((f) => `<g transform="translate(${f * 410} 0)"><rect width="400" height="400" fill="${PAPER}"/>${inner(stripFrameSvg(stripId, f))}<rect width="400" height="400" fill="none" ${ink()} stroke-width="10"/></g>`);
  return svg('0 0 1220 400', `<rect width="1220" height="400" fill="${PAPER}"/>${frames.join('')}`, { attrs: `data-strip="${stripId}"` });
}

export const STRIP_MOODS: Record<EventStripId, CrewMood> = Object.fromEntries(
  (Object.keys(STRIPS) as EventStripId[]).map((id) => [id, STRIPS[id].mood]),
) as Record<EventStripId, CrewMood>;

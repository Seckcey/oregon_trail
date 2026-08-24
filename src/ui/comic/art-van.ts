// The van: a boxy 1985 Econoline, white with the red-over-blue stripe,
// 8 WEST IT on the door, water jugs and a spare on the roof. Side view
// facing left, plus the action poses the asset list names. §3.

import type { VanPose } from '../assets';
import { BLUE, CREAM, GRAPE, INK, NAVY, PAPER, RED, SAND, SILVER, SKY, TAN, YELLOW, ink, puff, shield, speedLines, svg, text } from './art-shared';

const VIEW = '0 0 400 200';

function wheel(cx: number, cy: number, r = 28): string {
  return `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="${INK}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="${SILVER}" ${ink()} stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${r * 0.14}" fill="${INK}"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${cx + Math.cos((a * Math.PI) / 180) * r * 0.32}" cy="${cy + Math.sin((a * Math.PI) / 180) * r * 0.32}" r="${r * 0.06}" fill="${INK}"/>`).join('')}</g>`;
}

function body(opts: { windowFill?: string; hoodOpen?: boolean } = {}): string {
  const win = opts.windowFill ?? SKY;
  return `<g>
<rect x="40" y="128" width="330" height="36" fill="${PAPER}" ${ink()}/>
<path d="M60 128 v-70 q0 -14 14 -14 h280 q16 0 16 16 v68z" fill="${PAPER}" ${ink()}/>
<path d="M60 128 l-28 -8 v-30 l40 -30 h20 v68z" fill="${PAPER}" ${ink()}/>
<path d="M74 66 l-30 22 v14 h50 v-36z" fill="${win}" ${ink()} stroke-width="4"/>
<rect x="110" y="60" width="70" height="36" rx="4" fill="${win}" ${ink()} stroke-width="4"/>
<rect x="150" y="98" width="20" height="30" fill="${PAPER}" ${ink()} stroke-width="3"/>
<line x1="200" y1="52" x2="200" y2="164" ${ink()} stroke-width="4"/>
<rect x="34" y="104" width="336" height="14" fill="${RED}"/>
<rect x="34" y="118" width="336" height="12" fill="${BLUE}"/>
<rect x="222" y="60" width="118" height="40" rx="4" fill="${PAPER}" ${ink()} stroke-width="3"/>
${text(292, 88, '8 WEST IT', { size: 21, fill: NAVY })}
${shield(238, 80, 0.26)}
<rect x="16" y="150" width="46" height="14" rx="3" fill="${SILVER}" ${ink()} stroke-width="3"/>
<rect x="352" y="150" width="40" height="14" rx="3" fill="${SILVER}" ${ink()} stroke-width="3"/>
<circle cx="40" cy="132" r="8" fill="${YELLOW}" ${ink()} stroke-width="3"/>
<rect x="358" y="120" width="10" height="20" rx="2" fill="${RED}" ${ink()} stroke-width="3"/>
${opts.hoodOpen ? `<path d="M40 110 l-24 -60 h60 z" fill="${PAPER}" ${ink()}/>` : ''}
</g>`;
}

function rack(withSpare = true): string {
  return `<g>
<rect x="90" y="30" width="230" height="8" fill="${INK}"/>
<line x1="100" y1="38" x2="100" y2="46" ${ink()} stroke-width="4"/><line x1="310" y1="38" x2="310" y2="46" ${ink()} stroke-width="4"/>
<rect x="120" y="6" width="34" height="26" rx="5" fill="${BLUE}" ${ink()} stroke-width="3"/>
<rect x="164" y="6" width="34" height="26" rx="5" fill="${BLUE}" ${ink()} stroke-width="3"/>
${withSpare ? `<circle cx="262" cy="20" r="16" fill="${INK}"/><circle cx="262" cy="20" r="7" fill="${SILVER}"/>` : ''}
</g>`;
}

function sideView(pose: 'clean' | 'dusty' | 'battered' | 'steam' | 'night' | 'splash'): string {
  const parts: string[] = [];
  parts.push(rack(pose !== 'battered'));
  parts.push(body({ windowFill: pose === 'night' ? YELLOW : SKY, hoodOpen: pose === 'steam' }));
  parts.push(wheel(100, 164));
  parts.push(pose === 'battered' ? wheel(300, 170, 20).replace(SILVER, BLUE) : wheel(300, 164));
  if (pose === 'dusty') {
    parts.push(`<path d="M34 130 h336 v34 h-336z" fill="${TAN}" opacity=".55"/><path d="M60 128 h310 v-30 q-100 10 -310 0z" fill="${TAN}" opacity=".35"/>`);
    parts.push(`<g transform="translate(290 145)"><circle cx="0" cy="0" r="9" fill="none" ${ink()} stroke-width="2"/><circle cx="-3" cy="-3" r="1.2" fill="${INK}"/><circle cx="3" cy="-3" r="1.2" fill="${INK}"/><path d="M-4 3 q4 4 8 0" fill="none" ${ink()} stroke-width="2"/></g>`);
    parts.push(`<circle cx="52" cy="80" r="2.5" fill="${INK}"/><circle cx="64" cy="92" r="2" fill="${INK}"/><circle cx="46" cy="98" r="1.8" fill="${INK}"/>`);
  }
  if (pose === 'battered') {
    parts.push(`<path d="M16 150 l8 8 l8 -8 l8 8 l8 -8 l8 8 l8 -8" fill="none" ${ink()} stroke-width="3"/>`);
    parts.push(`<rect x="114" y="62" width="62" height="32" fill="${TAN}" ${ink()} stroke-width="3"/><path d="M120 66 l50 24 M170 66 l-50 24" ${ink()} stroke-width="2"/>`);
    parts.push(`<path d="M44 44 q-10 -30 6 -50" fill="none" stroke="${PAPER}" stroke-width="8" opacity=".9"/><circle cx="52" cy="-2" r="10" fill="${PAPER}" ${ink()} stroke-width="3"/>`);
    parts.push(`<path d="M236 104 l14 -14 M250 104 l-14 -14" stroke="${SILVER}" stroke-width="5"/>`);
  }
  if (pose === 'steam') {
    parts.push(`<g>${[
      [60, 40, 26],
      [30, 20, 22],
      [80, 10, 30],
      [110, 30, 20],
      [50, -10, 18],
    ]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" ${ink()}/>`)
      .join('')}</g>`);
    parts.push(`<path d="M32 126 a8 8 0 0 0 16 0" fill="${YELLOW}" ${ink()} stroke-width="3"/>`);
  }
  if (pose === 'night') {
    parts.push(`<rect x="10" y="40" width="382" height="130" fill="${GRAPE}" opacity=".35"/>`);
    parts.push(`<polygon points="34,124 -120,90 -120,175 34,140" fill="${YELLOW}" opacity=".55"/>`);
    parts.push(`<circle cx="363" cy="130" r="18" fill="${RED}" opacity=".35"/>`);
  }
  if (pose === 'splash') {
    parts.push(`<rect x="-20" y="150" width="440" height="60" fill="${BLUE}" opacity=".9"/><path d="M-10 150 q40 -50 70 -10 q20 -60 60 -20" fill="${SKY}" ${ink()}/><path d="M-20 165 q30 -12 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="${PAPER}" stroke-width="4"/>`);
    parts.push(`<g transform="translate(20 110) rotate(-30)"><path d="M0 0 q14 -10 28 0 q-14 10 -28 0z M28 0 l10 -8 v16z" fill="${ORANGE_FISH}" ${ink()} stroke-width="3"/><circle cx="8" cy="-2" r="2" fill="${INK}"/></g>`);
  }
  return parts.join('');
}

const ORANGE_FISH = '#F58220';

export function vanSvg(pose: VanPose): string {
  switch (pose) {
    case 'clean':
    case 'dusty':
    case 'battered':
    case 'steam':
    case 'night':
    case 'splash':
      return svg(VIEW, sideView(pose), { attrs: `data-pose="${pose}"` });
    case 'skid':
      return svg(VIEW, `${speedLines(392, 60, 7, 120, 14, false)}${puff(340, 178, 18, SILVER)}${puff(120, 182, 14, SILVER)}<g transform="rotate(-14 300 164)">${sideView('clean')}</g><g transform="translate(120 -30) rotate(20)"><rect x="0" y="0" width="30" height="24" rx="5" fill="${BLUE}" ${ink()} stroke-width="3"/></g>`, { attrs: 'data-pose="skid"' });
    case 'airborne':
      return svg(VIEW, `<g transform="translate(0 -30) rotate(-8 200 100)">${sideView('clean')}</g>${speedLines(60, 170, 5, 80, 8, true)}${speedLines(340, 178, 5, 80, 8, false)}<g transform="translate(300 -10) rotate(30)"><path d="M0 0 a16 16 0 0 1 32 0z" fill="${YELLOW}" ${ink()} stroke-width="3"/><path d="M4 -2 a12 8 0 0 1 24 0z" fill="${RED}"/></g>`, { attrs: 'data-pose="airborne"' });
    case 'hero':
      return svg(
        '0 0 300 300',
        `<g>
<rect x="60" y="150" width="180" height="100" rx="8" fill="${PAPER}" ${ink()}/>
<path d="M60 150 l20 -60 h140 l20 60z" fill="${PAPER}" ${ink()}/>
<path d="M88 100 h124 l12 44 h-148z" fill="${SKY}" ${ink()} stroke-width="4"/>
<rect x="60" y="170" width="180" height="14" fill="${RED}"/><rect x="60" y="184" width="180" height="12" fill="${BLUE}"/>
<rect x="70" y="206" width="160" height="30" rx="4" fill="${SILVER}" ${ink()} stroke-width="3"/>
<circle cx="90" cy="221" r="12" fill="${YELLOW}" ${ink()} stroke-width="3"/><circle cx="210" cy="221" r="12" fill="${YELLOW}" ${ink()} stroke-width="3"/>
<rect x="110" y="210" width="80" height="22" fill="${INK}"/>${[116, 132, 148, 164, 180].map((x) => `<rect x="${x}" y="214" width="8" height="14" fill="${SILVER}"/>`).join('')}
<rect x="44" y="236" width="212" height="18" rx="4" fill="${SILVER}" ${ink()} stroke-width="3"/>
<rect x="66" y="250" width="34" height="20" fill="${INK}"/><rect x="200" y="250" width="34" height="20" fill="${INK}"/>
<rect x="80" y="72" width="140" height="10" fill="${INK}"/><rect x="100" y="52" width="30" height="22" rx="5" fill="${BLUE}" ${ink()} stroke-width="3"/><rect x="140" y="52" width="30" height="22" rx="5" fill="${BLUE}" ${ink()} stroke-width="3"/>
${puff(48, 268, 12, SAND)}${puff(252, 268, 12, SAND)}
</g>`,
        { attrs: 'data-pose="hero"' },
      );
    case 'wheel':
      return svg('0 0 100 100', wheel(50, 50, 44), { attrs: 'data-pose="wheel"' });
    case 'dashboard':
      return svg(
        '0 0 1200 500',
        `<rect x="0" y="300" width="1200" height="200" fill="${CREAM}" ${ink()}/><rect x="0" y="300" width="1200" height="30" fill="${NAVY}"/>
<circle cx="380" cy="400" r="70" fill="${PAPER}" ${ink()}/><line x1="380" y1="400" x2="330" y2="360" ${ink()}/>
<circle cx="540" cy="410" r="40" fill="${PAPER}" ${ink()}/><line x1="540" y1="410" x2="560" y2="380" ${ink()}/>
<circle cx="640" cy="410" r="40" fill="${PAPER}" ${ink()}/><line x1="640" y1="410" x2="612" y2="384" ${ink()}/>
${[740, 800, 860].map((x) => `<rect x="${x}" y="390" width="40" height="40" rx="6" fill="${PAPER}" ${ink()}/>`).join('')}
<path d="M120 500 a160 160 0 0 1 320 0" fill="none" ${ink()} stroke-width="26"/><path d="M120 500 a160 160 0 0 1 320 0" fill="none" stroke="${NAVY}" stroke-width="14"/>
<rect x="540" y="20" width="120" height="60" rx="10" fill="${SKY}" ${ink()}/>`,
        { attrs: 'data-pose="dashboard"' },
      );
  }
}

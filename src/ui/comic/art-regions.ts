// The twelve establishing shots, drawn as flat inked horizons. Each is an
// 8:3 panel: sky, the thing this stretch of the 8 is known for, and the
// highway across the bottom quarter. docs/ASSET-LIST.md §5.

import {
  ASPHALT,
  BLUE,
  CREAM,
  DUST,
  GRAPE,
  INK,
  LIME,
  ORANGE,
  PALE,
  PAPER,
  RED,
  SAND,
  SILVER,
  SKY,
  TAN,
  YELLOW,
  boulder,
  cloud,
  diamondSign,
  guideSign,
  ink,
  mountains,
  palm,
  pine,
  road,
  saguaro,
  star,
  sun,
  svg,
  text,
} from './art-shared';

const W = 1200;
const H = 450;
const ROAD_Y = 340;
const VIEW = `0 0 ${W} ${H}`;

function sky(fill: string, h = ROAD_Y): string {
  return `<rect x="0" y="0" width="${W}" height="${h}" fill="${fill}"/>`;
}

function ground(fill: string, y = 250): string {
  return `<rect x="0" y="${y}" width="${W}" height="${ROAD_Y - y + 6}" fill="${fill}"/>`;
}

function heatLines(y: number, count = 3): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const yy = y + i * 18;
    out.push(`<path d="M80 ${yy} q40 -10 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0" fill="none" stroke="${PAPER}" stroke-width="5" opacity=".6"/>`);
  }
  return out.join('');
}

function fencePosts(y: number): string {
  const out: string[] = [];
  for (let x = 40; x < W; x += 140) {
    out.push(`<line x1="${x}" y1="${y}" x2="${x + 8}" y2="${y - 60}" ${ink()} stroke-width="8"/>`);
  }
  out.push(`<path d="M40 ${y - 45} L1200 ${y - 35}" ${ink()} stroke-width="3"/><path d="M40 ${y - 25} L1200 ${y - 15}" ${ink()} stroke-width="3"/>`);
  return out.join('');
}

function waterTower(x: number, y: number, s: number): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">
<line x1="-40" y1="0" x2="-30" y2="-120" ${ink()}/><line x1="40" y1="0" x2="30" y2="-120" ${ink()}/>
<line x1="-36" y1="-50" x2="36" y2="-50" ${ink()} stroke-width="4"/><line x1="-38" y1="-90" x2="38" y2="-90" ${ink()} stroke-width="4"/>
<rect x="-52" y="-190" width="104" height="80" rx="18" fill="${PAPER}" ${ink()}/>
<path d="M-52 -190 q52 -40 104 0z" fill="${PAPER}" ${ink()}/>
${text(0, -138, '8 WEST', { size: 30, fill: '#1E3A66' })}
</g>`;
}

function orchardRows(): string {
  const out: string[] = [];
  for (let row = 0; row < 3; row++) {
    const y = 250 + row * 28;
    const s = 0.7 + row * 0.35;
    for (let x = 60 + row * 25; x < W; x += 95 + row * 20) {
      out.push(`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-10" width="8" height="24" fill="${TAN}" ${ink()} stroke-width="3"/><circle cx="0" cy="-22" r="22" fill="${LIME}" ${ink()} stroke-width="3"/></g>`);
    }
  }
  return out.join('');
}

function adobe(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})">
<rect x="0" y="-70" width="150" height="70" fill="${TAN}" ${ink()}/>
<rect x="60" y="-46" width="30" height="46" fill="${GRAPE}" ${ink()}/>
<rect x="15" y="-52" width="24" height="20" fill="${SKY}" ${ink()}/>
<rect x="110" y="-52" width="24" height="20" fill="${SKY}" ${ink()}/>
<g transform="translate(100 -66)"><ellipse cx="0" cy="0" rx="5" ry="7" fill="${RED}"/><ellipse cx="0" cy="12" rx="5" ry="7" fill="${RED}"/><ellipse cx="0" cy="24" rx="5" ry="7" fill="${RED}"/></g>
</g>`;
}

function truss(x1: number, x2: number, y: number): string {
  const out: string[] = [`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" ${ink()} stroke-width="8"/>`, `<line x1="${x1}" y1="${y - 60}" x2="${x2}" y2="${y - 60}" ${ink()} stroke-width="8"/>`];
  for (let x = x1; x < x2; x += 70) {
    out.push(`<line x1="${x}" y1="${y}" x2="${x + 35}" y2="${y - 60}" ${ink()} stroke-width="5"/><line x1="${x + 35}" y1="${y - 60}" x2="${x + 70}" y2="${y}" ${ink()} stroke-width="5"/>`);
  }
  return out.join('');
}

function ferry(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})"><path d="M-40 0 h80 l-10 18 h-60z" fill="${PAPER}" ${ink()}/><rect x="-22" y="-26" width="44" height="26" fill="${RED}" ${ink()}/><rect x="-6" y="-42" width="12" height="16" fill="${INK}"/></g>`;
}

function rocketSign(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})"><rect x="-6" y="-120" width="12" height="120" fill="${SILVER}" ${ink()}/><path d="M-22 -120 q22 -80 44 0z" fill="${RED}" ${ink()}/><rect x="-40" y="-118" width="80" height="34" fill="${SKY}" ${ink()}/>${text(0, -94, 'MOTEL', { size: 20, fill: PAPER })}<polygon points="-22,-120 -34,-100 -22,-104" fill="${YELLOW}" ${ink()} stroke-width="3"/><polygon points="22,-120 34,-100 22,-104" fill="${YELLOW}" ${ink()} stroke-width="3"/></g>`;
}

function duneSet(): string {
  return `<polygon points="0,340 0,240 180,170 360,250 520,180 700,260 880,160 1060,240 1200,190 1200,340" fill="${SAND}" ${ink()}/>
<polygon points="0,340 0,290 160,230 340,300 540,240 760,320 940,230 1200,290 1200,340" fill="${ORANGE}" opacity=".85" ${ink()}/>
<path d="M180 170 l60 40" ${ink()} stroke-width="4"/><path d="M520 180 l70 40" ${ink()} stroke-width="4"/><path d="M880 160 l70 45" ${ink()} stroke-width="4"/>
<path d="M120 120 h160 M330 90 h120 M700 110 h200 M950 80 h100" stroke="${PAPER}" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
}

function fieldStripes(y: number, colors: string[]): string {
  const out: string[] = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const x1 = (i / n) * W - 300;
    const x2 = ((i + 1) / n) * W - 300;
    out.push(`<polygon points="${x1},${ROAD_Y + 6} ${x2},${ROAD_Y + 6} ${560 + (i - n / 2) * 18},${y} ${560 + (i + 1 - n / 2) * 18},${y}" fill="${colors[i % colors.length]}" stroke="${INK}" stroke-width="2"/>`);
  }
  return out.join('');
}

function tower(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})"><rect x="-22" y="-90" width="44" height="90" fill="${TAN}" ${ink()}/><rect x="-28" y="-104" width="56" height="16" fill="${TAN}" ${ink()}/><rect x="-6" y="-70" width="12" height="18" fill="${INK}"/><rect x="-6" y="-40" width="12" height="18" fill="${INK}"/></g>`;
}

function gull(x: number, y: number, s = 1): string {
  return `<path d="M${x - 16 * s} ${y} q${8 * s} ${-12 * s} ${16 * s} 0 q${8 * s} ${-12 * s} ${16 * s} 0" fill="none" ${ink()} stroke-width="${4 * s}"/>`;
}

const REGION_ART: Record<number, () => string> = {
  1: () =>
    `${sky(SKY)}<rect x="0" y="150" width="${W}" height="100" fill="${YELLOW}"/>${star(150, 60, 10)}${star(320, 40, 7)}
${mountains('300,250 380,120 430,170 480,90 530,160 600,110 650,180 720,140 780,250', GRAPE)}
${ground(SAND)}${orchardRows()}${adobe(900, 340)}${road(ROAD_Y)}`,
  2: () =>
    `${sky(CREAM)}<polygon points="820,0 1200,0 1200,250 900,250" fill="${ORANGE}" opacity=".45"/>
${ground(SAND, 240)}<line x1="0" y1="240" x2="1200" y2="240" ${ink()} stroke-width="4"/>
${heatLines(150)}${waterTower(980, 240, 0.9)}${fencePosts(300)}
${diamondSign(240, 250, 40, `<path d="M-18 8 h36 M-12 -6 h24 M-6 -20 h12" ${ink()} stroke-width="5"/>`)}${road(ROAD_Y)}`,
  3: () =>
    `${sky(SKY)}${ground(SAND)}
${boulder(160, 230, 120, 70)}${boulder(230, 150, 90, 60)}${boulder(120, 120, 60, 40)}
${boulder(980, 240, 150, 80)}${boulder(1040, 150, 110, 65)}${boulder(930, 100, 60, 42)}
${boulder(560, 265, 90, 45)}
<path d="M420 300 l-30 -70 M420 300 l10 -80 M420 300 l40 -60 M420 300 l-50 -40 M420 300 l50 -20" ${ink()} stroke-width="5"/>
<g transform="translate(700 300)"><rect x="-70" y="-60" width="140" height="10" fill="${TAN}" ${ink()}/><line x1="-55" y1="-50" x2="-55" y2="0" ${ink()}/><line x1="55" y1="-50" x2="55" y2="0" ${ink()}/></g>
${road(ROAD_Y)}`,
  4: () =>
    `${sky(SKY, 130)}<rect x="0" y="130" width="${W}" height="220" fill="${ORANGE}"/>
${mountains('0,250 120,170 240,210 380,150 520,220 700,160 860,230 1000,180 1200,240 1200,260 0,260', GRAPE)}
${ground(SAND, 258)}
<g transform="translate(760 258)"><rect x="-60" y="-50" width="120" height="50" fill="${PAPER}" ${ink()}/><path d="M-30 -50 a30 30 0 0 1 60 0z" fill="${PAPER}" ${ink()}/><rect x="-6" y="-84" width="12" height="34" fill="${PAPER}" ${ink()}/></g>
${saguaro(140, 340, 220)}${saguaro(330, 335, 150)}${saguaro(520, 330, 100)}${saguaro(1000, 340, 240)}${saguaro(1120, 330, 130)}
${road(ROAD_Y)}`,
  5: () =>
    `${sky(SKY)}${cloud(300, 90, 1.1)}${cloud(760, 70, 0.9)}${cloud(1050, 120, 0.7)}
${mountains('40,250 150,80 190,120 230,60 300,250', TAN)}${mountains('120,250 190,120 230,60 300,250', GRAPE)}
${ground(SAND, 250)}${fieldStripes(255, [LIME, '#B7E27A'])}
<line x1="600" y1="262" x2="1150" y2="262" ${ink()} stroke-width="5"/>
${[640, 760, 880, 1000, 1120].map((x) => `<polygon points="${x},262 ${x - 12},290 ${x + 12},290" fill="${SILVER}" ${ink()} stroke-width="3"/>`).join('')}
${road(ROAD_Y)}`,
  6: () =>
    `${sky(CREAM)}${sun(1000, 90, 60, PAPER)}
${mountains('500,250 620,180 720,220 840,170 960,230 1100,190 1200,240 1200,260 500,260', '#2B2B2B')}
${ground(SAND, 255)}<rect x="300" y="290" width="360" height="24" fill="${TAN}" ${ink()}/><rect x="380" y="270" width="200" height="22" fill="${SILVER}" ${ink()}/>
${palm(140, 340, 200)}${palm(230, 340, 150)}${palm(1080, 340, 180)}
<g transform="translate(180 340)"><rect x="-50" y="-60" width="100" height="60" fill="${PAPER}" ${ink()}/>${text(0, -20, 'SHAKES', { size: 22, fill: RED })}</g>
${rocketSign(880, 300)}${road(ROAD_Y)}`,
  7: () =>
    `${sky(SKY)}${cloud(200, 80, 0.9)}
${ground(TAN, 200)}<rect x="0" y="250" width="${W}" height="90" fill="${BLUE}"/>
<path d="M0 275 q30 -8 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="${PAPER}" stroke-width="4"/>
<path d="M0 310 q30 -8 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="${PAPER}" stroke-width="4" opacity=".7"/>
${truss(260, 960, 246)}
<g transform="translate(1040 200)"><rect x="-90" y="-70" width="180" height="70" fill="${TAN}" ${ink()}/>${[-60, -20, 20, 60].map((x) => `<rect x="${x - 8}" y="-50" width="16" height="22" fill="${INK}"/>`).join('')}</g>
<g transform="translate(120 200)"><rect x="-6" y="-60" width="12" height="60" fill="${TAN}" ${ink()}/><circle cx="0" cy="-70" r="34" fill="${LIME}" ${ink()}/></g>
${ferry(560, 300)}${road(ROAD_Y)}`,
  8: () => `${sky(PALE)}${duneSet()}${diamondSign(1050, 280, 40, `<path d="M-20 0 q10 -14 20 0 t20 0" ${ink()} fill="none" stroke-width="5"/>`)}${road(ROAD_Y)}<polygon points="0,${ROAD_Y} 260,${ROAD_Y} 200,${ROAD_Y + 40} 0,${ROAD_Y + 60}" fill="${SAND}" opacity=".9"/><polygon points="700,${ROAD_Y} 980,${ROAD_Y} 900,${ROAD_Y + 50} 640,${ROAD_Y + 30}" fill="${SAND}" opacity=".9"/>`,
  9: () =>
    `${sky(SKY)}${mountains('0,250 200,225 400,235 600,215 800,232 1000,220 1200,238 1200,256 0,256', '#B9A7D6')}
${ground(LIME, 254)}${fieldStripes(258, [LIME, YELLOW, '#B7E27A'])}
<rect x="0" y="300" width="${W}" height="14" fill="${BLUE}" ${ink()} stroke-width="3"/>
<g transform="translate(980 258)"><rect x="-70" y="-40" width="140" height="40" fill="${SILVER}" ${ink()}/><rect x="-60" y="-70" width="120" height="30" fill="${SILVER}" ${ink()}/></g>
${guideSign(300, 220, 220, 'SEA LEVEL', 26)}${road(ROAD_Y)}`,
  10: () =>
    `${sky(SKY)}${cloud(220, 80, 0.8)}
${ground(SAND, 280)}<path d="M0 300 h420" ${ink()} stroke-width="4"/>
${boulder(900, 280, 260, 120)}${boulder(1000, 190, 180, 90)}${boulder(880, 120, 110, 60)}${boulder(1080, 110, 90, 50)}${boulder(760, 200, 90, 55)}
${tower(1080, 68)}
<polygon points="500,${ROAD_Y} 1200,${ROAD_Y} 1200,250 640,300" fill="${ASPHALT}" ${ink()}/>
<polygon points="760,${ROAD_Y - 20} 980,${ROAD_Y - 50} 1010,${ROAD_Y - 10} 780,${ROAD_Y}" fill="#8C8C8C" ${ink()}/>
${guideSign(680, 200, 280, 'RUNAWAY RAMP', 24, YELLOW).replace(`fill="${PAPER}"`, `fill="${INK}"`)}
${pine(560, 300, 120)}${road(ROAD_Y)}`,
  11: () =>
    `${sky(GRAPE, 120)}<rect x="0" y="120" width="${W}" height="80" fill="${ORANGE}"/><rect x="0" y="200" width="${W}" height="60" fill="${YELLOW}"/>
<rect x="0" y="230" width="${W}" height="30" fill="#DDE9F2"/><rect x="0" y="222" width="${W}" height="6" fill="${SILVER}"/>
${ground('#5E8F3A', 258)}
${pine(90, 345, 260)}${pine(220, 340, 200)}${pine(1120, 345, 250)}${pine(1010, 340, 190)}${pine(560, 330, 110)}
${diamondSign(760, 250, 44, `<polygon points="-24,16 24,16 24,-6" fill="${INK}"/><rect x="-14" y="-16" width="20" height="14" fill="${INK}"/>`)}
${text(760, 335, '6% GRADE', { size: 22 })}
${road(ROAD_Y)}`,
  12: () =>
    `${sky(ORANGE, 110)}<rect x="0" y="110" width="${W}" height="70" fill="${YELLOW}"/>
${sun(900, 190, 70)}<rect x="0" y="180" width="${W}" height="120" fill="${BLUE}"/>
<path d="M0 230 q40 -10 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0" fill="none" stroke="${PAPER}" stroke-width="5"/>
<path d="M0 285 q40 -10 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0" fill="none" stroke="${PAPER}" stroke-width="7"/>
${gull(300, 120, 1.2)}${gull(360, 90)}${gull(1080, 100, 0.9)}
<polygon points="0,${ROAD_Y + 6} 0,240 180,232 340,250 420,300 460,${ROAD_Y + 6}" fill="${SAND}" ${ink()}/>
<polygon points="0,${ROAD_Y + 6} 0,290 150,282 300,300 380,${ROAD_Y + 6}" fill="${ORANGE}" opacity=".7"/>
${palm(80, 240, 150)}
${guideSign(560, 220, 150, 'END 8', 30)}
${road(ROAD_Y, 620)}<rect x="620" y="${ROAD_Y}" width="30" height="110" fill="${DUST}" ${ink()}/>`,
};

export function regionSvg(region: number): string {
  const r = Math.min(12, Math.max(1, Math.round(region)));
  return svg(VIEW, `<g data-region="${r}">${REGION_ART[r]!()}</g>`);
}

/** A weather plate over the establishing shot: dust wall, monsoon, heat, or night stars. */
export function weatherSvg(kind: 'dust-wall' | 'monsoon' | 'heat' | 'stars'): string {
  switch (kind) {
    case 'dust-wall':
      return svg(VIEW, `<polygon points="${W},0 ${W},${H} 400,${H} 520,300 460,200 560,120 640,60 760,20" fill="${DUST}" opacity=".92" ${ink()}/><polygon points="${W},80 ${W},${H} 620,${H} 700,320 660,220 760,150 860,120" fill="${ORANGE}" opacity=".7"/>${[520, 700, 900].map((x) => `<circle cx="${x}" cy="${H - 60}" r="70" fill="${DUST}" ${ink()}/>`).join('')}`);
    case 'monsoon':
      return svg(VIEW, `${cloud(600, 90, 3.2, GRAPE)}<polygon points="590,120 640,120 600,190 640,190 560,290 580,210 540,210" fill="${YELLOW}" ${ink()}/>${Array.from({ length: 24 }, (_, i) => `<line x1="${60 + i * 50}" y1="160" x2="${40 + i * 50}" y2="${H}" stroke="${SILVER}" stroke-width="4" opacity=".7"/>`).join('')}`);
    case 'heat':
      return svg(VIEW, heatLines(200, 4));
    case 'stars':
      return svg(VIEW, `<rect width="${W}" height="${H}" fill="${GRAPE}" opacity=".55"/>${[120, 300, 420, 610, 780, 950, 1100].map((x, i) => star(x, 40 + (i % 3) * 45, 6 + (i % 2) * 4)).join('')}`);
  }
}

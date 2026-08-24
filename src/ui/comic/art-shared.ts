// Shared ink for the placeholder art: the palette from the Style Bible,
// an SVG wrapper, and the handful of shapes every panel reuses. Every
// placeholder is a string of inline SVG so the document's web fonts apply.

export const INK = '#111111';
export const RED = '#C41E2A';
export const BLUE = '#1F8FD6';
export const YELLOW = '#FFC72C';
export const LIME = '#7AC143';
export const SKY = '#5BC0EB';
export const ORANGE = '#F58220';
export const GRAPE = '#6A4C93';
export const PAPER = '#FFFFFF';
export const NAVY = '#0C1830';
export const TAN = '#D9A66B';
export const SAND = '#E9C46A';
export const CREAM = '#FFF3C4';
export const ASPHALT = '#4A4A4A';
export const SILVER = '#C9C9C9';
export const PALE = '#EAF6FB';
export const DUST = '#C58B4A';

/** Outline weight on a 1200-wide canvas. */
export const STROKE = 6;

export const FONT_SFX = "'Bangers', 'Impact', 'Arial Black', sans-serif";
export const FONT_MAST = "'Luckiest Guy', 'Bangers', 'Impact', sans-serif";
export const FONT_BODY = "'Comic Neue', 'Comic Sans MS', 'Trebuchet MS', sans-serif";

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(text: string): string {
  return text.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}

/** Halftone dots for shadows; the id repeats harmlessly across inline SVGs. */
export const HALFTONE_DEFS = `<defs><pattern id="ht" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="2" fill="${INK}" opacity=".22"/></pattern></defs>`;

export interface SvgOptions {
  /** Extra attributes on the root element. */
  attrs?: string;
  /** Skip the halftone defs (for tiny icons). */
  bare?: boolean;
}

export function svg(viewBox: string, body: string, opts: SvgOptions = {}): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice" role="img"${opts.attrs ? ` ${opts.attrs}` : ''}>${opts.bare ? '' : HALFTONE_DEFS}${body}</svg>`;
}

export interface TextOptions {
  size?: number;
  fill?: string;
  font?: 'sfx' | 'mast' | 'body';
  anchor?: 'start' | 'middle' | 'end';
  rotate?: number;
  stroke?: string;
  strokeWidth?: number;
  weight?: string;
  spacing?: number;
}

export function text(x: number, y: number, str: string, o: TextOptions = {}): string {
  const font = o.font === 'mast' ? FONT_MAST : o.font === 'body' ? FONT_BODY : FONT_SFX;
  const stroke = o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.strokeWidth ?? 4}" stroke-linejoin="round" paint-order="stroke fill"` : '';
  const rotate = o.rotate ? ` transform="rotate(${o.rotate} ${x} ${y})"` : '';
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${o.size ?? 32}" fill="${o.fill ?? INK}" text-anchor="${o.anchor ?? 'middle'}"${o.weight ? ` font-weight="${o.weight}"` : ''}${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}${stroke}${rotate}>${esc(str)}</text>`;
}

export function ink(extra = ''): string {
  return `stroke="${INK}" stroke-width="${STROKE}" stroke-linejoin="round" stroke-linecap="round"${extra ? ` ${extra}` : ''}`;
}

/** The highway across the bottom of an establishing shot. */
export function road(y: number, w = 1200, h = 110): string {
  const dashes: string[] = [];
  for (let x = 20; x < w; x += 90) dashes.push(`<rect x="${x}" y="${y + h / 2 - 4}" width="46" height="8" fill="${YELLOW}"/>`);
  return `<rect x="0" y="${y}" width="${w}" height="${h}" fill="${ASPHALT}"/>
<rect x="0" y="${y}" width="${w}" height="6" fill="${INK}"/>
<rect x="0" y="${y + 12}" width="${w}" height="5" fill="${PAPER}" opacity=".9"/>
<rect x="0" y="${y + h - 17}" width="${w}" height="5" fill="${PAPER}" opacity=".9"/>
${dashes.join('')}`;
}

export function sun(cx: number, cy: number, r: number, fill = YELLOW): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${ink()}/>`;
}

export function cloud(cx: number, cy: number, s = 1, fill = PAPER): string {
  return `<g transform="translate(${cx} ${cy}) scale(${s})"><path d="M-70 20 h140 a26 26 0 0 0 -8 -50 a34 34 0 0 0 -62 -16 a30 30 0 0 0 -52 20 a24 24 0 0 0 -18 46z" fill="${fill}" ${ink()}/></g>`;
}

export function puff(cx: number, cy: number, r: number, fill = SAND): string {
  return `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${ink()}/><circle cx="${cx + r * 0.9}" cy="${cy + r * 0.2}" r="${r * 0.7}" fill="${fill}" ${ink()}/><circle cx="${cx - r * 0.8}" cy="${cy + r * 0.3}" r="${r * 0.6}" fill="${fill}" ${ink()}/></g>`;
}

export function speedLines(x: number, y: number, count: number, len: number, gap = 14, toLeft = false): string {
  const lines: string[] = [];
  for (let i = 0; i < count; i++) {
    const l = len * (1 - Math.abs(i - (count - 1) / 2) / count);
    const x2 = toLeft ? x - l : x + l;
    lines.push(`<line x1="${x}" y1="${y + i * gap}" x2="${x2}" y2="${y + i * gap}" ${ink()}/>`);
  }
  return lines.join('');
}

/** A yellow caption box with a black border, lettered in the body face. */
export function caption(x: number, y: number, w: number, label: string, size = 28): string {
  const h = size * 1.6;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${YELLOW}" ${ink()}/>${text(x + w / 2, y + h * 0.7, label, { size, font: 'sfx', spacing: 1 })}`;
}

/** The interstate shield: red crown, blue body, white numeral. */
export function shield(cx: number, cy: number, s = 1, numeral = '8'): string {
  return `<g transform="translate(${cx} ${cy}) scale(${s})">
<path d="M-40 -46 h80 c0 0 6 28 -2 52 c-8 26 -26 40 -38 46 c-12 -6 -30 -20 -38 -46 c-8 -24 -2 -52 -2 -52z" fill="${BLUE}" ${ink()}/>
<path d="M-40 -46 h80 c0 0 2 10 2 18 h-84 c0 -8 2 -18 2 -18z" fill="${RED}"/>
${text(0, 26, numeral, { size: 54, fill: PAPER })}
</g>`;
}

/** A road-sign post: a green guide sign on two posts. */
export function guideSign(cx: number, y: number, w: number, label: string, size = 30, fill = '#1E7B3A'): string {
  const h = size * 1.9;
  return `<g>
<rect x="${cx - w / 2 + 20}" y="${y + h}" width="10" height="70" fill="${SILVER}" ${ink()}/>
<rect x="${cx + w / 2 - 30}" y="${y + h}" width="10" height="70" fill="${SILVER}" ${ink()}/>
<rect x="${cx - w / 2}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" ${ink()}/>
${text(cx, y + h * 0.66, label, { size, fill: PAPER, spacing: 1 })}
</g>`;
}

export function diamondSign(cx: number, cy: number, s: number, glyph: string): string {
  return `<g transform="translate(${cx} ${cy})"><rect x="${cy * 0 + cx * 0 - 2}" y="${s + 10}" width="10" height="60" transform="translate(-4 0)" fill="${SILVER}" ${ink()}/><rect x="${-s}" y="${-s}" width="${s * 2}" height="${s * 2}" rx="8" transform="rotate(45)" fill="${YELLOW}" ${ink()}/>${glyph}</g>`;
}

export function mountains(points: string, fill = GRAPE): string {
  return `<polygon points="${points}" fill="${fill}" ${ink()}/>`;
}

export function saguaro(x: number, y: number, h: number, fill = LIME): string {
  const w = h * 0.16;
  return `<g>
<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="${w / 2}" fill="${fill}" ${ink()}/>
<path d="M${x - w / 2} ${y - h * 0.55} h${-w * 1.2} v${-h * 0.35} a${w / 2} ${w / 2} 0 0 1 ${w} 0 v${h * 0.2} h${w * 0.2}z" fill="${fill}" ${ink()}/>
<path d="M${x + w / 2} ${y - h * 0.45} h${w * 1.2} v${-h * 0.28} a${w / 2} ${w / 2} 0 0 0 ${-w} 0 v${h * 0.13} h${-w * 0.2}z" fill="${fill}" ${ink()}/>
</g>`;
}

export function palm(x: number, y: number, h: number): string {
  const fronds: string[] = [];
  for (let a = -80; a <= 80; a += 32) {
    const rad = (a * Math.PI) / 180;
    fronds.push(`<path d="M${x} ${y - h} q${Math.sin(rad) * 70} ${-40 + Math.abs(a) * 0.4} ${Math.sin(rad) * 110} ${-10 + Math.abs(a) * 0.8}" fill="none" stroke="${LIME}" stroke-width="14" stroke-linecap="round"/><path d="M${x} ${y - h} q${Math.sin(rad) * 70} ${-40 + Math.abs(a) * 0.4} ${Math.sin(rad) * 110} ${-10 + Math.abs(a) * 0.8}" fill="none" ${ink()} stroke-width="3"/>`);
  }
  return `<path d="M${x - 8} ${y} q${-6} ${-h / 2} ${8} ${-h}" fill="none" ${ink()} stroke-width="16"/><path d="M${x - 8} ${y} q${-6} ${-h / 2} ${8} ${-h}" fill="none" stroke="${TAN}" stroke-width="8"/>${fronds.join('')}`;
}

export function pine(x: number, y: number, h: number): string {
  return `<g><rect x="${x - 7}" y="${y - h * 0.3}" width="14" height="${h * 0.3}" fill="${TAN}" ${ink()}/>
<polygon points="${x},${y - h} ${x - h * 0.28},${y - h * 0.55} ${x + h * 0.28},${y - h * 0.55}" fill="${LIME}" ${ink()}/>
<polygon points="${x},${y - h * 0.75} ${x - h * 0.36},${y - h * 0.28} ${x + h * 0.36},${y - h * 0.28}" fill="${LIME}" ${ink()}/></g>`;
}

export function boulder(cx: number, cy: number, rx: number, ry: number, fill = TAN): string {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${ink()}/><ellipse cx="${cx + rx * 0.25}" cy="${cy + ry * 0.3}" rx="${rx * 0.6}" ry="${ry * 0.45}" fill="url(#ht)"/>`;
}

export function star(cx: number, cy: number, r: number, fill = PAPER): string {
  return `<path d="M${cx} ${cy - r} l${r * 0.3} ${r * 0.7} l${r * 0.7} ${r * 0.3} l${-r * 0.7} ${r * 0.3} l${-r * 0.3} ${r * 0.7} l${-r * 0.3} ${-r * 0.7} l${-r * 0.7} ${-r * 0.3} l${r * 0.7} ${-r * 0.3}z" fill="${fill}"/>`;
}

/** A radial speed-line burst behind SFX lettering. */
export function burst(cx: number, cy: number, r: number, fill: string, points = 14): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI * i) / points;
    const rad = i % 2 === 0 ? r : r * 0.62;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad * 0.7).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" ${ink()}/>`;
}

// Chroma key for the art pipeline. Cutouts arrive from the image tool on a
// solid neon-green (#00FF00) background; the game needs real transparency.
//
// The key is a flood fill from the border, not a colour threshold: only
// green that touches the edge of the image is background, so the lime plants,
// shirts, and highway signs drawn inside an ink outline are never eaten.
// The one-pixel ring where the drawing meets the screen is anti-aliased with
// green, so it goes semi-transparent and has the green spill pulled out.
// See test/art-key.test.ts.

import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import sharp from 'sharp';

/** Screen-ish green: high G, low R and B, and G well above both — the band the flood fill grows through. */
function isChroma(r, g, b) {
  return r <= 110 && b <= 110 && g >= 170 && g - Math.max(r, b) >= 110;
}

/**
 * The screen itself, near-exactly #00FF00. Nothing in the palette is this
 * green, so it is background wherever it sits — including the gap in a roof
 * rack that the flood fill from the border can never reach.
 */
function isScreen(r, g, b) {
  return r <= 12 && b <= 12 && g >= 245;
}

/**
 * True when the border of the image is (almost entirely) chroma green —
 * the signature of a cutout that still needs keying.
 */
export function isGreenScreen(rgba, width, height) {
  if (width < 2 || height < 2) return false;
  const step = Math.max(1, Math.floor(Math.min(width, height) / 50));
  let samples = 0;
  let green = 0;
  const check = (x, y) => {
    const i = (y * width + x) * 4;
    samples += 1;
    if (isChroma(rgba[i], rgba[i + 1], rgba[i + 2])) green += 1;
  };
  for (let x = 0; x < width; x += step) {
    check(x, 0);
    check(x, height - 1);
  }
  for (let y = 0; y < height; y += step) {
    check(0, y);
    check(width - 1, y);
  }
  return samples > 0 && green / samples >= 0.95;
}

/**
 * True for a frame with a green hole in it — the dashboard's windshield —
 * where the green never touches the border but is a big part of the image.
 * A cutout (green border) is not a window; the flood fill handles that.
 */
export function isGreenWindow(rgba, width, height) {
  if (isGreenScreen(rgba, width, height)) return false;
  const n = width * height;
  const step = Math.max(1, Math.floor(n / 20000));
  let samples = 0;
  let green = 0;
  for (let idx = 0; idx < n; idx += step) {
    const p = idx * 4;
    samples += 1;
    if (isChroma(rgba[p], rgba[p + 1], rgba[p + 2])) green += 1;
  }
  return samples > 0 && green / samples >= 0.15;
}

/**
 * Key the green screen to transparency. Returns a new RGBA buffer; the input
 * is untouched. Background pixels become (0,0,0,0) so nothing green bleeds
 * back in when the browser filters the edges.
 *
 * By default only green connected to the border is removed. With
 * `{ window: true }` every chroma-green pixel is a hole (the dashboard).
 */
export function keyGreen(rgba, width, height, opts = {}) {
  const out = new Uint8Array(rgba);
  const n = width * height;
  const background = new Uint8Array(n);
  const queue = new Int32Array(n);

  // Flood from the seeds through every neighbour `accept` admits.
  const flood = (seeds, accept) => {
    let head = 0;
    let tail = 0;
    const push = (idx) => {
      if (background[idx]) return;
      const p = idx * 4;
      if (!accept(out[p], out[p + 1], out[p + 2])) return;
      background[idx] = 1;
      queue[tail++] = idx;
    };
    for (const idx of seeds) push(idx);
    while (head < tail) {
      const idx = queue[head++];
      const x = idx % width;
      const y = (idx - x) / width;
      if (x > 0) push(idx - 1);
      if (x < width - 1) push(idx + 1);
      if (y > 0) push(idx - width);
      if (y < height - 1) push(idx + width);
    }
  };
  const everyPixel = { *[Symbol.iterator]() { for (let idx = 0; idx < n; idx++) yield idx; } };
  const borderPixels = {
    *[Symbol.iterator]() {
      for (let x = 0; x < width; x++) {
        yield x;
        yield (height - 1) * width + x;
      }
      for (let y = 0; y < height; y++) {
        yield y * width;
        yield y * width + width - 1;
      }
    },
  };

  if (opts.window) {
    flood(everyPixel, isChroma);
  } else {
    // The screen around the drawing: grow from the border through the whole
    // green band, so anti-aliased fringe goes with it.
    flood(borderPixels, isChroma);
    // Sealed pockets (the gap in a roof rack): only the screen colour itself,
    // grown only through the screen colour itself — a bright cartoon green
    // next to a pocket is art and stays.
    flood(everyPixel, isScreen);
  }

  // Background out; the ring next to it softened and de-spilled.
  for (let idx = 0; idx < n; idx++) {
    const p = idx * 4;
    if (background[idx]) {
      out[p] = 0;
      out[p + 1] = 0;
      out[p + 2] = 0;
      out[p + 3] = 0;
      continue;
    }
    const x = idx % width;
    const y = (idx - x) / width;
    const touchesScreen =
      (x > 0 && background[idx - 1]) ||
      (x < width - 1 && background[idx + 1]) ||
      (y > 0 && background[idx - width]) ||
      (y < height - 1 && background[idx + width]);
    if (!touchesScreen) continue;
    const r = out[p];
    const g = out[p + 1];
    const b = out[p + 2];
    const excess = g - Math.max(r, b);
    if (excess <= 20) continue;
    // How much of this pixel was screen: none at excess 20, all of it near 200.
    const coverage = Math.min(1, Math.max(0, (excess - 20) / 180));
    out[p + 3] = Math.round(out[p + 3] * Math.max(0.08, 1 - coverage));
    out[p + 1] = Math.max(r, b);
  }
  return out;
}

/** 'screen' for a cutout, 'window' for a frame with a green hole, null for ordinary art. */
export function keyMode(rgba, width, height) {
  if (isGreenScreen(rgba, width, height)) return 'screen';
  if (isGreenWindow(rgba, width, height)) return 'window';
  return null;
}

/**
 * A finished WebP saved straight from the image tool at full size. If it is
 * both wider than the edge limit and heavier than the budget, keep the
 * original as a master under masterDir and replace it with a resized copy.
 * Anything already within limits is left exactly as it is.
 */
export async function slimWebp(file, masterDir, opts = {}) {
  const maxEdge = opts.maxEdge ?? 2400;
  const budgetBytes = opts.budgetBytes ?? 200 * 1024;
  const quality = opts.quality ?? 84;
  const size = statSync(file).size;
  const meta = await sharp(file).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (size <= budgetBytes || Math.max(width, height) <= maxEdge) {
    return { slimmed: false, width, height, size };
  }
  mkdirSync(masterDir, { recursive: true });
  const master = join(masterDir, basename(file));
  if (!existsSync(master)) copyFileSync(file, master);
  const slim = await sharp(master)
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, alphaQuality: 92, effort: 5, ...(meta.hasAlpha ? {} : { smartSubsample: true }) })
    .toBuffer();
  writeFileSync(file, slim);
  return { slimmed: true, width, height, size: slim.length };
}

/**
 * Read a raster, key it if it is a cutout, and write the WebP sibling the
 * registry prefers. Returns what happened, for the log.
 */
export async function processRaster(file, out, opts = {}) {
  const maxEdge = opts.maxEdge ?? 2400;
  const quality = opts.quality ?? 84;
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const mode = keyMode(data, info.width, info.height);
  const keyed = mode !== null;
  const source = keyed
    ? sharp(Buffer.from(keyGreen(data, info.width, info.height, { window: mode === 'window' }).buffer), {
        raw: { width: info.width, height: info.height, channels: 4 },
      })
    : sharp(file);
  const meta = keyed ? { hasAlpha: true } : await sharp(file).metadata();
  const hasAlpha = keyed || meta.hasAlpha === true;
  await source
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, alphaQuality: 92, effort: 5, ...(hasAlpha ? {} : { smartSubsample: true }) })
    .toFile(out);
  return { width: info.width, height: info.height, keyed, hasAlpha };
}

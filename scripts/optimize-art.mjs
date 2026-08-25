// Art optimizer: for every raster dropped into public/assets/, write the WebP
// sibling the registry prefers — keyed to transparency when the image is a
// cutout on the neon-green screen, and only when it is bigger than the budget
// otherwise. The original stays as Frank's source of truth; the small file is
// what ships. Image tools often save JPEG data under a .png name; sharp reads
// by content, not by extension.
//
//   npm run art                      (writes missing / stale .webp siblings)
//   npm run art -- --check           (reports only)
//   npm run art -- --root <dir>      (another assets folder, e.g. a different checkout)

import { readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import sharp from 'sharp';
import { keyMode, processRaster, slimWebp } from './art-lib.mjs';

const args = process.argv.slice(2);
const check = args.includes('--check');
const rootArg = args[args.indexOf('--root') + 1];
const ROOT = args.includes('--root') && rootArg ? resolve(rootArg) : join(process.cwd(), 'public', 'assets');
const BUDGET_BYTES = 200 * 1024;
const MAX_EDGE = 2400;
// Full-size WebPs saved by the image tool are kept here, outside the shipping folder (gitignored).
const MASTERS = join(ROOT, '..', '..', 'art-masters');

function walk(dir) {
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function rel(file) {
  return relative(ROOT, file).split('\\').join('/');
}

async function needsKeying(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return keyMode(data, info.width, info.height) !== null;
}

// Finished WebPs first: an oversized one is shrunk in place, its master kept aside.
let slimmed = 0;
for (const file of walk(ROOT).filter((f) => /\.webp$/i.test(f))) {
  if (check) continue;
  const r = await slimWebp(file, join(MASTERS, relative(ROOT, dirname(file))), { maxEdge: MAX_EDGE, budgetBytes: BUDGET_BYTES });
  if (r.slimmed) {
    slimmed += 1;
    console.log(`  slim ${rel(file)}: ${r.width}×${r.height} → ${MAX_EDGE} px, ${(r.size / 1024).toFixed(0)} KB (master kept)`);
  }
}

const rasters = walk(ROOT).filter((f) => /\.(png|jpe?g)$/i.test(f));
let written = 0;
let skipped = 0;
let keyedCount = 0;
for (const file of rasters) {
  const size = statSync(file).size;
  const out = file.replace(/\.(png|jpe?g)$/i, '.webp');
  let stale = true;
  try {
    stale = statSync(out).mtimeMs < statSync(file).mtimeMs;
  } catch {
    stale = true;
  }
  if (!stale) {
    console.log(`  ok   ${rel(file)} → ${rel(out)}`);
    continue;
  }
  // A cutout must be keyed whatever its size; anything else only if it is heavy.
  const cutout = await needsKeying(file);
  if (!cutout && size <= BUDGET_BYTES) {
    skipped += 1;
    continue;
  }
  if (check) {
    console.log(`  TODO ${rel(file)} (${(size / 1024).toFixed(0)} KB${cutout ? ', green screen' : ''}) has no fresh .webp sibling`);
    continue;
  }
  const result = await processRaster(file, out);
  const after = statSync(out).size;
  if (result.keyed) keyedCount += 1;
  console.log(
    `  ${result.keyed ? 'key ' : 'webp'} ${rel(file)}: ${(size / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB (${result.width}×${result.height}${result.keyed ? ', keyed to alpha' : result.hasAlpha ? ', alpha' : ''})`,
  );
  written += 1;
}
console.log(`${rasters.length} rasters, ${written} written (${keyedCount} keyed), ${skipped} left alone under ${BUDGET_BYTES / 1024} KB, ${slimmed} webp slimmed`);

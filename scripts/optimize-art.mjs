// Art optimizer: for every raster dropped into public/assets/ that is bigger
// than the budget, write a WebP sibling next to it. The registry prefers
// .webp over .png/.jpg in the same slot, so the original stays as Frank's
// source of truth and the small file is what ships. Image tools often save
// JPEG data under a .png name; sharp reads by content, not by extension.
//
//   npm run art            (writes missing / stale .webp siblings)
//   npm run art -- --check (reports only)

import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import sharp from 'sharp';

const ROOT = join(process.cwd(), 'public', 'assets');
const BUDGET_BYTES = 200 * 1024;
const MAX_EDGE = 2400;
const QUALITY = 84;
const check = process.argv.includes('--check');

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

const rasters = walk(ROOT).filter((f) => /\.(png|jpe?g)$/i.test(f));
let written = 0;
let skipped = 0;
for (const file of rasters) {
  const size = statSync(file).size;
  if (size <= BUDGET_BYTES) {
    skipped += 1;
    continue;
  }
  const out = file.replace(/\.(png|jpe?g)$/i, '.webp');
  let stale = true;
  try {
    stale = statSync(out).mtimeMs < statSync(file).mtimeMs;
  } catch {
    stale = true;
  }
  const rel = relative(ROOT, file).split('\\').join('/');
  if (!stale) {
    console.log(`  ok   ${rel} → ${relative(ROOT, out).split('\\').join('/')}`);
    continue;
  }
  if (check) {
    console.log(`  TODO ${rel} (${(size / 1024).toFixed(0)} KB) has no fresh .webp sibling`);
    continue;
  }
  const image = sharp(file);
  const meta = await image.metadata();
  const hasAlpha = meta.hasAlpha === true;
  await image
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, alphaQuality: 90, effort: 5, ...(hasAlpha ? {} : { smartSubsample: true }) })
    .toFile(out);
  const after = statSync(out).size;
  console.log(`  webp ${rel}: ${(size / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB (${meta.width}×${meta.height}${hasAlpha ? ', alpha' : ''})`);
  written += 1;
}
console.log(`${rasters.length} rasters, ${written} written, ${skipped} already under ${BUDGET_BYTES / 1024} KB`);

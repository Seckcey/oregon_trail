// The image tool sometimes saves finished art straight to WebP at 3200 px
// and close to a megabyte. The pipeline keeps that as the master (outside
// the shipping folder) and leaves a 2400 px sibling in its place.

import { mkdtempSync, existsSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { slimWebp } from '../scripts/art-lib.mjs';

// libvips caches open inputs; Windows won't delete a file something still holds.
sharp.cache(false);

let dir = '';
let masters = '';

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), '8wt-webp-'));
  masters = join(dir, 'masters');
});

afterEach(() => {
  // sharp lets go of its file handles a beat after the promise resolves; give Windows a moment.
  rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
});

async function bigWebp(file: string, width = 3200, height = 1200): Promise<void> {
  // Noise compresses badly, so the file comes out heavy like real art does.
  const px = Buffer.alloc(width * height * 3);
  for (let i = 0; i < px.length; i++) px[i] = (i * 2654435761) >>> 24;
  await sharp(px, { raw: { width, height, channels: 3 } }).webp({ quality: 95 }).toFile(file);
}

describe('slimWebp', () => {
  test('an oversized webp is shrunk to the max edge in place and the original kept as a master', async () => {
    const file = join(dir, '08-dunes.webp');
    await bigWebp(file);
    const before = statSync(file).size;
    expect(before).toBeGreaterThan(200 * 1024);

    const result = await slimWebp(file, masters, { maxEdge: 2400, budgetBytes: 200 * 1024 });
    expect(result.slimmed).toBe(true);
    const meta = await sharp(file).metadata();
    expect(meta.width).toBe(2400);
    expect(meta.height).toBe(900);
    expect(statSync(file).size).toBeLessThan(before);
    const master = join(masters, '08-dunes.webp');
    expect(existsSync(master)).toBe(true);
    expect((await sharp(master).metadata()).width).toBe(3200);
  });

  test('a webp already within the edge limit is left alone', async () => {
    const file = join(dir, 'small.webp');
    await bigWebp(file, 2400, 900);
    const result = await slimWebp(file, masters, { maxEdge: 2400, budgetBytes: 200 * 1024 });
    expect(result.slimmed).toBe(false);
    expect(existsSync(join(masters, 'small.webp'))).toBe(false);
  });

  test('a light webp is left alone even when it is wide', async () => {
    const file = join(dir, 'flat.webp');
    await sharp({ create: { width: 3200, height: 1200, channels: 3, background: '#5BC0EB' } }).webp().toFile(file);
    const result = await slimWebp(file, masters, { maxEdge: 2400, budgetBytes: 200 * 1024 });
    expect(result.slimmed).toBe(false);
  });

  test('a second run is a no-op', async () => {
    const file = join(dir, 'twice.webp');
    await bigWebp(file);
    await slimWebp(file, masters, { maxEdge: 2400, budgetBytes: 200 * 1024 });
    const size = statSync(file).size;
    const again = await slimWebp(file, masters, { maxEdge: 2400, budgetBytes: 200 * 1024 });
    expect(again.slimmed).toBe(false);
    expect(statSync(file).size).toBe(size);
  });
});

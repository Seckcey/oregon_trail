// The art pipeline's chroma key: sprites arrive on solid #00FF00 and must
// leave with a real alpha channel — background gone, ink edges soft, and the
// cartoon greens inside the drawing untouched.

import { describe, expect, test } from 'vitest';
import { isGreenScreen, isGreenWindow, keyGreen } from '../scripts/art-lib.mjs';

const W = 64;
const H = 48;
const GREEN: [number, number, number] = [0, 255, 0];
const RED: [number, number, number] = [196, 30, 42];
const INK: [number, number, number] = [17, 17, 17];
const LIME: [number, number, number] = [122, 193, 67]; // the palette's lime — art, not screen
const BLEND: [number, number, number] = [0, 128, 0]; // half ink, half screen: an anti-aliased edge

function image(fill: [number, number, number]): Uint8Array {
  const px = new Uint8Array(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    px[i * 4] = fill[0];
    px[i * 4 + 1] = fill[1];
    px[i * 4 + 2] = fill[2];
    px[i * 4 + 3] = 255;
  }
  return px;
}

function put(px: Uint8Array, x: number, y: number, c: [number, number, number]): void {
  const i = (y * W + x) * 4;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
  px[i + 3] = 255;
}

function at(px: Uint8Array, x: number, y: number): [number, number, number, number] {
  const i = (y * W + x) * 4;
  return [px[i]!, px[i + 1]!, px[i + 2]!, px[i + 3]!];
}

/** A red square with an ink outline on a green screen, a lime pixel inside, a blended edge pixel outside. */
function sprite(): Uint8Array {
  const px = image(GREEN);
  for (let y = 12; y < 36; y++) {
    for (let x = 16; x < 48; x++) {
      const edge = y === 12 || y === 35 || x === 16 || x === 47;
      put(px, x, y, edge ? INK : RED);
    }
  }
  put(px, 32, 24, LIME);
  put(px, 15, 24, BLEND); // just outside the left outline, touching the screen
  // A pocket of pure screen green sealed inside the drawing — the gap in a roof rack.
  for (let y = 26; y < 31; y++) for (let x = 38; x < 44; x++) put(px, x, y, GREEN);
  return px;
}

describe('isGreenScreen', () => {
  test('a solid #00FF00 border is a green screen', () => {
    expect(isGreenScreen(sprite(), W, H)).toBe(true);
  });

  test('ordinary art with a sky is not', () => {
    const px = image([91, 192, 235]);
    expect(isGreenScreen(px, W, H)).toBe(false);
  });

  test('lime-green art is not a screen either', () => {
    expect(isGreenScreen(image(LIME), W, H)).toBe(false);
  });
});

describe('keyGreen', () => {
  test('the screen becomes fully transparent', () => {
    const out = keyGreen(sprite(), W, H);
    expect(at(out, 0, 0)[3]).toBe(0);
    expect(at(out, W - 1, H - 1)[3]).toBe(0);
    expect(at(out, 8, 24)[3]).toBe(0);
  });

  test('the drawing stays opaque and its colours untouched', () => {
    const out = keyGreen(sprite(), W, H);
    expect(at(out, 30, 20)).toEqual([...RED, 255]);
    expect(at(out, 16, 20)).toEqual([...INK, 255]);
  });

  test('cartoon greens inside the drawing are art, not screen', () => {
    const out = keyGreen(sprite(), W, H);
    expect(at(out, 32, 24)).toEqual([...LIME, 255]);
  });

  test('a sealed pocket of pure screen green is still screen (the gap in the roof rack)', () => {
    const out = keyGreen(sprite(), W, H);
    expect(at(out, 40, 28)[3]).toBe(0);
    expect(at(out, 37, 28)).toEqual([...RED, 255]); // the red around it stays
  });

  test('an anti-aliased edge goes semi-transparent with the green spill removed', () => {
    const out = keyGreen(sprite(), W, H);
    const [r, g, b, a] = at(out, 15, 24);
    expect(a).toBeGreaterThan(20);
    expect(a).toBeLessThan(220);
    expect(g).toBeLessThanOrEqual(Math.max(r, b) + 24);
  });

  test('does not touch the input', () => {
    const px = sprite();
    keyGreen(px, W, H);
    expect(at(px, 0, 0)).toEqual([...GREEN, 255]);
  });
});

/** The dashboard: a cream frame around a green windshield that never touches the border. */
function dashboard(): Uint8Array {
  const px = image([236, 226, 198]);
  for (let y = 8; y < 30; y++) for (let x = 8; x < 56; x++) put(px, x, y, GREEN);
  put(px, 32, 40, LIME); // a lime detail on the dash, outside the window
  return px;
}

describe('a green window inside a frame (the dashboard)', () => {
  test('is not a green screen, but it is a green window', () => {
    expect(isGreenScreen(dashboard(), W, H)).toBe(false);
    expect(isGreenWindow(dashboard(), W, H)).toBe(true);
    expect(isGreenWindow(sprite(), W, H)).toBe(false); // a cutout is handled by the flood fill instead
    expect(isGreenWindow(image([91, 192, 235]), W, H)).toBe(false);
  });

  test('keying in window mode clears the interior green and keeps the frame', () => {
    const out = keyGreen(dashboard(), W, H, { window: true });
    expect(at(out, 30, 20)[3]).toBe(0);
    expect(at(out, 2, 2)).toEqual([236, 226, 198, 255]);
    expect(at(out, 32, 40)).toEqual([...LIME, 255]);
  });
});

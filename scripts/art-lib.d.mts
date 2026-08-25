/** RGBA pixel buffer helpers for the art pipeline (scripts/art-lib.mjs). */

/** True when the image's border is solid chroma green (#00FF00-ish): a cutout that needs keying. */
export function isGreenScreen(rgba: Uint8Array, width: number, height: number): boolean;

/** True for a frame with a big green hole that never touches the border (the dashboard). */
export function isGreenWindow(rgba: Uint8Array, width: number, height: number): boolean;

/** 'screen' for a cutout, 'window' for a framed hole, null for ordinary art. */
export function keyMode(rgba: Uint8Array, width: number, height: number): 'screen' | 'window' | null;

/**
 * Key the green screen to transparency. Only green connected to the border
 * is removed — cartoon greens inside the drawing survive — and the ring of
 * anti-aliased edge pixels goes semi-transparent with the green spill pulled
 * out. With `{ window: true }` every chroma pixel is a hole. Returns a new
 * buffer; the input is untouched.
 */
export function keyGreen(rgba: Uint8Array, width: number, height: number, opts?: { window?: boolean }): Uint8Array;

/** Read a raster, key it if it is a cutout or a window, and write the WebP sibling. */
export function processRaster(
  file: string,
  out: string,
  opts?: { maxEdge?: number; quality?: number },
): Promise<{ width: number; height: number; keyed: boolean; hasAlpha: boolean }>;

/**
 * A finished WebP saved at full size: if it is wider than the edge limit and
 * heavier than the budget, keep the original under masterDir and replace the
 * file with a resized copy. Otherwise leave it alone.
 */
export function slimWebp(
  file: string,
  masterDir: string,
  opts?: { maxEdge?: number; budgetBytes?: number; quality?: number },
): Promise<{ slimmed: boolean; width: number; height: number; size: number }>;

/**
 * Converts deck.gl viewport bounds into sorted/merged BigInt ranges of H3
 * cell indices.  Used for row-group pruning when loading large parquet files
 * — only row groups whose h3_index statistics overlap a viewport range are
 * fetched via HTTP range requests.
 */

import {
  polygonToCellsExperimental,
  POLYGON_TO_CELLS_FLAGS,
  getResolution,
  getNumCells,
} from 'h3-js';

/** Bound predicate construction and worker messages even for continental views. */
const MAX_FILTER_CELLS = 1024;
const normalizeLongitude = (longitude: number) =>
  ((((longitude + 180) % 360) + 360) % 360) - 180;

/* ── H3 bit-layout constants ─────────────────────────────────────────── */

/** Mask for the 4-bit resolution field at bits 52-55. */
const RES_MASK = 0xfn << 52n;

/* ── Core helpers ────────────────────────────────────────────────────── */

/**
 * For a given H3 cell, compute the BigInt range `[min, max]` that covers
 * **all** descendant cells at `childRes`.
 *
 * H3 index layout (64 bits):
 *   bit 63      : reserved (0)
 *   bits 59-62  : mode (1 = cell)
 *   bits 56-58  : unused (0 for cells)
 *   bits 52-55  : resolution (0-15)
 *   bits 45-51  : base cell (0-121)
 *   bits 0-44   : 15 digit positions, 3 bits each
 *                 digit for resolution r is at bit (15 - r) * 3
 *
 * Valid H3 digits are 0-6. Unused positions (beyond the resolution) are
 * set to 7.
 */
export function h3CellToBigIntRange(
  cellHex: string,
  childRes: number
): [bigint, bigint] {
  const parentRes = getResolution(cellHex);
  if (!Number.isInteger(childRes) || childRes < parentRes || childRes > 15) {
    throw new RangeError(
      'H3 descendant resolution must be between parent resolution and 15'
    );
  }
  let cell = BigInt(`0x${cellHex}`);

  // Set the resolution field to childRes
  cell = (cell & ~RES_MASK) | (BigInt(childRes) << 52n);

  let minChild = cell;
  let maxChild = cell;

  // Digits from parentRes+1 → childRes: set to 0 (min) / 6 (max)
  for (let r = parentRes + 1; r <= childRes; r++) {
    const shift = BigInt((15 - r) * 3);
    const mask = 7n << shift;
    minChild = minChild & ~mask; // digit 0
    maxChild = (maxChild & ~mask) | (6n << shift); // digit 6
  }

  // Digits beyond childRes → 7 (unused marker)
  for (let r = childRes + 1; r <= 15; r++) {
    const shift = BigInt((15 - r) * 3);
    const mask = 7n << shift;
    minChild = (minChild & ~mask) | (7n << shift);
    maxChild = (maxChild & ~mask) | (7n << shift);
  }

  return [minChild, maxChild];
}

/* ── Merge helper ────────────────────────────────────────────────────── */

/** Sort by min, then merge overlapping / adjacent intervals. */
function mergeRanges(ranges: [bigint, bigint][]): [bigint, bigint][] {
  if (ranges.length === 0) return [];
  ranges.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  const merged: [bigint, bigint][] = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    const [lo, hi] = ranges[i];
    // Overlap or adjacent (max + 1 >= next min)
    if (lo <= last[1] + 1n) {
      if (hi > last[1]) last[1] = hi;
    } else {
      merged.push([lo, hi]);
    }
  }
  return merged;
}

/**
 * Split unwrapped longitude bounds into strips of at most 90 degrees. This
 * avoids H3 interpreting a broad polygon as its antimeridian complement and
 * supports both wrapped bounds and deck.gl longitudes outside [-180, 180].
 *
 * Bbox overlap deliberately includes a margin: H3's implementation builds
 * boxes covering every descendant, unlike geometric parent-cell overlap.
 * See https://github.com/uber/h3/blob/master/src/h3lib/lib/polyfill.c.
 */
function boundsToH3Cells(
  west: number,
  south: number,
  longitudeSpan: number,
  north: number,
  filterRes: number
): string[] {
  const cells = new Set<string>();
  let remaining = longitudeSpan;
  let cursor = normalizeLongitude(west);
  while (remaining > 0) {
    const width = Math.min(90, remaining, 180 - cursor);
    const east = cursor + width;
    const ring = [
      [south, cursor],
      [south, east],
      [north, east],
      [north, cursor],
      [south, cursor],
    ];
    for (const cell of polygonToCellsExperimental(
      [ring],
      filterRes,
      POLYGON_TO_CELLS_FLAGS.containmentOverlappingBbox
    ))
      cells.add(cell);
    remaining -= width;
    cursor = east >= 180 ? -180 : east;
  }
  return [...cells];
}

/**
 * Conservative descendant ranges for `[west, south, east, north]` bounds.
 * `null` is reserved for low-resolution files or an actual whole-globe view.
 * Broad longitude/latitude spans alone never turn a regional query into an
 * unfiltered read. A coarser predicate bounds planning cost for large regions.
 */
export function viewportToH3Ranges(
  bounds: [number, number, number, number],
  dataRes: number
): [string, string][] | null {
  if (!bounds.every(Number.isFinite) || bounds[1] > bounds[3]) {
    throw new RangeError(
      'Viewport bounds must be finite and ordered south to north'
    );
  }
  if (!Number.isInteger(dataRes) || dataRes < 0 || dataRes > 15) {
    throw new RangeError('H3 resolution must be an integer from 0 to 15');
  }
  // The low-resolution sources are intentionally small global datasets.
  if (dataRes < 3) return null;

  const [rawWest, rawSouth, rawEast, rawNorth] = bounds;
  const rawSpan = rawEast - rawWest;
  const longitudeSpan =
    rawSpan >= 360
      ? 360
      : rawSpan < 0
        ? ((rawSpan % 360) + 360) % 360 || 360
        : rawSpan;
  let south = Math.max(-90, Math.min(90, rawSouth));
  let north = Math.max(-90, Math.min(90, rawNorth));
  // GlobeViewport uses near-polar bounds for the completely zoomed-out globe.
  if (longitudeSpan === 360 && north - south >= 170) return null;

  const pad = Math.min(10, Math.max(0.02, (north - south) * 0.15));
  south = Math.max(-90, south - pad);
  north = Math.min(90, north + pad);
  const paddedSpan = Math.min(360, longitudeSpan + 2 * pad);
  const west = normalizeLongitude(rawWest - pad);

  // Spherical rectangle area gives a cheap first estimate. The actual count
  // below enforces the limit despite latitude distortion and overlap margins.
  const radians = Math.PI / 180;
  const globeFraction =
    ((paddedSpan / 360) *
      (Math.sin(north * radians) - Math.sin(south * radians))) /
    2;
  // A fixed coarse cover would retain hundreds of thousands of offscreen
  // descendants at city zooms. Use the finest cover that fits the same budget;
  // overlapping bounding boxes still conservatively cover child geometry.
  let filterRes = dataRes;
  while (
    filterRes > 0 &&
    getNumCells(filterRes) * globeFraction > MAX_FILTER_CELLS / 2
  )
    filterRes--;
  let cells = boundsToH3Cells(west, south, paddedSpan, north, filterRes);
  while (cells.length > MAX_FILTER_CELLS && filterRes > 0) {
    cells = boundsToH3Cells(west, south, paddedSpan, north, --filterRes);
  }
  if (!cells.length) {
    // An invalid/degenerate polygon must not silently trigger a global scan.
    throw new Error('Unable to construct H3 coverage for viewport bounds');
  }
  const merged = mergeRanges(
    cells.map((cell) => h3CellToBigIntRange(cell, dataRes))
  );
  return merged.map(([lo, hi]) => [lo.toString(16), hi.toString(16)]);
}

/**
 * BigInt variant of viewportToH3Ranges. Used when the caller is in the same
 * thread as hyparquet (which consumes BigInts directly) and no postMessage
 * serialization is needed.
 */
export function viewportToH3RangesBigInt(
  bounds: [number, number, number, number],
  dataRes: number
): [bigint, bigint][] | null {
  const hex = viewportToH3Ranges(bounds, dataRes);
  if (!hex) return null;
  return hex.map(([lo, hi]) => [BigInt(`0x${lo}`), BigInt(`0x${hi}`)]);
}

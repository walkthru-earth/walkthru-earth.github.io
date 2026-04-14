/**
 * Converts deck.gl viewport bounds into sorted/merged BigInt ranges of H3
 * cell indices.  Used for row-group pruning when loading large parquet files
 * — only row groups whose h3_index statistics overlap a viewport range are
 * fetched via HTTP range requests.
 */

import { polygonToCells, getResolution } from 'h3-js';

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

/* ── Polygon-to-cells wrapper ────────────────────────────────────────── */

/**
 * Build an array of H3 cell hex strings covering the given bounds at
 * `filterRes`.  Handles antimeridian wrapping.
 *
 * h3-js v4 `polygonToCells` expects a polygon as `[lat, lng][]` ring(s).
 */
function boundsToH3Cells(
  west: number,
  south: number,
  east: number,
  north: number,
  filterRes: number
): string[] {
  // Clamp latitudes
  south = Math.max(-89.99, south);
  north = Math.min(89.99, north);

  const buildRing = (w: number, s: number, e: number, n: number) => [
    [s, w],
    [s, e],
    [n, e],
    [n, w],
    [s, w], // close ring
  ];

  if (west <= east) {
    // Normal case
    return polygonToCells([buildRing(west, south, east, north)], filterRes);
  }

  // Antimeridian wrap: split into two polygons
  const left = polygonToCells(
    [buildRing(west, south, 179.99, north)],
    filterRes
  );
  const right = polygonToCells(
    [buildRing(-179.99, south, east, north)],
    filterRes
  );
  return [...left, ...right];
}

/* ── Public API ──────────────────────────────────────────────────────── */

/**
 * Convert deck.gl viewport bounds to sorted, merged H3 BigInt ranges at
 * `dataRes`.
 *
 * @param bounds  `[west, south, east, north]` from GlobeViewport.getBounds()
 * @param dataRes Target H3 resolution of the parquet file
 * @returns Array of `[minHex, maxHex]` string pairs, or `null` when the
 *          full globe is visible (no filtering needed).
 */
export function viewportToH3Ranges(
  bounds: [number, number, number, number],
  dataRes: number
): [string, string][] | null {
  let [west, south, east, north] = bounds;

  // Full-globe check: if the viewport covers most of the globe, skip
  const lonSpan = west <= east ? east - west : 360 - west + east;
  if (lonSpan > 300 || north - south > 160) {
    console.log(
      `[Globe:H3Viewport] SKIP (full globe) dataRes=${dataRes} lonSpan=${lonSpan.toFixed(1)}° latSpan=${(north - south).toFixed(1)}°`
    );
    return null;
  }

  // Very low resolutions (0-2) have tiny files — not worth filtering.
  // Res 3+ benefit from viewport filtering when zoomed in.
  if (dataRes < 3) {
    console.log(
      `[Globe:H3Viewport] SKIP (low res) dataRes=${dataRes} < 3, loading full file`
    );
    return null;
  }

  // Pad bounds slightly to compensate for GlobeView projection edges.
  // The bounds from GlobeMap are already clamped to the visible hemisphere,
  // so only a small additional pad is needed for edge coverage.
  const latSpan = north - south;
  const pad = Math.min(20, Math.max(10, latSpan * 0.15));
  const origBounds = `[${west.toFixed(1)}, ${south.toFixed(1)}, ${east.toFixed(1)}, ${north.toFixed(1)}]`;
  south = Math.max(-90, south - pad);
  north = Math.min(90, north + pad);
  west -= pad;
  east += pad;

  // Safeguard: never query more than one hemisphere (180° lon span).
  // If padded bounds exceed this, clamp to 180° centered on the midpoint.
  const lonSpanPadded = east - west;
  if (lonSpanPadded > 180) {
    const mid = (west + east) / 2;
    west = mid - 90;
    east = mid + 90;
    console.log(
      `[Globe:H3Viewport] SAFEGUARD: clamped lon span from ${lonSpanPadded.toFixed(1)}° to 180° centered at ${mid.toFixed(1)}°`
    );
  }

  // If padded span covers the full globe, skip filtering
  if (east - west >= 360 || north - south > 160) {
    console.log(
      `[Globe:H3Viewport] SKIP (padded too wide) dataRes=${dataRes} pad=${pad.toFixed(1)}° → spans ${(east - west).toFixed(1)}° lon, ${(north - south).toFixed(1)}° lat`
    );
    return null;
  }

  // Normalize to [-180, 180] — may flip to antimeridian-wrap case
  if (west < -180) west += 360;
  if (east > 180) east -= 360;

  const paddedBounds = `[${west.toFixed(1)}, ${south.toFixed(1)}, ${east.toFixed(1)}, ${north.toFixed(1)}]`;

  // Use a coarser resolution for the polygon-to-cells pass to keep it fast
  const filterRes = Math.max(1, dataRes - 3);

  const cells = boundsToH3Cells(west, south, east, north, filterRes);
  if (cells.length === 0) {
    console.log(
      `[Globe:H3Viewport] SKIP (0 cells) dataRes=${dataRes} filterRes=${filterRes} paddedBounds=${paddedBounds}`
    );
    return null;
  }

  // Convert each coarse cell to a BigInt range at the data resolution
  const ranges: [bigint, bigint][] = cells.map((c) =>
    h3CellToBigIntRange(c, dataRes)
  );

  const merged = mergeRanges(ranges);

  console.log(
    `[Globe:H3Viewport] FILTER dataRes=${dataRes} filterRes=${filterRes} | ` +
      `origBounds=${origBounds} → padded=${paddedBounds} (pad=${pad.toFixed(1)}°) | ` +
      `${cells.length} cells → ${merged.length} merged ranges`
  );

  // Encode as hex strings (BigInt can't be sent via postMessage)
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

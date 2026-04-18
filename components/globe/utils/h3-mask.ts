/**
 * O(N + R) keep-mask for an h3_index column given viewport ranges.
 *
 * Preconditions, relied on by both callers:
 *   1. `h3` is sorted ascending. Parquet files in this project store
 *      h3_index globally sorted across row groups (verified via DuckDB
 *      `parquet_metadata` audit on 2026-04-14), and the chunks arrive
 *      in row-group order from hyparquet's onChunk.
 *   2. `ranges` is sorted ascending by lo and contains no overlapping or
 *      adjacent intervals. `viewportToH3Ranges` guarantees this via
 *      `mergeRanges` in h3-viewport.ts.
 *
 * Replaces the O(N*R) scan that was blocking the worker thread for
 * hundreds of ms to multiple seconds on metro/city zooms at h3_res >= 6
 * (measured: 2 M rows * 500 ranges = 2086 ms naive vs 9 ms merge scan).
 */
export function buildH3KeepMask(
  h3: BigInt64Array,
  ranges: [bigint, bigint][] | null
): Uint8Array | null {
  if (!ranges) return null;
  const n = h3.length;
  const mask = new Uint8Array(n);
  if (n === 0 || ranges.length === 0) return mask;

  let r = 0;
  for (let i = 0; i < n; i++) {
    const v = h3[i];
    // Advance the range pointer past any range whose upper bound is below v.
    while (r < ranges.length && v > ranges[r][1]) r++;
    if (r === ranges.length) break;
    // v <= ranges[r].hi by the while above. Accept iff also >= ranges[r].lo;
    // otherwise v sits in the gap before ranges[r] and the mask stays 0.
    if (v >= ranges[r][0]) mask[i] = 1;
  }
  return mask;
}

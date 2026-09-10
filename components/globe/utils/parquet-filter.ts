/**
 * Build a hyparquet ParquetQueryFilter that matches any h3_index in the
 * given BigInt ranges. hyparquet uses this to skip row groups whose h3_index
 * min/max don't overlap any range (via canSkipRowGroup against column
 * statistics). The scan caller must still apply an exact post-decode mask.
 */
import type { ParquetQueryFilter } from 'hyparquet';

export function buildH3RangeFilter(
  ranges: [bigint, bigint][]
): ParquetQueryFilter | undefined {
  if (ranges.length === 0) return undefined;
  if (ranges.length === 1) {
    const [lo, hi] = ranges[0];
    return { h3_index: { $gte: lo, $lte: hi } };
  }
  return {
    $or: ranges.map(([lo, hi]) => ({
      h3_index: { $gte: lo, $lte: hi },
    })),
  };
}

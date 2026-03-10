/**
 * Shared types and constants used across globe data modules.
 */

/* ── Data source URLs ─────────────────────────────────────────────── */

export const S3_BUCKET =
  'https://s3.us-west-2.amazonaws.com/us-west-2.opendata.source.coop';
export const S3_BASE = `${S3_BUCKET}/walkthru-earth`;

/* ── Shared types ─────────────────────────────────────────────────── */

export interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

/** Runtime context passed to buildQuery/loadData — values resolved at mount time. */
export interface QueryContext {
  weatherPrefix: string;
  h3Res: number;
  /** Hex-encoded BigInt [min, max] pairs for viewport H3 filtering. Null = load everything. */
  h3Ranges?: [string, string][] | null;
}

export interface ColorRange {
  min: number;
  max: number;
}

/* ── Base layer IDs (used in the unified layer-state dict) ───────── */

export const BASE_SATELLITE_ID = 'base-satellite';
export const BASE_LAND_ID = 'base-land';
export const BASE_BORDERS_ID = 'base-borders';

/* ── Shared helpers ───────────────────────────────────────────────── */

/**
 * In-place quickselect — rearranges `arr` so that `arr[k]` holds the
 * value that would be at index `k` in a fully sorted array.  O(n) average.
 */
function quickselect(arr: number[], k: number): number {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo < hi) {
    const pivot = arr[(lo + hi) >> 1];
    let i = lo;
    let j = hi;
    while (i <= j) {
      while (arr[i] < pivot) i++;
      while (arr[j] > pivot) j--;
      if (i <= j) {
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
        i++;
        j--;
      }
    }
    if (j < k) lo = i;
    if (i > k) hi = j;
  }
  return arr[k];
}

/** Compute 5th–95th percentile range for a numeric column.  O(n) via quickselect. */
export function computeRange(
  rows: Record<string, unknown>[],
  column: string
): ColorRange {
  if (!column || rows.length === 0) return { min: 0, max: 1 };
  const values: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const v = Number(rows[i][column]);
    if (Number.isFinite(v)) values.push(v);
  }
  if (values.length === 0) return { min: 0, max: 1 };
  const lo = Math.floor(values.length * 0.05);
  const hi = Math.floor(values.length * 0.95);
  return {
    min: quickselect(values, lo),
    max: quickselect(values, hi),
  };
}

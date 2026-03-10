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

export const BASE_LAND_ID = 'base-land';
export const BASE_BORDERS_ID = 'base-borders';

/* ── Shared helpers ───────────────────────────────────────────────── */

/** Compute 5th–95th percentile range for a numeric column. */
export function computeRange(
  rows: Record<string, unknown>[],
  column: string
): ColorRange {
  if (!column || rows.length === 0) return { min: 0, max: 1 };
  const values = rows
    .map((r) => Number(r[column]))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (values.length === 0) return { min: 0, max: 1 };
  return {
    min: values[Math.floor(values.length * 0.05)] ?? 0,
    max: values[Math.floor(values.length * 0.95)] ?? 1,
  };
}

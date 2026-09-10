import { type LoadResult, type ParquetInfo } from '../utils/parquet-loader';
import { S3_BASE, S3_BUCKET } from './constants';
import type { ViewState, QueryContext, ColorRange } from './constants';
import {
  memoizePromise,
  resolveLatestPartition,
  resolveLatestPartitionChain,
} from './live-data';

export type { ParquetInfo, ViewState, QueryContext, ColorRange };
export { S3_BASE, S3_BUCKET };

export interface GlobeSection {
  id: string;
  title: string;
  subtitle: string;
  /** Static description shown while loading */
  description: string;
  /** Build a data-driven description from loaded rows. Falls back to static `description`. */
  describeData?: (rows: Record<string, unknown>[]) => string;
  stat: { label: string; value: string };
  viewState: ViewState;
  colorColumn: string;
  /** Load data. onProgress fires as row groups stream in (partial results). */
  loadData: (
    ctx: QueryContext,
    onProgress?: (rows: Record<string, unknown>[]) => void
  ) => Promise<LoadResult>;
  buildQuery: (ctx: QueryContext) => string;
  /** Convert row to H3 hex string. Defaults to h3ToHex if omitted. */
  getHexagon?: (d: Record<string, unknown>) => string;
  getFillColor: (
    d: Record<string, unknown>,
    range: ColorRange
  ) => Uint8Array | [number, number, number, number];
  getElevation?: (d: Record<string, unknown>) => number;
  formatTooltip?: (d: Record<string, unknown>) => string | null;
  extruded: boolean;
  elevationScale?: number;
  colorLegend: { label: string; color: string }[];
  sourceCoopUrl: string;
  githubUrl: string;
  /** Default H3 resolution for this section */
  defaultH3Res: number;
  /** Min/max H3 resolution the user can pick */
  h3ResRange: [number, number];
}

/* ── Data source URLs ─────────────────────────────────────────────── */

export const WEATHER_BUCKET_KEY =
  'walkthru-earth/indices/weather/model=GraphCast_GFS';
export const OVERTURE_PLACES_BUCKET_KEY =
  'walkthru-earth/indices/places-index/v1';

export const resolveWeatherPrefix = memoizePromise(async () => {
  const prefix = await resolveLatestPartitionChain(WEATHER_BUCKET_KEY, [
    'date',
    'hour',
  ]);
  console.log(`[Weather] Resolved from S3: ${prefix}`);
  return prefix;
});

export const resolveOvertureRelease = memoizePromise(async () => {
  const partition = await resolveLatestPartition(
    OVERTURE_PLACES_BUCKET_KEY,
    'release'
  );
  const value = partition.slice(partition.lastIndexOf('=') + 1);
  console.log(`[Overture] Resolved from S3: release=${value}`);
  return value;
});

/* ── Parquet URL builders ──────────────────────────────────────────── */

export const weatherParquet = (prefix: string, res: number) =>
  `${prefix}/h3_res=${res}/data.parquet`;

export const buildingParquet = (res: number) =>
  `${S3_BASE}/indices/building/v2/h3/h3_res=${res}/data.parquet`;

export const populationParquet = (res: number, scenario = 'SSP2') =>
  `${S3_BASE}/indices/population/v2/scenario=${scenario}/h3_res=${res}/data.parquet`;

export const terrainParquet = (res: number) =>
  `${S3_BASE}/dem-terrain/v2/h3/h3_res=${res}/data.parquet`;

export const placesParquet = (release: string, res: number) =>
  `${S3_BASE}/indices/places-index/v1/release=${release}/h3/h3_res=${res}/data.parquet`;
export const transportParquet = (release: string, res: number) =>
  `${S3_BASE}/indices/transportation-index/v1/release=${release}/h3/h3_res=${res}/data.parquet`;
export const baseParquet = (release: string, res: number) =>
  `${S3_BASE}/indices/base-index/v1/release=${release}/h3/h3_res=${res}/data.parquet`;

/* ── Helpers ──────────────────────────────────────────────────────── */

/** Convert h3_index to hex string for deck.gl H3HexagonLayer.
 *  Handles both BigInt (v2 int64) and hex string (v1 weather). */
export const h3ToHex = (d: Record<string, unknown>): string => {
  const v = d.h3_index;
  if (typeof v === 'bigint') return v.toString(16);
  if (typeof v === 'number') return BigInt(v).toString(16);
  return String(v);
};

export const fmt = (n: number) => Number(n).toLocaleString();

/** Fast column stat over rows (avoids spreading into Math.min/max). */
export function col(
  rows: Record<string, unknown>[],
  key: string,
  mode: 'min' | 'max' | 'sum'
): number {
  let r = mode === 'sum' ? 0 : mode === 'min' ? Infinity : -Infinity;
  for (const row of rows) {
    const v = Number(row[key]);
    if (!Number.isFinite(v)) continue;
    if (mode === 'sum') r += v;
    else if (mode === 'min') {
      if (v < r) r = v;
    } else {
      if (v > r) r = v;
    }
  }
  return r;
}

/* ── Places diversity ─────────────────────────────────────────────── */

export const PLACES_CATEGORIES = [
  'n_food_and_drink',
  'n_shopping',
  'n_services_and_business',
  'n_health_care',
  'n_travel_and_transportation',
  'n_lifestyle_services',
  'n_education',
  'n_community_and_government',
  'n_cultural_and_historic',
  'n_sports_and_recreation',
  'n_lodging',
  'n_arts_and_entertainment',
  'n_geographic_entities',
] as const;

/** Maximum Shannon entropy: ln(13 categories) ≈ 2.565 */
export const MAX_SHANNON = Math.log(PLACES_CATEGORIES.length);

/** Shannon diversity index H′ = −Σ(pᵢ · ln(pᵢ)) across 13 POI categories. */
export function shannonDiversity(d: Record<string, unknown>): number {
  let total = 0;
  for (const k of PLACES_CATEGORIES) total += Number(d[k]) || 0;
  if (total <= 0) return 0;
  let h = 0;
  for (const k of PLACES_CATEGORIES) {
    const n = Number(d[k]) || 0;
    if (n <= 0) continue;
    const p = n / total;
    h -= p * Math.log(p);
  }
  return h;
}

/* ── Transport walkability ────────────────────────────────────────── */

export const HUMAN_SCALE_KEYS = [
  'n_footway',
  'n_pedestrian',
  'n_steps',
  'n_path',
  'n_cycleway',
  'n_living_street',
] as const;

export const CAR_SCALE_KEYS = [
  'n_motorway',
  'n_trunk',
  'n_primary',
  'n_secondary',
] as const;

/**
 * Walkability ratio: human-scale segments / (human-scale + car-scale).
 * Returns 0–1.  1 = fully pedestrian/cycle, 0 = fully car-dominated.
 * Cells with zero relevant segments return 0.
 */
export function walkabilityRatio(d: Record<string, unknown>): number {
  let human = 0;
  for (const k of HUMAN_SCALE_KEYS) human += Number(d[k]) || 0;
  let car = 0;
  for (const k of CAR_SCALE_KEYS) car += Number(d[k]) || 0;
  const total = human + car;
  return total > 0 ? human / total : 0;
}

/* ── Base-index helpers ───────────────────────────────────────────── */

export const NATURE_KEYS = [
  'n_lu_park',
  'n_lu_recreation',
  'n_lu_protected',
  'n_lu_agriculture',
  'n_lu_horticulture',
] as const;

export const WATER_KEYS = [
  'n_river',
  'n_lake',
  'n_ocean',
  'n_stream',
  'n_canal',
  'n_pond',
  'n_reservoir',
  'n_spring',
] as const;

export const URBAN_KEYS = [
  'n_lu_residential',
  'n_lu_developed',
  'n_lu_construction',
] as const;

export const INFRA_TYPES = [
  'n_power',
  'n_barrier',
  'n_transportation',
  'n_transit',
  'n_bridge',
  'n_pedestrian',
  'n_emergency',
  'n_utility',
  'n_waste_mgmt',
  'n_water_infra',
  'n_pier',
  'n_airport',
  'n_communication',
] as const;

/** Sum numeric keys from a row. */
export function sumKeys(
  d: Record<string, unknown>,
  keys: readonly string[]
): number {
  let s = 0;
  for (const k of keys) s += Number(d[k]) || 0;
  return s;
}

/** Nature ratio: green + water features vs green + water + urban + infra.  0 = concrete, 1 = pure nature. */
export function natureRatio(d: Record<string, unknown>): number {
  const nature = sumKeys(d, NATURE_KEYS) + sumKeys(d, WATER_KEYS);
  const urban = sumKeys(d, URBAN_KEYS) + Number(d.infra_count || 0);
  const total = nature + urban;
  return total > 0 ? nature / total : 0;
}

/* ── Section definitions ──────────────────────────────────────────── */

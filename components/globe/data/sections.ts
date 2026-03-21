import {
  interpolateColor,
  normalize,
  ELEVATION_COLORS,
  POPULATION_GROWTH_COLORS,
  BUILDING_HEIGHT_COLORS,
  TEMPERATURE_COLORS,
  WIND_SPEED_COLORS,
  POPULATION_DENSITY_COLORS,
  PRESSURE_COLORS,
  PRECIPITATION_COLORS,
  SLOPE_COLORS,
  RUGGEDNESS_COLORS,
  HOUSING_PRESSURE_COLORS,
  VERTICAL_DENSITY_COLORS,
  PLACES_COLORS,
  WALKABILITY_COLORS,
  BIOPHILIC_COLORS,
  HEAT_VULN_COLORS,
  WATER_SECURITY_COLORS,
} from '../utils/color-scales';
import {
  loadParquet,
  type LoadResult,
  type ParquetInfo,
} from '../utils/parquet-loader';
import { S3_BASE, S3_BUCKET } from './constants';
import type { ViewState, QueryContext, ColorRange } from './constants';

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

const WEATHER_STATE_URL =
  'https://raw.githubusercontent.com/walkthru-earth/walkthru-weather-index/refs/heads/main/state/noaa-last-seen.txt';
const OVERTURE_STATE_URL =
  'https://raw.githubusercontent.com/walkthru-earth/walkthru-overture-index/refs/heads/main/state/last-release.txt';

const PROBE_BASE = 'https://data.source.coop/walkthru-earth';

const WEATHER_BASE = `${S3_BASE}/indices/weather/model=GraphCast_GFS`;

function recentDates(count = 7): string[] {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/**
 * Parse the NOAA last-seen state file to extract date and hour.
 * Format: "GRAP_v100_GFS/2026/0320/GRAP_v100_GFS_2026032012_f000_f240_06.nc"
 * Extracts: date=2026-03-20, hour=12
 */
function parseWeatherState(
  text: string
): { date: string; hour: number } | null {
  // Match the timestamp portion: YYYYMMDDHH
  const match = text.match(
    /GRAP_v100_GFS_(\d{4})(\d{2})(\d{2})(\d{2})_f\d+_f\d+/
  );
  if (!match) return null;
  const [, year, month, day, hour] = match;
  return { date: `${year}-${month}-${day}`, hour: parseInt(hour, 10) };
}

let _weatherPrefixPromise: Promise<string> | null = null;
export function resolveWeatherPrefix(): Promise<string> {
  if (_weatherPrefixPromise) return _weatherPrefixPromise;

  _weatherPrefixPromise = (async () => {
    // 1. Try the authoritative state file first (single lightweight fetch)
    try {
      const res = await fetch(WEATHER_STATE_URL);
      if (res.ok) {
        const text = (await res.text()).trim();
        const parsed = parseWeatherState(text);
        if (parsed) {
          const prefix = `${WEATHER_BASE}/date=${parsed.date}/hour=${parsed.hour}`;
          console.log(
            `[Weather] State file: date=${parsed.date}/hour=${parsed.hour}`
          );
          return prefix;
        }
      }
    } catch {
      console.warn(
        '[Weather] State file fetch failed, falling back to probing'
      );
    }

    // 2. Fallback: probe recent dates with HEAD requests
    const probe = async (
      date: string,
      hour: number
    ): Promise<string | null> => {
      try {
        const probeUrl = `${PROBE_BASE}/indices/weather/model=GraphCast_GFS/date=${date}/hour=${hour}/h3_res=2/data.parquet`;
        const r = await fetch(probeUrl, { method: 'HEAD' });
        return r.ok ? `${WEATHER_BASE}/date=${date}/hour=${hour}` : null;
      } catch {
        return null;
      }
    };

    const dates = recentDates(2);
    for (const date of dates) {
      const [h12, h0] = await Promise.all([probe(date, 12), probe(date, 0)]);
      if (h12) {
        console.log(`[Weather] Probe found: date=${date}/hour=12`);
        return h12;
      }
      if (h0) {
        console.log(`[Weather] Probe found: date=${date}/hour=0`);
        return h0;
      }
    }

    console.warn('[Weather] All probes failed, using fallback');
    return `${WEATHER_BASE}/date=${dates[0]}/hour=0`;
  })();

  return _weatherPrefixPromise;
}

const OVERTURE_FALLBACK = '2026-03-18.0';

let _overtureReleasePromise: Promise<string> | null = null;
export function resolveOvertureRelease(): Promise<string> {
  if (_overtureReleasePromise) return _overtureReleasePromise;

  _overtureReleasePromise = (async () => {
    try {
      const res = await fetch(OVERTURE_STATE_URL);
      if (res.ok) {
        const text = (await res.text()).trim();
        if (text) {
          console.log(`[Overture] Release from state file: ${text}`);
          return text;
        }
      }
    } catch {
      console.warn('[Overture] State file fetch failed, using fallback');
    }
    return OVERTURE_FALLBACK;
  })();

  return _overtureReleasePromise;
}

/* ── Parquet URL builders ──────────────────────────────────────────── */

const weatherParquet = (prefix: string, res: number) =>
  `${prefix}/h3_res=${res}/data.parquet`;

const buildingParquet = (res: number) =>
  `${S3_BASE}/indices/building/v2/h3/h3_res=${res}/data.parquet`;

const populationParquet = (res: number, scenario = 'SSP2') =>
  `${S3_BASE}/indices/population/v2/scenario=${scenario}/h3_res=${res}/data.parquet`;

const terrainParquet = (res: number) =>
  `${S3_BASE}/dem-terrain/v2/h3/h3_res=${res}/data.parquet`;

const placesParquet = (release: string, res: number) =>
  `${S3_BASE}/indices/places-index/v1/release=${release}/h3/h3_res=${res}/data.parquet`;
const transportParquet = (release: string, res: number) =>
  `${S3_BASE}/indices/transportation-index/v1/release=${release}/h3/h3_res=${res}/data.parquet`;
const baseParquet = (release: string, res: number) =>
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

const fmt = (n: number) => Number(n).toLocaleString();

/** Fast column stat over rows (avoids spreading into Math.min/max). */
function col(
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

const PLACES_CATEGORIES = [
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
const MAX_SHANNON = Math.log(PLACES_CATEGORIES.length);

/** Shannon diversity index H′ = −Σ(pᵢ · ln(pᵢ)) across 13 POI categories. */
function shannonDiversity(d: Record<string, unknown>): number {
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

const HUMAN_SCALE_KEYS = [
  'n_footway',
  'n_pedestrian',
  'n_steps',
  'n_path',
  'n_cycleway',
  'n_living_street',
] as const;

const CAR_SCALE_KEYS = [
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
function walkabilityRatio(d: Record<string, unknown>): number {
  let human = 0;
  for (const k of HUMAN_SCALE_KEYS) human += Number(d[k]) || 0;
  let car = 0;
  for (const k of CAR_SCALE_KEYS) car += Number(d[k]) || 0;
  const total = human + car;
  return total > 0 ? human / total : 0;
}

/* ── Base-index helpers ───────────────────────────────────────────── */

const NATURE_KEYS = [
  'n_lu_park',
  'n_lu_recreation',
  'n_lu_protected',
  'n_lu_agriculture',
  'n_lu_horticulture',
] as const;

const WATER_KEYS = [
  'n_river',
  'n_lake',
  'n_ocean',
  'n_stream',
  'n_canal',
  'n_pond',
  'n_reservoir',
  'n_spring',
] as const;

const URBAN_KEYS = [
  'n_lu_residential',
  'n_lu_developed',
  'n_lu_construction',
] as const;

const INFRA_TYPES = [
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
function sumKeys(d: Record<string, unknown>, keys: readonly string[]): number {
  let s = 0;
  for (const k of keys) s += Number(d[k]) || 0;
  return s;
}

/** Nature ratio: green + water features vs green + water + urban + infra.  0 = concrete, 1 = pure nature. */
function natureRatio(d: Record<string, unknown>): number {
  const nature = sumKeys(d, NATURE_KEYS) + sumKeys(d, WATER_KEYS);
  const urban = sumKeys(d, URBAN_KEYS) + Number(d.infra_count || 0);
  const total = nature + urban;
  return total > 0 ? nature / total : 0;
}

/* ── Section definitions ──────────────────────────────────────────── */

export const SECTIONS: GlobeSection[] = [
  /* ────────────────────────────────────────────────────────────────
   * Section 0: Weather — Global Temperature (zoom ~1.5, full globe)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'weather-temperature',
    title: 'Global Temperature',
    subtitle: 'AI Weather · GraphCast',
    description:
      'AI-powered weather from NOAA GraphCast. 21 forecast timesteps, updated every 12 hours. Each hexagon carries temperature, wind speed, and pressure.',
    describeData: (rows) => {
      const lo = col(rows, 'temperature_2m_C', 'min');
      const hi = col(rows, 'temperature_2m_C', 'max');
      const ts = new Set(rows.map((r) => r.timestamp)).size;
      return `${fmt(rows.length)} cells loaded across ${ts} timesteps. Temperature range: ${lo.toFixed(1)}\u00B0C to ${hi.toFixed(1)}\u00B0C. A ${(hi - lo).toFixed(0)}\u00B0 span on one grid. AI-powered by NOAA GraphCast, topographically corrected with our 30m terrain model.`;
    },
    stat: { label: 'Forecast Horizon', value: '5 days' },
    viewState: { latitude: 20, longitude: 30, zoom: 1.5 },
    colorColumn: 'temperature_2m_C',
    loadData: async (ctx, onProgress) =>
      loadParquet(
        weatherParquet(ctx.weatherPrefix, ctx.h3Res),
        [
          'h3_index',
          'timestamp',
          'temperature_2m_C',
          'wind_speed_10m_ms',
          'pressure_msl_hPa',
        ],
        ctx.h3Ranges,
        onProgress
      ),
    buildQuery: (ctx) => `SELECT h3_index, temperature_2m_C,
       wind_speed_10m_ms, pressure_msl_hPa
FROM '${weatherParquet(ctx.weatherPrefix, ctx.h3Res)}'`,

    getFillColor: (d, range) => {
      const temp = Number(d.temperature_2m_C) || 15;
      return interpolateColor(
        normalize(temp, range.min, range.max),
        TEMPERATURE_COLORS
      );
    },
    formatTooltip: (d) =>
      [
        `Temp: ${Number(d.temperature_2m_C).toFixed(1)} °C`,
        `Wind: ${Number(d.wind_speed_10m_ms).toFixed(1)} m/s`,
        `Pressure: ${Number(d.pressure_msl_hPa).toFixed(0)} hPa`,
      ].join('\n'),
    extruded: false,
    colorLegend: [
      { label: '-30°C', color: 'rgb(49,54,149)' },
      { label: '0°C', color: 'rgb(171,217,233)' },
      { label: '40°C', color: 'rgb(165,0,38)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices/weather',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-weather-index',
    defaultH3Res: 1,
    h3ResRange: [1, 5],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 1: Weather — Global Wind Speed (zoom ~1.8)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'weather-wind',
    title: 'Wind Patterns',
    subtitle: 'AI Weather · 10m Winds',
    description:
      'Surface wind speeds at 10m above ground. Trade winds, westerlies, and storm systems. Each hexagon carries speed and direction vectors.',
    describeData: (rows) => {
      const maxWind = col(rows, 'wind_speed_10m_ms', 'max');
      const maxKmh = (maxWind * 3.6).toFixed(0);
      return `${fmt(rows.length)} cells loaded. Strongest wind: ${maxWind.toFixed(1)} m/s (${maxKmh} km/h). Trade winds, westerlies, and storm systems. Each hexagon carries speed and direction vectors from NOAA GraphCast AI.`;
    },
    stat: { label: 'Update Frequency', value: '12 hrs' },
    viewState: { latitude: 30, longitude: -30, zoom: 1.8 },
    colorColumn: 'wind_speed_10m_ms',
    loadData: async (ctx, onProgress) =>
      loadParquet(
        weatherParquet(ctx.weatherPrefix, ctx.h3Res),
        [
          'h3_index',
          'timestamp',
          'wind_speed_10m_ms',
          'wind_direction_10m_deg',
          'temperature_2m_C',
        ],
        ctx.h3Ranges,
        onProgress
      ),
    buildQuery: (ctx) => `SELECT h3_index, wind_speed_10m_ms,
       wind_direction_10m_deg, temperature_2m_C
FROM '${weatherParquet(ctx.weatherPrefix, ctx.h3Res)}'`,

    getFillColor: (d, range) => {
      const wind = Number(d.wind_speed_10m_ms) || 0;
      return interpolateColor(
        normalize(wind, range.min, range.max),
        WIND_SPEED_COLORS
      );
    },
    formatTooltip: (d) =>
      [
        `Wind: ${Number(d.wind_speed_10m_ms).toFixed(1)} m/s`,
        `Direction: ${Number(d.wind_direction_10m_deg).toFixed(0)}°`,
        `Temp: ${Number(d.temperature_2m_C).toFixed(1)} °C`,
      ].join('\n'),
    extruded: false,
    colorLegend: [
      { label: 'Calm', color: 'rgb(240,249,232)' },
      { label: '12 m/s', color: 'rgb(67,162,202)' },
      { label: '25 m/s', color: 'rgb(8,64,129)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices/weather',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-weather-index',
    defaultH3Res: 1,
    h3ResRange: [1, 5],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 2: Terrain — Himalayas (zoom ~3.5, extruded)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'terrain',
    title: 'Terrain & Elevation',
    subtitle: 'Himalayas',
    description:
      'Elevation from the GEDTM-30m global terrain model. Five metrics per hexagon: elevation, slope, aspect, TRI, and TPI. 183 GB across 10.5 billion cells.',
    describeData: (rows) => {
      const hi = col(rows, 'elev', 'max');
      const lo = col(rows, 'elev', 'min');
      const maxSlope = col(rows, 'slope', 'max');
      return `${fmt(rows.length)} cells. Elevation range: ${lo.toFixed(0)}m to ${hi.toFixed(0)}m. Steepest slope: ${maxSlope.toFixed(1)}\u00B0. Five metrics per hexagon from the GEDTM-30m global terrain model.`;
    },
    stat: { label: 'Source Resolution', value: '30m' },
    viewState: { latitude: 28.5, longitude: 86.5, zoom: 3.5 },
    colorColumn: 'elev',
    loadData: async (ctx, onProgress) =>
      loadParquet(
        terrainParquet(ctx.h3Res),
        ['h3_index', 'elev', 'slope', 'aspect', 'tri'],
        ctx.h3Ranges,
        onProgress
      ),
    buildQuery: (ctx) => `SELECT h3_index, elev, slope, aspect, tri
FROM '${terrainParquet(ctx.h3Res)}'`,

    getFillColor: (d, range) => {
      const elev = Number(d.elev) || 0;
      return interpolateColor(
        normalize(elev, range.min, range.max),
        ELEVATION_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.elev) || 0),
    formatTooltip: (d) =>
      [
        `Elevation: ${Number(d.elev).toFixed(0)} m`,
        `Slope: ${Number(d.slope).toFixed(1)}°`,
        `TRI: ${Number(d.tri).toFixed(1)}`,
      ].join('\n'),
    extruded: true,
    elevationScale: 50,
    colorLegend: [
      { label: '0 m', color: 'rgb(34,139,34)' },
      { label: '4000 m', color: 'rgb(160,82,45)' },
      { label: '8000 m', color: 'rgb(255,250,250)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/dem-terrain',
    githubUrl: 'https://github.com/walkthru-earth/dem-terrain',
    defaultH3Res: 3,
    h3ResRange: [1, 10],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 3: Buildings + Population — Nile Delta / Cairo (zoom ~4)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'urban-density',
    title: 'Urban Density',
    subtitle: 'Nile Delta · Cairo',
    description:
      '2.75 billion buildings from the Global Building Atlas, joined with SSP2 population projections. 12 columns per cell: count, density, footprint, height, volume, coverage ratio.',
    describeData: (rows) => {
      const total = col(rows, 'building_count', 'sum');
      const maxPop = col(rows, 'pop_2025', 'max');
      const maxBldg = col(rows, 'building_count', 'max');
      return `${fmt(rows.length)} cells. ${fmt(total)} buildings total. Densest cell: ${fmt(maxBldg)} buildings. Most populated: ${fmt(Math.round(maxPop))} people. Joined with SSP2 population projections.`;
    },
    stat: { label: 'Total Buildings', value: '2.75B' },
    viewState: { latitude: 30.0, longitude: 31.2, zoom: 4 },
    colorColumn: 'pop_2025',
    loadData: async (ctx, _onProgress) => {
      const [bResult, pResult] = await Promise.all([
        loadParquet(
          buildingParquet(ctx.h3Res),
          [
            'h3_index',
            'building_count',
            'building_density',
            'avg_height_m',
            'total_volume_m3',
          ],
          ctx.h3Ranges
        ),
        loadParquet(
          populationParquet(ctx.h3Res),
          ['h3_index', 'pop_2025', 'pop_2050'],
          ctx.h3Ranges
        ),
      ]);
      const popMap = new Map(pResult.rows.map((p) => [String(p.h3_index), p]));
      const rows = bResult.rows.map((b) => {
        const p = popMap.get(String(b.h3_index));
        return {
          ...b,
          pop_2025: p?.pop_2025 ?? 0,
          pop_2050: p?.pop_2050 ?? 0,
        };
      });
      return { rows, info: bResult.info };
    },
    buildQuery: (ctx) => `SELECT b.h3_index, b.building_count,
       b.building_density, b.avg_height_m,
       b.total_volume_m3,
       p.pop_2025, p.pop_2050
FROM '${buildingParquet(ctx.h3Res)}' b
JOIN '${populationParquet(ctx.h3Res)}' p USING (h3_index)`,

    getFillColor: (d, range) => {
      const pop = Number(d.pop_2025) || 0;
      return interpolateColor(
        normalize(pop, range.min, range.max),
        POPULATION_DENSITY_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.building_count) || 0),
    formatTooltip: (d) =>
      [
        `Buildings: ${fmt(Number(d.building_count))}`,
        `Avg Height: ${Number(d.avg_height_m).toFixed(1)} m`,
        `Pop 2025: ${fmt(Number(d.pop_2025))}`,
        `Pop 2050: ${fmt(Number(d.pop_2050))}`,
      ].join('\n'),
    extruded: true,
    elevationScale: 0.02,
    colorLegend: [
      { label: 'Sparse', color: 'rgb(255,255,204)' },
      { label: '1M', color: 'rgb(253,141,60)' },
      { label: '2M+', color: 'rgb(189,0,38)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices/building',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-building-index',
    defaultH3Res: 3,
    h3ResRange: [3, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 4: Population Growth — Sub-Saharan Africa (zoom ~3.5)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'population-growth',
    title: 'Population Growth 2025→2100',
    subtitle: 'Sub-Saharan Africa',
    description:
      'Population projections under SSP2 from WorldPop. Sub-Saharan Africa shows the most dramatic growth. Some hexagons tripling by 2100.',
    describeData: (rows) => {
      const totalPop = col(rows, 'pop_2025', 'sum');
      const totalPop2100 = col(rows, 'pop_2100', 'sum');
      const maxGrowth = col(rows, 'growth_ratio', 'max');
      const maxPop = col(rows, 'pop_2025', 'max');
      return `${fmt(rows.length)} cells. ${(totalPop / 1e9).toFixed(2)}B people today \u2192 ${(totalPop2100 / 1e9).toFixed(2)}B by 2100. Fastest growing cell: ${maxGrowth.toFixed(1)}x. Most populated cell: ${fmt(Math.round(maxPop))} people.`;
    },
    stat: { label: 'Projection', value: 'SSP2' },
    viewState: { latitude: 5, longitude: 25, zoom: 3.5 },
    colorColumn: 'growth_ratio',
    loadData: async (ctx, _onProgress) => {
      const result = await loadParquet(
        populationParquet(ctx.h3Res),
        ['h3_index', 'pop_2025', 'pop_2050', 'pop_2100'],
        ctx.h3Ranges
      );
      return {
        rows: result.rows
          .filter((r) => Number(r.pop_2025) >= 10)
          .map((r) => ({
            ...r,
            growth_ratio:
              Number(r.pop_2025) > 0
                ? Number(r.pop_2100) / Number(r.pop_2025)
                : null,
          })),
        info: result.info,
      };
    },
    buildQuery: (ctx) => `SELECT h3_index, pop_2025, pop_2050, pop_2100,
       pop_2100 / NULLIF(pop_2025, 0) AS growth_ratio
FROM '${populationParquet(ctx.h3Res)}'
WHERE pop_2025 >= 10`,

    getFillColor: (d, range) => {
      const ratio = Number(d.growth_ratio) || 1;
      return interpolateColor(
        normalize(ratio, range.min, range.max),
        POPULATION_GROWTH_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.pop_2025) || 0),
    formatTooltip: (d) =>
      [
        `Pop 2025: ${fmt(Number(d.pop_2025))}`,
        `Pop 2100: ${fmt(Number(d.pop_2100))}`,
        `Growth: ${Number(d.growth_ratio).toFixed(1)}x`,
      ].join('\n'),
    extruded: true,
    elevationScale: 0.02,
    colorLegend: [
      { label: 'Declining', color: 'rgb(49,130,189)' },
      { label: 'Stable', color: 'rgb(255,255,178)' },
      { label: '3x Growth', color: 'rgb(227,26,28)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices/population',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-pop-index',
    defaultH3Res: 3,
    h3ResRange: [1, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 5: Buildings — Tokyo (zoom ~4, building height)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'building-density',
    title: 'Building Density',
    subtitle: 'Tokyo · East Asia',
    description:
      "Tokyo-Yokohama, the world's largest metro. Each hexagon reports 12 metrics: count, density, footprint, height, volume, and coverage ratio.",
    describeData: (rows) => {
      const maxH = col(rows, 'avg_height_m', 'max');
      const maxDensity = col(rows, 'building_density', 'max');
      const maxCoverage = col(rows, 'coverage_ratio', 'max');
      return `${fmt(rows.length)} cells. Tallest average: ${maxH.toFixed(1)}m. Densest: ${maxDensity.toFixed(0)}/km\u00B2. Max coverage: ${(maxCoverage * 100).toFixed(1)}%. 12 metrics per hexagon from the Global Building Atlas.`;
    },
    stat: { label: 'Metro Population', value: '37M' },
    viewState: { latitude: 35.68, longitude: 139.76, zoom: 4 },
    colorColumn: 'avg_height_m',
    loadData: async (ctx, onProgress) =>
      loadParquet(
        buildingParquet(ctx.h3Res),
        [
          'h3_index',
          'building_count',
          'building_density',
          'avg_height_m',
          'coverage_ratio',
          'total_volume_m3',
        ],
        ctx.h3Ranges,
        onProgress
      ),
    buildQuery: (ctx) => `SELECT h3_index, building_count,
       building_density, avg_height_m,
       coverage_ratio, total_volume_m3
FROM '${buildingParquet(ctx.h3Res)}'`,

    getFillColor: (d, range) => {
      const height = Number(d.avg_height_m) || 0;
      return interpolateColor(
        normalize(height, range.min, range.max),
        BUILDING_HEIGHT_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.building_density) || 0),
    formatTooltip: (d) =>
      [
        `Buildings: ${fmt(Number(d.building_count))}`,
        `Density: ${Number(d.building_density).toFixed(1)} /km²`,
        `Avg Height: ${Number(d.avg_height_m).toFixed(1)} m`,
        `Coverage: ${(Number(d.coverage_ratio) * 100).toFixed(2)}%`,
      ].join('\n'),
    extruded: true,
    elevationScale: 1,
    colorLegend: [
      { label: 'Low-rise', color: 'rgb(200,200,200)' },
      { label: 'Mid-rise', color: 'rgb(253,184,99)' },
      { label: 'High-rise', color: 'rgb(215,48,39)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices/building',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-building-index',
    defaultH3Res: 3,
    h3ResRange: [3, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 6: Housing Pressure — Pop Growth × Low Buildings/Person
   * Cross-index: population + building
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'housing-pressure',
    title: 'Housing Pressure 2025→2100',
    subtitle: 'Sub-Saharan Africa',
    description:
      'Where population will grow fastest with the fewest buildings per person. Cross-index joining buildings with SSP2 projections. Revealing future housing crises decades in advance.',
    describeData: (rows) => {
      const maxGrowth = col(rows, 'growth_ratio', 'max');
      const minBpp = rows.reduce((m, r) => {
        const v = Number(r.bldg_per_person);
        return v > 0 && v < m ? v : m;
      }, Infinity);
      return `${fmt(rows.length)} cells. Fastest growth: ${maxGrowth.toFixed(1)}x. Fewest buildings/person: ${minBpp === Infinity ? 'N/A' : minBpp.toFixed(3)}. Cross-index joining 2.75B buildings with SSP2 population projections.`;
    },
    stat: { label: 'Max Growth', value: '524x' },
    viewState: { latitude: 8, longitude: 7, zoom: 3.5 },
    colorColumn: 'growth_ratio',
    loadData: async (ctx, _onProgress) => {
      const [bResult, pResult] = await Promise.all([
        loadParquet(
          buildingParquet(ctx.h3Res),
          ['h3_index', 'building_count'],
          ctx.h3Ranges
        ),
        loadParquet(
          populationParquet(ctx.h3Res),
          ['h3_index', 'pop_2025', 'pop_2100'],
          ctx.h3Ranges
        ),
      ]);
      const bMap = new Map(bResult.rows.map((b) => [String(b.h3_index), b]));
      const rows = pResult.rows
        .filter((p) => Number(p.pop_2025) >= 10)
        .map((p) => {
          const b = bMap.get(String(p.h3_index));
          const pop2025 = Number(p.pop_2025);
          const pop2100 = Number(p.pop_2100);
          const bldgCount = Number(b?.building_count ?? 0);
          return {
            ...p,
            building_count: bldgCount,
            growth_ratio: pop2025 > 0 ? pop2100 / pop2025 : null,
            bldg_per_person:
              pop2025 > 0 && bldgCount > 0 ? bldgCount / pop2025 : null,
          };
        });
      return { rows, info: pResult.info };
    },
    buildQuery: (ctx) => `SELECT p.h3_index, p.pop_2025, p.pop_2100,
       p.pop_2100 / NULLIF(p.pop_2025, 0) AS growth_ratio,
       b.building_count,
       b.building_count::FLOAT / NULLIF(p.pop_2025, 0) AS bldg_per_person
FROM '${populationParquet(ctx.h3Res)}' p
LEFT JOIN '${buildingParquet(ctx.h3Res)}' b USING (h3_index)
WHERE p.pop_2025 >= 10`,

    getFillColor: (d, range) => {
      const ratio = Number(d.growth_ratio) || 1;
      return interpolateColor(
        normalize(ratio, range.min, range.max),
        HOUSING_PRESSURE_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.pop_2025) || 0),
    formatTooltip: (d) =>
      [
        `Pop 2025: ${fmt(Number(d.pop_2025))}`,
        `Pop 2100: ${fmt(Number(d.pop_2100))}`,
        `Growth: ${Number(d.growth_ratio).toFixed(1)}x`,
        `Buildings: ${fmt(Number(d.building_count))}`,
        `Bldg/Person: ${Number(d.bldg_per_person).toFixed(3)}`,
      ].join('\n'),
    extruded: true,
    elevationScale: 0.02,
    colorLegend: [
      { label: 'Stable', color: 'rgb(49,163,84)' },
      { label: '2x', color: 'rgb(253,141,60)' },
      { label: '5x+', color: 'rgb(128,0,38)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-building-index',
    defaultH3Res: 3,
    h3ResRange: [3, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 7: Landslide Vulnerability — Buildings on Steep Terrain
   * Cross-index: building + terrain
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'landslide-vulnerability',
    title: 'Buildings on Unstable Ground',
    subtitle: 'Himalayan Risk',
    description:
      'Cross-joining buildings with terrain slope to find structures on dangerous ground. The steepest inhabited terrain on Earth.',
    describeData: (rows) => {
      const maxSlope = col(rows, 'slope', 'max');
      const maxBldg = col(rows, 'building_count', 'max');
      const total = col(rows, 'building_count', 'sum');
      return `${fmt(rows.length)} cells with buildings on terrain. Steepest: ${maxSlope.toFixed(1)}\u00B0. Most buildings on slope: ${fmt(maxBldg)}. Total structures on terrain: ${fmt(total)}.`;
    },
    stat: { label: 'Max Slope', value: '37.2\u00B0' },
    viewState: { latitude: 28, longitude: 85, zoom: 3.5 },
    colorColumn: 'slope',
    loadData: async (ctx, _onProgress) => {
      const [bResult, tResult] = await Promise.all([
        loadParquet(
          buildingParquet(ctx.h3Res),
          ['h3_index', 'building_count', 'avg_height_m'],
          ctx.h3Ranges
        ),
        loadParquet(
          terrainParquet(ctx.h3Res),
          ['h3_index', 'elev', 'slope', 'tri'],
          ctx.h3Ranges
        ),
      ]);
      const bMap = new Map(bResult.rows.map((b) => [String(b.h3_index), b]));
      const rows = tResult.rows
        .filter((t) => {
          const b = bMap.get(String(t.h3_index));
          return b && Number(b.building_count) > 0;
        })
        .map((t) => {
          const b = bMap.get(String(t.h3_index))!;
          return {
            ...t,
            building_count: Number(b.building_count),
            avg_height_m: Number(b.avg_height_m ?? 0),
          };
        });
      return { rows, info: tResult.info };
    },
    buildQuery: (ctx) => `SELECT t.h3_index, t.elev, t.slope, t.tri,
       b.building_count, b.avg_height_m
FROM '${terrainParquet(ctx.h3Res)}' t
JOIN '${buildingParquet(ctx.h3Res)}' b USING (h3_index)
WHERE b.building_count > 0`,

    getFillColor: (d, range) => {
      const slope = Number(d.slope) || 0;
      return interpolateColor(
        normalize(slope, range.min, range.max),
        SLOPE_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.building_count) || 0),
    formatTooltip: (d) =>
      [
        `Slope: ${Number(d.slope).toFixed(1)}°`,
        `Elevation: ${Number(d.elev).toFixed(0)} m`,
        `Ruggedness: ${Number(d.tri).toFixed(1)}`,
        `Buildings: ${fmt(Number(d.building_count))}`,
        `Avg Height: ${Number(d.avg_height_m).toFixed(1)} m`,
      ].join('\n'),
    extruded: true,
    elevationScale: 0.02,
    colorLegend: [
      { label: '0°', color: 'rgb(255,255,204)' },
      { label: '15°', color: 'rgb(253,141,60)' },
      { label: '35°+', color: 'rgb(189,0,38)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices',
    githubUrl: 'https://github.com/walkthru-earth/dem-terrain',
    defaultH3Res: 3,
    h3ResRange: [3, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 8: Vertical Living — Most Compressed Human Density
   * Cross-index: building + population
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'vertical-living',
    title: 'Vertical Living Index',
    subtitle: 'Pearl River Delta',
    description:
      'Buildings per person. A proxy for how vertically compressed human living is. Low ratios mean more people sharing each structure, reshaping daily stress, social interaction, and mental health.',
    describeData: (rows) => {
      const minBpp = rows.reduce((m, r) => {
        const v = Number(r.bldg_per_person);
        return v > 0 && v < m ? v : m;
      }, Infinity);
      const ppb = minBpp > 0 ? Math.round(1 / minBpp) : 0;
      const maxPop = col(rows, 'pop_2025', 'max');
      return `${fmt(rows.length)} cells. Most compressed: ${minBpp === Infinity ? 'N/A' : minBpp.toFixed(3)} buildings/person. One building for every ${ppb} people. Most populated cell: ${fmt(Math.round(maxPop))}.`;
    },
    stat: { label: 'Min Bldg/Person', value: '0.0003' },
    viewState: { latitude: 23, longitude: 114, zoom: 3.5 },
    colorColumn: 'bldg_per_person',
    loadData: async (ctx, _onProgress) => {
      const [bResult, pResult] = await Promise.all([
        loadParquet(
          buildingParquet(ctx.h3Res),
          ['h3_index', 'building_count', 'avg_height_m'],
          ctx.h3Ranges
        ),
        loadParquet(
          populationParquet(ctx.h3Res),
          ['h3_index', 'pop_2025'],
          ctx.h3Ranges
        ),
      ]);
      const pMap = new Map(pResult.rows.map((p) => [String(p.h3_index), p]));
      const rows = bResult.rows
        .filter((b) => {
          const p = pMap.get(String(b.h3_index));
          return p && Number(p.pop_2025) > 0 && Number(b.building_count) > 0;
        })
        .map((b) => {
          const p = pMap.get(String(b.h3_index))!;
          const pop = Number(p.pop_2025);
          const bldg = Number(b.building_count);
          return {
            ...b,
            pop_2025: pop,
            bldg_per_person: bldg / pop,
          };
        });
      return { rows, info: bResult.info };
    },
    buildQuery: (ctx) => `SELECT b.h3_index, b.building_count,
       b.avg_height_m, p.pop_2025,
       b.building_count::FLOAT / p.pop_2025 AS bldg_per_person
FROM '${buildingParquet(ctx.h3Res)}' b
JOIN '${populationParquet(ctx.h3Res)}' p USING (h3_index)
WHERE p.pop_2025 > 0 AND b.building_count > 0`,

    getFillColor: (d, range) => {
      const bpp = Number(d.bldg_per_person) || 0;
      // Invert: low bldg/person = high color value (more compressed = red)
      return interpolateColor(
        1 - normalize(bpp, range.min, range.max),
        VERTICAL_DENSITY_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.pop_2025) || 0),
    formatTooltip: (d) =>
      [
        `Bldg/Person: ${Number(d.bldg_per_person).toFixed(3)}`,
        `People/Bldg: ${(1 / Number(d.bldg_per_person)).toFixed(0)}`,
        `Buildings: ${fmt(Number(d.building_count))}`,
        `Pop 2025: ${fmt(Number(d.pop_2025))}`,
        `Avg Height: ${Number(d.avg_height_m).toFixed(1)} m`,
      ].join('\n'),
    extruded: true,
    elevationScale: 0.02,
    colorLegend: [
      { label: 'Spacious', color: 'rgb(158,202,225)' },
      { label: '1:20', color: 'rgb(253,174,97)' },
      { label: '1:50+', color: 'rgb(128,0,38)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-building-index',
    defaultH3Res: 3,
    h3ResRange: [3, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 9: Shrinking Cities — Population Decline by 2100
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'shrinking-cities',
    title: 'Shrinking Cities',
    subtitle: 'East Asia · 2025→2100',
    description:
      'Cells where population will decline under SSP2. Shrinking cities face abandoned infrastructure, aging populations, and the quiet stress of emptying neighborhoods.',
    describeData: (rows) => {
      const minRatio = rows.reduce((m, r) => {
        const v = Number(r.growth_ratio);
        return v > 0 && v < m ? v : m;
      }, Infinity);
      const totalNow = col(rows, 'pop_2025', 'sum');
      const total2100 = col(rows, 'pop_2100', 'sum');
      return `${fmt(rows.length)} cells. Steepest decline: ${minRatio === Infinity ? 'N/A' : minRatio.toFixed(2)}x. Total population: ${(totalNow / 1e9).toFixed(2)}B \u2192 ${(total2100 / 1e9).toFixed(2)}B by 2100.`;
    },
    stat: { label: 'Steepest Decline', value: '0.0x' },
    viewState: { latitude: 32, longitude: 112, zoom: 3 },
    colorColumn: 'growth_ratio',
    loadData: async (ctx, _onProgress) => {
      const result = await loadParquet(
        populationParquet(ctx.h3Res),
        ['h3_index', 'pop_2025', 'pop_2050', 'pop_2100'],
        ctx.h3Ranges
      );
      return {
        rows: result.rows
          .filter((r) => Number(r.pop_2025) >= 10)
          .map((r) => ({
            ...r,
            growth_ratio:
              Number(r.pop_2025) > 0
                ? Number(r.pop_2100) / Number(r.pop_2025)
                : null,
          })),
        info: result.info,
      };
    },
    buildQuery: (ctx) => `SELECT h3_index, pop_2025, pop_2050, pop_2100,
       pop_2100 / NULLIF(pop_2025, 0) AS growth_ratio
FROM '${populationParquet(ctx.h3Res)}'
WHERE pop_2025 >= 10`,

    getFillColor: (d, range) => {
      const ratio = Number(d.growth_ratio) || 1;
      // Invert: low ratio (declining) = red
      return interpolateColor(
        1 - normalize(ratio, range.min, range.max),
        POPULATION_GROWTH_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.pop_2025) || 0),
    formatTooltip: (d) =>
      [
        `Pop 2025: ${fmt(Number(d.pop_2025))}`,
        `Pop 2050: ${fmt(Number(d.pop_2050))}`,
        `Pop 2100: ${fmt(Number(d.pop_2100))}`,
        `Change: ${Number(d.growth_ratio).toFixed(2)}x`,
      ].join('\n'),
    extruded: true,
    elevationScale: 0.02,
    colorLegend: [
      { label: '3x Growth', color: 'rgb(49,130,189)' },
      { label: 'Stable', color: 'rgb(255,255,178)' },
      { label: '-60%', color: 'rgb(227,26,28)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices/population',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-pop-index',
    defaultH3Res: 3,
    h3ResRange: [1, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 10: Atmospheric Pressure — Sea Level Pressure Patterns
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'weather-pressure',
    title: 'Atmospheric Pressure',
    subtitle: 'AI Weather · Sea Level',
    description:
      'Mean sea level pressure from GraphCast AI. Low pressure brings storms and barometric changes. A known trigger for migraines and mood shifts. High pressure brings calm.',
    describeData: (rows) => {
      const lo = col(rows, 'pressure_msl_hPa', 'min');
      const hi = col(rows, 'pressure_msl_hPa', 'max');
      return `${fmt(rows.length)} cells. Pressure range: ${lo.toFixed(0)} to ${hi.toFixed(0)} hPa. Low pressure (\u2264${lo.toFixed(0)}) = storm systems, migraines. High pressure (\u2265${hi.toFixed(0)}) = clear skies, calm.`;
    },
    stat: { label: 'Update Frequency', value: '12 hrs' },
    viewState: { latitude: 40, longitude: -30, zoom: 1.5 },
    colorColumn: 'pressure_msl_hPa',
    loadData: async (ctx, onProgress) =>
      loadParquet(
        weatherParquet(ctx.weatherPrefix, ctx.h3Res),
        [
          'h3_index',
          'timestamp',
          'pressure_msl_hPa',
          'temperature_2m_C',
          'wind_speed_10m_ms',
        ],
        ctx.h3Ranges,
        onProgress
      ),
    buildQuery: (ctx) => `SELECT h3_index, pressure_msl_hPa,
       temperature_2m_C, wind_speed_10m_ms
FROM '${weatherParquet(ctx.weatherPrefix, ctx.h3Res)}'`,

    getFillColor: (d, range) => {
      const pressure = Number(d.pressure_msl_hPa) || 1013;
      return interpolateColor(
        normalize(pressure, range.min, range.max),
        PRESSURE_COLORS
      );
    },
    formatTooltip: (d) =>
      [
        `Pressure: ${Number(d.pressure_msl_hPa).toFixed(0)} hPa`,
        `Temp: ${Number(d.temperature_2m_C).toFixed(1)} °C`,
        `Wind: ${Number(d.wind_speed_10m_ms).toFixed(1)} m/s`,
      ].join('\n'),
    extruded: false,
    colorLegend: [
      { label: '980 hPa', color: 'rgb(103,0,31)' },
      { label: '1013', color: 'rgb(255,255,191)' },
      { label: '1040 hPa', color: 'rgb(26,152,80)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices/weather',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-weather-index',
    defaultH3Res: 1,
    h3ResRange: [1, 5],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 11: Precipitation — Rain Only (filtered)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'weather-precipitation',
    title: 'Precipitation',
    subtitle: 'AI Weather · Rain Only',
    description:
      'Accumulated precipitation (mm/6hr) from GraphCast AI with orographic correction. Only raining hexagons (>0.1 mm) are shown — dry cells hidden. Validated against Open-Meteo. Updated every 12 hours.',
    describeData: (rows) => {
      const maxPrecip = col(rows, 'precipitation_mm_6hr', 'max');
      const avgPrecip = col(rows, 'precipitation_mm_6hr', 'sum') / rows.length;
      const totalCells = rows.length;
      return `${fmt(totalCells)} raining cells shown. Heaviest: ${maxPrecip.toFixed(1)} mm/6hr. Average: ${avgPrecip.toFixed(1)} mm/6hr. Dry hexagons hidden.`;
    },
    stat: { label: 'Forecast Horizon', value: '5 days' },
    viewState: { latitude: 10, longitude: 100, zoom: 1.5 },
    colorColumn: 'precipitation_mm_6hr',
    loadData: async (ctx, onProgress) =>
      loadParquet(
        weatherParquet(ctx.weatherPrefix, ctx.h3Res),
        [
          'h3_index',
          'timestamp',
          'precipitation_mm_6hr',
          'temperature_2m_C',
          'wind_speed_10m_ms',
        ],
        ctx.h3Ranges,
        onProgress,
        { column: 'precipitation_mm_6hr', gt: 0.1 }
      ),
    buildQuery: (ctx) => `SELECT h3_index, precipitation_mm_6hr,
       temperature_2m_C, wind_speed_10m_ms
FROM '${weatherParquet(ctx.weatherPrefix, ctx.h3Res)}'
WHERE precipitation_mm_6hr > 0.1`,

    getFillColor: (d, range) => {
      const precip = Math.max(0, Number(d.precipitation_mm_6hr) || 0);
      return interpolateColor(
        normalize(precip, range.min, range.max),
        PRECIPITATION_COLORS
      );
    },
    formatTooltip: (d) => {
      const p = Number(d.precipitation_mm_6hr);
      const label = p >= 20 ? 'Heavy' : p >= 5 ? 'Moderate' : 'Light';
      return [
        `Precip: ${p.toFixed(1)} mm/6hr (${label})`,
        `Temp: ${Number(d.temperature_2m_C).toFixed(1)} °C`,
        `Wind: ${Number(d.wind_speed_10m_ms).toFixed(1)} m/s`,
      ].join('\n');
    },
    extruded: false,
    colorLegend: [
      { label: '0.1 mm', color: 'rgb(255,255,204)' },
      { label: '10 mm', color: 'rgb(65,182,196)' },
      { label: '50+ mm', color: 'rgb(37,52,148)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices/weather',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-weather-index',
    defaultH3Res: 1,
    h3ResRange: [1, 5],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 12: Terrain Slope — Global Surface Gradient
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'terrain-slope',
    title: 'Terrain Slope',
    subtitle: 'Global Surface Gradient',
    description:
      'Average slope in degrees per cell. Slope determines walkability, buildability, flood drainage, and landslide risk. The invisible topography beneath every city.',
    describeData: (rows) => {
      const maxSlope = col(rows, 'slope', 'max');
      const avgSlope = col(rows, 'slope', 'sum') / rows.length;
      return `${fmt(rows.length)} cells. Steepest: ${maxSlope.toFixed(1)}\u00B0. Average: ${avgSlope.toFixed(1)}\u00B0. Slope determines walkability, buildability, and landslide risk.`;
    },
    stat: { label: 'Steepest Cell', value: '52.5\u00B0' },
    viewState: { latitude: -15, longitude: -70, zoom: 3 },
    colorColumn: 'slope',
    loadData: async (ctx, onProgress) =>
      loadParquet(
        terrainParquet(ctx.h3Res),
        ['h3_index', 'elev', 'slope', 'aspect', 'tri'],
        ctx.h3Ranges,
        onProgress
      ),
    buildQuery: (ctx) => `SELECT h3_index, elev, slope, aspect, tri
FROM '${terrainParquet(ctx.h3Res)}'`,

    getFillColor: (d, range) => {
      const slope = Number(d.slope) || 0;
      return interpolateColor(
        normalize(slope, range.min, range.max),
        SLOPE_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.slope) || 0),
    formatTooltip: (d) =>
      [
        `Slope: ${Number(d.slope).toFixed(1)}°`,
        `Elevation: ${Number(d.elev).toFixed(0)} m`,
        `Aspect: ${Number(d.aspect).toFixed(0)}°`,
        `TRI: ${Number(d.tri).toFixed(1)}`,
      ].join('\n'),
    extruded: true,
    elevationScale: 800,
    colorLegend: [
      { label: '0°', color: 'rgb(255,255,204)' },
      { label: '15°', color: 'rgb(253,141,60)' },
      { label: '35°+', color: 'rgb(189,0,38)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/dem-terrain',
    githubUrl: 'https://github.com/walkthru-earth/dem-terrain',
    defaultH3Res: 3,
    h3ResRange: [1, 10],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 13: Terrain Ruggedness — TRI Index
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'terrain-ruggedness',
    title: 'Terrain Ruggedness',
    subtitle: 'Karakoram · TRI Index',
    description:
      'Terrain Ruggedness Index (TRI). Measuring elevation variability within each cell. High TRI means gorges, ridgelines, and cliff faces. Rugged terrain shapes accessibility and isolation.',
    describeData: (rows) => {
      const maxTri = col(rows, 'tri', 'max');
      const avgTri = col(rows, 'tri', 'sum') / rows.length;
      return `${fmt(rows.length)} cells. Max TRI: ${maxTri.toFixed(1)}. Average: ${avgTri.toFixed(1)}. High ruggedness = gorges, ridgelines, cliff faces, geographic isolation.`;
    },
    stat: { label: 'Max TRI', value: '305.4' },
    viewState: { latitude: 36, longitude: 76, zoom: 3.5 },
    colorColumn: 'tri',
    loadData: async (ctx, onProgress) =>
      loadParquet(
        terrainParquet(ctx.h3Res),
        ['h3_index', 'elev', 'slope', 'tri'],
        ctx.h3Ranges,
        onProgress
      ),
    buildQuery: (ctx) => `SELECT h3_index, elev, slope, tri
FROM '${terrainParquet(ctx.h3Res)}'`,

    getFillColor: (d, range) => {
      const tri = Number(d.tri) || 0;
      return interpolateColor(
        normalize(tri, range.min, range.max),
        RUGGEDNESS_COLORS
      );
    },
    formatTooltip: (d) =>
      [
        `TRI: ${Number(d.tri).toFixed(1)}`,
        `Slope: ${Number(d.slope).toFixed(1)}°`,
        `Elevation: ${Number(d.elev).toFixed(0)} m`,
      ].join('\n'),
    extruded: false,
    colorLegend: [
      { label: '0 (smooth)', color: 'rgb(237,248,233)' },
      { label: '150', color: 'rgb(116,196,118)' },
      { label: '300 (extreme)', color: 'rgb(0,109,44)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/dem-terrain',
    githubUrl: 'https://github.com/walkthru-earth/dem-terrain',
    defaultH3Res: 3,
    h3ResRange: [1, 10],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 14: Built Volume — Total Building Volume Per Cell
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'built-volume',
    title: 'Built Volume',
    subtitle: 'Pearl River Delta · Concrete Mass',
    description:
      'Total building volume (footprint \u00D7 height) per hexagon. The physical mass of the built environment made visible.',
    describeData: (rows) => {
      const maxVol = col(rows, 'total_volume_m3', 'max');
      const totalVol = col(rows, 'total_volume_m3', 'sum');
      const maxCov = col(rows, 'coverage_ratio', 'max');
      return `${fmt(rows.length)} cells. Largest: ${(maxVol / 1e9).toFixed(2)}B m\u00B3 in one cell. Total: ${(totalVol / 1e9).toFixed(1)}B m\u00B3. Max coverage: ${(maxCov * 100).toFixed(1)}%.`;
    },
    stat: { label: 'Max Volume', value: '13.6B m\u00B3' },
    viewState: { latitude: 23, longitude: 114, zoom: 3.5 },
    colorColumn: 'total_volume_m3',
    loadData: async (ctx, onProgress) =>
      loadParquet(
        buildingParquet(ctx.h3Res),
        [
          'h3_index',
          'building_count',
          'total_volume_m3',
          'volume_density_m3_per_km2',
          'avg_height_m',
          'coverage_ratio',
        ],
        ctx.h3Ranges,
        onProgress
      ),
    buildQuery: (ctx) => `SELECT h3_index, building_count,
       total_volume_m3, volume_density_m3_per_km2,
       avg_height_m, coverage_ratio
FROM '${buildingParquet(ctx.h3Res)}'`,

    getFillColor: (d, range) => {
      const vol = Number(d.total_volume_m3) || 0;
      return interpolateColor(
        normalize(vol, range.min, range.max),
        BUILDING_HEIGHT_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.total_volume_m3) || 0),
    formatTooltip: (d) =>
      [
        `Volume: ${(Number(d.total_volume_m3) / 1e6).toFixed(0)}M m\u00B3`,
        `Vol/km\u00B2: ${(Number(d.volume_density_m3_per_km2) / 1e6).toFixed(2)}M`,
        `Buildings: ${fmt(Number(d.building_count))}`,
        `Avg Height: ${Number(d.avg_height_m).toFixed(1)} m`,
        `Coverage: ${(Number(d.coverage_ratio) * 100).toFixed(1)}%`,
      ].join('\n'),
    extruded: true,
    elevationScale: 0.000001,
    colorLegend: [
      { label: 'Low', color: 'rgb(200,200,200)' },
      { label: 'Medium', color: 'rgb(253,184,99)' },
      { label: 'High', color: 'rgb(215,48,39)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices/building',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-building-index',
    defaultH3Res: 3,
    h3ResRange: [3, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 15: Ground Coverage — Building Footprint Ratio   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'ground-coverage',
    title: 'Ground Coverage',
    subtitle: 'Jakarta · Building Footprint',
    description:
      'What fraction of the ground is covered by buildings? High coverage means less green space, more heat retention, and less room for the nature that reduces cortisol by 21% per hour.',
    describeData: (rows) => {
      const maxCov = col(rows, 'coverage_ratio', 'max');
      const maxDensity = col(rows, 'building_density', 'max');
      const maxFp = col(rows, 'total_footprint_m2', 'max');
      return `${fmt(rows.length)} cells. Max ground coverage: ${(maxCov * 100).toFixed(1)}%. Densest: ${maxDensity.toFixed(0)}/km\u00B2. Largest footprint: ${(maxFp / 1e6).toFixed(1)}M m\u00B2.`;
    },
    stat: { label: 'Max Coverage', value: '42%' },
    viewState: { latitude: -6.3, longitude: 107, zoom: 4 },
    colorColumn: 'coverage_ratio',
    loadData: async (ctx, onProgress) =>
      loadParquet(
        buildingParquet(ctx.h3Res),
        [
          'h3_index',
          'building_count',
          'coverage_ratio',
          'total_footprint_m2',
          'avg_footprint_m2',
          'building_density',
        ],
        ctx.h3Ranges,
        onProgress
      ),
    buildQuery: (ctx) => `SELECT h3_index, building_count,
       coverage_ratio, total_footprint_m2,
       avg_footprint_m2, building_density
FROM '${buildingParquet(ctx.h3Res)}'`,

    getFillColor: (d, range) => {
      const cover = Number(d.coverage_ratio) || 0;
      return interpolateColor(
        normalize(cover, range.min, range.max),
        POPULATION_DENSITY_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.coverage_ratio) * 10000 || 0),
    formatTooltip: (d) =>
      [
        `Coverage: ${(Number(d.coverage_ratio) * 100).toFixed(1)}%`,
        `Footprint: ${(Number(d.total_footprint_m2) / 1e6).toFixed(1)}M m\u00B2`,
        `Avg Building: ${Number(d.avg_footprint_m2).toFixed(0)} m\u00B2`,
        `Buildings: ${fmt(Number(d.building_count))}`,
        `Density: ${Number(d.building_density).toFixed(0)} /km\u00B2`,
      ].join('\n'),
    extruded: true,
    elevationScale: 20,
    colorLegend: [
      { label: '0%', color: 'rgb(255,255,204)' },
      { label: '10%', color: 'rgb(253,141,60)' },
      { label: '25%+', color: 'rgb(189,0,38)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices/building',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-building-index',
    defaultH3Res: 3,
    h3ResRange: [3, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 16: Volume Per Person — Built Space Available
   * Cross-index: building volume + population
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'volume-per-person',
    title: 'Built Volume Per Person',
    subtitle: 'Kinshasa \u00B7 4.8 m\u00B3/person',
    description:
      'Total building volume divided by population. How much built space exists per person. These numbers quantify the spatial compression that shapes stress, sleep, and social behavior.',
    describeData: (rows) => {
      const minVpp = rows.reduce((m, r) => {
        const v = Number(r.vol_per_person);
        return v > 0 && v < m ? v : m;
      }, Infinity);
      const maxPop = col(rows, 'pop_2025', 'max');
      return `${fmt(rows.length)} cells. Least space: ${minVpp === Infinity ? 'N/A' : minVpp.toFixed(1)} m\u00B3/person. Most populated cell: ${fmt(Math.round(maxPop))}. Built volume \u00F7 population = the physical space each person has.`;
    },
    stat: { label: 'Min Volume', value: '0.001 m\u00B3/person' },
    viewState: { latitude: -4, longitude: 16, zoom: 4 },
    colorColumn: 'vol_per_person',
    loadData: async (ctx, _onProgress) => {
      const [bResult, pResult] = await Promise.all([
        loadParquet(
          buildingParquet(ctx.h3Res),
          ['h3_index', 'building_count', 'total_volume_m3', 'avg_height_m'],
          ctx.h3Ranges
        ),
        loadParquet(
          populationParquet(ctx.h3Res),
          ['h3_index', 'pop_2025'],
          ctx.h3Ranges
        ),
      ]);
      const pMap = new Map(pResult.rows.map((p) => [String(p.h3_index), p]));
      const rows = bResult.rows
        .filter((b) => {
          const p = pMap.get(String(b.h3_index));
          return p && Number(p.pop_2025) > 0 && Number(b.total_volume_m3) > 0;
        })
        .map((b) => {
          const p = pMap.get(String(b.h3_index))!;
          const pop = Number(p.pop_2025);
          const vol = Number(b.total_volume_m3);
          return {
            ...b,
            pop_2025: pop,
            vol_per_person: vol / pop,
          };
        });
      return { rows, info: bResult.info };
    },
    buildQuery: (ctx) => `SELECT b.h3_index, b.building_count,
       b.total_volume_m3, b.avg_height_m,
       p.pop_2025,
       b.total_volume_m3 / NULLIF(p.pop_2025, 0) AS vol_per_person
FROM '${buildingParquet(ctx.h3Res)}' b
JOIN '${populationParquet(ctx.h3Res)}' p USING (h3_index)
WHERE p.pop_2025 > 0 AND b.total_volume_m3 > 0`,

    getFillColor: (d, range) => {
      const vpp = Number(d.vol_per_person) || 0;
      // Invert: low volume/person = red (more compressed)
      return interpolateColor(
        1 - normalize(vpp, range.min, range.max),
        VERTICAL_DENSITY_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.pop_2025) || 0),
    formatTooltip: (d) =>
      [
        `Vol/Person: ${Number(d.vol_per_person).toFixed(1)} m\u00B3`,
        `Total Volume: ${(Number(d.total_volume_m3) / 1e6).toFixed(0)}M m\u00B3`,
        `Pop 2025: ${fmt(Number(d.pop_2025))}`,
        `Buildings: ${fmt(Number(d.building_count))}`,
        `Avg Height: ${Number(d.avg_height_m).toFixed(1)} m`,
      ].join('\n'),
    extruded: true,
    elevationScale: 0.02,
    colorLegend: [
      { label: 'Spacious', color: 'rgb(158,202,225)' },
      { label: '50 m\u00B3', color: 'rgb(253,174,97)' },
      { label: '<10 m\u00B3', color: 'rgb(128,0,38)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-building-index',
    defaultH3Res: 3,
    h3ResRange: [3, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 17: Places — POI Density (Overture Maps)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'places',
    title: 'Places & Amenities',
    subtitle: 'Overture Maps \u00B7 72 M POIs',
    description:
      'Every restaurant, school, hospital, park, and shop on Earth \u2014 aggregated from Overture Maps into H3 hexagons. Height = total POI count, color = Shannon diversity across 13 categories. High diversity (purple) marks self-sufficient neighborhoods; low diversity (cream) marks mono-functional zones.',
    describeData: (rows) => {
      const total = col(rows, 'place_count', 'sum');
      const maxCell = col(rows, 'place_count', 'max');
      // Compute average Shannon diversity
      let divSum = 0;
      for (const r of rows) divSum += shannonDiversity(r);
      const avgDiv = rows.length > 0 ? divSum / rows.length : 0;
      return `${fmt(rows.length)} cells, ${fmt(Math.round(total))} places. Densest cell: ${fmt(maxCell)} POIs. Avg diversity: ${avgDiv.toFixed(2)} / ${MAX_SHANNON.toFixed(2)} (Shannon H\u2032). Higher = more self-sufficient neighborhoods.`;
    },
    stat: { label: 'Total POIs', value: '72 M' },
    viewState: { latitude: 48.8, longitude: 2.3, zoom: 3.5 },
    colorColumn: 'place_count',
    loadData: async (ctx, onProgress) =>
      loadParquet(
        placesParquet(ctx.overtureRelease, ctx.h3Res),
        [
          'h3_index',
          'place_count',
          'avg_confidence',
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
          'n_restaurant',
          'n_hospital',
          'n_school',
          'n_park',
        ],
        ctx.h3Ranges,
        onProgress
      ),
    buildQuery: (ctx) => `SELECT h3_index, place_count, avg_confidence,
       n_food_and_drink, n_shopping, n_services_and_business,
       n_health_care, n_travel_and_transportation,
       n_lifestyle_services, n_education,
       n_community_and_government, n_cultural_and_historic,
       n_sports_and_recreation, n_lodging,
       n_arts_and_entertainment, n_geographic_entities,
       n_restaurant, n_hospital, n_school, n_park
FROM '${placesParquet(ctx.overtureRelease, ctx.h3Res)}'`,

    getFillColor: (d, range) => {
      const diversity = shannonDiversity(d);
      return interpolateColor(
        normalize(diversity, 0, MAX_SHANNON),
        PLACES_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.place_count) || 0),
    formatTooltip: (d) => {
      const categories: [string, number][] = [
        ['Food & Drink', Number(d.n_food_and_drink) || 0],
        ['Shopping', Number(d.n_shopping) || 0],
        ['Services', Number(d.n_services_and_business) || 0],
        ['Health', Number(d.n_health_care) || 0],
        ['Transport', Number(d.n_travel_and_transportation) || 0],
        ['Lifestyle', Number(d.n_lifestyle_services) || 0],
        ['Education', Number(d.n_education) || 0],
        ['Community', Number(d.n_community_and_government) || 0],
        ['Culture', Number(d.n_cultural_and_historic) || 0],
        ['Sports & Rec', Number(d.n_sports_and_recreation) || 0],
        ['Lodging', Number(d.n_lodging) || 0],
        ['Arts', Number(d.n_arts_and_entertainment) || 0],
        ['Geographic', Number(d.n_geographic_entities) || 0],
      ];
      const present = categories.filter(([, v]) => v > 0);
      const diversity = shannonDiversity(d);
      const top = present
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([k, v]) => `  ${k}: ${fmt(v)}`)
        .join('\n');
      return [
        `Places: ${fmt(Number(d.place_count))}`,
        `Diversity: ${diversity.toFixed(2)} / ${MAX_SHANNON.toFixed(2)} (${present.length}/13 categories)`,
        top ? `Top categories:\n${top}` : null,
        Number(d.n_restaurant) > 0
          ? `Restaurants: ${fmt(Number(d.n_restaurant))}`
          : null,
        Number(d.n_park) > 0 ? `Parks: ${fmt(Number(d.n_park))}` : null,
      ]
        .filter(Boolean)
        .join('\n');
    },
    extruded: true,
    elevationScale: 0.5,
    colorLegend: [
      { label: 'Mono', color: 'rgb(252,235,211)' },
      { label: 'Mixed', color: 'rgb(220,73,86)' },
      { label: 'Diverse', color: 'rgb(106,23,134)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-overture-index',
    defaultH3Res: 4,
    h3ResRange: [1, 10],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 18: Walkability Index
   * Cross-index: transport + base + terrain + places
   * 5 signals across 4 indices
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'walkability',
    title: 'Walkability Index',
    subtitle: '5 Signals \u00B7 4 Indices',
    description:
      'Can you walk here comfortably and usefully? Five signals: (1) road type ratio \u2014 footways, cycleways, paths vs motorways and arterials; (2) pedestrian infrastructure \u2014 crosswalks, sidewalks, signals from base environment; (3) barrier penalty \u2014 fences, walls, gates that block movement; (4) terrain slope \u2014 steep = hard to walk; (5) destination density \u2014 a walkable road to nowhere isn\u2019t walkable. Height = total road segments.',
    describeData: (rows) => {
      let scoreSum = 0;
      let count = 0;
      for (const r of rows) {
        const s = Number(r.walk_score) || 0;
        if (Number(r.segment_count) > 0) {
          scoreSum += s;
          count++;
        }
      }
      const avg = count > 0 ? scoreSum / count : 0;
      const totalSegs = col(rows, 'segment_count', 'sum');
      return `${fmt(rows.length)} cells, ${fmt(Math.round(totalSegs))} segments. Avg walkability score: ${(avg * 100).toFixed(1)}%. Combines road types, pedestrian infra, barriers, terrain, and destinations.`;
    },
    stat: { label: 'Total Segments', value: '343 M' },
    viewState: { latitude: 52.5, longitude: 13.4, zoom: 3.5 },
    colorColumn: 'walk_score',
    loadData: async (ctx, _onProgress) => {
      const [trResult, baResult, teResult, plResult] = await Promise.all([
        loadParquet(
          transportParquet(ctx.overtureRelease, ctx.h3Res),
          [
            'h3_index',
            'segment_count',
            'n_road',
            'n_rail',
            ...HUMAN_SCALE_KEYS,
            ...CAR_SCALE_KEYS,
            'n_bridge',
            'n_tunnel',
            'n_paved',
            'n_unpaved',
          ],
          ctx.h3Ranges
        ),
        loadParquet(
          baseParquet(ctx.overtureRelease, ctx.h3Res),
          ['h3_index', 'n_pedestrian', 'n_barrier'],
          ctx.h3Ranges
        ),
        loadParquet(
          terrainParquet(ctx.h3Res),
          ['h3_index', 'avg_slope_deg'],
          ctx.h3Ranges
        ),
        loadParquet(
          placesParquet(ctx.overtureRelease, ctx.h3Res),
          ['h3_index', 'place_count'],
          ctx.h3Ranges
        ),
      ]);

      const baMap = new Map(baResult.rows.map((r) => [String(r.h3_index), r]));
      const teMap = new Map(teResult.rows.map((r) => [String(r.h3_index), r]));
      const plMap = new Map(plResult.rows.map((r) => [String(r.h3_index), r]));

      // Maxima for normalization
      let maxPedInfra = 1;
      let maxBarrier = 1;
      let maxPlaces = 1;
      for (const r of baResult.rows) {
        const p = Number(r.n_pedestrian) || 0;
        if (p > maxPedInfra) maxPedInfra = p;
        const b = Number(r.n_barrier) || 0;
        if (b > maxBarrier) maxBarrier = b;
      }
      for (const r of plResult.rows) {
        const p = Number(r.place_count) || 0;
        if (p > maxPlaces) maxPlaces = p;
      }

      const rows = trResult.rows
        .filter((tr) => Number(tr.segment_count) > 0)
        .map((tr) => {
          const key = String(tr.h3_index);
          const ba = baMap.get(key);
          const te = teMap.get(key);
          const pl = plMap.get(key);

          // 1. Road type ratio: human-scale / (human + car) [0, 1]
          const roadRatio = walkabilityRatio(tr);

          // 2. Pedestrian infra: crosswalks, sidewalks (log-normalized) [0, 1]
          const pedRaw = ba ? Number(ba.n_pedestrian) || 0 : 0;
          const pedScore =
            pedRaw > 0
              ? Math.min(1, Math.log1p(pedRaw) / Math.log1p(maxPedInfra))
              : 0;

          // 3. Barrier penalty: walls/fences that block movement
          //    More barriers = less walkable. Invert: 1 = no barriers, 0 = many barriers
          const barrierRaw = ba ? Number(ba.n_barrier) || 0 : 0;
          const barrierPenalty =
            barrierRaw > 0
              ? 1 - Math.min(1, Math.log1p(barrierRaw) / Math.log1p(maxBarrier))
              : 1;

          // 4. Terrain: flat = walkable, steep = not [0, 1]
          const slope = te ? Number(te.avg_slope_deg) || 0 : 0;
          const slopeFactor = Math.max(0, 1 - slope / 15);

          // 5. Destination density: places per cell (log-normalized) [0, 1]
          const placesRaw = pl ? Number(pl.place_count) || 0 : 0;
          const destScore =
            placesRaw > 0
              ? Math.min(1, Math.log1p(placesRaw) / Math.log1p(maxPlaces))
              : 0;

          // Composite: 35% road type + 15% ped infra + 10% barriers + 15% terrain + 25% destinations
          const walkScore =
            0.35 * roadRatio +
            0.15 * pedScore +
            0.1 * barrierPenalty +
            0.15 * slopeFactor +
            0.25 * destScore;

          const human = sumKeys(tr, HUMAN_SCALE_KEYS);
          const car = sumKeys(tr, CAR_SCALE_KEYS);

          return {
            h3_index: tr.h3_index,
            walk_score: walkScore,
            road_ratio: roadRatio,
            ped_score: pedScore,
            ped_count: pedRaw,
            barrier_penalty: barrierPenalty,
            barrier_count: barrierRaw,
            slope_factor: slopeFactor,
            slope_deg: slope,
            dest_score: destScore,
            place_count: placesRaw,
            segment_count: tr.segment_count,
            human_count: human,
            car_count: car,
            n_rail: tr.n_rail,
            n_bridge: tr.n_bridge,
            n_tunnel: tr.n_tunnel,
            n_paved: tr.n_paved,
            n_unpaved: tr.n_unpaved,
          };
        });

      return { rows, info: trResult.info };
    },
    buildQuery: (ctx) => `-- Walkability Index (5-signal composite)
SELECT tr.h3_index, tr.segment_count, tr.n_road, tr.n_rail,
       tr.n_footway, tr.n_pedestrian, tr.n_cycleway, tr.n_path,
       tr.n_motorway, tr.n_trunk, tr.n_primary, tr.n_secondary,
       tr.n_bridge, tr.n_tunnel, tr.n_paved, tr.n_unpaved,
       ba.n_pedestrian AS ped_infra, ba.n_barrier,
       te.avg_slope_deg,
       pl.place_count
FROM '${transportParquet(ctx.overtureRelease, ctx.h3Res)}' tr
LEFT JOIN '${baseParquet(ctx.overtureRelease, ctx.h3Res)}' ba USING (h3_index)
LEFT JOIN '${terrainParquet(ctx.h3Res)}' te USING (h3_index)
LEFT JOIN '${placesParquet(ctx.overtureRelease, ctx.h3Res)}' pl USING (h3_index)
WHERE tr.segment_count > 0`,

    getFillColor: (d) => {
      const s = Number(d.walk_score) || 0;
      return interpolateColor(s, WALKABILITY_COLORS);
    },
    getElevation: (d) => Math.max(0, Number(d.segment_count) || 0),
    formatTooltip: (d) => {
      const s = Number(d.walk_score) || 0;
      const label =
        s >= 0.7
          ? 'Highly Walkable'
          : s >= 0.5
            ? 'Walkable'
            : s >= 0.3
              ? 'Car-Leaning'
              : 'Car-Dominated';
      const paved = Number(d.n_paved) || 0;
      const unpaved = Number(d.n_unpaved) || 0;
      const pavedPct =
        paved + unpaved > 0
          ? ((paved / (paved + unpaved)) * 100).toFixed(0)
          : '\u2014';
      return [
        `Walkability: ${(s * 100).toFixed(1)}% (${label})`,
        `Signals:`,
        `  Road Types: ${(Number(d.road_ratio) * 100).toFixed(0)}% human-scale (${fmt(Number(d.human_count))} vs ${fmt(Number(d.car_count))} car)`,
        `  Ped Infra: ${(Number(d.ped_score) * 100).toFixed(0)}% (${fmt(Number(d.ped_count))} crosswalks/sidewalks)`,
        `  Barriers: ${(Number(d.barrier_penalty) * 100).toFixed(0)}% open (${fmt(Number(d.barrier_count))} walls/fences)`,
        `  Terrain: ${Number(d.slope_deg).toFixed(1)}\u00B0 (${(Number(d.slope_factor) * 100).toFixed(0)}% flat)`,
        `  Destinations: ${(Number(d.dest_score) * 100).toFixed(0)}% (${fmt(Number(d.place_count))} places)`,
        `Segments: ${fmt(Number(d.segment_count))} \u00B7 Paved: ${pavedPct}%`,
        Number(d.n_rail) > 0 ? `Rail: ${fmt(Number(d.n_rail))}` : null,
        Number(d.n_bridge) > 0 ? `Bridges: ${fmt(Number(d.n_bridge))}` : null,
      ]
        .filter(Boolean)
        .join('\n');
    },
    extruded: true,
    elevationScale: 0.005,
    colorLegend: [
      { label: 'Car', color: 'rgb(189,0,38)' },
      { label: 'Mixed', color: 'rgb(254,217,118)' },
      { label: 'Walkable', color: 'rgb(0,104,55)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-overture-index',
    defaultH3Res: 4,
    h3ResRange: [3, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 19: 15-Minute City Score
   * Cross-index: places + transportation + terrain + base
   * 7 signals across 4 indices
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'fifteen-min-city',
    title: '15-Minute City Score',
    subtitle: '7 Signals \u00B7 4 Indices',
    description:
      'Carlos Moreno\u2019s 15-minute city: living, working, commerce, healthcare, education, and recreation \u2014 all reachable by foot or bike. Seven signals: (1) amenity diversity, (2) essential services completeness \u2014 penalizes cells missing healthcare, education, food, or shopping, (3) walkability ratio, (4) cycling infrastructure, (5) transit density, (6) green space access, (7) terrain flatness.',
    describeData: (rows) => {
      let scoreSum = 0;
      let best = 0;
      let perfectEssentials = 0;
      for (const r of rows) {
        const s = Number(r.city15_score) || 0;
        scoreSum += s;
        if (s > best) best = s;
        if (Number(r.essentials_score) === 1) perfectEssentials++;
      }
      const avg = rows.length > 0 ? scoreSum / rows.length : 0;
      const essPct =
        rows.length > 0
          ? ((perfectEssentials / rows.length) * 100).toFixed(0)
          : '0';
      return `${fmt(rows.length)} cells. Avg score: ${(avg * 100).toFixed(1)}%. Best: ${(best * 100).toFixed(1)}%. ${essPct}% of cells have all 4 essential services (health, education, food, shopping).`;
    },
    stat: { label: 'Signals', value: '7' },
    viewState: { latitude: 48.8, longitude: 2.3, zoom: 4 },
    colorColumn: 'city15_score',
    loadData: async (ctx, _onProgress) => {
      const [plResult, trResult, teResult, baResult] = await Promise.all([
        loadParquet(
          placesParquet(ctx.overtureRelease, ctx.h3Res),
          [
            'h3_index',
            'place_count',
            ...PLACES_CATEGORIES,
            'n_restaurant',
            'n_hospital',
            'n_school',
            'n_park',
          ],
          ctx.h3Ranges
        ),
        loadParquet(
          transportParquet(ctx.overtureRelease, ctx.h3Res),
          [
            'h3_index',
            'segment_count',
            ...HUMAN_SCALE_KEYS,
            ...CAR_SCALE_KEYS,
            'n_cycleway',
          ],
          ctx.h3Ranges
        ),
        loadParquet(
          terrainParquet(ctx.h3Res),
          ['h3_index', 'avg_slope_deg'],
          ctx.h3Ranges
        ),
        loadParquet(
          baseParquet(ctx.overtureRelease, ctx.h3Res),
          [
            'h3_index',
            'n_transit',
            'n_pedestrian',
            'n_lu_park',
            'n_lu_recreation',
          ],
          ctx.h3Ranges
        ),
      ]);

      const trMap = new Map(trResult.rows.map((r) => [String(r.h3_index), r]));
      const teMap = new Map(teResult.rows.map((r) => [String(r.h3_index), r]));
      const baMap = new Map(baResult.rows.map((r) => [String(r.h3_index), r]));

      // Maxima for log-normalization
      let maxTransit = 1;
      let maxCycleway = 1;
      let maxGreen = 1;
      for (const r of baResult.rows) {
        const t = Number(r.n_transit) || 0;
        if (t > maxTransit) maxTransit = t;
        const g = (Number(r.n_lu_park) || 0) + (Number(r.n_lu_recreation) || 0);
        if (g > maxGreen) maxGreen = g;
      }
      for (const r of trResult.rows) {
        const c = Number(r.n_cycleway) || 0;
        if (c > maxCycleway) maxCycleway = c;
      }

      const rows = plResult.rows
        .filter((pl) => {
          const key = String(pl.h3_index);
          return trMap.has(key) && Number(pl.place_count) > 0;
        })
        .map((pl) => {
          const key = String(pl.h3_index);
          const tr = trMap.get(key)!;
          const te = teMap.get(key);
          const ba = baMap.get(key);

          // 1. Amenity diversity: Shannon H' normalized [0, 1]
          const diversity = shannonDiversity(pl) / MAX_SHANNON;

          // 2. Essential services completeness [0, 1]
          //    Must have: healthcare, education, food & drink, shopping
          const hasHealth = (Number(pl.n_health_care) || 0) > 0 ? 1 : 0;
          const hasEducation = (Number(pl.n_education) || 0) > 0 ? 1 : 0;
          const hasFood = (Number(pl.n_food_and_drink) || 0) > 0 ? 1 : 0;
          const hasShopping = (Number(pl.n_shopping) || 0) > 0 ? 1 : 0;
          const essentials =
            (hasHealth + hasEducation + hasFood + hasShopping) / 4;

          // 3. Walkability: human-scale vs car-scale [0, 1]
          const walk = walkabilityRatio(tr);

          // 4. Cycling infra: log-normalized [0, 1]
          const cycleRaw = Number(tr.n_cycleway) || 0;
          const cycleScore =
            cycleRaw > 0
              ? Math.min(1, Math.log1p(cycleRaw) / Math.log1p(maxCycleway))
              : 0;

          // 5. Transit density: log-normalized [0, 1]
          const transitRaw = ba ? Number(ba.n_transit) || 0 : 0;
          const transitScore =
            transitRaw > 0
              ? Math.min(1, Math.log1p(transitRaw) / Math.log1p(maxTransit))
              : 0;

          // 6. Green space access: parks + recreation, log-normalized [0, 1]
          const greenRaw = ba
            ? (Number(ba.n_lu_park) || 0) + (Number(ba.n_lu_recreation) || 0)
            : 0;
          const greenScore =
            greenRaw > 0
              ? Math.min(1, Math.log1p(greenRaw) / Math.log1p(maxGreen))
              : 0;

          // 7. Terrain flatness: flat (0°) = 1.0, steep (15°+) = 0.0
          const slope = te ? Number(te.avg_slope_deg) || 0 : 0;
          const slopeFactor = Math.max(0, 1 - slope / 15);

          // Composite — weighted by Moreno's framework priorities:
          // 20% diversity + 15% essentials + 20% walkability + 10% cycling
          // + 15% transit + 10% green space + 10% terrain
          const score =
            0.2 * diversity +
            0.15 * essentials +
            0.2 * walk +
            0.1 * cycleScore +
            0.15 * transitScore +
            0.1 * greenScore +
            0.1 * slopeFactor;

          return {
            h3_index: pl.h3_index,
            city15_score: score,
            place_count: pl.place_count,
            diversity,
            essentials_score: essentials,
            essentials_of_4: hasHealth + hasEducation + hasFood + hasShopping,
            walkability: walk,
            cycle_score: cycleScore,
            cycle_count: cycleRaw,
            transit_score: transitScore,
            transit_count: transitRaw,
            green_score: greenScore,
            green_count: greenRaw,
            slope_factor: slopeFactor,
            slope_deg: slope,
            segment_count: tr.segment_count,
          };
        });

      return { rows, info: plResult.info };
    },
    buildQuery: (
      ctx
    ) => `-- 15-Minute City (7-signal composite across 4 indices)
SELECT pl.h3_index, pl.place_count,
       pl.n_health_care, pl.n_education, pl.n_food_and_drink, pl.n_shopping,
       tr.segment_count, tr.n_cycleway,
       te.avg_slope_deg,
       ba.n_transit, ba.n_lu_park, ba.n_lu_recreation
FROM '${placesParquet(ctx.overtureRelease, ctx.h3Res)}' pl
JOIN '${transportParquet(ctx.overtureRelease, ctx.h3Res)}' tr USING (h3_index)
LEFT JOIN '${terrainParquet(ctx.h3Res)}' te USING (h3_index)
LEFT JOIN '${baseParquet(ctx.overtureRelease, ctx.h3Res)}' ba USING (h3_index)
WHERE pl.place_count > 0`,

    getFillColor: (d, range) => {
      const score = Number(d.city15_score) || 0;
      return interpolateColor(
        normalize(score, range.min, range.max),
        WALKABILITY_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.place_count) || 0),
    formatTooltip: (d) => {
      const score = Number(d.city15_score) || 0;
      const ess = Number(d.essentials_of_4) || 0;
      const grade =
        score >= 0.7
          ? 'A \u2014 Excellent'
          : score >= 0.5
            ? 'B \u2014 Good'
            : score >= 0.3
              ? 'C \u2014 Fair'
              : 'D \u2014 Car-dependent';
      const missing: string[] = [];
      if (ess < 4) {
        if (!((Number(d.essentials_score) || 0) >= 1)) {
          // Re-check which are missing from raw data — we don't store individual flags,
          // but essentials_of_4 tells us the count
          missing.push(
            `${4 - ess} essential service${4 - ess > 1 ? 's' : ''} missing`
          );
        }
      }
      return [
        `15-Min Score: ${(score * 100).toFixed(1)}% (${grade})`,
        `Amenity Diversity: ${(Number(d.diversity) * 100).toFixed(0)}%`,
        `Essentials: ${ess}/4${missing.length ? ` \u2014 ${missing[0]}` : ' \u2714'}`,
        `Walkability: ${(Number(d.walkability) * 100).toFixed(0)}%`,
        `Cycling: ${(Number(d.cycle_score) * 100).toFixed(0)}% (${fmt(Number(d.cycle_count))} cycleways)`,
        `Transit: ${(Number(d.transit_score) * 100).toFixed(0)}% (${fmt(Number(d.transit_count))} stops)`,
        `Green Space: ${(Number(d.green_score) * 100).toFixed(0)}% (${fmt(Number(d.green_count))} parks/rec)`,
        `Terrain: ${Number(d.slope_deg).toFixed(1)}\u00B0 (${(Number(d.slope_factor) * 100).toFixed(0)}% flat)`,
        `Places: ${fmt(Number(d.place_count))} \u00B7 Segments: ${fmt(Number(d.segment_count))}`,
      ].join('\n');
    },
    extruded: true,
    elevationScale: 0.5,
    colorLegend: [
      { label: 'D: Car-dep.', color: 'rgb(189,0,38)' },
      { label: 'B: Good', color: 'rgb(254,217,118)' },
      { label: 'A: Excellent', color: 'rgb(0,104,55)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-overture-index',
    defaultH3Res: 4,
    h3ResRange: [3, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 20: Biophilic Index — Nature Access per Capita
   * Cross-index: base (nature + water) + population
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'biophilic',
    title: 'Biophilic Index',
    subtitle: 'Nature Access \u00D7 Population',
    description:
      'How much nature surrounds each person? Parks, recreation, protected areas, agriculture, and water bodies divided by population. Research shows 120 min/week in nature reduces cortisol 21%. Green = abundant nature per person. Magenta = nature-deprived. Height = population \u2014 tall magenta hexagons are the most nature-starved communities on Earth.',
    describeData: (rows) => {
      let avgRatio = 0;
      let minNpc = Infinity;
      for (const r of rows) {
        avgRatio += Number(r.nature_ratio) || 0;
        const npc = Number(r.nature_per_capita) || 0;
        if (npc > 0 && npc < minNpc) minNpc = npc;
      }
      avgRatio = rows.length > 0 ? avgRatio / rows.length : 0;
      return `${fmt(rows.length)} cells. Avg nature ratio: ${(avgRatio * 100).toFixed(0)}%. Most nature-deprived: ${minNpc === Infinity ? 'N/A' : minNpc.toFixed(3)} features/person. Combines parks, water, agriculture, protected areas vs urban infrastructure.`;
    },
    stat: { label: 'Nature Features', value: '118 M' },
    viewState: { latitude: 30, longitude: 31, zoom: 3.5 },
    colorColumn: 'nature_per_capita',
    loadData: async (ctx, _onProgress) => {
      const [baResult, popResult] = await Promise.all([
        loadParquet(
          baseParquet(ctx.overtureRelease, ctx.h3Res),
          [
            'h3_index',
            'infra_count',
            ...NATURE_KEYS,
            ...WATER_KEYS,
            ...URBAN_KEYS,
            'water_count',
          ],
          ctx.h3Ranges
        ),
        loadParquet(
          populationParquet(ctx.h3Res),
          ['h3_index', 'pop_2025'],
          ctx.h3Ranges
        ),
      ]);

      const popMap = new Map(
        popResult.rows.map((r) => [String(r.h3_index), r])
      );

      const rows = baResult.rows
        .filter((ba) => {
          const pop = popMap.get(String(ba.h3_index));
          return pop && Number(pop.pop_2025) > 0;
        })
        .map((ba) => {
          const pop = popMap.get(String(ba.h3_index))!;
          const population = Number(pop.pop_2025);
          const nature = sumKeys(ba, NATURE_KEYS) + sumKeys(ba, WATER_KEYS);
          const nr = natureRatio(ba);
          const npc = nature / population;

          return {
            h3_index: ba.h3_index,
            nature_per_capita: npc,
            nature_ratio: nr,
            nature_count: nature,
            water_count: sumKeys(ba, WATER_KEYS),
            park_count:
              (Number(ba.n_lu_park) || 0) + (Number(ba.n_lu_recreation) || 0),
            pop_2025: population,
          };
        });

      return { rows, info: baResult.info };
    },
    buildQuery: (ctx) => `-- Biophilic Index: nature features per capita
SELECT ba.h3_index,
       (ba.n_lu_park + ba.n_lu_recreation + ba.n_lu_protected
        + ba.n_lu_agriculture + ba.n_lu_horticulture
        + ba.water_count) AS nature_count,
       p.pop_2025,
       nature_count::FLOAT / NULLIF(p.pop_2025, 0) AS nature_per_capita
FROM '${baseParquet(ctx.overtureRelease, ctx.h3Res)}' ba
JOIN '${populationParquet(ctx.h3Res)}' p USING (h3_index)
WHERE p.pop_2025 > 0`,

    getFillColor: (d, range) => {
      const npc = Number(d.nature_per_capita) || 0;
      // Log scale for better distribution
      const logNpc = npc > 0 ? Math.log1p(npc * 1000) : 0;
      const logMax = Math.log1p(range.max * 1000);
      return interpolateColor(normalize(logNpc, 0, logMax), BIOPHILIC_COLORS);
    },
    getElevation: (d) => Math.max(0, Number(d.pop_2025) || 0),
    formatTooltip: (d) => {
      const npc = Number(d.nature_per_capita) || 0;
      const nr = Number(d.nature_ratio) || 0;
      const label =
        nr >= 0.7
          ? 'Nature-rich'
          : nr >= 0.4
            ? 'Balanced'
            : nr >= 0.15
              ? 'Nature-poor'
              : 'Nature-deprived';
      return [
        `Nature/Person: ${npc.toFixed(3)} features (${label})`,
        `Nature Ratio: ${(nr * 100).toFixed(0)}% of mapped features`,
        `Nature Features: ${fmt(Number(d.nature_count))}`,
        `  Water: ${fmt(Number(d.water_count))}`,
        `  Parks & Rec: ${fmt(Number(d.park_count))}`,
        `Population: ${fmt(Number(d.pop_2025))}`,
      ].join('\n');
    },
    extruded: true,
    elevationScale: 0.02,
    colorLegend: [
      { label: 'Deprived', color: 'rgb(158,1,66)' },
      { label: 'Balanced', color: 'rgb(230,245,152)' },
      { label: 'Nature-rich', color: 'rgb(0,104,55)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-overture-index',
    defaultH3Res: 4,
    h3ResRange: [3, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 21: Urban Heat Vulnerability
   * Cross-index: building (volume + coverage) + transport (paved) +
   *              base (nature deficit) + weather (temp + wind)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'heat-vulnerability',
    title: 'Urban Heat Vulnerability',
    subtitle:
      '6 Indices \u00B7 Concrete \u00D7 Asphalt \u00D7 Nature \u00D7 Weather',
    description:
      'Where urban heat islands form. Six physical signals: (1) building volume \u2014 concrete thermal mass absorbs and re-radiates heat; (2) ground coverage \u2014 sealed surface blocks evapotranspiration; (3) paved roads \u2014 asphalt absorbs solar radiation and creates urban canyons; (4) nature deficit \u2014 no trees, parks, agriculture, or water for cooling; (5) air temperature; (6) low wind \u2014 stagnant air traps heat. Height = building volume.',
    describeData: (rows) => {
      let avgScore = 0;
      let maxScore = 0;
      for (const r of rows) {
        const s = Number(r.heat_vuln) || 0;
        avgScore += s;
        if (s > maxScore) maxScore = s;
      }
      avgScore = rows.length > 0 ? avgScore / rows.length : 0;
      return `${fmt(rows.length)} cells. Avg heat vulnerability: ${(avgScore * 100).toFixed(0)}%. Worst cell: ${(maxScore * 100).toFixed(0)}%. Six signals: building volume, ground seal, pavement, nature deficit, temperature, stagnant air.`;
    },
    stat: { label: 'Risk Factors', value: '6' },
    viewState: { latitude: 25, longitude: 55, zoom: 3 },
    colorColumn: 'heat_vuln',
    loadData: async (ctx, _onProgress) => {
      const [baResult, bldResult, trResult, wxResult] = await Promise.all([
        loadParquet(
          baseParquet(ctx.overtureRelease, ctx.h3Res),
          [
            'h3_index',
            'infra_count',
            ...NATURE_KEYS,
            ...WATER_KEYS,
            ...URBAN_KEYS,
          ],
          ctx.h3Ranges
        ),
        loadParquet(
          buildingParquet(ctx.h3Res),
          [
            'h3_index',
            'building_count',
            'building_density',
            'total_volume_m3',
            'coverage_ratio',
          ],
          ctx.h3Ranges
        ),
        loadParquet(
          transportParquet(ctx.overtureRelease, ctx.h3Res),
          ['h3_index', 'segment_count', 'n_paved', 'n_unpaved'],
          ctx.h3Ranges
        ),
        loadParquet(
          weatherParquet(ctx.weatherPrefix, ctx.h3Res),
          ['h3_index', 'temperature_2m_C', 'wind_speed_10m_ms'],
          ctx.h3Ranges
        ),
      ]);

      const baMap = new Map(baResult.rows.map((r) => [String(r.h3_index), r]));
      const trMap = new Map(trResult.rows.map((r) => [String(r.h3_index), r]));
      const wxMap = new Map(wxResult.rows.map((r) => [String(r.h3_index), r]));

      // Find maxima for log-normalization
      let maxVolume = 1;
      for (const r of bldResult.rows) {
        const v = Number(r.total_volume_m3) || 0;
        if (v > maxVolume) maxVolume = v;
      }

      const rows = bldResult.rows
        .filter((b) => Number(b.building_density) > 0)
        .map((b) => {
          const key = String(b.h3_index);
          const ba = baMap.get(key);
          const tr = trMap.get(key);
          const wx = wxMap.get(key);

          // 1. Building volume (thermal mass): log-normalized [0, 1]
          const volume = Number(b.total_volume_m3) || 0;
          const volumeScore = Math.min(
            1,
            Math.log1p(volume) / Math.log1p(maxVolume)
          );

          // 2. Ground coverage (sealed surface): already [0, 1]
          const coverageScore = Math.min(1, Number(b.coverage_ratio) || 0);

          // 3. Paved road ratio: paved / (paved + unpaved), [0, 1]
          const paved = tr ? Number(tr.n_paved) || 0 : 0;
          const unpaved = tr ? Number(tr.n_unpaved) || 0 : 0;
          const pavedScore =
            paved + unpaved > 0 ? paved / (paved + unpaved) : 0;

          // 4. Nature deficit: 1 = no nature (bad), 0 = all nature (good)
          const invNature = ba ? 1 - natureRatio(ba) : 0.5;

          // 5. Temperature: normalize 15°C=0 to 45°C=1
          const temp = wx ? Number(wx.temperature_2m_C) || 0 : 20;
          const tempScore = Math.max(0, Math.min(1, (temp - 15) / 30));

          // 6. Low wind (stagnant air): calm=1, windy=0
          const wind = wx ? Number(wx.wind_speed_10m_ms) || 0 : 3;
          const calmScore = Math.max(0, 1 - wind / 10);

          // Composite: weighted by physical impact on heat islands
          // 20% volume + 15% coverage + 15% pavement + 20% nature + 20% temp + 10% calm
          const heatVuln =
            0.2 * volumeScore +
            0.15 * coverageScore +
            0.15 * pavedScore +
            0.2 * invNature +
            0.2 * tempScore +
            0.1 * calmScore;

          return {
            h3_index: b.h3_index,
            heat_vuln: heatVuln,
            building_count: b.building_count,
            total_volume_m3: volume,
            volume_score: volumeScore,
            coverage_ratio: Number(b.coverage_ratio) || 0,
            coverage_score: coverageScore,
            paved_score: pavedScore,
            paved_count: paved,
            nature_deficit: invNature,
            temp_c: temp,
            temp_score: tempScore,
            wind_ms: wind,
            calm_score: calmScore,
          };
        });

      return { rows, info: bldResult.info };
    },
    buildQuery: (ctx) => `-- Urban Heat Vulnerability (6-signal composite)
SELECT b.h3_index, b.building_count, b.total_volume_m3,
       b.coverage_ratio, b.building_density,
       tr.n_paved, tr.n_unpaved,
       w.temperature_2m_C, w.wind_speed_10m_ms
FROM '${buildingParquet(ctx.h3Res)}' b
LEFT JOIN '${transportParquet(ctx.overtureRelease, ctx.h3Res)}' tr USING (h3_index)
LEFT JOIN '${weatherParquet(ctx.weatherPrefix, ctx.h3Res)}' w USING (h3_index)
LEFT JOIN '${baseParquet(ctx.overtureRelease, ctx.h3Res)}' ba USING (h3_index)
WHERE b.building_density > 0`,

    getFillColor: (d, range) => {
      const v = Number(d.heat_vuln) || 0;
      return interpolateColor(
        normalize(v, range.min, range.max),
        HEAT_VULN_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.total_volume_m3) || 0),
    formatTooltip: (d) => {
      const v = Number(d.heat_vuln) || 0;
      const label =
        v >= 0.7
          ? 'Extreme Risk'
          : v >= 0.5
            ? 'High Risk'
            : v >= 0.3
              ? 'Moderate'
              : 'Low Risk';
      return [
        `Heat Vulnerability: ${(v * 100).toFixed(0)}% (${label})`,
        `Signals:`,
        `  Concrete Mass: ${(Number(d.volume_score) * 100).toFixed(0)}% (${(Number(d.total_volume_m3) / 1e6).toFixed(1)}M m\u00B3)`,
        `  Ground Seal: ${(Number(d.coverage_score) * 100).toFixed(0)}% (${(Number(d.coverage_ratio) * 100).toFixed(1)}% covered)`,
        `  Pavement: ${(Number(d.paved_score) * 100).toFixed(0)}% paved (${fmt(Number(d.paved_count))} segments)`,
        `  Nature Deficit: ${(Number(d.nature_deficit) * 100).toFixed(0)}%`,
        `  Temperature: ${Number(d.temp_c).toFixed(1)}\u00B0C`,
        `  Calm Air: ${(Number(d.calm_score) * 100).toFixed(0)}% (wind ${Number(d.wind_ms).toFixed(1)} m/s)`,
        `Buildings: ${fmt(Number(d.building_count))}`,
      ].join('\n');
    },
    extruded: true,
    elevationScale: 0.000001,
    colorLegend: [
      { label: 'Low', color: 'rgb(255,255,204)' },
      { label: 'Moderate', color: 'rgb(253,141,60)' },
      { label: 'Extreme', color: 'rgb(189,0,38)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-overture-index',
    defaultH3Res: 3,
    h3ResRange: [3, 8],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 22: Water Security Score
   * Cross-index: base (water + infra) + population + weather + building + terrain
   * 6 signals across 5 indices
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'water-security',
    title: 'Water Security',
    subtitle: '6 Signals \u00B7 5 Indices',
    description:
      'Where is water scarce relative to people? Six signals: (1) natural water per capita \u2014 rivers, lakes, streams; (2) engineered water infra \u2014 treatment plants, pipes, reservoirs; (3) precipitation; (4) ground permeability \u2014 sealed concrete prevents aquifer recharge; (5) terrain slope \u2014 steep = runoff, flat = retention; (6) population growth pressure 2025\u21922050. Red = crisis. Blue = secure.',
    describeData: (rows) => {
      let avgScore = 0;
      let worstScore = 1;
      for (const r of rows) {
        const s = Number(r.water_score) || 0;
        avgScore += s;
        if (s < worstScore) worstScore = s;
      }
      avgScore = rows.length > 0 ? avgScore / rows.length : 0;
      return `${fmt(rows.length)} cells. Avg water security: ${(avgScore * 100).toFixed(0)}%. Most stressed: ${(worstScore * 100).toFixed(0)}%. Six signals: natural water, engineered infra, rainfall, permeability, terrain, and growth pressure.`;
    },
    stat: { label: 'Signals', value: '6' },
    viewState: { latitude: 15, longitude: 45, zoom: 2.5 },
    colorColumn: 'water_score',
    loadData: async (ctx, _onProgress) => {
      const [baResult, popResult, wxResult, bldResult, teResult] =
        await Promise.all([
          loadParquet(
            baseParquet(ctx.overtureRelease, ctx.h3Res),
            ['h3_index', 'water_count', ...WATER_KEYS, 'n_water_infra'],
            ctx.h3Ranges
          ),
          loadParquet(
            populationParquet(ctx.h3Res),
            ['h3_index', 'pop_2025', 'pop_2050'],
            ctx.h3Ranges
          ),
          loadParquet(
            weatherParquet(ctx.weatherPrefix, ctx.h3Res),
            ['h3_index', 'precipitation_mm_6hr'],
            ctx.h3Ranges
          ),
          loadParquet(
            buildingParquet(ctx.h3Res),
            ['h3_index', 'coverage_ratio'],
            ctx.h3Ranges
          ),
          loadParquet(
            terrainParquet(ctx.h3Res),
            ['h3_index', 'avg_slope_deg'],
            ctx.h3Ranges
          ),
        ]);

      const baMap = new Map(baResult.rows.map((r) => [String(r.h3_index), r]));
      const wxMap = new Map(wxResult.rows.map((r) => [String(r.h3_index), r]));
      const bldMap = new Map(
        bldResult.rows.map((r) => [String(r.h3_index), r])
      );
      const teMap = new Map(teResult.rows.map((r) => [String(r.h3_index), r]));

      // Maxima for normalization
      let maxWater = 1;
      let maxInfra = 1;
      for (const r of baResult.rows) {
        const w = Number(r.water_count) || 0;
        if (w > maxWater) maxWater = w;
        const inf = Number(r.n_water_infra) || 0;
        if (inf > maxInfra) maxInfra = inf;
      }

      const rows = popResult.rows
        .filter((p) => Number(p.pop_2025) > 100)
        .map((p) => {
          const key = String(p.h3_index);
          const ba = baMap.get(key);
          const wx = wxMap.get(key);
          const bld = bldMap.get(key);
          const te = teMap.get(key);

          const pop2025 = Number(p.pop_2025);
          const pop2050 = Number(p.pop_2050) || pop2025;
          const waterCount = ba ? Number(ba.water_count) || 0 : 0;

          // 1. Natural water per capita: log-normalized [0, 1]
          const wpc = waterCount / pop2025;
          const naturalScore = Math.min(
            1,
            wpc > 0 ? Math.log1p(wpc * 10000) / Math.log1p(maxWater) : 0
          );

          // 2. Engineered water infra: treatment plants, pipes, reservoirs
          const infraRaw = ba ? Number(ba.n_water_infra) || 0 : 0;
          const reservoirRaw = ba ? Number(ba.n_reservoir) || 0 : 0;
          const infraTotal = infraRaw + reservoirRaw;
          const infraScore =
            infraTotal > 0
              ? Math.min(1, Math.log1p(infraTotal) / Math.log1p(maxInfra + 100))
              : 0;

          // 3. Precipitation: 0 mm = 0, 20+ mm/6hr = 1
          const precip = wx
            ? Math.max(0, Number(wx.precipitation_mm_6hr) || 0)
            : 0;
          const precipScore = Math.min(1, precip / 20);

          // 4. Ground permeability: inverse of coverage ratio
          //    Low coverage = rain soaks in = good. High coverage = runoff = bad.
          const coverage = bld ? Number(bld.coverage_ratio) || 0 : 0;
          const permeabilityScore = 1 - Math.min(1, coverage);

          // 5. Terrain retention: flat = water stays, steep = runoff
          const slope = te ? Number(te.avg_slope_deg) || 0 : 0;
          const retentionScore = Math.max(0, 1 - slope / 20);

          // 6. Population growth pressure: shrinking = 1, doubling = 0
          const growthRatio = pop2050 / pop2025;
          const growthPressure = Math.max(
            0,
            Math.min(1, 1 - (growthRatio - 1) / 1.5)
          );

          // Composite: 30% natural + 15% infra + 20% precip + 10% permeability + 10% retention + 15% growth
          const score =
            0.3 * naturalScore +
            0.15 * infraScore +
            0.2 * precipScore +
            0.1 * permeabilityScore +
            0.1 * retentionScore +
            0.15 * growthPressure;

          return {
            h3_index: p.h3_index,
            water_score: score,
            water_count: waterCount,
            water_per_capita: wpc,
            natural_score: naturalScore,
            infra_score: infraScore,
            infra_count: infraTotal,
            precip_mm: precip,
            precip_score: precipScore,
            permeability_score: permeabilityScore,
            coverage_pct: coverage,
            retention_score: retentionScore,
            slope_deg: slope,
            pop_2025: pop2025,
            pop_2050: pop2050,
            growth_ratio: growthRatio,
            growth_pressure: growthPressure,
            river_count: ba ? Number(ba.n_river) || 0 : 0,
            lake_count: ba ? Number(ba.n_lake) || 0 : 0,
            reservoir_count: reservoirRaw,
          };
        });

      return { rows, info: popResult.info };
    },
    buildQuery: (
      ctx
    ) => `-- Water Security (6-signal composite across 5 indices)
SELECT p.h3_index, p.pop_2025, p.pop_2050,
       ba.water_count, ba.n_river, ba.n_lake, ba.n_reservoir,
       ba.n_water_infra,
       w.precipitation_mm_6hr,
       b.coverage_ratio,
       te.avg_slope_deg
FROM '${populationParquet(ctx.h3Res)}' p
LEFT JOIN '${baseParquet(ctx.overtureRelease, ctx.h3Res)}' ba USING (h3_index)
LEFT JOIN '${weatherParquet(ctx.weatherPrefix, ctx.h3Res)}' w USING (h3_index)
LEFT JOIN '${buildingParquet(ctx.h3Res)}' b USING (h3_index)
LEFT JOIN '${terrainParquet(ctx.h3Res)}' te USING (h3_index)
WHERE p.pop_2025 > 100`,

    getFillColor: (d, range) => {
      const s = Number(d.water_score) || 0;
      return interpolateColor(
        normalize(s, range.min, range.max),
        WATER_SECURITY_COLORS
      );
    },
    getElevation: (d) => Math.max(0, Number(d.pop_2025) || 0),
    formatTooltip: (d) => {
      const s = Number(d.water_score) || 0;
      const gr = Number(d.growth_ratio) || 1;
      const label =
        s >= 0.7
          ? 'Secure'
          : s >= 0.4
            ? 'Moderate'
            : s >= 0.2
              ? 'Stressed'
              : 'Critical';
      const growthLabel =
        gr >= 1.5
          ? 'Rapid growth'
          : gr >= 1.1
            ? 'Growing'
            : gr >= 0.95
              ? 'Stable'
              : 'Shrinking';
      return [
        `Water Security: ${(s * 100).toFixed(0)}% (${label})`,
        `Signals:`,
        `  Natural Water: ${(Number(d.natural_score) * 100).toFixed(0)}% (${fmt(Number(d.water_count))} features, ${Number(d.water_per_capita).toFixed(4)}/person)`,
        `    Rivers: ${fmt(Number(d.river_count))} \u00B7 Lakes: ${fmt(Number(d.lake_count))} \u00B7 Reservoirs: ${fmt(Number(d.reservoir_count))}`,
        `  Water Infra: ${(Number(d.infra_score) * 100).toFixed(0)}% (${fmt(Number(d.infra_count))} plants/pipes/reservoirs)`,
        `  Rainfall: ${(Number(d.precip_score) * 100).toFixed(0)}% (${Number(d.precip_mm).toFixed(1)} mm/6hr)`,
        `  Permeability: ${(Number(d.permeability_score) * 100).toFixed(0)}% (${(Number(d.coverage_pct) * 100).toFixed(0)}% ground sealed)`,
        `  Retention: ${(Number(d.retention_score) * 100).toFixed(0)}% (${Number(d.slope_deg).toFixed(1)}\u00B0 slope)`,
        `  Growth Pressure: ${(Number(d.growth_pressure) * 100).toFixed(0)}% (${growthLabel}, \u00D7${gr.toFixed(2)})`,
        `Pop: ${fmt(Number(d.pop_2025))} \u2192 ${fmt(Number(d.pop_2050))}`,
      ].join('\n');
    },
    extruded: true,
    elevationScale: 0.02,
    colorLegend: [
      { label: 'Critical', color: 'rgb(128,0,38)' },
      { label: 'Moderate', color: 'rgb(255,255,191)' },
      { label: 'Secure', color: 'rgb(8,81,156)' },
    ],
    sourceCoopUrl: 'https://source.coop/walkthru-earth/indices',
    githubUrl: 'https://github.com/walkthru-earth/walkthru-overture-index',
    defaultH3Res: 3,
    h3ResRange: [3, 8],
  },
];

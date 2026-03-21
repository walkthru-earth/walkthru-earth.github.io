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

let _weatherPrefixPromise: Promise<string> | null = null;
export function resolveWeatherPrefix(): Promise<string> {
  if (_weatherPrefixPromise) return _weatherPrefixPromise;

  _weatherPrefixPromise = (async () => {
    const probe = async (
      date: string,
      hour: number
    ): Promise<string | null> => {
      try {
        const probeUrl = `${PROBE_BASE}/indices/weather/model=GraphCast_GFS/date=${date}/hour=${hour}/h3_res=2/data.parquet`;
        const res = await fetch(probeUrl, { method: 'HEAD' });
        return res.ok ? `${WEATHER_BASE}/date=${date}/hour=${hour}` : null;
      } catch {
        return null;
      }
    };

    // Probe today's hours in parallel (2 requests), prefer hour=12
    const dates = recentDates(2);
    for (const date of dates) {
      const [h12, h0] = await Promise.all([probe(date, 12), probe(date, 0)]);
      if (h12) {
        console.log(`[Weather] Found: date=${date}/hour=12`);
        return h12;
      }
      if (h0) {
        console.log(`[Weather] Found: date=${date}/hour=0`);
        return h0;
      }
    }

    console.warn('[Weather] All probes failed, using fallback');
    return `${WEATHER_BASE}/date=${dates[0]}/hour=0`;
  })();

  return _weatherPrefixPromise;
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

const OVERTURE_RELEASE = '2026-03-18.0';
const placesParquet = (res: number) =>
  `${S3_BASE}/indices/places-index/v1/release=${OVERTURE_RELEASE}/h3/h3_res=${res}/data.parquet`;
const transportParquet = (res: number) =>
  `${S3_BASE}/indices/transportation-index/v1/release=${OVERTURE_RELEASE}/h3/h3_res=${res}/data.parquet`;

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
        placesParquet(ctx.h3Res),
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
FROM '${placesParquet(ctx.h3Res)}'`,

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
   * Section 18: Transportation — Walkability Index (Overture Maps)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'walkability',
    title: 'Walkability Index',
    subtitle: 'Overture Maps \u00B7 343 M Segments',
    description:
      'Human-scale vs car-scale infrastructure. Color = walkability ratio: footways, cycleways, pedestrian streets, and paths divided by those plus motorways, trunks, and arterials. Green hexagons prioritize people; red prioritize cars. Height = total road segments.',
    describeData: (rows) => {
      const total = col(rows, 'segment_count', 'sum');
      let walkSum = 0;
      let count = 0;
      for (const r of rows) {
        const w = walkabilityRatio(r);
        if (Number(r.segment_count) > 0) {
          walkSum += w;
          count++;
        }
      }
      const avgWalk = count > 0 ? walkSum / count : 0;
      const totalRail = col(rows, 'n_rail', 'sum');
      return `${fmt(rows.length)} cells, ${fmt(Math.round(total))} transport segments. Avg walkability: ${(avgWalk * 100).toFixed(1)}%. Rail: ${fmt(Math.round(totalRail))} segments. Paved: ${fmt(Math.round(col(rows, 'n_paved', 'sum')))}. Unpaved: ${fmt(Math.round(col(rows, 'n_unpaved', 'sum')))}.`;
    },
    stat: { label: 'Total Segments', value: '343 M' },
    viewState: { latitude: 52.5, longitude: 13.4, zoom: 3.5 },
    colorColumn: 'segment_count',
    loadData: async (ctx, onProgress) =>
      loadParquet(
        transportParquet(ctx.h3Res),
        [
          'h3_index',
          'segment_count',
          'n_road',
          'n_rail',
          'n_water',
          'n_motorway',
          'n_trunk',
          'n_primary',
          'n_secondary',
          'n_tertiary',
          'n_residential',
          'n_living_street',
          'n_service',
          'n_pedestrian',
          'n_footway',
          'n_steps',
          'n_path',
          'n_cycleway',
          'n_bridleway',
          'n_bridge',
          'n_tunnel',
          'n_paved',
          'n_unpaved',
        ],
        ctx.h3Ranges,
        onProgress
      ),
    buildQuery: (ctx) => `SELECT h3_index, segment_count,
       n_road, n_rail, n_water,
       n_motorway, n_trunk, n_primary, n_secondary,
       n_tertiary, n_residential, n_living_street,
       n_service, n_pedestrian, n_footway, n_steps,
       n_path, n_cycleway, n_bridleway,
       n_bridge, n_tunnel, n_paved, n_unpaved
FROM '${transportParquet(ctx.h3Res)}'`,

    getFillColor: (d) => {
      const w = walkabilityRatio(d);
      return interpolateColor(w, WALKABILITY_COLORS);
    },
    getElevation: (d) => Math.max(0, Number(d.segment_count) || 0),
    formatTooltip: (d) => {
      const w = walkabilityRatio(d);
      const segments = Number(d.segment_count) || 0;
      const human =
        (Number(d.n_footway) || 0) +
        (Number(d.n_pedestrian) || 0) +
        (Number(d.n_steps) || 0) +
        (Number(d.n_path) || 0) +
        (Number(d.n_cycleway) || 0) +
        (Number(d.n_living_street) || 0);
      const car =
        (Number(d.n_motorway) || 0) +
        (Number(d.n_trunk) || 0) +
        (Number(d.n_primary) || 0) +
        (Number(d.n_secondary) || 0);
      const label =
        w >= 0.7
          ? 'Highly Walkable'
          : w >= 0.4
            ? 'Mixed'
            : w >= 0.15
              ? 'Car-Leaning'
              : 'Car-Dominated';
      const paved = Number(d.n_paved) || 0;
      const unpaved = Number(d.n_unpaved) || 0;
      const pavedPct =
        paved + unpaved > 0
          ? ((paved / (paved + unpaved)) * 100).toFixed(0)
          : '—';
      return [
        `Walkability: ${(w * 100).toFixed(1)}% (${label})`,
        `Segments: ${fmt(segments)}`,
        `Human-scale: ${fmt(human)} (foot/cycle/path)`,
        `Car-scale: ${fmt(car)} (motorway/trunk/arterial)`,
        Number(d.n_rail) > 0 ? `Rail: ${fmt(Number(d.n_rail))}` : null,
        `Paved: ${pavedPct}%`,
        Number(d.n_bridge) > 0 ? `Bridges: ${fmt(Number(d.n_bridge))}` : null,
        Number(d.n_tunnel) > 0 ? `Tunnels: ${fmt(Number(d.n_tunnel))}` : null,
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
    h3ResRange: [1, 10],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 19: 15-Minute City Score
   * Cross-index: places (diversity) + transportation (walkability) + terrain (slope)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'fifteen-min-city',
    title: '15-Minute City Score',
    subtitle: 'Places \u00D7 Walkability \u00D7 Terrain',
    description:
      'Can you reach diverse amenities on foot over walkable, flat terrain? This composite index multiplies three normalized signals: Shannon place diversity (40%), walkability ratio (40%), and slope penalty (20%). A score of 1.0 = perfectly diverse amenities, fully pedestrian infrastructure, on flat ground. The 15-minute city made measurable.',
    describeData: (rows) => {
      let scoreSum = 0;
      let best = 0;
      for (const r of rows) {
        const s = Number(r.city15_score) || 0;
        scoreSum += s;
        if (s > best) best = s;
      }
      const avg = rows.length > 0 ? scoreSum / rows.length : 0;
      return `${fmt(rows.length)} cells. Avg score: ${(avg * 100).toFixed(1)}%. Best cell: ${(best * 100).toFixed(1)}%. Combines amenity diversity, walkable infrastructure, and terrain flatness.`;
    },
    stat: { label: 'Dimensions', value: '3 indices' },
    viewState: { latitude: 48.8, longitude: 2.3, zoom: 4 },
    colorColumn: 'city15_score',
    loadData: async (ctx, _onProgress) => {
      const [plResult, trResult, teResult] = await Promise.all([
        loadParquet(
          placesParquet(ctx.h3Res),
          ['h3_index', 'place_count', ...PLACES_CATEGORIES],
          ctx.h3Ranges
        ),
        loadParquet(
          transportParquet(ctx.h3Res),
          ['h3_index', 'segment_count', ...HUMAN_SCALE_KEYS, ...CAR_SCALE_KEYS],
          ctx.h3Ranges
        ),
        loadParquet(
          terrainParquet(ctx.h3Res),
          ['h3_index', 'avg_slope_deg'],
          ctx.h3Ranges
        ),
      ]);

      // Build lookup maps
      const trMap = new Map(trResult.rows.map((r) => [String(r.h3_index), r]));
      const teMap = new Map(teResult.rows.map((r) => [String(r.h3_index), r]));

      const rows = plResult.rows
        .filter((pl) => {
          const key = String(pl.h3_index);
          return trMap.has(key) && Number(pl.place_count) > 0;
        })
        .map((pl) => {
          const key = String(pl.h3_index);
          const tr = trMap.get(key)!;
          const te = teMap.get(key);

          // 1. Place diversity: Shannon H' normalized to [0, 1]
          const diversity = shannonDiversity(pl) / MAX_SHANNON;

          // 2. Walkability ratio [0, 1]
          const walk = walkabilityRatio(tr);

          // 3. Slope penalty: flat (0°) = 1.0, steep (15°+) = 0.0
          const slope = te ? Number(te.avg_slope_deg) || 0 : 0;
          const slopeFactor = Math.max(0, 1 - slope / 15);

          // Composite: 40% diversity + 40% walkability + 20% terrain
          const score = 0.4 * diversity + 0.4 * walk + 0.2 * slopeFactor;

          return {
            h3_index: pl.h3_index,
            city15_score: score,
            place_count: pl.place_count,
            diversity,
            walkability: walk,
            slope_factor: slopeFactor,
            slope_deg: slope,
            segment_count: tr.segment_count,
          };
        });

      return { rows, info: plResult.info };
    },
    buildQuery: (
      ctx
    ) => `-- 15-Minute City composite (places × transport × terrain)
SELECT pl.h3_index,
       pl.place_count,
       tr.segment_count,
       te.avg_slope_deg
FROM '${placesParquet(ctx.h3Res)}' pl
JOIN '${transportParquet(ctx.h3Res)}' tr USING (h3_index)
LEFT JOIN '${terrainParquet(ctx.h3Res)}' te USING (h3_index)
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
      const div = Number(d.diversity) || 0;
      const walk = Number(d.walkability) || 0;
      const sf = Number(d.slope_factor) || 0;
      const slope = Number(d.slope_deg) || 0;
      const grade =
        score >= 0.7
          ? 'A \u2014 Excellent'
          : score >= 0.5
            ? 'B \u2014 Good'
            : score >= 0.3
              ? 'C \u2014 Fair'
              : 'D \u2014 Car-dependent';
      return [
        `15-Min Score: ${(score * 100).toFixed(1)}% (${grade})`,
        `Amenity Diversity: ${(div * 100).toFixed(0)}%`,
        `Walkability: ${(walk * 100).toFixed(0)}%`,
        `Terrain: ${slope.toFixed(1)}\u00B0 slope (${(sf * 100).toFixed(0)}% flat bonus)`,
        `Places: ${fmt(Number(d.place_count))}`,
        `Segments: ${fmt(Number(d.segment_count))}`,
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
];

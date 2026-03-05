import {
  interpolateColor,
  normalize,
  ELEVATION_COLORS,
  POPULATION_GROWTH_COLORS,
  BUILDING_HEIGHT_COLORS,
  TEMPERATURE_COLORS,
  WIND_SPEED_COLORS,
  PRECIPITATION_COLORS,
  POPULATION_DENSITY_COLORS,
} from '../utils/color-scales';

export interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface BBox {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

/**
 * Approximate visible bounding box from a globe viewState.
 * At zoom z on deck.gl _GlobeView, the visible radius is roughly 180/2^zoom degrees.
 * We add generous padding so hexagons at the edges are included.
 */
export function viewStateToBBox(vs: ViewState): BBox {
  const halfSpan = Math.min((180 / Math.pow(2, vs.zoom)) * 1.3, 90);
  return {
    minLat: Math.max(-90, vs.latitude - halfSpan),
    maxLat: Math.min(90, vs.latitude + halfSpan),
    minLon: Math.max(-180, vs.longitude - halfSpan * 1.5),
    maxLon: Math.min(180, vs.longitude + halfSpan * 1.5),
  };
}

export interface GlobeSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  stat: { label: string; value: string };
  viewState: ViewState;
  /** Builds the SQL query with a dynamic bounding box derived from the viewState. */
  buildQuery: (bbox: BBox) => string;
  getHexagon: (d: Record<string, unknown>) => string;
  getFillColor: (
    d: Record<string, unknown>
  ) => [number, number, number, number];
  getElevation?: (d: Record<string, unknown>) => number;
  /** Format a data row for tooltip display. Return null to hide tooltip. */
  formatTooltip?: (d: Record<string, unknown>) => string | null;
  extruded: boolean;
  elevationScale?: number;
  colorLegend: { label: string; color: string }[];
}

const S3_BASE = 's3://us-west-2.opendata.source.coop/walkthru-earth';

/**
 * Weather forecast date. Uses yesterday UTC to ensure data availability
 * (forecasts are published every 12 hours, so yesterday is always available).
 */
function getWeatherDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

const WEATHER_DATE = getWeatherDate();

const weatherParquet = `${S3_BASE}/indices/weather/model=GraphCast_GFS/date=${WEATHER_DATE}/hour=0/h3_res=5/*.parquet`;

/** Format number with locale-aware separators */
const fmt = (n: number) => Number(n).toLocaleString();

export const SECTIONS: GlobeSection[] = [
  /* ────────────────────────────────────────────────────────────────
   * Section 0: Opening — clean globe
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'intro',
    title: "Earth's Living Indices",
    subtitle: 'Scroll to Explore',
    description:
      'Four global datasets — terrain, population, buildings, and weather — indexed on a unified H3 hexagonal grid. Query them directly in your browser with DuckDB-WASM.',
    stat: { label: 'Total Cells', value: '10.5B+' },
    viewState: { latitude: 20, longitude: 30, zoom: 1.2 },
    buildQuery: () => '',
    getHexagon: () => '',
    getFillColor: () => [0, 0, 0, 0],
    extruded: false,
    colorLegend: [],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 1: Weather — Global Temperature (zoom ~1.5, full globe)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'weather-temperature',
    title: 'Global Temperature',
    subtitle: 'AI Weather · GraphCast',
    description:
      "AI-powered weather from NOAA GraphCast, topographically corrected with our 30m terrain model. This is today's 2-meter air temperature — the thermal fingerprint of the entire planet in one query.",
    stat: { label: 'Forecast Horizon', value: '5 days' },
    viewState: { latitude: 20, longitude: 30, zoom: 1.5 },
    buildQuery: (bbox) => `SELECT h3_index, temperature_2m_C,
       wind_speed_10m_ms, pressure_msl_hPa
FROM read_parquet('${weatherParquet}')
WHERE lat BETWEEN ${bbox.minLat.toFixed(1)} AND ${bbox.maxLat.toFixed(1)}
  AND lon BETWEEN ${bbox.minLon.toFixed(1)} AND ${bbox.maxLon.toFixed(1)}`,
    getHexagon: (d) => String(d.h3_index),
    getFillColor: (d) => {
      const temp = Number(d.temperature_2m_C) || 15;
      return interpolateColor(normalize(temp, -30, 40), TEMPERATURE_COLORS);
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
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 2: Weather — Global Wind Speed (zoom ~1.8)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'weather-wind',
    title: 'Wind Patterns',
    subtitle: 'AI Weather · 10m Winds',
    description:
      'Surface wind speeds at 10 meters above ground. Trade winds, westerlies, and storm systems become visible — each hexagon carries speed and direction vectors across 2 million cells.',
    stat: { label: 'Update Frequency', value: '12 hrs' },
    viewState: { latitude: 30, longitude: -30, zoom: 1.8 },
    buildQuery: (bbox) => `SELECT h3_index, wind_speed_10m_ms,
       wind_direction_10m_deg, temperature_2m_C
FROM read_parquet('${weatherParquet}')
WHERE lat BETWEEN ${bbox.minLat.toFixed(1)} AND ${bbox.maxLat.toFixed(1)}
  AND lon BETWEEN ${bbox.minLon.toFixed(1)} AND ${bbox.maxLon.toFixed(1)}`,
    getHexagon: (d) => String(d.h3_index),
    getFillColor: (d) => {
      const wind = Number(d.wind_speed_10m_ms) || 0;
      return interpolateColor(normalize(wind, 0, 25), WIND_SPEED_COLORS);
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
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 3: Weather — Precipitation (zoom ~2.5, tropical belt)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'weather-precipitation',
    title: 'Precipitation',
    subtitle: 'AI Weather · 6-hour Accumulation',
    description:
      'Six-hour precipitation accumulation from GraphCast. The tropical rain belt, monsoon systems, and mid-latitude fronts appear as bands of moisture wrapping the globe.',
    stat: { label: 'Resolution', value: 'H3 res 5' },
    viewState: { latitude: 10, longitude: 100, zoom: 2.5 },
    buildQuery: (bbox) => `SELECT h3_index, precipitation_mm_6hr,
       specific_humidity_gkg, temperature_2m_C
FROM read_parquet('${weatherParquet}')
WHERE lat BETWEEN ${bbox.minLat.toFixed(1)} AND ${bbox.maxLat.toFixed(1)}
  AND lon BETWEEN ${bbox.minLon.toFixed(1)} AND ${bbox.maxLon.toFixed(1)}`,
    getHexagon: (d) => String(d.h3_index),
    getFillColor: (d) => {
      const precip = Math.max(0, Number(d.precipitation_mm_6hr) || 0);
      return interpolateColor(normalize(precip, 0, 10), PRECIPITATION_COLORS);
    },
    formatTooltip: (d) =>
      [
        `Precip: ${Math.max(0, Number(d.precipitation_mm_6hr)).toFixed(1)} mm/6h`,
        `Humidity: ${Number(d.specific_humidity_gkg).toFixed(1)} g/kg`,
        `Temp: ${Number(d.temperature_2m_C).toFixed(1)} °C`,
      ].join('\n'),
    extruded: false,
    colorLegend: [
      { label: '0 mm', color: 'rgb(255,255,204)' },
      { label: '5 mm', color: 'rgb(65,182,196)' },
      { label: '10+ mm', color: 'rgb(37,52,148)' },
    ],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 4: Terrain — Himalayas (zoom ~3.5, extruded)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'terrain',
    title: 'Terrain & Elevation',
    subtitle: 'Himalayas',
    description:
      'Elevation from the GEDTM-30m global terrain model. Each hexagon aggregates 30m resolution data — revealing slope, ruggedness, and topographic position across 10.5 billion cells worldwide.',
    stat: { label: 'Source Resolution', value: '30m' },
    viewState: { latitude: 28.5, longitude: 86.5, zoom: 3.5 },
    buildQuery: (bbox) => `SELECT h3_index, elev, slope, aspect, tri
FROM read_parquet(
  '${S3_BASE}/dem-terrain/h3/h3_res=3/data.parquet'
)
WHERE lat BETWEEN ${bbox.minLat.toFixed(1)} AND ${bbox.maxLat.toFixed(1)}
  AND lon BETWEEN ${bbox.minLon.toFixed(1)} AND ${bbox.maxLon.toFixed(1)}`,
    getHexagon: (d) => String(d.h3_index),
    getFillColor: (d) => {
      const elev = Number(d.elev) || 0;
      return interpolateColor(normalize(elev, 0, 8000), ELEVATION_COLORS);
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
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 5: Buildings + Population — Nile Delta / Cairo (zoom ~4)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'buildings-nile',
    title: 'Urban Density',
    subtitle: 'Nile Delta · Cairo',
    description:
      "2.75 billion buildings from the Global Building Atlas, joined with population projections. The Nile Delta is one of Earth's most densely built regions — 100 million people in a narrow fertile strip.",
    stat: { label: 'Total Buildings', value: '2.75B' },
    viewState: { latitude: 30.0, longitude: 31.2, zoom: 4 },
    buildQuery: (bbox) => `SELECT b.h3_index, b.building_count,
       b.building_density, b.avg_height_m,
       b.total_volume_m3,
       p.pop_2025, p.pop_2050
FROM read_parquet(
  '${S3_BASE}/indices/building/h3/h3_res=3/data.parquet'
) b
JOIN read_parquet(
  '${S3_BASE}/indices/population/scenario=SSP2/h3_res=3/data.parquet'
) p ON b.h3_index = p.h3_index
WHERE b.lat BETWEEN ${bbox.minLat.toFixed(1)} AND ${bbox.maxLat.toFixed(1)}
  AND b.lon BETWEEN ${bbox.minLon.toFixed(1)} AND ${bbox.maxLon.toFixed(1)}`,
    getHexagon: (d) => String(d.h3_index),
    getFillColor: (d) => {
      const pop = Number(d.pop_2025) || 0;
      return interpolateColor(
        normalize(pop, 0, 2_000_000),
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
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 6: Population Growth — Sub-Saharan Africa (zoom ~3.5)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'population-growth',
    title: 'Population Growth 2025→2100',
    subtitle: 'Sub-Saharan Africa',
    description:
      'Population projections under SSP2 from WorldPop. Sub-Saharan Africa shows the most dramatic projected growth — some hexagons tripling by 2100. Extruded by current population, colored by growth ratio.',
    stat: { label: 'Projection', value: 'SSP2' },
    viewState: { latitude: 5, longitude: 25, zoom: 3.5 },
    buildQuery: (bbox) => `SELECT h3_index, pop_2025, pop_2050, pop_2100,
       (pop_2100 / NULLIF(pop_2025, 0))
         AS growth_ratio
FROM read_parquet(
  '${S3_BASE}/indices/population/scenario=SSP2/h3_res=3/data.parquet'
)
WHERE lat BETWEEN ${bbox.minLat.toFixed(1)} AND ${bbox.maxLat.toFixed(1)}
  AND lon BETWEEN ${bbox.minLon.toFixed(1)} AND ${bbox.maxLon.toFixed(1)}`,
    getHexagon: (d) => String(d.h3_index),
    getFillColor: (d) => {
      const ratio = Number(d.growth_ratio) || 1;
      return interpolateColor(
        normalize(ratio, 0.5, 3.0),
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
    elevationScale: 0.5,
    colorLegend: [
      { label: 'Declining', color: 'rgb(49,130,189)' },
      { label: 'Stable', color: 'rgb(255,255,178)' },
      { label: '3x Growth', color: 'rgb(227,26,28)' },
    ],
  },

  /* ────────────────────────────────────────────────────────────────
   * Section 7: Buildings — Tokyo (zoom ~4, building height)
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'buildings-tokyo',
    title: 'Building Density',
    subtitle: 'Tokyo · East Asia',
    description:
      "Tokyo-Yokohama, the world's largest metro — each hexagon reports building count, average height, and footprint coverage. Extruded by density, colored by average building height.",
    stat: { label: 'Metro Population', value: '37M' },
    viewState: { latitude: 35.68, longitude: 139.76, zoom: 4 },
    buildQuery: (bbox) => `SELECT h3_index, building_count,
       building_density, avg_height_m,
       coverage_ratio, total_volume_m3
FROM read_parquet(
  '${S3_BASE}/indices/building/h3/h3_res=3/data.parquet'
)
WHERE lat BETWEEN ${bbox.minLat.toFixed(1)} AND ${bbox.maxLat.toFixed(1)}
  AND lon BETWEEN ${bbox.minLon.toFixed(1)} AND ${bbox.maxLon.toFixed(1)}`,
    getHexagon: (d) => String(d.h3_index),
    getFillColor: (d) => {
      const height = Number(d.avg_height_m) || 0;
      return interpolateColor(normalize(height, 0, 15), BUILDING_HEIGHT_COLORS);
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
    elevationScale: 2,
    colorLegend: [
      { label: 'Low-rise', color: 'rgb(200,200,200)' },
      { label: 'Mid-rise', color: 'rgb(253,184,99)' },
      { label: 'High-rise', color: 'rgb(215,48,39)' },
    ],
  },
];

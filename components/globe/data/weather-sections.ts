import { timestampToMs, finiteNumber } from '../utils/time-series';
import {
  interpolateColor,
  normalize,
  TEMPERATURE_COLORS,
  WIND_SPEED_COLORS,
  PRESSURE_COLORS,
  PRECIPITATION_COLORS,
} from '../utils/color-scales';
import { loadParquet } from '../utils/parquet-loader';

import { weatherParquet, fmt, col, type GlobeSection } from './section-shared';

export const WEATHER_SECTIONS: GlobeSection[] = [
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
      const ts = new Set(rows.map((r) => timestampToMs(r.timestamp))).size;
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
        { h3Ranges: ctx.h3Ranges, signal: ctx.signal },
        onProgress
      ),
    buildQuery: (ctx) => `SELECT h3_index, temperature_2m_C,
       wind_speed_10m_ms, pressure_msl_hPa
FROM '${weatherParquet(ctx.weatherPrefix, ctx.h3Res)}'`,

    getFillColor: (d, range) => {
      const temp = finiteNumber(d.temperature_2m_C, 15);
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
        { h3Ranges: ctx.h3Ranges, signal: ctx.signal },
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
        { h3Ranges: ctx.h3Ranges, signal: ctx.signal },
        onProgress
      ),
    buildQuery: (ctx) => `SELECT h3_index, pressure_msl_hPa,
       temperature_2m_C, wind_speed_10m_ms
FROM '${weatherParquet(ctx.weatherPrefix, ctx.h3Res)}'`,

    getFillColor: (d, range) => {
      const pressure = finiteNumber(d.pressure_msl_hPa, 1013);
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
        { h3Ranges: ctx.h3Ranges, signal: ctx.signal },
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
];

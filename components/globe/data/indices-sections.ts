import { finiteNumber } from '../utils/time-series';
import {
  interpolateColor,
  normalize,
  ELEVATION_COLORS,
  POPULATION_GROWTH_COLORS,
  BUILDING_HEIGHT_COLORS,
  POPULATION_DENSITY_COLORS,
  SLOPE_COLORS,
  RUGGEDNESS_COLORS,
  VERTICAL_DENSITY_COLORS,
  PLACES_COLORS,
  WALKABILITY_COLORS,
} from '../utils/color-scales';
import { loadParquet } from '../utils/parquet-loader';

import {
  buildingParquet,
  populationParquet,
  terrainParquet,
  placesParquet,
  transportParquet,
  baseParquet,
  fmt,
  col,
  PLACES_CATEGORIES,
  MAX_SHANNON,
  shannonDiversity,
  HUMAN_SCALE_KEYS,
  CAR_SCALE_KEYS,
  walkabilityRatio,
  sumKeys,
  type GlobeSection,
} from './section-shared';

export const INDICES_SECTIONS: GlobeSection[] = [
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
        { h3Ranges: ctx.h3Ranges, signal: ctx.signal },
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
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
        ),
        loadParquet(
          populationParquet(ctx.h3Res),
          ['h3_index', 'pop_2025', 'pop_2050'],
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
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
        { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
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
      const ratio = finiteNumber(d.growth_ratio, 1);
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
        { h3Ranges: ctx.h3Ranges, signal: ctx.signal },
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
   * Section 7: Landslide Vulnerability — Buildings on Steep Terrain
   * Cross-index: building + terrain
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 'landslide-vulnerability',
    title: 'Buildings on Steep Terrain',
    subtitle: 'Himalayan Slopes',
    description:
      'Cross-joining buildings with terrain slope to flag structures on steep ground. Slope is one screening signal, not a site-level stability or hazard assessment.',
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
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
        ),
        loadParquet(
          terrainParquet(ctx.h3Res),
          ['h3_index', 'elev', 'slope', 'tri'],
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
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
      'Buildings per person is a rough proxy for how many people share built space. It does not measure crowding inside homes, stress, or mental health.',
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
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
        ),
        loadParquet(populationParquet(ctx.h3Res), ['h3_index', 'pop_2025'], {
          h3Ranges: ctx.h3Ranges,
          signal: ctx.signal,
        }),
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
        { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
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
      const ratio = finiteNumber(d.growth_ratio, 1);
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
        { h3Ranges: ctx.h3Ranges, signal: ctx.signal },
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
        { h3Ranges: ctx.h3Ranges, signal: ctx.signal },
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
        { h3Ranges: ctx.h3Ranges, signal: ctx.signal },
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
        { h3Ranges: ctx.h3Ranges, signal: ctx.signal },
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
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
        ),
        loadParquet(populationParquet(ctx.h3Res), ['h3_index', 'pop_2025'], {
          h3Ranges: ctx.h3Ranges,
          signal: ctx.signal,
        }),
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
        { h3Ranges: ctx.h3Ranges, signal: ctx.signal },
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

    getFillColor: (d, _range) => {
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
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
        ),
        loadParquet(
          baseParquet(ctx.overtureRelease, ctx.h3Res),
          ['h3_index', 'n_pedestrian', 'n_barrier'],
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
        ),
        loadParquet(terrainParquet(ctx.h3Res), ['h3_index', 'avg_slope_deg'], {
          h3Ranges: ctx.h3Ranges,
          signal: ctx.signal,
        }),
        loadParquet(
          placesParquet(ctx.overtureRelease, ctx.h3Res),
          ['h3_index', 'place_count'],
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
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
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
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
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
        ),
        loadParquet(terrainParquet(ctx.h3Res), ['h3_index', 'avg_slope_deg'], {
          h3Ranges: ctx.h3Ranges,
          signal: ctx.signal,
        }),
        loadParquet(
          baseParquet(ctx.overtureRelease, ctx.h3Res),
          [
            'h3_index',
            'n_transit',
            'n_pedestrian',
            'n_lu_park',
            'n_lu_recreation',
          ],
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
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
];

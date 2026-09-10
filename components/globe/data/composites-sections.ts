import { finiteNumber } from '../utils/time-series';
import {
  interpolateColor,
  normalize,
  HOUSING_PRESSURE_COLORS,
  BIOPHILIC_COLORS,
  HEAT_VULN_COLORS,
  WATER_SECURITY_COLORS,
} from '../utils/color-scales';
import { loadParquet } from '../utils/parquet-loader';

import {
  weatherParquet,
  buildingParquet,
  populationParquet,
  terrainParquet,
  transportParquet,
  baseParquet,
  fmt,
  col,
  NATURE_KEYS,
  WATER_KEYS,
  URBAN_KEYS,
  sumKeys,
  natureRatio,
  type GlobeSection,
} from './section-shared';

export const COMPOSITES_SECTIONS: GlobeSection[] = [
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
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
        ),
        loadParquet(
          populationParquet(ctx.h3Res),
          ['h3_index', 'pop_2025', 'pop_2100'],
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
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
      const ratio = finiteNumber(d.growth_ratio, 1);
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
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
        ),
        loadParquet(populationParquet(ctx.h3Res), ['h3_index', 'pop_2025'], {
          h3Ranges: ctx.h3Ranges,
          signal: ctx.signal,
        }),
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
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
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
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
        ),
        loadParquet(
          transportParquet(ctx.overtureRelease, ctx.h3Res),
          ['h3_index', 'segment_count', 'n_paved', 'n_unpaved'],
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
        ),
        loadParquet(
          weatherParquet(ctx.weatherPrefix, ctx.h3Res),
          ['h3_index', 'temperature_2m_C', 'wind_speed_10m_ms'],
          { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
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
            { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
          ),
          loadParquet(
            populationParquet(ctx.h3Res),
            ['h3_index', 'pop_2025', 'pop_2050'],
            { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
          ),
          loadParquet(
            weatherParquet(ctx.weatherPrefix, ctx.h3Res),
            ['h3_index', 'precipitation_mm_6hr'],
            { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
          ),
          loadParquet(
            buildingParquet(ctx.h3Res),
            ['h3_index', 'coverage_ratio'],
            { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
          ),
          loadParquet(
            terrainParquet(ctx.h3Res),
            ['h3_index', 'avg_slope_deg'],
            { h3Ranges: ctx.h3Ranges, signal: ctx.signal }
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
      const gr = finiteNumber(d.growth_ratio, 1);
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

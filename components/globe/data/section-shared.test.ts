import { expect, it } from 'vitest';
import {
  baseParquet,
  buildingParquet,
  placesParquet,
  populationParquet,
  terrainParquet,
  transportParquet,
  weatherParquet,
} from './section-shared';

it.each([
  [terrainParquet(5), 'dem-terrain/v2/h3/h3_res=5/data.parquet'],
  [buildingParquet(4), 'indices/building/v2/h3/h3_res=4/data.parquet'],
  [
    populationParquet(3, 'SSP3'),
    'indices/population/v2/scenario=SSP3/h3_res=3/data.parquet',
  ],
  [
    placesParquet('2026-09-10.0', 5),
    'indices/places-index/v1/release=2026-09-10.0/h3/h3_res=5/data.parquet',
  ],
  [
    transportParquet('2026-09-10.0', 5),
    'indices/transportation-index/v1/release=2026-09-10.0/h3/h3_res=5/data.parquet',
  ],
  [
    baseParquet('2026-09-10.0', 5),
    'indices/base-index/v1/release=2026-09-10.0/h3/h3_res=5/data.parquet',
  ],
  [
    weatherParquet(
      'https://data.source.coop/walkthru-earth/indices/weather/model=GraphCast_GFS/date=2026-09-10/hour=12',
      1
    ),
    'indices/weather/model=GraphCast_GFS/date=2026-09-10/hour=12/h3_res=1/data.parquet',
  ],
])(
  'routes %s through the proxy while preserving its dataset path',
  (url, path) => {
    expect(url).toBe(`https://data.source.coop/walkthru-earth/${path}`);
  }
);

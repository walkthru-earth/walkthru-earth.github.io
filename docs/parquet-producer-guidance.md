# Parquet Producer Guidance

Observations from `duckdb` inspection of our indices on 2026-04-14:

| File | Rows | Row groups | Size |
|---|---:|---:|---:|
| building/h3_res=3/data.parquet | 12,239 | 1 | 437 KB |
| building/h3_res=5/data.parquet | 399,355 | 1 | 13 MB |
| building/h3_res=6/data.parquet | 2,175,194 | 3 | 70 MB |
| dem-terrain/h3_res=5/data.parquet | 533,062 | 1 | 10 MB |
| dem-terrain/h3_res=7/data.parquet | 26,115,785 | 27 | 499 MB |

- `h3_res ≤ 5` files are written as single row groups (e.g. building res=5 = 399 k rows in 1 group, 13 MB).
- At these sizes, viewport-based H3 row-group pruning in the web worker has no effect. The full file is fetched and parsed even when the user only sees 1 % of the globe.

Files are produced by DuckDB v1.5.0-dev7575 with ZSTD compression. `h3_index` is sorted globally across row groups, uses PLAIN encoding, and is stored as INT64. There is no bloom filter on `h3_index` (not needed for range predicates, min/max stats are sufficient). No page-level offset indexes are present (`index_page_offset: NULL`).

## Recommendation

When writing indices via `COPY … TO … (FORMAT PARQUET, ROW_GROUP_SIZE N)`:

- For `h3_res 3` (tiny files < 500 KB), leave at 1 row group.
- For `h3_res 4–5`, target `ROW_GROUP_SIZE = 131072` (128 k rows), roughly 4–8 groups per file. Enables viewport pruning at these resolutions.
- For `h3_res 6+`, current sizing (~1 M rows / group) is good.

Also consider enabling page-level indexes:

```sql
COPY … TO 'file.parquet' (FORMAT PARQUET, WRITE_STATISTICS 1, ENABLE_STATISTICS 1, WRITE_PAGE_STATISTICS 1);
```

The web worker (`components/globe/utils/parquet-worker.ts`) passes `useOffsetIndex: true` to hyparquet. If producers add offset indexes, the worker will use them automatically to prune below row-group granularity.

## Sort order

`h3_index` is already sorted across row groups (verified). Keep this, it is what enables the `$gte/$lte` filter in hyparquet to skip entire row groups via min/max stats.

## Bloom filters

DuckDB writes bloom filters on dictionary-encoded columns (e.g. `building_count`) by default. These do not help our H3 range queries and can be disabled to reduce file size:

```sql
COPY … TO 'file.parquet' (FORMAT PARQUET, BLOOM_FILTER_FALSE_POSITIVE_RATIO 0.0);
```

Or keep them, storage cost is modest and they don't slow reads.

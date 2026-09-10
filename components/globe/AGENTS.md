# Globe explorer working guide

Read [the root guide](../../AGENTS.md), then [docs/indices.md](../../docs/indices.md). This directory serves `/indices` and the homepage preview.

## Where to work

| Change                                                        | Files                                                                                  |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| UI, section navigation, viewport and resolution               | `GlobeExplorer.tsx`, `LayerPanel.tsx`, `hooks/useGlobeScroll.ts`                       |
| Load lifecycle, live partition dependencies, forecast buckets | `hooks/useSectionData.ts`                                                              |
| Dataset definition and formula                                | `data/weather-sections.ts`, `data/indices-sections.ts`, `data/composites-sections.ts`  |
| Registry, common types, source URLs and helpers               | `data/sections.ts`, `data/section-shared.ts`, `data/constants.ts`, `data/live-data.ts` |
| Request API, completion cache, worker lifecycle               | `utils/parquet-loader.ts`, `utils/parquet-types.ts`                                    |
| HTTP byte/metadata caches, cancellation                       | `utils/parquet-worker.ts`, `../../lib/lru-cache.ts`                                    |
| Physical scan ranges and exact filtering                      | `utils/parquet-scan.ts`, `utils/parquet-filter.ts`, `utils/h3-mask.ts`                 |
| Viewport to H3 ranges                                         | `utils/h3-viewport.ts` and adjacent tests                                              |
| deck.gl layers, picking, basemap, theme, pins                 | `GlobeMap.tsx`                                                                         |

## Invariants

- Load only the active section's required datasets and columns. Carry `ctx.signal` and `ctx.h3Ranges` through every source in a composite load.
- `buildQuery` is explanatory SQL, not a SQL execution path. Keep it consistent with `loadData`; the live-source resolver also inspects its URL placeholders to discover partition dependencies.
- Use `parquetScan` with physical row ranges. Columns requested for the same range must stay aligned regardless of network completion order.
- `pruningFilter` skips storage regions; it is not an exact row filter. Keep the exact H3 mask and numeric predicate after reading retained ranges.
- Preserve H3 `bigint` precision. Compare statistics using the file's physical type and convert to hex strings at the rendering boundary. Do not coerce INT64 H3 values through JavaScript `number`.
- Abort superseded loads and reject cancellation. Cache completed results only; partial results must never become a future complete cache hit. Worker protocol types belong in `parquet-types.ts`.
- Keep network/decode/filter/row assembly in the worker. Progressive UI snapshots are immutable and throttled; mutating an array already given to deck.gl breaks its update detection.
- Use the shared LRU utility with explicit budgets. Cache budgets do not bound active decode or GPU memory; inspect real workloads before increasing resolution.
- Keep H3 `highPrecision: true` for the standalone globe. Its low-precision instanced path is not a drop-in globe optimization. Keep stable layer IDs, data references, and accessor `updateTriggers`.
- Read [producer guidance](../../docs/parquet-producer-guidance.md) before claiming byte savings. Row-group/page statistics and the host's Range support determine what can be skipped.

Run focused regression tests plus type checking and build after data/API changes. Follow the browser and measurement checks in [indices](../../docs/indices.md). Document observed performance, not estimates presented as results.

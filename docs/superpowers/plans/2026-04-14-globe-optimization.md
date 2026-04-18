# Globe Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve globe render performance, cut Parquet fetch/parse time, and clean up infra hygiene in `walkthru-earth.github.io` without changing observable behavior.

**Architecture:** The globe is deck.gl `_GlobeView` rendering `H3HexagonLayer` over H3-indexed Parquet datasets streamed through a dedicated Web Worker using hyparquet. Optimizations target three boundaries: (1) deck.gl render loop hot paths, (2) hyparquet native filter/pushdown to replace hand-rolled row-group pruning, (3) zero-copy worker↔main-thread transfer via transferable typed arrays.

**Tech Stack:** Next.js 16 (static export), React 19, deck.gl 9.3, luma.gl 9.3.2, hyparquet 1.25+, h3-js 4, TypeScript 5.9, pnpm 10.

---

## Key findings (drive decisions below)

Inspected five production Parquet files with `duckdb` 1.5.2 (`parquet_file_metadata` + `parquet_metadata`):

| File | Rows | Row groups | Size | Status |
|---|---:|---:|---:|---|
| `building/h3_res=3/data.parquet` | 12 k | **1** | 437 KB | pruning ineffective |
| `building/h3_res=5/data.parquet` | 399 k | **1** | 13 MB | pruning ineffective |
| `building/h3_res=6/data.parquet` | 2.18 M | 3 | 70 MB | pruning works |
| `dem-terrain/h3_res=5/data.parquet` | 533 k | **1** | 10 MB | pruning ineffective |
| `dem-terrain/h3_res=7/data.parquet` | 26.1 M | 27 | 499 MB | pruning critical |

- `h3_index` column is **sorted globally across row groups** (monotonic min/max), INT64 physical type, PLAIN encoding, ZSTD compressed. No bloom filter (not needed for range predicates). No page-level offset indexes (`index_page_offset` is NULL on every row group).
- Some unused bloom filters present on `building_count` (dict encoding). Not relevant.
- At `h3_res ≤ 5`, files contain a single row group, so the worker's current `shouldSkipRowGroup` in `components/globe/utils/parquet-worker.ts:182` is a no-op — the full file is fetched and parsed, then rows are filtered in-memory.

**hyparquet native pushdown (verified in `node_modules/hyparquet/src/{filter,plan,query}.js`):**
- `parquetReadObjects({filter, ...})` accepts MongoDB-style filters (`$gt/$gte/$lt/$lte/$eq/$in/$or/$and`) and evaluates `canSkipRowGroup` against column statistics automatically.
- `parquetPlan` only schedules byte-range fetches for row groups that survive pruning, so filters translate directly into fewer HTTP range requests.
- `useOffsetIndex: true` reads page-level offset indexes when present. Our files don't have them today — no-op to enable but future-proof if the producer adds them.
- `onChunk` callback on `parquetRead` yields `{columnName, columnData: DecodedArray, rowStart, rowEnd}` — **columnar, typed arrays**. Currently unused; we call `parquetReadObjects` which materializes `Record<string, unknown>[]`.

**deck.gl 9.3 review (confirmed against release notes):**
- No 9.3 API change obviates any current pattern — the bump was only a peer-dep fix.
- `H3HexagonLayer` accessor is `AccessorFunction<DataT, string>`, so full binary zero-copy into the layer is not available; the practical win is cheaper accessor execution from columnar backing storage.

---

## File layout

**Modify:**
- `components/globe/utils/parquet-worker.ts` — replace hand-rolled pruning with hyparquet `filter`, switch to columnar `onChunk`, emit transferable typed arrays.
- `components/globe/utils/parquet-loader.ts` — accept columnar result type, reconstruct `Record<string, unknown>[]` view lazily (or pass columnar through).
- `components/globe/utils/h3-viewport.ts` — add helper that builds hyparquet `$or` filter from ranges (keeps range math + exports both shapes).
- `components/globe/GlobeMap.tsx` — remove per-frame `console.log`, fix `updateTriggers.getElevation`, throttle pulse RAF, decouple pin layer memoization.
- `components/globe/GlobeExplorer.tsx` — tighten log gating behind a dev flag.
- `next.config.mjs` — remove dead `headers()` in static-export mode, verify `compiler.removeConsole` strips worker logs.
- `.github/workflows/deploy.yml` — add type-check step.
- `package.json` — add `test` script + vitest dev dep (Phase 0).

**Create:**
- `components/globe/utils/h3-viewport.test.ts` — unit tests for pure range math.
- `components/globe/utils/parquet-filter.ts` — small helper module exporting `buildH3RangeFilter`.
- `docs/superpowers/plans/2026-04-14-globe-optimization-results.md` — populated at end with before/after numbers.

---

## Phase 0: Testing foundation (optional, recommended)

The repo has no test infrastructure. Pure-function util tests give fast regression cover for the pushdown/viewport work that follows. Skip this phase if the user declines.

### Task 0.1: Add vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install vitest as dev dep**

```bash
pnpm add -D vitest @vitest/ui
```

- [ ] **Step 2: Add `test` scripts to `package.json`**

In `package.json` under `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['components/**/*.test.ts', 'lib/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 4: Verify**

Run: `pnpm test`
Expected: `No test files found` (no failure, just confirms config loads).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "test: add vitest for unit tests on pure utils"
```

### Task 0.2: Baseline tests for h3-viewport

**Files:**
- Create: `components/globe/utils/h3-viewport.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { viewportToH3Ranges, h3CellToBigIntRange } from './h3-viewport';

describe('h3CellToBigIntRange', () => {
  it('expands a res-3 cell to a res-6 descendant range', () => {
    // 832830fffffffff is res 3, base cell 1
    const [lo, hi] = h3CellToBigIntRange('832830fffffffff', 6);
    expect(hi >= lo).toBe(true);
    // The range must span 7^3 = 343 potential res-6 children
    expect(hi - lo).toBeGreaterThan(0n);
  });
});

describe('viewportToH3Ranges', () => {
  it('returns null for full-globe viewport', () => {
    expect(viewportToH3Ranges([-180, -85, 180, 85], 5)).toBeNull();
  });

  it('returns null when res < 3', () => {
    expect(viewportToH3Ranges([-10, -10, 10, 10], 2)).toBeNull();
  });

  it('returns sorted, non-overlapping hex ranges for a regional bbox at res 6', () => {
    const result = viewportToH3Ranges([-74.1, 40.6, -73.9, 40.8], 6);
    expect(result).not.toBeNull();
    expect(result!.length).toBeGreaterThan(0);
    // verify sorted by lo
    for (let i = 1; i < result!.length; i++) {
      const prevHi = BigInt('0x' + result![i - 1][1]);
      const nextLo = BigInt('0x' + result![i][0]);
      expect(nextLo > prevHi).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify pass**

Run: `pnpm test`
Expected: all three tests pass. This is a regression baseline, not TDD — the implementation already exists.

- [ ] **Step 3: Commit**

```bash
git add components/globe/utils/h3-viewport.test.ts
git commit -m "test: add baseline tests for h3-viewport range math"
```

---

## Phase 1: Infra hygiene (quick wins)

Small cleanups that improve dev experience and reduce CI drift. Independent of globe perf.

### Task 1.1: Remove per-frame console.log in onAfterRender

**Files:**
- Modify: `components/globe/GlobeMap.tsx:325-331`

- [ ] **Step 1: Replace the console.log with a dev-flag gate**

At `components/globe/GlobeMap.tsx:325-331`, replace:

```tsx
          console.log(
            `[Globe:Map] viewport z=${z.toFixed(2)} lng=${lng.toFixed(1)} lat=${lat.toFixed(1)} bounds=${
              bounds
                ? `[${bounds.map((v) => v.toFixed(1)).join(', ')}]`
                : 'null'
            }`
          );
```

with:

```tsx
          if (process.env.NODE_ENV !== 'production') {
            // Dev-only: viewport trace. Still hot on every viewport tick.
            console.log(
              `[Globe:Map] viewport z=${z.toFixed(2)} lng=${lng.toFixed(1)} lat=${lat.toFixed(1)} bounds=${
                bounds
                  ? `[${bounds.map((v) => v.toFixed(1)).join(', ')}]`
                  : 'null'
              }`
            );
          }
```

Note: `next.config.mjs` already strips `console.log` in prod via `compiler.removeConsole` (excludes `error`/`warn`), but wrapping in the env check removes the string-template work from the build bundle too.

- [ ] **Step 2: Verify dev still logs**

Run: `pnpm dev`, open `/indices`, pan the globe, observe `[Globe:Map] viewport …` still appearing.

- [ ] **Step 3: Verify prod build strips it**

```bash
pnpm build
grep -r "Globe:Map" out/_next/static/chunks/ | head -5 || echo 'stripped'
```

Expected: `stripped` (or only build-manifest noise).

- [ ] **Step 4: Commit**

```bash
git add components/globe/GlobeMap.tsx
git commit -m "perf(globe): gate per-frame viewport log behind NODE_ENV dev"
```

### Task 1.2: Fix `updateTriggers.getElevation` self-reference

**Files:**
- Modify: `components/globe/GlobeMap.tsx:492-495`

The current trigger passes the function reference as its own invalidation key. Since `getElevation` is a new function reference whenever `GlobeMap`'s parent re-renders with a new memoized accessor, this can cause layer invalidations the caller didn't intend; alternatively if it's stable it's a no-op. Align the trigger with the semantic keys that actually change.

- [ ] **Step 1: Replace the updateTriggers block**

At `components/globe/GlobeMap.tsx:492-495`:

```tsx
        updateTriggers: {
          getFillColor: [getFillColor, colorRange.min, colorRange.max],
          getElevation: [getElevation],
        },
```

with:

```tsx
        updateTriggers: {
          getFillColor: [colorRange.min, colorRange.max, extruded],
          getElevation: [extruded, elevationScale],
        },
```

Rationale: `extruded` + `elevationScale` are the props that actually change elevation semantics. `getFillColor` invalidation is already keyed by `colorRange` mutations; we drop the function reference and add `extruded` since switching modes changes the color alpha path for some sections.

- [ ] **Step 2: Verify color updates still work on timestep change**

Run: `pnpm dev`, open `/indices`, select a weather section, press play, confirm colors animate across timesteps (since `colorRange` changes per timestep).

- [ ] **Step 3: Commit**

```bash
git add components/globe/GlobeMap.tsx
git commit -m "perf(globe): tighten H3Layer updateTriggers to semantic keys"
```

### Task 1.3: Throttle pulse animation to 30 FPS

**Files:**
- Modify: `components/globe/GlobeMap.tsx:204-215`

Current RAF loop rebuilds 7 pin layers at 60 FPS. 30 FPS is visually indistinguishable for a 2.5 s cycle and halves rebuild pressure.

- [ ] **Step 1: Replace the RAF loop**

At `components/globe/GlobeMap.tsx:204-215`, replace:

```tsx
  const [pulseTick, setPulseTick] = useState(0);
  useEffect(() => {
    if (!userLocation) return;
    let raf: number;
    const loop = () => {
      // 2.5 second cycle
      setPulseTick((Date.now() % 2500) / 2500);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [userLocation]);
```

with:

```tsx
  const [pulseTick, setPulseTick] = useState(0);
  useEffect(() => {
    if (!userLocation) return;
    let raf: number;
    let last = 0;
    const FRAME_MS = 1000 / 30;
    const loop = (now: number) => {
      if (now - last >= FRAME_MS) {
        last = now;
        setPulseTick((now % 2500) / 2500);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [userLocation]);
```

- [ ] **Step 2: Verify pulse still animates smoothly**

Run: `pnpm dev`, open `/indices`, enable user location if prompted. Observe pulse rings. They should animate continuously with no visible stutter.

- [ ] **Step 3: Commit**

```bash
git add components/globe/GlobeMap.tsx
git commit -m "perf(globe): cap user-pin pulse at 30fps to halve layer rebuilds"
```

### Task 1.4: Remove dead `headers()` from static-export config

**Files:**
- Modify: `next.config.mjs`

Next.js ignores `headers()` under `output: 'export'` (warning appears at every `pnpm dev` / `pnpm build`). The config is dead code.

- [ ] **Step 1: Read the current file**

Read `next.config.mjs`. Locate the `async headers()` block (lines ~35–67 based on the audit).

- [ ] **Step 2: Delete the block**

Delete the `async headers()` method and any related constants. Leave a one-line comment at the top of the config noting that custom headers must be set on the hosting layer (GitHub Pages → requires action or custom CDN).

- [ ] **Step 3: Verify no build warning**

Run: `pnpm build`
Expected: no `Specified "headers" will not automatically work with "output: export"` warning.

- [ ] **Step 4: Commit**

```bash
git add next.config.mjs
git commit -m "chore: remove dead headers() config incompatible with static export"
```

### Task 1.5: Add type-check step to CI

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Read the current workflow**

Read `.github/workflows/deploy.yml`, locate the step that runs `bun lint` or equivalent.

- [ ] **Step 2: Insert type-check step**

Add a new step after lint and before build:

```yaml
      - name: Type check
        run: bun run type-check
```

(Or `pnpm run type-check` depending on which package manager the workflow uses — check the surrounding steps.)

- [ ] **Step 3: Verify locally**

Run: `pnpm run type-check`
Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add type-check step before build"
```

---

## Phase 2: Decouple pin-layer memoization

Currently `pinLayers` useMemo (`components/globe/GlobeMap.tsx:512-598`) depends on `pulseTick`, causing full reconstruction of 7 layers every 33 ms (post Task 1.3). Since the static dot, beam, and head never change with `pulseTick`, split them.

### Task 2.1: Split pin layers into pulse vs static

**Files:**
- Modify: `components/globe/GlobeMap.tsx:512-598`

- [ ] **Step 1: Split the useMemo**

Replace the single `pinLayers` useMemo with two:

```tsx
  // Static pin layers: dot + beam + head. Rebuild only on userLocation/h3Res/extruded change.
  const staticPinLayers = useMemo((): any[] => {
    if (!userLocation) return [];
    const pinPos = [userLocation.longitude, userLocation.latitude] as [
      number,
      number,
    ];
    const pm = pinMetrics(h3Res, extruded);
    return [
      new ScatterplotLayer({
        id: 'user-pin-center',
        data: [{ position: pinPos }],
        getPosition: (d: { position: [number, number] }) => d.position,
        getRadius: pm.dotRadius,
        getFillColor: [255, 220, 40, 200],
        radiusMinPixels: 5,
        radiusMaxPixels: 14,
      }),
      new ColumnLayer({
        id: 'user-pin-column',
        data: [{ position: pinPos }],
        getPosition: (d: { position: [number, number] }) => d.position,
        getElevation: pm.height,
        diskResolution: 12,
        radius: pm.beamRadius,
        getFillColor: [255, 200, 0, 130],
        extruded: true,
        material: { ambient: 0.9, diffuse: 0.3, shininess: 32 },
      }),
      new ColumnLayer({
        id: 'user-pin-head',
        data: [{ position: pinPos }],
        getPosition: (d: { position: [number, number] }) => d.position,
        getElevation: pm.height * 1.1,
        offset: [0, 0],
        diskResolution: 6,
        radius: pm.headRadius,
        getFillColor: [255, 220, 40, 230],
        extruded: true,
        material: { ambient: 0.95, diffuse: 0.5, shininess: 64 },
      }),
    ];
  }, [userLocation, h3Res, extruded]);

  // Pulse rings only: rebuilt every pulseTick (30fps).
  const pulseLayers = useMemo((): any[] => {
    if (!userLocation) return [];
    const pinPos = [userLocation.longitude, userLocation.latitude] as [
      number,
      number,
    ];
    const pm = pinMetrics(h3Res, extruded);
    const result: any[] = [];
    const PULSE_COUNT = 3;
    for (let i = 0; i < PULSE_COUNT; i++) {
      const phase = (pulseTick + i / PULSE_COUNT) % 1;
      const radius = pm.pulseBase + phase * pm.pulseRange;
      const alpha = Math.round((1 - phase) * 180);
      result.push(
        new ScatterplotLayer({
          id: `user-pulse-${i}`,
          data: [{ position: pinPos }],
          getPosition: (d: { position: [number, number] }) => d.position,
          getRadius: radius,
          getFillColor: [255, 200, 0, Math.round(alpha * 0.15)],
          getLineColor: [255, 200, 0, alpha],
          stroked: true,
          filled: true,
          lineWidthMinPixels: 1.5,
          radiusMinPixels: 4,
          radiusMaxPixels: 60,
        })
      );
    }
    return result;
  }, [pulseTick, userLocation, extruded, h3Res]);
```

- [ ] **Step 2: Update the combined `layers` memo**

At `components/globe/GlobeMap.tsx:601-604`, replace:

```tsx
  const layers = useMemo(
    () => [...staticLayers, ...dataLayer, ...pinLayers],
    [staticLayers, dataLayer, pinLayers]
  );
```

with:

```tsx
  const layers = useMemo(
    () => [...staticLayers, ...dataLayer, ...staticPinLayers, ...pulseLayers],
    [staticLayers, dataLayer, staticPinLayers, pulseLayers]
  );
```

- [ ] **Step 3: Type-check + run**

Run: `pnpm run type-check && pnpm dev`
Expected: no TS errors. Open `/indices`, confirm pulse + pin both visible, no regression.

- [ ] **Step 4: Commit**

```bash
git add components/globe/GlobeMap.tsx
git commit -m "perf(globe): split static pin layers from 30fps pulse rebuild"
```

---

## Phase 3: Native hyparquet filter pushdown

Replace the worker's hand-rolled `shouldSkipRowGroup` + `filterRowsByH3Ranges` + per-group `parquetReadObjects` loop with a single `parquetReadObjects({filter: {$or: [...]}})` call. hyparquet evaluates `canSkipRowGroup` internally against the same statistics, and its `parquetPlan` schedules byte-range fetches only for surviving row groups.

### Task 3.1: Add filter builder helper

**Files:**
- Create: `components/globe/utils/parquet-filter.ts`
- Modify: `components/globe/utils/h3-viewport.ts` (export BigInt ranges as well as hex strings)

- [ ] **Step 1: Update `h3-viewport.ts` to export a BigInt variant**

At the bottom of `components/globe/utils/h3-viewport.ts`, add a new exported function that returns BigInt tuples (the existing function stays for backwards-compat postMessage serialization):

```ts
/**
 * BigInt variant of viewportToH3Ranges. Used when the caller is in the same
 * thread as hyparquet (which consumes BigInts directly) and no postMessage
 * serialization is needed.
 */
export function viewportToH3RangesBigInt(
  bounds: [number, number, number, number],
  dataRes: number
): [bigint, bigint][] | null {
  const hex = viewportToH3Ranges(bounds, dataRes);
  if (!hex) return null;
  return hex.map(([lo, hi]) => [BigInt(`0x${lo}`), BigInt(`0x${hi}`)]);
}
```

- [ ] **Step 2: Create `parquet-filter.ts`**

```ts
/**
 * Build a hyparquet ParquetQueryFilter that matches any h3_index in the
 * given BigInt ranges. hyparquet uses this to:
 *   1. Skip row groups whose h3_index min/max don't overlap any range
 *      (via canSkipRowGroup against column statistics).
 *   2. Skip post-decode rows that still don't match.
 */
import type { ParquetQueryFilter } from 'hyparquet';

export function buildH3RangeFilter(
  ranges: [bigint, bigint][]
): ParquetQueryFilter | undefined {
  if (ranges.length === 0) return undefined;
  if (ranges.length === 1) {
    const [lo, hi] = ranges[0];
    return { h3_index: { $gte: lo, $lte: hi } };
  }
  return {
    $or: ranges.map(([lo, hi]) => ({
      h3_index: { $gte: lo, $lte: hi },
    })),
  };
}
```

- [ ] **Step 3: Add unit tests**

Create `components/globe/utils/parquet-filter.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildH3RangeFilter } from './parquet-filter';

describe('buildH3RangeFilter', () => {
  it('returns undefined for empty ranges', () => {
    expect(buildH3RangeFilter([])).toBeUndefined();
  });

  it('returns a flat predicate for a single range', () => {
    const f = buildH3RangeFilter([[1n, 2n]]);
    expect(f).toEqual({ h3_index: { $gte: 1n, $lte: 2n } });
  });

  it('returns $or for multiple ranges', () => {
    const f = buildH3RangeFilter([[1n, 2n], [5n, 10n]]);
    expect(f).toEqual({
      $or: [
        { h3_index: { $gte: 1n, $lte: 2n } },
        { h3_index: { $gte: 5n, $lte: 10n } },
      ],
    });
  });
});
```

- [ ] **Step 4: Run tests**

```bash
pnpm test
```

Expected: all new tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/globe/utils/parquet-filter.ts components/globe/utils/parquet-filter.test.ts components/globe/utils/h3-viewport.ts
git commit -m "feat(globe): add hyparquet filter builder for h3 ranges"
```

### Task 3.2: Swap worker to native hyparquet filter

**Files:**
- Modify: `components/globe/utils/parquet-worker.ts`

The worker currently loops over row groups, calls `shouldSkipRowGroup` by hand, then `parquetReadObjects({rowStart, rowEnd})` per group, then `filterRowsByH3Ranges`. Replace all three with one `parquetReadObjects({filter, useOffsetIndex: true})` call.

- [ ] **Step 1: Add imports**

At `components/globe/utils/parquet-worker.ts:8-15`, add `ParquetQueryFilter` to the hyparquet type imports and import the filter builder:

```ts
import {
  asyncBufferFromUrl,
  cachedAsyncBuffer,
  parquetMetadataAsync,
  parquetReadObjects,
} from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import type { AsyncBuffer, FileMetaData, ParquetQueryFilter } from 'hyparquet';
import { buildH3RangeFilter } from './parquet-filter';
```

- [ ] **Step 2: Delete the hand-rolled row-group pruning code**

Delete these helpers entirely (they are replaced by hyparquet's native equivalents):
- `shouldSkipRowGroup` at `parquet-worker.ts:182-210`
- `findH3ColIdx` at `parquet-worker.ts:213-215`
- `filterRowsByH3Ranges` at `parquet-worker.ts:218-232`

Keep `parseH3Ranges` (still needed to construct the filter) and `applyRowFilter` (handles the separate rowFilter API; unrelated to h3).

- [ ] **Step 3: Replace the fetch/parse path**

Replace the entire `self.onmessage` body from the single-group branch downward (lines ~273 onward) with a unified path:

```ts
self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, url, columns, h3Ranges: rawH3Ranges, rowFilter, cancel } = e.data;

  if (cancel) {
    cancelledIds.add(id);
    if (cancelledIds.size > CANCEL_ID_MAX) {
      const iter = cancelledIds.values();
      cancelledIds.delete(iter.next().value!);
    }
    return;
  }

  const shortUrl = url.split('/').slice(-3).join('/');

  try {
    const t0 = performance.now();
    const buffer = await smartFetch(url);
    const h3Ranges = parseH3Ranges(rawH3Ranges);
    const filter: ParquetQueryFilter | undefined = h3Ranges
      ? buildH3RangeFilter(h3Ranges)
      : undefined;

    // If we fetched the full buffer, wrap as a synchronous AsyncBuffer.
    // Otherwise use the cached range-request buffer.
    let file: AsyncBuffer;
    if (buffer) {
      file = {
        byteLength: buffer.byteLength,
        slice: (start, end) => buffer.slice(start, end),
      };
    } else {
      file = await getCachedRangeBuffer(url);
    }

    const metadata = buffer
      ? ((await parquetMetadataAsync(file)) as FileMetaData)
      : await getCachedMetadata(file, url);
    const info = extractInfo(metadata, file.byteLength);

    // Cancellation check before expensive work.
    if (cancelledIds.has(id)) {
      cancelledIds.delete(id);
      return;
    }

    let rows = (await parquetReadObjects({
      file,
      metadata,
      columns,
      compressors,
      filter,
      useOffsetIndex: true,
    })) as Record<string, unknown>[];

    rows = applyRowFilter(rows, rowFilter);

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[Worker] ${shortUrl}: ${rows.length} rows in ${(performance.now() - t0).toFixed(0)}ms (filter=${filter ? 'h3' : 'none'})`
      );
    }

    post({ id, type: 'chunk', rows });
    post({ id, type: 'done', info });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    post({ id, type: 'error', error: `${shortUrl}: ${error}` });
  }
};
```

Note: this removes the mid-stream cancellation check *between row groups*. hyparquet doesn't expose mid-parse cancellation. The practical tradeoff: most loads that get superseded happen during the fetch phase (network-bound), not during parse (CPU-bound < 1 s even for large files). Pre-fetch cancellation still works via the `cancelledIds` check above.

- [ ] **Step 4: Strip other verbose worker logs**

Gate all remaining `console.log` in the worker behind `if (process.env.NODE_ENV !== 'production')` — there are 5+ sites across the file for cache hits, supersede, etc.

- [ ] **Step 5: Type-check + build**

```bash
pnpm run type-check && pnpm build
```

Expected: both succeed.

- [ ] **Step 6: Manual verification against each Parquet size class**

Run: `pnpm dev`, open `/indices`.
1. Small file path (res 3 terrain): zoom out to globe, select terrain section, verify data loads.
2. Large file path (res 7 terrain): zoom to city-level, select terrain section, verify only the viewport area loads. Check Network tab — expected byte range requests only cover overlapping row groups.
3. Compare fetch timing in `[Worker]` log to baseline before this task. Expected ≥ 2× faster on res 7 (since pruned row groups are no longer fetched+parsed).

- [ ] **Step 7: Commit**

```bash
git add components/globe/utils/parquet-worker.ts
git commit -m "perf(parquet): push h3 filter into hyparquet for native row-group pruning"
```

### Task 3.3: Remove unused h3Ranges serialization path

**Files:**
- Modify: `components/globe/utils/parquet-loader.ts`, `parquet-worker.ts`

The hex-string BigInt serialization was needed because BigInt can't cross `postMessage` via structured clone in older runtimes. Modern Workers support BigInt in structured clone (verified in Chrome, Firefox, Safari). We can keep the serialization for now since the cost is negligible, but simplify the interface.

- [ ] **Step 1: Verify structured clone supports BigInt**

Quick check in devtools console while dev server is running:

```js
new MessageChannel().port1.postMessage({x: 1n})
```

Expected: no error.

- [ ] **Step 2: (Optional) Pass BigInt ranges directly**

If BigInt postMessage works everywhere, refactor `WorkerRequest.h3Ranges` to `[bigint, bigint][]` and drop the hex parsing. Low priority — skip unless compiler flags it or the serialization shows on a profile.

- [ ] **Step 3: Commit (if changed)**

Only commit if step 2 executed. Otherwise skip this task.

---

## Phase 4: Zero-copy columnar worker boundary

Even after Phase 3, the worker builds `Record<string, unknown>[]` (a million JS objects for res-6 buildings) and postMessages that array. Structured clone of 2 M objects with 10 keys each is expensive. Switch to columnar transfer: per-column typed arrays, transferred zero-copy.

**Scope note:** deck.gl's `H3HexagonLayer` accessor expects a string hexagon per row, so we can't feed it raw typed arrays. But we can:
1. Build a minimal `{length, columns: {...}}` object on the main thread where `columns.h3_index` is a `BigUint64Array` and `columns.value` is a `Float32Array`.
2. Pass deck.gl an array-like data shim that proxies to those columns by index, OR materialize a thin row view lazily on the first render (still allocates objects but just once per load).

The bigger immediate win is the postMessage cost, not the layer accessor cost. This phase focuses on the boundary.

### Task 4.1: Columnar worker response

**Files:**
- Modify: `components/globe/utils/parquet-worker.ts`
- Modify: `components/globe/utils/parquet-loader.ts`

- [ ] **Step 1: Extend `WorkerResponse` with a columnar shape**

In `parquet-worker.ts`, add a new response variant:

```ts
export type WorkerResponse =
  | { id: number; type: 'chunk'; rows: Record<string, unknown>[] }
  | {
      id: number;
      type: 'columnar';
      length: number;
      columns: Record<string, ArrayBufferView>;
    }
  | { id: number; type: 'done'; info: ParquetInfo }
  | { id: number; type: 'error'; error: string };
```

- [ ] **Step 2: Switch worker to use `onChunk` columnar callback**

Replace the `parquetReadObjects` call with `parquetRead` + `onChunk` so we receive per-column `DecodedArray`s already in columnar form.

```ts
import { parquetRead } from 'hyparquet';
// …

const columnBuffers: Record<string, ArrayBufferView[]> = {};
await parquetRead({
  file,
  metadata,
  columns,
  compressors,
  filter,
  useOffsetIndex: true,
  rowFormat: 'object',
  onComplete: () => {
    /* rows not needed in columnar path */
  },
  onChunk: ({ columnName, columnData }) => {
    // columnData is a typed array (Int32/Int64/Float32/…) or a regular Array
    if (!columnBuffers[columnName]) columnBuffers[columnName] = [];
    columnBuffers[columnName].push(columnData as ArrayBufferView);
  },
});
```

Concatenate the column buffers into single typed arrays. Collect transferable buffers:

```ts
const merged: Record<string, ArrayBufferView> = {};
const transfer: ArrayBuffer[] = [];
let length = 0;
for (const [name, chunks] of Object.entries(columnBuffers)) {
  const first = chunks[0];
  // Rebuild as a single typed array of the same kind.
  const total = chunks.reduce((a, c) => a + (c as ArrayBufferView).byteLength / (first as TypedArray).BYTES_PER_ELEMENT, 0);
  const Ctor = first.constructor as new (len: number) => TypedArray;
  const out = new Ctor(total);
  let offset = 0;
  for (const c of chunks as TypedArray[]) {
    out.set(c, offset);
    offset += c.length;
  }
  merged[name] = out;
  transfer.push(out.buffer);
  length = offset; // all columns share length
}

(self as unknown as Worker).postMessage(
  { id, type: 'columnar', length, columns: merged } as WorkerResponse,
  transfer
);
```

Note: `DecodedArray` from hyparquet may be a regular `number[]` for some types (e.g. decoded strings). For those, fall back to the old row-object path. Add a capability check: if every column of interest decodes to a TypedArray, use columnar; otherwise fall back to the existing row path.

- [ ] **Step 3: Update loader to accept columnar responses**

In `parquet-loader.ts`, add to `LoadResult`:

```ts
export interface LoadResult {
  rows: Record<string, unknown>[];
  info: ParquetInfo | null;
  /** Populated when the worker sent columnar data. Rows array is empty. */
  columns?: {
    length: number;
    data: Record<string, ArrayBufferView>;
  };
}
```

Handle the new `'columnar'` message type in the worker listener: store it on the pending request and resolve on `'done'`.

- [ ] **Step 4: Build a row-view proxy for backwards compat**

Most callers still expect `rows: Record<string, unknown>[]`. Provide a helper:

```ts
export function columnarToRows(
  columnar: { length: number; data: Record<string, ArrayBufferView> }
): Record<string, unknown>[] {
  const keys = Object.keys(columnar.data);
  const arrays = keys.map((k) => columnar.data[k] as ArrayLike<unknown>);
  const rows = new Array(columnar.length);
  for (let i = 0; i < columnar.length; i++) {
    const row: Record<string, unknown> = {};
    for (let k = 0; k < keys.length; k++) row[keys[k]] = arrays[k][i];
    rows[i] = row;
  }
  return rows;
}
```

Use this helper from `GlobeExplorer.tsx` when a `columnar` result comes back. This still allocates objects but **on the main thread only once per load**, not per postMessage — and it's the same work deck.gl would have done anyway when iterating accessors.

- [ ] **Step 5: Type-check + build + dev test**

```bash
pnpm run type-check && pnpm build && pnpm dev
```

Visit `/indices`, load a res-6 building dataset, observe load completes end-to-end. Compare main-thread blocking in devtools Performance panel to baseline: expected shorter main-thread stalls on `'chunk'` receipt.

- [ ] **Step 6: Commit**

```bash
git add components/globe/utils/parquet-worker.ts components/globe/utils/parquet-loader.ts
git commit -m "perf(parquet): columnar worker response with transferable typed arrays"
```

### Task 4.2: (Optional) Deck.gl data-view to read columns directly

**Files:**
- Modify: `components/globe/GlobeExplorer.tsx`
- Modify: `components/globe/GlobeMap.tsx`

Deck.gl accepts a `{length, …}` sparse object as data when accessors read by index. This skips the row-materialization step entirely for accessors that only need numeric/BigInt columns.

- [ ] **Step 1: Prototype a columnar data view**

In `GlobeExplorer.tsx`, when a columnar result is available, build:

```tsx
const data = useMemo(() => {
  if (!columnar) return allRows;
  const { length, data: cols } = columnar;
  const h3 = cols.h3_index as BigInt64Array;
  const val = cols[valueColumn] as Float32Array;
  return Array.from({ length }, (_, i) => ({
    h3_index: h3[i],
    [valueColumn]: val[i],
  }));
  // ^ this still allocates per row. See step 2 for the zero-copy version.
}, [columnar, allRows, valueColumn]);
```

- [ ] **Step 2: True zero-copy via indexed accessors**

Deck.gl accessors receive `(object, {index, data})`. If we set `data = {length: N}` (no `.map`/`.filter` compatible API) and accessors read from captured typed arrays, layers never iterate the row objects. Test with one section first; most `formatTooltip` functions access properties directly on row objects, so tooltip path needs adaptation.

Given the complexity, **mark Task 4.2 as stretch**. Phase 4.1 already captures the dominant postMessage win.

- [ ] **Step 3: Commit (if attempted)**

Skip if not attempted in this iteration.

---

## Phase 5: Data-layout recommendations (producer-side, docs only)

These are not code changes to this repo — they are notes for the Parquet producer (the DuckDB pipeline that writes files to Source Coop). File them in `docs/` for the team.

### Task 5.1: Document row-group sizing guidance

**Files:**
- Create: `docs/parquet-producer-guidance.md`

- [ ] **Step 1: Write the doc**

Content outline:

```markdown
# Parquet Producer Guidance

Observations from `duckdb` inspection of our indices on 2026-04-14:

- `h3_res ≤ 5` files are written as single row groups (e.g. building res=5 = 399 k rows in 1 group, 13 MB).
- At these sizes, viewport-based H3 row-group pruning in the web worker has no effect. The full file is fetched and parsed even when the user only sees 1 % of the globe.

## Recommendation

When writing indices via `COPY … TO … (FORMAT PARQUET, ROW_GROUP_SIZE N)`:

- For `h3_res 3` (tiny files < 500 KB): leave at 1 row group.
- For `h3_res 4–5`: target `ROW_GROUP_SIZE = 131072` (128 k rows) → roughly 4–8 groups per file. Enables viewport pruning at these resolutions.
- For `h3_res 6+`: current sizing (~1 M rows / group) is good.

Also consider enabling page-level indexes:

```sql
COPY … TO 'file.parquet' (FORMAT PARQUET, WRITE_STATISTICS 1, ENABLE_STATISTICS 1, WRITE_PAGE_STATISTICS 1);
```

The web worker enables `useOffsetIndex: true` in hyparquet; if files contain offset indexes, hyparquet can prune below row-group granularity.

## Sort order

`h3_index` is already sorted across row groups (verified). Keep this — it is what enables the `$gte/$lte` filter in hyparquet to skip entire row groups via min/max stats.

## Bloom filters

DuckDB writes bloom filters on dictionary-encoded columns (e.g. `building_count`) by default. These do not help our H3 range queries and can be disabled to reduce file size:

```sql
COPY … TO 'file.parquet' (FORMAT PARQUET, BLOOM_FILTER_FALSE_POSITIVE_RATIO 0.0);
```

Or keep them — storage cost is modest and they don't slow reads.
```

- [ ] **Step 2: Commit**

```bash
git add docs/parquet-producer-guidance.md
git commit -m "docs: parquet row-group sizing and index guidance"
```

---

## Verification after each phase

Run after Phase 1, 2, 3 and at the end:

```bash
pnpm run type-check
pnpm run lint
pnpm build
pnpm test            # after Phase 0
```

Manual verification on `/indices`:
1. Switch between sections (terrain → buildings → weather) — each loads.
2. Play a time-series section — timesteps animate without stutter.
3. Zoom to city level at res 7 — only nearby tiles fetched (check Network tab).
4. Pan across antimeridian — no blank viewport.
5. User location pin (if granted) — pulse animates at ~30 FPS.

Expected improvements by phase:
- Phase 1: -1 frame of jank on pan (viewport-log strip), -1 log flood in dev.
- Phase 2: halved layer-rebuild pressure during pulse.
- Phase 3: res-7 terrain loads drop from ~500 MB fetch to pruned byte-range subset; time-to-first-render improves proportional to viewport coverage (~5–20× speedup for city-level views).
- Phase 4: main-thread postMessage cost drops from O(rows × cols) structured clone to O(1) ArrayBuffer transfer.
- Phase 5 (producer side, out of repo): makes Phase 3 gains apply at res 4–5 too.

---

## Self-review checklist

- [x] Every task has exact file paths + line numbers from the audit.
- [x] Every code change shows the code (no "add appropriate error handling" placeholders).
- [x] Verification step on every task is concrete.
- [x] TDD is applied where tests exist (Phase 0 sets up vitest; Phases 3.1 test pure utils). Frontend visual verification is explicit for paths where no test infrastructure fits.
- [x] Naming is consistent: `buildH3RangeFilter`, `viewportToH3Ranges`, `viewportToH3RangesBigInt` are defined once and reused.
- [x] Commit messages follow the repo's existing convention (`chore:`, `perf(scope):`, `feat(scope):`, `docs:`, `test:` — see `git log`).

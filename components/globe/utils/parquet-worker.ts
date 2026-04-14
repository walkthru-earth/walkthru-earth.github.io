/**
 * Web Worker for off-main-thread Parquet parsing.
 *
 * Small files (< 5 MB): single GET, parsed from ArrayBuffer. No HEAD overhead.
 * Large files: range-request AsyncBuffer with native hyparquet filter pushdown
 * for row-group pruning based on h3_index column statistics.
 *
 * Columnar fast path: numeric columns arrive from hyparquet as TypedArrays
 * via onChunk. We concatenate per-column chunks and postMessage the
 * backing ArrayBuffers zero-copy via the transfer list. The main thread
 * materializes row objects from the columnar view. Falls back to the
 * row-object path (parquetReadObjects + structured clone) if any chunk
 * decodes as a non-typed-array (e.g. BYTE_ARRAY strings).
 */

import {
  asyncBufferFromUrl,
  cachedAsyncBuffer,
  parquetMetadataAsync,
  parquetRead,
  parquetReadObjects,
} from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import type {
  AsyncBuffer,
  ColumnData,
  FileMetaData,
  ParquetQueryFilter,
} from 'hyparquet';
import { buildH3RangeFilter } from './parquet-filter';

/** Simple LRU cache — evicts oldest entry when size exceeds max. */
function lruSet<K, V>(map: Map<K, V>, key: K, value: V, maxSize: number) {
  if (map.size >= maxSize) {
    // Map iteration order is insertion order — delete first (oldest) key
    const oldest = map.keys().next().value;
    if (oldest !== undefined) map.delete(oldest);
  }
  map.set(key, value);
}

/** Files under this threshold are read from a single GET response. */
const FULL_FETCH_THRESHOLD = 5 * 1024 * 1024; // 5 MB

/** Row-level filter: keep only rows where column > threshold. */
export interface RowFilter {
  column: string;
  gt: number;
}

export interface WorkerRequest {
  id: number;
  url: string;
  columns?: string[];
  /** Hex-encoded BigInt [min, max] pairs for viewport H3 filtering. */
  h3Ranges?: [string, string][];
  /** Optional row-level filter applied inside the worker before posting. */
  rowFilter?: RowFilter;
  /** Set to true to cancel an in-flight request with the given id. */
  cancel?: boolean;
}

/** Serializable subset of Parquet file metadata for the UI. */
export interface ParquetInfo {
  fileSize: number;
  numRows: number;
  numRowGroups: number;
  columns: {
    name: string;
    type: string | undefined;
    codec: string | undefined;
  }[];
  createdBy: string | undefined;
  parquetVersion: number;
}

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

/** Cache small-file ArrayBuffers so repeated loads are instant. */
const fullFileCache = new Map<string, Promise<ArrayBuffer | null>>();

/** Cache range-request AsyncBuffers for large files. */
const rangeBufferCache = new Map<string, Promise<AsyncBuffer>>();
const metadataCache = new Map<string, Promise<FileMetaData>>();

/** URLs known to be large — avoids repeated GET + cancel cycles. Capped to prevent unbounded growth. */
const knownLargeFiles = new Set<string>();
const KNOWN_LARGE_MAX = 30;

/**
 * Smart fetch: starts a GET, checks Content-Length from response headers.
 * Small file → reads full body (1 round trip, no HEAD).
 * Large file → cancels body, returns null so caller can use range requests.
 *
 * Only caches small-file ArrayBuffers. Large files are remembered in a
 * separate set so subsequent requests skip the GET entirely.
 */
function smartFetch(url: string): Promise<ArrayBuffer | null> {
  // Already known to be large — skip GET entirely
  if (knownLargeFiles.has(url)) return Promise.resolve(null);

  const entry = fullFileCache.get(url);
  if (entry) return entry;

  const promise = (async (): Promise<ArrayBuffer | null> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const cl = Number(res.headers.get('content-length') || 0);
    if (cl > FULL_FETCH_THRESHOLD) {
      await res.body?.cancel();
      if (knownLargeFiles.size >= KNOWN_LARGE_MAX) {
        knownLargeFiles.delete(knownLargeFiles.values().next().value!);
      }
      knownLargeFiles.add(url);
      return null;
    }

    return res.arrayBuffer();
  })();

  // Cache the promise; remove on error or null result
  lruSet(fullFileCache, url, promise, 10);
  promise
    .then((buf) => {
      if (!buf) fullFileCache.delete(url);
    })
    .catch(() => fullFileCache.delete(url));

  return promise;
}

function getCachedRangeBuffer(url: string): Promise<AsyncBuffer> {
  let entry = rangeBufferCache.get(url);
  if (!entry) {
    entry = asyncBufferFromUrl({ url }).then((buf) => cachedAsyncBuffer(buf));
    lruSet(rangeBufferCache, url, entry, 8);
    entry.catch(() => rangeBufferCache.delete(url));
  }
  return entry;
}

function getCachedMetadata(
  file: AsyncBuffer,
  url: string
): Promise<FileMetaData> {
  let entry = metadataCache.get(url);
  if (!entry) {
    entry = parquetMetadataAsync(file) as Promise<FileMetaData>;
    lruSet(metadataCache, url, entry, 8);
    entry.catch(() => metadataCache.delete(url));
  }
  return entry;
}

function post(msg: WorkerResponse, transfer?: Transferable[]) {
  const w = self as unknown as Worker;
  if (transfer && transfer.length > 0) {
    w.postMessage(msg, transfer);
  } else {
    w.postMessage(msg);
  }
}

function extractInfo(metadata: FileMetaData, fileSize: number): ParquetInfo {
  // Schema[0] is the root element; columns start at index 1
  const columns = metadata.schema
    .slice(1)
    .filter((s) => s.type)
    .map((s) => ({
      name: s.name,
      type: s.type,
      codec: metadata.row_groups[0]?.columns.find(
        (c) => c.meta_data?.path_in_schema.at(-1) === s.name
      )?.meta_data?.codec,
    }));
  return {
    fileSize,
    numRows: Number(metadata.num_rows),
    numRowGroups: metadata.row_groups.length,
    columns,
    createdBy: metadata.created_by,
    parquetVersion: metadata.version,
  };
}

/* ── H3 viewport filtering helpers ──────────────────────────────────── */

/** Parse hex-string ranges from postMessage into BigInt pairs. */
function parseH3Ranges(raw?: [string, string][]): [bigint, bigint][] | null {
  if (!raw || raw.length === 0) return null;
  return raw.map(([lo, hi]) => [BigInt(`0x${lo}`), BigInt(`0x${hi}`)]);
}

/** Apply a row-level column filter (keep rows where column > threshold). */
function applyRowFilter(
  rows: Record<string, unknown>[],
  filter: RowFilter | undefined
): Record<string, unknown>[] {
  if (!filter) return rows;
  return rows.filter((r) => Number(r[filter.column]) > filter.gt);
}

/** IDs that have been cancelled — checked before expensive parse to abort early. */
const cancelledIds = new Set<number>();

/** Prevent cancelledIds from growing unbounded if cancel arrives after completion. */
const CANCEL_ID_MAX = 50;

/* ── Columnar helpers ──────────────────────────────────────────────── */

/**
 * Typed array constructors we accept on the zero-copy columnar path.
 * Any chunk whose concrete class is not in this set forces the row-object
 * fallback. BigUint64Array is included for completeness (parquet UINT64).
 */
type TypedArrayCtor =
  | typeof Uint8Array
  | typeof Int32Array
  | typeof Uint32Array
  | typeof Float32Array
  | typeof Float64Array
  | typeof BigInt64Array
  | typeof BigUint64Array;

/**
 * Accumulated chunks for a single column, tagged with the constructor of the
 * first chunk. Any subsequent chunk with a different constructor invalidates
 * the columnar path.
 */
interface ColumnAccumulator {
  ctor: TypedArrayCtor | null; // null = not a typed array → fallback
  chunks: ArrayLike<unknown>[]; // raw chunks in arrival order
  total: number; // sum of chunk.length
}

function isSupportedTypedArray(v: unknown): TypedArrayCtor | null {
  if (v instanceof BigInt64Array) return BigInt64Array;
  if (v instanceof Float64Array) return Float64Array;
  if (v instanceof Float32Array) return Float32Array;
  if (v instanceof Int32Array) return Int32Array;
  if (v instanceof Uint32Array) return Uint32Array;
  if (v instanceof BigUint64Array) return BigUint64Array;
  if (v instanceof Uint8Array) return Uint8Array;
  return null;
}

/**
 * Concatenate same-typed-array chunks into a fresh contiguous TypedArray.
 * The returned array owns a standalone ArrayBuffer safe to transfer.
 */
function concatTypedArray(
  ctor: TypedArrayCtor,
  chunks: ArrayLike<unknown>[],
  total: number
): ArrayBufferView {
  // The constructor is polymorphic over numeric vs bigint variants; TS can't
  // express "give me a new instance of the same kind" without a cast.
  const out = new (ctor as unknown as new (n: number) => ArrayBufferView & {
    set: (arr: ArrayLike<unknown>, offset: number) => void;
  })(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/**
 * Build a keep-mask over `h3_index` for the given H3 ranges. Returns a
 * Uint8Array of length N where 1 = keep, 0 = drop. If `h3Ranges` is null
 * the entire range is kept (returns null to signal "no filter").
 */
function buildH3KeepMask(
  h3: BigInt64Array,
  h3Ranges: [bigint, bigint][] | null
): Uint8Array | null {
  if (!h3Ranges) return null;
  const n = h3.length;
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const v = h3[i];
    for (let r = 0; r < h3Ranges.length; r++) {
      const [lo, hi] = h3Ranges[r];
      if (v >= lo && v <= hi) {
        mask[i] = 1;
        break;
      }
    }
  }
  return mask;
}

/** Compact the row-level filter (column > gt) into the mask (AND). */
function andRowFilterIntoMask(
  mask: Uint8Array | null,
  n: number,
  col: ArrayBufferView | undefined,
  rf: RowFilter
): Uint8Array {
  const m = mask ?? new Uint8Array(n).fill(1);
  if (!col) return m;
  const arr = col as unknown as ArrayLike<number | bigint>;
  const gt = rf.gt;
  for (let i = 0; i < n; i++) {
    if (m[i] === 0) continue;
    const v = arr[i];
    const num = typeof v === 'bigint' ? Number(v) : (v as number);
    if (!(num > gt)) m[i] = 0;
  }
  return m;
}

/** Count 1 bits in a Uint8Array-style mask. */
function popcount(mask: Uint8Array): number {
  let c = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i]) c++;
  return c;
}

/**
 * Apply a keep-mask to a TypedArray, returning a new compact TypedArray of
 * the same kind with a fresh, transferable ArrayBuffer.
 */
function applyMaskTyped(
  src: ArrayBufferView,
  mask: Uint8Array,
  kept: number
): ArrayBufferView {
  const Ctor = src.constructor as unknown as new (n: number) => ArrayBufferView;
  const out = new Ctor(kept) as unknown as {
    [k: number]: number | bigint;
    length: number;
  };
  const s = src as unknown as ArrayLike<number | bigint>;
  let w = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i]) {
      out[w++] = s[i];
    }
  }
  return out as unknown as ArrayBufferView;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, url, columns, h3Ranges: rawH3Ranges, rowFilter, cancel } = e.data;

  // Handle cancellation requests
  if (cancel) {
    cancelledIds.add(id);
    // Prune oldest entries if the set grows too large (cancel arrived after done)
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
        slice: (start: number, end: number) => buffer.slice(start, end),
      };
    } else {
      file = await getCachedRangeBuffer(url);
    }

    const metadata = buffer
      ? ((await parquetMetadataAsync(file)) as FileMetaData)
      : await getCachedMetadata(file, url);
    const info = extractInfo(metadata, file.byteLength);

    // Pre-parse cancellation check. Once parquetRead is called, we can no
    // longer cancel mid-parse — hyparquet does not expose an abort hook.
    // Supersedes typically happen during the network fetch phase (bounded
    // above), not during the CPU-bound parse.
    if (cancelledIds.has(id)) {
      cancelledIds.delete(id);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Worker] ${shortUrl}: cancelled before parse`);
      }
      return;
    }

    /* ── Columnar fast path ──────────────────────────────────────────
     * parquetRead with onChunk gives us the row-group-pruned column data
     * as TypedArrays (for numeric columns). onChunk is NOT row-filtered
     * by hyparquet, so we apply the H3 range filter + rowFilter ourselves
     * at columnar level (cheap: mask + compact) before transferring.
     *
     * If any column chunk arrives as a plain Array (e.g. BYTE_ARRAY
     * strings, struct types), flip to fallback and defer to the existing
     * parquetReadObjects path.
     */
    const acc: Record<string, ColumnAccumulator> = Object.create(null);
    let fallback = false;

    const onChunk = (chunk: ColumnData) => {
      if (fallback) return;
      if (cancelledIds.has(id)) return; // mid-parse cancel hint
      const ctor = isSupportedTypedArray(chunk.columnData);
      let slot = acc[chunk.columnName];
      if (!slot) {
        slot = { ctor, chunks: [], total: 0 };
        acc[chunk.columnName] = slot;
      }
      if (ctor === null || slot.ctor === null || slot.ctor !== ctor) {
        fallback = true;
        return;
      }
      slot.chunks.push(chunk.columnData as unknown as ArrayLike<unknown>);
      slot.total += chunk.columnData.length;
    };

    await parquetRead({
      file,
      metadata,
      columns,
      compressors,
      filter,
      useOffsetIndex: true,
      onChunk,
    });

    // Post-parse cancellation: silently drop the result.
    if (cancelledIds.has(id)) {
      cancelledIds.delete(id);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Worker] ${shortUrl}: cancelled after parse`);
      }
      return;
    }

    if (!fallback) {
      // Concatenate per-column chunks into single TypedArrays.
      const colNames = Object.keys(acc);
      const unfiltered: Record<string, ArrayBufferView> = Object.create(null);
      let unfilteredLength = 0;
      for (const name of colNames) {
        const slot = acc[name];
        if (slot.ctor === null) {
          // Defensive: should have been caught above.
          fallback = true;
          break;
        }
        unfiltered[name] = concatTypedArray(slot.ctor, slot.chunks, slot.total);
        if (unfilteredLength === 0) unfilteredLength = slot.total;
        else if (slot.total !== unfilteredLength) {
          // Columns disagree on row count — unexpected; force fallback.
          fallback = true;
          break;
        }
      }

      if (!fallback) {
        // Apply H3 filter + rowFilter at columnar level. The hyparquet
        // `filter` we passed only prunes row groups; within a selected
        // row group every row still flows through onChunk.
        let mask: Uint8Array | null = null;
        if (h3Ranges) {
          const h3 = unfiltered['h3_index'];
          if (h3 instanceof BigInt64Array) {
            mask = buildH3KeepMask(h3, h3Ranges);
          }
        }
        if (rowFilter) {
          mask = andRowFilterIntoMask(
            mask,
            unfilteredLength,
            unfiltered[rowFilter.column],
            rowFilter
          );
        }

        let outLength: number;
        const out: Record<string, ArrayBufferView> = Object.create(null);
        if (mask) {
          outLength = popcount(mask);
          if (outLength === unfilteredLength) {
            // No rows dropped — skip the compact step.
            for (const name of colNames) out[name] = unfiltered[name];
          } else if (outLength === 0) {
            // Emit zero-length views (still typed-array-shaped).
            for (const name of colNames) {
              const src = unfiltered[name];
              const Ctor = src.constructor as unknown as new (
                n: number
              ) => ArrayBufferView;
              out[name] = new Ctor(0);
            }
          } else {
            for (const name of colNames) {
              out[name] = applyMaskTyped(unfiltered[name], mask, outLength);
            }
          }
        } else {
          outLength = unfilteredLength;
          for (const name of colNames) out[name] = unfiltered[name];
        }

        const transfer: Transferable[] = [];
        for (const name of colNames) {
          const buf = out[name].buffer;
          // Avoid duplicate transfers if two columns somehow share a buffer.
          if (buf && !transfer.includes(buf)) transfer.push(buf);
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `[Worker] ${shortUrl}: ${outLength} rows columnar in ${(performance.now() - t0).toFixed(0)}ms (filter=${filter ? 'h3' : 'none'}, src=${buffer ? 'full' : 'range'})`
          );
        }

        post(
          {
            id,
            type: 'columnar',
            length: outLength,
            columns: out,
          },
          transfer
        );
        post({ id, type: 'done', info });
        return;
      }
    }

    // Fallback: row-object path for BYTE_ARRAY strings, structs, etc.
    // We re-read via parquetReadObjects to get row format. The prior
    // onChunk run already decoded the column data, but hyparquet has no
    // public API to reuse it; re-reading is the simplest correct path.
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
        `[Worker] ${shortUrl}: ${rows.length} rows fallback in ${(performance.now() - t0).toFixed(0)}ms (filter=${filter ? 'h3' : 'none'}, src=${buffer ? 'full' : 'range'})`
      );
    }

    post({ id, type: 'chunk', rows });
    post({ id, type: 'done', info });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    post({ id, type: 'error', error: `${shortUrl}: ${error}` });
  }
};

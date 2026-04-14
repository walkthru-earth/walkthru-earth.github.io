/**
 * Web Worker for off-main-thread Parquet parsing.
 *
 * Small files (< 5 MB): single GET, parsed from ArrayBuffer. No HEAD overhead.
 * Large files: range-request AsyncBuffer with native hyparquet filter pushdown
 * for row-group pruning based on h3_index column statistics.
 */

import {
  asyncBufferFromUrl,
  cachedAsyncBuffer,
  parquetMetadataAsync,
  parquetReadObjects,
} from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import type { AsyncBuffer, FileMetaData, ParquetQueryFilter } from 'hyparquet';
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

function post(msg: WorkerResponse) {
  (self as unknown as Worker).postMessage(msg);
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

    // Pre-parse cancellation check. Once parquetReadObjects is called, we
    // can no longer cancel mid-parse — hyparquet does not expose an abort
    // hook. This is an acceptable tradeoff because supersedes typically
    // happen during the network fetch phase (bounded above), not during the
    // CPU-bound parse (sub-second even for large files once bytes are in).
    if (cancelledIds.has(id)) {
      cancelledIds.delete(id);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Worker] ${shortUrl}: cancelled before parse`);
      }
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
        `[Worker] ${shortUrl}: ${rows.length} rows in ${(performance.now() - t0).toFixed(0)}ms (filter=${filter ? 'h3' : 'none'}, src=${buffer ? 'full' : 'range'})`
      );
    }

    post({ id, type: 'chunk', rows });
    post({ id, type: 'done', info });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    post({ id, type: 'error', error: `${shortUrl}: ${error}` });
  }
};

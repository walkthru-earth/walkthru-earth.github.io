/**
 * Web Worker for off-main-thread Parquet parsing.
 *
 * Small files (< 5 MB): single GET, parsed from ArrayBuffer. No HEAD overhead.
 * Large files: range-request AsyncBuffer with progressive row-group streaming.
 */

import {
  asyncBufferFromUrl,
  cachedAsyncBuffer,
  parquetMetadataAsync,
  parquetReadObjects,
} from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import type { AsyncBuffer, FileMetaData } from 'hyparquet';

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

export interface WorkerRequest {
  id: number;
  url: string;
  columns?: string[];
  /** Hex-encoded BigInt [min, max] pairs for viewport H3 filtering. */
  h3Ranges?: [string, string][];
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

/** URLs known to be large — avoids repeated GET + cancel cycles. */
const knownLargeFiles = new Set<string>();

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

/**
 * Check if a row group's h3_index range overlaps any viewport range.
 * Returns true (skip) when there is NO overlap.
 */
function shouldSkipRowGroup(
  rg: FileMetaData['row_groups'][number],
  h3Ranges: [bigint, bigint][],
  h3ColIdx: number
): boolean {
  const colChunk = rg.columns[h3ColIdx];
  const stats = colChunk?.meta_data?.statistics;
  if (!stats) return false; // no stats → can't prune, keep to be safe

  const rgMin =
    typeof stats.min_value === 'bigint'
      ? stats.min_value
      : typeof stats.min === 'bigint'
        ? stats.min
        : null;
  const rgMax =
    typeof stats.max_value === 'bigint'
      ? stats.max_value
      : typeof stats.max === 'bigint'
        ? stats.max
        : null;

  if (rgMin === null || rgMax === null) return false;

  for (const [lo, hi] of h3Ranges) {
    if (hi >= rgMin && lo <= rgMax) return false; // overlaps → keep
  }
  return true; // no overlap → skip
}

/** Find the column index for h3_index in the parquet schema. */
function findH3ColIdx(metadata: FileMetaData): number {
  return metadata.schema.slice(1).findIndex((s) => s.name === 'h3_index');
}

/** Filter parsed rows to only those whose h3_index falls in a range. */
function filterRowsByH3Ranges(
  rows: Record<string, unknown>[],
  h3Ranges: [bigint, bigint][]
): Record<string, unknown>[] {
  return rows.filter((row) => {
    const v = row.h3_index;
    const idx =
      typeof v === 'bigint' ? v : typeof v === 'number' ? BigInt(v) : null;
    if (idx === null) return true; // keep rows without h3_index
    for (const [lo, hi] of h3Ranges) {
      if (idx >= lo && idx <= hi) return true;
    }
    return false;
  });
}

/** IDs that have been cancelled — checked between row groups to abort early. */
const cancelledIds = new Set<number>();

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, url, columns, h3Ranges: rawH3Ranges, cancel } = e.data;

  // Handle cancellation requests
  if (cancel) {
    cancelledIds.add(id);
    return;
  }

  const shortUrl = url.split('/').slice(-3).join('/');

  try {
    const t0 = performance.now();

    // Try single GET — returns ArrayBuffer for small files, null for large
    const buffer = await smartFetch(url);

    const h3Ranges = parseH3Ranges(rawH3Ranges);

    if (buffer) {
      // Small file: parse from in-memory buffer
      const t1 = performance.now();
      console.log(
        `[Worker] ${shortUrl}: ${(buffer.byteLength / 1024).toFixed(0)}KB fetched in ${(t1 - t0).toFixed(0)}ms`
      );
      const file = {
        byteLength: buffer.byteLength,
        slice: (start: number, end: number) => buffer.slice(start, end),
      };
      const metadata = (await parquetMetadataAsync(file)) as FileMetaData;
      let rows = (await parquetReadObjects({
        file,
        metadata,
        compressors,
        columns,
      })) as Record<string, unknown>[];
      if (h3Ranges) {
        const before = rows.length;
        rows = filterRowsByH3Ranges(rows, h3Ranges);
        console.log(
          `[Worker] ${shortUrl}: viewport filter ${before} → ${rows.length} rows`
        );
      }
      console.log(
        `[Worker] ${shortUrl}: ${rows.length} rows parsed in ${(performance.now() - t1).toFixed(0)}ms (total ${(performance.now() - t0).toFixed(0)}ms)`
      );
      post({ id, type: 'chunk', rows });
      post({
        id,
        type: 'done',
        info: extractInfo(metadata, buffer.byteLength),
      });
      return;
    }

    // Large file: range-request streaming
    const file = await getCachedRangeBuffer(url);
    const metadata = await getCachedMetadata(file, url);
    const rowGroups = metadata.row_groups;

    console.log(
      `[Worker] ${shortUrl}: ${(file.byteLength / 1024).toFixed(0)}KB, ${rowGroups.length} row groups → range requests`
    );

    const info = extractInfo(metadata, file.byteLength);

    const h3ColIdx = h3Ranges ? findH3ColIdx(metadata) : -1;

    if (rowGroups.length <= 1) {
      // Single row group — skip entirely if stats say no overlap
      if (
        h3Ranges &&
        h3ColIdx >= 0 &&
        rowGroups.length === 1 &&
        shouldSkipRowGroup(rowGroups[0], h3Ranges, h3ColIdx)
      ) {
        console.log(
          `[Worker] ${shortUrl}: single row group outside viewport, skipped`
        );
        post({ id, type: 'chunk', rows: [] });
        post({ id, type: 'done', info });
        return;
      }
      let rows = (await parquetReadObjects({
        file,
        metadata,
        columns,
        compressors,
      })) as Record<string, unknown>[];
      if (h3Ranges) rows = filterRowsByH3Ranges(rows, h3Ranges);
      console.log(`[Worker] ${shortUrl}: ${rows.length} rows (single group)`);
      post({ id, type: 'chunk', rows });
      post({ id, type: 'done', info });
      return;
    }

    // Stream row groups progressively, skipping those outside viewport
    let rowStart = 0;
    let sentRows = 0;
    let skippedGroups = 0;
    for (let i = 0; i < rowGroups.length; i++) {
      // Check for cancellation between row groups
      if (cancelledIds.has(id)) {
        cancelledIds.delete(id);
        console.log(
          `[Worker] ${shortUrl}: cancelled after ${i}/${rowGroups.length} groups`
        );
        return; // silently stop — no done/error message
      }

      const rg = rowGroups[i];
      const numRows = Number(rg.num_rows);
      const rowEnd = rowStart + numRows;

      // Row-group pruning via h3_index statistics
      if (
        h3Ranges &&
        h3ColIdx >= 0 &&
        shouldSkipRowGroup(rg, h3Ranges, h3ColIdx)
      ) {
        skippedGroups++;
        rowStart = rowEnd;
        continue;
      }

      let rows = (await parquetReadObjects({
        file,
        metadata,
        columns,
        compressors,
        rowStart,
        rowEnd,
      })) as Record<string, unknown>[];

      // Fine-grained filter within kept row groups
      if (h3Ranges) rows = filterRowsByH3Ranges(rows, h3Ranges);

      if (rows.length > 0) {
        sentRows += rows.length;
        console.log(
          `[Worker] ${shortUrl}: group ${i + 1}/${rowGroups.length} → +${rows.length} (${sentRows} total)`
        );
        post({ id, type: 'chunk', rows });
      }

      rowStart = rowEnd;
    }

    if (skippedGroups > 0) {
      console.log(
        `[Worker] ${shortUrl}: skipped ${skippedGroups}/${rowGroups.length} row groups (outside viewport)`
      );
    }
    console.log(
      `[Worker] ${shortUrl}: done, ${sentRows} rows in ${(performance.now() - t0).toFixed(0)}ms`
    );
    post({ id, type: 'done', info });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    post({ id, type: 'error', error });
  }
};

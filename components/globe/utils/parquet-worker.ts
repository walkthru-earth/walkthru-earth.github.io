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

/** Files under this threshold are read from a single GET response. */
const FULL_FETCH_THRESHOLD = 5 * 1024 * 1024; // 5 MB

export interface WorkerRequest {
  id: number;
  url: string;
  columns?: string[];
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

/** Cache full-file ArrayBuffers so repeated loads are instant. */
const fullFileCache = new Map<string, Promise<ArrayBuffer>>();

/** Cache range-request AsyncBuffers for large files. */
const rangeBufferCache = new Map<string, Promise<AsyncBuffer>>();
const metadataCache = new Map<string, Promise<FileMetaData>>();

/**
 * Smart fetch: starts a GET, checks Content-Length from response headers.
 * Small file → reads full body (1 round trip, no HEAD).
 * Large file → cancels body, returns null so caller can use range requests.
 */
function smartFetch(url: string): Promise<ArrayBuffer | null> {
  const entry = fullFileCache.get(url);
  if (entry) return entry;

  const promise = (async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const cl = Number(res.headers.get('content-length') || 0);
    if (cl > FULL_FETCH_THRESHOLD) {
      // Large file — cancel body, let caller use range requests
      await res.body?.cancel();
      return null;
    }

    return res.arrayBuffer();
  })();

  // Only cache if it resolved to a buffer (not null)
  const cached = promise.then((buf) => {
    if (!buf) {
      fullFileCache.delete(url);
      throw new Error('large-file');
    }
    return buf;
  });
  fullFileCache.set(url, cached);
  cached.catch(() => fullFileCache.delete(url));

  return promise;
}

function getCachedRangeBuffer(url: string): Promise<AsyncBuffer> {
  let entry = rangeBufferCache.get(url);
  if (!entry) {
    entry = asyncBufferFromUrl({ url }).then((buf) => cachedAsyncBuffer(buf));
    rangeBufferCache.set(url, entry);
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
    metadataCache.set(url, entry);
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

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, url, columns } = e.data;
  const shortUrl = url.split('/').slice(-3).join('/');

  try {
    const t0 = performance.now();

    // Try single GET — returns ArrayBuffer for small files, null for large
    const buffer = await smartFetch(url);

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
      const rows = (await parquetReadObjects({
        file,
        metadata,
        compressors,
        columns,
      })) as Record<string, unknown>[];
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

    if (rowGroups.length <= 1) {
      const rows = (await parquetReadObjects({
        file,
        metadata,
        columns,
        compressors,
      })) as Record<string, unknown>[];
      console.log(`[Worker] ${shortUrl}: ${rows.length} rows (single group)`);
      post({ id, type: 'chunk', rows });
      post({ id, type: 'done', info });
      return;
    }

    // Stream row groups progressively
    let rowStart = 0;
    let sentRows = 0;
    for (let i = 0; i < rowGroups.length; i++) {
      const rg = rowGroups[i];
      const numRows = Number(rg.num_rows);
      const rowEnd = rowStart + numRows;

      const rows = (await parquetReadObjects({
        file,
        metadata,
        columns,
        compressors,
        rowStart,
        rowEnd,
      })) as Record<string, unknown>[];

      if (rows.length > 0) {
        sentRows += rows.length;
        console.log(
          `[Worker] ${shortUrl}: group ${i + 1}/${rowGroups.length} → +${rows.length} (${sentRows} total)`
        );
        post({ id, type: 'chunk', rows });
      }

      rowStart = rowEnd;
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

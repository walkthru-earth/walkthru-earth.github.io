/**
 * Web Worker for off-main-thread Parquet parsing.
 * Streams row groups progressively — hexagons appear tile-by-tile.
 * Caches AsyncBuffers and metadata per URL.
 */

import {
  asyncBufferFromUrl,
  cachedAsyncBuffer,
  parquetMetadataAsync,
  parquetReadObjects,
} from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import type { AsyncBuffer, FileMetaData } from 'hyparquet';

export interface WorkerRequest {
  id: number;
  url: string;
  columns?: string[];
}

export type WorkerResponse =
  | { id: number; type: 'chunk'; rows: Record<string, unknown>[] }
  | { id: number; type: 'done' }
  | { id: number; type: 'error'; error: string };

const bufferCache = new Map<string, Promise<AsyncBuffer>>();
const metadataCache = new Map<string, Promise<FileMetaData>>();

function getCachedBuffer(url: string): Promise<AsyncBuffer> {
  let entry = bufferCache.get(url);
  if (!entry) {
    entry = asyncBufferFromUrl({ url }).then((buf) => cachedAsyncBuffer(buf));
    bufferCache.set(url, entry);
    entry.catch(() => bufferCache.delete(url));
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

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, url, columns } = e.data;
  try {
    const file = await getCachedBuffer(url);
    const metadata = await getCachedMetadata(file, url);
    const rowGroups = metadata.row_groups;
    const shortUrl = url.split('/').slice(-3).join('/');
    const totalRows = Number(metadata.num_rows);

    console.log(
      `[Worker] ${shortUrl}: ${rowGroups.length} row groups, ${totalRows} total rows, ${(file.byteLength / 1024).toFixed(0)}KB`
    );

    if (rowGroups.length <= 1) {
      // Single row group — send all at once (most small files)
      const rows = (await parquetReadObjects({
        file,
        metadata,
        columns,
        compressors,
      })) as Record<string, unknown>[];
      console.log(`[Worker] ${shortUrl}: single group → ${rows.length} rows`);
      post({ id, type: 'chunk', rows });
      post({ id, type: 'done' });
      return;
    }

    // Multiple row groups — stream each one progressively
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
          `[Worker] ${shortUrl}: group ${i + 1}/${rowGroups.length} → +${rows.length} rows (${sentRows} total)`
        );
        post({ id, type: 'chunk', rows });
      }

      rowStart = rowEnd;
    }

    console.log(`[Worker] ${shortUrl}: done, ${sentRows} rows sent`);
    post({ id, type: 'done' });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    post({ id, type: 'error', error });
  }
};

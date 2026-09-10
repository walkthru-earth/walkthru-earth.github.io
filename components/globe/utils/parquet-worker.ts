/** Worker owns network/decode/filter/row assembly. UI receives only selected rows. */
import { asyncBufferFromUrl, parquetMetadataAsync } from 'hyparquet';
import type { AsyncBuffer, FileMetaData } from 'hyparquet';
import { LruCache } from '../../../lib/lru-cache';
import { scanParquet } from './parquet-scan';
import type {
  ParquetInfo,
  WorkerRequest,
  WorkerResponse,
} from './parquet-types';

const metadataCache = new LruCache<string, FileMetaData>(16);
const byteCache = new LruCache<string, ArrayBuffer>(64 * 1024 * 1024, 256);
const controllers = new Map<number, AbortController>();
const post = (message: WorkerResponse) => self.postMessage(message);

function extractInfo(metadata: FileMetaData, fileSize: number): ParquetInfo {
  return {
    fileSize,
    numRows: Number(metadata.num_rows),
    numRowGroups: metadata.row_groups.length,
    columns: metadata.schema
      .slice(1)
      .filter((s) => s.type)
      .map((s) => ({
        name: s.name,
        type: s.type,
        codec: metadata.row_groups[0]?.columns.find(
          (c) => c.meta_data?.path_in_schema.at(-1) === s.name
        )?.meta_data?.codec,
      })),
    createdBy: metadata.created_by,
    parquetVersion: metadata.version,
  };
}
const sizes = new LruCache<string, number>(32);
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.cancel) {
    controllers.get(request.id)?.abort();
    return;
  }
  const { id, url, columns, h3Ranges, rowFilter } = request;
  const controller = new AbortController();
  controllers.set(id, controller);
  const { signal } = controller;
  const start = performance.now();
  try {
    post({ id, type: 'progress', phase: 'fetching', elapsedMs: 0 });
    const remote = await asyncBufferFromUrl({
      url,
      byteLength: sizes.get(url),
      requestInit: { signal },
    });
    signal.throwIfAborted();
    sizes.set(url, remote.byteLength);
    const file: AsyncBuffer = {
      byteLength: remote.byteLength,
      async slice(start, end = remote.byteLength) {
        signal.throwIfAborted();
        const key = `${url}|${start}:${end}`;
        const cached = byteCache.get(key);
        if (cached) return cached;
        const bytes = await remote.slice(start, end);
        signal.throwIfAborted();
        byteCache.set(key, bytes, bytes.byteLength);
        return bytes;
      },
    };
    post({
      id,
      type: 'progress',
      phase: 'planning',
      elapsedMs: performance.now() - start,
    });
    const metadata =
      metadataCache.get(url) ?? (await parquetMetadataAsync(file));
    metadataCache.set(url, metadata);
    let lastProgress = 0;
    await scanParquet({
      file,
      metadata,
      columns,
      h3Ranges,
      rowFilter,
      signal,
      onChunk: (rows) => post({ id, type: 'chunk', rows }),
      onProgress: (current, total) => {
        const elapsedMs = performance.now() - start;
        if (elapsedMs - lastProgress < 200 && current < total) return;
        lastProgress = elapsedMs;
        post({
          id,
          type: 'progress',
          phase: 'decoding',
          elapsedMs,
          current,
          total,
        });
      },
    });
    signal.throwIfAborted();
    post({ id, type: 'done', info: extractInfo(metadata, file.byteLength) });
  } catch (error) {
    if (!signal.aborted)
      post({
        id,
        type: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
  } finally {
    controllers.delete(id);
  }
};

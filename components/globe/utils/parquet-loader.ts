/**
 * Loads remote Parquet files via hyparquet in a Web Worker.
 * Supports progressive streaming — onChunk fires as each row group is parsed.
 */

import type {
  WorkerRequest,
  WorkerResponse,
  ParquetInfo,
} from './parquet-worker';

export type { ParquetInfo } from './parquet-worker';

let worker: Worker | null = null;
let nextId = 0;

export interface LoadResult {
  rows: Record<string, unknown>[];
  info: ParquetInfo | null;
}

interface PendingRequest {
  resolve: (result: LoadResult) => void;
  reject: (err: Error) => void;
  onChunk?: (rows: Record<string, unknown>[]) => void;
  accumulated: Record<string, unknown>[];
}

const pending = new Map<number, PendingRequest>();

/** Simple LRU cache — evicts oldest entry when size exceeds max. */
function lruSet<K, V>(map: Map<K, V>, key: K, value: V, maxSize: number) {
  if (map.size >= maxSize) {
    const oldest = map.keys().next().value;
    if (oldest !== undefined) map.delete(oldest);
  }
  map.set(key, value);
}

/** File-level cache: same URL + columns → reuse previous result */
const fileCache = new Map<string, Promise<LoadResult>>();

/** Track the active request ID per URL so we can cancel superseded loads. */
const activeRequestIds = new Map<string, number>();

/** Short URL for logging (last 3 path segments). */
function shortUrl(url: string): string {
  return url.split('/').slice(-3).join('/');
}

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./parquet-worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      const p = pending.get(msg.id);
      if (!p) {
        if (msg.type !== 'done') {
          console.log(
            `[Globe:Loader] msg id=${msg.id} type=${msg.type} — no pending handler (cancelled?)`
          );
        }
        return;
      }

      if (msg.type === 'chunk') {
        const before = p.accumulated.length;
        for (let i = 0; i < msg.rows.length; i++)
          p.accumulated.push(msg.rows[i]);
        console.log(
          `[Globe:Loader] chunk id=${msg.id} +${msg.rows.length} rows (${before} → ${p.accumulated.length})`
        );
        // Pass a new array reference so React detects the state change.
        // Without this, useMemo deps on allRows won't re-fire since the
        // accumulated array is mutated in place (same reference).
        p.onChunk?.([...p.accumulated]);
      } else if (msg.type === 'done') {
        pending.delete(msg.id);
        console.log(
          `[Globe:Loader] done id=${msg.id} total=${p.accumulated.length} rows`
        );
        // Final result: new array reference for React state update
        p.resolve({ rows: [...p.accumulated], info: msg.info });
      } else if (msg.type === 'error') {
        pending.delete(msg.id);
        console.error(`[Globe:Loader] error id=${msg.id}:`, msg.error);
        p.reject(new Error(msg.error));
      }
    };
  }
  return worker;
}

/** Cancel a pending worker request. The worker stops processing row groups. */
function cancelRequest(id: number) {
  const p = pending.get(id);
  if (p) {
    pending.delete(id);
    console.log(
      `[Globe:Loader] cancel id=${id} (had ${p.accumulated.length} rows accumulated)`
    );
    // Resolve with whatever was accumulated so far — avoids forever-pending
    // promises stuck in fileCache. The generation counter in GlobeExplorer
    // ensures stale results don't overwrite current state.
    p.resolve({ rows: p.accumulated, info: null });
  }
  getWorker().postMessage({ id, cancel: true } as WorkerRequest);
}

export function loadParquet(
  url: string,
  columns?: string[],
  h3Ranges?: [string, string][] | null,
  onChunk?: (rows: Record<string, unknown>[]) => void
): Promise<LoadResult> {
  const isFiltered = h3Ranges != null && h3Ranges.length > 0;
  const sUrl = shortUrl(url);

  // Filtered (viewport) loads are ephemeral — skip file-level cache.
  // The worker still caches the AsyncBuffer + metadata internally.
  if (!isFiltered) {
    const cacheKey = `${url}|${columns?.join(',') ?? '*'}`;

    const cached = fileCache.get(cacheKey);
    if (cached && onChunk) {
      console.log(`[Globe:Loader] CACHE HIT (with onChunk) ${sUrl}`);
      cached.then(({ rows }) => onChunk(rows));
      return cached;
    }
    if (cached) {
      console.log(`[Globe:Loader] CACHE HIT ${sUrl}`);
      return cached;
    }

    // Cancel any previous in-flight request for this URL
    const prevId = activeRequestIds.get(url);
    if (prevId !== undefined) {
      console.log(
        `[Globe:Loader] SUPERSEDE id=${prevId} (unfiltered replacing) for ${sUrl}`
      );
      cancelRequest(prevId);
    }

    const id = nextId++;
    activeRequestIds.set(url, id);
    console.log(
      `[Globe:Loader] UNFILTERED id=${id} ${sUrl} cols=[${columns?.join(',') ?? '*'}]`
    );
    const promise = new Promise<LoadResult>((resolve, reject) => {
      pending.set(id, { resolve, reject, onChunk, accumulated: [] });
      getWorker().postMessage({ id, url, columns } as WorkerRequest);
    });

    lruSet(fileCache, cacheKey, promise, 6);
    promise.catch(() => fileCache.delete(cacheKey));
    return promise;
  }

  // Cancel any previous in-flight request for this URL (filtered or unfiltered)
  const prevId = activeRequestIds.get(url);
  if (prevId !== undefined) {
    console.log(`[Globe:Loader] SUPERSEDE id=${prevId} for ${sUrl}`);
    cancelRequest(prevId);
  }

  // Viewport-filtered load — no file-level caching
  const id = nextId++;
  activeRequestIds.set(url, id);

  console.log(
    `[Globe:Loader] FILTERED id=${id} ${sUrl} ranges=${h3Ranges!.length} cols=[${columns?.join(',') ?? '*'}]`
  );

  return new Promise<LoadResult>((resolve, reject) => {
    pending.set(id, { resolve, reject, onChunk, accumulated: [] });
    getWorker().postMessage({
      id,
      url,
      columns,
      h3Ranges: h3Ranges ?? undefined,
    } as WorkerRequest);
  });
}

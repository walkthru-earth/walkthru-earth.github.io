/**
 * Loads remote Parquet files via hyparquet in a Web Worker.
 * Main thread stays free for scroll/render — zero jank.
 */

import type { WorkerRequest, WorkerResponse } from './parquet-worker';

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<
  number,
  {
    resolve: (rows: Record<string, unknown>[]) => void;
    reject: (err: Error) => void;
  }
>();

/** File-level cache: same URL + columns → reuse previous result */
const fileCache = new Map<string, Promise<Record<string, unknown>[]>>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./parquet-worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { id, rows, error } = e.data;
      const p = pending.get(id);
      if (!p) return;
      pending.delete(id);
      if (error) {
        p.reject(new Error(error));
      } else {
        p.resolve(rows!);
      }
    };
  }
  return worker;
}

export function loadParquet(
  url: string,
  columns?: string[]
): Promise<Record<string, unknown>[]> {
  const cacheKey = `${url}|${columns?.join(',') ?? '*'}`;
  const cached = fileCache.get(cacheKey);
  if (cached) {
    console.log(`[Parquet] Cache hit: ${url.split('/').slice(-3).join('/')}`);
    return cached;
  }

  const start = performance.now();
  const shortUrl = url.split('/').slice(-3).join('/');
  console.log(
    `[Parquet] Loading ${shortUrl}${columns ? ` (${columns.length} cols)` : ''}...`
  );

  const id = nextId++;
  const promise = new Promise<Record<string, unknown>[]>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, url, columns } as WorkerRequest);
  }).then((rows) => {
    console.log(
      `[Parquet] ${rows.length} rows in ${(performance.now() - start).toFixed(0)}ms`
    );
    return rows;
  });

  fileCache.set(cacheKey, promise);
  // Remove from cache on error so it can be retried
  promise.catch(() => fileCache.delete(cacheKey));

  return promise;
}

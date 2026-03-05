/**
 * Loads remote Parquet files via hyparquet in a Web Worker.
 * Supports progressive streaming — onChunk fires as each row group is parsed.
 */

import type { WorkerRequest, WorkerResponse } from './parquet-worker';

let worker: Worker | null = null;
let nextId = 0;

interface PendingRequest {
  resolve: (rows: Record<string, unknown>[]) => void;
  reject: (err: Error) => void;
  onChunk?: (rows: Record<string, unknown>[]) => void;
  accumulated: Record<string, unknown>[];
}

const pending = new Map<number, PendingRequest>();

/** File-level cache: same URL + columns → reuse previous result */
const fileCache = new Map<string, Promise<Record<string, unknown>[]>>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./parquet-worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      const p = pending.get(msg.id);
      if (!p) return;

      if (msg.type === 'chunk') {
        p.accumulated.push(...msg.rows);
        p.onChunk?.(p.accumulated);
      } else if (msg.type === 'done') {
        pending.delete(msg.id);
        p.resolve(p.accumulated);
      } else if (msg.type === 'error') {
        pending.delete(msg.id);
        p.reject(new Error(msg.error));
      }
    };
  }
  return worker;
}

export function loadParquet(
  url: string,
  columns?: string[],
  _filter?: unknown,
  onChunk?: (rows: Record<string, unknown>[]) => void
): Promise<Record<string, unknown>[]> {
  const cacheKey = `${url}|${columns?.join(',') ?? '*'}`;

  // If we have a completed cache hit, return it immediately
  // but still fire onChunk so the caller gets data right away
  const cached = fileCache.get(cacheKey);
  if (cached && onChunk) {
    cached.then((rows) => onChunk(rows));
    return cached;
  }
  if (cached) return cached;

  const id = nextId++;
  const promise = new Promise<Record<string, unknown>[]>((resolve, reject) => {
    pending.set(id, { resolve, reject, onChunk, accumulated: [] });
    getWorker().postMessage({ id, url, columns } as WorkerRequest);
  });

  fileCache.set(cacheKey, promise);
  promise.catch(() => fileCache.delete(cacheKey));

  return promise;
}

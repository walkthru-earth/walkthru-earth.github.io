import { LruCache } from '../../../lib/lru-cache';
import type {
  LoadResult,
  Row,
  RowFilter,
  WorkerRequest,
  WorkerResponse,
  WorkerPhase,
} from './parquet-types';
export type {
  LoadResult,
  ParquetInfo,
  RowFilter,
  WorkerPhase,
} from './parquet-types';

export interface PhaseEvent {
  url: string;
  id: number;
  phase: WorkerPhase;
  elapsedMs: number;
  current?: number;
  total?: number;
  message?: string;
}
const listeners = new Set<(event: PhaseEvent) => void>();
export function onPhaseProgress(callback: (event: PhaseEvent) => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
interface Pending {
  url: string;
  rows: Row[];
  resolve: (result: LoadResult) => void;
  reject: (error: Error) => void;
  cleanup: () => void;
  onChunk?: (rows: Row[]) => void;
  lastProgress: number;
}
let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, Pending>();
// Cache only complete results. A cancelled query can never poison a later read.
const cache = new LruCache<string, LoadResult>(200_000, 6);
function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('./parquet-worker.ts', import.meta.url), {
    type: 'module',
  });
  const fail = (error: Error) => {
    for (const p of pending.values()) {
      p.cleanup();
      p.reject(error);
    }
    pending.clear();
    worker?.terminate();
    worker = null;
  };
  worker.onerror = (event) =>
    fail(new Error(event.message || 'Parquet worker failed'));
  worker.onmessageerror = () =>
    fail(new Error('Unable to read Parquet worker response'));
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const message = event.data;
    const p = pending.get(message.id);
    if (!p) return;
    if (message.type === 'chunk') {
      for (const row of message.rows) p.rows.push(row);
      // Throttle snapshots; never mutate data already supplied to deck.gl.
      const now = performance.now();
      if (p.onChunk && now - p.lastProgress >= 250) {
        p.lastProgress = now;
        p.onChunk(p.rows.slice());
      }
    } else if (message.type === 'progress') {
      for (const callback of listeners) {
        try {
          callback({ ...message, url: p.url });
        } catch (error) {
          console.error('Parquet progress listener failed', error);
        }
      }
    } else {
      pending.delete(message.id);
      p.cleanup();
      if (message.type === 'done')
        p.resolve({ rows: p.rows, info: message.info });
      else p.reject(new Error(message.error));
    }
  };
  return worker;
}

export function loadParquet(
  url: string,
  columns?: string[],
  options: { h3Ranges?: [string, string][] | null; signal?: AbortSignal } = {},
  onChunk?: (rows: Row[]) => void,
  rowFilter?: RowFilter
): Promise<LoadResult> {
  const { h3Ranges, signal } = options;
  if (signal?.aborted) return Promise.reject(signal.reason);
  const key = JSON.stringify([url, columns, h3Ranges, rowFilter]);
  const cached = cache.get(key);
  if (cached) return Promise.resolve(cached);
  const id = nextId++;
  return new Promise<LoadResult>((resolve, reject) => {
    const abort = () => {
      if (!pending.delete(id)) return;
      signal?.removeEventListener('abort', abort);
      worker?.postMessage({ id, cancel: true } satisfies WorkerRequest);
      reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
    };
    const cleanup = () => signal?.removeEventListener('abort', abort);
    try {
      const currentWorker = getWorker();
      pending.set(id, {
        url,
        rows: [],
        onChunk,
        lastProgress: -Infinity,
        cleanup,
        reject,
        resolve: (result) => {
          cache.set(key, result, Math.max(1, result.rows.length));
          resolve(result);
        },
      });
      signal?.addEventListener('abort', abort, { once: true });
      currentWorker.postMessage({
        id,
        url,
        columns,
        h3Ranges: h3Ranges ?? undefined,
        rowFilter,
      } satisfies WorkerRequest);
    } catch (error) {
      pending.delete(id);
      cleanup();
      reject(error);
    }
  });
}

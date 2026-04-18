/**
 * Loads remote Parquet files via hyparquet in a Web Worker.
 * Supports progressive streaming — onChunk fires as each row group is parsed.
 *
 * Columnar transport: the worker may respond with `{type: 'columnar'}` carrying
 * per-column TypedArrays transferred zero-copy. This loader materializes the
 * row-object view on the main thread so the external `LoadResult.rows` contract
 * stays identical for callers (GlobeExplorer, GlobePreview, etc.). The net
 * effect is one O(rows) pass on the main thread instead of a structured clone
 * of millions of row objects across the worker boundary.
 */

import type {
  WorkerRequest,
  WorkerResponse,
  ParquetInfo,
  RowFilter,
  WorkerPhase,
} from './parquet-worker';

export type { ParquetInfo, RowFilter, WorkerPhase } from './parquet-worker';

let worker: Worker | null = null;
let nextId = 0;

export interface LoadResult {
  rows: Record<string, unknown>[];
  info: ParquetInfo | null;
}

/** Phase progress event broadcast to anyone who registered via onPhaseProgress. */
export interface PhaseEvent {
  /** URL being loaded. Useful for correlating when multiple loads are in-flight. */
  url: string;
  /** Request id inside the worker. */
  id: number;
  phase: WorkerPhase;
  elapsedMs: number;
  current?: number;
  total?: number;
  message?: string;
}

type PhaseListener = (e: PhaseEvent) => void;
const phaseListeners = new Set<PhaseListener>();

/**
 * Register a listener for phase progress events. Call the returned function
 * to unsubscribe. Events come from every active load — filter by URL or id
 * if you only care about one.
 */
export function onPhaseProgress(cb: PhaseListener): () => void {
  phaseListeners.add(cb);
  return () => phaseListeners.delete(cb);
}

interface PendingRequest {
  resolve: (result: LoadResult) => void;
  reject: (err: Error) => void;
  onChunk?: (rows: Record<string, unknown>[]) => void;
  accumulated: Record<string, unknown>[];
  /** For phase-event routing — reported back in each PhaseEvent. */
  url: string;
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
/** Reverse map: id → url for O(1) cleanup when requests complete. */
const idToUrl = new Map<number, string>();

/** Short URL for logging (last 3 path segments). */
function shortUrl(url: string): string {
  return url.split('/').slice(-3).join('/');
}

/** Register a request ID ↔ URL mapping. */
function trackRequest(url: string, id: number) {
  activeRequestIds.set(url, id);
  idToUrl.set(id, url);
}

/** Clean up request tracking on completion/error. O(1) via reverse map. */
function untrackRequest(id: number) {
  const url = idToUrl.get(id);
  if (url !== undefined) {
    // Only clear if this ID is still the active one for that URL
    if (activeRequestIds.get(url) === id) activeRequestIds.delete(url);
    idToUrl.delete(id);
  }
}

/**
 * Materialize `Record<string, unknown>[]` from per-column TypedArrays.
 *
 * Same work the worker used to do before structured-cloning rows, but
 * performed once on the main thread after a zero-copy ArrayBuffer transfer.
 * BigInt columns (e.g. `h3_index: BigInt64Array`) yield BigInt values per
 * row — identical to what hyparquet produced in the row-object path.
 */
function columnarToRows(
  length: number,
  cols: Record<string, ArrayBufferView>
): Record<string, unknown>[] {
  const keys = Object.keys(cols);
  if (length === 0 || keys.length === 0) return [];
  const arrays: ArrayLike<unknown>[] = keys.map(
    (k) => cols[k] as unknown as ArrayLike<unknown>
  );
  const rows = new Array<Record<string, unknown>>(length);
  for (let i = 0; i < length; i++) {
    const row: Record<string, unknown> = {};
    for (let k = 0; k < keys.length; k++) {
      row[keys[k]] = arrays[k][i];
    }
    rows[i] = row;
  }
  return rows;
}

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./parquet-worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      const DEV = process.env.NODE_ENV !== 'production';
      const p = pending.get(msg.id);
      if (!p) {
        if (msg.type !== 'done' && msg.type !== 'progress' && DEV) {
          console.log(
            `[Globe:Loader] msg id=${msg.id} type=${msg.type} — no pending handler (cancelled?)`
          );
        }
        return;
      }

      if (msg.type === 'chunk') {
        const before = p.accumulated.length;
        p.accumulated = p.accumulated.concat(msg.rows);
        if (DEV) {
          console.log(
            `[Globe:Loader] chunk id=${msg.id} +${msg.rows.length} rows (${before} → ${p.accumulated.length})`
          );
        }
        p.onChunk?.(p.accumulated);
      } else if (msg.type === 'columnar') {
        const t0 = performance.now();
        const rows = columnarToRows(msg.length, msg.columns);
        p.accumulated = rows;
        if (DEV) {
          console.log(
            `[Globe:Loader] columnar id=${msg.id} ${msg.length} rows materialized in ${(performance.now() - t0).toFixed(0)}ms`
          );
        }
        p.onChunk?.(p.accumulated);
      } else if (msg.type === 'progress') {
        if (phaseListeners.size > 0) {
          const ev: PhaseEvent = {
            url: p.url,
            id: msg.id,
            phase: msg.phase,
            elapsedMs: msg.elapsedMs,
            current: msg.current,
            total: msg.total,
            message: msg.message,
          };
          for (const cb of phaseListeners) {
            try {
              cb(ev);
            } catch (err) {
              // Never let a subscriber crash the worker listener.
              console.error('[Globe:Loader] phase listener threw:', err);
            }
          }
        }
      } else if (msg.type === 'done') {
        pending.delete(msg.id);
        untrackRequest(msg.id);
        if (DEV) {
          console.log(
            `[Globe:Loader] done id=${msg.id} total=${p.accumulated.length} rows`
          );
        }
        p.resolve({ rows: p.accumulated, info: msg.info });
      } else if (msg.type === 'error') {
        pending.delete(msg.id);
        untrackRequest(msg.id);
        console.error(`[Globe:Loader] error id=${msg.id}:`, msg.error);
        p.reject(new Error(msg.error));
      }
    };
  }
  return worker;
}

/** Cancel a pending worker request. The worker aborts on its next slice()
 *  call, so in-flight range fetches/decoding stop as soon as they check in. */
function cancelRequest(id: number) {
  const p = pending.get(id);
  if (p) {
    pending.delete(id);
    untrackRequest(id);
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[Globe:Loader] cancel id=${id} (had ${p.accumulated.length} rows accumulated)`
      );
    }
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
  onChunk?: (rows: Record<string, unknown>[]) => void,
  rowFilter?: RowFilter
): Promise<LoadResult> {
  const isFiltered = h3Ranges != null && h3Ranges.length > 0;
  const sUrl = shortUrl(url);
  const DEV = process.env.NODE_ENV !== 'production';

  // Filtered (viewport) loads are ephemeral — skip file-level cache.
  // The worker still caches the AsyncBuffer + metadata internally.
  if (!isFiltered) {
    const filterKey = rowFilter ? `|${rowFilter.column}>${rowFilter.gt}` : '';
    const cacheKey = `${url}|${columns?.join(',') ?? '*'}${filterKey}`;

    const cached = fileCache.get(cacheKey);
    if (cached && onChunk) {
      if (DEV) console.log(`[Globe:Loader] CACHE HIT (with onChunk) ${sUrl}`);
      cached.then(({ rows }) => onChunk(rows));
      return cached;
    }
    if (cached) {
      if (DEV) console.log(`[Globe:Loader] CACHE HIT ${sUrl}`);
      return cached;
    }

    const prevId = activeRequestIds.get(url);
    if (prevId !== undefined) {
      if (DEV) {
        console.log(
          `[Globe:Loader] SUPERSEDE id=${prevId} (unfiltered replacing) for ${sUrl}`
        );
      }
      cancelRequest(prevId);
    }

    const id = nextId++;
    trackRequest(url, id);
    if (DEV) {
      console.log(
        `[Globe:Loader] UNFILTERED id=${id} ${sUrl} cols=[${columns?.join(',') ?? '*'}]`
      );
    }
    const promise = new Promise<LoadResult>((resolve, reject) => {
      pending.set(id, { resolve, reject, onChunk, accumulated: [], url });
      getWorker().postMessage({ id, url, columns, rowFilter } as WorkerRequest);
    });

    lruSet(fileCache, cacheKey, promise, 6);
    promise.catch(() => fileCache.delete(cacheKey));
    return promise;
  }

  const prevId = activeRequestIds.get(url);
  if (prevId !== undefined) {
    if (DEV) console.log(`[Globe:Loader] SUPERSEDE id=${prevId} for ${sUrl}`);
    cancelRequest(prevId);
  }

  const id = nextId++;
  trackRequest(url, id);

  if (DEV) {
    console.log(
      `[Globe:Loader] FILTERED id=${id} ${sUrl} ranges=${h3Ranges!.length} cols=[${columns?.join(',') ?? '*'}]`
    );
  }

  return new Promise<LoadResult>((resolve, reject) => {
    pending.set(id, { resolve, reject, onChunk, accumulated: [], url });
    getWorker().postMessage({
      id,
      url,
      columns,
      h3Ranges: h3Ranges ?? undefined,
      rowFilter,
    } as WorkerRequest);
  });
}

/**
 * Web Worker for off-main-thread Parquet parsing.
 *
 * Small files (< 5 MB): single GET, parsed from ArrayBuffer. No HEAD overhead.
 * Large files: range-request AsyncBuffer with native hyparquet filter pushdown
 * for row-group pruning based on h3_index column statistics.
 *
 * Single decode path: parquetRead + onChunk accumulates every column as it
 * arrives. When all columns are TypedArrays we transfer zero-copy. When any
 * column is a plain Array (e.g. BYTE_ARRAY strings, Date timestamps), we
 * materialize row objects from the accumulated chunks — no re-parse, no
 * extra HTTP fetch.
 *
 * Cancellation: AsyncBuffer.slice() throws a sentinel error as soon as the
 * request id is superseded. parquetRead rejects on the next slice call,
 * freeing the worker for the next request without waiting on in-flight
 * decoding.
 *
 * Progress: the worker emits {type:'progress'} messages at each phase
 * (fetching, planning, decoding, filtering, materializing) so the UI can
 * show what's happening during long loads.
 */

import {
  asyncBufferFromUrl,
  cachedAsyncBuffer,
  parquetMetadataAsync,
  parquetRead,
} from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import type {
  AsyncBuffer,
  ColumnData,
  FileMetaData,
  ParquetQueryFilter,
} from 'hyparquet';
import { buildH3RangeFilter } from './parquet-filter';
import { buildH3KeepMask } from './h3-mask';

/** Simple LRU cache — evicts oldest entry when size exceeds max. */
function lruSet<K, V>(map: Map<K, V>, key: K, value: V, maxSize: number) {
  if (map.size >= maxSize) {
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

/** Phases the worker walks through per request, in order. */
export type WorkerPhase =
  | 'fetching'
  | 'planning'
  | 'decoding'
  | 'filtering'
  | 'materializing';

export type WorkerResponse =
  | { id: number; type: 'chunk'; rows: Record<string, unknown>[] }
  | {
      id: number;
      type: 'columnar';
      length: number;
      columns: Record<string, ArrayBufferView>;
    }
  | {
      id: number;
      type: 'progress';
      phase: WorkerPhase;
      /** ms since request started. */
      elapsedMs: number;
      /** rows processed at this phase (decoding, filtering, materializing). */
      current?: number;
      /** total rows expected (from metadata or prior phase). */
      total?: number;
      /** Optional human annotation (e.g. 'columnar' vs 'rows'). */
      message?: string;
    }
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

function post(msg: WorkerResponse, transfer?: Transferable[]) {
  const w = self as unknown as Worker;
  if (transfer && transfer.length > 0) {
    w.postMessage(msg, transfer);
  } else {
    w.postMessage(msg);
  }
}

function extractInfo(metadata: FileMetaData, fileSize: number): ParquetInfo {
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

/** IDs that have been cancelled. Cleared when the cancelled request's slice
 *  throws or when its handler catches the sentinel. */
const cancelledIds = new Set<number>();
/** Prevent cancelledIds from growing unbounded if cancel arrives after done. */
const CANCEL_ID_MAX = 50;

/** Marker thrown from slice() / phase checks to unwind the request quickly. */
const CANCEL_SENTINEL = '__parquet_cancel__';
function throwIfCancelled(id: number): void {
  if (cancelledIds.has(id)) throw new Error(CANCEL_SENTINEL);
}

/* ── Columnar helpers ──────────────────────────────────────────────── */

/**
 * Kind of a decoded column, derived either from the TypedArray ctor OR from
 * the primitive type of the first non-null element. hyparquet emits plain
 * `Array<bigint>` / `Array<number>` for dictionary-encoded columns, so
 * checking `instanceof BigInt64Array` alone misses them. Detecting by
 * element type covers both paths and lets us coerce into a real TypedArray.
 */
type ColKind = 'bigint' | 'number' | null;

interface ColumnAccumulator {
  /** null once any chunk is non-numeric or the kinds conflict. */
  kind: ColKind;
  /** Raw chunks in arrival order; typed or plain. */
  chunks: ArrayLike<unknown>[];
  /** Sum of chunk.length. */
  total: number;
}

function detectKind(v: unknown): ColKind {
  if (v instanceof BigInt64Array || v instanceof BigUint64Array)
    return 'bigint';
  if (
    v instanceof Float64Array ||
    v instanceof Float32Array ||
    v instanceof Int32Array ||
    v instanceof Uint32Array ||
    v instanceof Uint8Array
  ) {
    return 'number';
  }
  if (Array.isArray(v) && v.length > 0) {
    // Probe up to 64 elements looking for a non-null sample. Weather files
    // ship dictionary-encoded columns as plain Array with bigint/number
    // values — those decode as plain JS arrays, not TypedArrays.
    const max = Math.min(v.length, 64);
    for (let i = 0; i < max; i++) {
      const x = v[i];
      if (typeof x === 'bigint') return 'bigint';
      if (typeof x === 'number') return 'number';
      if (x != null) return null;
    }
  }
  return null;
}

/**
 * Concatenate any mix of typed/plain chunks into a single TypedArray of the
 * requested kind. BigInt kinds → BigInt64Array. Number kinds → Float64Array
 * (lossless superset of all JS numeric primitives).
 */
function concatToTypedArray(
  kind: 'bigint' | 'number',
  chunks: ArrayLike<unknown>[],
  total: number
): ArrayBufferView {
  if (kind === 'bigint') {
    const out = new BigInt64Array(total);
    let offset = 0;
    for (const c of chunks) {
      if (c instanceof BigInt64Array || c instanceof BigUint64Array) {
        out.set(c as unknown as BigInt64Array, offset);
      } else {
        for (let j = 0; j < c.length; j++) {
          out[offset + j] = c[j] as bigint;
        }
      }
      offset += c.length;
    }
    return out;
  }
  const out = new Float64Array(total);
  let offset = 0;
  for (const c of chunks) {
    if (
      c instanceof Float64Array ||
      c instanceof Float32Array ||
      c instanceof Int32Array ||
      c instanceof Uint32Array ||
      c instanceof Uint8Array
    ) {
      out.set(c as unknown as Float64Array, offset);
    } else {
      for (let j = 0; j < c.length; j++) {
        const x = c[j];
        // bigints occasionally sneak in for INT64-to-number paths; coerce.
        out[offset + j] = typeof x === 'bigint' ? Number(x) : (x as number);
      }
    }
    offset += c.length;
  }
  return out;
}

/** Flatten any chunks into a plain Array (for columns with kind=null). */
function flattenPlain(chunks: ArrayLike<unknown>[], total: number): unknown[] {
  const out = new Array<unknown>(total);
  let offset = 0;
  for (const chunk of chunks) {
    for (let j = 0; j < chunk.length; j++) out[offset + j] = chunk[j];
    offset += chunk.length;
  }
  return out;
}

/** Compact the row-level filter (column > gt) into the mask (AND). */
function andRowFilterIntoMask(
  mask: Uint8Array | null,
  n: number,
  col: ArrayLike<number | bigint>,
  rf: RowFilter
): Uint8Array {
  const m = mask ?? new Uint8Array(n).fill(1);
  const gt = rf.gt;
  for (let i = 0; i < n; i++) {
    if (m[i] === 0) continue;
    const v = col[i];
    const num = typeof v === 'bigint' ? Number(v) : (v as number);
    if (!(num > gt)) m[i] = 0;
  }
  return m;
}

function popcount(mask: Uint8Array): number {
  let c = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i]) c++;
  return c;
}

function applyMaskTyped(
  src: ArrayBufferView,
  mask: Uint8Array,
  kept: number
): ArrayBufferView {
  const Ctor = src.constructor as unknown as new (n: number) => ArrayBufferView;
  const out = new Ctor(kept) as unknown as {
    [k: number]: number | bigint;
    length: number;
  };
  const s = src as unknown as ArrayLike<number | bigint>;
  let w = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i]) {
      out[w++] = s[i];
    }
  }
  return out as unknown as ArrayBufferView;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, url, columns, h3Ranges: rawH3Ranges, rowFilter, cancel } = e.data;

  if (cancel) {
    cancelledIds.add(id);
    if (cancelledIds.size > CANCEL_ID_MAX) {
      const iter = cancelledIds.values();
      cancelledIds.delete(iter.next().value!);
    }
    return;
  }

  const shortUrl = url.split('/').slice(-3).join('/');
  const DEV = process.env.NODE_ENV !== 'production';
  const t0 = performance.now();
  const phaseStart: Partial<Record<WorkerPhase, number>> = {};

  const emitProgress = (
    phase: WorkerPhase,
    current?: number,
    total?: number,
    message?: string
  ) => {
    phaseStart[phase] ??= performance.now();
    post({
      id,
      type: 'progress',
      phase,
      elapsedMs: Math.round(performance.now() - t0),
      current,
      total,
      message,
    });
  };

  const phaseLog = (phase: WorkerPhase, extra?: string) => {
    if (!DEV) return;
    const start = phaseStart[phase] ?? t0;
    const dt = performance.now() - start;
    console.log(
      `[Worker:${phase}] ${shortUrl} ${dt.toFixed(0)}ms${extra ? ` ${extra}` : ''}`
    );
  };

  try {
    /* ── Phase: fetching ───────────────────────────────────────────── */
    emitProgress('fetching');
    const buffer = await smartFetch(url);
    throwIfCancelled(id);
    phaseLog(
      'fetching',
      `id=${id} ${buffer ? `full ${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB` : 'deferred→range'}`
    );

    const h3Ranges = parseH3Ranges(rawH3Ranges);
    const filter: ParquetQueryFilter | undefined = h3Ranges
      ? buildH3RangeFilter(h3Ranges)
      : undefined;

    // Non-cancellable raw buffer — used for the metadata lookup which is
    // shared between concurrent requests via metadataCache.
    const rawFile: AsyncBuffer = buffer
      ? {
          byteLength: buffer.byteLength,
          slice: (start: number, end: number) => buffer.slice(start, end),
        }
      : await getCachedRangeBuffer(url);
    throwIfCancelled(id);

    // Cancel-aware wrapper used by parquetRead. slice() throws sync as soon
    // as the id is superseded, which causes hyparquet to reject the read
    // promise instead of continuing to decode bytes we no longer need.
    const file: AsyncBuffer = {
      byteLength: rawFile.byteLength,
      slice: (start: number, end: number) => {
        throwIfCancelled(id);
        return rawFile.slice(start, end);
      },
    };

    /* ── Phase: planning (metadata) ────────────────────────────────── */
    emitProgress('planning');
    const metadata = buffer
      ? ((await parquetMetadataAsync(rawFile)) as FileMetaData)
      : await getCachedMetadata(rawFile, url);
    const info = extractInfo(metadata, rawFile.byteLength);
    throwIfCancelled(id);
    phaseLog(
      'planning',
      `id=${id} rowGroups=${metadata.row_groups.length} rows=${Number(metadata.num_rows)} ranges=${h3Ranges?.length ?? 0}`
    );

    /* ── Phase: decoding ───────────────────────────────────────────── */
    const totalRowsExpected = Number(metadata.num_rows);
    emitProgress('decoding', 0, totalRowsExpected);

    const acc: Record<string, ColumnAccumulator> = Object.create(null);
    let rowsSeen = 0;
    let lastProgressAt = performance.now();
    const PROGRESS_MIN_MS = 250;

    const onChunk = (chunk: ColumnData) => {
      if (cancelledIds.has(id)) return; // soft hint; slice will hard-abort
      const kind = detectKind(chunk.columnData);
      let slot = acc[chunk.columnName];
      if (!slot) {
        slot = { kind, chunks: [], total: 0 };
        acc[chunk.columnName] = slot;
      }
      // Degrade to null once any chunk is non-numeric or the kinds conflict.
      // Once null, stays null for the rest of the request.
      if (kind === null || (slot.kind !== null && slot.kind !== kind)) {
        slot.kind = null;
      }
      slot.chunks.push(chunk.columnData as unknown as ArrayLike<unknown>);
      slot.total += chunk.columnData.length;

      if (slot.total > rowsSeen) rowsSeen = slot.total;

      const now = performance.now();
      if (now - lastProgressAt > PROGRESS_MIN_MS) {
        lastProgressAt = now;
        emitProgress('decoding', rowsSeen, totalRowsExpected);
      }
    };

    await parquetRead({
      file,
      metadata,
      columns,
      compressors,
      filter,
      useOffsetIndex: true,
      onChunk,
      rowFormat: 'object',
    });
    throwIfCancelled(id);

    const colNames = Object.keys(acc);
    if (colNames.length === 0) {
      // All row groups pruned or no columns — emit empty and exit.
      phaseLog('decoding', 'pruned all');
      if (DEV) {
        console.log(
          `[Worker:done] ${shortUrl} 0/0 rows (empty) in ${(performance.now() - t0).toFixed(0)}ms`
        );
      }
      post({ id, type: 'chunk', rows: [] });
      post({ id, type: 'done', info });
      return;
    }

    const length = acc[colNames[0]].total;
    for (const name of colNames) {
      if (acc[name].total !== length) {
        throw new Error(
          `columns decoded with mismatched lengths: ${name} has ${acc[name].total}, expected ${length}`
        );
      }
    }
    const typedColCount = colNames.filter((n) => acc[n].kind !== null).length;
    phaseLog(
      'decoding',
      `id=${id} rows=${length} cols=${colNames.length} typedCols=${typedColCount}`
    );

    /* ── Phase: filtering ──────────────────────────────────────────── */
    emitProgress('filtering', undefined, length);

    // Flatten only what we need for the mask (typically just h3_index).
    let mask: Uint8Array | null = null;
    let flatH3: BigInt64Array | null = null;

    if (h3Ranges && acc['h3_index']?.kind === 'bigint') {
      flatH3 = concatToTypedArray(
        'bigint',
        acc['h3_index'].chunks,
        acc['h3_index'].total
      ) as unknown as BigInt64Array;
      mask = buildH3KeepMask(flatH3, h3Ranges);
    }

    let flatRowFilterCol: ArrayBufferView | undefined;
    if (rowFilter && acc[rowFilter.column]) {
      const slot = acc[rowFilter.column];
      if (slot.kind === 'bigint' || slot.kind === 'number') {
        flatRowFilterCol = concatToTypedArray(
          slot.kind,
          slot.chunks,
          slot.total
        );
        mask = andRowFilterIntoMask(
          mask,
          length,
          flatRowFilterCol as unknown as ArrayLike<number | bigint>,
          rowFilter
        );
      } else {
        const flat = flattenPlain(slot.chunks, slot.total);
        mask = andRowFilterIntoMask(
          mask,
          length,
          flat as unknown as ArrayLike<number | bigint>,
          rowFilter
        );
      }
    }
    throwIfCancelled(id);

    const outLength = mask ? popcount(mask) : length;
    phaseLog(
      'filtering',
      `id=${id} kept=${outLength}/${length} (${length === 0 ? 0 : Math.round((outLength / length) * 100)}%)`
    );

    /* ── Phase: materializing ──────────────────────────────────────── */
    const allTyped = colNames.every((n) => acc[n].kind !== null);

    if (allTyped) {
      emitProgress('materializing', outLength, length, 'columnar');
      const out: Record<string, ArrayBufferView> = Object.create(null);
      for (const name of colNames) {
        const slot = acc[name];
        let flat: ArrayBufferView;
        if (name === 'h3_index' && flatH3) {
          flat = flatH3 as unknown as ArrayBufferView;
        } else if (name === rowFilter?.column && flatRowFilterCol) {
          flat = flatRowFilterCol;
        } else {
          flat = concatToTypedArray(slot.kind!, slot.chunks, slot.total);
        }
        if (!mask || outLength === length) {
          out[name] = flat;
        } else if (outLength === 0) {
          const Ctor = flat.constructor as unknown as new (
            n: number
          ) => ArrayBufferView;
          out[name] = new Ctor(0);
        } else {
          out[name] = applyMaskTyped(flat, mask, outLength);
        }
      }
      const transfer: Transferable[] = [];
      for (const name of colNames) {
        const buf = out[name].buffer;
        if (buf && !transfer.includes(buf)) transfer.push(buf);
      }
      throwIfCancelled(id);
      phaseLog('materializing', `id=${id} columnar outLength=${outLength}`);

      if (DEV) {
        console.log(
          `[Worker:done] id=${id} ${shortUrl} ${outLength}/${length} rows columnar in ${(performance.now() - t0).toFixed(0)}ms (filter=${filter ? 'h3' : 'none'}, src=${buffer ? 'full' : 'range'})`
        );
      }
      post({ id, type: 'columnar', length: outLength, columns: out }, transfer);
      post({ id, type: 'done', info });
      return;
    }

    // Fallback: build row objects from accumulated chunks. No re-fetch.
    emitProgress('materializing', outLength, length, 'rows');

    const flatCols: Record<string, ArrayLike<unknown>> = Object.create(null);
    for (const name of colNames) {
      const slot = acc[name];
      if (name === 'h3_index' && flatH3) {
        flatCols[name] = flatH3 as unknown as ArrayLike<unknown>;
      } else if (name === rowFilter?.column && flatRowFilterCol) {
        flatCols[name] = flatRowFilterCol as unknown as ArrayLike<unknown>;
      } else if (slot.kind === 'bigint' || slot.kind === 'number') {
        flatCols[name] = concatToTypedArray(
          slot.kind,
          slot.chunks,
          slot.total
        ) as unknown as ArrayLike<unknown>;
      } else {
        flatCols[name] = flattenPlain(slot.chunks, slot.total);
      }
    }

    const rows: Record<string, unknown>[] =
      outLength === 0 ? [] : new Array(outLength);
    let w = 0;
    for (let i = 0; i < length; i++) {
      if (mask && !mask[i]) continue;
      const row: Record<string, unknown> = {};
      for (let c = 0; c < colNames.length; c++) {
        const name = colNames[c];
        row[name] = flatCols[name][i];
      }
      rows[w++] = row;
    }
    throwIfCancelled(id);
    phaseLog('materializing', `id=${id} rows outLength=${outLength}`);

    if (DEV) {
      console.log(
        `[Worker:done] id=${id} ${shortUrl} ${outLength}/${length} rows fallback in ${(performance.now() - t0).toFixed(0)}ms (filter=${filter ? 'h3' : 'none'}, src=${buffer ? 'full' : 'range'})`
      );
    }
    post({ id, type: 'chunk', rows });
    post({ id, type: 'done', info });
  } catch (err) {
    const isCancel = err instanceof Error && err.message === CANCEL_SENTINEL;
    if (isCancel) {
      cancelledIds.delete(id);
      if (DEV) {
        console.log(
          `[Worker:cancel] id=${id} ${shortUrl} aborted after ${(performance.now() - t0).toFixed(0)}ms`
        );
      }
      return;
    }
    const error = err instanceof Error ? err.message : String(err);
    post({ id, type: 'error', error: `${shortUrl}: ${error}` });
  }
};

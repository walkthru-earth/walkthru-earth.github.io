'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyDuckDB = any;
type AnyConnection = any;

let dbSingleton: AnyDuckDB | null = null;
let dbPromise: Promise<AnyDuckDB> | null = null;

// Resolve the installed duckdb-wasm version for CDN URLs
const DUCKDB_VERSION = '1.33.1-dev20.0';
const CDN = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${DUCKDB_VERSION}/dist`;

/** Timeout wrapper — prevents infinite hangs on init/queries */
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    );
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

async function initDuckDB(): Promise<AnyDuckDB> {
  if (dbSingleton) return dbSingleton;
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const duckdb = await import('@duckdb/duckdb-wasm');

    const bundle = await duckdb.selectBundle({
      mvp: {
        mainModule: `${CDN}/duckdb-mvp.wasm`,
        mainWorker: `${CDN}/duckdb-browser-mvp.worker.js`,
      },
      eh: {
        mainModule: `${CDN}/duckdb-eh.wasm`,
        mainWorker: `${CDN}/duckdb-browser-eh.worker.js`,
      },
    });

    // Fetch worker as blob to avoid cross-origin worker restrictions
    const workerScript = await fetch(bundle.mainWorker!).then((r) => r.blob());
    const workerUrl = URL.createObjectURL(workerScript);
    const worker = new Worker(workerUrl);
    URL.revokeObjectURL(workerUrl);

    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);

    await withTimeout(
      db.instantiate(bundle.mainModule),
      30_000,
      'DuckDB instantiation'
    );

    // Configure httpfs for S3 access and load spatial extension
    const initConn = await db.connect();
    await initConn.query('SET builtin_httpfs = false');
    await initConn.query('LOAD httpfs');
    await initConn.query("SET s3_region = 'us-west-2'");
    try {
      await initConn.query('LOAD spatial');
    } catch {
      // spatial extension not available — non-critical for H3 queries
    }
    await initConn.close();

    dbSingleton = db;
    return db;
  })();

  dbPromise.catch(() => {
    // Clear promise so next call can retry
    dbPromise = null;
  });

  return dbPromise;
}

export interface QueryResult {
  rows: Record<string, unknown>[];
  duration: number;
}

/**
 * Convert an Arrow table result to plain JS objects.
 *
 * Uses the objex pattern: result.toArray().map(row => row.toJSON())
 * which correctly converts Arrow Utf8 vectors to JS strings —
 * critical for H3 index strings that deck.gl H3HexagonLayer expects.
 */
function arrowToJS(result: any): Record<string, unknown>[] {
  try {
    const arr = result.toArray();
    if (arr.length > 0 && typeof arr[0]?.toJSON === 'function') {
      return arr.map((row: any) => row.toJSON());
    }
    return arr.map((row: any) => ({ ...row }));
  } catch {
    // Fallback: manual field-by-field extraction
    const rows: Record<string, unknown>[] = [];
    const schema = result.schema.fields;
    for (let i = 0; i < result.numRows; i++) {
      const row: Record<string, unknown> = {};
      for (const field of schema) {
        const col = result.getChild(field.name);
        const val = col?.get(i);
        row[field.name] =
          typeof val === 'object' &&
          val !== null &&
          typeof val.toString === 'function' &&
          !(val instanceof Uint8Array)
            ? String(val)
            : val;
      }
      rows.push(row);
    }
    return rows;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function useDuckDB() {
  const connRef = useRef<AnyConnection | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    initDuckDB()
      .then(async (db) => {
        if (cancelled) return;
        const conn = await db.connect();
        connRef.current = conn;
        setIsReady(true);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(String(err));
      });

    return () => {
      cancelled = true;
      connRef.current?.close();
    };
  }, []);

  const executeQuery = useCallback(
    async (sql: string): Promise<QueryResult> => {
      if (!connRef.current) throw new Error('DuckDB not ready');
      setIsLoading(true);
      setError(null);

      const start = performance.now();
      try {
        const result = await connRef.current.query(sql);
        const duration = performance.now() - start;
        const rows = arrowToJS(result);
        return { rows, duration };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { isReady, isLoading, error, executeQuery };
}

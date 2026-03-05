/**
 * Web Worker for off-main-thread Parquet parsing.
 * Keeps the main thread free for scroll/render.
 */

import { asyncBufferFromUrl, parquetReadObjects } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';

export interface WorkerRequest {
  id: number;
  url: string;
  columns?: string[];
}

export interface WorkerResponse {
  id: number;
  rows?: Record<string, unknown>[];
  error?: string;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, url, columns } = e.data;
  try {
    const file = await asyncBufferFromUrl({ url });
    const rows = (await parquetReadObjects({
      file,
      columns,
      compressors,
    })) as Record<string, unknown>[];
    (self as unknown as Worker).postMessage({ id, rows } as WorkerResponse);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    (self as unknown as Worker).postMessage({ id, error } as WorkerResponse);
  }
};

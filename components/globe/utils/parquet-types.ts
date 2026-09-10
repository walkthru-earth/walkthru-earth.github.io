/** Serializable worker protocol. Keep runtime modules out of type-only imports. */
export type Row = Record<string, unknown>;
export interface RowFilter {
  column: string;
  gt: number;
}
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
export type WorkerPhase =
  'fetching' | 'planning' | 'decoding' | 'filtering' | 'materializing';
export interface LoadResult {
  rows: Row[];
  info: ParquetInfo | null;
}
export type WorkerRequest =
  | { id: number; cancel: true }
  | {
      id: number;
      cancel?: false;
      url: string;
      columns?: string[];
      h3Ranges?: [string, string][];
      rowFilter?: RowFilter;
    };
export type WorkerResponse =
  | { id: number; type: 'chunk'; rows: Row[] }
  | {
      id: number;
      type: 'progress';
      phase: WorkerPhase;
      elapsedMs: number;
      current?: number;
      total?: number;
      message?: string;
    }
  | { id: number; type: 'done'; info: ParquetInfo }
  | { id: number; type: 'error'; error: string };

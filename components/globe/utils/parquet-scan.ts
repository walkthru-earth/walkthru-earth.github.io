import { parquetScan } from 'hyparquet';
import type { AsyncBuffer, FileMetaData, ParquetQueryFilter } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import { buildH3RangeFilter } from './parquet-filter';
import { buildH3KeepMask } from './h3-mask';
import type { Row, RowFilter } from './parquet-types';

export interface ScanOptions {
  file: AsyncBuffer;
  metadata: FileMetaData;
  columns?: string[];
  h3Ranges?: [string, string][];
  rowFilter?: RowFilter;
  signal: AbortSignal;
  onChunk: (rows: Row[]) => void;
  onProgress?: (current: number, total: number) => void;
}

/** Lazy physical ranges keep columns aligned, even when network requests finish out of order. */
export async function scanParquet({
  file,
  metadata,
  columns,
  h3Ranges,
  rowFilter,
  signal,
  onChunk,
  onProgress,
}: ScanOptions) {
  const ranges: [bigint, bigint][] | undefined = h3Ranges?.map(([lo, hi]) => [
    BigInt(`0x${lo}`),
    BigInt(`0x${hi}`),
  ]);
  // Native statistics predicates must use the file's physical H3 type.
  const h3Type = metadata.schema.find((s) => s.name === 'h3_index')?.type;
  const spatial =
    ranges?.length && h3Type === 'INT64'
      ? buildH3RangeFilter(ranges)
      : undefined;
  const numeric: ParquetQueryFilter | undefined = rowFilter
    ? { [rowFilter.column]: { $gt: rowFilter.gt } }
    : undefined;
  const pruningFilter =
    spatial && numeric ? { $and: [spatial, numeric] } : (spatial ?? numeric);
  const selected =
    columns ??
    metadata.schema
      .slice(1)
      .filter((s) => s.type)
      .map((s) => s.name);
  const required = [
    ...new Set([
      ...selected,
      ...(ranges?.length ? ['h3_index'] : []),
      ...(rowFilter ? [rowFilter.column] : []),
    ]),
  ];
  const scan = await parquetScan({
    file,
    metadata,
    columns: required,
    pruningFilter,
    compressors,
    usePageIndex: true,
  });
  signal.throwIfAborted();
  const total = scan.ranges.reduce((sum, r) => sum + r.rowEnd - r.rowStart, 0);
  let current = 0;
  // A range is normally a row group (or a retained page span). Limit working-set
  // size and yield between batches so worker cancellation can be received.
  for (const range of scan.ranges) {
    signal.throwIfAborted();
    // Read a candidate once. Re-reading 16K windows would repeatedly decode
    // the same column chunk in files that have no offset/page indexes.
    const values = await Promise.all(
      required.map((column) => scan.readColumn({ column, ...range }))
    );
    signal.throwIfAborted();
    const data = Object.fromEntries(
      required.map((name, i) => [name, values[i]])
    );
    const length = range.rowEnd - range.rowStart;
    if (values.some((v) => v.length !== length))
      throw new Error('Parquet scan returned misaligned columns');
    const h3 = data.h3_index;
    const mask =
      ranges?.length && h3
        ? buildH3KeepMask(
            Array.from(h3, (value) =>
              typeof value === 'bigint' ? value : BigInt(`0x${String(value)}`)
            ),
            ranges
          )
        : null;
    for (let start = 0; start < length; start += 16_384) {
      signal.throwIfAborted();
      const end = Math.min(length, start + 16_384);
      const rows: Row[] = [];
      for (let i = start; i < end; i++) {
        if (mask && !mask[i]) continue;
        if (
          rowFilter &&
          (data[rowFilter.column][i] == null ||
            !(Number(data[rowFilter.column][i]) > rowFilter.gt))
        )
          continue;
        const row: Row = {};
        for (const column of selected) row[column] = data[column][i];
        rows.push(row);
      }
      if (rows.length) onChunk(rows);
      current += end - start;
      onProgress?.(current, total);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

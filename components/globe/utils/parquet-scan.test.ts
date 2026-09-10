import { readFile } from 'node:fs/promises';
import { parquetMetadata, parquetReadObjects } from 'hyparquet';
import type { AsyncBuffer } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import { describe, expect, it, vi } from 'vitest';
import { scanParquet } from './parquet-scan';
import type { Row } from './parquet-types';

const base = BigInt('0x862830807ffffff');
const h3Range = (lo: number, hi: number): [string, string] => [
  (base + BigInt(lo)).toString(16),
  (base + BigInt(hi)).toString(16),
];

async function fixture(
  kind: 'int64' | 'string' | 'unsorted' = 'int64',
  delayColumns = false
) {
  const buffer = await readFile(
    new URL(`./__fixtures__/scan-${kind}.parquet`, import.meta.url)
  );
  const bytes = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
  const metadata = parquetMetadata(bytes);
  const chunks = metadata.row_groups.flatMap((group) =>
    group.columns.map((column) => {
      const meta = column.meta_data!;
      const start = Number(
        meta.dictionary_page_offset ?? meta.data_page_offset
      );
      return {
        column: meta.path_in_schema[0],
        start,
        end: start + Number(meta.total_compressed_size),
      };
    })
  );
  const requests: { start: number; end: number }[] = [];
  const started: number[] = [];
  const completed: number[] = [];
  const file: AsyncBuffer = {
    byteLength: bytes.byteLength,
    async slice(start, end = bytes.byteLength) {
      const request = requests.length;
      requests.push({ start, end });
      started.push(request);
      if (delayColumns) {
        const column = chunks.find(
          (chunk) => start < chunk.end && end > chunk.start
        )?.column;
        const delay = column === 'h3_index' ? 15 : column === 'metric' ? 8 : 1;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      completed.push(request);
      return bytes.slice(start, end);
    },
  };
  const reference = await parquetReadObjects({
    file: bytes,
    metadata,
    compressors,
  });
  const readColumns = () =>
    chunks
      .filter((chunk) =>
        requests.some(
          (request) => request.start < chunk.end && request.end > chunk.start
        )
      )
      .map((chunk) => chunk.column);
  return { file, metadata, reference, readColumns, started, completed };
}

describe('scanParquet integration', () => {
  it('matches the row reader across four row groups with out-of-order column I/O', async () => {
    const input = await fixture('int64', true);
    const rows: Row[] = [];
    const progress = vi.fn();
    await scanParquet({
      ...input,
      columns: ['h3_index', 'metric', 'label'],
      signal: new AbortController().signal,
      onChunk: (chunk) => rows.push(...chunk),
      onProgress: progress,
    });
    expect(input.metadata.row_groups).toHaveLength(4);
    expect(rows).toEqual(
      input.reference.map(({ h3_index, metric, label }) => ({
        h3_index,
        metric,
        label,
      }))
    );
    expect(input.completed).not.toEqual(input.started);
    expect(input.readColumns()).not.toContain('unused_payload');
    expect(progress.mock.calls).toEqual([
      [6, 24],
      [12, 24],
      [18, 24],
      [24, 24],
    ]);
  });

  it.each(['int64', 'string'] as const)(
    'applies exact spatial and nullable numeric predicates to %s H3 while projecting output',
    async (kind) => {
      const input = await fixture(kind);
      const rows: Row[] = [];
      const h3Ranges = [h3Range(2, 8), h3Range(14, 19)];
      await scanParquet({
        ...input,
        columns: ['label'],
        h3Ranges,
        rowFilter: { column: 'metric', gt: -1 },
        signal: new AbortController().signal,
        onChunk: (chunk) => rows.push(...chunk),
      });
      const expected = input.reference
        .filter((row) => {
          const h3 =
            typeof row.h3_index === 'bigint'
              ? row.h3_index
              : BigInt(`0x${row.h3_index}`);
          return (
            h3Ranges.some(
              ([lo, hi]) => h3 >= BigInt(`0x${lo}`) && h3 <= BigInt(`0x${hi}`)
            ) &&
            row.metric != null &&
            Number(row.metric) > -1
          );
        })
        .map(({ label }) => ({ label }));
      expect(expected).toHaveLength(7);
      expect(rows).toEqual(expected);
      expect(input.readColumns()).not.toContain('unused_payload');
    }
  );

  it('reads all columns when no projection is requested', async () => {
    const input = await fixture();
    const rows: Row[] = [];
    await scanParquet({
      ...input,
      signal: new AbortController().signal,
      onChunk: (chunk) => rows.push(...chunk),
    });
    expect(rows).toEqual(input.reference);
  });

  it('keeps exact spatial matches when H3 order decreases within a row group', async () => {
    const input = await fixture('unsorted', true);
    const rows: Row[] = [];
    const h3Ranges = [h3Range(4, 8), h3Range(14, 16)];
    await scanParquet({
      ...input,
      columns: ['h3_index', 'label'],
      h3Ranges,
      signal: new AbortController().signal,
      onChunk: (chunk) => rows.push(...chunk),
    });
    const expected = input.reference
      .filter((row) =>
        h3Ranges.some(
          ([lo, hi]) =>
            row.h3_index >= BigInt(`0x${lo}`) &&
            row.h3_index <= BigInt(`0x${hi}`)
        )
      )
      .map(({ h3_index, label }) => ({ h3_index, label }));
    expect(expected).toHaveLength(8);
    expect(rows).toEqual(expected);
  });

  it('prunes an impossible spatial predicate without fetching any column data', async () => {
    const input = await fixture();
    const onChunk = vi.fn();
    await scanParquet({
      ...input,
      columns: ['label'],
      h3Ranges: [h3Range(100, 101)],
      signal: new AbortController().signal,
      onChunk,
    });
    expect(onChunk).not.toHaveBeenCalled();
    expect(input.readColumns()).toEqual([]);
  });

  it('rejects a cancelled request without emitting data', async () => {
    const input = await fixture();
    const controller = new AbortController();
    controller.abort();
    const onChunk = vi.fn();
    await expect(
      scanParquet({ ...input, signal: controller.signal, onChunk })
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(onChunk).not.toHaveBeenCalled();
    expect(input.readColumns()).toEqual([]);
  });

  it('stops after cancellation in the first streamed row group', async () => {
    const input = await fixture();
    const controller = new AbortController();
    const onChunk = vi.fn<(rows: Row[]) => void>(() => controller.abort());
    await expect(
      scanParquet({ ...input, signal: controller.signal, onChunk })
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(onChunk).toHaveBeenCalledOnce();
    expect(onChunk.mock.calls[0][0]).toEqual(input.reference.slice(0, 6));
  });

  it('does not emit a completed decode if cancellation arrives while reads are pending', async () => {
    const input = await fixture('int64', true);
    const controller = new AbortController();
    const onChunk = vi.fn();
    const pending = scanParquet({
      ...input,
      signal: controller.signal,
      onChunk,
    });
    const rejection = expect(pending).rejects.toMatchObject({
      name: 'AbortError',
    });
    await new Promise((resolve) => setTimeout(resolve, 3));
    controller.abort();
    await rejection;
    expect(input.started.length).toBeGreaterThan(0);
    expect(onChunk).not.toHaveBeenCalled();
  });
});

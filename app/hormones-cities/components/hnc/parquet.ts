import { parquetReadObjects } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import type { AsyncBuffer } from 'hyparquet';
import { HNC_PARQUET_URL } from './config';
import type { HNCHeavy, HNCRow, RegionScore } from './types';

// GitHub Pages serves .parquet with Content-Encoding: gzip, so hyparquet's
// asyncBufferFromUrl reads the compressed Content-Length from HEAD and then
// range-reads the "footer" at the wrong offset (the file is delivered
// transparently decompressed by the browser). Fetch the whole buffer once and
// hand hyparquet an in-memory AsyncBuffer instead.
async function fetchAsyncBuffer(url: string): Promise<AsyncBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed ${res.status}`);
  const buffer = await res.arrayBuffer();
  return {
    byteLength: buffer.byteLength,
    async slice(start: number, end?: number) {
      return buffer.slice(start, end);
    },
  };
}

const td = new TextDecoder('utf-8');

function toUint8(v: unknown): Uint8Array | null {
  if (!v) return null;
  if (v instanceof Uint8Array) return v;
  if (v instanceof ArrayBuffer) return new Uint8Array(v);
  if (ArrayBuffer.isView(v)) {
    const view = v as ArrayBufferView;
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  }
  if (Array.isArray(v)) return Uint8Array.from(v as number[]);
  return null;
}

function decodeMaybe(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  const b = toUint8(v);
  return b ? td.decode(b) : null;
}

function rowTimestamp(captured: HNCRow['captured_at']): number {
  if (captured == null) return 0;
  if (captured instanceof Date) return captured.getTime();
  if (typeof captured === 'bigint') return Number(captured);
  return Number(captured);
}

export interface ParquetLoadResult {
  rows: HNCRow[];
  file: AsyncBuffer;
}

export async function loadParquetLight(): Promise<ParquetLoadResult> {
  const file = await fetchAsyncBuffer(HNC_PARQUET_URL);
  const out = await parquetReadObjects({
    file,
    columns: [
      'image_id',
      'captured_at',
      'compass_angle',
      'camera_type',
      'image_mime',
      'geom',
      'top_regions',
    ],
    compressors,
  });
  const rows: HNCRow[] = (out as Record<string, unknown>[])
    .map((r) => {
      const geom = r.geom as { coordinates?: [number, number] } | undefined;
      const coords = geom?.coordinates;
      return {
        image_id: String(r.image_id),
        captured_at: r.captured_at as HNCRow['captured_at'],
        compass_angle: r.compass_angle == null ? null : Number(r.compass_angle),
        camera_type: (r.camera_type as string | null) ?? null,
        image_mime: (r.image_mime as string | null) ?? null,
        lon: coords ? coords[0] : NaN,
        lat: coords ? coords[1] : NaN,
        top_regions: Array.isArray(r.top_regions)
          ? (r.top_regions as RegionScore[])
          : [],
      };
    })
    .filter((r) => Number.isFinite(r.lon) && Number.isFinite(r.lat));
  rows.sort(
    (a, b) => rowTimestamp(a.captured_at) - rowTimestamp(b.captured_at)
  );
  return { rows, file };
}

export async function loadParquetHeavy(
  file: AsyncBuffer
): Promise<Map<string, HNCHeavy>> {
  // utf8: false stops hyparquet from eagerly stringifying BYTE_ARRAY image_blob,
  // which would destroy JPEG bytes. We re-decode image_id and image_mime ourselves.
  const out = await parquetReadObjects({
    file,
    columns: ['image_id', 'image_blob', 'image_mime', 'brain_activity'],
    compressors,
    utf8: false,
  });
  const cache = new Map<string, HNCHeavy>();
  for (const raw of out as Record<string, unknown>[]) {
    const id = decodeMaybe(raw.image_id);
    if (!id) continue;
    const mime = decodeMaybe(raw.image_mime) || 'image/jpeg';
    const bytes = toUint8(raw.image_blob);
    let blobUrl: string | null = null;
    if (bytes && bytes.byteLength > 100) {
      blobUrl = URL.createObjectURL(
        new Blob([bytes as BlobPart], { type: mime })
      );
    }
    const ba = raw.brain_activity
      ? Float32Array.from(raw.brain_activity as ArrayLike<number>)
      : null;
    cache.set(id, { blobUrl, brainActivity: ba });
  }
  return cache;
}

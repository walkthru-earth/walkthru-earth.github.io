/**
 * Reusable helpers for resolving the "latest" partition of a live dataset
 * from its source.coop S3 bucket, using ListObjectsV2.
 *
 * Data in this project is Hive-partitioned (e.g. `date=2026-04-18`,
 * `release=2026-04-15.0`, `hour=12`). Listing with `delimiter=/` returns
 * one CommonPrefix per child partition, so we can pick the lexicographic
 * max to get the newest one. ISO dates and the Overture `YYYY-MM-DD.N`
 * release scheme both sort correctly as strings.
 */

import { S3_BUCKET } from './constants';

const BUCKET_ROOT = `${S3_BUCKET}/`;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * List the immediate child `key=value/` partitions under `bucketKey`
 * and return the lexicographic max value.
 *
 * @param bucketKey bucket-relative prefix, no leading slash,
 *                  e.g. `walkthru-earth/indices/weather/model=GraphCast_GFS`
 * @param key       partition key, e.g. `date`, `release`, `hour`
 * @returns bucket-relative path to the winning partition (no trailing slash),
 *          e.g. `walkthru-earth/indices/weather/model=GraphCast_GFS/date=2026-04-18`
 */
export async function resolveLatestPartition(
  bucketKey: string,
  key: string
): Promise<string> {
  const prefix = bucketKey.endsWith('/') ? bucketKey : `${bucketKey}/`;
  const url =
    `${S3_BUCKET}?list-type=2` +
    `&prefix=${encodeURIComponent(prefix)}` +
    `&delimiter=%2F`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`S3 list ${res.status} for ${prefix}`);
  }
  const xml = await res.text();

  const pattern = new RegExp(
    `<Prefix>${escapeRegExp(prefix)}${escapeRegExp(key)}=([^/<]+)/</Prefix>`,
    'g'
  );
  const values = Array.from(xml.matchAll(pattern), (m) => m[1]);

  if (values.length === 0) {
    throw new Error(`No ${key}= partitions under ${prefix}`);
  }
  values.sort();
  const latest = values[values.length - 1];
  return `${prefix}${key}=${latest}`;
}

/** Wrap a no-arg async factory so the first successful call is cached forever; errors are not cached. */
export function memoizePromise<T>(factory: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | null = null;
  return () => {
    if (cached) return cached;
    const p = factory();
    cached = p;
    p.catch(() => {
      if (cached === p) cached = null;
    });
    return p;
  };
}

/**
 * Resolve a nested chain of Hive partitions (e.g. date → hour) and return
 * the full absolute URL prefix (no trailing slash), ready to append
 * `/h3_res=N/data.parquet`.
 */
export async function resolveLatestPartitionChain(
  bucketKey: string,
  keys: string[]
): Promise<string> {
  let current = bucketKey;
  for (const key of keys) {
    current = await resolveLatestPartition(current, key);
  }
  return `${BUCKET_ROOT}${current}`;
}

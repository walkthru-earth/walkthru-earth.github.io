/** Resolve live Hive partitions with paginated S3 ListObjectsV2 requests. */
import { S3_BUCKET } from './constants';

const PARTITION_TTL_MS = 5 * 60 * 1000;

/** Decode XML text only: no DOM, markup evaluation, or external entities. */
function decodeXml(value: string): string {
  const entities: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
  };
  return value.replace(/&([^;]+);/g, (_, entity: string) => {
    if (Object.hasOwn(entities, entity)) return entities[entity];
    if (/^#(?:x[\da-fA-F]+|\d+)$/.test(entity)) {
      const point =
        entity[1] === 'x'
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      if (
        point > 0 &&
        point <= 0x10ffff &&
        !(point >= 0xd800 && point <= 0xdfff)
      ) {
        return String.fromCodePoint(point);
      }
    }
    throw new Error('Invalid XML entity in S3 listing');
  });
}

function xmlText(xml: string, tag: string): string | undefined {
  return xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))?.[1];
}

/** Numeric hours and release suffixes must not use lexicographic ordering. */
function comparePartitions(left: string, right: string): number {
  if (/^\d+$/.test(left) && /^\d+$/.test(right)) {
    const a = BigInt(left),
      b = BigInt(right);
    return a === b ? 0 : a > b ? 1 : -1;
  }
  const a = left.match(/^(\d{4}-\d{2}-\d{2})\.(\d+)$/);
  const b = right.match(/^(\d{4}-\d{2}-\d{2})\.(\d+)$/);
  if (a && b && a[1] === b[1]) return comparePartitions(a[2], b[2]);
  return left === right ? 0 : left > right ? 1 : -1;
}

/** Return the newest immediate key=value partition, without a trailing slash. */
export async function resolveLatestPartition(
  bucketKey: string,
  key: string
): Promise<string> {
  const prefix = bucketKey.endsWith('/') ? bucketKey : `${bucketKey}/`;
  const partitionPrefix = `${prefix}${key}=`;
  const seenTokens = new Set<string>();
  let token: string | undefined;
  let latest: string | undefined;
  do {
    const url = new URL(S3_BUCKET);
    url.searchParams.set('list-type', '2');
    url.searchParams.set('prefix', prefix);
    url.searchParams.set('delimiter', '/');
    if (token) url.searchParams.set('continuation-token', token);
    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok)
      throw new Error(`S3 list ${response.status} for ${prefix}`);
    const xml = await response.text();
    const truncated = xmlText(xml, 'IsTruncated')?.trim();
    if (
      !/<ListBucketResult(?:\s[^>]*)?>/.test(xml) ||
      !xml.includes('</ListBucketResult>') ||
      !['true', 'false'].includes(truncated ?? '')
    ) {
      throw new Error(`Invalid S3 listing for ${prefix}`);
    }
    for (const group of xml.matchAll(
      /<CommonPrefixes>\s*<Prefix>([^<]*)<\/Prefix>\s*<\/CommonPrefixes>/g
    )) {
      const child = decodeXml(group[1]);
      if (!child.startsWith(partitionPrefix) || !child.endsWith('/')) continue;
      const value = child.slice(partitionPrefix.length, -1);
      if (!value || value.includes('/')) continue;
      if (latest === undefined || comparePartitions(value, latest) > 0)
        latest = value;
    }
    token = undefined;
    if (truncated === 'true') {
      const rawToken = xmlText(xml, 'NextContinuationToken');
      token = rawToken ? decodeXml(rawToken) : undefined;
      if (!token || seenTokens.has(token))
        throw new Error(`Invalid S3 continuation token for ${prefix}`);
      seenTokens.add(token);
    }
  } while (token);
  if (latest === undefined)
    throw new Error(`No ${key}= partitions under ${prefix}`);
  return `${partitionPrefix}${latest}`;
}

/** Share in-flight work; expire successes after five minutes and retry failures. */
export function memoizePromise<T>(
  factory: () => Promise<T>,
  ttlMs = PARTITION_TTL_MS
): () => Promise<T> {
  let cached: Promise<T> | null = null;
  let expiresAt = 0;
  return () => {
    if (cached && Date.now() < expiresAt) return cached;
    const promise = Promise.resolve().then(factory);
    cached = promise;
    expiresAt = Infinity;
    void promise.then(
      () => {
        if (cached === promise) expiresAt = Date.now() + ttlMs;
      },
      () => {
        if (cached === promise) cached = null;
      }
    );
    return promise;
  };
}

/** Resolve nested partitions, for example date → hour, into an absolute URL. */
export async function resolveLatestPartitionChain(
  bucketKey: string,
  keys: string[]
): Promise<string> {
  let current = bucketKey;
  for (const key of keys) current = await resolveLatestPartition(current, key);
  return `${S3_BUCKET}/${current}`;
}

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  memoizePromise,
  resolveLatestPartition,
  resolveLatestPartitionChain,
} from './live-data';

const prefix = 'walkthru-earth/weather';
function listing(children: string[], next?: string) {
  return new Response(`<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <IsTruncated>${next !== undefined}</IsTruncated>
    <Prefix>${prefix}/</Prefix>
    ${children.map((child) => `<CommonPrefixes><Prefix>${child}/</Prefix></CommonPrefixes>`).join('')}
    ${next !== undefined ? `<NextContinuationToken>${next}</NextContinuationToken>` : ''}
  </ListBucketResult>`);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('live partition discovery', () => {
  it('finds the latest across pages and decodes opaque XML continuation tokens once', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        listing(
          [`${prefix}/date=2026-08-01`],
          'a&amp;b&#x2B;c&#61;&lt;d&gt;&quot;&apos;'
        )
      )
      .mockResolvedValueOnce(
        listing([`${prefix}/date=2026-09-10`, `${prefix}/date=2026-08-30`])
      );
    vi.stubGlobal('fetch', fetch);
    expect(await resolveLatestPartition(prefix, 'date')).toBe(
      `${prefix}/date=2026-09-10`
    );
    expect(fetch).toHaveBeenCalledTimes(2);
    const second = new URL(fetch.mock.calls[1][0]);
    expect(second.searchParams.get('continuation-token')).toBe('a&b+c=<d>"\'');
    expect(second.searchParams.get('prefix')).toBe(`${prefix}/`);
    expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  it('decodes prefix entities and ignores unrelated or nested partitions', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          listing([
            'a&amp;b/date=2026-09-01',
            'a&amp;b/date=2026-09-10/nested',
            'other/date=2099-01-01',
          ])
        )
    );
    expect(await resolveLatestPartition('a&b', 'date')).toBe(
      'a&b/date=2026-09-01'
    );
  });

  it('compares numeric hours and release revision suffixes numerically', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          listing([
            `${prefix}/hour=9`,
            `${prefix}/hour=12`,
            `${prefix}/hour=06`,
          ])
        )
        .mockResolvedValueOnce(
          listing([
            `${prefix}/release=2026-09-10.2`,
            `${prefix}/release=2026-09-10.10`,
          ])
        )
    );
    expect(await resolveLatestPartition(prefix, 'hour')).toBe(
      `${prefix}/hour=12`
    );
    expect(await resolveLatestPartition(prefix, 'release')).toBe(
      `${prefix}/release=2026-09-10.10`
    );
  });

  it('rejects a listing with no matching partitions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(listing([`${prefix}/other=value`]))
    );
    await expect(resolveLatestPartition(prefix, 'date')).rejects.toThrow(
      'No date= partitions'
    );
  });

  it('reports HTTP errors including a failed later page instead of using stale first-page data', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(listing([`${prefix}/date=2020-01-01`], 'next'))
        .mockResolvedValueOnce(new Response('', { status: 503 }))
    );
    await expect(resolveLatestPartition(prefix, 'date')).rejects.toThrow(
      'S3 list 503'
    );
  });

  it('rejects missing and repeated continuation tokens', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(listing([], '')));
    await expect(resolveLatestPartition(prefix, 'date')).rejects.toThrow(
      'continuation token'
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => Promise.resolve(listing([], 'again')))
    );
    await expect(resolveLatestPartition(prefix, 'date')).rejects.toThrow(
      'continuation token'
    );
  });

  it('rejects malformed listing responses and unknown entities', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<Error>failed</Error>'))
    );
    await expect(resolveLatestPartition(prefix, 'date')).rejects.toThrow(
      'Invalid S3 listing'
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(listing([], '&external;'))
    );
    await expect(resolveLatestPartition(prefix, 'date')).rejects.toThrow(
      'Invalid XML entity'
    );
  });

  it('resolves each nested partition under the selected parent', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(listing([`${prefix}/date=2026-09-10`]))
      .mockResolvedValueOnce(listing([`${prefix}/date=2026-09-10/hour=12`]));
    vi.stubGlobal('fetch', fetch);
    expect(
      await resolveLatestPartitionChain(prefix, ['date', 'hour'])
    ).toContain(`${prefix}/date=2026-09-10/hour=12`);
    expect(new URL(fetch.mock.calls[1][0]).searchParams.get('prefix')).toBe(
      `${prefix}/date=2026-09-10/`
    );
  });
});

describe('memoizePromise', () => {
  it('shares in-flight and successful calls, then expires from completion time', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(0);
    let resolve!: (value: string) => void;
    const factory = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<string>((done) => {
            resolve = done;
          })
      )
      .mockResolvedValue('fresh');
    const get = memoizePromise(factory, 100);
    const first = get();
    await Promise.resolve();
    now.mockReturnValue(1000);
    expect(get()).toBe(first);
    resolve('old');
    expect(await first).toBe('old');
    now.mockReturnValue(1099);
    expect(await get()).toBe('old');
    now.mockReturnValue(1100);
    expect(await get()).toBe('fresh');
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('retries rejected and synchronously throwing factories', async () => {
    const factory = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementationOnce(() => {
        throw new Error('sync');
      })
      .mockResolvedValue('recovered');
    const get = memoizePromise(factory);
    await expect(get()).rejects.toThrow('offline');
    await expect(get()).rejects.toThrow('sync');
    await expect(get()).resolves.toBe('recovered');
    expect(factory).toHaveBeenCalledTimes(3);
  });
});

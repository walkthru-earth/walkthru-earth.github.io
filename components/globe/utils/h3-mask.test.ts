import { describe, it, expect } from 'vitest';
import { buildH3KeepMask } from './h3-mask';

/** Naive O(N*R) reference. Only used to verify the merge-scan matches. */
function naiveMask(
  h3: BigInt64Array,
  ranges: [bigint, bigint][] | null
): Uint8Array | null {
  if (!ranges) return null;
  const n = h3.length;
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const v = h3[i];
    for (let r = 0; r < ranges.length; r++) {
      if (v >= ranges[r][0] && v <= ranges[r][1]) {
        mask[i] = 1;
        break;
      }
    }
  }
  return mask;
}

function popcount(m: Uint8Array): number {
  let c = 0;
  for (let i = 0; i < m.length; i++) if (m[i]) c++;
  return c;
}

function makeSortedH3(n: number, step: bigint = 500n): BigInt64Array {
  const arr = new BigInt64Array(n);
  let cur = 600_000_000_000_000_000n;
  for (let i = 0; i < n; i++) {
    arr[i] = cur;
    cur += step;
  }
  return arr;
}

describe('buildH3KeepMask', () => {
  it('returns null when ranges is null', () => {
    const h3 = new BigInt64Array([1n, 2n, 3n]);
    expect(buildH3KeepMask(h3, null)).toBeNull();
  });

  it('returns an all-zero mask for an empty ranges array', () => {
    const h3 = new BigInt64Array([1n, 2n, 3n]);
    const m = buildH3KeepMask(h3, []);
    expect(m).not.toBeNull();
    expect(popcount(m!)).toBe(0);
  });

  it('returns an all-zero length-0 mask for an empty column', () => {
    const h3 = new BigInt64Array(0);
    const m = buildH3KeepMask(h3, [[1n, 100n]]);
    expect(m).not.toBeNull();
    expect(m!.length).toBe(0);
  });

  it('keeps values inside a single range (inclusive bounds)', () => {
    const h3 = new BigInt64Array([1n, 5n, 10n, 15n, 20n]);
    const m = buildH3KeepMask(h3, [[5n, 15n]]);
    expect(Array.from(m!)).toEqual([0, 1, 1, 1, 0]);
  });

  it('handles adjacent gaps without leaking', () => {
    // Two ranges with a one-value gap (6,7,8 excluded)
    const h3 = new BigInt64Array([4n, 5n, 6n, 7n, 8n, 9n, 10n]);
    const m = buildH3KeepMask(h3, [
      [4n, 5n],
      [9n, 10n],
    ]);
    expect(Array.from(m!)).toEqual([1, 1, 0, 0, 0, 1, 1]);
  });

  it('stops scanning once all values are past the last range', () => {
    const h3 = makeSortedH3(10_000);
    const lastLo = h3[50];
    const lastHi = h3[60];
    const m = buildH3KeepMask(h3, [[lastLo, lastHi]]);
    expect(popcount(m!)).toBe(11);
    // Sanity: no stray 1-bit beyond index 60
    for (let i = 61; i < m!.length; i++) expect(m![i]).toBe(0);
  });

  it('matches the naive O(N*R) reference on a generated workload', () => {
    const h3 = makeSortedH3(50_000, 37n);
    // Construct sorted non-overlapping ranges interleaved with gaps
    const ranges: [bigint, bigint][] = [];
    const stride = 1500;
    for (let start = 0; start + stride < h3.length; start += stride * 2) {
      ranges.push([h3[start], h3[start + stride - 1]]);
    }
    const fast = buildH3KeepMask(h3, ranges)!;
    const slow = naiveMask(h3, ranges)!;
    expect(fast.length).toBe(slow.length);
    expect(popcount(fast)).toBe(popcount(slow));
    for (let i = 0; i < fast.length; i++) {
      if (fast[i] !== slow[i]) {
        throw new Error(`mismatch at i=${i}: fast=${fast[i]} slow=${slow[i]}`);
      }
    }
  });

  it('matches naive when no range covers any value', () => {
    const h3 = new BigInt64Array([10n, 20n, 30n]);
    const m = buildH3KeepMask(h3, [[100n, 200n]]);
    expect(Array.from(m!)).toEqual([0, 0, 0]);
  });

  it('matches naive when every value falls inside one range', () => {
    const h3 = new BigInt64Array([10n, 20n, 30n]);
    const m = buildH3KeepMask(h3, [[0n, 1000n]]);
    expect(Array.from(m!)).toEqual([1, 1, 1]);
  });

  it('handles large h3_index values near BigInt64 positive max', () => {
    // Real h3 cells encode values around 6 * 10^17 which fit in signed int64.
    const h3 = new BigInt64Array([
      600_000_000_000_000_000n,
      604_765_302_164_553_727n,
      604_765_302_298_771_455n,
      606_629_579_561_369_599n,
      606_629_579_829_805_055n,
    ]);
    const ranges: [bigint, bigint][] = [
      [604_765_302_298_771_455n, 606_629_579_561_369_599n],
    ];
    const m = buildH3KeepMask(h3, ranges);
    expect(Array.from(m!)).toEqual([0, 0, 1, 1, 0]);
  });
});

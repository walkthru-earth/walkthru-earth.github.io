import { describe, expect, it } from 'vitest';
import { timestampToMs, finiteNumber } from './time-series';
import { parseViewportParams } from './viewport-params';

describe('forecast values', () => {
  it('compares separate Date objects and raw timestamps by value', () => {
    const epoch = 1_789_000_000_000;
    const dates = [
      new Date(epoch),
      new Date(epoch),
      BigInt(epoch) * 1000n,
      epoch,
      epoch / 1000,
    ];
    expect(new Set(dates.map(timestampToMs))).toEqual(new Set([epoch]));
  });
  it('preserves freezing temperatures and zero growth', () => {
    expect(finiteNumber(0, 15)).toBe(0);
    expect(finiteNumber('0', 1)).toBe(0);
    expect(finiteNumber(null, 15)).toBe(15);
    expect(finiteNumber(NaN, 15)).toBe(15);
  });
});

describe('viewport deep links', () => {
  it('rejects non-finite, partial, fractional and out-of-range values', () => {
    expect(
      parseViewportParams(new URLSearchParams('z=Infinity&x=30x&y=100&h3=3.5'))
    ).toEqual({
      initialZoom: undefined,
      initialLng: undefined,
      initialLat: undefined,
      initialH3Res: undefined,
    });
  });
  it('preserves valid zero coordinates', () => {
    expect(
      parseViewportParams(new URLSearchParams('z=0&x=0&y=0&h3=0'))
    ).toEqual({
      initialZoom: 0,
      initialLng: 0,
      initialLat: 0,
      initialH3Res: 0,
    });
  });
});

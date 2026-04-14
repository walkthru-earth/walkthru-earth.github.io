import { describe, it, expect } from 'vitest';
import { viewportToH3Ranges, h3CellToBigIntRange } from './h3-viewport';

describe('h3CellToBigIntRange', () => {
  it('expands a res-3 cell to a res-6 descendant range', () => {
    // 832830fffffffff is res 3, base cell 1
    const [lo, hi] = h3CellToBigIntRange('832830fffffffff', 6);
    expect(hi >= lo).toBe(true);
    // The range must span 7^3 = 343 potential res-6 children
    expect(hi - lo).toBeGreaterThan(0n);
  });
});

describe('viewportToH3Ranges', () => {
  it('returns null for full-globe viewport', () => {
    expect(viewportToH3Ranges([-180, -85, 180, 85], 5)).toBeNull();
  });

  it('returns null when res < 3', () => {
    expect(viewportToH3Ranges([-10, -10, 10, 10], 2)).toBeNull();
  });

  it('returns sorted, non-overlapping hex ranges for a regional bbox at res 6', () => {
    const result = viewportToH3Ranges([-74.1, 40.6, -73.9, 40.8], 6);
    expect(result).not.toBeNull();
    expect(result!.length).toBeGreaterThan(0);
    // verify sorted by lo
    for (let i = 1; i < result!.length; i++) {
      const prevHi = BigInt('0x' + result![i - 1][1]);
      const nextLo = BigInt('0x' + result![i][0]);
      expect(nextLo > prevHi).toBe(true);
    }
  });
});

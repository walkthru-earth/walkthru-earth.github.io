import { describe, it, expect } from 'vitest';
import { buildH3RangeFilter } from './parquet-filter';

describe('buildH3RangeFilter', () => {
  it('returns undefined for empty ranges', () => {
    expect(buildH3RangeFilter([])).toBeUndefined();
  });

  it('returns a flat predicate for a single range', () => {
    const f = buildH3RangeFilter([[1n, 2n]]);
    expect(f).toEqual({ h3_index: { $gte: 1n, $lte: 2n } });
  });

  it('returns $or for multiple ranges', () => {
    const f = buildH3RangeFilter([
      [1n, 2n],
      [5n, 10n],
    ]);
    expect(f).toEqual({
      $or: [
        { h3_index: { $gte: 1n, $lte: 2n } },
        { h3_index: { $gte: 5n, $lte: 10n } },
      ],
    });
  });
});

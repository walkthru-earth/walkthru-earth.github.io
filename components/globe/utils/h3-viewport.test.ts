import { describe, it, expect } from 'vitest';
import {
  cellToBoundary,
  cellToChildren,
  getPentagons,
  latLngToCell,
  polygonToCellsExperimental,
  POLYGON_TO_CELLS_FLAGS,
} from 'h3-js';
import { viewportToH3Ranges, h3CellToBigIntRange } from './h3-viewport';

type Bounds = [number, number, number, number];

function coverage(bounds: Bounds, resolution = 8) {
  const result = viewportToH3Ranges(bounds, resolution);
  expect(result).not.toBeNull();
  expect(result!.length).toBeGreaterThan(0);
  expect(result!.length).toBeLessThanOrEqual(1024);
  const ranges = result!.map(([lo, hi]) => [
    BigInt(`0x${lo}`),
    BigInt(`0x${hi}`),
  ]);
  for (let i = 1; i < ranges.length; i++) {
    expect(ranges[i][0]).toBeGreaterThan(ranges[i - 1][1] + 1n);
  }
  return (cell: string) => {
    const value = BigInt(`0x${cell}`);
    return ranges.some(([lo, hi]) => value >= lo && value <= hi);
  };
}

describe('h3CellToBigIntRange', () => {
  it.each(['832830fffffffff', getPentagons(3)[0]])(
    'includes every real descendant of parent %s',
    (parent) => {
      const [lo, hi] = h3CellToBigIntRange(parent, 6);
      const children = cellToChildren(parent, 6);
      expect(children.length).toBeGreaterThan(200);
      for (const child of children) {
        const value = BigInt(`0x${child}`);
        expect(value >= lo && value <= hi).toBe(true);
      }
    }
  );

  it('returns an exact index for equal parent and child resolutions', () => {
    const cell = '832830fffffffff';
    expect(h3CellToBigIntRange(cell, 3)).toEqual([
      BigInt(`0x${cell}`),
      BigInt(`0x${cell}`),
    ]);
  });

  it.each([2, 16, 4.5])(
    'rejects invalid descendant resolution %s',
    (resolution) => {
      expect(() => h3CellToBigIntRange('832830fffffffff', resolution)).toThrow(
        RangeError
      );
    }
  );
});

describe('viewportToH3Ranges', () => {
  it('returns null for a whole-globe viewport and low-resolution global sources', () => {
    expect(viewportToH3Ranges([-180, -85, 180, 85], 5)).toBeNull();
    expect(viewportToH3Ranges([-10, -10, 10, 10], 2)).toBeNull();
  });

  it.each([
    {
      name: 'city',
      bounds: [-74.1, 40.6, -73.9, 40.8],
      points: [
        [40.6, -74.1],
        [40.8, -73.9],
        [40.7, -74],
      ],
    },
    {
      name: 'antimeridian',
      bounds: [170, -10, -170, 10],
      points: [
        [0, 179.99999],
        [0, -179.99999],
        [-10, 170],
        [10, -170],
      ],
    },
    {
      name: 'unwrapped east',
      bounds: [170, -10, 190, 10],
      points: [
        [0, -179],
        [0, 179],
        [-10, 170],
        [10, -170],
      ],
    },
    {
      name: 'unwrapped west',
      bounds: [-190, -10, -170, 10],
      points: [
        [0, -179],
        [0, 179],
        [-10, 170],
        [10, -170],
      ],
    },
    {
      name: 'multiple world shifts',
      bounds: [890, -10, 910, 10],
      points: [
        [0, -179],
        [0, 179],
        [-10, 170],
        [10, -170],
      ],
    },
    {
      name: 'more than a hemisphere',
      bounds: [-160, -30, 160, 30],
      points: [
        [0, -155],
        [0, 155],
        [-30, -160],
        [30, 160],
        [0, 0],
      ],
    },
    {
      name: 'narrow pole-to-pole strip',
      bounds: [-10, -85, 10, 85],
      points: [
        [-85, -10],
        [85, 10],
        [0, 0],
      ],
    },
    {
      name: 'north polar cap',
      bounds: [-180, 85, 180, 90],
      points: [
        [90, 0],
        [89.999, 179.99],
        [86, -179.99],
        [85, 90],
      ],
    },
    {
      name: 'south polar cap',
      bounds: [-180, -90, 180, -85],
      points: [
        [-90, 0],
        [-89.999, -179.99],
        [-86, 179.99],
        [-85, -90],
      ],
    },
    {
      name: 'narrow antimeridian strip',
      bounds: [175, -85, -175, 85],
      points: [
        [-85, 179],
        [85, -179],
        [0, 180],
      ],
    },
  ])(
    'covers all sampled visible cells for $name with bounded sorted ranges',
    ({ bounds, points }) => {
      const contains = coverage(bounds as Bounds);
      for (const [lat, lon] of points) {
        const cell = latLngToCell(lat, lon, 8);
        expect(contains(cell), `missing ${cell} at ${lat}, ${lon}`).toBe(true);
      }
    }
  );

  it('gives equivalent predicates for wrapped and shifted forms of the same viewport', () => {
    const expected = viewportToH3Ranges([170, -10, -170, 10], 8);
    for (const bounds of [
      [170, -10, 190, 10],
      [-190, -10, -170, 10],
      [890, -10, 910, 10],
    ]) {
      expect(viewportToH3Ranges(bounds as Bounds, 8)).toEqual(expected);
    }
  });

  it('retains intersecting fine cells for a viewport smaller than one coarse cell', () => {
    const parent = latLngToCell(30.0444, 31.2357, 4);
    const [lat, lon] = cellToBoundary(parent)[0];
    const epsilon = 0.00001;
    const bounds: Bounds = [
      lon - epsilon,
      lat - epsilon,
      lon + epsilon,
      lat + epsilon,
    ];
    const contains = coverage(bounds, 9);
    const overlapping = polygonToCellsExperimental(
      [
        [
          [bounds[1], bounds[0]],
          [bounds[1], bounds[2]],
          [bounds[3], bounds[2]],
          [bounds[3], bounds[0]],
        ],
      ],
      9,
      POLYGON_TO_CELLS_FLAGS.containmentOverlapping
    );
    expect(overlapping.length).toBeGreaterThan(0);
    for (const cell of overlapping) expect(contains(cell)).toBe(true);
  });

  it('bounds query complexity for large viewports even at resolution 15', () => {
    const contains = coverage([-179, -75, 179, 75], 15);
    for (let lat = -75; lat <= 75; lat += 15) {
      for (let lon = -175; lon <= 175; lon += 25) {
        expect(
          contains(latLngToCell(lat, lon, 15)),
          `missing ${lat}, ${lon}`
        ).toBe(true);
      }
    }
  });

  it('does not turn degenerate point bounds into an unfiltered scan', () => {
    const contains = coverage([31.2, 30, 31.2, 30]);
    expect(contains(latLngToCell(30, 31.2, 8))).toBe(true);
  });

  it.each([
    [NaN, 0, 10, 10],
    [0, 0, Infinity, 10],
    [0, 10, 10, 0],
  ])(
    'rejects invalid bounds instead of issuing an unfiltered scan: %s',
    (...bounds) => {
      expect(() => viewportToH3Ranges(bounds as Bounds, 8)).toThrow(RangeError);
    }
  );
});

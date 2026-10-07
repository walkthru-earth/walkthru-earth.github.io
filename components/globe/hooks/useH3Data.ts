'use client';
import { useMemo, useState } from 'react';
import type { Row } from '../utils/parquet-types';

/** Keep geometry identity stable when only forecast values change. */
export function useH3Data(rows: Row[], getHexagon: (row: Row) => string) {
  const next = useMemo(() => rows.map(getHexagon), [rows, getHexagon]);
  const [geometry, setGeometry] = useState(next);
  // Hover updates only move the tooltip. Compare cell sequences when data
  // changes, rather than scanning every cell on each pointer movement.
  const same = useMemo(
    () =>
      geometry.length === next.length &&
      geometry.every((hex, i) => hex === next[i]),
    [geometry, next]
  );
  if (!same) setGeometry(next);
  const lookup = useMemo(
    () => new Map(rows.map((row, i) => [next[i], row])),
    [rows, next]
  );
  return { hexagons: same ? geometry : next, lookup };
}

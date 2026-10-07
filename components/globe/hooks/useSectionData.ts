'use client';
import { useEffect, useMemo, useState } from 'react';
import { computeRange } from '../data/constants';
import {
  resolveWeatherPrefix,
  resolveOvertureRelease,
  type GlobeSection,
  type QueryContext,
  type ColorRange,
  type ParquetInfo,
} from '../data/section-shared';
import type { Row } from '../utils/parquet-types';
import { timestampToMs } from '../utils/time-series';

interface DataState {
  section: GlobeSection | null;
  requestKey: string | null;
  rows: Row[];
  range: ColorRange;
  info: ParquetInfo | null;
  duration: number | null;
  loading: boolean;
  error: string | null;
  context: QueryContext | null;
}
const EMPTY: DataState = {
  section: null,
  requestKey: null,
  rows: [],
  range: { min: 0, max: 1 },
  info: null,
  duration: null,
  loading: true,
  error: null,
  context: null,
};

/** Resolve only the live partitions referenced by this section. */
export async function resolveSectionContext(
  section: GlobeSection,
  h3Res: number
): Promise<QueryContext> {
  const template = section.buildQuery({
    weatherPrefix: '__WEATHER__',
    overtureRelease: '__OVERTURE__',
    h3Res,
  });
  const [weatherPrefix, overtureRelease] = await Promise.all([
    template.includes('__WEATHER__') ? resolveWeatherPrefix() : '',
    template.includes('__OVERTURE__') ? resolveOvertureRelease() : '',
  ]);
  return { weatherPrefix, overtureRelease, h3Res };
}

/** One request scope per visible section/viewport; no speculative background datasets. */
export function useSectionData(
  section: GlobeSection,
  h3Res: number,
  h3Ranges?: [string, string][] | null,
  enabled = true
) {
  const [state, setState] = useState<DataState>(EMPTY);
  const rangesKey = JSON.stringify(h3Ranges ?? null);
  const requestKey = JSON.stringify([h3Res, rangesKey]);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const { signal } = controller;
    const start = performance.now();
    const update = (patch: Partial<DataState>) => {
      if (!signal.aborted)
        setState((previous) => ({
          ...(previous.section === section && previous.requestKey === requestKey
            ? previous
            : EMPTY),
          ...patch,
          section,
          requestKey,
        }));
    };
    void (async () => {
      update({ ...EMPTY, loading: true, error: null });
      try {
        const context = {
          ...(await resolveSectionContext(section, h3Res)),
          h3Ranges: JSON.parse(rangesKey),
          signal,
        };
        signal.throwIfAborted();
        update({ context });
        const result = await section.loadData(context, (rows) =>
          update({ rows, range: computeRange(rows, section.colorColumn) })
        );
        signal.throwIfAborted();
        update({
          rows: result.rows,
          range: computeRange(result.rows, section.colorColumn),
          info: result.info,
          duration: performance.now() - start,
          loading: false,
        });
      } catch (error) {
        if (!signal.aborted)
          update({
            loading: false,
            error: error instanceof Error ? error.message : String(error),
          });
      }
    })();
    return () => controller.abort();
  }, [section, h3Res, rangesKey, requestKey, enabled]);
  // Hide the old response during render, before effect cleanup/load begins.
  // A section alone cannot distinguish its previous resolution or viewport.
  return enabled && state.section === section && state.requestKey === requestKey
    ? state
    : EMPTY;
}

/** Build time buckets once per response; playback never scans the entire forecast. */
export function useTimeSeries(rows: Row[], selectedIndex: number) {
  const timeline = useMemo(() => {
    const buckets = new Map<number, Row[]>();
    for (const row of rows) {
      const ms = timestampToMs(row.timestamp);
      if (!Number.isFinite(ms) || ms <= 0) continue;
      const bucket = buckets.get(ms);
      if (bucket) bucket.push(row);
      else buckets.set(ms, [row]);
    }
    return { timestamps: [...buckets.keys()].sort((a, b) => a - b), buckets };
  }, [rows]);
  const timestamp =
    timeline.timestamps[
      Math.min(Math.max(0, selectedIndex), timeline.timestamps.length - 1)
    ];
  return {
    timestamps: timeline.timestamps,
    layerData: timeline.buckets.get(timestamp) ?? rows,
  };
}

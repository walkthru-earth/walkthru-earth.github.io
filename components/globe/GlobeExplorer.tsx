'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { GlobeMap } from './GlobeMap';
import { ScrollSection } from './ScrollSection';
import { QueryPanel, QueryPanelInline, ParquetInfoPanel } from './QueryPanel';
import { TimeSlider, MobileTimeControls } from './TimeSlider';
import { useGlobeScroll } from './hooks/useGlobeScroll';
import {
  SECTIONS,
  resolveWeatherPrefix,
  type GlobeSection,
  type QueryContext,
  type ColorRange,
  type ParquetInfo,
} from './data/sections';

/** Convert hyparquet timestamp (BigInt µs, Date, or number) to epoch ms. */
function tsToMs(v: unknown): number {
  if (typeof v === 'bigint') return Number(v / 1000n);
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v > 1e12 ? v : v * 1000;
  return 0;
}

interface GlobeExplorerProps {
  sections?: GlobeSection[];
}

export function GlobeExplorer({ sections = SECTIONS }: GlobeExplorerProps) {
  const isOverGlobeRef = useRef(false);
  const { containerRef, activeSection, navigate } = useGlobeScroll(
    sections.length,
    isOverGlobeRef
  );

  const [allRows, setAllRows] = useState<Record<string, unknown>[]>([]);
  const [colorRange, setColorRange] = useState<ColorRange>({ min: 0, max: 1 });
  const [queryDuration, setQueryDuration] = useState<number | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parquetInfo, setParquetInfo] = useState<ParquetInfo | null>(null);
  const [weatherPrefix, setWeatherPrefix] = useState<string | null>(null);
  const [zoom, setZoom] = useState(sections[0]?.viewState.zoom ?? 1.5);
  const [timeStepIndex, setTimeStepIndex] = useState(0);
  const handleGlobeTap = useCallback(() => {
    window.dispatchEvent(new Event('globe:tap'));
  }, []);

  // Per-section h3Res overrides (sparse — only stores user changes)
  const [h3ResOverrides, setH3ResOverrides] = useState<Record<number, number>>(
    {}
  );
  const currentSection = sections[activeSection];
  const h3Res = h3ResOverrides[activeSection] ?? currentSection.defaultH3Res;

  const queryCtx = useMemo<QueryContext | null>(
    () => (weatherPrefix ? { weatherPrefix, h3Res } : null),
    [weatherPrefix, h3Res]
  );

  // Extract sorted unique timestamps (ms) from loaded rows
  const timestamps = useMemo(() => {
    if (allRows.length === 0) return [];
    const first = allRows[0];
    if (!first || !('timestamp' in first)) return [];
    const set = new Set<number>();
    for (const row of allRows) {
      const ms = tsToMs(row.timestamp);
      if (ms > 0) set.add(ms);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [allRows]);

  // Filter rows by selected timestamp
  const layerData = useMemo(() => {
    if (timestamps.length <= 1) return allRows;
    const targetMs = timestamps[timeStepIndex] ?? timestamps[0];
    return allRows.filter((r) => tsToMs(r.timestamp) === targetMs);
  }, [allRows, timestamps, timeStepIndex]);

  // Ref tracks the active section so async callbacks can check without stale closures
  const activeSectionRef = useRef(0);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  /** Promise-based cache keyed by "sectionIdx:h3Res" to prevent duplicate loads. */
  const cacheRef = useRef<
    Map<
      string,
      Promise<{
        rows: Record<string, unknown>[];
        duration: number;
        range: ColorRange;
        info: ParquetInfo | null;
      }>
    >
  >(new Map());

  const handleCursorOverGlobe = useCallback((isOver: boolean) => {
    isOverGlobeRef.current = isOver;
  }, []);

  const resolvedQuery = useMemo(() => {
    const ctx = queryCtx ?? { weatherPrefix: '...', h3Res };
    return currentSection.buildQuery(ctx);
  }, [queryCtx, currentSection, h3Res]);

  // Resolve weather prefix once on mount
  useEffect(() => {
    let cancelled = false;
    resolveWeatherPrefix().then((prefix) => {
      if (!cancelled) setWeatherPrefix(prefix);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const computeRange = useCallback(
    (rows: Record<string, unknown>[], column: string): ColorRange => {
      if (!column || rows.length === 0) return { min: 0, max: 1 };
      const values = rows
        .map((r) => Number(r[column]))
        .filter(Number.isFinite)
        .sort((a, b) => a - b);
      if (values.length === 0) return { min: 0, max: 1 };
      return {
        min: values[Math.floor(values.length * 0.05)] ?? 0,
        max: values[Math.floor(values.length * 0.95)] ?? 1,
      };
    },
    []
  );

  /**
   * Load data for a section. Uses activeSectionRef to check if the section
   * is still current. Supports progressive rendering via onProgress.
   */
  const loadSection = useCallback(
    (sectionIdx: number, section: GlobeSection, ctx: QueryContext) => {
      const cacheKey = `${sectionIdx}:${ctx.h3Res}`;
      let loadPromise = cacheRef.current.get(cacheKey);

      if (!loadPromise) {
        console.log(
          `[Globe] Loading "${section.id}" h3_res=${ctx.h3Res} (section ${sectionIdx})...`
        );
        Promise.resolve().then(() => {
          if (activeSectionRef.current !== sectionIdx) return;
          setIsLoading(true);
          setError(null);
          setParquetInfo(null);
        });

        const start = performance.now();

        const onProgress = (partialRows: Record<string, unknown>[]) => {
          if (activeSectionRef.current !== sectionIdx) return;
          setAllRows(partialRows);
          setRowCount(partialRows.length);
        };

        loadPromise = section.loadData(ctx, onProgress).then((result) => {
          const duration = performance.now() - start;
          const range = computeRange(result.rows, section.colorColumn);
          console.log(
            `[Globe] "${section.id}" done: ${result.rows.length} rows in ${duration.toFixed(0)}ms`
          );
          return { rows: result.rows, duration, range, info: result.info };
        });
        cacheRef.current.set(cacheKey, loadPromise);
        loadPromise.catch(() => cacheRef.current.delete(cacheKey));
      } else {
        console.log(`[Globe] "${section.id}" h3_res=${ctx.h3Res} cache hit`);
      }

      loadPromise
        .then((result) => {
          if (activeSectionRef.current !== sectionIdx) return;
          setAllRows(result.rows);
          setColorRange(result.range);
          setQueryDuration(result.duration);
          setRowCount(result.rows.length);
          setParquetInfo(result.info);
          setIsLoading(false);
        })
        .catch((err) => {
          if (activeSectionRef.current !== sectionIdx) return;
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[Globe] Load failed for "${section.id}":`, msg);
          setError(msg);
          setAllRows([]);
          setQueryDuration(null);
          setRowCount(0);
          setParquetInfo(null);
          setIsLoading(false);
        });
    },
    [computeRange]
  );

  // Load current section, then prefetch next after it completes
  useEffect(() => {
    if (!queryCtx) return;

    const cacheKey = `${activeSection}:${queryCtx.h3Res}`;

    // Load the active section
    loadSection(activeSection, currentSection, queryCtx);

    // Prefetch next section AFTER current finishes — avoid bandwidth competition
    const currentPromise = cacheRef.current.get(cacheKey);
    const nextIdx = activeSection + 1;
    if (currentPromise && nextIdx < sections.length) {
      const next = sections[nextIdx];
      const nextRes = h3ResOverrides[nextIdx] ?? next.defaultH3Res;
      const nextCtx = { ...queryCtx, h3Res: nextRes };
      const nextKey = `${nextIdx}:${nextRes}`;
      currentPromise.then(() => {
        if (activeSectionRef.current !== activeSection) return;
        if (cacheRef.current.has(nextKey)) return;
        const start = performance.now();
        const prefetch = next.loadData(nextCtx).then((result) => {
          const duration = performance.now() - start;
          const range = computeRange(result.rows, next.colorColumn);
          return { rows: result.rows, duration, range, info: result.info };
        });
        cacheRef.current.set(nextKey, prefetch);
        prefetch.catch(() => cacheRef.current.delete(nextKey));
      });
    }
  }, [
    queryCtx,
    activeSection,
    currentSection,
    sections,
    h3ResOverrides,
    loadSection,
    computeRange,
  ]);

  const handleH3ResChange = useCallback(
    (delta: number) => {
      const [min, max] = currentSection.h3ResRange;
      setH3ResOverrides((prev) => {
        const cur = prev[activeSection] ?? currentSection.defaultH3Res;
        const next = Math.max(min, Math.min(max, cur + delta));
        if (next === cur) return prev;
        return { ...prev, [activeSection]: next };
      });
    },
    [activeSection, currentSection]
  );

  const handleZoomChange = useCallback((z: number) => {
    requestAnimationFrame(() => setZoom(z));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
    >
      <GlobeMap
        targetViewState={currentSection.viewState}
        layerData={layerData}
        colorRange={colorRange}
        getHexagon={currentSection.getHexagon}
        getFillColor={currentSection.getFillColor}
        getElevation={currentSection.getElevation}
        formatTooltip={currentSection.formatTooltip}
        extruded={currentSection.extruded}
        elevationScale={currentSection.elevationScale}
        onCursorOverGlobe={handleCursorOverGlobe}
        onZoomChange={handleZoomChange}
        onTap={handleGlobeTap}
      />

      <ScrollSection
        section={currentSection}
        sectionIndex={activeSection}
        totalSections={sections.length}
        onSwipe={(dir) => {
          navigate(dir);
          setTimeStepIndex(0);
        }}
        isLoading={isLoading}
        rowCount={rowCount}
        queryPanel={
          <>
            {timestamps.length > 1 && (
              <MobileTimeControls
                timestamps={timestamps}
                selectedIndex={timeStepIndex}
                onChange={setTimeStepIndex}
              />
            )}
            <QueryPanelInline
              query={resolvedQuery}
              duration={queryDuration}
              rowCount={rowCount}
              isLoading={isLoading}
              error={error}
            />
          </>
        }
        timeControls={
          timestamps.length > 1 ? (
            <MobileTimeControls
              timestamps={timestamps}
              selectedIndex={timeStepIndex}
              onChange={setTimeStepIndex}
            />
          ) : undefined
        }
      />

      {/* Zoom & H3 resolution control */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-2 sm:top-6 sm:right-6">
        {/* Zoom circle */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/95 shadow-lg backdrop-blur-md sm:h-14 sm:w-14 dark:border-white/10 dark:bg-black/85">
          <div className="text-center">
            <div className="font-mono text-xs font-bold text-gray-900 tabular-nums dark:text-white">
              {zoom.toFixed(1)}
            </div>
            <div className="text-[8px] font-medium text-gray-400 uppercase dark:text-white/40">
              zoom
            </div>
          </div>
        </div>

        {/* H3 resolution stepper */}
        <div className="flex items-center gap-0 rounded-full border border-black/10 bg-white/95 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-black/85">
          <button
            type="button"
            onClick={() => handleH3ResChange(-1)}
            disabled={h3Res <= currentSection.h3ResRange[0]}
            className="flex h-8 w-8 items-center justify-center rounded-l-full text-gray-600 transition-colors hover:bg-black/5 disabled:opacity-20 dark:text-white/60 dark:hover:bg-white/10"
            aria-label="Decrease H3 resolution"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" />
            </svg>
          </button>
          <div className="flex min-w-[2.5rem] flex-col items-center px-1">
            <span className="font-mono text-xs font-bold text-gray-900 tabular-nums dark:text-white">
              {h3Res}
            </span>
            <span className="text-[7px] font-medium text-gray-400 uppercase dark:text-white/40">
              h3 res
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleH3ResChange(1)}
            disabled={h3Res >= currentSection.h3ResRange[1]}
            className="flex h-8 w-8 items-center justify-center rounded-r-full text-gray-600 transition-colors hover:bg-black/5 disabled:opacity-20 dark:text-white/60 dark:hover:bg-white/10"
            aria-label="Increase H3 resolution"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 5v14M5 12h14"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Parquet info panel (top-left) */}
      <ParquetInfoPanel info={parquetInfo} isLoading={isLoading} />

      {/* Desktop time slider */}
      <TimeSlider
        timestamps={timestamps}
        selectedIndex={timeStepIndex}
        onChange={setTimeStepIndex}
        isLoading={isLoading}
      />

      {/* Desktop-only floating SQL panel */}
      <QueryPanel
        query={resolvedQuery}
        duration={queryDuration}
        rowCount={rowCount}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

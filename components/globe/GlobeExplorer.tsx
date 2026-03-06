'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { GlobeMap } from './GlobeMap';
import { ScrollSection } from './ScrollSection';
import {
  QueryPanel,
  QueryPanelInline,
  ParquetInfoPanel,
  ParquetInfoInline,
} from './QueryPanel';
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
  initialSection?: number;
  /** Hide all UI overlays — used when embedding the globe (e.g. homepage hero). */
  embed?: boolean;
}

export function GlobeExplorer({
  sections = SECTIONS,
  initialSection = 0,
  embed = false,
}: GlobeExplorerProps) {
  const isOverGlobeRef = useRef(false);
  const { containerRef, activeSection, navigate } = useGlobeScroll(
    sections.length,
    isOverGlobeRef,
    initialSection
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
  const [pendingH3Res, setPendingH3Res] = useState<number | null>(null);
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

  // Keep URL in sync with active section (replaceState — no navigation)
  useEffect(() => {
    const id = sections[activeSection]?.id;
    if (!id) return;
    const url = new URL(window.location.href);
    url.searchParams.set('section', id);
    window.history.replaceState(null, '', url.toString());
  }, [activeSection, sections]);

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
      const cur = h3ResOverrides[activeSection] ?? currentSection.defaultH3Res;
      const next = Math.max(min, Math.min(max, cur + delta));
      if (next === cur) return;

      // Warn when increasing to res 4+
      if (next >= 4 && delta > 0) {
        setPendingH3Res(next);
        return;
      }

      setH3ResOverrides((prev) => ({ ...prev, [activeSection]: next }));
    },
    [activeSection, currentSection, h3ResOverrides]
  );

  const handleZoomChange = useCallback((z: number) => {
    requestAnimationFrame(() => setZoom(z));
  }, []);

  // Resolve data-driven description once loading completes
  const resolvedDescription = useMemo(() => {
    if (!isLoading && currentSection.describeData && allRows.length > 0) {
      return currentSection.describeData(allRows);
    }
    return currentSection.description;
  }, [isLoading, currentSection, allRows]);

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

      {!embed && (
        <ScrollSection
          section={currentSection}
          resolvedDescription={resolvedDescription}
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
              <QueryPanelInline
                query={resolvedQuery}
                duration={queryDuration}
                rowCount={rowCount}
                isLoading={isLoading}
                error={error}
              />
              <ParquetInfoInline info={parquetInfo} isLoading={isLoading} />
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
      )}

      {!embed && (
        <>
          {/* Theme toggle + Zoom & H3 resolution control */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 sm:top-6 sm:right-6">
            <div className="border-border/50 bg-background/90 overflow-hidden rounded-full border shadow-lg backdrop-blur-md">
              <ThemeToggle />
            </div>
            <div className="border-border/50 bg-background/90 flex items-center gap-0 rounded-full border shadow-lg backdrop-blur-md">
              <button
                type="button"
                onClick={() => handleH3ResChange(-1)}
                disabled={h3Res <= currentSection.h3ResRange[0]}
                className="text-muted-foreground hover:bg-accent flex h-9 w-9 items-center justify-center rounded-l-full transition-colors disabled:opacity-20 sm:h-10 sm:w-10"
                aria-label="Decrease H3 resolution"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 12H5"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-1.5 px-1">
                <div className="text-center">
                  <div className="text-foreground font-mono text-sm font-extrabold tabular-nums">
                    {zoom.toFixed(1)}
                  </div>
                  <div className="text-muted-foreground text-3xs font-semibold uppercase">
                    zoom
                  </div>
                </div>
                <div className="bg-border h-6 w-px" />
                <div className="text-center">
                  <div className="text-foreground font-mono text-sm font-extrabold tabular-nums">
                    {h3Res}
                  </div>
                  <div className="text-muted-foreground text-3xs font-semibold uppercase">
                    h3 res
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleH3ResChange(1)}
                disabled={h3Res >= currentSection.h3ResRange[1]}
                className="text-muted-foreground hover:bg-accent flex h-9 w-9 items-center justify-center rounded-r-full transition-colors disabled:opacity-20 sm:h-10 sm:w-10"
                aria-label="Increase H3 resolution"
              >
                <svg
                  className="h-3.5 w-3.5"
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

          {/* Back button + Parquet info (top-left) */}
          <div className="absolute top-18 left-4 z-20 hidden items-center gap-2 sm:top-6 sm:left-6 sm:flex">
            <Link
              href="/"
              className="border-border/50 bg-background/90 text-foreground hover:bg-accent flex h-10 w-10 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-colors"
              aria-label="Back to home"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <ParquetInfoPanel info={parquetInfo} isLoading={isLoading} />
          </div>

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

          {/* Branding — top-left on mobile, bottom-right on desktop */}
          <Link
            href="/links"
            className="absolute top-4 left-4 z-20 flex flex-col items-center gap-0.5 transition-opacity hover:opacity-70 sm:top-auto sm:right-6 sm:bottom-6 sm:left-auto sm:gap-1"
          >
            <Image
              src="/icon.svg"
              alt="walkthru.earth logo"
              width={28}
              height={28}
              className="sm:h-9 sm:w-9 dark:invert"
            />
            <span className="text-muted-foreground text-3xs sm:text-2xs font-semibold tracking-tight">
              walkthru.earth
            </span>
          </Link>

          {/* H3 high-res warning */}
          <AlertDialog
            open={pendingH3Res !== null}
            onOpenChange={(open) => {
              if (!open) setPendingH3Res(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Increase to H3 resolution {pendingH3Res}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Higher resolutions load significantly more data and may slow
                  down or crash your browser depending on your device&apos;s GPU
                  and available memory.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (pendingH3Res !== null) {
                      setH3ResOverrides((prev) => ({
                        ...prev,
                        [activeSection]: pendingH3Res,
                      }));
                    }
                    setPendingH3Res(null);
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}

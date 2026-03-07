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
import { BASE_LAND_ID, BASE_BORDERS_ID, computeRange } from './data/constants';
import { useUserLocation } from './hooks/useUserLocation';
import { UserLocationCard } from './UserLocationCard';
import { LayerPanel, type LayerControl } from './LayerPanel';
import type { PinScreenPos } from './GlobeMap';

/* ── Helpers ─────────────────────────────────────────────────────── */

/** Convert hyparquet timestamp (BigInt µs, Date, or number) to epoch ms. */
function tsToMs(v: unknown): number {
  if (typeof v === 'bigint') return Number(v / 1000n);
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v > 1e12 ? v : v * 1000;
  return 0;
}

/* ── Unified layer state ─────────────────────────────────────────── */

interface LayerState {
  visible: boolean;
  opacity: number;
}

const DEFAULT_LAYER: LayerState = { visible: true, opacity: 0.85 };
const DEFAULT_BASE: LayerState = { visible: false, opacity: 0.3 };

/* ── Component ───────────────────────────────────────────────────── */

interface GlobeExplorerProps {
  sections?: GlobeSection[];
  initialSection?: number;
  /** Hide all UI chrome — used when embedding the globe (e.g. homepage hero). */
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

  const {
    location: userLocation,
    isLocating,
    locate: locateUser,
    clear: clearUserLocation,
  } = useUserLocation();

  const [pinScreen, setPinScreen] = useState<PinScreenPos | null>(null);

  // ── Unified layer state dict ──
  // Keys: 'h3-layer', 'base-land', 'base-borders'
  const [layerState, setLayerState] = useState<Record<string, LayerState>>({});

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

  // ── Timestamps ──
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

  const layerData = useMemo(() => {
    if (timestamps.length <= 1) return allRows;
    const targetMs = timestamps[timeStepIndex] ?? timestamps[0];
    return allRows.filter((r) => tsToMs(r.timestamp) === targetMs);
  }, [allRows, timestamps, timeStepIndex]);

  // ── Refs ──
  const activeSectionRef = useRef(0);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  // Keep URL in sync with active section
  useEffect(() => {
    const id = sections[activeSection]?.id;
    if (!id) return;
    const url = new URL(window.location.href);
    url.searchParams.set('section', id);
    window.history.replaceState(null, '', url.toString());
  }, [activeSection, sections]);

  /** Promise cache keyed by "sectionIdx:h3Res". */
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

  // ── Data loading ──
  const loadSection = useCallback(
    (sectionIdx: number, section: GlobeSection, ctx: QueryContext) => {
      const cacheKey = `${sectionIdx}:${ctx.h3Res}`;
      let loadPromise = cacheRef.current.get(cacheKey);

      if (!loadPromise) {
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
          return { rows: result.rows, duration, range, info: result.info };
        });
        cacheRef.current.set(cacheKey, loadPromise);
        loadPromise.catch(() => cacheRef.current.delete(cacheKey));
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
          setError(msg);
          setAllRows([]);
          setQueryDuration(null);
          setRowCount(0);
          setParquetInfo(null);
          setIsLoading(false);
        });
    },
    []
  );

  // Load current section + prefetch next
  useEffect(() => {
    if (!queryCtx) return;

    loadSection(activeSection, currentSection, queryCtx);

    const cacheKey = `${activeSection}:${queryCtx.h3Res}`;
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
  ]);

  // ── Base layer controls for GlobeMap ──
  const baseControls = useMemo(
    () => ({
      [BASE_LAND_ID]: layerState[BASE_LAND_ID] ?? DEFAULT_BASE,
      [BASE_BORDERS_ID]: layerState[BASE_BORDERS_ID] ?? DEFAULT_BASE,
    }),
    [layerState]
  );

  // ── Layer panel entries ──
  const layerControls = useMemo<LayerControl[]>(() => {
    const legend = currentSection.colorLegend;
    const ls = layerState['h3-layer'] ?? DEFAULT_LAYER;
    const entries: LayerControl[] = [
      {
        id: 'h3-layer',
        label: currentSection.title,
        color: legend[Math.floor(legend.length / 2)]?.color ?? '#888',
        visible: ls.visible,
        opacity: ls.opacity,
        rowCount,
      },
    ];

    // Base layers (initially hidden)
    const land = layerState[BASE_LAND_ID] ?? DEFAULT_BASE;
    entries.push({
      id: BASE_LAND_ID,
      label: 'Land',
      color: 'rgb(80,140,100)',
      visible: land.visible,
      opacity: land.opacity,
      rowCount: 0,
    });
    const borders = layerState[BASE_BORDERS_ID] ?? DEFAULT_BASE;
    entries.push({
      id: BASE_BORDERS_ID,
      label: 'Country Borders',
      color: 'rgb(100,120,100)',
      visible: borders.visible,
      opacity: borders.opacity,
      rowCount: 0,
    });

    return entries;
  }, [currentSection, layerState, rowCount]);

  // ── Layer panel callbacks ──
  const handleLayerToggle = useCallback(
    (id: string) =>
      setLayerState((prev) => {
        const cur = prev[id] ?? DEFAULT_LAYER;
        return { ...prev, [id]: { ...cur, visible: !cur.visible } };
      }),
    []
  );

  const handleLayerOpacity = useCallback(
    (id: string, opacity: number) =>
      setLayerState((prev) => {
        const cur = prev[id] ?? DEFAULT_LAYER;
        return { ...prev, [id]: { ...cur, opacity } };
      }),
    []
  );

  // ── Single-layer props (derived from layer state) ──
  const singleLS = layerState['h3-layer'] ?? DEFAULT_LAYER;

  const handleH3ResChange = useCallback(
    (delta: number) => {
      const [min, max] = currentSection.h3ResRange;
      const cur = h3ResOverrides[activeSection] ?? currentSection.defaultH3Res;
      const next = Math.max(min, Math.min(max, cur + delta));
      if (next === cur) return;
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

  const resolvedDescription = useMemo(() => {
    if (!isLoading && currentSection.describeData && allRows.length > 0) {
      return currentSection.describeData(allRows);
    }
    return currentSection.description;
  }, [isLoading, currentSection, allRows]);

  return (
    <div ref={containerRef} className="relative h-dvh w-full overflow-hidden">
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
        userLocation={userLocation}
        onUserPinScreen={setPinScreen}
        layerOpacity={singleLS.opacity}
        layerVisible={singleLS.visible}
        baseControls={baseControls}
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
          {/* User location card — positioned at pin top in 3D */}
          {userLocation && (
            <UserLocationCard
              location={userLocation}
              section={currentSection}
              layerData={layerData}
              h3Res={h3Res}
              pinScreen={pinScreen}
            />
          )}

          {/* Layers + Locate + Zoom & H3 resolution control */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 sm:top-6 sm:right-6">
            <LayerPanel
              layers={layerControls}
              onToggle={handleLayerToggle}
              onOpacity={handleLayerOpacity}
            />
            {/* Locate me button */}
            <button
              type="button"
              onClick={userLocation ? clearUserLocation : locateUser}
              disabled={isLocating}
              className={[
                'border-border/50 bg-background/90 flex h-9 w-9 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all sm:h-10 sm:w-10',
                isLocating ? 'animate-pulse' : '',
                userLocation
                  ? 'border-amber-400/50 text-amber-400'
                  : 'text-muted-foreground hover:bg-accent',
              ].join(' ')}
              aria-label={userLocation ? 'Clear location' : 'Find my location'}
            >
              {isLocating ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {userLocation ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="3" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 2v3m0 14v3M2 12h3m14 0h3"
                      />
                      <circle cx="12" cy="12" r="8" strokeDasharray="2 3" />
                    </>
                  )}
                </svg>
              )}
            </button>
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

          {/* Back button + Theme toggle + Parquet info (top-left, desktop only) */}
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
            <div className="border-border/50 bg-background/90 overflow-hidden rounded-full border shadow-lg backdrop-blur-md">
              <ThemeToggle />
            </div>
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
              width={36}
              height={36}
              className="drop-shadow-[0_0_6px_rgba(255,255,255,0.6)] sm:h-11 sm:w-11"
            />
            <span
              className="text-2xs font-bold tracking-tight text-black sm:text-xs"
              style={{
                WebkitTextStroke: '1.5px white',
                paintOrder: 'stroke fill',
              }}
            >
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

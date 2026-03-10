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
import {
  BASE_SATELLITE_ID,
  BASE_LAND_ID,
  BASE_BORDERS_ID,
  computeRange,
} from './data/constants';
import { useUserLocation } from './hooks/useUserLocation';
import { UserLocationCard } from './UserLocationCard';
import { LayerPanel, type LayerControl } from './LayerPanel';
import type { PinScreenPos } from './GlobeMap';
import { viewportToH3Ranges } from './utils/h3-viewport';

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

const DEFAULT_LAYER: LayerState = { visible: true, opacity: 0.95 };
const DEFAULT_BASE: LayerState = { visible: false, opacity: 0.3 };

/* ── Component ───────────────────────────────────────────────────── */

interface GlobeExplorerProps {
  sections?: GlobeSection[];
  initialSection?: number;
  /** Initial viewport from URL params (z/lat/lng/h3). */
  initialZoom?: number;
  initialLat?: number;
  initialLng?: number;
  initialH3Res?: number;
  /** Hide all UI chrome — used when embedding the globe (e.g. homepage hero). */
  embed?: boolean;
}

export function GlobeExplorer({
  sections = SECTIONS,
  initialSection = 0,
  initialZoom,
  initialLat,
  initialLng,
  initialH3Res,
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
  const [zoom, setZoom] = useState(
    initialZoom ?? sections[0]?.viewState.zoom ?? 1.5
  );
  const [longitude, setLongitude] = useState(
    initialLng ?? sections[0]?.viewState.longitude ?? 0
  );
  const [latitude, setLatitude] = useState(
    initialLat ?? sections[0]?.viewState.latitude ?? 20
  );
  const [viewportBounds, setViewportBounds] = useState<
    [number, number, number, number] | null
  >(null);
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

  // Per-section h3Res overrides (sparse — only stores manual user changes)
  const [h3ResOverrides, setH3ResOverrides] = useState<Record<number, number>>(
    () => (initialH3Res != null ? { [initialSection]: initialH3Res } : {})
  );
  const [pendingH3Res, setPendingH3Res] = useState<number | null>(null);
  const currentSection = sections[activeSection];

  // Debounced viewport bounds for H3 range computation.
  const [debouncedBounds, setDebouncedBounds] = useState<
    [number, number, number, number] | null
  >(null);

  // Reset zoom + bounds when switching sections so autoH3Res is correct
  // immediately (before the fly-to animation completes).
  // Render-time state adjustment: no useEffect, no refs during render.
  const [prevSection, setPrevSection] = useState(activeSection);
  if (prevSection !== activeSection) {
    console.log(
      `[Globe:Explorer] section change → #${activeSection} "${currentSection.id}" zoom=${currentSection.viewState.zoom} h3Range=[${currentSection.h3ResRange}]`
    );
    setPrevSection(activeSection);
    setZoom(currentSection.viewState.zoom);
    setViewportBounds(null);
    setDebouncedBounds(null);
  }

  // Auto H3 resolution from zoom level (clamped to section's range)
  const autoH3Res = useMemo(() => {
    const [min, max] = currentSection.h3ResRange;
    const mapped = Math.round(zoom * 0.8);
    const clamped = Math.max(min, Math.min(max, mapped));
    console.log(
      `[Globe:Explorer] autoH3Res: zoom=${zoom.toFixed(2)} → mapped=${mapped} → clamped=${clamped} (range=[${min},${max}])`
    );
    return clamped;
  }, [zoom, currentSection.h3ResRange]);

  // Manual override takes priority; otherwise auto from zoom
  const h3Res = h3ResOverrides[activeSection] ?? autoH3Res;

  // When h3Res changes, flush bounds immediately (render-time adjustment).
  const [prevH3Res, setPrevH3Res] = useState(h3Res);
  if (prevH3Res !== h3Res) {
    setPrevH3Res(h3Res);
    console.log(`[Globe:Explorer] h3Res changed → flush bounds immediately`);
    setDebouncedBounds(viewportBounds);
  }

  // Debounce viewport bound changes (only fires on viewportBounds change).
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBounds(viewportBounds), 400);
    return () => clearTimeout(timer);
  }, [viewportBounds]);

  // Compute H3 viewport ranges from debounced bounds
  const h3Ranges = useMemo(() => {
    if (!debouncedBounds) {
      console.log(`[Globe:Explorer] h3Ranges: null (no bounds yet)`);
      return null;
    }
    const result = viewportToH3Ranges(debouncedBounds, h3Res);
    console.log(
      `[Globe:Explorer] h3Ranges: h3Res=${h3Res} bounds=[${debouncedBounds.map((v) => v.toFixed(1)).join(', ')}] → ${result ? `${result.length} ranges` : 'null (full file)'}`
    );
    return result;
  }, [debouncedBounds, h3Res]);

  const queryCtx = useMemo<QueryContext | null>(
    () => (weatherPrefix ? { weatherPrefix, h3Res, h3Ranges } : null),
    [weatherPrefix, h3Res, h3Ranges]
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
    if (timestamps.length <= 1) {
      console.log(
        `[Globe:Explorer] layerData: ${allRows.length} rows (no timestamp filter, ${timestamps.length} timestamps)`
      );
      return allRows;
    }
    const targetMs = timestamps[timeStepIndex] ?? timestamps[0];
    const filtered = allRows.filter((r) => tsToMs(r.timestamp) === targetMs);
    console.log(
      `[Globe:Explorer] layerData: ${allRows.length} → ${filtered.length} rows (ts step ${timeStepIndex}/${timestamps.length})`
    );
    return filtered;
  }, [allRows, timestamps, timeStepIndex]);

  // ── Refs ──
  const activeSectionRef = useRef(0);
  const loadGenRef = useRef(0);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  // Keep URL in sync with viewport state (debounced to avoid thrashing)
  useEffect(() => {
    const id = sections[activeSection]?.id;
    if (!id) return;
    const timer = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('section', id);
      url.searchParams.set('z', zoom.toFixed(1));
      url.searchParams.set('y', latitude.toFixed(1));
      url.searchParams.set('x', longitude.toFixed(1));
      url.searchParams.set('h3', String(h3Res));
      window.history.replaceState(null, '', url.toString());
    }, 500);
    return () => clearTimeout(timer);
  }, [activeSection, sections, zoom, latitude, longitude, h3Res]);

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
      const gen = ++loadGenRef.current;
      const isFiltered = ctx.h3Ranges != null && ctx.h3Ranges.length > 0;
      // Unfiltered loads are cached; filtered (viewport) loads always re-fetch
      const cacheKey = isFiltered ? null : `${sectionIdx}:${ctx.h3Res}`;
      let loadPromise = cacheKey ? cacheRef.current.get(cacheKey) : undefined;

      console.log(
        `[Globe:Explorer] loadSection #${sectionIdx} "${section.id}" gen=${gen} h3Res=${ctx.h3Res} ` +
          `filtered=${isFiltered} ranges=${ctx.h3Ranges?.length ?? 0} ` +
          `cacheKey=${cacheKey ?? 'none'} cached=${!!loadPromise}`
      );

      if (!loadPromise) {
        // Schedule loading UI update asynchronously to avoid synchronous
        // setState within effects (react-hooks/set-state-in-effect).
        queueMicrotask(() => {
          if (
            gen === loadGenRef.current &&
            activeSectionRef.current === sectionIdx
          ) {
            setIsLoading(true);
            setError(null);
            if (!isFiltered) setParquetInfo(null);
          }
        });

        const start = performance.now();
        const onProgress = (partialRows: Record<string, unknown>[]) => {
          if (gen !== loadGenRef.current) {
            console.log(
              `[Globe:Explorer] onProgress STALE gen=${gen} current=${loadGenRef.current} — skipped ${partialRows.length} rows`
            );
            return;
          }
          setAllRows(partialRows);
          setRowCount(partialRows.length);
        };

        loadPromise = section.loadData(ctx, onProgress).then((result) => {
          const duration = performance.now() - start;
          const range = computeRange(result.rows, section.colorColumn);
          console.log(
            `[Globe:Explorer] loadData resolved gen=${gen} rows=${result.rows.length} ` +
              `duration=${duration.toFixed(0)}ms colorRange=[${range.min.toFixed(2)}, ${range.max.toFixed(2)}]`
          );
          return { rows: result.rows, duration, range, info: result.info };
        });
        if (cacheKey) cacheRef.current.set(cacheKey, loadPromise);
        if (cacheKey)
          loadPromise.catch(() => cacheRef.current.delete(cacheKey));
      }

      loadPromise
        .then((result) => {
          if (gen !== loadGenRef.current) {
            console.log(
              `[Globe:Explorer] .then() STALE gen=${gen} current=${loadGenRef.current} — discarding ${result.rows.length} rows`
            );
            return;
          }
          console.log(
            `[Globe:Explorer] ✓ RENDER gen=${gen} rows=${result.rows.length} duration=${result.duration.toFixed(0)}ms`
          );
          setAllRows(result.rows);
          setColorRange(result.range);
          setQueryDuration(result.duration);
          setRowCount(result.rows.length);
          setParquetInfo(result.info);
          setIsLoading(false);
        })
        .catch((err) => {
          if (gen !== loadGenRef.current) {
            console.log(
              `[Globe:Explorer] .catch() STALE gen=${gen} current=${loadGenRef.current}`
            );
            return;
          }
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[Globe:Explorer] ✗ ERROR gen=${gen}:`, msg);
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

    // Prefetch next section (unfiltered — no viewport ranges for unseen sections)
    const isFiltered =
      queryCtx.h3Ranges != null && queryCtx.h3Ranges.length > 0;
    const cacheKey = isFiltered ? null : `${activeSection}:${queryCtx.h3Res}`;
    const currentPromise = cacheKey
      ? cacheRef.current.get(cacheKey)
      : undefined;
    const nextIdx = activeSection + 1;
    if (currentPromise && nextIdx < sections.length) {
      const next = sections[nextIdx];
      const nextRes = h3ResOverrides[nextIdx] ?? next.defaultH3Res;
      const nextCtx = { ...queryCtx, h3Res: nextRes, h3Ranges: null };
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
      [BASE_SATELLITE_ID]: layerState[BASE_SATELLITE_ID] ?? DEFAULT_BASE,
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
    const satellite = layerState[BASE_SATELLITE_ID] ?? DEFAULT_BASE;
    entries.push({
      id: BASE_SATELLITE_ID,
      label: 'Satellite',
      color: 'rgb(60,100,160)',
      visible: satellite.visible,
      opacity: satellite.opacity,
      rowCount: 0,
    });
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

  // Zoom at the time of the last manual h3Res override — used to auto-clear
  const [overrideZoom, setOverrideZoom] = useState(zoom);

  const handleH3ResChange = useCallback(
    (delta: number) => {
      const [min, max] = currentSection.h3ResRange;
      const cur = h3Res;
      const next = Math.max(min, Math.min(max, cur + delta));
      if (next === cur) return;
      if (next >= 4 && delta > 0) {
        setPendingH3Res(next);
        return;
      }
      setOverrideZoom(zoom);
      setH3ResOverrides((prev) => ({ ...prev, [activeSection]: next }));
    },
    [activeSection, currentSection, h3Res, zoom]
  );

  // Clear manual override when user zooms away from where it was set
  // (render-time state adjustment — avoids useEffect + synchronous setState)
  if (Math.abs(zoom - overrideZoom) > 0.5 && activeSection in h3ResOverrides) {
    const next = { ...h3ResOverrides };
    delete next[activeSection];
    setH3ResOverrides(next);
  }

  const handleViewportChange = useCallback(
    (state: {
      zoom: number;
      longitude: number;
      latitude: number;
      bounds: [number, number, number, number] | null;
    }) => {
      setZoom(state.zoom);
      setLongitude(state.longitude);
      setLatitude(state.latitude);
      setViewportBounds(state.bounds);
    },
    []
  );

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
        onViewportChange={handleViewportChange}
        onTap={handleGlobeTap}
        userLocation={userLocation}
        onUserPinScreen={setPinScreen}
        layerOpacity={singleLS.opacity}
        layerVisible={singleLS.visible}
        baseControls={baseControls}
        initialViewStateOverride={
          initialZoom != null && initialLat != null && initialLng != null
            ? { zoom: initialZoom, latitude: initialLat, longitude: initialLng }
            : undefined
        }
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
                autoPlay={!isLoading}
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
            autoPlay={!isLoading}
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
                      setOverrideZoom(zoom);
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

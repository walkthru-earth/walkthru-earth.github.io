'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { GlobeMap } from './GlobeMap';
import { ScrollSection } from './ScrollSection';
import { QueryPanel } from './QueryPanel';
import { useGlobeScroll } from './hooks/useGlobeScroll';
import {
  SECTIONS,
  viewStateToBBox,
  resolveWeatherPrefix,
  type GlobeSection,
  type QueryContext,
  type ColorRange,
} from './data/sections';

interface GlobeExplorerProps {
  sections?: GlobeSection[];
}

export function GlobeExplorer({ sections = SECTIONS }: GlobeExplorerProps) {
  const { containerRef, activeSection, navigate } = useGlobeScroll(
    sections.length
  );

  const [layerData, setLayerData] = useState<Record<string, unknown>[]>([]);
  const [colorRange, setColorRange] = useState<ColorRange>({ min: 0, max: 1 });
  const [queryDuration, setQueryDuration] = useState<number | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryCtx, setQueryCtx] = useState<QueryContext | null>(null);

  const lastQueriedSection = useRef(-1);

  /** Promise-based cache — stores in-flight promises to prevent duplicate loads. */
  const cacheRef = useRef<
    Map<
      number,
      Promise<{
        rows: Record<string, unknown>[];
        duration: number;
        range: ColorRange;
      }>
    >
  >(new Map());

  const currentSection = sections[activeSection];

  // Derive display query (no effect or setState needed)
  const resolvedQuery = useMemo(() => {
    if (!queryCtx) return '';
    const bbox = viewStateToBBox(currentSection.viewState);
    return currentSection.buildQuery(bbox, queryCtx);
  }, [queryCtx, currentSection]);

  // Resolve weather prefix once on mount
  useEffect(() => {
    let cancelled = false;
    resolveWeatherPrefix().then((prefix) => {
      if (!cancelled) setQueryCtx({ weatherPrefix: prefix });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Compute P5/P95 percentile range from loaded rows for dynamic color scaling.
   */
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
   * Load data for a section. Called when activeSection changes.
   * All setState calls happen inside async callbacks (satisfies lint rule).
   */
  const loadSection = useCallback(
    (sectionIdx: number, section: GlobeSection, ctx: QueryContext) => {
      const bbox = viewStateToBBox(section.viewState);

      let loadPromise = cacheRef.current.get(sectionIdx);
      const isNewLoad = !loadPromise;

      if (!loadPromise) {
        const start = performance.now();
        loadPromise = section.loadData(bbox, ctx).then((rows) => {
          const duration = performance.now() - start;
          const range = computeRange(rows, section.colorColumn);
          console.log(
            `[Globe] Loaded "${section.id}": ${rows.length} rows in ${duration.toFixed(0)}ms`
          );
          console.log(`[Globe] colorRange:`, range);
          if (rows.length > 0) {
            console.log(
              '[Globe] Sample row:',
              JSON.stringify(rows[0]).slice(0, 200)
            );
          }
          return { rows, duration, range };
        });
        cacheRef.current.set(sectionIdx, loadPromise);
        loadPromise.catch(() => cacheRef.current.delete(sectionIdx));
      }

      // Track cancellation for this specific load
      let cancelled = false;

      if (isNewLoad) {
        // Set loading state via promise callback (async — satisfies lint rule)
        Promise.resolve().then(() => {
          if (!cancelled) {
            setIsLoading(true);
            setError(null);
          }
        });
      }

      loadPromise
        .then((result) => {
          if (cancelled) return;
          setLayerData(result.rows);
          setColorRange(result.range);
          setQueryDuration(result.duration);
          setRowCount(result.rows.length);
          setIsLoading(false);
        })
        .catch((err) => {
          if (cancelled) return;
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[Globe] Load failed for "${section.id}":`, msg);
          setError(msg);
          setLayerData([]);
          setQueryDuration(null);
          setRowCount(0);
          setIsLoading(false);
        });

      return () => {
        cancelled = true;
      };
    },
    [computeRange]
  );

  // Trigger load when section changes
  useEffect(() => {
    if (!queryCtx) return;
    if (activeSection === lastQueriedSection.current) return;

    lastQueriedSection.current = activeSection;
    console.log(`[Globe] Section ${activeSection}: "${currentSection.id}"`);

    return loadSection(activeSection, currentSection, queryCtx);
  }, [queryCtx, activeSection, currentSection, loadSection]);

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
      />

      <ScrollSection
        section={currentSection}
        isActive={true}
        sectionIndex={activeSection}
        totalSections={sections.length}
        onSwipe={(dir) => navigate(dir)}
      />

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

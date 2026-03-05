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
  const isOverGlobeRef = useRef(false);
  const { containerRef, activeSection, navigate } = useGlobeScroll(
    sections.length,
    isOverGlobeRef
  );

  const [layerData, setLayerData] = useState<Record<string, unknown>[]>([]);
  const [colorRange, setColorRange] = useState<ColorRange>({ min: 0, max: 1 });
  const [queryDuration, setQueryDuration] = useState<number | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queryCtx, setQueryCtx] = useState<QueryContext | null>(null);

  // Ref tracks the active section so async callbacks can check without stale closures
  const activeSectionRef = useRef(0);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  /** Promise-based cache to prevent duplicate loads. */
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

  const handleCursorOverGlobe = useCallback((isOver: boolean) => {
    isOverGlobeRef.current = isOver;
  }, []);

  const resolvedQuery = useMemo(() => {
    const bbox = viewStateToBBox(currentSection.viewState);
    const ctx = queryCtx ?? { weatherPrefix: '...' };
    return currentSection.buildQuery(bbox, ctx);
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
      const bbox = viewStateToBBox(section.viewState);

      let loadPromise = cacheRef.current.get(sectionIdx);

      if (!loadPromise) {
        console.log(
          `[Globe] Loading "${section.id}" (section ${sectionIdx})...`
        );
        // Defer setState to avoid synchronous setState in effect body
        Promise.resolve().then(() => {
          if (activeSectionRef.current !== sectionIdx) return;
          setIsLoading(true);
          setError(null);
        });

        const start = performance.now();

        // Progressive callback — updates layer as row groups stream in
        const onProgress = (partialRows: Record<string, unknown>[]) => {
          if (activeSectionRef.current !== sectionIdx) return;
          console.log(
            `[Globe] "${section.id}" chunk: ${partialRows.length} rows so far`
          );
          setLayerData([...partialRows]);
          setRowCount(partialRows.length);
        };

        loadPromise = section.loadData(bbox, ctx, onProgress).then((rows) => {
          const duration = performance.now() - start;
          const range = computeRange(rows, section.colorColumn);
          console.log(
            `[Globe] "${section.id}" done: ${rows.length} rows in ${duration.toFixed(0)}ms`
          );
          return { rows, duration, range };
        });
        cacheRef.current.set(sectionIdx, loadPromise);
        loadPromise.catch(() => cacheRef.current.delete(sectionIdx));
      } else {
        console.log(`[Globe] "${section.id}" cache hit`);
      }

      loadPromise
        .then((result) => {
          if (activeSectionRef.current !== sectionIdx) return;
          setLayerData(result.rows);
          setColorRange(result.range);
          setQueryDuration(result.duration);
          setRowCount(result.rows.length);
          setIsLoading(false);
        })
        .catch((err) => {
          if (activeSectionRef.current !== sectionIdx) return;
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[Globe] Load failed for "${section.id}":`, msg);
          setError(msg);
          setLayerData([]);
          setQueryDuration(null);
          setRowCount(0);
          setIsLoading(false);
        });
    },
    [computeRange]
  );

  // Load current section, then prefetch next after it completes
  useEffect(() => {
    if (!queryCtx) return;

    // Load the active section
    loadSection(activeSection, currentSection, queryCtx);

    // Prefetch next section AFTER current finishes — avoid bandwidth competition
    const currentPromise = cacheRef.current.get(activeSection);
    const nextIdx = activeSection + 1;
    if (currentPromise && nextIdx < sections.length) {
      currentPromise.then(() => {
        if (activeSectionRef.current !== activeSection) return;
        if (cacheRef.current.has(nextIdx)) return;
        const next = sections[nextIdx];
        const bbox = viewStateToBBox(next.viewState);
        const start = performance.now();
        const prefetch = next.loadData(bbox, queryCtx).then((rows) => {
          const duration = performance.now() - start;
          const range = computeRange(rows, next.colorColumn);
          return { rows, duration, range };
        });
        cacheRef.current.set(nextIdx, prefetch);
        prefetch.catch(() => cacheRef.current.delete(nextIdx));
      });
    }
  }, [
    queryCtx,
    activeSection,
    currentSection,
    sections,
    loadSection,
    computeRange,
  ]);

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
      />

      <ScrollSection
        section={currentSection}
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

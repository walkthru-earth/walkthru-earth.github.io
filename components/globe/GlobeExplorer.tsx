'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { GlobeMap } from './GlobeMap';
import { ScrollSection } from './ScrollSection';
import { QueryPanel } from './QueryPanel';
import { useGlobeScroll } from './hooks/useGlobeScroll';
import { useDuckDB } from './hooks/useDuckDB';
import {
  SECTIONS,
  viewStateToBBox,
  resolveWeatherPrefix,
  type GlobeSection,
  type QueryContext,
} from './data/sections';

interface GlobeExplorerProps {
  /** Override default sections for reuse on other pages (e.g. /hormones-cities). */
  sections?: GlobeSection[];
}

export function GlobeExplorer({ sections = SECTIONS }: GlobeExplorerProps) {
  const viewStates = useMemo(
    () => sections.map((s) => s.viewState),
    [sections]
  );
  const { containerRef, activeSection, viewState } = useGlobeScroll(viewStates);
  const { isReady, isLoading, error, executeQuery } = useDuckDB();

  const [layerData, setLayerData] = useState<Record<string, unknown>[]>([]);
  const [queryDuration, setQueryDuration] = useState<number | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [resolvedQuery, setResolvedQuery] = useState('');
  const [queryCtx, setQueryCtx] = useState<QueryContext | null>(null);
  const lastQueriedSection = useRef<number>(-1);

  // Cache query results per section so scrolling back doesn't re-fetch
  const cacheRef = useRef<
    Map<
      number,
      { rows: Record<string, unknown>[]; duration: number; query: string }
    >
  >(new Map());

  const currentSection = sections[activeSection];

  // Resolve weather data prefix (date + hour) once on mount
  useEffect(() => {
    let cancelled = false;
    resolveWeatherPrefix().then((prefix) => {
      if (!cancelled) setQueryCtx({ weatherPrefix: prefix });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Execute query when active section changes
  useEffect(() => {
    if (!isReady || !queryCtx) return;
    if (activeSection === lastQueriedSection.current) return;

    lastQueriedSection.current = activeSection;
    console.log(`[Globe] Section ${activeSection}: "${currentSection.id}"`);

    // Check cache first
    const cached = cacheRef.current.get(activeSection);
    if (cached) {
      console.log(
        `[Globe] Cache hit for "${currentSection.id}" (${cached.rows.length} rows)`
      );
      setResolvedQuery(cached.query);
      setLayerData(cached.rows);
      setQueryDuration(cached.duration);
      setRowCount(cached.rows.length);
      return;
    }

    let cancelled = false;

    // Compute bbox from the section's target viewState
    const bbox = viewStateToBBox(currentSection.viewState);
    const query = currentSection.buildQuery(bbox, queryCtx);

    setResolvedQuery(query);

    const task = query
      ? executeQuery(query)
      : Promise.resolve({ rows: [] as Record<string, unknown>[], duration: 0 });

    task
      .then((result) => {
        if (cancelled) return;
        cacheRef.current.set(activeSection, {
          rows: result.rows,
          duration: result.duration,
          query,
        });
        setLayerData(result.rows);
        setQueryDuration(query ? result.duration : null);
        setRowCount(result.rows.length);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(
          `[GlobeExplorer] Query failed for "${currentSection.id}":`,
          err
        );
        setLayerData([]);
        setQueryDuration(null);
        setRowCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [isReady, queryCtx, activeSection, currentSection, executeQuery]);

  // Height: each section gets 100vh
  const totalHeight = `${sections.length * 100}vh`;

  return (
    <div
      ref={containerRef}
      style={{ height: totalHeight }}
      className="relative"
    >
      {/* Sticky map viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Globe */}
        <GlobeMap
          viewState={viewState}
          layerData={layerData}
          getHexagon={currentSection.getHexagon}
          getFillColor={currentSection.getFillColor}
          getElevation={currentSection.getElevation}
          formatTooltip={currentSection.formatTooltip}
          extruded={currentSection.extruded}
          elevationScale={currentSection.elevationScale}
        />

        {/* DuckDB loading indicator */}
        {!isReady && (
          <div className="bg-background/60 absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
              <p className="text-muted-foreground font-mono text-sm">
                Initializing DuckDB-WASM...
              </p>
            </div>
          </div>
        )}

        {/* Section description overlay */}
        <ScrollSection
          section={currentSection}
          isActive={true}
          sectionIndex={activeSection}
          totalSections={sections.length}
        />

        {/* SQL Query panel */}
        <QueryPanel
          query={resolvedQuery}
          duration={queryDuration}
          rowCount={rowCount}
          isLoading={isLoading}
          error={error}
        />

        {/* Scroll hint on intro */}
        {activeSection === 0 && (
          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 animate-bounce flex-col items-center gap-2 motion-reduce:animate-none">
            <span className="text-muted-foreground/60 font-mono text-xs">
              Scroll to explore
            </span>
            <svg
              className="text-muted-foreground/40 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

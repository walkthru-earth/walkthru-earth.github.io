'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GlobeMap } from './GlobeMap';
import {
  SECTIONS,
  resolveWeatherPrefix,
  type ColorRange,
  type QueryContext,
} from './data/sections';

interface GlobePreviewProps {
  /** Section id to display (e.g. 'terrain', 'weather-temperature') */
  sectionId: string;
  /** Optional className for the container */
  className?: string;
  /** Disable all interaction (pointer-events: none) */
  nonInteractive?: boolean;
}

/**
 * Lightweight globe renderer — loads and displays a single section
 * without any UI overlays. Smoothly transitions between sections.
 */
export function GlobePreview({
  sectionId,
  className = '',
  nonInteractive = false,
}: GlobePreviewProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [colorRange, setColorRange] = useState<ColorRange>({ min: 0, max: 1 });
  const [weatherPrefix, setWeatherPrefix] = useState<string | null>(null);
  const activeSectionRef = useRef(sectionId);

  const section = useMemo(
    () => SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0],
    [sectionId]
  );

  // Resolve weather prefix once
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
    (data: Record<string, unknown>[], column: string): ColorRange => {
      if (!column || data.length === 0) return { min: 0, max: 1 };
      const values = data
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

  // Promise cache to avoid duplicate loads
  const cacheRef = useRef<Map<string, Promise<Record<string, unknown>[]>>>(
    new Map()
  );

  useEffect(() => {
    if (!weatherPrefix) return;
    activeSectionRef.current = sectionId;

    const ctx: QueryContext = {
      weatherPrefix,
      h3Res: section.defaultH3Res,
    };

    const cacheKey = `${sectionId}:${ctx.h3Res}`;
    let loadPromise = cacheRef.current.get(cacheKey);

    if (!loadPromise) {
      loadPromise = section.loadData(ctx).then((result) => result.rows);
      cacheRef.current.set(cacheKey, loadPromise);
      loadPromise.catch(() => cacheRef.current.delete(cacheKey));
    }

    loadPromise.then((data) => {
      if (activeSectionRef.current !== sectionId) return;
      setRows(data);
      setColorRange(computeRange(data, section.colorColumn));
    });
  }, [weatherPrefix, sectionId, section, computeRange]);

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={nonInteractive ? { pointerEvents: 'none' } : undefined}
    >
      <GlobeMap
        targetViewState={section.viewState}
        layerData={rows}
        colorRange={colorRange}
        getHexagon={section.getHexagon}
        getFillColor={section.getFillColor}
        getElevation={section.getElevation}
        formatTooltip={nonInteractive ? undefined : section.formatTooltip}
        extruded={section.extruded}
        elevationScale={section.elevationScale}
      />
    </div>
  );
}

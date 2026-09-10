'use client';

import { GlobeMap } from './GlobeMap';
import { SECTIONS, h3ToHex } from './data/sections';
import { useSectionData } from './hooks/useSectionData';

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
  const section = SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0];
  const { rows, range: colorRange } = useSectionData(
    section,
    section.h3ResRange[0]
  );

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={nonInteractive ? { pointerEvents: 'none' } : undefined}
    >
      <GlobeMap
        targetViewState={section.viewState}
        layerData={rows}
        colorRange={colorRange}
        getHexagon={section.getHexagon ?? h3ToHex}
        getFillColor={section.getFillColor}
        getElevation={section.getElevation}
        formatTooltip={nonInteractive ? undefined : section.formatTooltip}
        extruded={section.extruded}
        elevationScale={section.elevationScale}
      />
    </div>
  );
}

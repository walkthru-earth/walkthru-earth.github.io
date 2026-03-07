'use client';

import { memo, useMemo } from 'react';
import type { UserLocation } from './hooks/useUserLocation';
import type { GlobeSection } from './data/sections';
import type { PinScreenPos } from './GlobeMap';

interface UserLocationCardProps {
  location: UserLocation;
  section: GlobeSection;
  layerData: Record<string, unknown>[];
  h3Res: number;
  /** Screen-space position of the pin top, updated each frame. */
  pinScreen: PinScreenPos | null;
}

export const UserLocationCard = memo(function UserLocationCard({
  location,
  section,
  layerData,
  h3Res,
  pinScreen,
}: UserLocationCardProps) {
  const userH3 = location.h3Indices[h3Res];

  const matchedRow = useMemo(() => {
    if (!userH3 || layerData.length === 0) return null;
    return (
      layerData.find((row) => {
        const rowH3 = section.getHexagon(row);
        return rowH3 === userH3;
      }) ?? null
    );
  }, [userH3, layerData, section]);

  const tooltipLines = useMemo(() => {
    if (!matchedRow) return null;
    if (!section.formatTooltip) return null;
    const raw = section.formatTooltip(matchedRow);
    if (!raw) return null;
    return raw.split('\n');
  }, [matchedRow, section]);

  const locationLabel =
    [location.city, location.country].filter(Boolean).join(', ') ||
    `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`;

  // Hide when no screen position or pin is on the far side of the globe
  if (!pinScreen || !pinScreen.visible) return null;

  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-30"
      style={{
        transform: `translate(${pinScreen.x}px, ${pinScreen.y}px) translate(-50%, -100%)`,
        willChange: 'transform',
      }}
    >
      {/* Card body */}
      <div className="pointer-events-auto relative mb-3 w-72 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-950/90 to-slate-900/90 px-5 py-4 shadow-2xl shadow-amber-400/20 backdrop-blur-xl sm:w-80">
        {/* Header */}
        <div className="mb-2.5 flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
          </span>
          <span className="text-sm font-semibold text-amber-300">
            Your Location
          </span>
        </div>

        {/* City / coords */}
        <p className="mb-1 text-base font-bold text-white">{locationLabel}</p>

        {/* Section title */}
        <p className="mb-3 text-xs font-medium tracking-wide text-amber-400/70 uppercase">
          {section.title}
        </p>

        {/* Data rows */}
        {tooltipLines ? (
          <div className="space-y-1">
            {tooltipLines.map((line) => {
              const [label, ...rest] = line.split(': ');
              const value = rest.join(': ');
              return (
                <div
                  key={line}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className="text-sm font-semibold text-white tabular-nums">
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            {layerData.length === 0
              ? 'Loading data...'
              : 'No data at this resolution for your area'}
          </p>
        )}

        {/* H3 cell ref */}
        <div className="mt-3 border-t border-white/10 pt-2">
          <p className="text-2xs truncate font-mono text-slate-500">
            H3 res {h3Res} &middot; {userH3 ?? '—'}
          </p>
        </div>
      </div>

      {/* Connector line from card to pin top */}
      <div className="mx-auto h-5 w-px bg-gradient-to-b from-amber-400/60 to-amber-400/0" />
    </div>
  );
});

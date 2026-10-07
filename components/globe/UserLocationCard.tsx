'use client';

import { memo, useMemo } from 'react';
import type { UserLocation } from './hooks/useUserLocation';
import { h3ToHex, type GlobeSection } from './data/sections';
import type { PinScreenPos } from './GlobeMap';
import { Localized, useI18n } from '@/lib/i18n/i18n-provider';
import { BrandPanel } from '@/components/shared/brand-ui';

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
  const { t } = useI18n();
  const userH3 = location.h3Indices[h3Res];

  const matchedRow = useMemo(() => {
    if (!userH3 || layerData.length === 0) return null;
    return (
      layerData.find((row) => {
        const rowH3 = (section.getHexagon ?? h3ToHex)(row);
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
    <Localized>
      <div
        className="pointer-events-none absolute top-0 left-0 z-30"
        style={{
          transform: `translate(${pinScreen.x}px, ${pinScreen.y}px) translate(-50%, -100%)`,
          willChange: 'transform',
        }}
      >
        {/* Card body */}
        <BrandPanel
          tone="amber"
          className="pointer-events-auto relative mb-3 w-72 rounded-2xl px-5 py-4 sm:w-80"
        >
          {/* Header */}
          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="bg-solid-foreground absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-solid-foreground relative inline-flex h-3 w-3 rounded-full" />
            </span>
            <span className="text-sm font-bold">Your Location</span>
          </div>

          {/* City / coords */}
          <p className="mb-1 text-base font-bold">{locationLabel}</p>

          {/* Section title */}
          <p className="mb-3 text-xs font-bold tracking-wide uppercase">
            {t(section.title)}
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
                    <span className="text-xs">{t(label)}</span>
                    <span className="text-sm font-bold tabular-nums">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs italic">
              {layerData.length === 0
                ? 'Loading data...'
                : 'No data at this resolution for your area'}
            </p>
          )}

          {/* H3 cell ref */}
          <div className="border-solid-foreground/20 mt-3 border-t pt-2">
            <p className="text-2xs truncate font-mono">
              {t('H3 res')} {h3Res} &middot; {userH3 ?? '—'}
            </p>
          </div>
        </BrandPanel>

        {/* Connector line from card to pin top */}
        <div className="bg-secondary mx-auto h-5 w-0.5" />
      </div>
    </Localized>
  );
});

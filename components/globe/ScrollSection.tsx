'use client';

import { memo, useRef, useCallback, useState } from 'react';
import Image from 'next/image';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import type { GlobeSection } from './data/sections';

interface ScrollSectionProps {
  section: GlobeSection;
  sectionIndex: number;
  totalSections: number;
  onSwipe?: (direction: -1 | 1) => void;
  /** SQL query panel content passed from parent */
  queryPanel?: React.ReactNode;
}

/* ── Shared content (used in both drawer and desktop card) ────────── */

function SectionContent({
  section,
  sectionIndex,
  totalSections,
  onSwipe,
  queryPanel,
}: ScrollSectionProps) {
  return (
    <>
      {/* Section indicator */}
      <div
        className="mb-4 flex items-center gap-2"
        role="progressbar"
        aria-valuenow={sectionIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalSections}
      >
        {Array.from({ length: totalSections }).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === sectionIndex
                ? 'w-6 bg-emerald-500 dark:bg-emerald-400'
                : i < sectionIndex
                  ? 'w-2 bg-black/20 dark:bg-white/30'
                  : 'w-2 bg-black/10 dark:bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Subtitle */}
      {section.subtitle && (
        <p className="mb-1 font-mono text-xs tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
          {section.subtitle}
        </p>
      )}

      {/* Title */}
      <h2 className="text-foreground mb-3 text-xl leading-tight font-semibold sm:text-2xl">
        {section.title}
      </h2>

      {/* Description */}
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        {section.description}
      </p>

      {/* Stat */}
      {section.stat.value && (
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-foreground text-2xl font-bold">
            {section.stat.value}
          </span>
          <span className="text-muted-foreground text-xs">
            {section.stat.label}
          </span>
        </div>
      )}

      {/* Color legend */}
      {section.colorLegend.length > 0 && (
        <div>
          <div
            className="h-2 w-full rounded-full"
            role="img"
            aria-label={`Color scale from ${section.colorLegend[0].label} to ${section.colorLegend[section.colorLegend.length - 1].label}`}
            style={{
              background: `linear-gradient(to right, ${section.colorLegend.map((l) => l.color).join(', ')})`,
            }}
          />
          <div className="mt-1 flex justify-between">
            {section.colorLegend.map((l, i) => (
              <span key={i} className="text-muted-foreground/60 text-[10px]">
                {l.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex items-center gap-2">
        <a
          href={section.sourceCoopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-black/10 bg-black/5 px-3 py-1.5 text-xs transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <Image
            src="/source-coop-logo.png"
            alt="Source Cooperative"
            width={14}
            height={14}
            className="rounded-sm"
          />
          <span className="text-foreground/80">Data</span>
        </a>
        <a
          href={section.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-black/10 bg-black/5 px-3 py-1.5 text-xs transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <svg
            className="h-3 w-3 text-amber-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-foreground/80">Star</span>
        </a>
      </div>

      {/* SQL query panel (inside drawer on mobile, separate on desktop) */}
      {queryPanel && <div className="mt-4 sm:hidden">{queryPanel}</div>}

      {/* Navigation arrows */}
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          disabled={sectionIndex === 0}
          onClick={() => onSwipe?.(-1)}
          aria-label="Previous section"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-black/5 transition-colors hover:bg-black/10 disabled:opacity-30 disabled:hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:disabled:hover:bg-white/5"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="text-muted-foreground text-xs tabular-nums">
          {sectionIndex + 1} / {totalSections}
        </span>
        <button
          type="button"
          disabled={sectionIndex === totalSections - 1}
          onClick={() => onSwipe?.(1)}
          aria-label="Next section"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-black/5 transition-colors hover:bg-black/10 disabled:opacity-30 disabled:hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:disabled:hover:bg-white/5"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </>
  );
}

/* ── Mobile drawer ────────────────────────────────────────────────── */

function MobileDrawer(props: ScrollSectionProps) {
  const [open, setOpen] = useState(true);
  const { section, sectionIndex, totalSections } = props;

  return (
    <div className="sm:hidden">
      {/* Collapsed peek bar — always visible when drawer is closed */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-black/10 bg-white/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-black/90"
        >
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSections }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full ${
                  i === sectionIndex
                    ? 'w-4 bg-emerald-500'
                    : 'w-1.5 bg-black/15 dark:bg-white/20'
                }`}
              />
            ))}
          </div>
          <span className="text-foreground text-sm font-medium">
            {section.title}
          </span>
          <svg
            className="text-muted-foreground ml-auto h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}

      <Drawer
        open={open}
        onOpenChange={setOpen}
        shouldScaleBackground={false}
        modal={false}
      >
        <DrawerContent className="max-h-[85vh] bg-white/95 backdrop-blur dark:bg-black/90">
          <DrawerTitle className="sr-only">{section.title}</DrawerTitle>
          <div className="overflow-y-auto px-4 pt-2 pb-6">
            <SectionContent {...props} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

/* ── Desktop card ─────────────────────────────────────────────────── */

function DesktopCard(props: ScrollSectionProps) {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-10 hidden h-full items-center sm:flex"
      role="region"
      aria-label={`Section ${props.sectionIndex + 1} of ${props.totalSections}: ${props.section.title}`}
    >
      <div className="pointer-events-auto ml-8 max-w-sm">
        <div className="rounded-2xl border border-black/5 bg-white/90 p-6 shadow-2xl dark:border-white/10 dark:bg-black/70">
          <SectionContent {...props} />
        </div>
      </div>
    </div>
  );
}

/* ── Export ────────────────────────────────────────────────────────── */

export const ScrollSection = memo(function ScrollSection(
  props: ScrollSectionProps
) {
  const { onSwipe } = props;
  const touchStartX = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(dx) > 60 && onSwipe) {
        onSwipe(dx < 0 ? 1 : -1);
      }
    },
    [onSwipe]
  );

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <MobileDrawer {...props} />
      <DesktopCard {...props} />
    </div>
  );
});

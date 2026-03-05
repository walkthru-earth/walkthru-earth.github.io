'use client';

import {
  memo,
  useRef,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import Image from 'next/image';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import type { GlobeSection } from './data/sections';

interface ScrollSectionProps {
  section: GlobeSection;
  sectionIndex: number;
  totalSections: number;
  onSwipe?: (direction: -1 | 1) => void;
  queryPanel?: React.ReactNode;
  timeControls?: React.ReactNode;
  isLoading?: boolean;
  rowCount?: number;
}

/* ── Shared small components ─────────────────────────────────────── */

function SectionDots({
  current,
  total,
  size = 'md',
}: {
  current: number;
  total: number;
  size?: 'sm' | 'md';
}) {
  const active =
    size === 'sm'
      ? 'w-3 bg-emerald-500'
      : 'w-7 bg-emerald-500 dark:bg-emerald-400';
  const past =
    size === 'sm'
      ? 'w-1 bg-black/15 dark:bg-white/20'
      : 'w-2.5 bg-black/25 dark:bg-white/35';
  const future =
    size === 'sm'
      ? 'w-1 bg-black/15 dark:bg-white/20'
      : 'w-2.5 bg-black/10 dark:bg-white/10';
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`${size === 'sm' ? 'h-1' : 'h-1.5'} rounded-full transition-all duration-500 ${
            i === current ? active : i < current ? past : future
          }`}
        />
      ))}
    </div>
  );
}

function NavArrow({
  direction,
  disabled,
  onClick,
  size = 'md',
}: {
  direction: -1 | 1;
  disabled: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
}) {
  const d = direction === -1 ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7';
  const sz = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9 sm:h-10 sm:w-10';
  const ico = size === 'sm' ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={direction === -1 ? 'Previous section' : 'Next section'}
      className={`flex ${sz} items-center justify-center rounded-full border border-black/15 bg-black/10 text-gray-800 shadow-sm transition-all hover:bg-black/20 active:scale-95 disabled:opacity-20 dark:border-white/15 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20`}
    >
      <svg
        className={ico}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
    </button>
  );
}

/* ── Shared content ───────────────────────────────────────────────── */

function SectionContent({
  section,
  sectionIndex,
  totalSections,
  onSwipe,
  queryPanel,
}: ScrollSectionProps) {
  return (
    <>
      <div
        className="mb-3"
        role="progressbar"
        aria-valuenow={sectionIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalSections}
      >
        <SectionDots current={sectionIndex} total={totalSections} />
      </div>

      {section.subtitle && (
        <p className="mb-1 font-mono text-xs font-medium tracking-wider text-emerald-600 uppercase sm:text-sm dark:text-emerald-400">
          {section.subtitle}
        </p>
      )}

      <h2 className="mb-2 text-xl leading-tight font-bold text-gray-900 sm:mb-3 sm:text-3xl dark:text-white">
        {section.title}
      </h2>

      <p className="mb-3 text-sm leading-relaxed text-gray-700 sm:mb-4 sm:text-base dark:text-white/70">
        {section.description}
      </p>

      {section.stat.value && (
        <div className="mb-3 flex items-baseline gap-2 sm:mb-4">
          <span className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">
            {section.stat.value}
          </span>
          <span className="text-xs font-medium text-gray-600 sm:text-sm dark:text-white/60">
            {section.stat.label}
          </span>
        </div>
      )}

      {section.colorLegend.length > 0 && (
        <div>
          <div
            className="h-1.5 w-full rounded-full sm:h-2"
            role="img"
            aria-label={`Color scale from ${section.colorLegend[0].label} to ${section.colorLegend[section.colorLegend.length - 1].label}`}
            style={{
              background: `linear-gradient(to right, ${section.colorLegend.map((l) => l.color).join(', ')})`,
            }}
          />
          <div className="mt-1 flex justify-between">
            {section.colorLegend.map((l, i) => (
              <span
                key={i}
                className="text-xs font-medium text-gray-500 dark:text-white/50"
              >
                {l.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 sm:mt-4">
        <a
          href={section.sourceCoopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-black/10 bg-black/5 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/10 sm:px-3.5 sm:py-2 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <Image
            src="/source-coop-logo.png"
            alt="Source Cooperative"
            width={12}
            height={12}
            className="rounded-sm sm:h-3.5 sm:w-3.5"
          />
          <span className="text-gray-800 dark:text-white/80">Data</span>
        </a>
        <a
          href={section.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-black/10 bg-black/5 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/10 sm:px-3.5 sm:py-2 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <svg
            className="h-3.5 w-3.5 text-gray-800 sm:h-4 sm:w-4 dark:text-white/80"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <svg
            className="h-3 w-3 text-amber-500 sm:h-3.5 sm:w-3.5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-gray-800 dark:text-white/80">Star</span>
        </a>
      </div>

      {queryPanel && <div className="mt-3 sm:hidden">{queryPanel}</div>}

      <div className="mt-3 flex items-center justify-between sm:mt-4">
        <NavArrow
          direction={-1}
          disabled={sectionIndex === 0}
          onClick={() => onSwipe?.(-1)}
        />
        <span className="text-sm font-semibold text-gray-600 tabular-nums sm:text-base dark:text-white/60">
          {sectionIndex + 1} / {totalSections}
        </span>
        <NavArrow
          direction={1}
          disabled={sectionIndex === totalSections - 1}
          onClick={() => onSwipe?.(1)}
        />
      </div>
    </>
  );
}

/* ── Mobile drawer ────────────────────────────────────────────────── */

const MQ = '(max-width: 639px)';
function subscribeMobile(cb: () => void) {
  const mql = window.matchMedia(MQ);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}
function getSnapshotMobile() {
  return window.matchMedia(MQ).matches;
}
function getServerSnapshotMobile() {
  return false;
}
function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    getSnapshotMobile,
    getServerSnapshotMobile
  );
}

function MobileDrawer(props: ScrollSectionProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(true);
  const { section, sectionIndex, totalSections, isLoading, rowCount, onSwipe } =
    props;

  // Close drawer when globe is tapped (custom event from GlobeExplorer)
  useEffect(() => {
    const handler = () => setOpen(false);
    window.addEventListener('globe:tap', handler);
    return () => window.removeEventListener('globe:tap', handler);
  }, []);
  const swipeRef = useRef<{ x: number; y: number; swiped: boolean }>({
    x: 0,
    y: 0,
    swiped: false,
  });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    swipeRef.current = { x: e.clientX, y: e.clientY, swiped: false };
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const s = swipeRef.current;
      if (s.swiped) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      // Only trigger if horizontal movement dominates and exceeds threshold
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        s.swiped = true;
        onSwipe?.(dx < 0 ? 1 : -1);
      }
    },
    [onSwipe]
  );

  if (!isMobile) return null;

  return (
    <div>
      {/* Floating bottom bar — always visible when drawer is closed */}
      {!open && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 flex flex-col border-t border-black/10 bg-white/90 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-black/80"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          {props.timeControls && (
            <div className="flex justify-center border-b border-black/5 px-3 py-1.5 dark:border-white/5">
              {props.timeControls}
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-2">
            <NavArrow
              direction={-1}
              disabled={sectionIndex === 0}
              onClick={() => onSwipe?.(-1)}
              size="sm"
            />

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2"
            >
              {isLoading && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              )}
              <SectionDots
                current={sectionIndex}
                total={totalSections}
                size="sm"
              />
              <span className="text-xs font-medium text-gray-900 dark:text-white/90">
                {section.title}
              </span>
              {isLoading && rowCount !== undefined && rowCount > 0 && (
                <span className="animate-pulse text-[10px] text-amber-600 dark:text-amber-400">
                  {rowCount.toLocaleString()}
                </span>
              )}
              <svg
                className="h-3 w-3 text-gray-400 dark:text-white/50"
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

            <NavArrow
              direction={1}
              disabled={sectionIndex === totalSections - 1}
              onClick={() => onSwipe?.(1)}
              size="sm"
            />
          </div>
        </div>
      )}

      <Drawer
        open={open}
        onOpenChange={setOpen}
        shouldScaleBackground={false}
        modal={false}
      >
        <DrawerContent className="max-h-[70vh] border-black/10 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-black/80">
          <DrawerTitle className="sr-only">{section.title}</DrawerTitle>
          <div
            className="touch-pan-y overflow-y-auto px-4 pt-1 pb-6"
            style={{
              paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
          >
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
        <div className="rounded-2xl border border-black/5 bg-white/95 p-6 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-black/85">
          <SectionContent {...props} />
        </div>
      </div>
    </div>
  );
}

/* ── Loading overlay ──────────────────────────────────────────────── */

function LoadingOverlay({
  isLoading,
  rowCount,
}: {
  isLoading: boolean;
  rowCount: number;
}) {
  if (!isLoading) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
      {/* Pulsing ring */}
      <div className="relative">
        <div className="h-24 w-24 animate-ping rounded-full border-2 border-emerald-500/30 sm:h-32 sm:w-32" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1 rounded-full bg-black/40 px-4 py-2 backdrop-blur-sm">
            <span className="text-[10px] font-medium text-white/90">
              Loading
            </span>
            {rowCount > 0 && (
              <span className="text-[10px] text-emerald-400 tabular-nums">
                {rowCount.toLocaleString()} rows
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Export ────────────────────────────────────────────────────────── */

export const ScrollSection = memo(function ScrollSection(
  props: ScrollSectionProps
) {
  return (
    <>
      <LoadingOverlay
        isLoading={props.isLoading ?? false}
        rowCount={props.rowCount ?? 0}
      />
      <MobileDrawer {...props} />
      <DesktopCard {...props} />
    </>
  );
});

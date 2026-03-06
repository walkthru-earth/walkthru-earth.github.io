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
  /** Data-driven description (resolved from describeData or static fallback). */
  resolvedDescription?: string;
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
  const active = size === 'sm' ? 'w-3 bg-primary' : 'w-7 bg-primary';
  const past =
    size === 'sm' ? 'w-1 bg-foreground/15' : 'w-2.5 bg-foreground/25';
  const future =
    size === 'sm' ? 'w-1 bg-foreground/10' : 'w-2.5 bg-foreground/10';
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
      className={`flex ${sz} border-border/50 bg-muted text-foreground hover:bg-accent items-center justify-center rounded-full border shadow-sm transition-all active:scale-95 disabled:opacity-20`}
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
  resolvedDescription,
  sectionIndex,
  totalSections,
  onSwipe,
  queryPanel,
}: ScrollSectionProps) {
  const description = resolvedDescription ?? section.description;
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
        <p className="text-success mb-1 font-mono text-sm font-medium tracking-wider uppercase sm:text-base">
          {section.subtitle}
        </p>
      )}

      <h2 className="text-foreground mb-2 text-xl leading-tight font-bold sm:mb-3 sm:text-3xl">
        {section.title}
      </h2>

      <p className="text-muted-foreground mb-3 text-base leading-relaxed sm:mb-4 sm:text-lg">
        {description}
      </p>

      {section.stat.value && (
        <div className="mb-3 flex items-baseline gap-2 sm:mb-4">
          <span className="text-foreground text-2xl font-extrabold sm:text-3xl">
            {section.stat.value}
          </span>
          <span className="text-muted-foreground text-sm font-medium sm:text-base">
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
                className="text-muted-foreground text-sm font-medium"
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
          className="border-border/50 bg-muted hover:bg-accent flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors sm:px-3.5 sm:py-2 sm:text-base"
        >
          <Image
            src="/source-coop-logo.png"
            alt="Source Cooperative"
            width={12}
            height={12}
            className="rounded-sm sm:h-3.5 sm:w-3.5"
          />
          <span className="text-foreground">Data</span>
        </a>
        <a
          href={section.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border/50 bg-muted hover:bg-accent flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors sm:px-3.5 sm:py-2 sm:text-base"
        >
          <svg
            className="text-foreground h-3.5 w-3.5 sm:h-4 sm:w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <svg
            className="text-warning h-3 w-3 sm:h-3.5 sm:w-3.5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-foreground">Star</span>
        </a>
      </div>

      {queryPanel && <div className="mt-3 sm:hidden">{queryPanel}</div>}

      <div className="mt-3 flex items-center justify-between sm:mt-4">
        <NavArrow
          direction={-1}
          disabled={sectionIndex === 0}
          onClick={() => onSwipe?.(-1)}
        />
        <span className="text-muted-foreground text-sm font-semibold tabular-nums sm:text-base">
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

/**
 * Attaches gesture detection to a scrollable drawer element:
 * - Horizontal swipe → navigate sections
 * - Vertical swipe down (when scrolled to top) → close drawer
 * - Vertical scroll when content overflows → native scroll (no interference)
 * Uses a callback ref so it works inside portals.
 */
function useDrawerGestures(
  onSwipe?: (direction: -1 | 1) => void,
  onClose?: () => void
) {
  const onSwipeRef = useRef(onSwipe);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onSwipeRef.current = onSwipe;
    onCloseRef.current = onClose;
  }, [onSwipe, onClose]);

  const cleanupRef = useRef<(() => void) | null>(null);

  const attachGestures = useCallback((el: HTMLElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let locked: 'h' | 'v' | null = null;
    let fired = false;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      locked = null;
      fired = false;
    };

    const onMove = (e: TouchEvent) => {
      if (fired) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (!locked && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        locked = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      }

      if (locked === 'h') {
        e.preventDefault();
        if (Math.abs(dx) > 60) {
          fired = true;
          onSwipeRef.current?.(dx < 0 ? 1 : -1);
        }
      }

      if (locked === 'v' && dy > 0) {
        // Swiping down — block pull-to-refresh when at top
        const atTop = el.scrollTop <= 0;
        if (atTop) {
          e.preventDefault();
          if (dy > 80) {
            fired = true;
            onCloseRef.current?.();
          }
        }
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });

    cleanupRef.current = () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
    };
  }, []);

  useEffect(() => () => cleanupRef.current?.(), []);

  return attachGestures;
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

  // Gestures: horizontal swipe → navigate, swipe down → close drawer
  const closeDrawer = useCallback(() => setOpen(false), []);
  const attachDrawerGestures = useDrawerGestures(onSwipe, closeDrawer);
  const attachBarGestures = useDrawerGestures(onSwipe);

  if (!isMobile) return null;

  return (
    <div>
      {/* Floating bottom bar — always visible when drawer is closed */}
      {!open && (
        <div
          ref={attachBarGestures}
          className="border-border/50 bg-background/90 fixed inset-x-0 bottom-0 z-30 flex flex-col border-t shadow-lg backdrop-blur-xl"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          {props.timeControls && (
            <div className="border-border/30 flex justify-center border-b px-3 py-1.5">
              {props.timeControls}
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-2.5">
            <NavArrow
              direction={-1}
              disabled={sectionIndex === 0}
              onClick={() => onSwipe?.(-1)}
            />

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 px-3"
            >
              <SectionDots
                current={sectionIndex}
                total={totalSections}
                size="sm"
              />
              <div className="flex items-center gap-1.5">
                {isLoading && (
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                    <span className="bg-success relative inline-flex h-2 w-2 rounded-full" />
                  </span>
                )}
                <span className="text-foreground truncate text-sm font-medium">
                  {section.title}
                </span>
                {isLoading && rowCount !== undefined && rowCount > 0 && (
                  <span className="text-warning flex-shrink-0 animate-pulse text-sm">
                    {rowCount.toLocaleString()}
                  </span>
                )}
                <svg
                  className="text-muted-foreground h-3 w-3 flex-shrink-0"
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
              </div>
            </button>

            <NavArrow
              direction={1}
              disabled={sectionIndex === totalSections - 1}
              onClick={() => onSwipe?.(1)}
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
        <DrawerContent className="border-border/50 bg-background/90 max-h-[70vh] backdrop-blur-xl">
          <DrawerTitle className="sr-only">{section.title}</DrawerTitle>
          <div
            ref={attachDrawerGestures}
            className="overflow-y-auto px-4 pt-1 pb-6"
            style={{
              paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
            }}
          >
            <SectionContent {...props} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

/* ── Desktop card (draggable) ─────────────────────────────────────── */

function DesktopCard(props: ScrollSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [pos, setPos] = useState({ x: 32, y: 0 });
  const [centered, setCentered] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Center vertically once on mount
  useEffect(() => {
    if (centered || !cardRef.current) return;
    const h = cardRef.current.offsetHeight;
    const wh = window.innerHeight;
    setPos((p) => ({ ...p, y: Math.max(16, (wh - h) / 2) }));
    setCentered(true);
  }, [centered]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only drag from the card header area (not buttons/links/inputs)
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (
        tag === 'button' ||
        tag === 'a' ||
        tag === 'input' ||
        tag === 'svg' ||
        tag === 'path'
      )
        return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: pos.x,
        origY: pos.y,
      };
      setDragging(true);
    },
    [pos]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPos({
      x: dragState.current.origX + dx,
      y: dragState.current.origY + dy,
    });
  }, []);

  const onPointerUp = useCallback(() => {
    dragState.current = null;
    setDragging(false);
  }, []);

  return (
    <div
      ref={cardRef}
      className="pointer-events-auto absolute z-10 hidden max-w-sm sm:block"
      style={{
        left: pos.x,
        top: pos.y,
        cursor: dragging ? 'grabbing' : 'grab',
      }}
      role="region"
      aria-label={`Section ${props.sectionIndex + 1} of ${props.totalSections}: ${props.section.title}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div
        className={`border-border/50 bg-background/95 relative rounded-2xl border p-6 shadow-2xl backdrop-blur-md select-none ${dragging ? 'opacity-90' : ''}`}
      >
        {/* Drag handle icon */}
        <svg
          className="text-muted-foreground/40 absolute top-2.5 right-2.5 h-4 w-4"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
        <SectionContent {...props} />
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
        <div className="border-success/30 h-24 w-24 animate-ping rounded-full border-2 sm:h-32 sm:w-32" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/70 flex flex-col items-center gap-1 rounded-full px-4 py-2 backdrop-blur-sm">
            <span className="text-foreground text-sm font-medium">Loading</span>
            {rowCount > 0 && (
              <span className="text-success text-sm tabular-nums">
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

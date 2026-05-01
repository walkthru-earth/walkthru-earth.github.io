'use client';

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useMemo, useRef } from 'react';
import type { HNCRow, HNCHeavy } from './types';
import { regionInfo } from './regions';
import { aoiSigma, type RegionBaseline } from './baselines';
import { signTone } from './colormap';
import type { ScoreScale } from './config';

interface Props {
  row: HNCRow | null;
  heavy: HNCHeavy | undefined;
  index: number;
  total: number;
  isPlaying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
}

interface FrameImageProps {
  row: HNCRow | null;
  heavy: HNCHeavy | undefined;
  index: number;
  total: number;
  /** When true, fill the parent height instead of locking to a 4:3 ratio. */
  fill?: boolean;
}

interface FrameMetaProps {
  row: HNCRow | null;
}

interface RegionsProps {
  row: HNCRow | null;
  selectedAlias?: string | null;
  onSelectAlias?: (alias: string | null) => void;
  atlasAvailable?: boolean;
  /** When provided, magnitudes show AOI-relative σ instead of raw z. */
  baselines?: Record<string, RegionBaseline> | null;
  /** Render mode toggle. Defaults to 'aoi' when baselines present. */
  scale?: ScoreScale;
  onScaleChange?: (scale: ScoreScale) => void;
  /** Drops the explanatory paragraph for tight layouts. */
  compact?: boolean;
}

interface WalkerProps {
  isPlaying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
}

interface ScrubProps {
  index: number;
  total: number;
  onSeek: (i: number) => void;
}

function formatTimestamp(ts: HNCRow['captured_at']): string {
  if (ts == null) return '—';
  const ms = ts instanceof Date ? ts.getTime() : Number(ts);
  if (!Number.isFinite(ms) || ms === 0) return String(ts);
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toISOString().replace('T', ' ').slice(0, 16);
}

export function FrameMeta({ row }: FrameMetaProps) {
  const meta = useMemo(() => {
    if (!row) return 'Pick an image';
    const heading =
      row.compass_angle != null
        ? `${Math.round(row.compass_angle)}°`
        : 'no heading';
    return `${formatTimestamp(row.captured_at)} · ${row.camera_type ?? 'unknown'} · ${heading}`;
  }, [row]);
  return (
    <div>
      <h3 className="text-foreground text-sm font-semibold tracking-tight sm:text-base">
        Frame
      </h3>
      <p className="text-muted-foreground font-mono text-[11px] sm:text-xs">
        {meta}
      </p>
    </div>
  );
}

export function FrameImage({
  row,
  heavy,
  index,
  total,
  fill,
}: FrameImageProps) {
  const sizing = fill ? 'h-full w-full flex-1' : 'aspect-[4/3] w-full';
  return (
    <div
      className={`bg-muted/40 border-border relative overflow-hidden rounded-lg border ${sizing}`}
    >
      {heavy?.blobUrl ? (
        // Plain <img> — blob URLs are not Next-Image friendly.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heavy.blobUrl}
          alt={row ? `Mapillary frame ${row.image_id}` : 'Selected frame'}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="text-muted-foreground absolute inset-0 flex items-center justify-center font-mono text-xs">
          {row ? 'Decoding…' : 'No image selected'}
        </div>
      )}
      {total > 0 && (
        <div className="bg-background/70 text-foreground absolute right-2 bottom-2 rounded-full px-2 py-0.5 font-mono text-[10px] backdrop-blur-sm">
          {index + 1} / {total}
        </div>
      )}
    </div>
  );
}

export function FrameWalker({
  isPlaying,
  onPrev,
  onNext,
  onTogglePlay,
}: WalkerProps) {
  return (
    <div
      className="bg-card/70 border-border supports-[backdrop-filter]:bg-card/50 inline-flex items-center gap-2 rounded-full border p-1.5 shadow-sm backdrop-blur-md"
      role="group"
      aria-label="Frame walker"
    >
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous frame"
        className="hover:border-primary hover:text-primary focus-visible:ring-ring border-border text-foreground inline-flex h-9 w-9 items-center justify-center rounded-full border bg-transparent transition focus-visible:ring-2 focus-visible:outline-none active:scale-95"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pause auto-walk' : 'Auto-walk frames'}
        aria-pressed={isPlaying}
        className="from-primary to-secondary text-primary-foreground inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br shadow-md transition hover:scale-105 active:scale-95"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="ml-0.5 h-4 w-4" />
        )}
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next frame"
        className="hover:border-primary hover:text-primary focus-visible:ring-ring border-border text-foreground inline-flex h-9 w-9 items-center justify-center rounded-full border bg-transparent transition focus-visible:ring-2 focus-visible:outline-none active:scale-95"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Frame scrub-track. Reads as a single continuous timeline of frames with a
 * draggable thumb, modeled on TRIBE v2's video scrubber. Dense tick density
 * is capped so it stays readable when there are many frames.
 */
export function FrameScrub({ index, total, onSeek }: ScrubProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const tickCount = Math.min(total, 64);
  const ticks = useMemo(() => {
    if (total <= 1) return [] as number[];
    return Array.from({ length: tickCount }, (_, i) =>
      Math.round((i / (tickCount - 1)) * (total - 1))
    );
  }, [total, tickCount]);

  const pct = total > 1 ? (index / (total - 1)) * 100 : 0;

  const seekFromEvent = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || total <= 1) return;
      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const ratio = rect.width > 0 ? x / rect.width : 0;
      onSeek(Math.round(ratio * (total - 1)));
    },
    [onSeek, total]
  );

  return (
    <div className="flex items-center gap-3 font-mono text-[10px] tabular-nums">
      <span className="text-muted-foreground w-10 text-right">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div
        ref={trackRef}
        className="hnc-scrub flex-1"
        role="slider"
        aria-label="Frame scrubber"
        aria-valuemin={1}
        aria-valuemax={Math.max(1, total)}
        aria-valuenow={index + 1}
        tabIndex={0}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          seekFromEvent(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) seekFromEvent(e.clientX);
        }}
        onKeyDown={(e) => {
          if (total <= 1) return;
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onSeek(Math.max(0, index - 1));
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            onSeek(Math.min(total - 1, index + 1));
          }
        }}
      >
        <span className="hnc-scrub-rail" aria-hidden="true" />
        <span
          className="hnc-scrub-fill"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
        {ticks.map((t, i) => (
          <span
            key={i}
            className="hnc-scrub-tick"
            style={{ left: `${(t / Math.max(1, total - 1)) * 100}%` }}
            aria-hidden="true"
          />
        ))}
        <span
          className="hnc-scrub-thumb"
          style={{ left: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
      <span className="text-muted-foreground w-10">
        {String(total).padStart(2, '0')}
      </span>
    </div>
  );
}

/**
 * "What this image is doing in the visual cortex."
 *
 * Bars are diverging from a central baseline. Right of center = predicted
 * activity above the model's per-region baseline, left of center = below.
 * Magnitudes are *relative* (z-scored arbitrary units, see roi_summary.py),
 * so we deliberately do not show absolute numbers in the primary view —
 * we surface them on hover for transparency.
 */
export function CorticalRegions({
  row,
  selectedAlias,
  onSelectAlias,
  atlasAvailable,
  baselines,
  scale,
  onScaleChange,
  compact = false,
}: RegionsProps) {
  const regions = row?.top_regions ?? [];

  // Effective scale. AOI is only meaningful with baselines loaded.
  const effectiveScale: ScoreScale =
    baselines && (scale ?? 'aoi') === 'aoi' ? 'aoi' : 'raw';

  // Compute the value used for sorting + bar magnitude in one place so the
  // bar chart, the radar (separate component) and the bar tooltip cannot
  // disagree about what "this region scored" means.
  const ranked = useMemo(() => {
    const scored = regions.map((r) => {
      const raw = Number(r.score);
      const value =
        effectiveScale === 'aoi' ? aoiSigma(raw, baselines?.[r.name]) : raw;
      return { name: r.name, raw, value };
    });
    scored.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    return scored;
  }, [regions, effectiveScale, baselines]);

  const max = useMemo(
    () => ranked.reduce((m, r) => Math.max(m, Math.abs(r.value)), 0),
    [ranked]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col py-3 sm:py-4">
      <div className="mb-2 flex items-start justify-between gap-3 sm:mb-3">
        <div className="min-w-0">
          <p className="hnc-eyebrow">What this image triggers</p>
          {!compact && (
            <p className="text-muted-foreground mt-1 max-w-prose text-[11px] leading-relaxed sm:text-xs">
              {effectiveScale === 'aoi'
                ? 'σ units relative to this AOI’s baseline. +2σ = unusually high for that region.'
                : 'Raw model output. Switch to AOI σ for frame-relative readings.'}
            </p>
          )}
        </div>
        {baselines && onScaleChange && (
          <div
            className="hnc-seg shrink-0"
            role="group"
            aria-label="Score scale"
          >
            <button
              type="button"
              className="hnc-seg-opt"
              data-active={effectiveScale === 'aoi'}
              onClick={() => onScaleChange('aoi')}
            >
              AOI σ
            </button>
            <button
              type="button"
              className="hnc-seg-opt"
              data-active={effectiveScale === 'raw'}
              onClick={() => onScaleChange('raw')}
            >
              Raw z
            </button>
          </div>
        )}
      </div>

      {/* Diverging bar chart, centred on a 0-baseline axis */}
      <ol
        className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1"
        data-lenis-prevent
      >
        {ranked.length === 0 && (
          <li className="text-muted-foreground font-mono text-xs italic">
            No regional summary
          </li>
        )}
        {ranked.map((region, i) => {
          const pct = max > 0 ? (Math.abs(region.value) / max) * 50 : 0;
          const negative = region.value < 0;
          const info = regionInfo(region.name);
          const selected = selectedAlias === region.name;
          const clickable = !!onSelectAlias;
          const unit = effectiveScale === 'aoi' ? 'σ' : 'z';
          const display = `${region.value >= 0 ? '+' : ''}${region.value.toFixed(2)}${unit}`;
          return (
            <li key={`${region.name}-${i}`}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onSelectAlias?.(selected ? null : region.name)}
                className={`grid w-full grid-cols-[minmax(7rem,9rem)_1fr_auto] items-center gap-3 rounded-md px-2 py-1 text-left transition sm:grid-cols-[minmax(8rem,11rem)_1fr_auto] sm:gap-4 ${
                  selected ? 'bg-foreground/5 ring-foreground/15 ring-1' : ''
                } ${
                  clickable
                    ? 'hover:bg-foreground/5 cursor-pointer'
                    : 'cursor-default'
                }`}
                aria-pressed={selected}
                title={`${info.full} · ${info.blurb}${atlasAvailable === false ? '' : ' · click to spotlight on the cortex'} · raw z = ${region.raw >= 0 ? '+' : ''}${region.raw.toFixed(3)}${effectiveScale === 'aoi' ? ` · AOI σ = ${display}` : ''}`}
              >
                <div className="min-w-0">
                  <p className="text-foreground truncate text-[12px] font-semibold sm:text-sm">
                    {info.feeling}
                  </p>
                  <p className="text-muted-foreground truncate font-mono text-[10px] sm:text-[11px]">
                    {info.tech}
                  </p>
                </div>
                <div
                  className="relative h-2 w-full overflow-hidden rounded-full"
                  aria-label={`${info.feeling} ${negative ? 'below' : 'above'} baseline`}
                >
                  <span
                    className="bg-muted/40 absolute inset-0"
                    aria-hidden="true"
                  />
                  <span
                    className="bg-foreground/20 absolute inset-y-0 left-1/2 w-px"
                    aria-hidden="true"
                  />
                  <span
                    className={`absolute inset-y-0 ${negative ? 'right-1/2 rounded-l-full' : 'left-1/2 rounded-r-full'} ${signTone(region.value).barFill}`}
                    style={{ width: `${pct.toFixed(1)}%` }}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-muted-foreground font-mono text-[10px] tabular-nums sm:text-[11px]">
                  {display}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {ranked.length > 0 && (
        <div className="text-muted-foreground mt-3 flex items-center justify-between font-mono text-[10px] tracking-wide uppercase sm:text-[11px]">
          <span>Below baseline</span>
          <span aria-hidden="true">|</span>
          <span>Above baseline</span>
        </div>
      )}

      {atlasAvailable === false && ranked.length > 0 && (
        <p className="text-muted-foreground/80 mt-3 text-[10px] leading-snug sm:text-[11px]">
          Region highlighting on the 3D cortex needs the HCP MMP1 parcel atlas
          (see{' '}
          <code className="font-mono">hnc/scripts/gen_parcel_aliases.py</code>).
          Without it, this list is read-only.
        </p>
      )}
    </div>
  );
}

/**
 * Legacy single-panel layout, kept so consumers that want the old all-in-one
 * detail card still work. The current explorer composes the pieces directly.
 */
export function HNCFramePanel({
  row,
  heavy,
  index,
  total,
  isPlaying,
  onPrev,
  onNext,
  onTogglePlay,
}: Props) {
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <FrameMeta row={row} />
      <FrameImage row={row} heavy={heavy} index={index} total={total} />
      <div className="flex items-center justify-center">
        <FrameWalker
          isPlaying={isPlaying}
          onPrev={onPrev}
          onNext={onNext}
          onTogglePlay={onTogglePlay}
        />
      </div>
      <CorticalRegions row={row} />
    </div>
  );
}

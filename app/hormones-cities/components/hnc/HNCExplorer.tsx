'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import type { AsyncBuffer } from 'hyparquet';
import { HNCMapPanel } from './HNCMapPanel';
import { HNCBrainPanel } from './HNCBrainPanel';
import {
  CorticalRegions,
  FrameImage,
  FrameMeta,
  FrameScrub,
  FrameWalker,
} from './HNCFramePanel';
import { HNC_LEGEND_GRADIENT } from './colormap';
import {
  HNC_WALK_INTERVAL_MS,
  type ScoreScale,
  type SurfaceMode,
  type ThemeMode,
} from './config';
import { loadParquetHeavy, loadParquetLight } from './parquet';
import { loadRegionBaselines, type RegionBaseline } from './baselines';
import { RegionRadar } from './RegionRadar';
import { regionInfo } from './regions';
import type { HNCHeavy, HNCRow } from './types';
import './hnc.css';

interface SegOption<T extends string> {
  label: string;
  value: T;
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="hnc-seg" role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="hnc-seg-opt"
          data-active={opt.value === value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 text-left">
      <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </span>
      <span
        className="text-foreground font-mono text-xs leading-snug break-words sm:text-sm"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

export function HNCExplorer() {
  const { resolvedTheme } = useTheme();
  const themeMode: ThemeMode = resolvedTheme === 'dark' ? 'dark' : 'light';

  const [rows, setRows] = useState<HNCRow[]>([]);
  const [parquetFile, setParquetFile] = useState<AsyncBuffer | null>(null);
  const [heavyCache, setHeavyCache] = useState<Map<string, HNCHeavy>>(
    new Map()
  );
  const [heavyLoading, setHeavyLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAlias, setSelectedAlias] = useState<string | null>(null);
  const [atlasAvailable, setAtlasAvailable] = useState<boolean | undefined>(
    undefined
  );
  const [baselines, setBaselines] = useState<Record<
    string,
    RegionBaseline
  > | null>(null);
  const [scoreScale, setScoreScale] = useState<ScoreScale>('aoi');
  const [surface, setSurface] = useState<SurfaceMode>('inflated');
  const [isPlaying, setIsPlaying] = useState(true);
  const [playSpeed, setPlaySpeed] = useState<number>(30);
  const [status, setStatus] = useState<{ msg: string; isError: boolean }>({
    msg: 'Fetching parquet…',
    isError: false,
  });

  const setStatusMsg = useCallback((msg: string, isError = false) => {
    setStatus((prev) =>
      prev.msg === msg && prev.isError === isError ? prev : { msg, isError }
    );
  }, []);

  // AOI baselines for σ-normalization. Loaded once, cached. Optional asset.
  useEffect(() => {
    let cancelled = false;
    loadRegionBaselines().then((b) => {
      if (cancelled) return;
      setBaselines(b);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadParquetLight()
      .then(({ rows, file }) => {
        if (cancelled) return;
        setRows(rows);
        setParquetFile(file);
        setStatusMsg(`Loaded ${rows.length} images`);
        if (rows[0]) setSelectedId(rows[0].image_id);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        console.error('[hnc] parquet load failed', err);
        setStatusMsg(`Parquet error: ${err.message}`, true);
      });
    return () => {
      cancelled = true;
    };
  }, [setStatusMsg]);

  useEffect(() => {
    if (!parquetFile) return;
    let cancelled = false;
    const decode = loadParquetHeavy(parquetFile);
    queueMicrotask(() => {
      if (cancelled) return;
      setHeavyLoading(true);
      setStatusMsg('Decoding image blobs and cortical maps…');
    });
    decode
      .then((cache) => {
        if (cancelled) return;
        setHeavyCache(cache);
        setStatusMsg(`Cache ready · ${cache.size} frames`);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        console.error('[hnc] heavy load failed', err);
        setStatusMsg(`Heavy decode error: ${err.message}`, true);
      })
      .finally(() => {
        if (!cancelled) setHeavyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [parquetFile, setStatusMsg]);

  // Revoke blob URLs of the *previous* cache when it's replaced or on unmount.
  // Capturing in the effect closure is critical, otherwise we'd revoke the
  // freshly-set cache and break the just-decoded images.
  useEffect(() => {
    const cache = heavyCache;
    return () => {
      for (const heavy of cache.values()) {
        if (heavy.blobUrl) URL.revokeObjectURL(heavy.blobUrl);
      }
    };
  }, [heavyCache]);

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r, i) => map.set(r.image_id, i));
    return map;
  }, [rows]);

  const selectedIndex = selectedId ? (indexById.get(selectedId) ?? -1) : -1;
  const selectedRow = selectedIndex >= 0 ? rows[selectedIndex] : null;
  const selectedHeavy = selectedId ? heavyCache.get(selectedId) : undefined;

  // Stable step function consumed by the auto-walk timer + keyboard handler.
  // Stored in a ref (rebound in an effect) so the interval doesn't need to
  // resubscribe on every render or row mutation.
  const stepRef = useRef<(delta: number) => void>(() => {});
  useEffect(() => {
    stepRef.current = (delta: number) => {
      if (rows.length <= 1) return;
      const cur = selectedIndex >= 0 ? selectedIndex : 0;
      const next = (cur + delta + rows.length) % rows.length;
      if (next === cur) return;
      setSelectedId(rows[next].image_id);
    };
  });

  const seekTo = useCallback(
    (i: number) => {
      if (!rows.length) return;
      const clamped = Math.max(0, Math.min(rows.length - 1, i));
      setSelectedId(rows[clamped].image_id);
    },
    [rows]
  );

  const [tabVisible, setTabVisible] = useState(
    typeof document === 'undefined' ? true : !document.hidden
  );
  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Auto-walk timer. playSpeed scales the cadence (2× = half-interval).
  // Pauses while the tab is hidden so 30× doesn't burn CPU/GPU in background.
  useEffect(() => {
    if (!isPlaying || !tabVisible || rows.length <= 1) return;
    const interval = Math.max(40, HNC_WALK_INTERVAL_MS / playSpeed);
    const id = window.setInterval(() => stepRef.current(1), interval);
    return () => window.clearInterval(id);
  }, [isPlaying, playSpeed, rows.length, tabVisible]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      )
        return;
      if (e.key === 'ArrowLeft') {
        setIsPlaying(false);
        stepRef.current(-1);
      } else if (e.key === 'ArrowRight') {
        setIsPlaying(false);
        stepRef.current(1);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'Escape') {
        setSelectedAlias(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const topRegion = selectedRow?.top_regions?.[0] ?? null;

  return (
    <div className="hnc-shell text-foreground relative flex w-full flex-col gap-3">
      <div className="hnc-panel flex flex-col gap-3 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
        <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:gap-5">
          <StatTile
            label="Frames"
            value={rows.length ? rows.length.toLocaleString() : '—'}
          />
          <StatTile
            label="Strongest signal"
            value={
              topRegion
                ? `${regionInfo(topRegion.name).feeling} · ${
                    Number(topRegion.score) >= 0 ? 'above' : 'below'
                  } baseline`
                : '—'
            }
          />
        </div>
        <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-4">
          <FrameWalker
            isPlaying={isPlaying}
            onPrev={() => {
              setIsPlaying(false);
              stepRef.current(-1);
            }}
            onNext={() => {
              setIsPlaying(false);
              stepRef.current(1);
            }}
            onTogglePlay={() => setIsPlaying((p) => !p)}
          />
          <Segmented<string>
            ariaLabel="Auto-walk speed"
            value={String(playSpeed)}
            onChange={(v) => setPlaySpeed(parseFloat(v))}
            options={[
              { label: '0.5×', value: '0.5' },
              { label: '1×', value: '1' },
              { label: '2×', value: '2' },
              { label: '4×', value: '4' },
              { label: '8×', value: '8' },
              { label: '30×', value: '30' },
            ]}
          />
          <Segmented
            ariaLabel="Surface mode"
            value={surface}
            onChange={setSurface}
            options={[
              { label: 'Inflated', value: 'inflated' },
              { label: 'Pial', value: 'pial' },
            ]}
          />
        </div>
      </div>

      <div className="relative grid w-full gap-3 md:gap-3 lg:h-[calc(100svh-9rem)] lg:min-h-[640px] lg:grid-cols-[minmax(260px,1fr)_minmax(440px,1.6fr)_minmax(300px,1.1fr)]">
        <section className="hnc-panel flex min-h-0 flex-col overflow-hidden">
          <header className="flex shrink-0 items-baseline justify-between gap-3 px-3 pt-2.5 pb-1.5 sm:px-4">
            <div className="min-w-0">
              <span className="hnc-eyebrow">Source · Mapillary</span>
              <FrameMeta row={selectedRow} />
            </div>
          </header>
          <div className="flex min-h-0 flex-[3] flex-col px-3 pb-2 sm:px-4">
            <FrameImage
              row={selectedRow}
              heavy={selectedHeavy}
              index={selectedIndex >= 0 ? selectedIndex : 0}
              total={rows.length}
              fill
            />
          </div>

          <div className="shrink-0 px-3 pb-2 sm:px-4">
            <FrameScrub
              index={selectedIndex >= 0 ? selectedIndex : 0}
              total={rows.length}
              onSeek={(i) => {
                setIsPlaying(false);
                seekTo(i);
              }}
            />
          </div>

          <div
            className="border-border/60 shrink-0 border-t"
            aria-hidden="true"
          />

          <header className="flex shrink-0 items-baseline justify-between gap-3 px-3 pt-2 pb-1 sm:px-4">
            <div className="min-w-0">
              <span className="hnc-eyebrow">Sample area</span>
              <h3 className="text-foreground truncate text-xs font-semibold sm:text-sm">
                London · Borough Market AOI
              </h3>
            </div>
            <span className="text-muted-foreground hidden font-mono text-[10px] sm:inline">
              Tap a marker
            </span>
          </header>
          <div className="flex min-h-[28svh] flex-[2] flex-col lg:min-h-0">
            <div className="hnc-map-canvas">
              <HNCMapPanel
                rows={rows}
                selectedId={selectedId}
                themeMode={themeMode}
                onSelect={(id) => {
                  setIsPlaying(false);
                  setSelectedId(id);
                }}
              />
            </div>
          </div>
        </section>

        <section className="hnc-panel flex min-h-0 flex-col overflow-hidden">
          <header className="flex shrink-0 items-baseline justify-between gap-3 px-3 pt-2.5 pb-1.5 sm:px-4">
            <div className="min-w-0 flex-1">
              <span className="hnc-eyebrow">Model · TRIBE v2</span>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-foreground truncate text-xs font-semibold sm:text-sm">
                  Predicted cortex · fsaverage5
                </h3>
                {selectedAlias && (
                  <button
                    type="button"
                    onClick={() => setSelectedAlias(null)}
                    className="border-foreground/15 bg-foreground/5 text-foreground hover:bg-foreground/10 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium transition"
                    aria-label={`Clear ${regionInfo(selectedAlias).feeling} spotlight`}
                    title="Clear spotlight (Esc)"
                  >
                    <span className="bg-secondary inline-block h-1.5 w-1.5 rounded-full" />
                    <span className="truncate">
                      {regionInfo(selectedAlias).feeling}
                    </span>
                    <span className="text-muted-foreground font-mono text-[9px]">
                      {regionInfo(selectedAlias).tech}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground ml-0.5"
                    >
                      ✕
                    </span>
                  </button>
                )}
              </div>
            </div>
            <span className="text-muted-foreground hidden font-mono text-[10px] sm:inline">
              20 484 vertices
            </span>
          </header>
          <div className="flex min-h-[40svh] flex-1 flex-col lg:min-h-0">
            <div className="hnc-brain-canvas">
              <HNCBrainPanel
                surface={surface}
                brainActivity={selectedHeavy?.brainActivity ?? null}
                spotlightAlias={selectedAlias}
                onAtlasReady={setAtlasAvailable}
                onStatus={(m) => setStatusMsg(m)}
              />
            </div>
          </div>
          <div className="shrink-0 px-3 pt-1.5 pb-2 sm:px-4">
            <div
              className="text-muted-foreground flex items-center gap-2 font-mono text-[10px]"
              title="Per-frame symmetric scale clipped to the 99th percentile of |activity|, mirrored around 0. Following the TRIBE v2 tutorial, we never quote absolute z values."
            >
              <span className="whitespace-nowrap">Below</span>
              <span
                className="border-border relative h-1.5 flex-1 rounded-full border"
                style={{ background: HNC_LEGEND_GRADIENT }}
                aria-hidden="true"
              >
                <span className="bg-foreground/40 absolute top-1/2 left-1/2 h-2.5 w-px -translate-x-1/2 -translate-y-1/2" />
              </span>
              <span className="whitespace-nowrap">Above</span>
              <span className="text-muted-foreground/70 ml-1 hidden whitespace-nowrap sm:inline">
                · per-frame 99th pct.
              </span>
            </div>
          </div>
        </section>

        <section className="hnc-panel flex min-h-0 flex-col overflow-hidden">
          <div className="shrink-0 px-3 pt-2.5 sm:px-4">
            {selectedRow && (
              <RegionRadar
                row={selectedRow}
                baselines={baselines}
                selectedAlias={selectedAlias}
                onSelectAlias={setSelectedAlias}
              />
            )}
          </div>
          <div
            className="border-border/60 mt-2 shrink-0 border-t"
            aria-hidden="true"
          />
          <div className="flex min-h-0 flex-1 flex-col px-3 sm:px-4">
            <CorticalRegions
              row={selectedRow}
              selectedAlias={selectedAlias}
              onSelectAlias={setSelectedAlias}
              atlasAvailable={atlasAvailable}
              baselines={baselines}
              scale={scoreScale}
              onScaleChange={setScoreScale}
              compact
            />
          </div>
        </section>
      </div>

      {/* ── Status pill ─────────────────────────────────────────────── */}
      <div className="pointer-events-none flex justify-center">
        <span
          className={`hnc-status-pill ${status.isError ? 'is-error' : ''}`}
          role="status"
          aria-live="polite"
        >
          {heavyLoading && !status.isError ? `${status.msg}` : status.msg}
        </span>
      </div>
    </div>
  );
}

export default HNCExplorer;

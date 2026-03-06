'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

interface TimeSliderProps {
  timestamps: number[];
  selectedIndex: number;
  onChange: (index: number) => void;
  isLoading: boolean;
}

function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  const month = d.toLocaleString('en', { month: 'short', timeZone: 'UTC' });
  const day = d.getUTCDate();
  const hour = d.getUTCHours().toString().padStart(2, '0');
  return `${month} ${day} ${hour}:00`;
}

/* ── Play/Pause button (shared) ──────────────────────────────────── */

function PlayPauseButton({
  playing,
  onToggle,
  size = 'md',
}: {
  playing: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
}) {
  const sz = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  const ico = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? 'Pause' : 'Play'}
      className={`flex ${sz} bg-primary text-primary-foreground hover:bg-primary/90 items-center justify-center rounded-full shadow-sm transition-colors active:scale-95`}
    >
      {playing ? (
        <svg className={ico} fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg className={ico} fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}

/* ── Playback hook ───────────────────────────────────────────────── */

function usePlayback(
  length: number,
  selectedIndex: number,
  onChange: (index: number) => void,
  intervalMs = 800
) {
  const [playing, setPlaying] = useState(false);
  const indexRef = useRef(selectedIndex);
  const lengthRef = useRef(length);
  useEffect(() => {
    indexRef.current = selectedIndex;
  }, [selectedIndex]);

  // Stop playback when length changes (section switch)
  useEffect(() => {
    lengthRef.current = length;
  }, [length]);

  useEffect(() => {
    if (!playing || length <= 1) return;
    const startLength = length;
    const id = setInterval(() => {
      // Section changed — stop
      if (lengthRef.current !== startLength) {
        setPlaying(false);
        return;
      }
      const next = indexRef.current + 1;
      if (next >= lengthRef.current) {
        onChange(0); // loop back to start
      } else {
        onChange(next);
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [playing, length, onChange, intervalMs]);

  const toggle = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  return { playing, toggle };
}

/* ── Desktop slider ──────────────────────────────────────────────── */

export const TimeSlider = memo(function TimeSlider({
  timestamps,
  selectedIndex,
  onChange,
  isLoading,
}: TimeSliderProps) {
  const { playing, toggle } = usePlayback(
    timestamps.length,
    selectedIndex,
    onChange
  );

  if (timestamps.length <= 1) return null;

  const selected = timestamps[selectedIndex];

  return (
    <div className="absolute bottom-14 left-1/2 z-20 hidden -translate-x-1/2 sm:block">
      <div className="border-border/50 bg-background/90 flex items-center gap-3 rounded-xl border px-4 py-2.5 shadow-lg backdrop-blur-md">
        <PlayPauseButton playing={playing} onToggle={toggle} />

        <div className="flex flex-col items-center gap-1">
          {/* Current timestamp */}
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="bg-warning h-2 w-2 animate-pulse rounded-full" />
            )}
            <span className="text-foreground font-mono text-xs font-bold">
              {formatTimestamp(selected)} UTC
            </span>
            <span className="text-muted-foreground text-2xs">
              {selectedIndex + 1}/{timestamps.length}
            </span>
          </div>

          {/* Slider */}
          <div className="flex w-64 flex-col sm:w-72">
            <input
              type="range"
              min={0}
              max={timestamps.length - 1}
              value={selectedIndex}
              onChange={(e) => onChange(Number(e.target.value))}
              className="time-slider bg-muted accent-success h-1.5 w-full cursor-pointer appearance-none rounded-full"
            />
            <div className="mt-2 flex justify-between px-1">
              <span className="text-muted-foreground text-2xs">
                {formatTimestamp(timestamps[0])}
              </span>
              <span className="text-muted-foreground text-2xs">
                {formatTimestamp(timestamps[timestamps.length - 1])}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ── Mobile time controls (compact) ──────────────────────────────── */

export const MobileTimeControls = memo(function MobileTimeControls({
  timestamps,
  selectedIndex,
  onChange,
}: Omit<TimeSliderProps, 'isLoading'>) {
  const { playing, toggle } = usePlayback(
    timestamps.length,
    selectedIndex,
    onChange
  );

  if (timestamps.length <= 1) return null;

  const selected = timestamps[selectedIndex];

  return (
    <div className="border-border/50 flex items-center gap-1.5 rounded-lg border px-2 py-1.5">
      <PlayPauseButton playing={playing} onToggle={toggle} size="sm" />
      <button
        type="button"
        disabled={selectedIndex === 0}
        onClick={() => onChange(selectedIndex - 1)}
        className="text-muted-foreground disabled:opacity-20"
        aria-label="Previous timestep"
      >
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <span className="text-foreground text-2xs font-mono font-medium">
        {formatTimestamp(selected)}
      </span>
      <button
        type="button"
        disabled={selectedIndex === timestamps.length - 1}
        onClick={() => onChange(selectedIndex + 1)}
        className="text-muted-foreground disabled:opacity-20"
        aria-label="Next timestep"
      >
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
});

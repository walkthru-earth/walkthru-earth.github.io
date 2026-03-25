'use client';

import { memo } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

export interface LayerControl {
  id: string;
  label: string;
  color: string;
  visible: boolean;
  opacity: number;
  rowCount: number;
}

interface LayerPanelProps {
  layers: LayerControl[];
  onToggle: (id: string) => void;
  onOpacity: (id: string, opacity: number) => void;
}

export const LayerPanel = memo(function LayerPanel({
  layers,
  onToggle,
  onOpacity,
}: LayerPanelProps) {
  if (layers.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="border-border/50 bg-background/90 text-muted-foreground hover:bg-accent flex h-9 w-9 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-colors sm:h-10 sm:w-10"
          aria-label="Layer controls"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="border-border/50 bg-background/95 w-64 rounded-xl border p-0 shadow-2xl backdrop-blur-xl"
      >
        <div className="border-border/30 border-b px-3.5 py-2.5">
          <p className="text-foreground text-xs font-semibold">Layers</p>
        </div>
        <div className="max-h-80 space-y-0.5 overflow-y-auto p-1.5">
          {layers.map((layer) => (
            <div
              key={layer.id}
              className="hover:bg-accent/50 rounded-lg px-2.5 py-2 transition-colors"
            >
              <div
                role="button"
                tabIndex={0}
                className="flex w-full cursor-pointer items-center gap-2.5"
                onClick={() => onToggle(layer.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggle(layer.id);
                  }
                }}
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                    layer.visible
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/40 bg-transparent'
                  }`}
                >
                  {layer.visible && (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="text-foreground flex-1 text-xs leading-none font-medium">
                  {layer.label}
                </span>
                <span className="text-3xs text-muted-foreground font-mono tabular-nums">
                  {layer.rowCount > 0 ? layer.rowCount.toLocaleString() : ''}
                </span>
              </div>
              {layer.visible && (
                <div className="mt-1.5 flex items-center gap-2.5 pl-6">
                  <svg
                    className="text-muted-foreground/50 h-3 w-3 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="10" opacity={0.3} />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <Slider
                    value={[layer.opacity * 100]}
                    onValueChange={([v]) =>
                      onOpacity(layer.id, (v ?? 100) / 100)
                    }
                    min={5}
                    max={100}
                    step={5}
                    className="[&_[data-slot=slider-range]]:bg-muted-foreground/40 flex-1 [&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:w-3 [&_[data-slot=slider-track]]:h-1"
                  />
                  <span className="text-3xs text-muted-foreground w-7 text-right font-mono tabular-nums">
                    {Math.round(layer.opacity * 100)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});

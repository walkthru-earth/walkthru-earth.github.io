'use client';

import { useMemo } from 'react';
import { regionInfo } from './regions';
import type { RegionBaseline } from './baselines';
import { aoiSigma } from './baselines';
import type { HNCRow } from './types';

interface Props {
  row: HNCRow | null;
  baselines: Record<string, RegionBaseline> | null;
  selectedAlias?: string | null;
  onSelectAlias?: (alias: string | null) => void;
}

const RING_SIGMAS = [-3, -1.5, 0, 1.5, 3];
const RING_LABELS: Record<number, string> = {
  [-3]: '−3σ',
  [0]: 'baseline',
  [3]: '+3σ',
};

/**
 * Cognitive-fingerprint radar. Each axis is one functional region, the
 * polygon shape encodes how this frame's region scores deviate from the
 * AOI baseline (σ units). A perfectly average frame is a flat circle at
 * the centre ring; spikes mark surprising regions for *this* street.
 *
 * Renders inline SVG, no chart library — keeps bundle small and themeable.
 */
export function RegionRadar({
  row,
  baselines,
  selectedAlias,
  onSelectAlias,
}: Props) {
  const regions = row?.top_regions ?? [];

  const data = useMemo(() => {
    if (!regions.length) return [];
    return regions.map((r) => {
      const sigma = baselines
        ? aoiSigma(Number(r.score), baselines[r.name])
        : Number(r.score);
      return { alias: r.name, sigma };
    });
  }, [regions, baselines]);

  const hasBaselines = !!baselines;
  const radius = 78;
  const cx = 100;
  const cy = 92;
  const maxSigma = 3;

  const angleFor = (i: number) => (i / data.length) * Math.PI * 2 - Math.PI / 2;
  const radiusFor = (sigma: number) =>
    (Math.max(-maxSigma, Math.min(maxSigma, sigma)) / maxSigma) * radius;

  const polygon = data
    .map((d, i) => {
      const a = angleFor(i);
      const r = radius / 2 + radiusFor(d.sigma) / 2; // map [-3..3]σ → [0..radius]
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <p className="hnc-eyebrow">Cognitive fingerprint</p>
        <p className="text-muted-foreground font-mono text-[10px]">
          {hasBaselines ? 'AOI σ' : 'raw z'}
        </p>
      </div>

      <svg
        viewBox="0 0 200 184"
        className="w-full"
        role="img"
        aria-label="Region fingerprint radar"
      >
        {/* Concentric rings at fixed σ levels */}
        {RING_SIGMAS.map((s) => {
          const r = radius / 2 + radiusFor(s) / 2;
          const isBaseline = s === 0;
          return (
            <circle
              key={s}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              className={
                isBaseline ? 'stroke-foreground/40' : 'stroke-foreground/10'
              }
              strokeDasharray={isBaseline ? undefined : '2 3'}
              strokeWidth={isBaseline ? 1 : 0.6}
            />
          );
        })}

        {/* Spokes per region */}
        {data.map((d, i) => {
          const a = angleFor(i);
          const ex = cx + Math.cos(a) * radius;
          const ey = cy + Math.sin(a) * radius;
          return (
            <line
              key={d.alias}
              x1={cx}
              y1={cy}
              x2={ex}
              y2={ey}
              className="stroke-foreground/10"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Frame polygon. Primary stroke aligns with the brain gradient,
            light tinted fill keeps focus on the vertex dots. */}
        {data.length >= 3 && (
          <polygon
            points={polygon}
            className="fill-primary/15 stroke-primary/70"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        )}

        {/* Vertex dots — sign-colored to match the bar list (sky=below,
            rose=above), so clicking a dot or a bar reads as one system. */}
        {data.map((d, i) => {
          const a = angleFor(i);
          const r = radius / 2 + radiusFor(d.sigma) / 2;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          const selected = selectedAlias === d.alias;
          const negative = d.sigma < 0;
          const fill = negative ? 'fill-sky-500' : 'fill-rose-500';
          const info = regionInfo(d.alias);
          return (
            <g key={d.alias}>
              <circle
                cx={x}
                cy={y}
                r={selected ? 3.4 : 2.4}
                className={`${fill} ${selected ? 'stroke-background' : ''}`}
                strokeWidth={selected ? 1.4 : 0}
                onClick={() => onSelectAlias?.(selected ? null : d.alias)}
                style={{ cursor: onSelectAlias ? 'pointer' : 'default' }}
              >
                <title>{`${info.feeling} (${info.tech}), ${negative ? 'below' : 'above'} baseline ${Math.abs(d.sigma).toFixed(2)}${
                  hasBaselines ? 'σ' : ' z'
                }`}</title>
              </circle>
            </g>
          );
        })}

        {/* Axis labels (alias short tag) */}
        {data.map((d, i) => {
          const a = angleFor(i);
          const lr = radius + 9;
          const x = cx + Math.cos(a) * lr;
          const y = cy + Math.sin(a) * lr;
          const anchor =
            Math.abs(Math.cos(a)) < 0.2
              ? 'middle'
              : Math.cos(a) > 0
                ? 'start'
                : 'end';
          const selected = selectedAlias === d.alias;
          return (
            <text
              key={`l-${d.alias}`}
              x={x}
              y={y + 3}
              textAnchor={anchor}
              className={
                selected
                  ? 'fill-foreground text-[7px] font-semibold'
                  : 'fill-muted-foreground text-[7px]'
              }
              style={{ cursor: onSelectAlias ? 'pointer' : 'default' }}
              onClick={() => onSelectAlias?.(selected ? null : d.alias)}
            >
              {d.alias}
            </text>
          );
        })}

        {/* Ring legend on the outside (only baseline + ±3σ) */}
        {RING_SIGMAS.filter((s) => s in RING_LABELS).map((s) => {
          const r = radius / 2 + radiusFor(s) / 2;
          return (
            <text
              key={`rl-${s}`}
              x={cx + 2}
              y={cy - r - 1.5}
              className="fill-muted-foreground/70 font-mono text-[6px]"
            >
              {RING_LABELS[s]}
            </text>
          );
        })}
      </svg>

      {!hasBaselines && (
        <p className="text-muted-foreground/80 text-[10px] leading-snug">
          Showing raw z. Ship{' '}
          <code className="font-mono">region_baselines.json</code> to switch
          axes to AOI-relative σ.
        </p>
      )}
    </div>
  );
}

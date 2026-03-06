'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Cpu,
  Smartphone,
  Database,
  Lock,
  Hexagon,
  Home,
  MapPin,
  GraduationCap,
  Landmark,
  Users,
  BadgeDollarSign,
  ArrowDown,
  ArrowRight,
  Circle,
} from 'lucide-react';

/* ── Types ───────────────────────────────────────────────────────── */

type NodeKind = 'sensor' | 'app' | 'open' | 'process' | 'output';

interface FlowNode {
  label: string;
  sublabel: string;
  Icon: LucideIcon;
  kind: NodeKind;
}

/* ── Data ────────────────────────────────────────────────────────── */

const sources: FlowNode[] = [
  {
    label: 'IoT sensors',
    sublabel: 'PM2.5, noise, temp, light',
    Icon: Cpu,
    kind: 'sensor',
  },
  {
    label: 'Mobile app',
    sublabel: 'Wellbeing + mobility, offline-first',
    Icon: Smartphone,
    kind: 'app',
  },
  {
    label: 'Open data',
    sublabel: 'LandScan, Overture, OSM',
    Icon: Database,
    kind: 'open',
  },
];

const processing: FlowNode[] = [
  {
    label: 'On-device privacy',
    sublabel: 'No account, no tracking',
    Icon: Lock,
    kind: 'process',
  },
  {
    label: 'H3 hexagonal grid',
    sublabel: '~500 m cells, 50+ indices',
    Icon: Hexagon,
    kind: 'process',
  },
];

const outputs: FlowNode[] = [
  {
    label: 'You',
    sublabel: 'Neighborhood health insights',
    Icon: Smartphone,
    kind: 'app',
  },
  {
    label: 'Families',
    sublabel: 'Find healthy areas',
    Icon: Home,
    kind: 'output',
  },
  {
    label: 'Planners',
    sublabel: 'Evidence for parks',
    Icon: MapPin,
    kind: 'output',
  },
  {
    label: 'Researchers',
    sublabel: 'Open datasets',
    Icon: GraduationCap,
    kind: 'output',
  },
  {
    label: 'Policymakers',
    sublabel: 'Health regulations',
    Icon: Landmark,
    kind: 'output',
  },
  {
    label: 'Communities',
    sublabel: 'Advocate with data',
    Icon: Users,
    kind: 'output',
  },
];

/* ── Styles per kind ─────────────────────────────────────────────── */

const kindStyles: Record<
  NodeKind,
  { border: string; bg: string; icon: string }
> = {
  sensor: {
    border: 'border-primary/30',
    bg: 'bg-primary/5',
    icon: 'text-primary',
  },
  app: {
    border: 'border-secondary/30',
    bg: 'bg-secondary/5',
    icon: 'text-secondary',
  },
  open: { border: '', bg: '', icon: 'text-muted-foreground' },
  process: {
    border: 'border-primary/20',
    bg: 'bg-primary/5',
    icon: 'text-primary',
  },
  output: { border: '', bg: '', icon: 'text-secondary' },
};

/* ── Node component ──────────────────────────────────────────────── */

function Node({
  node,
  delay,
  compact,
}: {
  node: FlowNode;
  delay: number;
  compact?: boolean;
}) {
  const s = kindStyles[node.kind];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={`flex items-center gap-2.5 rounded-xl border ${compact ? 'px-3 py-2' : 'px-4 py-3'} ${s.border} ${s.bg}`}
    >
      <node.Icon
        className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} flex-shrink-0 ${s.icon}`}
      />
      <div className="min-w-0">
        <div
          className={`${compact ? 'text-sm' : 'text-base'} leading-tight font-semibold`}
        >
          {node.label}
        </div>
        <div
          className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'} leading-tight`}
        >
          {node.sublabel}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Center node (H3 / privacy) ──────────────────────────────────── */

function CenterColumn({
  nodes,
  delay,
  compact,
}: {
  nodes: FlowNode[];
  delay: number;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {nodes.map((n, i) => (
        <motion.div
          key={n.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: delay + i * 0.1 }}
          className={`border-primary/20 bg-primary/5 rounded-xl border-2 text-center ${compact ? 'px-4 py-3' : 'px-6 py-4'}`}
        >
          <n.Icon
            className={`text-primary mx-auto ${compact ? 'h-5 w-5' : 'h-7 w-7'}`}
          />
          <div
            className={`text-primary mt-1 ${compact ? 'text-sm' : 'text-base'} font-bold`}
          >
            {n.label}
          </div>
          <div
            className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}
          >
            {n.sublabel}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Arrow ────────────────────────────────────────────────────────── */

function Arrow({ delay, vertical }: { delay: number; vertical?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, delay }}
      className={`flex items-center justify-center ${vertical ? 'py-1.5' : 'px-1.5'}`}
    >
      {vertical ? (
        <ArrowDown className="text-primary/40 h-5 w-5 animate-bounce" />
      ) : (
        <ArrowRight className="text-primary/40 h-5 w-5" />
      )}
    </motion.div>
  );
}

/* ── Legend ───────────────────────────────────────────────────────── */

function Legend({ delay, className }: { delay: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 ${className ?? ''}`}
    >
      <div className="flex items-center gap-1.5">
        <Circle className="text-primary h-2.5 w-2.5 fill-current" />
        <span className="text-muted-foreground text-xs font-medium">
          Sensors
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Circle className="text-secondary h-2.5 w-2.5 fill-current" />
        <span className="text-muted-foreground text-xs font-medium">App</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Circle className="text-muted-foreground h-2.5 w-2.5 fill-current" />
        <span className="text-muted-foreground text-xs font-medium">
          Open data
        </span>
      </div>
    </motion.div>
  );
}

/* ── Export ───────────────────────────────────────────────────────── */

export function HormonesFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="py-2">
      {inView && (
        <>
          {/* ── Desktop: horizontal ────────────────────────────── */}
          <div className="hidden flex-col gap-3 md:flex">
            <Legend delay={0} className="mb-1 justify-center" />

            <div className="flex items-center justify-center gap-3">
              {/* Sources column */}
              <div className="flex flex-col gap-2">
                {sources.map((s, i) => (
                  <Node key={s.label} node={s} delay={i * 0.1} />
                ))}
              </div>

              <Arrow delay={0.4} />
              <CenterColumn nodes={processing} delay={0.5} />
              <Arrow delay={0.8} />

              {/* Outputs — 2 columns of 3 */}
              <div className="grid grid-cols-2 gap-2">
                {outputs.map((o, i) => (
                  <Node key={o.label} node={o} delay={0.9 + i * 0.07} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Mobile: vertical ───────────────────────────────── */}
          <div className="flex flex-col items-center gap-0 md:hidden">
            <Legend delay={0} className="mb-3" />

            <div className="flex w-full max-w-xs flex-col gap-2">
              {sources.map((s, i) => (
                <Node key={s.label} node={s} delay={i * 0.08} compact />
              ))}
            </div>

            <Arrow delay={0.3} vertical />
            <CenterColumn nodes={processing} delay={0.4} compact />
            <Arrow delay={0.7} vertical />

            <div className="grid w-full max-w-xs grid-cols-2 gap-2">
              {outputs.map((o, i) => (
                <Node key={o.label} node={o} delay={0.8 + i * 0.06} compact />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

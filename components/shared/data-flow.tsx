'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Mountain,
  Building2,
  UsersRound,
  CloudSun,
  Hexagon,
  Globe,
  FlaskConical,
  Users,
  Cloud,
  Heart,
  MoreHorizontal,
  RefreshCw,
  Circle,
  ArrowDown,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react';

type NodeKind = 'open' | 'ours' | 'placeholder';

interface FlowNode {
  label: string;
  sublabel: string;
  Icon: LucideIcon;
  stat?: string;
  kind: NodeKind;
  loop?: boolean;
}

const sources: FlowNode[] = [
  {
    label: 'Terrain',
    sublabel: 'GEDTM 30m GeoTIFF',
    Icon: Mountain,
    stat: '287 GB',
    kind: 'open',
  },
  {
    label: 'Buildings',
    sublabel: '2.75B polygons',
    Icon: Building2,
    stat: '2.6 GB',
    kind: 'open',
  },
  {
    label: 'Population',
    sublabel: 'WorldPop SSP2',
    Icon: UsersRound,
    stat: '4.5 GB',
    kind: 'open',
  },
  {
    label: 'Weather',
    sublabel: 'NOAA AI-NWP',
    Icon: CloudSun,
    stat: '12h cycle',
    kind: 'open',
  },
  {
    label: 'OpenSensor',
    sublabel: 'Air, temp, humidity, gas, pressure, light',
    Icon: Cloud,
    stat: 'Real-time',
    kind: 'ours',
  },
  {
    label: 'Hormones & Cities',
    sublabel: 'Wellbeing + mobility, offline-first',
    Icon: Heart,
    kind: 'ours',
    loop: true,
  },
  {
    label: 'More coming...',
    sublabel: 'Noise, land use, transport',
    Icon: MoreHorizontal,
    kind: 'placeholder',
  },
];

const processing: FlowNode = {
  label: 'H3 Hexagonal Grid',
  sublabel: 'Open table formats',
  Icon: Hexagon,
  kind: 'open',
};

const outputs: FlowNode[] = [
  {
    label: 'Globe Explorer',
    sublabel: '16 layers, your browser',
    Icon: Globe,
    kind: 'ours',
  },
  {
    label: 'AI-Ready Data',
    sublabel: 'Parquet, open formats',
    Icon: FlaskConical,
    kind: 'open',
  },
  {
    label: 'Communities',
    sublabel: 'Evidence for change',
    Icon: Users,
    kind: 'open',
  },
  {
    label: 'Hormones & Cities',
    sublabel: 'Neighborhood insights back to you',
    Icon: RefreshCw,
    kind: 'ours',
    loop: true,
  },
];

const kindStyles = {
  open: { border: '', bg: '', icon: 'text-muted-foreground' },
  ours: {
    border: 'border-secondary/40',
    bg: 'bg-secondary/5',
    icon: 'text-secondary',
  },
  placeholder: {
    border: 'border-dashed border-muted-foreground/20',
    bg: '',
    icon: 'text-muted-foreground/40',
  },
};

function FlowNode({
  node,
  delay,
  mobile,
}: {
  node: FlowNode;
  delay: number;
  mobile?: boolean;
}) {
  const s = kindStyles[node.kind];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`flex items-center gap-3 rounded-xl border ${mobile ? 'px-3.5 py-2.5' : 'px-5 py-3.5'} ${s.border} ${s.bg}`}
    >
      <node.Icon
        className={`${mobile ? 'h-4 w-4' : 'h-5 w-5'} flex-shrink-0 ${s.icon}`}
      />
      <div className="min-w-0">
        <div
          className={`${mobile ? 'text-base' : 'text-lg'} leading-tight font-bold whitespace-nowrap`}
        >
          {node.label}
        </div>
        <div
          className={`text-muted-foreground ${mobile ? 'text-sm' : 'text-base'} leading-tight`}
        >
          {node.sublabel}
        </div>
      </div>
      {node.stat && (
        <span
          className={`ml-auto ${mobile ? 'text-sm' : 'text-base'} font-bold whitespace-nowrap ${
            node.kind === 'ours' ? 'text-secondary' : 'text-primary'
          }`}
        >
          {node.stat}
        </span>
      )}
    </motion.div>
  );
}

function FlowArrow({ delay, vertical }: { delay: number; vertical?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`flex items-center justify-center ${vertical ? 'py-2' : 'px-2'}`}
    >
      {vertical ? (
        <ArrowDown className="text-primary/50 h-6 w-6 animate-bounce" />
      ) : (
        <ArrowRight className="text-primary/50 h-6 w-6" />
      )}
    </motion.div>
  );
}

function CenterNode({ node, delay }: { node: FlowNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="bg-primary/5 border-primary/20 rounded-2xl border-2 px-7 py-6 text-center shadow-sm"
    >
      <node.Icon className="text-primary mx-auto h-9 w-9" />
      <div className="text-primary mt-2 text-lg font-bold">{node.label}</div>
      <div className="text-muted-foreground mt-0.5 text-sm">
        {node.sublabel}
      </div>
    </motion.div>
  );
}

function Legend({ delay, className }: { delay: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
      className={`flex flex-wrap items-center gap-x-5 gap-y-1 ${className ?? ''}`}
    >
      <div className="flex items-center gap-1.5">
        <Circle className="text-muted-foreground h-3 w-3 fill-current" />
        <span className="text-muted-foreground text-sm font-medium">
          Open data
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Circle className="text-secondary h-3 w-3 fill-current" />
        <span className="text-secondary text-sm font-medium">
          Our initiatives
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Circle className="text-muted-foreground/30 h-3 w-3 fill-current" />
        <span className="text-muted-foreground/50 text-sm font-medium">
          Coming soon
        </span>
      </div>
    </motion.div>
  );
}

function LoopBack({ delay, className }: { delay: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
      className={`flex items-center gap-2 ${className ?? ''}`}
    >
      <CornerDownLeft className="text-secondary/60 h-5 w-5" />
      <span className="text-secondary/70 text-sm font-medium">
        Closed loop: anonymous wellbeing + mobility data aggregated to H3,
        joined with indices, analyzed insights served back to your phone for
        your neighborhood&apos;s health
      </span>
    </motion.div>
  );
}

export function DataFlowDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="py-4">
      {isInView && (
        <>
          {/* Desktop: horizontal flow */}
          <div className="hidden flex-col gap-3 md:flex">
            <Legend delay={0} className="mb-2 justify-center" />

            <div className="flex items-center justify-center gap-3">
              <div className="flex flex-col gap-2.5">
                {sources.map((s, i) => (
                  <FlowNode key={s.label} node={s} delay={i * 0.1} />
                ))}
              </div>

              <FlowArrow delay={0.7} />
              <CenterNode node={processing} delay={0.8} />
              <FlowArrow delay={1.0} />

              <div className="flex flex-col gap-2.5">
                {outputs.map((o, i) => (
                  <FlowNode key={o.label} node={o} delay={1.1 + i * 0.1} />
                ))}
              </div>
            </div>

            <LoopBack delay={1.5} className="mt-2 justify-center" />
          </div>

          {/* Mobile: vertical flow */}
          <div className="flex flex-col items-center gap-0 md:hidden">
            <Legend delay={0} className="mb-3" />

            <div className="flex w-full max-w-sm flex-col gap-2">
              {sources.map((s, i) => (
                <FlowNode key={s.label} node={s} delay={i * 0.08} mobile />
              ))}
            </div>

            <FlowArrow delay={0.6} vertical />
            <CenterNode node={processing} delay={0.7} />
            <FlowArrow delay={0.9} vertical />

            <div className="flex w-full max-w-sm flex-col gap-2">
              {outputs.map((o, i) => (
                <FlowNode
                  key={o.label}
                  node={o}
                  delay={1.0 + i * 0.08}
                  mobile
                />
              ))}
            </div>

            <LoopBack delay={1.4} className="mt-4 px-2" />
          </div>
        </>
      )}
    </div>
  );
}

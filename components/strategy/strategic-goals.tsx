'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Blocks,
  Radio,
  Brain,
  Globe,
  Scale,
  ChevronDown,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Localized, useI18n } from '@/lib/i18n/i18n-provider';
import { strategicGoals } from '@/lib/strategy';
import { OpenSensorProgramme } from './opensensor-programme';
import { cn } from '@/lib/utils';

const goalIcons = {
  blocks: Blocks,
  radio: Radio,
  brain: Brain,
  globe: Globe,
  scale: Scale,
} as const;

const paletteSwatches = ['paper', 'surface', 'main', 'accent', 'deep'] as const;

export function StrategicGoals({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<string>(strategicGoals[0].id);
  const { direction, t } = useI18n();

  return (
    <Localized>
      <div>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Strategic goals
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Five goals. Five colors. One connected mission.
            </p>
          </div>
          {compact && (
            <Link
              href="/about#goals"
              className="text-foreground inline-flex items-center gap-2 text-lg font-bold hover:underline"
            >
              Read our strategy
              <ArrowRight
                className="h-5 w-5 rtl:rotate-180"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
        <Tabs value={selected} onValueChange={setSelected} dir={direction}>
          <TabsList
            aria-label={t('Strategic goals')}
            className="flex h-auto w-full items-stretch justify-start gap-4 overflow-x-auto rounded-none bg-transparent px-1 pt-4 pb-7 lg:grid lg:grid-cols-5 lg:gap-5"
          >
            {strategicGoals.map((goal, index) => {
              const Icon = goalIcons[goal.motif];
              return (
                <TabsTrigger
                  key={goal.id}
                  value={goal.id}
                  className={cn(
                    `brand-tone-${goal.palette}`,
                    'group relative flex w-44 shrink-0 flex-col items-start justify-start gap-5 rounded-3xl border-0 bg-[var(--brand-color)] p-5 text-start whitespace-normal text-[var(--brand-ink)] opacity-80 shadow-none transition-[transform,opacity] hover:-translate-y-1 hover:opacity-100 data-[state=active]:-translate-y-2 data-[state=active]:bg-[var(--brand-color)] data-[state=active]:text-[var(--brand-ink)] data-[state=active]:opacity-100 data-[state=active]:shadow-lg motion-reduce:transform-none motion-reduce:transition-none sm:w-52 lg:w-auto lg:odd:-rotate-2 lg:even:rotate-2'
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-3">
                    <span
                      className="text-5xl leading-none font-bold"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <Icon
                      className="h-9 w-9 shrink-0"
                      strokeWidth={2.25}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="sr-only">
                    {t('Goal {number}', { number: index + 1 })}
                  </span>
                  <span className="text-2xl leading-tight font-bold">
                    {goal.label}
                  </span>
                  <ChevronDown
                    className="mt-auto h-6 w-6 opacity-40 group-data-[state=active]:opacity-100"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </TabsTrigger>
              );
            })}
          </TabsList>
          {strategicGoals.map((goal, index) => {
            const Icon = goalIcons[goal.motif];
            return (
              <TabsContent
                key={goal.id}
                value={goal.id}
                className={cn(
                  `brand-tone-${goal.palette}`,
                  'brand-panel goal-palette-panel mt-2 border-[var(--palette-border)] bg-[var(--palette-paper)] p-0 text-[var(--palette-text)]'
                )}
              >
                <div className="goal-palette-header relative overflow-hidden bg-[var(--brand-color)] px-6 py-8 text-[var(--brand-ink)] md:px-10 md:py-10">
                  <Icon
                    className="pointer-events-none absolute -end-6 -bottom-8 h-48 w-48 opacity-10 md:h-56 md:w-56"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <div className="relative max-w-3xl">
                    <p className="mb-4 text-base font-bold">
                      {t('Goal {number}', { number: index + 1 })}
                    </p>
                    <div className="goal-palette-fan" aria-hidden="true">
                      {paletteSwatches.map((role) => (
                        <span
                          key={role}
                          data-swatch={role}
                          style={{ backgroundColor: `var(--palette-${role})` }}
                        />
                      ))}
                    </div>
                    <h3
                      className={
                        compact
                          ? 'text-2xl leading-tight font-bold md:text-3xl'
                          : 'text-3xl leading-tight font-bold md:text-4xl'
                      }
                    >
                      {goal.title}
                    </h3>
                    <p className="mt-5 text-xl leading-relaxed font-medium md:text-2xl">
                      {goal.summary}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-8 md:px-10 md:py-10">
                  {compact ? null : goal.id === 'measurable-places' ? (
                    <OpenSensorProgramme />
                  ) : (
                    <dl className="divide-y divide-[var(--palette-border)]">
                      {goal.details.map((detail) => (
                        <div
                          key={detail.title}
                          className="py-6 first:pt-0 last:pb-0 md:grid md:grid-cols-[1fr_2fr] md:gap-10"
                        >
                          <dt className="mb-3 text-xl leading-snug font-bold md:mb-0 md:text-2xl">
                            {detail.title}
                          </dt>
                          <dd className="text-lg leading-relaxed text-[var(--palette-muted)]">
                            {detail.body}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <div
                    className={cn(
                      'flex flex-wrap items-center gap-5',
                      !compact &&
                        'mt-8 border-t border-[var(--palette-border)] pt-7'
                    )}
                  >
                    <Link
                      href={goal.href}
                      prefetch={goal.href !== '/indices'}
                      className="inline-flex items-center gap-3 rounded-full bg-[var(--palette-text)] px-6 py-3 text-base font-bold text-[var(--palette-paper)] transition-transform hover:translate-x-1 motion-reduce:transform-none rtl:hover:-translate-x-1"
                    >
                      {goal.link}
                      <ArrowRight
                        className="h-5 w-5 rtl:rotate-180"
                        aria-hidden="true"
                      />
                    </Link>
                    {!compact && goal.id === 'open-ecosystem' && (
                      <Link
                        href="/privacy"
                        className="text-base text-[var(--palette-muted)] underline underline-offset-4"
                      >
                        Read our privacy policy
                      </Link>
                    )}
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </Localized>
  );
}

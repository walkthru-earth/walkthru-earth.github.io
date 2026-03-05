'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GlobeSection } from './data/sections';

interface ScrollSectionProps {
  section: GlobeSection;
  isActive: boolean;
  sectionIndex: number;
  totalSections: number;
}

export const ScrollSection = memo(function ScrollSection({
  section,
  isActive,
  sectionIndex,
  totalSections,
}: ScrollSectionProps) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 sm:top-0 sm:right-auto sm:bottom-auto sm:flex sm:h-full sm:items-center"
          role="region"
          aria-label={`Section ${sectionIndex + 1} of ${totalSections}: ${section.title}`}
        >
          <div className="pointer-events-auto mx-3 mb-3 max-w-none sm:mx-0 sm:mb-0 sm:ml-8 sm:max-w-sm">
            <div className="rounded-2xl border border-black/5 bg-white/90 p-4 shadow-2xl sm:p-6 dark:border-white/10 dark:bg-black/70">
              {/* Section indicator */}
              <div
                className="mb-4 flex items-center gap-2"
                role="progressbar"
                aria-valuenow={sectionIndex + 1}
                aria-valuemin={1}
                aria-valuemax={totalSections}
              >
                {Array.from({ length: totalSections }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i === sectionIndex
                        ? 'w-6 bg-emerald-500 dark:bg-emerald-400'
                        : i < sectionIndex
                          ? 'w-2 bg-black/20 dark:bg-white/30'
                          : 'w-2 bg-black/10 dark:bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Subtitle / location */}
              {section.subtitle && (
                <p className="mb-1 font-mono text-xs tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                  {section.subtitle}
                </p>
              )}

              {/* Title */}
              <h2 className="text-foreground mb-3 text-xl leading-tight font-semibold sm:text-2xl">
                {section.title}
              </h2>

              {/* Description */}
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                {section.description}
              </p>

              {/* Stat */}
              {section.stat.value && (
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-foreground text-2xl font-bold">
                    {section.stat.value}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {section.stat.label}
                  </span>
                </div>
              )}

              {/* Color legend */}
              {section.colorLegend.length > 0 && (
                <div>
                  <div
                    className="h-2 w-full rounded-full"
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
                        className="text-muted-foreground/60 text-[10px]"
                      >
                        {l.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

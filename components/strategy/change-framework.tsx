'use client';

import { ScanLine, Languages, Sprout, ArrowRight } from 'lucide-react';
import {
  BrandPanel,
  BrandIcon,
  BrandSectionHeading,
  type BrandTone,
} from '@/components/shared/brand-ui';
import { Localized } from '@/lib/i18n/i18n-provider';
import { changeSteps } from '@/lib/strategy';

const icons = [ScanLine, Languages, Sprout];
const tones: BrandTone[] = ['blue', 'amber', 'green'];

export function ChangeFramework({ compact = false }: { compact?: boolean }) {
  return (
    <Localized>
      <div>
        {compact ? (
          <h2 className="mb-7 text-2xl font-bold">
            Evidence. Translation. Action.
          </h2>
        ) : (
          <BrandSectionHeading title="Evidence. Translation. Action." />
        )}
        <ol className="grid gap-5 md:grid-cols-3 md:gap-7">
          {changeSteps.map((step, index) => {
            const Icon = icons[index];
            return (
              <li key={step.title} className="relative">
                <BrandPanel
                  tone={tones[index]}
                  className="flex h-full flex-col border-0"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <BrandIcon tone="ink">
                      <Icon aria-hidden="true" />
                    </BrandIcon>
                    <span className="text-4xl font-bold" aria-hidden="true">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold">{step.title}</h3>
                  <p className="mt-5 mb-7 text-lg leading-relaxed">
                    {step.body}
                  </p>
                </BrandPanel>
                {index < 2 && (
                  <ArrowRight
                    className="bg-foreground text-background absolute -end-6 top-12 z-10 hidden h-10 w-10 rounded-full p-2 md:block rtl:rotate-180"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </Localized>
  );
}

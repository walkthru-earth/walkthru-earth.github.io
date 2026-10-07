'use client';

import { ArrowDown, Brain, Cpu, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BrandIcon, BrandPanel } from '@/components/shared/brand-ui';
import { Localized } from '@/lib/i18n/i18n-provider';

/** The proposed research combines environmental context with residents' input. */
export function CapyBrainFlow() {
  return (
    <Localized>
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-5 md:grid-cols-2">
          <BrandPanel tone="capybrain">
            <BrandIcon tone="action" className="mb-5">
              <Cpu aria-hidden="true" />
            </BrandIcon>
            <h3 className="text-2xl leading-tight font-bold">
              Environmental data
            </h3>
            <p className="mt-3 text-lg leading-relaxed">
              Environmental and geographic context
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-current text-current">
                IoT sensors
              </Badge>
              <Badge variant="outline" className="border-current text-current">
                Open data
              </Badge>
              <Badge variant="outline" className="border-current text-current">
                Local context
              </Badge>
            </div>
          </BrandPanel>
          <BrandPanel tone="capybrain">
            <BrandIcon tone="action" className="mb-5">
              <Smartphone aria-hidden="true" />
            </BrandIcon>
            <h3 className="text-2xl leading-tight font-bold">
              Planned surveys
            </h3>
            <p className="mt-3 text-lg leading-relaxed">
              Residents’ experiences
            </p>
            <p className="mt-5 border-t-2 border-current pt-4 text-base font-bold">
              Consent and privacy to establish
            </p>
          </BrandPanel>
        </div>
        <div className="flex justify-center py-5" aria-hidden="true">
          <ArrowDown className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <BrandPanel
          tone="action"
          className="flex flex-col items-start gap-5 sm:flex-row sm:items-center"
        >
          <BrandIcon tone="action">
            <Brain aria-hidden="true" />
          </BrandIcon>
          <div>
            <h3 className="text-2xl leading-tight font-bold">
              Research and validation
            </h3>
            <p className="mt-2 text-lg leading-relaxed">
              Methods and limits to establish
            </p>
          </div>
        </BrandPanel>
      </div>
    </Localized>
  );
}

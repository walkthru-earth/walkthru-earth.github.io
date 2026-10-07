'use client';

import { ExternalLink } from 'lucide-react';
import { Localized } from '@/lib/i18n/i18n-provider';
import { policyFrameworks } from '@/lib/strategy';
import {
  BrandSectionHeading,
  BrandEyebrow,
} from '@/components/shared/brand-ui';

export function PolicyAlignment() {
  return (
    <Localized>
      <div>
        <BrandSectionHeading title="Frameworks informing our work" />
        <div className="grid gap-5 md:grid-cols-2">
          {policyFrameworks.map((framework) => (
            <a
              key={framework.title}
              href={framework.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card hover:border-primary/50 flex flex-col rounded-3xl border-2 p-6 transition-colors md:p-8"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <BrandEyebrow className="bg-secondary text-solid-foreground mb-0 border-0">
                  {framework.badge}
                </BrandEyebrow>
                <ExternalLink
                  className="text-muted-foreground group-hover:text-primary mt-1 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl leading-snug font-bold md:text-2xl">
                {framework.title}
              </h3>
              <p className="text-muted-foreground mt-3 mb-5 text-base leading-relaxed">
                {framework.body}
              </p>
              <span className="text-success mt-auto text-base font-bold">
                Read the official source
              </span>
            </a>
          ))}
        </div>
      </div>
    </Localized>
  );
}

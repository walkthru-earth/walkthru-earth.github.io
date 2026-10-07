'use client';

import { Radio, Wind, AudioLines } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Localized } from '@/lib/i18n/i18n-provider';
import { strategicGoals } from '@/lib/strategy';

/** Keep Cairo sensing and the noise/light roadmap under their owning project. */
export function OpenSensorProgramme({
  heading: Heading = 'h4',
}: {
  heading?: 'h3' | 'h4';
}) {
  const [project, airQuality, expansion] = strategicGoals[1].details;
  return (
    <Localized>
      <div className="brand-project-opensensor">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Radio className="text-primary h-5 w-5" aria-hidden="true" />
          <Heading className="text-2xl font-bold md:text-3xl" translate="no">
            OpenSensor.Space
          </Heading>
          <Badge>Live</Badge>
        </div>
        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          {project.body}
        </p>
        <dl className="space-y-8">
          {[
            { ...airQuality, Icon: Wind },
            { ...expansion, Icon: AudioLines },
          ].map(({ title, body, Icon }) => (
            <div key={title} className="border-primary/25 border-s-2 ps-4">
              <dt className="mb-3 flex items-start gap-3 text-xl font-bold md:text-2xl">
                <Icon
                  className="text-primary mt-1 h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                {title}
              </dt>
              <dd className="text-muted-foreground text-lg leading-relaxed">
                {body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Localized>
  );
}

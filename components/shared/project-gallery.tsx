'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Localized } from '@/lib/i18n/i18n-provider';
import { cn } from '@/lib/utils';

export interface ProjectScreenshot {
  src: string;
  alt: string;
  width: number;
  height: number;
  description?: string;
}

/** A manual gallery: only the selected image is mounted and requested. */
export function ProjectGallery({
  items,
  portrait = false,
  initialIndex = 0,
  priority = false,
}: {
  items: readonly ProjectScreenshot[];
  portrait?: boolean;
  initialIndex?: number;
  priority?: boolean;
}) {
  const [selected, setSelected] = useState(initialIndex);
  const imageId = useId();
  const item = items[selected] ?? items[0];
  if (!item) return null;

  return (
    <Localized>
      <div className={cn('min-w-0', portrait && 'mx-auto max-w-sm')}>
        <figure id={imageId}>
          <div
            key={item.src}
            className={cn(
              'border-foreground/20 bg-background overflow-hidden rounded-3xl border-2',
              portrait &&
                'mx-auto h-[25rem] w-[17rem] max-w-full overflow-y-auto overscroll-contain'
            )}
            role={portrait ? 'region' : undefined}
            aria-label={portrait ? item.alt : undefined}
            tabIndex={portrait ? 0 : undefined}
          >
            <Image
              key={item.src}
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              className="h-auto w-full"
              priority={priority && selected === initialIndex}
              sizes={portrait ? '272px' : '(min-width: 1024px) 50vw, 100vw'}
            />
          </div>
          <figcaption className="mt-4" aria-live="polite" aria-atomic="true">
            <p className="text-base font-bold">{item.alt}</p>
            {item.description && (
              <p className="mt-2 text-sm leading-relaxed opacity-80">
                {item.description}
              </p>
            )}
          </figcaption>
        </figure>
        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Screenshots"
        >
          {items.map((screenshot, index) => (
            <Button
              key={screenshot.src}
              type="button"
              variant={selected === index ? 'default' : 'outline'}
              size="sm"
              className="h-auto min-h-10 max-w-full text-start whitespace-normal"
              aria-pressed={selected === index}
              aria-controls={imageId}
              onClick={() => setSelected(index)}
            >
              {screenshot.alt}
            </Button>
          ))}
        </div>
      </div>
    </Localized>
  );
}

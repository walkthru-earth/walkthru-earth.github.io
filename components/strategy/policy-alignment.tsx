'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { Localized, useI18n } from '@/lib/i18n/i18n-provider';
import { policyFrameworks } from '@/lib/strategy';
import { frameworkLogos } from './framework-logos';
import {
  BrandSectionHeading,
  BrandEyebrow,
} from '@/components/shared/brand-ui';

export function PolicyAlignment() {
  const { direction } = useI18n();
  const rail = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ previous: false, next: true });

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const updateEdges = () => {
      const position = Math.abs(element.scrollLeft);
      setEdges({
        previous: position > 1,
        next: element.scrollWidth - element.clientWidth - position > 1,
      });
    };
    updateEdges();
    element.addEventListener('scroll', updateEdges, { passive: true });
    const resize = new ResizeObserver(updateEdges);
    resize.observe(element);
    return () => {
      element.removeEventListener('scroll', updateEdges);
      resize.disconnect();
    };
  }, [direction]);

  function move(step: number) {
    const element = rail.current;
    const card = element?.querySelector('li');
    if (!element || !card) return;
    const gap = 20;
    element.scrollBy({
      left:
        (card.getBoundingClientRect().width + gap) *
        step *
        (direction === 'rtl' ? -1 : 1),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }

  return (
    <Localized>
      <div>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <BrandSectionHeading
            className="mb-0 max-w-3xl"
            title="Frameworks informing our work"
          />
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous frameworks"
              disabled={!edges.previous}
              onClick={() => move(-1)}
              className="bg-card hover:bg-muted focus-visible:outline-ring flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-default disabled:opacity-35 motion-reduce:transition-none"
            >
              <ArrowLeft
                className="h-5 w-5 rtl:rotate-180"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              aria-label="Next frameworks"
              disabled={!edges.next}
              onClick={() => move(1)}
              className="bg-card hover:bg-muted focus-visible:outline-ring flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-default disabled:opacity-35 motion-reduce:transition-none"
            >
              <ArrowRight
                className="h-5 w-5 rtl:rotate-180"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
        <div
          ref={rail}
          role="region"
          aria-label="Frameworks and official sources"
          className="[scrollbar-width:thin] overflow-x-auto overscroll-x-contain rounded-3xl p-1 pb-5"
        >
          <ul className="grid auto-cols-[min(20rem,calc(100vw-3rem))] grid-flow-col gap-5">
            {policyFrameworks.map((framework) => {
              const logo = frameworkLogos[framework.badge];
              return (
                <li key={framework.title} className="flex">
                  <a
                    href={framework.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-card hover:border-primary/50 focus-visible:outline-ring flex w-full flex-col rounded-3xl border-2 p-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
                  >
                    <div className="mb-6 flex h-28 items-center justify-center rounded-2xl border border-black/5 bg-white p-4">
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={logo.width}
                        height={logo.height}
                        className="max-h-20 w-auto max-w-full object-contain"
                        data-no-filter
                      />
                    </div>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <BrandEyebrow className="bg-secondary text-solid-foreground mb-0 border-0">
                        {framework.badge}
                      </BrandEyebrow>
                      <ExternalLink
                        className="text-muted-foreground group-hover:text-primary mt-1 h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-xl leading-snug font-bold">
                      {framework.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 mb-5 text-base leading-relaxed">
                      {framework.body}
                    </p>
                    <span className="text-success mt-auto text-base font-bold">
                      Read the official source
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-muted-foreground mt-4 max-w-3xl text-sm leading-relaxed">
          References guide our work; they do not imply endorsement or
          partnership.
        </p>
      </div>
    </Localized>
  );
}

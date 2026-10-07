'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { Github } from '@/components/shared/brand-icons';
import { Localized } from '@/lib/i18n/i18n-provider';

const technologies = [
  {
    name: 'Source Cooperative',
    light: '/logos/source-coop-light.svg',
    dark: '/logos/source-coop-dark.svg',
    href: 'https://source.coop/walkthru-earth',
  },
  {
    name: 'DuckDB',
    light: '/logos/duckdb-light.svg',
    dark: '/logos/duckdb-dark.svg',
    href: 'https://duckdb.org/',
  },
  {
    name: 'Apache Parquet',
    light: '/logos/apache-parquet.png',
    dark: '/logos/apache-parquet.png',
    href: 'https://parquet.apache.org/',
  },
  {
    name: 'Polars',
    light: '/logos/polars.png',
    dark: '/logos/polars.png',
    href: 'https://pola.rs/',
  },
] as const;

export function OpenEcosystem() {
  return (
    <Localized>
      <div>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Built in the open
            </h2>
          </div>
          <a
            href="https://github.com/walkthru-earth"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground inline-flex items-center gap-2 text-base font-bold hover:underline"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            Explore our code
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {technologies.map((technology) => (
            <a
              key={technology.name}
              href={technology.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card hover:border-primary/50 flex flex-col items-center justify-center gap-3 rounded-3xl border-2 px-4 py-7 transition-colors"
            >
              <div className="relative h-9 w-28">
                <Image
                  src={technology.light}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-contain"
                  style={{ display: 'var(--light-display)' }}
                />
                <Image
                  src={technology.dark}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-contain"
                  style={{ display: 'var(--dark-display)' }}
                />
              </div>
              <span
                className="text-muted-foreground text-center text-sm font-bold"
                translate="no"
              >
                {technology.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </Localized>
  );
}

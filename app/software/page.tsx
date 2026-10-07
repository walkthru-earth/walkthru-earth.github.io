'use client';

import { Container } from '@/components/shared/container';
import {
  BrandPage,
  BrandHero,
  BrandSection,
  BrandPanel,
} from '@/components/shared/brand-ui';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Localized } from '@/lib/i18n/i18n-provider';

const software = [
  {
    id: 'imagery-desktop',
    name: 'Imagery Desktop',
    tagline: 'Historical Satellite Imagery Analysis',
    description:
      'Download and georeference historical satellite imagery for urban analysis. Access decades of imagery to study how cities change over time.',
    icon: '/software/imagery-desktop/appicon.png',
    highlights: [
      '1984-2025 imagery',
      'GeoTIFF export',
      'Interactive preview',
      'Fast downloads',
    ],
    link: '/software/imagery-desktop',
    status: 'Available',
    platforms: ['Windows', 'macOS', 'Linux'],
  },
  {
    id: 'objex',
    name: 'objex',
    tagline: 'Cloud Storage Explorer in the Browser',
    description:
      'Browse, query, and visualize files in S3, GCS, Azure, R2, and more. SQL queries with DuckDB, interactive maps, and 100+ file format viewers -all client-side, zero backend.',
    icon: '/software/objex/appicon.svg',
    highlights: [
      'SQL queries',
      '100+ formats',
      'Geo visualization',
      'Zero backend',
    ],
    link: '/software/objex',
    status: 'Available',
    platforms: ['Browser'],
  },
];

export default function SoftwarePage() {
  return (
    <Localized>
      <>
        <Navbar />
        <BrandPage>
          <BrandHero tone="earth" className="pt-28 md:pt-36">
            <Container>
              <div className="max-w-4xl">
                <h1>Software</h1>
                <p className="mt-6 text-xl leading-relaxed md:text-2xl">
                  Open tools for imagery and cloud data.
                </p>
              </div>
            </Container>
          </BrandHero>

          <BrandSection>
            <Container>
              <div className="grid gap-6 lg:grid-cols-2">
                {software.map((app, index) => (
                  <Link
                    key={app.id}
                    href={app.link}
                    className="group block rounded-[2rem] outline-offset-4"
                  >
                    <BrandPanel
                      tone={index === 0 ? 'imagery' : 'objex'}
                      className="flex h-full flex-col"
                    >
                      <div className="mb-8 flex items-start justify-between gap-4">
                        <Image
                          src={app.icon}
                          alt={`${app.name} Icon`}
                          width={72}
                          height={72}
                          className="h-18 w-18 rounded-2xl"
                        />
                        <Badge
                          variant="outline"
                          className="border-current text-current"
                        >
                          {app.status}
                        </Badge>
                      </div>
                      <h2 className="text-3xl md:text-4xl">
                        <span translate="no">{app.name}</span>
                      </h2>
                      <p className="mt-3 text-xl font-semibold">
                        {app.tagline}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {app.highlights.map((highlight) => (
                          <Badge
                            key={highlight}
                            variant="outline"
                            className="border-current/30 text-current"
                          >
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-bold">Available for:</span>
                        {app.platforms.map((platform, idx) => (
                          <span key={platform}>
                            {platform}
                            {idx < app.platforms.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto pt-8">
                        <span className="inline-flex items-center gap-3 rounded-full border-2 border-current px-6 py-3 font-bold">
                          Learn More
                          <ArrowRight
                            className="h-5 w-5 rtl:rotate-180"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </BrandPanel>
                  </Link>
                ))}
              </div>
            </Container>
          </BrandSection>
        </BrandPage>
        <Footer />
      </>
    </Localized>
  );
}

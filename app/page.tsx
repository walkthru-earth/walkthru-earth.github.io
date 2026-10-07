'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import {
  BrandPage,
  BrandSection,
  BrandPanel,
  BrandIcon,
} from '@/components/shared/brand-ui';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Globe, Cloud, Heart, ExternalLink } from 'lucide-react';
import { StrategicGoals } from '@/components/strategy/strategic-goals';
import { ChangeFramework } from '@/components/strategy/change-framework';
import { vision } from '@/lib/strategy';
import { Localized } from '@/lib/i18n/i18n-provider';

const GlobePreview = dynamic(
  () => import('@/components/globe/GlobePreview').then((m) => m.GlobePreview),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted/50 flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="border-primary/30 border-t-primary h-6 w-6 animate-spin rounded-full border-2" />
          <p className="text-muted-foreground text-sm">Loading globe...</p>
        </div>
      </div>
    ),
  }
);

const globeLayers = [
  { label: 'Temperature', section: 'weather-temperature' },
  { label: 'Elevation', section: 'terrain' },
  { label: 'Urban Density', section: 'urban-density' },
  { label: 'Population Growth', section: 'population-growth' },
  { label: 'Housing Pressure', section: 'housing-pressure' },
  { label: 'Shrinking Cities', section: 'shrinking-cities' },
];

export default function HomePage() {
  const [activeLayer, setActiveLayer] = useState('weather-temperature');
  return (
    <Localized>
      <>
        <Navbar />
        <BrandPage>
          {/* Full-bleed globe with a solid, readable text panel. */}
          <section className="relative min-h-dvh overflow-hidden">
            {/* Globe — full bleed, clickable to /indices */}
            <Link
              href="/indices"
              aria-label="Explore the globe"
              className="absolute inset-0 cursor-pointer"
            >
              <GlobePreview sectionId={activeLayer} nonInteractive />
            </Link>

            {/* Text panel */}
            <div className="pointer-events-none relative z-10 flex min-h-dvh items-center pt-20 pb-6 md:pb-0">
              <div className="w-full px-6 md:px-12 lg:px-24">
                <BrandPanel
                  tone="green"
                  className="pointer-events-auto max-w-2xl p-6 shadow-xl md:p-10"
                >
                  <h1 className="text-[clamp(2.5rem,5vw,5rem)] leading-[1.05] font-bold tracking-tight">
                    walkthru.earth
                  </h1>

                  <p className="text-muted-foreground mt-4 max-w-md text-lg leading-relaxed md:text-xl">
                    {vision}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4 md:mt-6">
                    <Button
                      size="lg"
                      className="group bg-foreground text-background hover:bg-foreground/90 gap-2 text-base"
                      asChild
                    >
                      <Link href="/indices">
                        <Globe className="h-5 w-5" />
                        Explore the globe
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                      </Link>
                    </Button>
                    <Link
                      href="/about"
                      className="text-solid-foreground decoration-solid-foreground/50 hover:decoration-solid-foreground text-lg font-bold underline underline-offset-4"
                    >
                      Our purpose
                    </Link>
                  </div>

                  {/* Explicit controls work in either reading direction. */}
                  <div className="border-foreground/10 mt-6 border-t pt-4">
                    <div className="flex flex-wrap gap-2">
                      {globeLayers.map((item) => {
                        const isActive = activeLayer === item.section;
                        return (
                          <button
                            key={item.section}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setActiveLayer(item.section)}
                            className={`flex-shrink-0 rounded-full border px-3 py-1 text-sm font-bold whitespace-nowrap transition-all duration-200 md:px-3.5 md:py-1.5 md:text-base ${
                              isActive
                                ? 'bg-foreground text-background'
                                : 'bg-background text-foreground border-foreground/20 hover:bg-secondary'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </BrandPanel>
              </div>
            </div>
          </section>

          {/* Products */}
          <BrandSection className="py-14 md:py-20">
            <Container>
              <h2 className="mb-10 text-3xl font-bold tracking-tight md:text-4xl">
                Our tools
              </h2>

              <Link href="/indices" className="group block">
                <Card className="brand-project-earth hover:border-primary/30 mb-6 overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-8">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <BrandIcon tone="earth">
                          <Globe />
                        </BrandIcon>
                        <Badge>Live</Badge>
                      </div>
                      <CardTitle className="mb-2 text-3xl md:text-4xl">
                        Earth&apos;s Living Indices
                      </CardTitle>
                      <p className="text-muted-foreground max-w-lg leading-relaxed">
                        Explore global terrain, population, buildings and
                        weather in your browser.
                      </p>
                      <span className="text-foreground mt-4 inline-flex items-center gap-1 text-base font-bold">
                        Explore the globe
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                      </span>
                    </div>
                    <div className="hidden flex-shrink-0 md:block">
                      <Image
                        src="/globe-preview-light.png"
                        alt="Globe explorer preview"
                        width={320}
                        height={224}
                        className="rounded-xl border object-cover shadow-md"
                        style={{ display: 'var(--light-display)' }}
                      />
                      <Image
                        src="/globe-preview-dark.png"
                        alt="Globe explorer preview"
                        width={320}
                        height={224}
                        className="rounded-xl border object-cover shadow-md"
                        style={{ display: 'var(--dark-display)' }}
                      />
                    </div>
                  </div>
                </Card>
              </Link>

              <div className="grid gap-6 md:grid-cols-2">
                <Link href="/opensensor" className="group block">
                  <Card className="brand-project-opensensor hover:border-primary/30 h-full cursor-pointer transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-4 p-6">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <BrandIcon tone="opensensor">
                            <Cloud />
                          </BrandIcon>
                          <Badge>Active</Badge>
                        </div>
                        <CardTitle className="mb-1 text-2xl md:text-3xl">
                          OpenSensor.Space
                        </CardTitle>
                        <p className="text-muted-foreground mt-3 mb-3 text-base leading-relaxed">
                          Public air-quality and weather readings from low-cost
                          environmental sensors.
                        </p>
                        <span className="text-foreground inline-flex items-center gap-1 text-base font-bold">
                          Learn more
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                        </span>
                      </div>
                      <div className="hidden flex-shrink-0 sm:block">
                        <Image
                          src="/opensensor-icon-512.png"
                          alt="OpenSensor.Space"
                          width={80}
                          height={80}
                          className="rounded-2xl opacity-80 transition-opacity group-hover:opacity-100"
                        />
                      </div>
                    </div>
                  </Card>
                </Link>

                <Link href="/hormones-cities" className="group block">
                  <Card className="brand-project-wellbeing hover:border-secondary/30 h-full cursor-pointer transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-4 p-6">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <BrandIcon tone="wellbeing">
                            <Heart />
                          </BrandIcon>
                          <Badge variant="secondary">In development</Badge>
                        </div>
                        <CardTitle className="mb-1 text-2xl md:text-3xl">
                          Hormones & Cities
                        </CardTitle>
                        <p className="text-muted-foreground mt-3 mb-3 text-base leading-relaxed">
                          Research into urban wellbeing, with an experimental
                          street-imagery demo.
                        </p>
                        <span className="text-foreground inline-flex items-center gap-1 text-base font-bold">
                          Learn more
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                        </span>
                      </div>
                      <div className="relative hidden h-40 w-20 flex-shrink-0 overflow-hidden rounded-xl border shadow-md sm:block">
                        <Image
                          src="/hormones-cities-dashboard.png"
                          alt="Hormones & Cities app prototype"
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </Container>
          </BrandSection>

          <BrandSection className="bg-muted/20 border-y py-14 md:py-20">
            <Container>
              <StrategicGoals compact />
              <div className="mt-12">
                <ChangeFramework compact />
              </div>
            </Container>
          </BrandSection>

          {/* Open data + Scheduler */}
          <BrandSection id="contact" tone="green" className="scroll-mt-24">
            <Container>
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="mb-4 text-3xl font-bold">Connect</h2>
                <a
                  href="mailto:hi@walkthru.earth"
                  className="mb-8 inline-block text-xl font-bold underline underline-offset-4"
                >
                  hi@walkthru.earth
                </a>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button size="lg" variant="outline" asChild>
                    <a
                      href="https://walkthru-earth.jp.larksuite.com/scheduler/embed/ae837d878cc4d6b4?hideEventDetail=true"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Schedule a meeting
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button size="lg" className="group gap-2" asChild>
                    <Link
                      href="https://source.coop/walkthru-earth"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src="/source-coop-logo.png"
                        alt="Source Cooperative"
                        width={22}
                        height={22}
                        className="rounded-sm"
                      />
                      Browse datasets
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Container>
          </BrandSection>
        </BrandPage>
        <Footer />
      </>
    </Localized>
  );
}

'use client';

import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import {
  BrandPage,
  BrandHero,
  BrandSection,
  BrandSectionHeading,
  BrandPanel,
  BrandIcon,
  BrandEyebrow,
} from '@/components/shared/brand-ui';
import { EvidenceGraphic } from '@/components/shared/evidence-graphic';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Cloud,
  ExternalLink,
  Wifi,
  HardDrive,
  Server,
} from 'lucide-react';
import { Localized } from '@/lib/i18n/i18n-provider';
import { OpenSensorProgramme } from '@/components/strategy/opensensor-programme';
import { Github } from '@/components/shared/brand-icons';
import Link from 'next/link';

export default function OpenSensorPage() {
  return (
    <Localized>
      <>
        <Navbar />
        <BrandPage project="opensensor">
          {/* Hero Section */}
          <BrandHero tone="opensensor">
            <Container className="relative z-10">
              <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="min-w-0">
                  <BrandEyebrow>
                    <Cloud className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-bold">
                      Open environmental monitoring
                    </span>
                  </BrandEyebrow>

                  <h1 className="text-[clamp(2.4rem,5vw,4.5rem)]! leading-[1.1] font-bold tracking-tight">
                    <GradientText className="font-bold">
                      OpenSensor.Space
                    </GradientText>
                  </h1>

                  <p className="mt-6 max-w-2xl text-xl leading-relaxed md:text-2xl">
                    Collect, explore, and share local air quality and weather
                    readings.
                  </p>

                  <div className="mt-10 flex flex-col flex-wrap gap-4 sm:flex-row">
                    <Button
                      size="lg"
                      className="bg-foreground text-background hover:bg-foreground/90"
                      asChild
                    >
                      <Link
                        href="https://opensensor.space/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Explore Live Dashboard
                        <ExternalLink className="ms-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-foreground hover:bg-accent border-current bg-transparent"
                      asChild
                    >
                      <Link
                        href="https://github.com/walkthru-earth/opensensor-space"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="me-2 h-4 w-4" />
                        Dashboard Code
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-foreground hover:bg-accent border-current bg-transparent"
                      asChild
                    >
                      <Link
                        href="https://github.com/walkthru-earth/opensensor-enviroplus"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="me-2 h-4 w-4" />
                        Edge Code
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-14 grid max-w-2xl grid-cols-3 gap-4 border-t-2 border-current pt-6 text-base md:gap-8">
                    <div>
                      <div className="text-3xl font-bold md:text-4xl">
                        1.3M+
                      </div>
                      <div>Data Points</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold md:text-4xl">6+</div>
                      <div>Sensor Types</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold md:text-4xl">Open</div>
                      <div>Source & Data</div>
                    </div>
                  </div>
                </div>
                <EvidenceGraphic variant="sensing" />
              </div>
            </Container>
          </BrandHero>

          <BrandSection className="border-y py-14 md:py-20">
            <Container>
              <div className="mx-auto max-w-4xl">
                <BrandSectionHeading title="Make places measurable" />
                <OpenSensorProgramme heading="h3" />
              </div>
            </Container>
          </BrandSection>

          {/* Architecture Section */}
          <BrandSection>
            <Container>
              <BrandSectionHeading align="center" title="How it works" />

              <div className="mb-12 grid gap-8 md:grid-cols-3">
                {[
                  {
                    icon: Wifi,
                    title: 'Edge Collection',
                    description:
                      'Collect readings on your device, with local buffering while offline.',
                  },
                  {
                    icon: HardDrive,
                    title: 'Cloud Storage',
                    description:
                      'Save Parquet files to S3-compatible storage without a separate database.',
                  },
                  {
                    icon: Server,
                    title: 'Near Real-Time Analysis',
                    description:
                      'Explore readings in your browser with DuckDB-WASM.',
                  },
                ].map((step, index) => (
                  <div key={step.title}>
                    <BrandPanel
                      tone={index === 1 ? 'opensensor' : undefined}
                      className="h-full"
                    >
                      <div className="space-y-4">
                        <BrandIcon
                          tone={index === 1 ? 'action' : 'opensensor'}
                          className="mb-2"
                        >
                          <step.icon aria-hidden="true" />
                        </BrandIcon>
                        <h3 className="text-2xl leading-tight font-bold">
                          {step.title}
                        </h3>
                        <p className="text-lg leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </BrandPanel>
                  </div>
                ))}
              </div>
            </Container>
          </BrandSection>

          {/* Supported Devices Section */}
          <BrandSection className="border-y">
            <Container>
              <BrandSectionHeading
                align="center"
                title="Supported devices"
                description={
                  <> Current integrations and the development roadmap </>
                }
              />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    name: 'BME280',
                    desc: 'Temperature, pressure, and humidity sensor',
                    badge: 'Implemented',
                  },
                  {
                    name: 'Gas Sensors',
                    desc: 'Oxidised, reducing, and NH3 gas detection',
                    badge: 'Implemented',
                  },
                  {
                    name: 'LTR559',
                    desc: 'Ambient light (lux) and proximity sensor',
                    badge: 'Implemented',
                  },
                  {
                    name: 'PMS5003',
                    desc: 'Particulate matter sensor (PM1, PM2.5, PM10)',
                    badge: 'Implemented',
                  },
                  {
                    name: 'GPS Module',
                    desc: 'Location tracking for mobile sensor installations',
                    badge: 'Roadmap',
                  },
                  {
                    name: 'LoRa / Radio (AIS)',
                    desc: 'Long-range wireless and radio signal reception',
                    badge: 'Roadmap',
                  },
                ].map((item) => (
                  <div key={item.name}>
                    <BrandPanel className="h-full">
                      <div className="space-y-4">
                        <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                          <h3 className="text-2xl leading-tight font-bold">
                            {item.name}
                          </h3>
                          {item.badge === 'Implemented' ? (
                            <Badge className="shrink-0">{item.badge}</Badge>
                          ) : (
                            <Badge variant="outline">{item.badge}</Badge>
                          )}
                        </div>
                        <p className="text-lg leading-relaxed">{item.desc}</p>
                      </div>
                    </BrandPanel>
                  </div>
                ))}
              </div>
            </Container>
          </BrandSection>

          {/* Technology Stack Section */}
          <BrandSection className="py-16">
            <Container>
              <div className="text-center">
                <p className="text-muted-foreground mb-8 text-base font-bold tracking-wider uppercase">
                  Powered by
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                  {[
                    {
                      name: 'Cloud-Native Geo',
                      logoLight: '/logos/cloud-native-geo.png',
                      logoDark: '/logos/cloud-native-geo.png',
                      url: 'https://cloudnativegeo.org/',
                      invertLight: false,
                      invertDark: true,
                    },
                    {
                      name: 'Apache Parquet',
                      logoLight: '/logos/apache-parquet.png',
                      logoDark: '/logos/apache-parquet.png',
                      url: 'https://parquet.apache.org/',
                      invertLight: false,
                      invertDark: true,
                    },
                    {
                      name: 'DuckDB',
                      logoLight: '/logos/duckdb-light.svg',
                      logoDark: '/logos/duckdb-dark.svg',
                      url: 'https://duckdb.org/',
                      invertLight: false,
                    },
                    {
                      name: 'Polars',
                      logoLight: '/logos/polars.png',
                      logoDark: '/logos/polars.png',
                      url: 'https://pola.rs/',
                      invertLight: false,
                      invertDark: true,
                    },
                    {
                      name: 'Source Cooperative',
                      logoLight: '/logos/source-coop-light.svg',
                      logoDark: '/logos/source-coop-dark.svg',
                      url: 'https://source.coop/',
                      invertLight: false,
                    },
                  ].map((tech) => (
                    <a
                      key={tech.name}
                      href={tech.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-visible:ring-ring rounded-xl p-3 focus-visible:ring-2 focus-visible:outline-none"
                      title={tech.name}
                    >
                      {/* Light theme logo */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tech.logoLight}
                        alt={tech.name}
                        data-no-filter
                        className={`h-10 w-auto object-contain md:h-14 ${tech.invertLight ? 'invert' : ''}`}
                        style={{ display: 'var(--light-display, block)' }}
                      />
                      {/* Dark theme logo */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tech.logoDark}
                        alt={tech.name}
                        data-no-filter
                        className={`h-10 w-auto object-contain md:h-14 ${'invertDark' in tech && tech.invertDark ? 'invert' : ''}`}
                        style={{ display: 'var(--dark-display, none)' }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            </Container>
          </BrandSection>

          {/* CTA Section */}
          <BrandSection tone="opensensor">
            <Container>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  Connect your station.
                </h2>
                <p className="mb-10 text-xl leading-relaxed">
                  Share readings from your own environmental sensor.
                </p>

                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    className="group bg-foreground text-background hover:bg-foreground/90"
                    asChild
                  >
                    <Link
                      href="https://opensensor.space/join-network/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join the Network
                      <ArrowRight className="ms-2 h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1 rtl:rotate-180 motion-safe:rtl:group-hover:-translate-x-1" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link
                      href="https://opensensor.space/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Explore Dashboard
                      <ExternalLink className="ms-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <BrandPanel className="bg-background text-foreground mt-12 text-start">
                  <details>
                    <summary className="cursor-pointer text-xl font-bold">
                      Getting Started
                    </summary>
                    <div className="mt-6 grid gap-4 text-start md:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/20 mt-1 rounded-full p-1">
                          <div className="bg-primary h-2 w-2 rounded-full" />
                        </div>
                        <div>
                          <div className="mb-1 text-base font-bold">
                            Deploy Edge Software
                          </div>
                          <div className="text-muted-foreground text-lg leading-relaxed">
                            Install the edge client on your IoT device
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/20 mt-1 rounded-full p-1">
                          <div className="bg-primary h-2 w-2 rounded-full" />
                        </div>
                        <div>
                          <div className="mb-1 text-base font-bold">
                            Configure Storage
                          </div>
                          <div className="text-muted-foreground text-lg leading-relaxed">
                            Use Source Cooperative or your own S3-compatible
                            storage
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/20 mt-1 rounded-full p-1">
                          <div className="bg-primary h-2 w-2 rounded-full" />
                        </div>
                        <div>
                          <div className="mb-1 text-base font-bold">
                            Register Your Station
                          </div>
                          <div className="text-muted-foreground text-lg leading-relaxed">
                            Submit a PR with your station ID and location
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/20 mt-1 rounded-full p-1">
                          <div className="bg-primary h-2 w-2 rounded-full" />
                        </div>
                        <div>
                          <div className="mb-1 text-base font-bold">
                            Start Streaming
                          </div>
                          <div className="text-muted-foreground text-lg leading-relaxed">
                            Your data appears on the public dashboard
                            automatically
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                </BrandPanel>
              </div>
            </Container>
          </BrandSection>
        </BrandPage>
        <Footer />
      </>
    </Localized>
  );
}

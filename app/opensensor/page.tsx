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
import { SensorStory } from './components/story/sensor-story';
import { HardwareExplorer } from './components/hardware/hardware-explorer';
import { ProjectMascot } from '@/components/shared/project-mascot';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Cloud,
  ExternalLink,
  Bluetooth,
  Database,
  HardDrive,
  Laptop,
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
          <BrandHero tone="opensensor" decorative={false}>
            <Container className="relative z-10">
              <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
                <div className="min-w-0">
                  <BrandEyebrow>
                    <Cloud className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-bold">
                      Open environmental monitoring
                    </span>
                  </BrandEyebrow>

                  <h1 className="text-[clamp(1.9rem,3.2vw,3.2rem)]! leading-[1.1] font-bold tracking-tight">
                    <GradientText className="font-bold">
                      OpenSensor.Space
                    </GradientText>
                  </h1>

                  <p className="mt-6 max-w-2xl text-xl leading-relaxed md:text-2xl">
                    Keep measuring, even when the connection drops.
                  </p>

                  <p className="mt-4 max-w-xl text-base leading-relaxed md:text-lg">
                    Save readings as Parquet on the edge device. Sync directly
                    to object storage or through a nearby phone or local hub.
                    Explore the files from your browser or app.
                  </p>

                  <div className="mt-8 flex flex-col flex-wrap gap-4 sm:flex-row">
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

                  <Link
                    href="#sensor-story"
                    className="mt-5 inline-flex items-center gap-2 rounded-sm font-semibold underline decoration-current/40 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    Follow the data
                    <ArrowRight
                      className="h-4 w-4 rtl:rotate-180"
                      aria-hidden="true"
                    />
                  </Link>

                  <div className="mt-14 grid max-w-2xl grid-cols-3 gap-4 border-t-2 border-current pt-6 text-base md:gap-8">
                    <div>
                      <div className="text-3xl font-bold md:text-4xl">18</div>
                      <div>Planned sensors</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold md:text-4xl">3</div>
                      <div>Measurement groups</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold md:text-4xl">Open</div>
                      <div>Source & Data</div>
                    </div>
                  </div>
                </div>
                <ProjectMascot project="opensensor" />
              </div>
            </Container>
          </BrandHero>

          <SensorStory />

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
              <BrandSectionHeading
                align="center"
                title="Local first. Open by design."
                description="From an isolated field station to public analysis, the same files travel with the data."
              />

              <div className="mb-8 grid gap-6 md:grid-cols-2">
                {[
                  {
                    icon: HardDrive,
                    title: 'Record on the edge',
                    description:
                      'Store measurements as local Parquet files before transferring them. A Wi-Fi outage pauses sync, while the sensor keeps collecting on the device.',
                  },
                  {
                    icon: Bluetooth,
                    title: 'Sync with what is nearby',
                    description:
                      'Use Bluetooth to a mobile phone in the field, or a local network to a hub or server. Isolated deployments can keep storage and analysis local; internet sync is optional.',
                  },
                  {
                    icon: Database,
                    title: 'Share open files',
                    description:
                      'When internet is available, sync directly or through a relay to object storage. Publish partitioned Parquet for anonymous reads, with no sign-in required.',
                  },
                  {
                    icon: Laptop,
                    title: 'Analyse where you are',
                    description:
                      'Browsers, apps and analytical tools read the files directly. Use Apache Parquet, Apache Iceberg tables and STAC discovery with compatible clients, reducing reliance on always-on servers.',
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
              <div className="flex flex-wrap justify-center gap-3 text-sm font-semibold">
                <a
                  className="rounded-full border px-4 py-2 underline-offset-4 hover:underline"
                  href="https://parquet.apache.org/"
                >
                  Apache Parquet · <span>Files</span>
                </a>
                <a
                  className="rounded-full border px-4 py-2 underline-offset-4 hover:underline"
                  href="https://iceberg.apache.org/"
                >
                  Apache Iceberg · <span>Tables</span>
                </a>
                <a
                  className="rounded-full border px-4 py-2 underline-offset-4 hover:underline"
                  href="https://stacspec.org/"
                >
                  STAC · <span>Discovery</span>
                </a>
              </div>
            </Container>
          </BrandSection>

          <BrandSection className="border-y">
            <Container>
              <HardwareExplorer />
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

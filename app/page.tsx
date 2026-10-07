'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import {
  BrandPage,
  BrandSection,
  BrandHero,
  BrandEyebrow,
  BrandIcon,
} from '@/components/shared/brand-ui';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Globe, Cloud, Heart, ExternalLink } from 'lucide-react';
import { StrategicGoals } from '@/components/strategy/strategic-goals';
import { ChangeFramework } from '@/components/strategy/change-framework';
import { EvidenceGraphic } from '@/components/shared/evidence-graphic';
import { Localized } from '@/lib/i18n/i18n-provider';

export default function HomePage() {
  return (
    <Localized>
      <>
        <Navbar />
        <BrandPage>
          <BrandHero tone="earth" decorative={false} className="home-cover">
            <Container>
              <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
                <div>
                  <BrandEyebrow>People · Places · Evidence</BrandEyebrow>
                  <h1>
                    Understand places.
                    <br />
                    <span className="cover-highlight">Make change.</span>
                  </h1>
                  <p className="mt-6 max-w-xl text-lg leading-relaxed md:text-xl">
                    Open tools connecting environmental data and lived
                    experience. Together, we turn everyday observations into
                    evidence for healthier places.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Button size="lg" asChild>
                      <a href="#goals">
                        Explore our goals
                        <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                      </a>
                    </Button>
                    <Link
                      href="/indices"
                      prefetch={false}
                      className="inline-flex items-center gap-2 text-base font-bold underline underline-offset-4"
                    >
                      <Globe className="h-5 w-5" />
                      Explore the globe
                    </Link>
                  </div>
                </div>
                <EvidenceGraphic />
              </div>
            </Container>
          </BrandHero>

          <BrandSection id="goals" className="scroll-mt-24 border-y">
            <Container>
              <StrategicGoals compact />
            </Container>
          </BrandSection>

          {/* Products */}
          <BrandSection className="py-14 md:py-20">
            <Container>
              <h2 className="mb-10 text-3xl font-bold tracking-tight md:text-4xl">
                Our tools
              </h2>

              <Link href="/indices" prefetch={false} className="group block">
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
                          src="/mascots/peacock.webp"
                          alt="OpenSensor’s blue and teal peacock mascot"
                          width={112}
                          height={112}
                          className="rounded-2xl opacity-80 transition-opacity group-hover:opacity-100"
                        />
                      </div>
                    </div>
                  </Card>
                </Link>

                <Link href="/capybrain" className="group block">
                  <Card className="brand-project-capybrain hover:border-secondary/30 h-full cursor-pointer transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-4 p-6">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <BrandIcon tone="capybrain">
                            <Heart />
                          </BrandIcon>
                          <Badge variant="secondary">In development</Badge>
                        </div>
                        <CardTitle className="mb-1 text-2xl md:text-3xl">
                          CapyBrain
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
                      <div className="relative hidden h-28 w-28 flex-shrink-0 sm:block">
                        <Image
                          src="/mascots/capybara.webp"
                          alt="CapyBrain capybara mascot"
                          fill
                          className="object-contain"
                          sizes="112px"
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
              <ChangeFramework compact />
            </Container>
          </BrandSection>

          {/* Open data + Scheduler */}
          <BrandSection id="contact" tone="spatial" className="scroll-mt-24">
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

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Globe, Cloud, Heart, ExternalLink } from 'lucide-react';
import { DataFlowDiagram } from '@/components/shared/data-flow';

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
  { label: 'Urban Density', section: 'buildings-nile' },
  { label: 'Population Growth', section: 'population-growth' },
  { label: 'Housing Pressure', section: 'housing-pressure' },
  { label: 'Shrinking Cities', section: 'shrinking-cities' },
];

export default function HomePage() {
  const [activeLayer, setActiveLayer] = useState('weather-temperature');
  const [userInteracted, setUserInteracted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-cycle layers until user interacts
  useEffect(() => {
    if (userInteracted) return;
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx = (idx + 1) % globeLayers.length;
      setActiveLayer(globeLayers[idx].section);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userInteracted]);

  const handleLayerClick = useCallback((section: string) => {
    setUserInteracted(true);
    setActiveLayer(section);
  }, []);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero — full-bleed globe, text with frosted glass panel */}
        <section className="relative min-h-[100dvh] overflow-hidden">
          {/* Globe — full bleed, no overlays */}
          <div className="absolute inset-0">
            <GlobePreview sectionId={activeLayer} nonInteractive />
          </div>

          {/* Text panel */}
          <div className="relative z-10 flex min-h-[100dvh] items-end pt-24 pb-12 md:items-center md:pb-0">
            <div className="w-full px-6 md:px-12 lg:px-24">
              <div className="bg-background/60 max-w-xl rounded-2xl p-6 shadow-lg backdrop-blur-xl md:p-10">
                <h1 className="text-foreground text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] font-light tracking-tight">
                  Cities Shape Us
                  <br />
                  <GradientText className="font-semibold">
                    More Than We Realize
                  </GradientText>
                </h1>

                <p className="text-muted-foreground mt-4 max-w-md text-lg leading-relaxed md:text-xl">
                  Every day, your city is processing you — noise, air, density,
                  heat. We make those invisible forces visible, and the data
                  free for everyone.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="group gap-2 text-base" asChild>
                    <Link href="/indices">
                      <Globe className="h-5 w-5" />
                      Explore the globe
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/about">Learn more</Link>
                  </Button>
                </div>

                {/* Layer chips */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {globeLayers.map((item) => {
                    const isActive = activeLayer === item.section;
                    return (
                      <button
                        key={item.section}
                        type="button"
                        onClick={() => handleLayerClick(item.section)}
                        className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 sm:text-base ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-primary/25 scale-105 shadow-md'
                            : 'bg-background/80 text-secondary-foreground border-secondary/40 hover:bg-secondary/20 backdrop-blur-sm'
                        }`}
                      >
                        {isActive && (
                          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                        )}
                        {item.label}
                      </button>
                    );
                  })}
                  <Link
                    href="/indices"
                    className="group border-foreground/10 bg-foreground/5 text-foreground/70 hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 sm:text-base"
                  >
                    +10 more
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-14 md:py-20">
          <Container>
            <h2 className="mb-10 text-3xl font-light tracking-tight md:text-4xl">
              Our tools
            </h2>

            <Link href="/indices" className="group block">
              <Card className="hover:border-primary/30 mb-6 overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-8">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="bg-primary/10 rounded-lg p-2.5">
                        <Globe className="text-primary h-6 w-6" />
                      </div>
                      <Badge>Live</Badge>
                    </div>
                    <CardTitle className="mb-2 text-2xl md:text-3xl">
                      Earth&apos;s Living Indices
                    </CardTitle>
                    <p className="text-muted-foreground max-w-lg leading-relaxed">
                      Like a fitness tracker for entire cities. Terrain,
                      population, buildings, weather — 16 layers of global data
                      you can explore right now in your browser.
                    </p>
                    <span className="text-primary mt-4 inline-flex items-center gap-1 text-base font-medium">
                      Explore the globe
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:max-w-48">
                    {[
                      'Global coverage',
                      'Real-time weather',
                      'Runs in your browser',
                      'Open data',
                    ].map((h) => (
                      <Badge key={h} variant="outline" className="text-sm">
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>

            <div className="grid gap-6 md:grid-cols-2">
              <Link href="/opensensor" className="group block">
                <Card className="hover:border-primary/30 h-full cursor-pointer transition-all duration-300 hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-3">
                      <div className="bg-primary/10 rounded-lg p-2.5">
                        <Cloud className="text-primary h-5 w-5" />
                      </div>
                      <Badge>Active</Badge>
                    </div>
                    <CardTitle className="text-xl">OpenSensor.Space</CardTitle>
                    <CardDescription className="text-base font-medium">
                      Open weather station network
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3 text-base leading-relaxed">
                      DIY weather stations streaming environmental data to the
                      cloud in real-time. Open source, open data.
                    </p>
                    <span className="text-primary inline-flex items-center gap-1 text-base font-medium">
                      Learn more
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/hormones-cities" className="group block">
                <Card className="hover:border-secondary/30 h-full cursor-pointer transition-all duration-300 hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-3">
                      <div className="bg-secondary/10 rounded-lg p-2.5">
                        <Heart className="text-secondary h-5 w-5" />
                      </div>
                      <Badge variant="secondary">Coming soon</Badge>
                    </div>
                    <CardTitle className="text-xl">Hormones & Cities</CardTitle>
                    <CardDescription className="text-base font-medium">
                      Anonymous urban wellbeing survey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3 text-base leading-relaxed">
                      How do cities shape how we feel? Anonymous surveys to
                      detect patterns and build happier communities.
                    </p>
                    <span className="text-secondary inline-flex items-center gap-1 text-base font-medium">
                      Learn more
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </Container>
        </section>

        {/* How it works */}
        <section className="border-y py-14 md:py-20">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-2 text-center text-3xl font-light tracking-tight md:text-4xl">
                How it works
              </h2>
              <p className="text-muted-foreground mb-10 text-center text-lg md:text-xl">
                Open data in, open insights out — no servers in between
              </p>
              <DataFlowDiagram />

              <blockquote className="text-foreground/70 border-primary/30 mx-auto mt-10 max-w-xl border-l-4 py-2 pl-6 text-xl leading-relaxed font-light italic md:text-2xl">
                Using data to support lives, not the other way around.
              </blockquote>
            </div>
          </Container>
        </section>

        {/* Open data + Scheduler */}
        <section className="bg-muted/30 py-14 md:py-20">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-4 text-3xl font-light tracking-tight md:text-4xl">
                Let&apos;s build healthier cities together
              </h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed md:text-xl">
                If you believe cities should serve people — not just economies —
                we&apos;re probably on the same page. Whether you run a city,
                invest in impact, do urban research, or just want better data
                for your community — don&apos;t hesitate to reach out. Pick a
                time that works for you.
              </p>

              <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row">
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

              <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
                <div
                  className="scheduler-inline-widget"
                  data-url="https://walkthru-earth.jp.larksuite.com/scheduler/embed/ae837d878cc4d6b4?hideEventDetail=true"
                  style={{ width: '100%', height: '626px' }}
                />
                <Script
                  src="https://walkthru-earth.jp.larksuite.com/scheduler/embed/scheduler-widget.js"
                  strategy="lazyOnload"
                />
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

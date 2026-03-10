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
  { label: 'Urban Density', section: 'urban-density' },
  { label: 'Population Growth', section: 'population-growth' },
  { label: 'Housing Pressure', section: 'housing-pressure' },
  { label: 'Shrinking Cities', section: 'shrinking-cities' },
];

export default function HomePage() {
  const [activeLayer, setActiveLayer] = useState('weather-temperature');
  const [userInteracted, setUserInteracted] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);
  const touchActiveRef = useRef(false);

  // Auto-scroll the marquee + allow native swipe + mouse drag
  useEffect(() => {
    const container = marqueeRef.current;
    if (!container) return;

    const speed = 0.3; // px per frame
    let isDragging = false;
    let dragStartX = 0;
    let dragScrollLeft = 0;

    const step = () => {
      if (!touchActiveRef.current && !userInteracted) {
        container.scrollLeft += speed;
        // Loop: when we've scrolled past the first set, jump back seamlessly
        const half = container.scrollWidth / 2;
        if (container.scrollLeft >= half) {
          container.scrollLeft -= half;
        }
      }
      autoScrollRef.current = requestAnimationFrame(step);
    };

    autoScrollRef.current = requestAnimationFrame(step);

    // Pause auto-scroll during touch
    const onTouchStart = () => {
      touchActiveRef.current = true;
    };
    const onTouchEnd = () => {
      touchActiveRef.current = false;
    };

    // Mouse drag-to-scroll
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      touchActiveRef.current = true;
      dragStartX = e.pageX - container.offsetLeft;
      dragScrollLeft = container.scrollLeft;
      container.style.cursor = 'grabbing';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      container.scrollLeft = dragScrollLeft - (x - dragStartX);
    };
    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      touchActiveRef.current = false;
      container.style.cursor = '';
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [userInteracted]);

  // Sync active layer to whichever chip is near the left edge (only while auto-scrolling)
  useEffect(() => {
    if (userInteracted) return;
    const container = marqueeRef.current;
    if (!container) return;

    const chips = container.querySelectorAll<HTMLElement>('[data-layer]');
    if (!chips.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const section = (entry.target as HTMLElement).dataset.layer;
            if (section) setActiveLayer(section);
          }
        }
      },
      {
        root: container,
        // Target the center ~20% of the container
        rootMargin: '0px -40% 0px -40%',
        threshold: 0.5,
      }
    );

    chips.forEach((chip) => observer.observe(chip));
    return () => observer.disconnect();
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
        <section className="relative min-h-dvh overflow-hidden">
          {/* Globe — full bleed, clickable to /indices */}
          <Link href="/indices" className="absolute inset-0 cursor-pointer">
            <GlobePreview sectionId={activeLayer} nonInteractive />
          </Link>

          {/* Text panel */}
          <div className="pointer-events-none relative z-10 flex min-h-dvh items-center pt-20 pb-6 md:pb-0">
            <div className="w-full px-6 md:px-12 lg:px-24">
              <div className="bg-background/60 pointer-events-auto max-w-xl rounded-2xl p-6 shadow-lg backdrop-blur-xl md:p-10">
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

                <div className="mt-5 md:mt-6">
                  <Button size="lg" className="group gap-2 text-base" asChild>
                    <Link href="/indices">
                      <Globe className="h-5 w-5" />
                      Explore the globe
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                {/* Layer chips — scrolling marquee */}
                <div
                  ref={marqueeRef}
                  className="marquee-chips-scroll -mx-6 mt-5 cursor-grab md:-mx-10"
                >
                  <div className="marquee-chips-track">
                    {[...globeLayers, ...globeLayers].map((item, i) => {
                      const isActive = activeLayer === item.section;
                      return (
                        <button
                          key={`${item.section}-${i}`}
                          type="button"
                          data-layer={item.section}
                          onClick={() => handleLayerClick(item.section)}
                          className={`flex-shrink-0 rounded-full border px-3 py-1 text-sm font-medium whitespace-nowrap transition-all duration-200 md:px-3.5 md:py-1.5 md:text-base ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-primary/25 shadow-md'
                              : 'bg-background/80 text-secondary-foreground border-secondary/40 hover:bg-secondary/20 backdrop-blur-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
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
                <Card className="hover:border-primary/30 h-full cursor-pointer transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-4 p-6">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg p-2.5">
                          <Cloud className="text-primary h-5 w-5" />
                        </div>
                        <Badge>Active</Badge>
                      </div>
                      <CardTitle className="mb-1 text-xl">
                        OpenSensor.Space
                      </CardTitle>
                      <CardDescription className="text-base font-medium">
                        Open weather station network
                      </CardDescription>
                      <p className="text-muted-foreground mt-3 mb-3 text-base leading-relaxed">
                        DIY weather stations streaming environmental data to the
                        cloud in real-time. Open source, open data.
                      </p>
                      <span className="text-primary inline-flex items-center gap-1 text-base font-medium">
                        Learn more
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
                <Card className="hover:border-secondary/30 h-full cursor-pointer transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-4 p-6">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="bg-secondary/10 rounded-lg p-2.5">
                          <Heart className="text-secondary h-5 w-5" />
                        </div>
                        <Badge variant="secondary">Coming soon</Badge>
                      </div>
                      <CardTitle className="mb-1 text-xl">
                        Hormones & Cities
                      </CardTitle>
                      <CardDescription className="text-base font-medium">
                        Neighborhood health insights
                      </CardDescription>
                      <p className="text-muted-foreground mt-3 mb-3 text-base leading-relaxed">
                        Share anonymous wellbeing and mobility data, get back
                        analyzed health insights for your surroundings.
                        Offline-first, privacy by design.
                      </p>
                      <span className="text-secondary inline-flex items-center gap-1 text-base font-medium">
                        Learn more
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                    <div className="relative hidden h-40 w-20 flex-shrink-0 overflow-hidden rounded-xl border shadow-md sm:block">
                      <Image
                        src="/hormones-cities-dashboard.png"
                        alt="City Pulse mobile app"
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
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

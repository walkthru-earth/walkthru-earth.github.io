'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Heart, Globe } from 'lucide-react';

import { useScrollScreenshots } from './hooks/useScrollScreenshots';
import { ScrollingPhoneMockup } from './components/ScrollingPhoneMockup';
import { HormonesFlow } from './components/HormonesFlow';
import { screenshots, allMetrics } from './data/content';

/* ── Fade-in ─────────────────────────────────────────────────────── */

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default function HormonesCitiesPage() {
  const {
    heroRef,
    screenshotOpacities,
    dotOpacities,
    mobileTextOpacity,
    mobilePhoneOpacity,
  } = useScrollScreenshots(screenshots.length);

  return (
    <>
      <Navbar />
      <main>
        {/* ─── Hero ─────────────────────────────────────────────── */}
        <section ref={heroRef} className="relative h-[200vh]">
          <div className="sticky top-0 flex h-[100dvh] items-start overflow-hidden pt-20 md:items-center">
            <div className="from-secondary/3 via-background to-secondary/5 absolute inset-0 bg-gradient-to-b" />
            <Container className="relative z-10 py-4 md:py-8">
              <div className="relative lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ opacity: mobileTextOpacity }}
                  className="max-w-xl lg:!opacity-100"
                >
                  <div className="bg-secondary/10 text-secondary mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5">
                    <Heart className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">Coming soon</span>
                  </div>

                  <h1 className="text-[clamp(2.5rem,7vw,5rem)] leading-[1.1] font-light tracking-tight">
                    <GradientText className="font-semibold">
                      Hormones & Cities
                    </GradientText>
                  </h1>

                  <p className="text-muted-foreground mt-4 max-w-md text-lg leading-relaxed">
                    Your city shapes your stress, mood, and hormones every day —
                    but nobody measures it. We do, and the data is free for
                    everyone.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="outline">Anonymous</Badge>
                    <Badge variant="outline">Open data</Badge>
                    <Badge variant="outline">Privacy-first</Badge>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/indices">
                        Explore live data
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  style={{ opacity: mobilePhoneOpacity }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center lg:pointer-events-auto lg:relative lg:!opacity-100"
                >
                  <ScrollingPhoneMockup
                    screenshots={screenshots}
                    screenshotOpacities={screenshotOpacities}
                    dotOpacities={dotOpacities}
                  />
                </motion.div>
              </div>
            </Container>
          </div>
        </section>

        {/* ─── The problem + analogy ────────────────────────────── */}
        <section className="py-14 md:py-20">
          <Container>
            <FadeIn className="mx-auto max-w-2xl">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                Cities are measured by spreadsheets,{' '}
                <span className="text-secondary">not feelings</span>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We track GDP and traffic flow, but nothing tells us if a child
                is thriving, a resident is chronically stressed, or a
                neighborhood is truly livable. Meanwhile, noise and pollution
                keep our bodies in survival mode — cortisol up, nervous system
                on edge.
              </p>
              <div className="border-primary/20 bg-primary/5 rounded-xl border p-5">
                <p className="text-foreground text-center text-base leading-relaxed font-medium md:text-lg">
                  Think of it as a{' '}
                  <strong className="text-primary">
                    fitness tracker for the whole city
                  </strong>{' '}
                  — checking its heart rate and stress levels so it can actually
                  help people get healthy.
                </p>
              </div>
            </FadeIn>
          </Container>
        </section>

        {/* ─── Animated flow diagram ────────────────────────────── */}
        <section className="bg-muted/30 py-14 md:py-20">
          <Container>
            <FadeIn className="mx-auto mb-8 max-w-2xl text-center">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight md:text-3xl">
                How it <span className="text-secondary">works</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Three data sources, processed privately on your device,
                aggregated into a hexagonal grid, and shared with everyone who
                can make cities better.
              </p>
            </FadeIn>

            <HormonesFlow />
          </Container>
        </section>

        {/* ─── 50+ indices ──────────────────────────────────────── */}
        <section className="py-14 md:py-20">
          <Container>
            <FadeIn className="mx-auto max-w-2xl">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight md:text-3xl">
                50+ living <span className="text-secondary">indices</span>
              </h2>
              <p className="text-muted-foreground mb-5 leading-relaxed">
                From water quality to happiness — every metric that matters for
                a neighborhood you&apos;d want to live in.
              </p>
              <div className="flex flex-wrap gap-2">
                {allMetrics.map((m) => (
                  <Badge key={m} variant="secondary">
                    {m}
                  </Badge>
                ))}
                <Badge variant="outline">+30 more</Badge>
              </div>
            </FadeIn>
          </Container>
        </section>

        {/* ─── Why open + CTA ───────────────────────────────────── */}
        <section className="bg-muted/30 py-14 md:py-20">
          <Container>
            <FadeIn className="mx-auto max-w-2xl text-center">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight md:text-3xl">
                Open because{' '}
                <span className="text-secondary">cities should be</span>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                All code on GitHub. Any researcher can reproduce our findings. A
                community in Dhaka gets the same tools as Dubai — no paywalls,
                no gatekeepers.
              </p>
              <p className="text-muted-foreground mb-8 text-sm italic">
                &ldquo;Closed data creates closed cities.&rdquo; We&apos;re
                building the opposite.
              </p>

              <div className="border-t pt-8">
                <h3 className="mb-3 text-lg font-semibold">
                  While we build this
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  The data foundation is already live. Explore terrain,
                  population, buildings, and weather on our interactive globe —
                  the same datasets that will power Hormones & Cities.
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button size="lg" className="group gap-2" asChild>
                    <Link href="/indices">
                      <Globe className="h-5 w-5" />
                      Explore the globe
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/">Back home</Link>
                  </Button>
                </div>
              </div>
            </FadeIn>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

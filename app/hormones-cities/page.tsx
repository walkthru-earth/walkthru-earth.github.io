'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Brain, Heart, Globe, Sparkles } from 'lucide-react';

import { useScrollScreenshots } from './hooks/useScrollScreenshots';
import { ScrollingPhoneMockup } from './components/ScrollingPhoneMockup';
import { HormonesFlow } from './components/HormonesFlow';
import { screenshots, allMetrics } from './data/content';
import { Localized } from '@/lib/i18n/i18n-provider';

const HNCExplorer = dynamic(
  () =>
    import('./components/hnc/HNCExplorer').then((m) => ({
      default: m.HNCExplorer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-card/50 border-border flex h-[60svh] w-full items-center justify-center rounded-2xl border">
        <div className="flex flex-col items-center gap-3">
          <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
          <p className="text-muted-foreground font-mono text-sm">
            Loading experiment…
          </p>
        </div>
      </div>
    ),
  }
);

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
    <Localized>
      <>
        <Navbar />
        <main>
          {/* ─── Hero ─────────────────────────────────────────────── */}
          <section ref={heroRef} className="relative h-[200vh]">
            <div className="sticky top-0 flex h-dvh items-start overflow-hidden pt-20 md:items-center">
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
                      <span className="text-sm font-medium">
                        In development
                      </span>
                    </div>

                    <h1 className="text-[clamp(2.5rem,7vw,5rem)] leading-[1.1] font-light tracking-tight">
                      <GradientText className="font-semibold">
                        Hormones & Cities
                      </GradientText>
                    </h1>

                    <p className="text-muted-foreground mt-4 max-w-md text-lg leading-relaxed">
                      How do the places we live relate to how we feel? We are
                      exploring this question through environmental data,
                      planned resident surveys, and an experimental street
                      imagery model. The app screens are prototypes.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="outline">Urban wellbeing</Badge>
                      <Badge variant="outline">Planned surveys</Badge>
                      <Badge variant="outline">Environmental data</Badge>
                      <Badge variant="outline">Research prototype</Badge>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Button size="lg" variant="outline" asChild>
                        <Link href="/indices">
                          Explore live data
                          <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
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
                  Understand the place,{' '}
                  <span className="text-secondary">listen to the people</span>
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Environmental measurements describe conditions around us.
                  Residents can describe experiences those measurements miss. We
                  want to investigate how these perspectives relate, without
                  treating a map or a model as a substitute for what people say.
                </p>
                <div className="border-primary/20 bg-primary/5 rounded-xl border p-5">
                  <p className="text-foreground text-center text-base leading-relaxed font-medium md:text-lg">
                    Our research question:{' '}
                    <strong className="text-primary">
                      How can environmental evidence and residents&apos;
                      experiences inform healthier neighborhoods?
                    </strong>{' '}
                    The survey approach and safeguards are still being
                    developed.
                  </p>
                </div>
              </FadeIn>
            </Container>
          </section>

          {/* ─── Experimental: HNC explorer (Mapillary → cortex) ──── */}
          <section
            id="experiment"
            className="py-14 md:py-20"
            aria-labelledby="hnc-experiment-title"
          >
            <Container>
              <FadeIn className="mx-auto mb-6 max-w-3xl text-center md:mb-10">
                <div className="bg-secondary/10 text-secondary mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">Live experiment</span>
                </div>
                <h2
                  id="hnc-experiment-title"
                  className="mb-3 text-2xl font-semibold tracking-tight md:text-3xl"
                >
                  From a London street{' '}
                  <span className="text-secondary">
                    to predicted brain activity
                  </span>
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  A small proof-of-concept from our Hormones &amp; Cities work,
                  Mapillary street imagery around Borough Market, run through
                  Meta&apos;s{' '}
                  <Link
                    href="https://github.com/facebookresearch/tribev2"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    TRIBE v2
                  </Link>{' '}
                  vision-only brain encoder, mapped onto the fsaverage5 cortical
                  surface. Tap a marker to explore the model&apos;s prediction
                  for that image. This experiment does not measure
                  residents&apos; brain activity, hormones, emotions, or health.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Brain className="h-3 w-3" /> TRIBE v2
                  </Badge>
                  <Badge variant="outline">V-JEPA2 ViT-G</Badge>
                  <Badge variant="outline">fsaverage5 · 20 484 vertices</Badge>
                </div>
              </FadeIn>
            </Container>

            {/* Break out of the narrow Container so the explorer is wider on
              large screens. Inner padding still keeps it readable on mobile. */}
            <FadeIn
              delay={0.05}
              className="mx-auto mt-2 w-full max-w-[120rem] px-3 sm:px-5 lg:px-6 2xl:px-10"
            >
              <HNCExplorer />
            </FadeIn>

            <Container>
              <FadeIn
                delay={0.1}
                className="mx-auto mt-8 max-w-3xl text-center"
              >
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Static street images are a limited input. These predictions
                  have not established how a street makes someone feel or
                  whether it improves wellbeing. Source code:{' '}
                  <Link
                    href="https://github.com/walkthru-earth/hnc"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    walkthru-earth/hnc
                  </Link>
                  .
                </p>

                <div className="text-muted-foreground/80 mt-6 space-y-1.5 text-xs leading-relaxed">
                  <p>
                    3D viewport interaction inspired by Meta&apos;s{' '}
                    <Link
                      href="https://aidemos.atmeta.com/tribev2"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary underline-offset-4 hover:underline"
                    >
                      TRIBE v2 demo
                    </Link>
                    . Encoder weights and reference code from{' '}
                    <Link
                      href="https://github.com/facebookresearch/tribev2"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary underline-offset-4 hover:underline"
                    >
                      facebookresearch/tribev2
                    </Link>
                    , licensed{' '}
                    <Link
                      href="https://creativecommons.org/licenses/by-nc/4.0/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary underline-offset-4 hover:underline"
                    >
                      CC-BY-NC-4.0
                    </Link>{' '}
                    (non-commercial).
                  </p>
                  <p>
                    Street imagery from{' '}
                    <Link
                      href="https://www.mapillary.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary underline-offset-4 hover:underline"
                    >
                      Mapillary
                    </Link>{' '}
                    contributors, CC-BY-SA. Cortical parcels from the HCP MMP1
                    atlas (Glasser et al., 2016).
                  </p>
                  <p>
                    Our code and derived data are licensed{' '}
                    <Link
                      href="https://creativecommons.org/licenses/by/4.0/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary underline-offset-4 hover:underline"
                    >
                      CC-BY-4.0
                    </Link>
                    . See{' '}
                    <Link
                      href="https://github.com/walkthru-earth/hnc/blob/main/LICENSE"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary underline-offset-4 hover:underline"
                    >
                      LICENSE
                    </Link>
                    . Outputs of TRIBE v2 inherit Meta&apos;s non-commercial
                    terms, treat them accordingly.
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
                  The proposed <span className="text-secondary">approach</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  This is a research direction, not a working health service. We
                  plan to relate residents&apos; feedback to environmental data.
                  Consent, privacy protections, sampling, and validation need to
                  be established before collecting sensitive responses. The
                  street imagery experiment above is a separate exploration.
                </p>
              </FadeIn>

              <HormonesFlow />
            </Container>
          </section>

          {/* ─── Research topics ──────────────────────────────────── */}
          <section className="py-14 md:py-20">
            <Container>
              <FadeIn className="mx-auto max-w-2xl">
                <h2 className="mb-3 text-2xl font-semibold tracking-tight md:text-3xl">
                  Questions about{' '}
                  <span className="text-secondary">daily life</span>
                </h2>
                <p className="text-muted-foreground mb-5 leading-relaxed">
                  These are topics we are considering, not validated
                  neighborhood scores. Choosing what to measure, and what each
                  measure can tell us, is part of the research.
                </p>
                <div className="flex flex-wrap gap-2">
                  {allMetrics.map((m) => (
                    <Badge key={m} variant="secondary">
                      {m}
                    </Badge>
                  ))}
                  <Badge variant="outline">Topics under consideration</Badge>
                </div>
              </FadeIn>
            </Container>
          </section>

          {/* ─── Why open + CTA ───────────────────────────────────── */}
          <section className="bg-muted/30 py-14 md:py-20">
            <Container>
              <FadeIn className="mx-auto max-w-2xl text-center">
                <h2 className="mb-3 text-2xl font-semibold tracking-tight md:text-3xl">
                  Research people can{' '}
                  <span className="text-secondary">inspect and question</span>
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Explore our project code and the sources behind the
                  experiment. Reuse depends on each source&apos;s license.
                  Openness about methods does not mean publishing people&apos;s
                  sensitive responses; the survey and data-sharing approach
                  remain to be worked out.
                </p>

                <div className="border-t pt-8">
                  <h3 className="mb-3 text-lg font-semibold">
                    While we build this
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    The data foundation is already live. Explore terrain,
                    population, buildings, and weather on our interactive globe
                    — a starting point for investigating environmental context.
                  </p>
                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Button size="lg" className="group gap-2" asChild>
                      <Link href="/indices">
                        <Globe className="h-5 w-5" />
                        Explore the globe
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
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
    </Localized>
  );
}

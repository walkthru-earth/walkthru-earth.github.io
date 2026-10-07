'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import {
  BrandPage,
  BrandHero,
  BrandSection,
  BrandSectionHeading,
  BrandEyebrow,
} from '@/components/shared/brand-ui';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Brain, Heart, Globe, Sparkles } from 'lucide-react';

import { ProjectMascot } from '@/components/shared/project-mascot';
import { ProjectGallery } from '@/components/shared/project-gallery';
import { LazyDemo } from '@/components/shared/lazy-demo';
import { CapyBrainFlow } from './components/CapyBrainFlow';
import { screenshots, allMetrics } from './data/content';
import { Localized } from '@/lib/i18n/i18n-provider';

const CapyBrainExplorer = dynamic(
  () =>
    import('./components/explorer/CapyBrainExplorer').then((m) => ({
      default: m.CapyBrainExplorer,
    })),
  {
    ssr: false,
    loading: () => (
      <Localized>
        <div
          className="bg-card/50 border-border flex h-[60svh] w-full items-center justify-center rounded-2xl border"
          role="status"
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-2 motion-reduce:animate-none"
              aria-hidden="true"
            />
            <p className="text-muted-foreground font-mono text-sm">
              Loading experiment…
            </p>
          </div>
        </div>
      </Localized>
    ),
  }
);

/* ── Presentation ─────────────────────────────────────────────────────── */

function ContentBlock({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default function CapyBrainPage() {
  return (
    <Localized>
      <>
        <Navbar />
        <BrandPage project="capybrain">
          {/* ─── Hero ─────────────────────────────────────────────── */}
          <BrandHero tone="capybrain" decorative={false}>
            <Container className="relative z-10">
              <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
                <div className="max-w-xl">
                  <BrandEyebrow>
                    <Heart className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-bold">In development</span>
                  </BrandEyebrow>

                  <h1 className="text-[clamp(2.5rem,7vw,5rem)] leading-[1.1] font-bold tracking-tight">
                    <GradientText className="font-bold">CapyBrain</GradientText>
                  </h1>

                  <p className="mt-5 text-xl font-bold">
                    A curious guide to people and places.
                  </p>
                  <p className="text-muted-foreground mt-4 max-w-md text-xl leading-relaxed">
                    A research prototype exploring how environmental conditions
                    relate to residents’ experiences.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                    <Badge
                      variant="outline"
                      className="border-current text-current"
                    >
                      Urban wellbeing
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-current text-current"
                    >
                      Research prototype
                    </Badge>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button
                      size="lg"
                      className="bg-foreground text-background hover:bg-foreground/90"
                      asChild
                    >
                      <Link href="#experiment">
                        Explore the experiment
                        <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <ProjectMascot project="capybrain" />
              </div>
            </Container>
          </BrandHero>

          <BrandSection>
            <Container>
              <BrandSectionHeading
                title="Research approach"
                description="We aim to connect environmental readings with residents’ feedback. Survey consent, privacy, sampling, and validation are still being developed."
              />
              <CapyBrainFlow />
              <details className="mt-8 rounded-3xl border-2 p-6">
                <summary className="cursor-pointer text-lg font-bold">
                  Topics under consideration
                </summary>
                <p className="text-muted-foreground mt-4 text-lg">
                  Possible topics, not validated neighborhood scores.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {allMetrics.map((metric) => (
                    <Badge key={metric} variant="secondary">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </details>
            </Container>
          </BrandSection>

          <BrandSection className="border-t">
            <Container>
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div>
                  <BrandSectionHeading
                    title="Inside the prototype"
                    description="Interface concepts for exploring places and sharing experiences."
                  />
                  <Badge variant="outline">Research prototype</Badge>
                </div>
                <ProjectGallery items={screenshots} portrait initialIndex={1} />
              </div>
            </Container>
          </BrandSection>

          {/* ─── Experimental: CapyBrain explorer (Mapillary → cortex) ──── */}
          <BrandSection
            id="experiment"
            className="scroll-mt-24 border-t"
            aria-labelledby="capybrain-experiment-title"
          >
            <Container>
              <ContentBlock className="mx-auto mb-6 max-w-3xl text-center md:mb-10">
                <BrandEyebrow>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm font-bold">Live experiment</span>
                </BrandEyebrow>
                <h2
                  id="capybrain-experiment-title"
                  className="mb-3 text-2xl font-bold tracking-tight md:text-3xl"
                >
                  From a London street{' '}
                  <span className="text-foreground">
                    to predicted brain activity
                  </span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Street images around Borough Market, London, processed with
                  Meta’s{' '}
                  <Link
                    href="https://github.com/facebookresearch/tribev2"
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    TRIBE v2
                  </Link>{' '}
                  model to visualize predicted brain activity.
                </p>
              </ContentBlock>
            </Container>

            {/* Break out of the narrow Container so the explorer is wider on
              large screens. Inner padding still keeps it readable on mobile. */}
            <ContentBlock className="brand-data-ui mx-auto mt-2 w-full max-w-[120rem] px-3 sm:px-5 lg:px-6 2xl:px-10">
              <LazyDemo className="min-h-[60svh]">
                <CapyBrainExplorer />
              </LazyDemo>
            </ContentBlock>

            <Container>
              <ContentBlock className="mx-auto mt-8 max-w-3xl text-center">
                <p className="text-muted-foreground text-base leading-relaxed">
                  Select a marker to explore a prediction. This model does not
                  measure anyone’s brain activity, hormones, emotions, or
                  health, or establish how a place makes people feel.
                </p>
                <p className="mt-4 text-base font-bold">
                  Source code:{' '}
                  <Link
                    href="https://github.com/walkthru-earth/hnc"
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    CapyBrain research repository
                  </Link>
                  .
                </p>

                <details className="mt-6 rounded-3xl border-2 p-6 text-start">
                  <summary className="cursor-pointer text-lg font-bold">
                    Methods and licenses
                  </summary>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Brain className="h-3 w-3" /> TRIBE v2
                    </Badge>
                    <Badge variant="outline">V-JEPA2 ViT-G</Badge>
                    <Badge variant="outline">
                      fsaverage5 · 20 484 vertices
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-6 space-y-3 text-base leading-relaxed">
                    <p>
                      3D viewport interaction inspired by Meta&apos;s{' '}
                      <Link
                        href="https://aidemos.atmeta.com/tribev2"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground underline-offset-4 hover:underline"
                      >
                        TRIBE v2 demo
                      </Link>
                      . Encoder weights and reference code from{' '}
                      <Link
                        href="https://github.com/facebookresearch/tribev2"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground underline-offset-4 hover:underline"
                      >
                        facebookresearch/tribev2
                      </Link>
                      , licensed{' '}
                      <Link
                        href="https://creativecommons.org/licenses/by-nc/4.0/"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground underline-offset-4 hover:underline"
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
                        className="hover:text-foreground underline-offset-4 hover:underline"
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
                        className="hover:text-foreground underline-offset-4 hover:underline"
                      >
                        CC-BY-4.0
                      </Link>
                      . See{' '}
                      <Link
                        href="https://github.com/walkthru-earth/hnc/blob/main/LICENSE"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground underline-offset-4 hover:underline"
                      >
                        LICENSE
                      </Link>
                      . Outputs of TRIBE v2 inherit Meta&apos;s non-commercial
                      terms, treat them accordingly.
                    </p>
                  </div>
                </details>
              </ContentBlock>
            </Container>
          </BrandSection>

          <BrandSection tone="capybrain">
            <Container>
              <div className="mx-auto max-w-2xl text-center">
                <BrandSectionHeading
                  align="center"
                  title="Explore the data"
                  description="Explore environmental context on our live globe."
                />
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    className="bg-foreground text-background hover:bg-foreground/90 gap-2"
                    asChild
                  >
                    <Link href="/indices">
                      <Globe className="h-5 w-5" aria-hidden="true" />
                      Explore the globe
                      <ArrowRight
                        className="h-4 w-4 rtl:rotate-180"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-solid-foreground hover:bg-background/20 border-current bg-transparent"
                    asChild
                  >
                    <Link href="/">Back home</Link>
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

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Globe,
  Mountain,
  Building2,
  UsersRound,
  CloudSun,
  Hexagon,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { Linkedin } from '@/components/shared/brand-icons';
import { DataFlowDiagram } from '@/components/shared/data-flow';
import { Localized } from '@/lib/i18n/i18n-provider';

const fade = {
  initial: { opacity: 0 } as const,
  whileInView: { opacity: 1 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.6 } as const,
};

const indices = [
  {
    Icon: Mountain,
    name: 'Terrain',
    source: 'GEDTM 30m GeoTIFF',
    metrics: 'Elevation, slope, aspect, ruggedness',
    volume: '287 GB',
    res: 'H3 1-10',
  },
  {
    Icon: Building2,
    name: 'Buildings',
    source: '2.75 billion polygons (Global Building Atlas)',
    metrics: 'Density, height, footprint, volume',
    volume: '2.6 GB',
    res: 'H3 3-8',
  },
  {
    Icon: UsersRound,
    name: 'Population',
    source: 'WorldPop SSP2 projections',
    metrics: '2025-2100 growth, 16 timesteps',
    volume: '4.5 GB',
    res: 'H3 1-8',
  },
  {
    Icon: CloudSun,
    name: 'Weather',
    source: 'NOAA AI-NWP (GraphCast)',
    metrics: 'Temperature, wind, pressure, precipitation',
    volume: '3.6 GB/forecast',
    res: 'H3 5',
  },
];

export default function AboutPage() {
  return (
    <Localized>
      <>
        <Navbar />
        <main>
          {/* Hero */}
          <section className="relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-20">
            <div className="from-primary/3 via-background absolute inset-0 bg-gradient-to-b" />
            <Container className="relative z-10">
              <motion.div {...fade} className="mx-auto max-w-3xl">
                <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium">
                  Health, wellbeing, and the places we live
                </div>
                <h1 className="text-4xl font-light tracking-tight md:text-5xl lg:text-6xl">
                  About{' '}
                  <GradientText className="font-semibold">
                    walkthru.earth
                  </GradientText>
                </h1>
                <p className="text-muted-foreground mt-6 text-lg leading-relaxed md:text-xl">
                  Our focus is human health and everyday wellbeing. We develop
                  open tools and environmental datasets to understand how the
                  places we live shape them.
                </p>
                <p className="text-muted-foreground mt-3 text-base leading-relaxed">
                  Our work starts with environmental monitoring and geographic
                  data. We are developing ways to connect that evidence with
                  residents&apos; experiences, so questions about air, heat, and
                  daily life can inform local decisions.
                </p>
              </motion.div>
            </Container>
          </section>

          {/* Who's Behind */}
          <section className="py-14 md:py-20">
            <Container>
              <motion.div {...fade} className="mx-auto max-w-3xl text-center">
                <h2 className="mb-8 text-2xl font-semibold tracking-tight md:text-3xl">
                  Who&apos;s behind walkthru.earth
                </h2>
                <div className="flex items-center justify-center gap-8 sm:gap-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="border-primary/20 relative h-28 w-28 overflow-hidden rounded-full border-2 sm:h-32 sm:w-32">
                      <Image
                        src="/youssef-harby.jpg"
                        alt="Youssef Harby"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium sm:text-base">
                      Youssef Harby
                    </span>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://www.linkedin.com/in/yharby/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                      <a
                        href="mailto:yharby@walkthru.earth"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="border-primary/20 relative h-28 w-28 overflow-hidden rounded-full border-2 sm:h-32 sm:w-32">
                      <Image
                        src="/mishka-mendbayar.jpg"
                        alt="Myagmarjargal Mendbayar (Mishka)"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium sm:text-base">
                      Mishka Mendbayar
                    </span>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://www.linkedin.com/in/myagmarjargal-mendbayar001/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                      <a
                        href="mailto:mishka@walkthru.earth"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Container>
          </section>

          {/* Narrative */}
          <section className="py-14 md:py-20">
            <Container>
              <div className="mx-auto max-w-3xl space-y-14">
                <motion.div {...fade}>
                  <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                    Start with everyday life
                  </h2>
                  <div className="text-muted-foreground space-y-4 leading-relaxed">
                    <p>
                      The air along a walk, the shade near a home, and the
                      places where people can meet are part of everyday life. We
                      want to understand these conditions at the scale people
                      experience them.
                    </p>
                    <p>
                      Health and wellbeing give that work a purpose. Better data
                      can support investigation and public discussion; it does
                      not, on its own, prove that people&apos;s lives have
                      improved.
                    </p>
                  </div>
                </motion.div>

                <motion.div {...fade}>
                  <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                    Connect conditions with experience
                  </h2>
                  <div className="text-muted-foreground space-y-4 leading-relaxed">
                    <p>
                      Cities are already studied through public health,
                      planning, and environmental research. Our contribution is
                      to make environmental evidence easier to access, combine,
                      and explore, with attention to differences between
                      neighborhoods.
                    </p>
                    <p>
                      OpenSensor.Space collects environmental readings. Our
                      globe brings together terrain, buildings, population, and
                      weather. Hormones &amp; Cities is an emerging research
                      initiative, with planned resident surveys and a separate
                      street imagery experiment. These are different kinds of
                      evidence, each with limits.
                    </p>
                  </div>
                </motion.div>

                {/* The four indices */}
                <motion.div {...fade}>
                  <h2 className="mb-2 text-2xl font-semibold tracking-tight md:text-3xl">
                    Four planetary indices
                  </h2>
                  <p className="text-muted-foreground mb-6 text-base">
                    Scientific datasets organized on a shared geographic grid so
                    researchers can investigate environmental context.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {indices.map((idx) => (
                      <div key={idx.name} className="rounded-xl border p-4">
                        <div className="mb-2 flex items-center gap-2.5">
                          <idx.Icon className="text-primary h-5 w-5 flex-shrink-0" />
                          <span className="text-base font-semibold">
                            {idx.name}
                          </span>
                          <span className="text-primary ms-auto text-sm font-bold">
                            {idx.volume}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {idx.metrics}
                        </p>
                        <div className="text-muted-foreground mt-1.5 flex items-center justify-between text-sm">
                          <span>{idx.source}</span>
                          <span className="font-mono">{idx.res}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                    All indices share the same H3 cell ID. Join terrain,
                    buildings, population, and weather in a single SQL
                    statement. Stored in open table formats, sorted by h3_index
                    for optimized range queries.
                  </p>
                </motion.div>

                {/* Pipeline */}
                <motion.div {...fade}>
                  <h2 className="mb-2 text-2xl font-semibold tracking-tight md:text-3xl">
                    The pipeline
                  </h2>
                  <p className="text-muted-foreground mb-4 text-base">
                    From published scientific datasets to analysis in your
                    browser.
                  </p>
                  <DataFlowDiagram />
                </motion.div>

                <motion.div {...fade}>
                  <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                    Open by design
                  </h2>
                  <div className="text-muted-foreground space-y-4 leading-relaxed">
                    <p>
                      We believe urban data should be public infrastructure,
                      just like roads and bridges. We publish environmental
                      datasets on{' '}
                      <a
                        href="https://source.coop/walkthru-earth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-4"
                      >
                        Source Cooperative
                      </a>{' '}
                      in open table formats and share project code on{' '}
                      <a
                        href="https://github.com/walkthru-earth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-4"
                      >
                        GitHub
                      </a>
                      . Check each project and dataset for its methods, sources,
                      and license terms.
                    </p>
                    <p>
                      Open access makes reuse possible. Whether that access is
                      useful also depends on local coverage, language, skills,
                      and the ability to act on what the data shows.
                    </p>
                  </div>
                </motion.div>

                {/* Why rebuild the stack */}
                <motion.div {...fade}>
                  <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                    Why we build this way
                  </h2>
                  <div className="text-muted-foreground space-y-4 leading-relaxed">
                    <p>
                      Preparing large public datasets can demand substantial
                      time and infrastructure. We publish reusable outputs in
                      open formats and use browser-based analysis where it fits,
                      making it easier to work with the data beyond our website.
                    </p>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {[
                      [
                        'Open formats',
                        'GeoParquet, Iceberg, open table formats',
                      ],
                      ['Reusable outputs', 'Query with SQL, Spark, or Python'],
                      ['Public code', 'Inspect and adapt our project code'],
                      [
                        'On-demand processing',
                        'Batch workflows and browser analysis',
                      ],
                    ].map(([title, desc]) => (
                      <div
                        key={title}
                        className="flex items-start gap-2.5 rounded-lg border p-3"
                      >
                        <Hexagon className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-semibold">{title}</div>
                          <div className="text-muted-foreground text-sm">
                            {desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div {...fade}>
                  <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                    Who this is for
                  </h2>
                  <div className="text-muted-foreground leading-relaxed">
                    <p>
                      Researchers investigating environmental conditions. Public
                      teams comparing neighborhoods. Communities looking for
                      evidence to support local questions. We are still learning
                      which tools and explanations make this work useful to
                      residents in their daily lives.
                    </p>
                  </div>
                </motion.div>

                <motion.div {...fade}>
                  <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                    What we are working toward
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To help people understand the environmental conditions that
                    shape health and wellbeing, and use that knowledge to
                    support healthier places to live. Our current contribution
                    is open monitoring, datasets, and tools; connecting them to
                    decisions and evaluating their effects is work still ahead.
                  </p>
                </motion.div>

                <motion.blockquote
                  {...fade}
                  className="text-foreground/70 border-primary/30 border-s-4 py-2 ps-6 text-xl leading-relaxed font-light italic md:text-2xl"
                >
                  Using data to support lives, not the other way around.
                </motion.blockquote>
              </div>
            </Container>
          </section>

          {/* CTA */}
          <section className="bg-muted/30 py-14 md:py-20">
            <Container>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                  See it in action
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  16 data layers, real-time weather, and ~300 GB of open data,
                  all running in your browser. No account needed.
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button size="lg" className="group gap-2" asChild>
                    <Link href="/indices">
                      <Globe className="h-5 w-5" />
                      Explore the globe
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2" asChild>
                    <Link
                      href="https://source.coop/walkthru-earth"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src="/source-coop-logo.png"
                        alt="Source Cooperative"
                        width={20}
                        height={20}
                        className="rounded-sm"
                      />
                      Browse datasets
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Container>
          </section>
        </main>
        <Footer />
      </>
    </Localized>
  );
}

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
  Linkedin,
  Mail,
} from 'lucide-react';
import { DataFlowDiagram } from '@/components/shared/data-flow';

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
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="from-primary/3 via-background absolute inset-0 bg-gradient-to-b" />
          <Container className="relative z-10">
            <motion.div {...fade} className="mx-auto max-w-3xl">
              <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium">
                People-First Urban Intelligence
              </div>
              <h1 className="text-4xl font-light tracking-tight md:text-5xl lg:text-6xl">
                About{' '}
                <GradientText className="font-semibold">
                  walkthru.earth
                </GradientText>
              </h1>
              <p className="text-muted-foreground mt-6 text-lg leading-relaxed md:text-xl">
                Building a new kind of index for cities — measuring not just
                cost of living, but stress, safety, connection, and the ease of
                everyday life.
              </p>
              <p className="text-muted-foreground mt-3 text-base leading-relaxed">
                Cities are measured by spreadsheets — GDP, property values,
                traffic flow. Those numbers tell us nothing about whether a
                child is thriving, a resident is chronically stressed, or a
                neighborhood is truly livable.
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
                  The city is processing you
                </h2>
                <div className="text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    Every day, you walk through your city. You notice the
                    traffic, the buildings, the shops — but you likely
                    don&apos;t notice what the environment is doing to you.
                    Chronic noise keeps your cortisol high. Poor air quality
                    wears down your lungs. Heat islands make entire
                    neighborhoods unlivable in summer.
                  </p>
                  <p>
                    Because we ignore these hidden patterns, our bodies stay in
                    survival mode. We wanted to change that.
                  </p>
                </div>
              </motion.div>

              <motion.div {...fade}>
                <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                  A fitness tracker for cities
                </h2>
                <div className="text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    Today, cities only check their &ldquo;bank balance&rdquo;
                    (GDP) to see if they&apos;re doing well. Walkthru.earth is
                    like a fitness tracker for the whole city — we let a city
                    check its heart rate and stress levels so it can actually
                    help the people inside it get healthy.
                  </p>
                  <p>
                    We combine three layers of data to build a complete picture:
                    IoT sensors measuring air quality, noise, and light in
                    real-time. Open datasets like LandScan population grids,
                    Overture Maps (64M+ points of interest), and OpenStreetMap
                    infrastructure. And eventually, anonymous surveys capturing
                    how people actually feel.
                  </p>
                </div>
              </motion.div>

              {/* The four indices */}
              <motion.div {...fade}>
                <h2 className="mb-2 text-2xl font-semibold tracking-tight md:text-3xl">
                  Four planetary indices
                </h2>
                <p className="text-muted-foreground mb-6 text-base">
                  Raw scientific data converted into a single H3 hexagonal grid
                  anyone can query with one SQL statement.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {indices.map((idx) => (
                    <div key={idx.name} className="rounded-xl border p-4">
                      <div className="mb-2 flex items-center gap-2.5">
                        <idx.Icon className="text-primary h-5 w-5 flex-shrink-0" />
                        <span className="text-base font-semibold">
                          {idx.name}
                        </span>
                        <span className="text-primary ml-auto text-sm font-bold">
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
                  All indices share the same H3 cell ID — join terrain,
                  buildings, population, and weather in a single SQL statement.
                  Stored in open table formats, sorted by h3_index for optimized
                  range queries.
                </p>
              </motion.div>

              {/* Pipeline */}
              <motion.div {...fade}>
                <h2 className="mb-2 text-2xl font-semibold tracking-tight md:text-3xl">
                  The pipeline
                </h2>
                <p className="text-muted-foreground mb-4 text-base">
                  From raw scientific data to your browser — no servers in
                  between.
                </p>
                <DataFlowDiagram />
              </motion.div>

              <motion.div {...fade}>
                <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                  Open by design
                </h2>
                <div className="text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    We believe urban data should be public infrastructure, just
                    like roads and bridges. Everything we build is open source.
                    Every dataset is published on{' '}
                    <a
                      href="https://source.coop/walkthru-earth"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4"
                    >
                      Source Cooperative
                    </a>{' '}
                    in open table formats. All code is on{' '}
                    <a
                      href="https://github.com/walkthru-earth"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4"
                    >
                      GitHub
                    </a>
                    . Every pipeline, model, and methodology can be verified and
                    audited by anyone.
                  </p>
                  <p>
                    A community in Dhaka has the same tools as Dubai. No
                    paywalls, no gatekeepers, no privileged access. Closed data
                    creates closed cities — we&apos;re building the opposite.
                  </p>
                </div>
              </motion.div>

              {/* Why rebuild the stack */}
              <motion.div {...fade}>
                <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                  Why we rebuilt the stack
                </h2>
                <div className="text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    Existing tools weren&apos;t designed for open, collaborative
                    urban data. Every organization rebuilds the same pipelines
                    for the same public datasets. Proprietary formats trap data
                    in silos. Raw data needs ETL before any insights. Always-on
                    servers waste energy for intermittent data.
                  </p>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {[
                    ['Open formats', 'GeoParquet, Iceberg, open table formats'],
                    ['Analysis-ready', 'SQL, Spark, Python — no ETL'],
                    ['AI-ready', 'ML pipelines and embeddings built in'],
                    ['Serverless', 'Ephemeral runners, 60-90% less energy'],
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
                    Families looking for healthy neighborhoods. Urban planners
                    who need evidence to justify parks and bike lanes.
                    Researchers who need open datasets. Policymakers writing
                    health regulations. Communities advocating for change.
                    Investors seeking ESG data. Anyone who deserves to know what
                    their environment is doing to them.
                  </p>
                </div>
              </motion.div>

              <motion.div {...fade}>
                <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                  Our mission
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To reveal the hidden patterns shaping daily life and turn them
                  into people-first solutions that support wellbeing in cities
                  everywhere. Help urban communities become more resilient,
                  sustainable, and genuinely happier.
                </p>
              </motion.div>

              <motion.blockquote
                {...fade}
                className="text-foreground/70 border-primary/30 border-l-4 py-2 pl-6 text-xl leading-relaxed font-light italic md:text-2xl"
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
                16 data layers, real-time weather, and ~300 GB of open data —
                all running in your browser. No account needed.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" className="group gap-2" asChild>
                  <Link href="/indices">
                    <Globe className="h-5 w-5" />
                    Explore the globe
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
  );
}

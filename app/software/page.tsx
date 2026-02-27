'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Wrench } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';

const software = [
  {
    id: 'imagery-desktop',
    name: 'Imagery Desktop',
    tagline: 'Historical Satellite Imagery Analysis',
    description:
      'Download and georeference historical satellite imagery for urban analysis. Access decades of imagery to study how cities change over time.',
    icon: '/software/imagery-desktop/appicon.png',
    highlights: [
      '1984-2025 imagery',
      'GeoTIFF export',
      'Interactive preview',
      'Fast downloads',
    ],
    link: '/software/imagery-desktop',
    status: 'Available',
    platforms: ['Windows', 'macOS', 'Linux'],
  },
  {
    id: 'objex',
    name: 'objex',
    tagline: 'Cloud Storage Explorer in the Browser',
    description:
      'Browse, query, and visualize files in S3, GCS, Azure, R2, and more. SQL queries with DuckDB, interactive maps, and 100+ file format viewers — all client-side, zero backend.',
    icon: '/software/objex/appicon.svg',
    highlights: [
      'SQL queries',
      '100+ formats',
      'Geo visualization',
      'Zero backend',
    ],
    link: '/software/objex',
    status: 'Available',
    platforms: ['Browser'],
  },
];

export default function SoftwarePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative flex min-h-[60dvh] items-center justify-center overflow-hidden pt-20 md:pt-24">
          {/* Background gradient */}
          <div className="from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:to-secondary/10 absolute inset-0 bg-gradient-to-br" />

          {/* Animated gradient orbs */}
          <motion.div
            className="bg-primary/20 absolute top-1/4 -right-1/4 h-96 w-96 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="bg-secondary/20 absolute -bottom-1/4 -left-1/4 h-96 w-96 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <Container className="relative z-10 py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-4xl text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
              >
                <Wrench className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Urban Analysis Tools
                </span>
              </motion.div>

              <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.1] font-light tracking-tight">
                Tools for{' '}
                <GradientText className="font-semibold">
                  Urban Discovery
                </GradientText>
              </h1>

              <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg font-normal md:text-xl">
                Free, open-source software designed to help researchers,
                planners, and communities detect patterns and understand how
                cities change over time.
              </p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-muted-foreground mt-12 flex items-center justify-center gap-8 text-sm"
              >
                <div>
                  <div className="text-foreground text-2xl font-semibold">
                    Free
                  </div>
                  <div>Forever</div>
                </div>
                <div className="bg-border h-8 w-px" />
                <div>
                  <div className="text-foreground text-2xl font-semibold">
                    Open
                  </div>
                  <div>Source</div>
                </div>
                <div className="bg-border h-8 w-px" />
                <div>
                  <div className="text-foreground text-2xl font-semibold">
                    Cross
                  </div>
                  <div>Platform</div>
                </div>
              </motion.div>
            </motion.div>
          </Container>
        </section>

        {/* Software List */}
        <Section className="bg-muted/50">
          <Container>
            <div className="mx-auto max-w-4xl space-y-6">
              {software.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Link href={app.link}>
                    <Card className="hover:border-primary/50 group border-2 transition-all duration-300 hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                          {/* App Icon */}
                          <div className="flex-shrink-0">
                            <Image
                              src={app.icon}
                              alt={`${app.name} Icon`}
                              width={80}
                              height={80}
                              className="rounded-2xl shadow-md"
                            />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-start justify-between gap-4">
                              <h3 className="text-2xl font-light tracking-tight md:text-3xl">
                                <span className="text-primary font-semibold">
                                  {app.name}
                                </span>
                              </h3>
                              <Badge
                                variant="default"
                                className="flex-shrink-0"
                              >
                                {app.status}
                              </Badge>
                            </div>

                            <p className="text-muted-foreground mb-3 text-base md:text-lg">
                              {app.tagline}
                            </p>

                            <div className="mb-3 flex flex-wrap gap-2">
                              {app.highlights.map((highlight) => (
                                <Badge
                                  key={highlight}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {highlight}
                                </Badge>
                              ))}
                            </div>

                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                              <span>Available for:</span>
                              {app.platforms.map((platform, idx) => (
                                <span key={platform}>
                                  {platform}
                                  {idx < app.platforms.length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Learn More Button */}
                          <div className="hidden flex-shrink-0 md:block">
                            <Button
                              size="lg"
                              className="group/btn gap-2 transition-shadow group-hover:shadow-md"
                            >
                              Learn More
                              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                          </div>
                        </div>

                        {/* Mobile Learn More Button */}
                        <div className="mt-4 md:hidden">
                          <Button size="lg" className="group/btn w-full gap-2">
                            Learn More
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Vision Statement */}
        <section className="from-primary/5 to-secondary/5 bg-gradient-to-br py-24">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl text-center"
            >
              <h2 className="mb-6 text-4xl font-light tracking-tight md:text-5xl">
                Built for{' '}
                <GradientText className="font-semibold">
                  People-First Discovery
                </GradientText>
              </h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed md:text-xl">
                Our software tools are designed to be free, accessible, and
                focused on detecting the hidden patterns that shape urban life.
                Whether you&apos;re a researcher studying urban growth, a
                planner analyzing environmental changes, or a community
                organizer documenting your neighborhood—these tools help you
                understand how cities evolve.
              </p>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#vision">
                  Learn About Our Vision
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

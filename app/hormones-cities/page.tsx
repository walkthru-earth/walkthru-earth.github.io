'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Heart, Lock, BarChart3, Globe } from 'lucide-react';

import { useScrollScreenshots } from './hooks/useScrollScreenshots';
import { ScrollingPhoneMockup } from './components/ScrollingPhoneMockup';
import { screenshots } from './data/content';

const principles = [
  {
    icon: Lock,
    title: '100% anonymous',
    description:
      'No account needed. No email, no personal data stored. Data is processed on-device before upload — your raw data never leaves your phone.',
  },
  {
    icon: BarChart3,
    title: 'H3 spatial aggregation',
    description:
      'Location is aggregated to ~500m hexagonal cells. We measure neighborhoods, not individuals. Patterns shared publicly for researchers and communities.',
  },
  {
    icon: Globe,
    title: 'Real data foundation',
    description:
      'Built on LandScan population grids, Overture Maps (64M+ POIs), OSM infrastructure, and OpenSensor weather stations — the same open datasets that power our Globe Explorer.',
  },
];

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
        {/* Hero with phone mockup */}
        <section ref={heroRef} className="relative h-[200vh]">
          <div className="sticky top-0 flex h-[100dvh] items-start overflow-hidden pt-20 md:items-center">
            <div className="from-secondary/3 via-background to-secondary/5 absolute inset-0 bg-gradient-to-b" />

            <Container className="relative z-10 py-4 md:py-8">
              <div className="relative lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ opacity: mobileTextOpacity }}
                  className="max-w-xl lg:!opacity-100"
                >
                  <div className="bg-secondary/10 text-secondary mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5">
                    <Heart className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Coming soon</span>
                  </div>

                  <h1 className="text-[clamp(2.5rem,7vw,5rem)] leading-[1.1] font-light tracking-tight">
                    <GradientText className="font-semibold">
                      Hormones & Cities
                    </GradientText>
                  </h1>

                  <p className="text-muted-foreground mt-4 max-w-md text-lg leading-relaxed">
                    Your city affects your hormones, stress, and mood every day
                    — but nobody measures it. Short anonymous surveys,
                    aggregated to H3 hexagons, to finally give cities a way to
                    check their &ldquo;heart rate.&rdquo;
                  </p>

                  <div className="mt-6 flex items-center gap-3 text-sm">
                    <Badge variant="outline" className="px-2.5 py-1">
                      Anonymous
                    </Badge>
                    <Badge variant="outline" className="px-2.5 py-1">
                      Open data
                    </Badge>
                    <Badge variant="outline" className="px-2.5 py-1">
                      Privacy-first
                    </Badge>
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

                {/* Phone mockup */}
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

        {/* How it works — simple, no card grids */}
        <section className="py-14 md:py-20">
          <Container>
            <div className="mx-auto max-w-2xl">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                What we&apos;re building
              </h2>
              <p className="text-muted-foreground mb-10 leading-relaxed">
                Short surveys about how your neighborhood actually feels — mood,
                stress, safety, noise, green space. No accounts, no tracking.
                Responses are aggregated into 50+ livability indices that help
                families find healthy neighborhoods, planners justify parks, and
                policymakers write better health regulations.
              </p>

              <div className="space-y-6">
                {principles.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="bg-secondary/10 flex-shrink-0 rounded-lg p-2.5">
                      <item.icon className="text-secondary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* CTA — explore real data in the meantime */}
        <section className="bg-muted/30 py-14 md:py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
                While we build this
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                The data foundation is already live. Explore terrain,
                population, buildings, and weather data on our interactive globe
                — the same datasets that will power Hormones & Cities.
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
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

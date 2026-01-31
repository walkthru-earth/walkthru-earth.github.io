'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';
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
];

export default function SoftwarePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <Section className="pt-32 pb-20">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-4xl text-center"
            >
              <h1 className="text-5xl font-light tracking-tight md:text-6xl lg:text-7xl">
                Our <span className="text-primary font-medium">Software</span>
              </h1>
              <p className="text-muted-foreground mt-6 text-xl leading-relaxed md:text-2xl">
                Tools and applications built to solve real urban problems.
                Download free software for research, planning, and community
                projects.
              </p>
            </motion.div>
          </Container>
        </Section>

        {/* Software List */}
        <Section className="bg-muted/30">
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

                          {/* Download Button */}
                          <div className="hidden flex-shrink-0 md:block">
                            <Button
                              size="lg"
                              className="gap-2 transition-shadow group-hover:shadow-md"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>

                        {/* Mobile Download Button */}
                        <div className="mt-4 md:hidden">
                          <Button size="lg" className="w-full gap-2">
                            <Download className="h-4 w-4" />
                            Download
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
        <Section>
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl text-center"
            >
              <h2 className="mb-6 text-3xl font-light tracking-tight md:text-4xl">
                Built for{' '}
                <span className="text-primary font-medium">People</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
                Our software tools are designed to be free, accessible, and
                focused on solving real problems. Whether you're a researcher
                studying urban growth, a planner analyzing environmental
                changes, or a community organizer documenting your
                neighborhood—these tools are for you.
              </p>
            </motion.div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

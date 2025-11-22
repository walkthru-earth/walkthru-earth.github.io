'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Heart } from 'lucide-react';

// Custom hooks and components
import { useScrollScreenshots } from './hooks/useScrollScreenshots';
import { ScrollingPhoneMockup } from './components/ScrollingPhoneMockup';

// Data
import {
  screenshots,
  visionCards,
  surveyCategories,
  privacyFeatures,
  livabilityMetrics,
  wellbeingMetrics,
  resilienceMetrics,
  philosophyPoints,
  expectations,
} from './data/content';

export default function HormonesCitiesPage() {
  const { heroRef, screenshotOpacities, dotOpacities, mobileTextOpacity, mobilePhoneOpacity } = useScrollScreenshots(screenshots.length);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section - Extended for scroll-based screenshot rotation */}
        <section ref={heroRef} className="relative h-[300vh]">
          {/* Sticky container that stays in viewport while scrolling */}
          <div className="sticky top-0 h-[120dvh] md:h-[110dvh] flex items-start md:items-center overflow-hidden pt-20">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-background to-secondary/10" />

            <motion.div
              className="absolute top-1/4 -right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
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

            <Container className="relative z-10 py-4 md:py-8">
              {/* Mobile: Overlapping fade transition, Desktop: Side-by-side grid */}
              <div className="relative lg:grid lg:grid-cols-[1fr_auto] lg:gap-16 lg:items-center">
              {/* Text Content - Fades out on mobile scroll, always visible on desktop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  opacity: mobileTextOpacity,
                }}
                className="max-w-2xl lg:!opacity-100"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-4 md:mb-6"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-sm font-medium">Anonymous Urban Wellbeing Survey</span>
                </motion.div>

                <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-light tracking-tight leading-[1.1]">
                  <GradientText className="font-semibold">Hormones & Cities</GradientText>
                  <br />
                  Understanding Urban Life
                </h1>

                <p className="mt-4 md:mt-6 text-lg md:text-xl text-muted-foreground font-normal">
                  A modern, transparent, anonymous survey platform revealing how cities shape our
                  feelings and behaviors. Building happier, more sustainable communities through
                  data-driven insights.
                </p>

                <div className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="group" disabled>
                    Coming Soon
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#vision">Learn More</Link>
                  </Button>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="mt-8 md:mt-16 flex items-center gap-4 md:gap-6 text-sm text-muted-foreground"
                >
                  <div>
                    <div className="text-2xl font-semibold text-foreground">100%</div>
                    <div>Anonymous</div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <div className="text-2xl font-semibold text-foreground">Open</div>
                    <div>Data & Science</div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <div className="text-2xl font-semibold text-foreground">∞</div>
                    <div>Communities</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Phone Mockup - Fades in on mobile scroll, positioned absolutely on mobile */}
              <motion.div
                style={{
                  opacity: mobilePhoneOpacity,
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none lg:relative lg:!opacity-100 lg:pointer-events-auto"
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

        {/* Vision Section */}
        <section className="py-24" id="vision">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
                Our <span className="text-secondary font-medium">Vision</span>
              </h2>
              <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed mx-auto">
                Detecting hidden patterns in urban life to create people-first solutions
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {visionCards.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="p-3 rounded-lg bg-secondary/10 w-fit mb-3">
                        <item.icon className={`h-6 w-6 ${item.color}`} />
                      </div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription className="text-base">{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Survey Categories Section */}
        <section className="py-24 bg-muted/30">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
                Survey <span className="text-secondary font-medium">Categories</span>
              </h2>
              <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed mx-auto">
                Understanding multiple dimensions of urban life
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {surveyCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="p-3 rounded-lg bg-secondary/10 w-fit mb-3">
                        <category.icon className="h-5 w-5 text-secondary" />
                      </div>
                      <CardTitle className="text-xl md:text-2xl">{category.name}</CardTitle>
                      <CardDescription>{category.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Living Indices */}
        <section className="py-24">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
                Living <span className="text-secondary font-medium">Indices</span>
              </h2>
              <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed mx-auto">
                Comprehensive metrics tracking what matters for thriving, sustainable communities
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Tabs defaultValue="livability" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="livability">Livability Index</TabsTrigger>
                  <TabsTrigger value="wellbeing">Wellbeing Score</TabsTrigger>
                  <TabsTrigger value="resilience">Resilience Rating</TabsTrigger>
                </TabsList>

                <TabsContent value="livability" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Livability Index</CardTitle>
                      <CardDescription className="text-base">
                        Comprehensive scoring for neighborhood quality and urban life, measuring
                        access to essentials, environment, and infrastructure
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Core Essentials</CardTitle>
                        <CardDescription>Fundamental resources for daily life</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {livabilityMetrics.coreEssentials.map((metric) => (
                            <Badge key={metric} variant="secondary">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Access & Proximity</CardTitle>
                        <CardDescription>Distance to essential services</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {livabilityMetrics.accessProximity.map((metric) => (
                            <Badge key={metric} variant="secondary">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Environmental Quality</CardTitle>
                        <CardDescription>Natural and built environment</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {livabilityMetrics.environmental.map((metric) => (
                            <Badge key={metric} variant="secondary">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="wellbeing">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Wellbeing Score</CardTitle>
                      <CardDescription className="text-base">
                        Emotional and psychological health indicators across neighborhoods
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {wellbeingMetrics.map((metric) => (
                          <Badge key={metric} variant="secondary">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resilience">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Resilience Rating</CardTitle>
                      <CardDescription className="text-base">
                        Capacity to adapt to changes and withstand environmental pressures
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {resilienceMetrics.map((metric) => (
                          <Badge key={metric} variant="secondary">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </Container>
        </section>

        {/* Privacy & Transparency Section */}
        <section className="py-24 bg-muted/30">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
                Privacy & <span className="text-secondary font-medium">Transparency</span>
              </h2>
              <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed mx-auto">
                Your data, your control, always anonymous
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {privacyFeatures.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="p-3 rounded-lg bg-secondary/10 w-fit mb-3">
                        <item.icon className="h-6 w-6 text-secondary" />
                      </div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription className="text-base">{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Philosophy Section */}
        <section className="py-24">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6 text-center">
                The <GradientText className="font-semibold">"Less is More"</GradientText> Philosophy
              </h2>
              <Card className="border-2 border-secondary/20">
                <CardContent className="pt-6">
                  <div className="space-y-6 text-muted-foreground">
                    <p className="text-lg leading-relaxed">
                      We believe in creating NDCs (New Development Concepts) that prioritize genuine
                      wellbeing over consumption:
                    </p>
                    <ul className="space-y-3">
                      {philosophyPoints.map((point) => (
                        <li key={point.title} className="flex items-start gap-3">
                          <div className="mt-1 p-1 rounded-full bg-secondary/20 flex-shrink-0">
                            <div className="h-2 w-2 rounded-full bg-secondary" />
                          </div>
                          <span>
                            <strong>{point.title}:</strong> {point.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Container>
        </section>

        {/* Stay Tuned CTA */}
        <section className="py-24 bg-gradient-to-br from-secondary/5 to-secondary/10">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6">
                Stay <GradientText className="font-semibold">Tuned</GradientText>
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Hormones & Cities is currently in development. We're building a platform that truly
                respects your privacy while helping us understand how urban environments shape our
                lives.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" disabled>
                  App Coming Soon
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>

              <div className="mt-12 p-6 bg-card rounded-lg border">
                <h3 className="text-xl font-medium mb-4">What to Expect</h3>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  {expectations.map((expectation) => (
                    <div key={expectation.title} className="flex items-start gap-3">
                      <div className="mt-1 p-1 rounded-full bg-secondary/20">
                        <div className="h-2 w-2 rounded-full bg-secondary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm mb-1">{expectation.title}</div>
                        <div className="text-sm text-muted-foreground">{expectation.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

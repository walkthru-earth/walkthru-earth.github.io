'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight,
  Heart,
  Users,
  TrendingUp,
  Shield,
  Eye,
  Brain,
  Home,
  Smile,
  Globe,
  Lock,
  BarChart3,
  MessageCircle,
} from 'lucide-react';

const screenshots = [
  {
    src: '/hormones-cities-ai.png',
    alt: 'AI Chat Interface',
    width: 280,
    height: 600,
    hasFade: false,
  },
  {
    src: '/hormones-cities-dashboard.png',
    alt: 'City-Wide Trends Dashboard',
    width: 280,
    height: 1500,
    hasFade: true,
  },
  {
    src: '/hormones-cities-survey.png',
    alt: 'Survey Categories',
    width: 280,
    height: 1200,
    hasFade: true,
  },
];

export default function HormonesCitiesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });

  // Create opacity transforms for each screenshot
  const screenshot0Opacity = useTransform(scrollYProgress, [0, 0.25, 0.4], [1, 1, 0]);
  const screenshot1Opacity = useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0, 1, 0]);
  const screenshot2Opacity = useTransform(scrollYProgress, [0.6, 0.75, 1], [0, 1, 1]);

  const screenshotOpacities = [screenshot0Opacity, screenshot1Opacity, screenshot2Opacity];

  // Create indicator dot opacities
  const dot0Opacity = useTransform(scrollYProgress, [0, 0.25, 0.4], [1, 1, 0.3]);
  const dot1Opacity = useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0.3, 1, 0.3]);
  const dot2Opacity = useTransform(scrollYProgress, [0.6, 0.75, 1], [0.3, 1, 1]);

  const dotOpacities = [dot0Opacity, dot1Opacity, dot2Opacity];

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section - Extended for scroll-based screenshot rotation */}
        <section ref={heroRef} className="relative h-[300vh]">
          {/* Sticky container that stays in viewport while scrolling */}
          <div className="sticky top-20 h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
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

            <Container className="relative z-10 py-8 md:py-12 lg:py-20">
              <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-16 items-center">
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-6"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-sm font-medium">Anonymous Urban Wellbeing Survey</span>
                </motion.div>

                <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-light tracking-tight leading-[1.1]">
                  <GradientText className="font-semibold">Hormones & Cities</GradientText>
                  <br />
                  Understanding Urban Life
                </h1>

                <p className="mt-6 text-lg md:text-xl text-muted-foreground font-normal">
                  A modern, transparent, anonymous survey platform revealing how cities shape our
                  feelings and behaviors. Building happier, more sustainable communities through
                  data-driven insights.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
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
                  className="mt-16 flex items-center gap-6 text-sm text-muted-foreground"
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

              {/* Right: Phone Mockup with Scroll-based Screenshot Rotation */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative flex justify-center items-center"
              >
                <div className="relative w-[220px] sm:w-[260px] lg:w-[300px]">
                  {/* Phone Frame */}
                  <div className="relative w-full aspect-[9/19.5] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-foreground/10 bg-background">
                    {/* Rotating Screenshots */}
                    {screenshots.map((screenshot, index) => (
                      <motion.div
                        key={screenshot.src}
                        className="absolute inset-0"
                        style={{
                          opacity: screenshotOpacities[index],
                        }}
                      >
                        <div
                          className="w-full h-full relative"
                          style={
                            screenshot.hasFade
                              ? {
                                  maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                                  WebkitMaskImage:
                                    'linear-gradient(to bottom, black 60%, transparent 100%)',
                                }
                              : {}
                          }
                        >
                          <Image
                            src={screenshot.src}
                            alt={screenshot.alt}
                            width={screenshot.width}
                            height={screenshot.height}
                            className="w-full h-auto object-cover object-top"
                            priority={index === 0}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Scroll Indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center text-xs text-muted-foreground"
                  >
                    <div className="flex gap-1.5 mb-2 justify-center">
                      {screenshots.map((_, index) => (
                        <motion.div
                          key={index}
                          className="w-1.5 h-1.5 rounded-full bg-secondary"
                          style={{
                            opacity: dotOpacities[index],
                          }}
                        />
                      ))}
                    </div>
                    Scroll to explore
                  </motion.div>
                </div>
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
              {[
                {
                  icon: Eye,
                  title: 'Detect Patterns',
                  description:
                    'Identify patterns not yet detected in cities and people\'s lives through analytics, data, AI, and science.',
                  color: 'text-secondary',
                },
                {
                  icon: Brain,
                  title: 'Understand Behavior',
                  description:
                    'Once patterns are clear, we understand behavior and create tailored solutions for happier lives without relying on capitalism.',
                  color: 'text-secondary',
                },
                {
                  icon: Users,
                  title: 'Build Communities',
                  description:
                    'Create resilient, sustainable, and happier communities in urban ecosystems that communicate and complement each other.',
                  color: 'text-secondary',
                },
              ].map((item, index) => (
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
              {[
                {
                  icon: Home,
                  name: 'Housing & Livability',
                  desc: 'Access to essentials, infrastructure quality',
                },
                {
                  icon: Smile,
                  name: 'Well-being & Mood',
                  desc: 'Emotional health, stress levels, happiness',
                },
                {
                  icon: Users,
                  name: 'Community Connection',
                  desc: 'Social bonds, safety perception, belonging',
                },
                {
                  icon: Globe,
                  name: 'Environmental Factors',
                  desc: 'Air quality, noise, green spaces, light',
                },
              ].map((category, index) => (
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
                          {['Water Quality', 'Power Reliability', 'Weather & Air Quality', 'Food Access'].map(
                            (metric) => (
                              <Badge key={metric} variant="secondary">
                                {metric}
                              </Badge>
                            )
                          )}
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
                          {[
                            'Schools',
                            'Hospitals',
                            'Public Transport',
                            'Distance from Sewage',
                            'Distance from Power Stations',
                            'Distance from Waste Points',
                            'Accessibility (POD)',
                          ].map((metric) => (
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
                          {[
                            'Sun Exposure',
                            'Green Areas',
                            'Light Pollution',
                            'Tap Water Safety',
                            'Building Density',
                          ].map((metric) => (
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
                        {[
                          'Stress Levels',
                          'Safety Perception',
                          'Social Connection',
                          'Work-Life Balance',
                          'Happiness Index',
                          'Community Support',
                          'Mental Health Access',
                          'Recreational Facilities',
                        ].map((metric) => (
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
                        {[
                          'Climate Adaptability',
                          'Economic Stability',
                          'Infrastructure Robustness',
                          'Resource Efficiency',
                          'Emergency Preparedness',
                          'Community Cohesion',
                          'Disaster Recovery',
                        ].map((metric) => (
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
              {[
                {
                  icon: Lock,
                  title: '100% Anonymous',
                  description:
                    'No personally identifiable information collected. All responses are completely anonymous and cannot be traced back to individuals.',
                },
                {
                  icon: Shield,
                  title: 'Open & Transparent',
                  description:
                    'All methods, analytics, and aggregated data are open and transparent. We use synthetic data for prototypes and invite partners to contribute real data.',
                },
                {
                  icon: BarChart3,
                  title: 'Aggregated Insights',
                  description:
                    'Individual responses are aggregated to detect patterns and trends. Insights are shared publicly to benefit communities, researchers, and policymakers.',
                },
                {
                  icon: MessageCircle,
                  title: 'Community-Driven',
                  description:
                    'Survey questions and categories evolve based on community needs. Your feedback shapes how we understand and improve urban life.',
                },
              ].map((item, index) => (
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
                      <li className="flex items-start gap-3">
                        <div className="mt-1 p-1 rounded-full bg-secondary/20 flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-secondary" />
                        </div>
                        <span>
                          <strong>Cost of Living Transparency:</strong> Understanding happiness with
                          facilities relative to monthly costs in different areas
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 p-1 rounded-full bg-secondary/20 flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-secondary" />
                        </div>
                        <span>
                          <strong>Removing Purchase Guilt:</strong> Help people feel content without
                          the pressure to spend money to be happy in cities
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 p-1 rounded-full bg-secondary/20 flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-secondary" />
                        </div>
                        <span>
                          <strong>Education & Contentment:</strong> Educating people to be happy with
                          what they already have, focusing on sustainable practices
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 p-1 rounded-full bg-secondary/20 flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-secondary" />
                        </div>
                        <span>
                          <strong>Data-Driven Change:</strong> Using open sensor data to build urban
                          ecosystems that are resilient, sustainable, and genuinely happier
                        </span>
                      </li>
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
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-secondary/20">
                      <div className="h-2 w-2 rounded-full bg-secondary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Mobile-First Design</div>
                      <div className="text-sm text-muted-foreground">
                        Beautiful, intuitive interface inspired by modern design principles
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-secondary/20">
                      <div className="h-2 w-2 rounded-full bg-secondary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Quick Surveys</div>
                      <div className="text-sm text-muted-foreground">
                        Short, focused questions that respect your time
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-secondary/20">
                      <div className="h-2 w-2 rounded-full bg-secondary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Personal Insights</div>
                      <div className="text-sm text-muted-foreground">
                        See how your experiences compare to city-wide trends
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-secondary/20">
                      <div className="h-2 w-2 rounded-full bg-secondary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Public Impact</div>
                      <div className="text-sm text-muted-foreground">
                        Contribute to open data that helps improve urban life for everyone
                      </div>
                    </div>
                  </div>
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

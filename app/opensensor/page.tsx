'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Sun,
  Activity,
  Database,
  Github,
  ExternalLink,
  Wifi,
  HardDrive,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function OpenSensorPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden pt-20 md:min-h-[80dvh] md:pt-24">
          <div className="from-primary/5 via-background to-primary/10 absolute inset-0 bg-gradient-to-br" />

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

          <Container className="relative z-10 py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
              >
                <Cloud className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Cloud-Native Environmental Monitoring
                </span>
              </motion.div>

              <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.1] font-light tracking-tight">
                <GradientText className="font-semibold">
                  OpenSensor.Space
                </GradientText>
                <br />
                Weather Station Network
              </h1>

              <p className="text-muted-foreground mt-6 max-w-2xl text-lg font-normal md:text-xl">
                A community-driven network of DIY weather stations streaming
                real-time environmental data to the cloud. Built with Raspberry
                Pi, open data formats, and edge computing.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="group" asChild>
                  <Link
                    href="https://opensensor.space/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Explore Live Dashboard
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link
                    href="https://github.com/walkthru-earth/opensensor-space"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Dashboard Code
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link
                    href="https://github.com/walkthru-earth/opensensor-space-edge"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Edge Code
                  </Link>
                </Button>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="text-muted-foreground mt-16 flex items-center gap-8 text-sm"
              >
                <div>
                  <div className="text-foreground text-2xl font-semibold">
                    178K+
                  </div>
                  <div>Data Points</div>
                </div>
                <div className="bg-border h-8 w-px" />
                <div>
                  <div className="text-foreground text-2xl font-semibold">
                    16+
                  </div>
                  <div>Sensors</div>
                </div>
                <div className="bg-border h-8 w-px" />
                <div>
                  <div className="text-foreground text-2xl font-semibold">
                    Open
                  </div>
                  <div>Source & Data</div>
                </div>
              </motion.div>
            </motion.div>
          </Container>
        </section>

        {/* Sensors Section */}
        <section className="py-24">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="text-5xl font-light tracking-tight md:text-6xl lg:text-7xl">
                Environmental{' '}
                <span className="text-primary font-medium">
                  Sensor Capabilities
                </span>
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed md:text-2xl">
                Comprehensive monitoring with the Pimoroni Enviro+ sensor pack
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
              {[
                {
                  icon: Thermometer,
                  name: 'Temperature',
                  desc: 'Ambient & raw temp',
                },
                { icon: Gauge, name: 'Pressure', desc: 'Atmospheric pressure' },
                {
                  icon: Droplets,
                  name: 'Humidity',
                  desc: 'Relative humidity %',
                },
                {
                  icon: Wind,
                  name: 'Gas Sensors',
                  desc: 'Oxidised, reducing, NH3',
                },
                {
                  icon: Sun,
                  name: 'Light (Lux)',
                  desc: 'Ambient light levels',
                },
                { icon: Activity, name: 'Proximity', desc: 'Object detection' },
                {
                  icon: Cloud,
                  name: 'Particulate Matter',
                  desc: 'PM1.0, PM2.5, PM10',
                },
                {
                  icon: Database,
                  name: 'Particle Count',
                  desc: 'Size distribution data',
                },
              ].map((sensor, index) => (
                <motion.div
                  key={sensor.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="bg-primary/10 mb-3 w-fit rounded-lg p-3">
                        <sensor.icon className="text-primary h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl md:text-2xl">
                        {sensor.name}
                      </CardTitle>
                      <CardDescription>{sensor.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* How It Works Section */}
        <section className="bg-muted/30 py-24">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="text-5xl font-light tracking-tight md:text-6xl lg:text-7xl">
                How It <span className="text-primary font-medium">Works</span>
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed md:text-2xl">
                Edge cloud-native architecture for efficient, resilient data
                collection
              </p>
            </motion.div>

            <div className="mb-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Wifi,
                  title: 'Edge Collection',
                  description:
                    'Raspberry Pi Zero W collects sensor data at 1-second intervals. Runs autonomously, even offline.',
                },
                {
                  icon: HardDrive,
                  title: 'Cloud Storage',
                  description:
                    'Data streams directly to S3-compatible storage in Parquet format. No intermediate database needed.',
                },
                {
                  icon: Zap,
                  title: 'Real-Time Analysis',
                  description:
                    'Query data directly in browser using DuckDB. Evidence.dev dashboards update automatically.',
                },
              ].map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="bg-primary/10 mb-3 w-fit rounded-lg p-3">
                        <step.icon className="text-primary h-6 w-6" />
                      </div>
                      <CardTitle>{step.title}</CardTitle>
                      <CardDescription className="text-base">
                        {step.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="border-primary/20 border-2">
              <CardHeader>
                <CardTitle>Cloud-Native Benefits</CardTitle>
                <CardDescription>Why this architecture matters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    'Energy efficient - minimal hardware requirements',
                    'Cost effective - no servers to maintain',
                    'Scalable - easily add more sensors or locations',
                    'Open - data in standard formats accessible to many tools',
                    'Resilient - works offline, syncs when reconnected',
                    'Transparent - all code and data publicly available',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <div className="bg-primary/20 mt-1 rounded-full p-1">
                        <div className="bg-primary h-2 w-2 rounded-full" />
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Container>
        </section>

        {/* Hardware Requirements Section */}
        <section className="py-24">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="text-5xl font-light tracking-tight md:text-6xl lg:text-7xl">
                Required{' '}
                <span className="text-primary font-medium">Hardware</span>
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed md:text-2xl">
                Everything you need to build your own weather station
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'Raspberry Pi Zero 2 W',
                  desc: 'The brain of your weather station with WiFi',
                  required: true,
                },
                {
                  name: 'Enviro+ Air Quality',
                  desc: 'Main sensor package with temp, humidity, pressure, gas, and light sensors',
                  required: true,
                },
                {
                  name: 'PMS5003 Sensor',
                  desc: 'Particulate matter sensor for air quality monitoring',
                  required: true,
                },
                {
                  name: 'microSD Card (8GB+)',
                  desc: 'Storage for Raspberry Pi OS',
                  required: true,
                },
                {
                  name: 'Power Supply',
                  desc: 'Micro USB power supply for Pi Zero',
                  required: true,
                },
                {
                  name: 'GPS Module',
                  desc: 'Optional: For mobile installations and location tracking',
                  required: false,
                },
              ].map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="mb-2 flex items-start justify-between">
                        <CardTitle className="text-xl md:text-2xl">
                          {item.name}
                        </CardTitle>
                        <Badge
                          variant={item.required ? 'default' : 'secondary'}
                        >
                          {item.required ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                      <CardDescription>{item.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Join Network CTA */}
        <section className="from-primary/5 to-primary/10 bg-gradient-to-br py-24">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl text-center"
            >
              <h2 className="mb-6 text-5xl font-light tracking-tight md:text-6xl lg:text-7xl">
                Join the{' '}
                <GradientText className="font-semibold">
                  Weather Station Network
                </GradientText>
              </h2>
              <p className="text-muted-foreground mb-10 text-lg">
                Build your own station and contribute to open environmental
                data. We welcome contributions from anyone interested in
                monitoring urban ecosystems.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" className="group" asChild>
                  <Link
                    href="https://opensensor.space/join-network/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join the Network
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link
                    href="https://opensensor.space/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Explore Dashboard
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="bg-card mt-12 rounded-lg border p-6">
                <h3 className="mb-4 text-xl font-medium">
                  Contributing to the Network
                </h3>
                <div className="grid gap-4 text-left md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 mt-1 rounded-full p-1">
                      <div className="bg-primary h-2 w-2 rounded-full" />
                    </div>
                    <div>
                      <div className="mb-1 text-sm font-medium">
                        Build Your Station
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Follow setup instructions and configure your hardware
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 mt-1 rounded-full p-1">
                      <div className="bg-primary h-2 w-2 rounded-full" />
                    </div>
                    <div>
                      <div className="mb-1 text-sm font-medium">
                        Choose Storage
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Use Source Cooperative or your own S3-compatible storage
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 mt-1 rounded-full p-1">
                      <div className="bg-primary h-2 w-2 rounded-full" />
                    </div>
                    <div>
                      <div className="mb-1 text-sm font-medium">
                        Submit a PR
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Add your station ID, location, and storage URL
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 mt-1 rounded-full p-1">
                      <div className="bg-primary h-2 w-2 rounded-full" />
                    </div>
                    <div>
                      <div className="mb-1 text-sm font-medium">
                        Share Insights
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Contribute dashboard improvements or custom
                        visualizations
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

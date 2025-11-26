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
  Server,
  Leaf,
  Globe,
  Lock,
  Layers,
  Cpu,
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
                  Cloud-Native IoT Infrastructure
                </span>
              </motion.div>

              <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.1] font-light tracking-tight">
                <GradientText className="font-semibold">
                  OpenSensor.Space
                </GradientText>
                <br />
                IoT Sensor Network
              </h1>

              <p className="text-muted-foreground mt-6 max-w-2xl text-lg font-normal md:text-xl">
                Connecting IoT sensors and delivering near real-time
                environmental data to the cloud with minimum carbon footprint.
                Scalable from a single sensor to millions of devices.
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
                    href="https://github.com/walkthru-earth/opensensor-enviroplus"
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
                    1.3M+
                  </div>
                  <div>Data Points</div>
                </div>
                <div className="bg-border h-8 w-px" />
                <div>
                  <div className="text-foreground text-2xl font-semibold">
                    6+
                  </div>
                  <div>Sensor Types</div>
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

        {/* Platform Benefits Section */}
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
                Platform{' '}
                <span className="text-primary font-medium">Benefits</span>
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed md:text-2xl">
                Enterprise-grade IoT infrastructure with minimal environmental
                impact
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Leaf,
                  name: 'Low Carbon Footprint',
                  desc: 'Optimized for energy efficiency with minimal server infrastructure',
                },
                {
                  icon: Globe,
                  name: 'Scalable Architecture',
                  desc: 'From a single sensor to millions of devices worldwide',
                },
                {
                  icon: Lock,
                  name: 'Open Source & Transparent',
                  desc: 'Full visibility into code, data formats, and infrastructure',
                },
                {
                  icon: Layers,
                  name: 'Hardware agnostic',
                  desc: 'Works with any Python-capable device (Raspberry Pi, NVIDIA Jetson, ASUS Tinker Board, etc.)',
                },
                {
                  icon: Database,
                  name: 'Standard Data Formats',
                  desc: 'Parquet files compatible with any analytics tool',
                },
                {
                  icon: Zap,
                  name: 'Near Real-Time Processing',
                  desc: 'Query millions of records directly in the browser',
                },
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="bg-primary/10 mb-3 w-fit rounded-lg p-3">
                        <benefit.icon className="text-primary h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl md:text-2xl">
                        {benefit.name}
                      </CardTitle>
                      <CardDescription>{benefit.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Supported Sensors Section */}
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
                Supported{' '}
                <span className="text-primary font-medium">Sensors</span>
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed md:text-2xl">
                Connect any IoT sensor to the cloud with our flexible platform
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
              {[
                {
                  icon: Thermometer,
                  name: 'Temperature',
                  desc: 'Ambient & industrial sensors',
                },
                {
                  icon: Gauge,
                  name: 'Pressure',
                  desc: 'Atmospheric & process',
                },
                {
                  icon: Droplets,
                  name: 'Humidity',
                  desc: 'Environmental monitoring',
                },
                {
                  icon: Wind,
                  name: 'Gas Sensors',
                  desc: 'Air quality & emissions',
                },
                {
                  icon: Sun,
                  name: 'Light (Lux)',
                  desc: 'Solar & ambient light',
                },
                { icon: Activity, name: 'Motion', desc: 'Presence & activity' },
                {
                  icon: Cloud,
                  name: 'Particulate Matter',
                  desc: 'PM1.0, PM2.5, PM10',
                },
                {
                  icon: Cpu,
                  name: 'Custom Sensors',
                  desc: 'Any data stream',
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

        {/* Architecture Section */}
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
                Cloud-Native{' '}
                <span className="text-primary font-medium">Architecture</span>
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed md:text-2xl">
                Serverless infrastructure designed for efficiency and scale
              </p>
            </motion.div>

            <div className="mb-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Wifi,
                  title: 'Edge Collection',
                  description:
                    'IoT devices collect sensor data at configurable intervals. Works autonomously, even offline with local buffering.',
                },
                {
                  icon: HardDrive,
                  title: 'Cloud Storage',
                  description:
                    'Data streams directly to S3-compatible object storage in Parquet format. No intermediate database required.',
                },
                {
                  icon: Server,
                  title: 'Near Real-Time Analysis',
                  description:
                    'Query data directly in browser using DuckDB WebAssembly. Dashboards update automatically.',
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
                <CardTitle>Technical Advantages</CardTitle>
                <CardDescription>
                  Why organizations choose opensensor.space
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    'Energy efficient - minimal hardware requirements',
                    'Cost effective - no servers to maintain',
                    'Infinitely scalable - add sensors without infrastructure changes',
                    'Interoperable - standard data formats for any analytics tool',
                    'Resilient - offline operation with automatic sync',
                    'Transparent - open source code and public data',
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

        {/* Supported Devices Section */}
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
                Supported{' '}
                <span className="text-primary font-medium">Devices</span>
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed md:text-2xl">
                From prototypes to industrial deployments
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'BME280',
                  desc: 'Temperature, pressure, and humidity sensor',
                  badge: 'Implemented',
                },
                {
                  name: 'Gas Sensors',
                  desc: 'Oxidised, reducing, and NH3 gas detection',
                  badge: 'Implemented',
                },
                {
                  name: 'LTR559',
                  desc: 'Ambient light (lux) and proximity sensor',
                  badge: 'Implemented',
                },
                {
                  name: 'PMS5003',
                  desc: 'Particulate matter sensor (PM1, PM2.5, PM10)',
                  badge: 'Implemented',
                },
                {
                  name: 'GPS Module',
                  desc: 'Location tracking for mobile sensor installations',
                  badge: 'Roadmap',
                },
                {
                  name: 'LoRa / Radio (AIS)',
                  desc: 'Long-range wireless and radio signal reception',
                  badge: 'Roadmap',
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
                        {item.badge === 'Implemented' ? (
                          <motion.div
                            initial={{ backgroundColor: 'rgb(234 179 8)' }}
                            whileInView={{ backgroundColor: 'rgb(34 197 94)' }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 1.5,
                              delay: 0.5 + index * 0.1,
                            }}
                            className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                          >
                            {item.badge}
                          </motion.div>
                        ) : (
                          <Badge variant="secondary">{item.badge}</Badge>
                        )}
                      </div>
                      <CardDescription>{item.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Technology Stack Section */}
        <section className="py-16">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <p className="text-muted-foreground mb-8 text-sm font-medium tracking-wider uppercase">
                Powered by
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                {[
                  {
                    name: 'Cloud-Native Geo',
                    logoLight: '/logos/cloud-native-geo.png',
                    logoDark: '/logos/cloud-native-geo.png',
                    url: 'https://cloudnativegeo.org/',
                    invertLight: true,
                  },
                  {
                    name: 'Apache Parquet',
                    logoLight: '/logos/apache-parquet.png',
                    logoDark: '/logos/apache-parquet.png',
                    url: 'https://parquet.apache.org/',
                    invertLight: false,
                  },
                  {
                    name: 'DuckDB',
                    logoLight: '/logos/duckdb-light.svg',
                    logoDark: '/logos/duckdb-dark.svg',
                    url: 'https://duckdb.org/',
                    invertLight: false,
                  },
                  {
                    name: 'Polars',
                    logoLight: '/logos/polars.png',
                    logoDark: '/logos/polars.png',
                    url: 'https://pola.rs/',
                    invertLight: false,
                    invertDark: true,
                  },
                  {
                    name: 'Source Cooperative',
                    logoLight: '/logos/source-coop-light.svg',
                    logoDark: '/logos/source-coop-dark.svg',
                    url: 'https://source.coop/',
                    invertLight: false,
                  },
                ].map((tech, index) => (
                  <motion.a
                    key={tech.name}
                    href={tech.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="grayscale transition-all hover:grayscale-0"
                    title={tech.name}
                  >
                    {/* Light theme logo */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tech.logoLight}
                      alt={tech.name}
                      data-no-filter
                      className={`h-10 w-auto object-contain opacity-80 transition-all hover:opacity-100 md:h-14 ${tech.invertLight ? 'invert hover:invert-0' : ''}`}
                      style={{ display: 'var(--light-display, block)' }}
                    />
                    {/* Dark theme logo */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tech.logoDark}
                      alt={tech.name}
                      data-no-filter
                      className={`h-10 w-auto object-contain opacity-60 transition-all hover:opacity-100 md:h-14 ${'invertDark' in tech && tech.invertDark ? 'invert hover:invert-0' : ''}`}
                      style={{ display: 'var(--dark-display, none)' }}
                    />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </Container>
        </section>

        {/* CTA Section */}
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
                Connect Your{' '}
                <GradientText className="font-semibold">
                  Sensors to the Cloud
                </GradientText>
              </h2>
              <p className="text-muted-foreground mb-10 text-lg">
                Start collecting sensor data with our open-source platform.
                Contribute to the growing network of environmental monitoring
                stations worldwide.
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
                <h3 className="mb-4 text-xl font-medium">Getting Started</h3>
                <div className="grid gap-4 text-left md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 mt-1 rounded-full p-1">
                      <div className="bg-primary h-2 w-2 rounded-full" />
                    </div>
                    <div>
                      <div className="mb-1 text-sm font-medium">
                        Deploy Edge Software
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Install the edge client on your IoT device
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 mt-1 rounded-full p-1">
                      <div className="bg-primary h-2 w-2 rounded-full" />
                    </div>
                    <div>
                      <div className="mb-1 text-sm font-medium">
                        Configure Storage
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
                        Register Your Station
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Submit a PR with your station ID and location
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 mt-1 rounded-full p-1">
                      <div className="bg-primary h-2 w-2 rounded-full" />
                    </div>
                    <div>
                      <div className="mb-1 text-sm font-medium">
                        Start Streaming
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Your data appears on the public dashboard automatically
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

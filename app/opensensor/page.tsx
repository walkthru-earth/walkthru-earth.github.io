'use client';

import { motion } from 'framer-motion';
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
import Image from 'next/image';

export default function OpenSensorPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />

          <motion.div
            className="absolute top-1/4 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
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

          <Container className="relative z-10">
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
              >
                <Cloud className="h-4 w-4" />
                <span className="text-sm font-medium">Cloud-Native Environmental Monitoring</span>
              </motion.div>

              <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-light tracking-tight leading-[1.1]">
                <GradientText className="font-semibold">OpenSensor.Earth</GradientText>
                <br />
                Weather Station Network
              </h1>

              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl font-normal">
                A community-driven network of DIY weather stations streaming real-time environmental
                data to the cloud. Built with Raspberry Pi, open data formats, and edge computing.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="group" asChild>
                  <Link
                    href="https://source.coop/youssef-harby/weather-station-realtime-parquet"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Live Data
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link
                    href="https://github.com/youssef-harby/parquet-edge"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                  </Link>
                </Button>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="mt-16 flex items-center gap-8 text-sm text-muted-foreground"
              >
                <div>
                  <div className="text-2xl font-semibold text-foreground">178K+</div>
                  <div>Data Points</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <div className="text-2xl font-semibold text-foreground">16+</div>
                  <div>Sensors</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <div className="text-2xl font-semibold text-foreground">Open</div>
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
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
                Environmental{' '}
                <span className="text-primary font-medium">Sensor Capabilities</span>
              </h2>
              <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed mx-auto">
                Comprehensive monitoring with the Pimoroni Enviro+ sensor pack
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { icon: Thermometer, name: 'Temperature', desc: 'Ambient & raw temp' },
                { icon: Gauge, name: 'Pressure', desc: 'Atmospheric pressure' },
                { icon: Droplets, name: 'Humidity', desc: 'Relative humidity %' },
                { icon: Wind, name: 'Gas Sensors', desc: 'Oxidised, reducing, NH3' },
                { icon: Sun, name: 'Light (Lux)', desc: 'Ambient light levels' },
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
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="p-3 rounded-lg bg-primary/10 w-fit mb-3">
                        <sensor.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl md:text-2xl">{sensor.name}</CardTitle>
                      <CardDescription>{sensor.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* How It Works Section */}
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
                How It <span className="text-primary font-medium">Works</span>
              </h2>
              <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed mx-auto">
                Edge cloud-native architecture for efficient, resilient data collection
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
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
                      <div className="p-3 rounded-lg bg-primary/10 w-fit mb-3">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{step.title}</CardTitle>
                      <CardDescription className="text-base">{step.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Cloud-Native Benefits</CardTitle>
                <CardDescription>Why this architecture matters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Energy efficient - minimal hardware requirements',
                    'Cost effective - no servers to maintain',
                    'Scalable - easily add more sensors or locations',
                    'Open - data in standard formats accessible to many tools',
                    'Resilient - works offline, syncs when reconnected',
                    'Transparent - all code and data publicly available',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <div className="mt-1 p-1 rounded-full bg-primary/20">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{benefit}</span>
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
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
                Required <span className="text-primary font-medium">Hardware</span>
              </h2>
              <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed mx-auto">
                Everything you need to build your own weather station
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl md:text-2xl">{item.name}</CardTitle>
                        <Badge variant={item.required ? 'default' : 'secondary'}>
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
        <section className="py-24 bg-gradient-to-br from-primary/5 to-primary/10">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6">
                Join the <GradientText className="font-semibold">Weather Station Network</GradientText>
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Build your own station and contribute to open environmental data. We welcome
                contributions from anyone interested in monitoring urban ecosystems.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="group" asChild>
                  <Link
                    href="https://github.com/youssef-harby/parquet-edge"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Setup Instructions
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link
                    href="https://source.coop/youssef-harby/weather-station-realtime-parquet"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Network Data
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-12 p-6 bg-card rounded-lg border">
                <h3 className="text-xl font-medium mb-4">Contributing to the Network</h3>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-primary/20">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Build Your Station</div>
                      <div className="text-sm text-muted-foreground">
                        Follow setup instructions and configure your hardware
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-primary/20">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Choose Storage</div>
                      <div className="text-sm text-muted-foreground">
                        Use Source Cooperative or your own S3-compatible storage
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-primary/20">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Submit a PR</div>
                      <div className="text-sm text-muted-foreground">
                        Add your station ID, location, and storage URL
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-primary/20">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Share Insights</div>
                      <div className="text-sm text-muted-foreground">
                        Contribute dashboard improvements or custom visualizations
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

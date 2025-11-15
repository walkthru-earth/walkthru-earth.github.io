'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:to-secondary/10" />

      {/* Animated gradient orbs */}
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
      <motion.div
        className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
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

      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">
              People-First Urban Intelligence
            </span>
          </motion.div>

          <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-light tracking-tight leading-[1.1]">
            Cities Shape Us
            <br />
            <GradientText className="font-semibold">
              More Than We Realize
            </GradientText>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl font-normal">
            We detect invisible patterns in urban life, transforming data into
            insights for resilient, happier communities.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="group" asChild>
              <Link href="#patterns">
                Discover Patterns
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#vision">Our Vision</Link>
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-16 flex items-center gap-8 text-sm text-muted-foreground"
          >
            <div>
              <div className="text-2xl font-semibold text-foreground">10+</div>
              <div>Indices Tracked</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-2xl font-semibold text-foreground">50+</div>
              <div>Metrics Analyzed</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-2xl font-semibold text-foreground">∞</div>
              <div>Communities Served</div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

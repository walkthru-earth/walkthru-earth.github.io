'use client';

import { motion } from 'framer-motion';
import Script from 'next/script';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function CTA() {
  return (
    <Section id="contact" className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="from-primary/10 via-background to-secondary/10 dark:from-primary/5 dark:to-secondary/5 absolute inset-0 bg-gradient-to-br" />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="mb-8 text-5xl font-light tracking-tight md:text-6xl lg:text-7xl">
            Ready to Transform{' '}
            <span className="text-primary font-medium">Your City?</span>
          </h2>
          <p className="text-muted-foreground mb-12 text-xl leading-relaxed md:text-2xl">
            Join us in building more livable, sustainable, and happier
            communities through data-driven insights.
          </p>

          <div className="mb-12 flex justify-center">
            <Button size="lg" className="group gap-2 px-8 py-6 text-lg" asChild>
              <Link
                href="https://source.coop/walkthru-earth"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Image
                  src="/source-coop-logo.png"
                  alt="Source Cooperative"
                  width={28}
                  height={28}
                  className="rounded-sm"
                />
                Explore Your Data
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Lark Scheduler */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card mb-12 overflow-hidden rounded-xl border shadow-lg"
          >
            <div
              className="scheduler-inline-widget"
              data-url="https://walkthru-earth.jp.larksuite.com/scheduler/embed/ae837d878cc4d6b4?hideEventDetail=true"
              style={{ width: '100%', height: '626px' }}
            />
            <Script
              src="https://walkthru-earth.jp.larksuite.com/scheduler/embed/scheduler-widget.js"
              strategy="lazyOnload"
            />
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  );
}

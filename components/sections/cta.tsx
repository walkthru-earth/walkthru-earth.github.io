'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { Button } from '@/components/ui/button';
import { ArrowRight, Github, Linkedin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function CTA() {
  return (
    <Section id="contact" className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-primary/5 dark:to-secondary/5" />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
            Ready to Transform{' '}
            <span className="text-primary font-medium">Your City?</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Join us in building more livable, sustainable, and happier
            communities through data-driven insights.
          </p>

          <div className="flex justify-center mb-12">
            <Button size="lg" className="group gap-2" asChild>
              <Link
                href="https://source.coop/walkthru"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Image
                  src="/source-coop-logo.png"
                  alt="Source Cooperative"
                  width={24}
                  height={24}
                  className="rounded-sm"
                />
                Explore Your Data
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="flex justify-center gap-6">
            <a
              href="https://github.com/walkthru-earth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-6 w-6" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/company/walkthru-earth/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="h-6 w-6" />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}

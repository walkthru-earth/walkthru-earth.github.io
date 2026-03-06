'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { Card } from '@/components/ui/card';
import { Target, Heart, Globe, Lightbulb } from 'lucide-react';

const visionPoints = [
  {
    icon: Target,
    title: 'Our Mission',
    description:
      'To reveal the hidden patterns shaping daily life and turn them into people-first solutions that support wellbeing in cities everywhere.',
  },
  {
    icon: Heart,
    title: 'People-First',
    description:
      'We believe in designing cities that prioritize human happiness, health, and connection over mere efficiency and growth.',
  },
  {
    icon: Globe,
    title: 'Global Impact',
    description:
      'Working with communities, governments, and organizations worldwide to create more livable, sustainable urban environments.',
  },
  {
    icon: Lightbulb,
    title: 'Data-Driven Insights',
    description:
      'Combining open data, sensor networks, and scientific research to uncover patterns that transform how we build and experience cities.',
  },
];

export function Vision() {
  return (
    <Section id="vision" className="bg-muted/50">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <h2 className="text-5xl font-light tracking-tight md:text-6xl lg:text-7xl">
            Our <span className="text-primary font-medium">Vision</span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-6 max-w-4xl text-xl leading-relaxed md:text-2xl">
            Building a new kind of index for cities, measuring not just cost of
            living, but stress, safety, connection, and the ease of everyday
            life
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {visionPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full p-8 transition-shadow hover:shadow-lg">
                <point.icon className="text-primary mb-6 h-12 w-12" />
                <h3 className="mb-3 text-2xl font-semibold md:text-3xl">
                  {point.title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {point.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <blockquote className="text-foreground/80 mx-auto max-w-5xl text-3xl leading-relaxed font-light italic md:text-4xl lg:text-5xl">
            "Help urban communities become more resilient, sustainable, and
            genuinely happier, using data to support lives, not the other way
            around."
          </blockquote>
        </motion.div>
      </Container>
    </Section>
  );
}

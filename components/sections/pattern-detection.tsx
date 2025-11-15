'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { Card } from '@/components/ui/card';
import { Activity, MapPin, Users, TrendingUp } from 'lucide-react';

const patterns = [
  {
    icon: Activity,
    title: 'Behavior Analytics',
    description:
      'Understanding how urban design influences daily routines, stress levels, and wellbeing.',
  },
  {
    icon: MapPin,
    title: 'Spatial Patterns',
    description:
      'Mapping relationships between infrastructure, services, and quality of life.',
  },
  {
    icon: Users,
    title: 'Community Dynamics',
    description:
      'Detecting social cohesion, accessibility, and equity across neighborhoods.',
  },
  {
    icon: TrendingUp,
    title: 'Resilience Indicators',
    description:
      'Tracking sustainability, adaptability, and long-term urban health metrics.',
  },
];

export function PatternDetection() {
  return (
    <Section id="patterns" className="bg-muted/50">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light tracking-tight">
            Detecting the{' '}
            <span className="text-primary font-medium">Invisible</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Patterns that shape daily life, hidden in plain sight
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patterns.map((pattern, index) => (
            <motion.div
              key={pattern.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <pattern.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{pattern.title}</h3>
                <p className="text-muted-foreground">{pattern.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

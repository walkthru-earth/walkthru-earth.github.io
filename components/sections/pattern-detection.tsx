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
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
            Detecting the{' '}
            <span className="text-primary font-medium">Invisible</span>
          </h2>
          <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Patterns that shape daily life, hidden in plain sight
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {patterns.map((pattern, index) => (
            <motion.div
              key={pattern.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-8 h-full hover:shadow-lg transition-shadow">
                <pattern.icon className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-2xl md:text-3xl font-semibold mb-3">{pattern.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">{pattern.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

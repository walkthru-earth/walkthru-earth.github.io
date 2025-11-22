'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Cloud, Heart } from 'lucide-react';
import Link from 'next/link';

const initiatives = [
  {
    id: 'opensensor',
    name: 'OpenSensor.Space',
    tagline: 'Cloud-Native Weather Station Network',
    description:
      'Building an open network of DIY weather stations that stream environmental data directly to the cloud. Track temperature, humidity, air quality, and more in real-time.',
    icon: Cloud,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    highlights: [
      'Real-time environmental data',
      'Open Parquet format',
      'Community-driven network',
      'Edge cloud-native',
    ],
    link: '/opensensor',
    status: 'Active',
  },
  {
    id: 'hormones-cities',
    name: 'Hormones & Cities',
    tagline: 'Anonymous Urban Wellbeing Survey',
    description:
      'Understanding how cities affect our feelings and behaviors through anonymous surveys. Detecting patterns in urban life to create tailored solutions for happier, more sustainable communities.',
    icon: Heart,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    highlights: [
      'Anonymous feedback',
      'Pattern detection',
      'Behavioral insights',
      'Community wellbeing',
    ],
    link: '/hormones-cities',
    status: 'In Development',
  },
];

export function Initiatives() {
  return (
    <Section id="initiatives" className="bg-muted/30">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <h2 className="text-5xl font-light tracking-tight md:text-6xl lg:text-7xl">
            Our <span className="text-primary font-medium">Initiatives</span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed md:text-2xl">
            Building the infrastructure and tools to understand and improve
            urban life
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {initiatives.map((initiative, index) => {
            const Icon = initiative.icon;
            return (
              <motion.div
                key={initiative.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="hover:border-primary/50 h-full border-2 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`rounded-lg p-4 ${initiative.bgColor}`}>
                        <Icon className={`h-8 w-8 ${initiative.color}`} />
                      </div>
                      <Badge
                        variant={
                          initiative.status === 'Active'
                            ? 'default'
                            : 'secondary'
                        }
                        className="px-3 py-1 text-sm"
                      >
                        {initiative.status}
                      </Badge>
                    </div>
                    <CardTitle className="mb-2 text-3xl md:text-4xl">
                      {initiative.name}
                    </CardTitle>
                    <CardDescription className="text-lg font-medium md:text-xl">
                      {initiative.tagline}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                      {initiative.description}
                    </p>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {initiative.highlights.map((highlight) => (
                        <Badge key={highlight} variant="outline">
                          {highlight}
                        </Badge>
                      ))}
                    </div>

                    <Button asChild className="group w-full">
                      <Link href={initiative.link}>
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Cloud, Heart, Thermometer, Users } from 'lucide-react';
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
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
            Our <span className="text-primary font-medium">Initiatives</span>
          </h2>
          <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Building the infrastructure and tools to understand and improve urban life
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
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
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-4 rounded-lg ${initiative.bgColor}`}>
                        <Icon className={`h-8 w-8 ${initiative.color}`} />
                      </div>
                      <Badge variant={initiative.status === 'Active' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                        {initiative.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl md:text-4xl mb-2">{initiative.name}</CardTitle>
                    <CardDescription className="text-lg md:text-xl font-medium">
                      {initiative.tagline}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{initiative.description}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {initiative.highlights.map((highlight) => (
                        <Badge key={highlight} variant="outline">
                          {highlight}
                        </Badge>
                      ))}
                    </div>

                    <Button asChild className="w-full group">
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

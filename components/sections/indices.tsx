'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const indices = [
  {
    id: 'livability',
    name: 'Livability Index',
    description:
      'Comprehensive scoring based on access to essentials, environment, and infrastructure',
    metrics: [
      'Water Quality',
      'Power Reliability',
      'Air Quality',
      'Food Access',
      'Transportation',
      'Healthcare Proximity',
      'Education Access',
      'Green Spaces',
      'Light Pollution',
      'Sun Exposure',
    ],
  },
  {
    id: 'wellbeing',
    name: 'Wellbeing Score',
    description:
      'Emotional and psychological health indicators across neighborhoods',
    metrics: [
      'Stress Levels',
      'Safety Perception',
      'Social Connection',
      'Work-Life Balance',
      'Happiness Index',
      'Community Support',
      'Mental Health Access',
      'Recreational Facilities',
    ],
  },
  {
    id: 'resilience',
    name: 'Resilience Rating',
    description:
      'Capacity to adapt to changes and withstand environmental pressures',
    metrics: [
      'Climate Adaptability',
      'Economic Stability',
      'Infrastructure Robustness',
      'Resource Efficiency',
      'Emergency Preparedness',
      'Community Cohesion',
      'Disaster Recovery',
    ],
  },
];

export function Indices() {
  return (
    <Section id="indices">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light tracking-tight">
            Living <span className="text-primary font-medium">Indices</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Tracking what matters for thriving, sustainable communities
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="livability" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {indices.map((index) => (
                <TabsTrigger key={index.id} value={index.id}>
                  {index.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {indices.map((index) => (
              <TabsContent key={index.id} value={index.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{index.name}</CardTitle>
                    <CardDescription className="text-base">
                      {index.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {index.metrics.map((metric) => (
                        <Badge key={metric} variant="secondary">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </Container>
    </Section>
  );
}

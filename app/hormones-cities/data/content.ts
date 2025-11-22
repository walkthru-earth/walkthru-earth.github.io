import {
  Eye,
  Brain,
  Users,
  Home,
  Smile,
  Globe,
  Lock,
  Shield,
  BarChart3,
  MessageCircle,
} from 'lucide-react';

export const screenshots = [
  {
    src: '/hormones-cities-ai.png',
    alt: 'AI Chat Interface',
    width: 280,
    height: 600,
    hasFade: false,
  },
  {
    src: '/hormones-cities-dashboard.png',
    alt: 'City-Wide Trends Dashboard',
    width: 280,
    height: 1500,
    hasFade: true,
  },
  {
    src: '/hormones-cities-survey.png',
    alt: 'Survey Categories',
    width: 280,
    height: 1200,
    hasFade: true,
  },
];

export const visionCards = [
  {
    icon: Eye,
    title: 'Detect Patterns',
    description:
      "Identify patterns not yet detected in cities and people's lives through analytics, data, AI, and science.",
    color: 'text-secondary',
  },
  {
    icon: Brain,
    title: 'Understand Behavior',
    description:
      'Once patterns are clear, we understand behavior and create tailored solutions for happier lives without relying on capitalism.',
    color: 'text-secondary',
  },
  {
    icon: Users,
    title: 'Build Communities',
    description:
      'Create resilient, sustainable, and happier communities in urban ecosystems that communicate and complement each other.',
    color: 'text-secondary',
  },
];

export const surveyCategories = [
  {
    icon: Home,
    name: 'Housing & Livability',
    desc: 'Access to essentials, infrastructure quality',
  },
  {
    icon: Smile,
    name: 'Well-being & Mood',
    desc: 'Emotional health, stress levels, happiness',
  },
  {
    icon: Users,
    name: 'Community Connection',
    desc: 'Social bonds, safety perception, belonging',
  },
  {
    icon: Globe,
    name: 'Environmental Factors',
    desc: 'Air quality, noise, green spaces, light',
  },
];

export const privacyFeatures = [
  {
    icon: Lock,
    title: '100% Anonymous',
    description:
      'No personally identifiable information collected. All responses are completely anonymous and cannot be traced back to individuals.',
  },
  {
    icon: Shield,
    title: 'Open & Transparent',
    description:
      'All methods, analytics, and aggregated data are open and transparent. We use synthetic data for prototypes and invite partners to contribute real data.',
  },
  {
    icon: BarChart3,
    title: 'Aggregated Insights',
    description:
      'Individual responses are aggregated to detect patterns and trends. Insights are shared publicly to benefit communities, researchers, and policymakers.',
  },
  {
    icon: MessageCircle,
    title: 'Community-Driven',
    description:
      'Survey questions and categories evolve based on community needs. Your feedback shapes how we understand and improve urban life.',
  },
];

export const livabilityMetrics = {
  coreEssentials: ['Water Quality', 'Power Reliability', 'Weather & Air Quality', 'Food Access'],
  accessProximity: [
    'Schools',
    'Hospitals',
    'Public Transport',
    'Distance from Sewage',
    'Distance from Power Stations',
    'Distance from Waste Points',
    'Accessibility (POD)',
  ],
  environmental: [
    'Sun Exposure',
    'Green Areas',
    'Light Pollution',
    'Tap Water Safety',
    'Building Density',
  ],
};

export const wellbeingMetrics = [
  'Stress Levels',
  'Safety Perception',
  'Social Connection',
  'Work-Life Balance',
  'Happiness Index',
  'Community Support',
  'Mental Health Access',
  'Recreational Facilities',
];

export const resilienceMetrics = [
  'Climate Adaptability',
  'Economic Stability',
  'Infrastructure Robustness',
  'Resource Efficiency',
  'Emergency Preparedness',
  'Community Cohesion',
  'Disaster Recovery',
];

export const philosophyPoints = [
  {
    title: 'Cost of Living Transparency',
    description:
      'Understanding happiness with facilities relative to monthly costs in different areas',
  },
  {
    title: 'Removing Purchase Guilt',
    description: 'Help people feel content without the pressure to spend money to be happy in cities',
  },
  {
    title: 'Education & Contentment',
    description:
      'Educating people to be happy with what they already have, focusing on sustainable practices',
  },
  {
    title: 'Data-Driven Change',
    description:
      'Using open sensor data to build urban ecosystems that are resilient, sustainable, and genuinely happier',
  },
];

export const expectations = [
  {
    title: 'Mobile-First Design',
    description: 'Beautiful, intuitive interface inspired by modern design principles',
  },
  {
    title: 'Quick Surveys',
    description: 'Short, focused questions that respect your time',
  },
  {
    title: 'Personal Insights',
    description: 'See how your experiences compare to city-wide trends',
  },
  {
    title: 'Public Impact',
    description: 'Contribute to open data that helps improve urban life for everyone',
  },
];

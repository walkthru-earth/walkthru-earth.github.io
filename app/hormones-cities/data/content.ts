import {
  Heart,
  Globe,
  Lock,
  Shield,
  BarChart3,
  Cpu,
  Hexagon,
  Activity,
  Smartphone,
  Database,
  Home,
  MapPin,
  GraduationCap,
  Landmark,
  BadgeDollarSign,
  Users,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

/* ── Phone screenshots ───────────────────────────────────────────── */

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

/* ── Three pillars ───────────────────────────────────────────────── */

export interface Pillar {
  icon: LucideIcon;
  title: string;
  description: string;
  status: string;
}

export const pillars: Pillar[] = [
  {
    icon: Activity,
    title: 'OpenSensor.Space',
    description:
      'DIY stations measuring air, noise, temperature, and light in real time.',
    status: 'Live',
  },
  {
    icon: BarChart3,
    title: 'Livability Index',
    description:
      '50+ factors — food, water, schools, green space — scored per neighborhood.',
    status: 'In development',
  },
  {
    icon: Heart,
    title: 'Hormones & Cities',
    description:
      'Share wellbeing + mobility data anonymously, get back health insights for your neighborhood.',
    status: 'App ready',
  },
];

/* ── Data sources ────────────────────────────────────────────────── */

export interface DataSource {
  icon: LucideIcon;
  title: string;
  items: string[];
}

export const dataSources: DataSource[] = [
  {
    icon: Cpu,
    title: 'IoT sensors',
    items: ['PM2.5 & PM10', 'Temperature & humidity', 'Noise & light levels'],
  },
  {
    icon: Smartphone,
    title: 'Mobile app',
    items: [
      'Wellbeing + mobility data',
      'Offline-first, on-device processing',
      'Anonymous H3-aggregated sharing',
    ],
  },
  {
    icon: Database,
    title: 'Open data',
    items: [
      'LandScan population',
      'Overture Maps 64M+ POIs',
      'OSM infrastructure',
    ],
  },
];

/* ── Privacy ─────────────────────────────────────────────────────── */

export interface PrivacyPoint {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const privacyPoints: PrivacyPoint[] = [
  {
    icon: Cpu,
    title: 'Processed on-device',
    description: 'Raw data never leaves your phone.',
  },
  {
    icon: Lock,
    title: 'No account needed',
    description: 'No email, no sign-up. Untraceable.',
  },
  {
    icon: Hexagon,
    title: '~500 m hex cells',
    description: 'We measure neighborhoods, not people.',
  },
  {
    icon: Shield,
    title: 'Zero tracking',
    description: 'No cookies, no fingerprinting.',
  },
];

/* ── Who benefits ────────────────────────────────────────────────── */

export interface Beneficiary {
  icon: LucideIcon;
  title: string;
  benefit: string;
}

export const beneficiaries: Beneficiary[] = [
  { icon: Home, title: 'Families', benefit: 'Find healthy neighborhoods' },
  { icon: MapPin, title: 'Planners', benefit: 'Justify parks & transit' },
  { icon: BadgeDollarSign, title: 'Investors', benefit: 'ESG & impact data' },
  { icon: GraduationCap, title: 'Researchers', benefit: 'Open datasets' },
  { icon: Landmark, title: 'Policymakers', benefit: 'Health regulations' },
  { icon: Users, title: 'Communities', benefit: 'Advocate with data' },
];

/* ── All index metrics (flat list for badges) ────────────────────── */

export const allMetrics = [
  'Water quality',
  'Power reliability',
  'Air quality',
  'Food access',
  'Schools',
  'Hospitals',
  'Public transport',
  'Green areas',
  'Sun exposure',
  'Building density',
  'Light pollution',
  'Stress levels',
  'Safety perception',
  'Social connection',
  'Happiness index',
  'Climate adaptability',
  'Emergency preparedness',
  'Community cohesion',
];

export { CheckCircle2 };

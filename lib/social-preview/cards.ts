import type { Metadata } from 'next';
import type { PaletteId, ProjectBrand } from '../brand';
import { projectBrands } from '../brand';
import { founders, founderPath } from '../founders';

export type SocialCard = {
  path: string;
  title: string;
  heading: string;
  description: string;
  eyebrow: string;
  project?: ProjectBrand;
  palette?: PaletteId;
  artwork?: string;
  visual:
    'mascot' | 'product' | 'portrait' | 'globe' | 'organization' | 'software';
  detail?: string;
};

/** Public sharing content. Colors and characters stay in the brand registry. */
export const socialCards = {
  home: {
    path: '/',
    title: 'walkthru.earth - Health, Wellbeing & the Places We Live',
    heading: 'People. Places. Evidence.',
    description: 'Open tools for healthier communities and better decisions.',
    eyebrow: 'Health & wellbeing',
    project: 'earth',
    visual: 'organization',
  },
  capybrain: {
    path: projectBrands.capybrain.href,
    title: 'CapyBrain - Urban Wellbeing Research',
    heading: projectBrands.capybrain.name,
    description: 'Exploring urban environments and everyday wellbeing.',
    eyebrow: 'Urban wellbeing research',
    project: 'capybrain',
    artwork: projectBrands.capybrain.mascot.src,
    visual: 'mascot',
    detail: 'Places · Perception · Wellbeing',
  },
  opensensor: {
    path: projectBrands.opensensor.href,
    title: 'OpenSensor.Space - Open Environmental Monitoring',
    heading: projectBrands.opensensor.name,
    description:
      'Open tools for collecting and sharing air quality and weather readings.',
    eyebrow: 'Open environmental monitoring',
    project: 'opensensor',
    artwork: projectBrands.opensensor.mascot.src,
    visual: 'mascot',
    detail: 'Sense · Store · Share',
  },
  objex: {
    path: '/software/objex',
    title: 'objex - Cloud Storage Explorer',
    heading: 'objex',
    description:
      'Browse, query and visualize cloud data directly in your browser.',
    eyebrow: 'Cloud storage explorer',
    project: 'objex',
    artwork: '/software/objex/appicon.svg',
    visual: 'product',
    detail: 'Parquet · COG · STAC · 100+ formats',
  },
  imagery: {
    path: '/software/imagery-desktop',
    title: 'Imagery Desktop - Historical Satellite Imagery Analysis',
    heading: 'Imagery Desktop',
    description: 'Explore decades of satellite imagery. See how places change.',
    eyebrow: 'Historical satellite imagery',
    project: 'imagery',
    artwork: '/software/imagery-desktop/appicon.png',
    visual: 'product',
    detail: 'Explore · Compare · Export',
  },
  indices: {
    path: '/indices',
    title: 'Earth’s Living Indices | walkthru.earth',
    heading: 'Earth’s Living Indices',
    description:
      'Explore terrain, population, buildings and weather on an interactive globe.',
    eyebrow: 'Open planetary data',
    project: 'earth',
    artwork: '/globe-preview-dark.png',
    visual: 'globe',
  },
  software: {
    path: '/software',
    title: 'Software - Urban Analysis Tools | walkthru.earth',
    heading: 'Open tools. Real insight.',
    description:
      'Imagery Desktop and objex. Open software for imagery and cloud data.',
    eyebrow: 'Open source software',
    palette: 'ecosystem',
    visual: 'software',
  },
  links: {
    path: '/links',
    title: 'Links | walkthru.earth',
    heading: 'Let’s connect.',
    description: 'Our projects, social channels and ways to get in touch.',
    eyebrow: 'walkthru.earth links',
    project: 'earth',
    visual: 'organization',
    detail: 'hi@walkthru.earth',
  },
  about: {
    path: '/about',
    title: 'About | walkthru.earth',
    heading: 'Healthier places. Better decisions.',
    description:
      'Our people, purpose and open tools connecting everyday experience with evidence.',
    eyebrow: 'About walkthru.earth',
    palette: 'ecosystem',
    visual: 'organization',
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy | walkthru.earth',
    heading: 'Your privacy matters.',
    description: 'How we collect, use and protect your information.',
    eyebrow: 'Privacy policy',
    palette: 'action',
    visual: 'organization',
  },
  ...Object.fromEntries(
    founders.map((founder) => [
      founder.id,
      {
        path: founderPath(founder),
        title: `${founder.name} | walkthru.earth`,
        heading: founder.name,
        description: `${founder.role} at walkthru.earth. Connect with ${founder.name} and explore our projects.`,
        eyebrow: 'Meet the co-founders',
        palette: 'spatial',
        artwork: founder.image,
        visual: 'portrait',
        detail: founder.email,
      } satisfies SocialCard,
    ])
  ),
} satisfies Record<string, SocialCard>;

// Keep the lookup open to founder IDs from the shared contact registry.
export const cards: Readonly<Record<string, SocialCard>> = socialCards;
export const socialImageSize = { width: 1200, height: 630 } as const;

export function socialImagePath(id: string): string {
  return `/share/${id}.png`;
}

/** Define both networks explicitly: Next.js replaces nested metadata objects. */
export function socialMetadata(id: string): Metadata {
  const card = cards[id];
  if (!card) throw new Error(`Unknown social card: ${id}`);
  const image = {
    url: socialImagePath(id),
    ...socialImageSize,
    alt: `${card.heading} — ${card.eyebrow}`,
    type: 'image/png',
  };
  return {
    alternates: { canonical: card.path },
    openGraph: {
      title: card.title,
      description: card.description,
      url: card.path,
      siteName: 'walkthru.earth',
      locale: 'en_US',
      type: 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: card.title,
      description: card.description,
      creator: '@walkthru_earth',
      images: [image],
    },
  };
}

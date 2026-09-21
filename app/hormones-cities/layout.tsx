import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hormones & Cities - Urban Wellbeing Research | walkthru.earth',
  description:
    'An emerging research initiative exploring urban environments and everyday wellbeing, with planned resident surveys and an experimental street imagery model.',
  keywords:
    'urban wellbeing, environmental data, resident surveys, street imagery, urban research, neighborhood experience',
  alternates: {
    canonical: 'https://walkthru.earth/hormones-cities',
  },
  openGraph: {
    title: 'Hormones & Cities - Urban Wellbeing Research',
    description:
      'Explore an early street imagery experiment and our plans to study environmental conditions alongside residents’ experiences.',
    url: 'https://walkthru.earth/hormones-cities',
    siteName: 'walkthru.earth',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://walkthru.earth/hormones-cities-ai.png',
        width: 780,
        height: 1768,
        alt: 'Hormones & Cities app prototype',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hormones & Cities - Urban Wellbeing Research',
    description:
      'An emerging research initiative exploring urban environments, residents’ experiences, and everyday wellbeing.',
    creator: '@walkthru_earth',
    images: ['https://walkthru.earth/hormones-cities-ai.png'],
  },
};

export default function HormonesCitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

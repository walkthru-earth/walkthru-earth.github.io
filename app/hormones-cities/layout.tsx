import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hormones & Cities - Neighborhood Health Insights | walkthru.earth',
  description:
    'Share anonymous wellbeing and mobility data from your phone, get back analyzed health insights for your neighborhood. Offline-first, privacy by design, aggregated to H3 hexagons. Launching mid-2026.',
  keywords:
    'neighborhood health, urban wellbeing, anonymous mobility data, offline-first, privacy by design, H3 hexagons, livability, mental health, sustainable cities',
  alternates: {
    canonical: 'https://walkthru.earth/hormones-cities',
  },
  openGraph: {
    title: 'Hormones & Cities - Neighborhood Health Insights',
    description:
      'Share anonymous wellbeing and mobility data, get back neighborhood health insights. Offline-first, privacy by design. Launching mid-2026.',
    url: 'https://walkthru.earth/hormones-cities',
    siteName: 'walkthru.earth',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://walkthru.earth/og-hormones-cities.png',
        width: 1200,
        height: 630,
        alt: 'Hormones & Cities - Neighborhood Health Insights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hormones & Cities - Neighborhood Health Insights',
    description:
      'Share anonymous wellbeing and mobility data, get back neighborhood health insights. Offline-first, privacy by design.',
    creator: '@walkthru_earth',
    images: ['https://walkthru.earth/og-hormones-cities.png'],
  },
};

export default function HormonesCitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

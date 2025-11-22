import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hormones & Cities - Urban Wellbeing Research | walkthru.earth',
  description:
    'Shedding light on how urban environments impact our well-being through questionnaires and open data. Covering a wide range of topics to understand city life. Launching mid-2026.',
  keywords:
    'urban wellbeing, city survey, anonymous feedback, behavioral insights, livability, mental health, sustainable cities, urban psychology, questionnaires',
  alternates: {
    canonical: 'https://walkthru.earth/hormones-cities',
  },
  openGraph: {
    title: 'Hormones & Cities - Urban Wellbeing Research',
    description:
      'Shedding light on how urban environments impact our well-being through questionnaires and open data. Launching mid-2026.',
    url: 'https://walkthru.earth/hormones-cities',
    siteName: 'walkthru.earth',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://walkthru.earth/og-hormones-cities.png',
        width: 1200,
        height: 630,
        alt: 'Hormones & Cities - Urban Wellbeing Research',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hormones & Cities - Urban Wellbeing Research',
    description:
      'Shedding light on how urban environments impact our well-being through questionnaires and open data.',
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

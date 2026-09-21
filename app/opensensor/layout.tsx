import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'opensensor.space - Open Environmental Monitoring | walkthru.earth',
  description:
    'Open tools for collecting and sharing air quality and weather readings. Explore local environmental conditions with open source software and reusable data.',
  keywords:
    'air quality, environmental monitoring, open data, IoT sensors, weather, parquet, edge computing, Raspberry Pi',
  alternates: {
    canonical: 'https://walkthru.earth/opensensor',
  },
  openGraph: {
    title: 'opensensor.space - Open Environmental Monitoring',
    description:
      'Collect and share air quality and weather readings using open source tools and reusable environmental data.',
    url: 'https://walkthru.earth/opensensor',
    siteName: 'walkthru.earth',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://walkthru.earth/opensensor-icon-512.png',
        width: 512,
        height: 512,
        alt: 'opensensor.space - Open Environmental Monitoring',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'opensensor.space - Open Environmental Monitoring',
    description:
      'Collect and share air quality and weather readings using open source tools and reusable environmental data.',
    creator: '@walkthru_earth',
    images: ['https://walkthru.earth/opensensor-icon-512.png'],
  },
};

export default function OpenSensorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

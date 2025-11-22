import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'opensensor.space - Cloud-Native IoT Sensor Network | walkthru.earth',
  description:
    'Connecting IoT sensors and streaming real-time environmental data to the cloud with minimum carbon footprint. Open data from air quality sensors published since April 2025.',
  keywords:
    'IoT sensors, environmental monitoring, air quality, cloud-native, open data, parquet, edge computing, carbon footprint, sustainable IoT',
  alternates: {
    canonical: 'https://walkthru.earth/opensensor',
  },
  openGraph: {
    title: 'opensensor.space - Cloud-Native IoT Sensor Network',
    description:
      'Connecting IoT sensors and streaming real-time environmental data to the cloud with minimum carbon footprint possible.',
    url: 'https://walkthru.earth/opensensor',
    siteName: 'walkthru.earth',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://walkthru.earth/og-opensensor.png',
        width: 1200,
        height: 630,
        alt: 'opensensor.space - Cloud-Native IoT Sensor Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'opensensor.space - Cloud-Native IoT Sensor Network',
    description:
      'Connecting IoT sensors and streaming real-time environmental data to the cloud with minimum carbon footprint.',
    creator: '@walkthru_earth',
    images: ['https://walkthru.earth/og-opensensor.png'],
  },
};

export default function OpenSensorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

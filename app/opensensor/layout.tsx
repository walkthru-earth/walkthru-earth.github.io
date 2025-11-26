import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'opensensor.space - Cloud-Native IoT Sensor Network | walkthru.earth',
  description:
    'Enterprise-grade IoT infrastructure for connecting sensors to the cloud. Scalable from a single sensor to millions of devices with minimal carbon footprint. Open source and open data.',
  keywords:
    'IoT sensors, environmental monitoring, cloud-native, open data, parquet, edge computing, Raspberry Pi, ESP32, industrial IoT, scalable sensors, sustainable infrastructure',
  alternates: {
    canonical: 'https://walkthru.earth/opensensor',
  },
  openGraph: {
    title: 'opensensor.space - Cloud-Native IoT Sensor Network',
    description:
      'Enterprise-grade IoT infrastructure. Scalable from a single sensor to millions of devices with minimal carbon footprint.',
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
      'Enterprise-grade IoT infrastructure. Scalable from a single sensor to millions of devices with minimal carbon footprint.',
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

import { socialMetadata } from '@/lib/social-preview/cards';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'opensensor.space - Open Environmental Monitoring | walkthru.earth',
  description:
    'Open tools for collecting and sharing air quality and weather readings. Explore local environmental conditions with open source software and reusable data.',
  keywords:
    'air quality, environmental monitoring, open data, IoT sensors, weather, parquet, edge computing, Raspberry Pi',
  ...socialMetadata('opensensor'),
};

export default function OpenSensorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

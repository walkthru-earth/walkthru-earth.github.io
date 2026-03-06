import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Earth's Living Indices | Walkthru",
  description:
    'Explore global terrain, population, building density, and weather data on an interactive H3 hexagonal grid -powered by hyparquet and deck.gl.',
  keywords: [
    'H3 hexagonal grid',
    'hyparquet',
    'deck.gl',
    'geospatial',
    'terrain',
    'population projections',
    'building density',
    'weather forecasts',
    'GeoParquet',
    'cloud-native geospatial',
  ],
};

export default function IndicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

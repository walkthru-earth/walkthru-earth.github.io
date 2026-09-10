import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | walkthru.earth',
  description:
    'Meet the team building open urban intelligence, geospatial datasets, and tools for healthier cities.',
  alternates: { canonical: 'https://walkthru.earth/about' },
  openGraph: {
    title: 'About | walkthru.earth',
    description:
      'Meet the team building open urban intelligence and tools for healthier cities.',
    url: 'https://walkthru.earth/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | walkthru.earth',
  description:
    'Meet the team building open environmental data and tools to understand the places we live, with human health and wellbeing at the center.',
  alternates: { canonical: 'https://walkthru.earth/about' },
  openGraph: {
    title: 'About | walkthru.earth',
    description:
      'Meet the team exploring the connection between environmental conditions, human health, and everyday wellbeing.',
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

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | walkthru.earth',
  description:
    'We make the invisible relationships between people and places measurable through open tools, turning everyday experience into evidence for better decisions.',
  alternates: { canonical: 'https://walkthru.earth/about' },
  openGraph: {
    title: 'About | walkthru.earth',
    description:
      'Our vision, mission, and five strategic goals connect lived experience, open environmental evidence, and better decisions for healthier places.',
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

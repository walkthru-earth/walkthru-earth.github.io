import { socialMetadata } from '@/lib/social-preview/cards';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | walkthru.earth',
  description:
    'We make the invisible relationships between people and places measurable through open tools, turning everyday experience into evidence for better decisions.',
  ...socialMetadata('about'),
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

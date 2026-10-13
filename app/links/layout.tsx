import { socialMetadata } from '@/lib/social-preview/cards';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Links | walkthru.earth',
  description:
    'All links to walkthru.earth - social media, projects, and ways to connect with us.',
  ...socialMetadata('links'),
};

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

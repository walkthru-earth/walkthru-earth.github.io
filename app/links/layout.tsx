import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Links | walkthru.earth',
  description:
    'All links to walkthru.earth - social media, projects, and ways to connect with us.',
  alternates: { canonical: 'https://walkthru.earth/links' },
  openGraph: {
    title: 'Links | walkthru.earth',
    description: 'Connect with walkthru.earth - all our links in one place',
    url: 'https://walkthru.earth/links',
  },
};

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

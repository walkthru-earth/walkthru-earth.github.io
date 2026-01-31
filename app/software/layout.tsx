import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Software | walkthru.earth',
  description:
    'Download Imagery Desktop - Open source software for downloading and georeferencing historical satellite imagery. Access Google Earth and Esri Wayback archives from 1984 to 2025 for urban analysis.',
  openGraph: {
    title: 'Software | walkthru.earth',
    description:
      'Download Imagery Desktop for historical satellite imagery analysis',
    url: 'https://walkthru.earth/software',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Software | walkthru.earth',
    description:
      'Download Imagery Desktop for historical satellite imagery analysis',
  },
};

export default function SoftwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

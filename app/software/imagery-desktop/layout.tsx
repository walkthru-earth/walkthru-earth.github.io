import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Imagery Desktop | walkthru.earth',
  description:
    'Download Imagery Desktop - Historical satellite imagery analysis tool. Access Google Earth and Esri Wayback archives from 1984 to 2025. GeoTIFF export for urban research and planning.',
  openGraph: {
    title: 'Imagery Desktop | walkthru.earth',
    description:
      'Historical satellite imagery analysis tool for urban research',
    url: 'https://walkthru.earth/software/imagery-desktop',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Imagery Desktop | walkthru.earth',
    description:
      'Historical satellite imagery analysis tool for urban research',
  },
};

export default function ImageryDesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Software - Urban Analysis Tools | walkthru.earth',
  description:
    'Free, open-source software for urban analysis and pattern detection. Download tools for satellite imagery analysis, GIS research, and community projects. Cross-platform support for Windows, macOS, and Linux.',
  keywords:
    'urban analysis tools, satellite imagery software, GeoTIFF, GIS software, open source, free download, Windows, macOS, Linux, urban planning, pattern detection, city research',
  alternates: {
    canonical: 'https://walkthru.earth/software',
  },
  openGraph: {
    title: 'Software - Urban Analysis Tools | walkthru.earth',
    description:
      'Free, open-source software for urban analysis and pattern detection. Download tools for satellite imagery analysis, GIS research, and community projects.',
    url: 'https://walkthru.earth/software',
    siteName: 'walkthru.earth',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://walkthru.earth/og-software.png',
        width: 1200,
        height: 630,
        alt: 'walkthru.earth Software - Urban Analysis Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Software - Urban Analysis Tools | walkthru.earth',
    description:
      'Free, open-source software for urban analysis and pattern detection. Download tools for satellite imagery, GIS, and community research.',
    creator: '@walkthru_earth',
    images: ['https://walkthru.earth/og-software.png'],
  },
};

export default function SoftwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

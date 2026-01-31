import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Imagery Desktop - Historical Satellite Imagery Analysis | walkthru.earth',
  description:
    'Download Imagery Desktop for free. Analyze historical satellite imagery from 1984 to 2025. Access Google Earth and Esri Wayback archives. Export GeoTIFF for QGIS, ArcGIS, and urban research. Available for Windows, macOS (Apple Silicon), and Linux.',
  keywords:
    'Imagery Desktop, satellite imagery software, historical imagery, Google Earth download, Esri Wayback, GeoTIFF export, urban change detection, timelapse creator, QGIS, ArcGIS, urban planning software, free GIS tools, Windows, macOS Apple Silicon, Linux',
  alternates: {
    canonical: 'https://walkthru.earth/software/imagery-desktop',
  },
  openGraph: {
    title: 'Imagery Desktop - Historical Satellite Imagery Analysis',
    description:
      'Free tool to download and analyze 40+ years of satellite imagery. Detect urban change patterns, create timelapses, and export GeoTIFF for GIS analysis.',
    url: 'https://walkthru.earth/software/imagery-desktop',
    siteName: 'walkthru.earth',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://walkthru.earth/og-imagery-desktop.png',
        width: 1200,
        height: 630,
        alt: 'Imagery Desktop - Historical Satellite Imagery Analysis Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Imagery Desktop - Historical Satellite Imagery Analysis',
    description:
      'Free tool to download and analyze 40+ years of satellite imagery. Create timelapses and export GeoTIFF for GIS analysis.',
    creator: '@walkthru_earth',
    images: ['https://walkthru.earth/og-imagery-desktop.png'],
  },
};

export default function ImageryDesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

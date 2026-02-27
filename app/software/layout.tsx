import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Software - Urban Analysis Tools | walkthru.earth',
  description:
    'Free, open-source software for urban analysis, cloud storage exploration, and geospatial data. Imagery Desktop for satellite imagery analysis. objex for browsing Parquet, COG, PMTiles, Zarr, FlatGeobuf, and STAC from S3, GCS, Azure, and R2.',
  keywords:
    'urban analysis tools, satellite imagery software, cloud storage explorer, GeoTIFF, Parquet viewer, COG, PMTiles, Zarr, FlatGeobuf, STAC, GIS software, open source, free download, DuckDB WASM, geospatial',
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

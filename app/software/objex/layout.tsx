import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'objex - Cloud Storage Explorer | walkthru.earth',
  description:
    'Explore cloud storage directly in your browser. Browse S3, GCS, Azure, R2, and more. Query data with SQL via DuckDB-WASM, visualize geospatial formats on interactive maps, and view 100+ file types — all client-side with zero backend.',
  keywords:
    'cloud storage explorer, S3 browser, GCS explorer, Azure blob viewer, object storage, DuckDB WASM, SQL browser, GeoParquet, PMTiles, COG, geospatial visualization, Parquet viewer, file browser, open source',
  alternates: {
    canonical: 'https://walkthru.earth/software/objex',
  },
  openGraph: {
    title: 'objex - Cloud Storage Explorer',
    description:
      'Browse, query, and visualize files in S3, GCS, Azure, R2, and more. SQL queries, interactive maps, and 100+ format viewers — all in the browser.',
    url: 'https://walkthru.earth/software/objex',
    siteName: 'walkthru.earth',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://walkthru.earth/og-objex.png',
        width: 1200,
        height: 630,
        alt: 'objex - Cloud Storage Explorer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'objex - Cloud Storage Explorer',
    description:
      'Browse, query, and visualize cloud storage in the browser. SQL queries, geo maps, 100+ formats — zero backend.',
    creator: '@walkthru_earth',
    images: ['https://walkthru.earth/og-objex.png'],
  },
};

export default function ObjexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

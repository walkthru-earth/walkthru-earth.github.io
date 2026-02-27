import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'objex - Cloud Storage Explorer | walkthru.earth',
  description:
    'Explore cloud storage directly in your browser. View Parquet, GeoParquet, COG, PMTiles, Zarr, FlatGeobuf, COPC, STAC, and 100+ formats from S3, GCS, Azure, and R2. Query with SQL via DuckDB-WASM, visualize on interactive maps — all client-side with zero backend.',
  keywords:
    'cloud storage explorer, Parquet viewer, GeoParquet, COG viewer, Cloud Optimized GeoTIFF, PMTiles, Zarr viewer, FlatGeobuf, COPC, STAC browser, GeoJSON, Shapefile, S3 browser, GCS explorer, Azure blob viewer, DuckDB WASM, SQL browser, geospatial visualization, object storage, open source, Jupyter notebook viewer, Kepler.gl',
  alternates: {
    canonical: 'https://walkthru.earth/software/objex',
  },
  openGraph: {
    title: 'objex - Cloud Storage Explorer',
    description:
      'Browse, query, and visualize Parquet, GeoParquet, COG, PMTiles, Zarr, FlatGeobuf, STAC, and 100+ formats from S3, GCS, Azure, R2 — all in the browser with zero backend.',
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
      'View Parquet, COG, PMTiles, Zarr, FlatGeobuf, STAC, and 100+ formats from S3, GCS, Azure, R2. SQL queries, geo maps — zero backend.',
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

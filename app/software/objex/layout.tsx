import { socialMetadata } from '@/lib/social-preview/cards';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'objex - Cloud Storage Explorer | walkthru.earth',
  description:
    'Explore cloud storage directly in your browser. View Parquet, GeoParquet, COG, PMTiles, Zarr, FlatGeobuf, COPC, STAC, and 100+ formats from S3, GCS, Azure, and R2. Query with SQL via DuckDB-WASM, visualize on interactive maps -all client-side with zero backend.',
  keywords:
    'cloud storage explorer, Parquet viewer, GeoParquet, COG viewer, Cloud Optimized GeoTIFF, PMTiles, Zarr viewer, FlatGeobuf, COPC, STAC browser, GeoJSON, Shapefile, S3 browser, GCS explorer, Azure blob viewer, DuckDB WASM, SQL browser, geospatial visualization, object storage, open source, Jupyter notebook viewer, Kepler.gl',
  ...socialMetadata('objex'),
};

export default function ObjexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

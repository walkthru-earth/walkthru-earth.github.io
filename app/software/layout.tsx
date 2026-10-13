import { socialMetadata } from '@/lib/social-preview/cards';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Software - Urban Analysis Tools | walkthru.earth',
  description:
    'Free, open-source software for urban analysis, cloud storage exploration, and geospatial data. Imagery Desktop for satellite imagery analysis. objex for browsing Parquet, COG, PMTiles, Zarr, FlatGeobuf, and STAC from S3, GCS, Azure, and R2.',
  keywords:
    'urban analysis tools, satellite imagery software, cloud storage explorer, GeoTIFF, Parquet viewer, COG, PMTiles, Zarr, FlatGeobuf, STAC, GIS software, open source, free download, DuckDB WASM, geospatial',
  ...socialMetadata('software'),
};

export default function SoftwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { socialMetadata } from '@/lib/social-preview/cards';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Imagery Desktop - Historical Satellite Imagery Analysis | walkthru.earth',
  description:
    'Download Imagery Desktop for free. Analyze historical satellite imagery from 1984 to 2025. Access Google Earth and Esri Wayback archives. Export GeoTIFF for QGIS, ArcGIS, and urban research. Available for Windows, macOS (Apple Silicon), and Linux.',
  keywords:
    'Imagery Desktop, satellite imagery software, historical imagery, Google Earth download, Esri Wayback, GeoTIFF export, urban change detection, timelapse creator, QGIS, ArcGIS, urban planning software, free GIS tools, Windows, macOS Apple Silicon, Linux',
  ...socialMetadata('imagery'),
};

export default function ImageryDesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

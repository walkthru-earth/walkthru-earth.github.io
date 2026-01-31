export interface Screenshot {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface FeatureScreenshot {
  title: string;
  description: string;
  lightScreenshot: Screenshot;
  darkScreenshot: Screenshot;
}

export const features: FeatureScreenshot[] = [
  {
    title: 'Interactive Map Preview',
    description:
      'Browse historical imagery with an intuitive timeline. Select any date from 1984 to 2025 and preview imagery before download.',
    lightScreenshot: {
      src: '/software/imagery-desktop/feature-1-light.png',
      alt: 'Interactive Map Preview - Light Mode',
      width: 1400,
      height: 949,
    },
    darkScreenshot: {
      src: '/software/imagery-desktop/feature-1-dark.png',
      alt: 'Interactive Map Preview - Dark Mode',
      width: 1400,
      height: 949,
    },
  },
  {
    title: 'Split View Comparison',
    description:
      'Compare imagery side-by-side across different dates. Analyze urban change, development patterns, and environmental shifts with precision.',
    lightScreenshot: {
      src: '/software/imagery-desktop/feature-2-light.png',
      alt: 'Split View Comparison - Light Mode',
      width: 1400,
      height: 949,
    },
    darkScreenshot: {
      src: '/software/imagery-desktop/feature-2-dark.png',
      alt: 'Split View Comparison - Dark Mode',
      width: 1400,
      height: 949,
    },
  },
  {
    title: 'Video Timeline Export',
    description:
      'Create stunning timelapses showing urban transformation. Select date ranges and export smooth video transitions for presentations.',
    lightScreenshot: {
      src: '/software/imagery-desktop/feature-3-light.png',
      alt: 'Video Timeline Export - Light Mode',
      width: 1400,
      height: 949,
    },
    darkScreenshot: {
      src: '/software/imagery-desktop/feature-3-dark.png',
      alt: 'Video Timeline Export - Dark Mode',
      width: 1400,
      height: 949,
    },
  },
  {
    title: 'Flexible Export Options',
    description:
      'Export as GeoTIFF for GIS analysis, tiles for web maps, or videos for storytelling. Choose zoom levels and configure output precisely.',
    lightScreenshot: {
      src: '/software/imagery-desktop/feature-4-light.png',
      alt: 'Flexible Export Options - Light Mode',
      width: 1400,
      height: 949,
    },
    darkScreenshot: {
      src: '/software/imagery-desktop/feature-4-dark.png',
      alt: 'Flexible Export Options - Dark Mode',
      width: 1400,
      height: 949,
    },
  },
  {
    title: 'Background Task Queue',
    description:
      'Queue multiple exports and let them run in the background. Track progress, manage tasks, and download when ready.',
    lightScreenshot: {
      src: '/software/imagery-desktop/feature-5-light.png',
      alt: 'Background Task Queue - Light Mode',
      width: 1400,
      height: 949,
    },
    darkScreenshot: {
      src: '/software/imagery-desktop/feature-5-dark.png',
      alt: 'Background Task Queue - Dark Mode',
      width: 1400,
      height: 949,
    },
  },
];

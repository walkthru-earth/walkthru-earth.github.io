import { useRef } from 'react';
import { useScroll, useTransform, MotionValue } from 'framer-motion';

interface UseScrollFeaturesReturn {
  heroRef: React.RefObject<HTMLElement | null>;
  screenshotOpacities: MotionValue<number>[];
  dotOpacities: MotionValue<number>[];
  mobileTextOpacity: MotionValue<number>;
  mobileScreenshotOpacity: MotionValue<number>;
}

export function useScrollFeatures(
  featureCount: number
): UseScrollFeaturesReturn {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });

  // Calculate transition points based on feature count
  /* eslint-disable react-hooks/rules-of-hooks */
  const screenshotOpacities = Array.from({ length: featureCount }, (_, i) => {
    const segmentSize = 1 / featureCount;
    const start = i * segmentSize;
    const middle = start + segmentSize / 2;
    const end = (i + 1) * segmentSize;

    if (i === 0) {
      // First screenshot: Full opacity at start, fades out
      return useTransform(scrollYProgress, [0, middle, end], [1, 1, 0]);
    } else if (i === featureCount - 1) {
      // Last screenshot: Fades in and stays
      return useTransform(scrollYProgress, [start, middle, 1], [0, 1, 1]);
    } else {
      // Middle screenshots: Fade in and fade out
      return useTransform(scrollYProgress, [start, middle, end], [0, 1, 0]);
    }
  });

  // Create indicator dot opacities
  const dotOpacities = Array.from({ length: featureCount }, (_, i) => {
    const segmentSize = 1 / featureCount;
    const start = i * segmentSize;
    const middle = start + segmentSize / 2;
    const end = (i + 1) * segmentSize;

    if (i === 0) {
      return useTransform(scrollYProgress, [0, middle, end], [1, 1, 0.3]);
    } else if (i === featureCount - 1) {
      return useTransform(scrollYProgress, [start, middle, 1], [0.3, 1, 1]);
    } else {
      return useTransform(scrollYProgress, [start, middle, end], [0.3, 1, 0.3]);
    }
  });
  /* eslint-enable react-hooks/rules-of-hooks */

  // Mobile-only: Fade out text content and fade in screenshot mockup
  const mobileTextOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const mobileScreenshotOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.25],
    [0, 1]
  );

  return {
    heroRef,
    screenshotOpacities,
    dotOpacities,
    mobileTextOpacity,
    mobileScreenshotOpacity,
  };
}

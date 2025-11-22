import { useRef } from 'react';
import { useScroll, useTransform, MotionValue } from 'framer-motion';

interface UseScrollScreenshotsReturn {
  heroRef: React.RefObject<HTMLDivElement | null>;
  screenshotOpacities: MotionValue<number>[];
  dotOpacities: MotionValue<number>[];
  mobileTextOpacity: MotionValue<number>;
  mobilePhoneOpacity: MotionValue<number>;
}

export function useScrollScreenshots(
  screenshotCount: number
): UseScrollScreenshotsReturn {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });

  // Calculate transition points based on screenshot count
  /* eslint-disable react-hooks/rules-of-hooks */
  const screenshotOpacities = Array.from(
    { length: screenshotCount },
    (_, i) => {
      if (i === 0) {
        return useTransform(scrollYProgress, [0, 0.25, 0.4], [1, 1, 0]);
      } else if (i === screenshotCount - 1) {
        return useTransform(scrollYProgress, [0.6, 0.75, 1], [0, 1, 1]);
      } else {
        return useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0, 1, 0]);
      }
    }
  );

  // Create indicator dot opacities
  const dotOpacities = Array.from({ length: screenshotCount }, (_, i) => {
    if (i === 0) {
      return useTransform(scrollYProgress, [0, 0.25, 0.4], [1, 1, 0.3]);
    } else if (i === screenshotCount - 1) {
      return useTransform(scrollYProgress, [0.6, 0.75, 1], [0.3, 1, 1]);
    } else {
      return useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0.3, 1, 0.3]);
    }
  });
  /* eslint-enable react-hooks/rules-of-hooks */

  // Mobile-only: Fade out text content and fade in phone mockup
  const mobileTextOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const mobilePhoneOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);

  return {
    heroRef,
    screenshotOpacities,
    dotOpacities,
    mobileTextOpacity,
    mobilePhoneOpacity,
  };
}

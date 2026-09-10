'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // The explorer owns wheel/touch gestures and its own scroll container.
    if (pathname === '/indices' || pathname.startsWith('/indices/')) return;

    const lenis = new Lenis({
      autoRaf: true,
      respectReducedMotion: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
      autoResize: true,
    });

    return () => {
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}

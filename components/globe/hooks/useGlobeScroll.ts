'use client';

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type MutableRefObject,
} from 'react';

/**
 * Manages section navigation via wheel and touch events.
 * Scroll/swipe on empty space (outside globe) → navigate sections.
 * Scroll/swipe on the globe → deck.gl handles zoom/pan.
 */
export function useGlobeScroll(
  sectionCount: number,
  isOverGlobeRef: MutableRefObject<boolean>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const cooldownRef = useRef(false);
  const touchStartY = useRef(0);
  const touchOverGlobe = useRef(false);

  const navigate = useCallback(
    (direction: -1 | 1) => {
      if (cooldownRef.current) return;
      setActiveSection((prev) => {
        const next = prev + direction;
        if (next < 0 || next >= sectionCount) return prev;
        cooldownRef.current = true;
        setTimeout(() => {
          cooldownRef.current = false;
        }, 600);
        return next;
      });
    },
    [sectionCount]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Over the globe → let deck.gl handle zoom/pan
      if (isOverGlobeRef.current) return;
      // Outside the globe → navigate sections
      e.preventDefault();
      navigate(e.deltaY > 0 ? 1 : -1);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      // Snapshot globe-hover state at touch start
      touchOverGlobe.current = isOverGlobeRef.current;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Touch started on globe → let deck.gl handle it
      if (touchOverGlobe.current) return;
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) {
        navigate(dy > 0 ? 1 : -1);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, isOverGlobeRef]);

  return { containerRef, activeSection, navigate };
}

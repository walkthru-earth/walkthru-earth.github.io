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

    // Touch-based section navigation is disabled — on mobile the globe
    // covers the full viewport so all touches belong to deck.gl pan/zoom.
    // Users navigate sections via arrow buttons in the drawer / bottom bar.

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [navigate, isOverGlobeRef]);

  return { containerRef, activeSection, navigate };
}

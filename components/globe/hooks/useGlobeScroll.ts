'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Manages section navigation via wheel events.
 * Each scroll gesture advances one section, then the user is free to interact.
 */
export function useGlobeScroll(sectionCount: number) {
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
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      navigate(direction);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [navigate]);

  return { containerRef, activeSection, navigate };
}

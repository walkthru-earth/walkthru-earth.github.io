'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Tracks which section the user has scrolled to.
 * No snap, no viewState lerp — just section tracking.
 */
export function useGlobeScroll(sectionCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalHeight = container.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalHeight));
      const newActive = Math.round(progress * (sectionCount - 1));

      // Debounce section changes (150ms) to avoid rapid data loads
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setActiveSection((prev) => (prev !== newActive ? newActive : prev));
      }, 150);
    });
  }, [sectionCount]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, [handleScroll]);

  return { containerRef, activeSection };
}

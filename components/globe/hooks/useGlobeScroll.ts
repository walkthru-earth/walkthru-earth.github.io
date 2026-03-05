'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { ViewState } from '../data/sections';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpViewState(a: ViewState, b: ViewState, t: number): ViewState {
  return {
    latitude: lerp(a.latitude, b.latitude, t),
    longitude: lerp(a.longitude, b.longitude, t),
    zoom: lerp(a.zoom, b.zoom, t),
  };
}

/** Ease-in-out cubic for smooth scroll transitions. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function useGlobeScroll(viewStates: ViewState[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [viewState, setViewState] = useState<ViewState>(viewStates[0]);
  const rafRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    // Coalesce scroll events with requestAnimationFrame
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalHeight = container.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalHeight));

      const sectionCount = viewStates.length;
      const sectionProgress = progress * (sectionCount - 1);
      const currentSection = Math.floor(sectionProgress);
      const sectionT = sectionProgress - currentSection;
      const clampedSection = Math.min(currentSection, sectionCount - 2);
      const nextSection = clampedSection + 1;

      const newActive =
        sectionT > 0.5
          ? Math.min(nextSection, sectionCount - 1)
          : clampedSection;

      setActiveSection((prev) => (prev !== newActive ? newActive : prev));

      // Interpolate view states with easing
      if (clampedSection < sectionCount - 1) {
        setViewState(
          lerpViewState(
            viewStates[clampedSection],
            viewStates[nextSection],
            easeInOutCubic(sectionT)
          )
        );
      } else {
        setViewState(viewStates[sectionCount - 1]);
      }
    });
  }, [viewStates]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  return { containerRef, activeSection, viewState };
}

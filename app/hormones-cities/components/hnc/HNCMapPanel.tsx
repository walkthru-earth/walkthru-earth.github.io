'use client';

import { useEffect, useRef } from 'react';
import maplibregl, { type Map as MlMap, type Marker } from 'maplibre-gl';
import {
  HNC_FLY,
  HNC_INITIAL_VIEW,
  HNC_MAP_STYLE,
  type ThemeMode,
} from './config';
import type { HNCRow } from './types';

interface Props {
  rows: HNCRow[];
  selectedId: string | null;
  themeMode: ThemeMode;
  onSelect: (id: string) => void;
}

const ARROW_PATH = 'M12 5 L16.5 14 L12 11.5 L7.5 14 Z';

function buildArrowSvg(accent: string): SVGElement {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  const defs = document.createElementNS(NS, 'defs');
  const grad = document.createElementNS(NS, 'radialGradient');
  const gid = `g_${Math.random().toString(36).slice(2, 8)}`;
  grad.setAttribute('id', gid);
  grad.setAttribute('cx', '50%');
  grad.setAttribute('cy', '35%');
  grad.setAttribute('r', '60%');
  const s0 = document.createElementNS(NS, 'stop');
  s0.setAttribute('offset', '0%');
  s0.setAttribute('stop-color', accent);
  s0.setAttribute('stop-opacity', '1');
  const s1 = document.createElementNS(NS, 'stop');
  s1.setAttribute('offset', '100%');
  s1.setAttribute('stop-color', accent);
  s1.setAttribute('stop-opacity', '0.2');
  grad.appendChild(s0);
  grad.appendChild(s1);
  defs.appendChild(grad);
  svg.appendChild(defs);

  const halo = document.createElementNS(NS, 'circle');
  halo.setAttribute('cx', '12');
  halo.setAttribute('cy', '12');
  halo.setAttribute('r', '10.5');
  halo.setAttribute('fill', 'white');
  halo.setAttribute('opacity', '0.85');

  const circle = document.createElementNS(NS, 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '9');
  circle.setAttribute('fill', `url(#${gid})`);
  circle.setAttribute('stroke', accent);
  circle.setAttribute('stroke-width', '2');
  circle.setAttribute('opacity', '1');

  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', ARROW_PATH);
  path.setAttribute('fill', 'currentColor');
  path.setAttribute('stroke', accent);
  path.setAttribute('stroke-width', '1');
  path.setAttribute('stroke-linejoin', 'round');

  svg.appendChild(halo);
  svg.appendChild(circle);
  svg.appendChild(path);
  return svg;
}

interface MarkerRef {
  marker: Marker;
  arrowEl: HTMLElement;
}

function readToken(el: Element | null, name: string, fallback: string): string {
  if (!el) return fallback;
  // Tokens in globals.css are already wrapped (e.g. hsl(158 64% 42%)),
  // so use the resolved value directly. Fall back to a safe default.
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  return value || fallback;
}

function fitToData(map: MlMap, rows: HNCRow[]) {
  if (!rows.length) return;
  let minLon = Infinity,
    maxLon = -Infinity,
    minLat = Infinity,
    maxLat = -Infinity;
  for (const r of rows) {
    if (r.lon < minLon) minLon = r.lon;
    if (r.lon > maxLon) maxLon = r.lon;
    if (r.lat < minLat) minLat = r.lat;
    if (r.lat > maxLat) maxLat = r.lat;
  }
  map.fitBounds(
    [
      [minLon, minLat],
      [maxLon, maxLat],
    ],
    { padding: 60, duration: 800, maxZoom: 17 }
  );
}

export function HNCMapPanel({ rows, selectedId, themeMode, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<Map<string, MarkerRef>>(new Map());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Init the map exactly once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: HNC_MAP_STYLE[themeMode],
      center: HNC_INITIAL_VIEW.center,
      zoom: HNC_INITIAL_VIEW.zoom,
      pitch: HNC_INITIAL_VIEW.pitch,
      bearing: HNC_INITIAL_VIEW.bearing,
      attributionControl: { compact: true },
      // Page scroll passes through; users opt in with Ctrl/Cmd+wheel or two-finger touch.
      cooperativeGestures: true,
    });
    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to theme changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(HNC_MAP_STYLE[themeMode]);
  }, [themeMode]);

  // Sync markers whenever rows change.
  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container) return;

    const accent = readToken(container, '--primary', 'hsl(158 64% 42%)');
    const warm = readToken(container, '--secondary', 'hsl(37 91% 55%)');

    const apply = () => {
      for (const m of markersRef.current.values()) m.marker.remove();
      markersRef.current.clear();

      for (const r of rows) {
        const el = document.createElement('div');
        el.className = 'hnc-marker';
        const arrow = document.createElement('div');
        arrow.className = 'hnc-marker-arrow';
        arrow.style.color = 'var(--background)';
        arrow.appendChild(buildArrowSvg(accent));
        el.appendChild(arrow);
        el.addEventListener('click', () => onSelectRef.current(r.image_id));

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'center',
          rotation: r.compass_angle ?? 0,
          rotationAlignment: 'map',
          pitchAlignment: 'map',
        })
          .setLngLat([r.lon, r.lat])
          .addTo(map);

        markersRef.current.set(r.image_id, { marker, arrowEl: arrow });
      }
      fitToData(map, rows);
    };

    if (map.loaded()) {
      apply();
    } else {
      map.once('load', apply);
    }
  }, [rows]);

  // Sync selection visuals + camera fly.
  useEffect(() => {
    const container = containerRef.current;
    const map = mapRef.current;
    if (!container || !map) return;
    const accent = readToken(container, '--primary', 'hsl(158 64% 42%)');
    const warm = readToken(container, '--secondary', 'hsl(37 91% 55%)');

    for (const [id, ref] of markersRef.current) {
      const isSel = id === selectedId;
      ref.arrowEl.classList.toggle('is-selected', isSel);
      ref.arrowEl.replaceChildren(buildArrowSvg(isSel ? warm : accent));
    }

    if (selectedId) {
      const row = rows.find((r) => r.image_id === selectedId);
      if (row && map.loaded()) {
        // Cinematic walk: bearing aligns with the photo's compass heading so
        // the map turns to face the direction the camera looked, pitch tilts
        // forward for first-person feel, and the parabolic flyTo eases between
        // captures. Pacing is governed by HNC_FLY.durationMs in config.ts.
        const bearing = row.compass_angle ?? map.getBearing();
        map.flyTo({
          center: [row.lon, row.lat],
          zoom: Math.max(map.getZoom(), HNC_FLY.zoom),
          bearing,
          pitch: HNC_FLY.pitch,
          duration: HNC_FLY.durationMs,
          curve: HNC_FLY.curve,
          essential: true,
        });
      }
    }
  }, [selectedId, themeMode, rows]);

  return (
    <div
      ref={containerRef}
      className="hnc-map relative h-full w-full"
      role="region"
      aria-label="London Borough Market street-level capture map"
      // Stop Lenis (page-level smooth scroll) from intercepting wheel/touch
      // gestures on the map. Without this, Cmd+scroll zooms the map AND scrolls
      // the page because Lenis claims the wheel event before maplibre can.
      data-lenis-prevent
    />
  );
}

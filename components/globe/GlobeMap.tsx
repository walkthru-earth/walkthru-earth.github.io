'use client';

import { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import DeckGL from '@deck.gl/react';
import {
  _GlobeView as GlobeView,
  COORDINATE_SYSTEM,
  LightingEffect,
  AmbientLight,
  LinearInterpolator,
  type PickingInfo,
} from '@deck.gl/core';
import {
  BitmapLayer,
  GeoJsonLayer,
  ColumnLayer,
  ScatterplotLayer,
} from '@deck.gl/layers';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { SphereGeometry } from '@luma.gl/engine';
import { H3HexagonLayer, TileLayer } from '@deck.gl/geo-layers';
import type { ViewState, ColorRange } from './data/sections';
import {
  BASE_SATELLITE_ID,
  BASE_LAND_ID,
  BASE_BORDERS_ID,
} from './data/constants';
import type { UserLocation } from './hooks/useUserLocation';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const EARTH_RADIUS_METERS = 6.3e6;
/** EOX Sentinel-2 cloudless 2024 — free open satellite tile service (WMTS). */
const SATELLITE_TILE_URL =
  'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg';
const LAND_GEOJSON = '/geo/ne_50m_land.geojson';
const COUNTRY_BORDERS = '/geo/ne_50m_admin_0_boundary_lines_land.geojson';

const GLOBE_VIEW = new GlobeView({ id: 'globe', resolution: 5 });

const TRANSITION_INTERPOLATOR = new LinearInterpolator([
  'longitude',
  'latitude',
  'zoom',
]);

/** Reusable sphere mesh for the earth background (low-poly for perf) */
const SPHERE_MESH = new SphereGeometry({
  radius: EARTH_RADIUS_METERS,
  nlat: 18,
  nlong: 36,
});

/**
 * Approximate H3 cell edge length in meters by resolution.
 * Source: H3 documentation — average edge length per resolution.
 */
const H3_EDGE_LENGTH_M: Record<number, number> = {
  0: 1_107_713,
  1: 418_676,
  2: 158_244,
  3: 59_811,
  4: 22_606,
  5: 8_544,
  6: 3_229,
  7: 1_220,
  8: 461,
};

/**
 * Compute user pin dimensions scaled to the current H3 resolution so the
 * pin matches the size of a single H3 hexagon cell.
 *
 * H3 circumradius ≈ edge length.  The H3HexagonLayer uses coverage=0.92,
 * so the displayed hex radius = edge * 0.92.  We match that for the head.
 */
function pinMetrics(h3Res: number, extruded: boolean) {
  const edge = H3_EDGE_LENGTH_M[h3Res] ?? 59_811 / Math.pow(2.6, h3Res - 3);
  const hexRadius = edge * 0.92; // match H3HexagonLayer coverage
  return {
    height: edge * (extruded ? 2 : 1),
    beamRadius: hexRadius * 0.08,
    headRadius: hexRadius, // same footprint as one hex cell
    dotRadius: hexRadius * 0.35,
    pulseBase: hexRadius * 0.3,
    pulseRange: hexRadius * 2.5,
  };
}

/* Theme palettes — colors for globe rendering (matched to site branding) */
const THEMES = {
  dark: {
    sphere: [12, 20, 16] as [number, number, number],
    land: [30, 70, 50] as [number, number, number],
    landOpacity: 0.18,
    borders: [50, 90, 70, 120] as [number, number, number, number],
    ambient: 0.6,
  },
  light: {
    sphere: [170, 210, 185] as [number, number, number],
    land: [80, 140, 100] as [number, number, number],
    landOpacity: 0.3,
    borders: [100, 120, 100, 160] as [number, number, number, number],
    ambient: 1.0,
  },
};

/* ------------------------------------------------------------------ */
/*  Screen position type for the user pin                              */
/* ------------------------------------------------------------------ */

export interface PinScreenPos {
  x: number;
  y: number;
  visible: boolean;
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface GlobeMapProps {
  /** Target view for the current section — globe flies here on change. */
  targetViewState: ViewState;
  layerData: Record<string, unknown>[];
  colorRange: ColorRange;
  getHexagon: (d: Record<string, unknown>) => string;
  getFillColor: (
    d: Record<string, unknown>,
    range: ColorRange
  ) => Uint8Array | [number, number, number, number];
  getElevation?: (d: Record<string, unknown>) => number;
  formatTooltip?: (d: Record<string, unknown>) => string | null;
  extruded: boolean;
  elevationScale?: number;
  /** Called when cursor enters/leaves the globe surface. */
  onCursorOverGlobe?: (isOver: boolean) => void;
  /** Called with current viewport state as user interacts with the globe. */
  onViewportChange?: (state: {
    zoom: number;
    longitude: number;
    latitude: number;
    bounds: [number, number, number, number] | null;
  }) => void;
  /** Called when the globe canvas is tapped (short touch, not a drag). */
  onTap?: () => void;
  /** User's resolved location — renders a pin on the globe when set. */
  userLocation?: UserLocation | null;
  /** Reports the screen-space position of the user pin top each frame. */
  onUserPinScreen?: (pos: PinScreenPos | null) => void;
  /** Current H3 resolution — used to scale user pin to match hexagon size. */
  h3Res?: number;
  /** Opacity for the H3 layer (controlled by LayerPanel). */
  layerOpacity?: number;
  /** Visibility for the H3 layer (controlled by LayerPanel). */
  layerVisible?: boolean;
  /** Base layer controls — visibility & opacity for land/borders. */
  baseControls?: Record<string, { visible: boolean; opacity: number }>;
  /** One-time viewport override from URL params — used only on first render. */
  initialViewStateOverride?: {
    zoom: number;
    latitude: number;
    longitude: number;
  };
  /** Called when the user starts manually interacting (drag/pinch) with the globe. */
  onInteraction?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const GlobeMap = memo(function GlobeMap({
  targetViewState,
  layerData,
  colorRange,
  getHexagon,
  getFillColor,
  getElevation,
  formatTooltip,
  extruded,
  elevationScale = 1,
  onCursorOverGlobe,
  onViewportChange,
  onTap,
  userLocation,
  onUserPinScreen,
  h3Res = 3,
  layerOpacity = 0.95,
  layerVisible = true,
  baseControls,
  initialViewStateOverride,
  onInteraction,
}: GlobeMapProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';
  const palette = isDark ? THEMES.dark : THEMES.light;
  const tapRef = useRef<{ x: number; y: number; t: number } | null>(null);

  // Animated pulse tick (0-1 repeating) for the user pin rings
  const [pulseTick, setPulseTick] = useState(0);
  useEffect(() => {
    if (!userLocation) return;
    let raf: number;
    let last = 0;
    const FRAME_MS = 1000 / 30;
    const loop = (now: number) => {
      if (now - last >= FRAME_MS) {
        last = now;
        setPulseTick((now % 2500) / 2500);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [userLocation]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const deckRef = useRef<any>(null);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Keep callback ref fresh without triggering re-renders
  const onUserPinScreenRef = useRef(onUserPinScreen);
  useEffect(() => {
    onUserPinScreenRef.current = onUserPinScreen;
  }, [onUserPinScreen]);

  const userLocationRef = useRef(userLocation);
  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  const extrudedRef = useRef(extruded);
  useEffect(() => {
    extrudedRef.current = extruded;
  }, [extruded]);

  const onViewportChangeRef = useRef(onViewportChange);
  useEffect(() => {
    onViewportChangeRef.current = onViewportChange;
  }, [onViewportChange]);

  const lastReportedViewport = useRef<{
    zoom: number;
    longitude: number;
    latitude: number;
  } | null>(null);

  // Project user pin to screen coords + report viewport bounds after each frame
  const handleAfterRender = useCallback(() => {
    const deck = deckRef.current?.deck;
    if (!deck) return;
    const viewport = deck.getViewports?.()?.[0];
    if (!viewport) return;

    // ── User pin projection ──
    const loc = userLocationRef.current;
    const pinCb = onUserPinScreenRef.current;
    if (pinCb) {
      if (!loc) {
        pinCb(null);
      } else {
        const pm = pinMetrics(h3Res, extrudedRef.current);
        try {
          const [x, y] = viewport.project([
            loc.longitude,
            loc.latitude,
            pm.height * 1.15,
          ]);
          const [bx, by] = viewport.project([loc.longitude, loc.latitude, 0]);
          const [lng2, lat2] = viewport.unproject([bx, by]);
          const dLng = Math.abs(lng2 - loc.longitude);
          const dLat = Math.abs(lat2 - loc.latitude);
          const visible =
            dLng < 20 && dLat < 20 && Number.isFinite(x) && Number.isFinite(y);
          pinCb({ x, y, visible });
        } catch {
          pinCb(null);
        }
      }
    }

    // ── Viewport bounds reporting (for H3 viewport filtering) ──
    const vpCb = onViewportChangeRef.current;
    if (vpCb) {
      try {
        const z = viewport.zoom ?? 0;
        const lng = viewport.longitude ?? 0;
        const lat = viewport.latitude ?? 0;
        const last = lastReportedViewport.current;
        if (
          !last ||
          Math.abs(z - last.zoom) > 0.01 ||
          Math.abs(lng - last.longitude) > 0.01 ||
          Math.abs(lat - last.latitude) > 0.01
        ) {
          lastReportedViewport.current = {
            zoom: z,
            longitude: lng,
            latitude: lat,
          };
          let bounds = viewport.getBounds?.() as
            | [number, number, number, number]
            | undefined;

          // Clamp bounds to the visible hemisphere — GlobeView's getBounds()
          // can return coordinates from the back side of the globe, causing
          // the H3 viewport filter to query the wrong hemisphere.
          if (bounds) {
            // Max visible angular radius from center — generous enough to
            // cover the full visible globe surface but prevents wrapping to
            // the opposite hemisphere.  h3-viewport.ts adds its own padding.
            const maxHalf = Math.min(
              90,
              180 / Math.pow(2, Math.max(0, z - 1.5))
            );
            const [bW, bS, bE, bN] = bounds;
            bounds = [
              Math.max(bW, lng - maxHalf),
              Math.max(bS, lat - maxHalf),
              Math.min(bE, lng + maxHalf),
              Math.min(bN, lat + maxHalf),
            ];
          }

          if (process.env.NODE_ENV !== 'production') {
            console.log(
              `[Globe:Map] viewport z=${z.toFixed(2)} lng=${lng.toFixed(1)} lat=${lat.toFixed(1)} bounds=${
                bounds
                  ? `[${bounds.map((v) => v.toFixed(1)).join(', ')}]`
                  : 'null'
              }`
            );
          }
          vpCb({
            zoom: z,
            longitude: lng,
            latitude: lat,
            bounds: bounds ?? null,
          });
        }
      } catch {
        /* viewport may not support getBounds */
      }
    }
  }, []);

  // deck.gl manages internal state — animates to new position on change.
  // On first render, use URL override (no transition); afterwards fly-to
  // only when targetViewState actually changes (i.e. section switch).
  const usedOverrideRef = useRef(false);
  const initialViewState = useMemo(() => {
    if (!usedOverrideRef.current && initialViewStateOverride) {
      usedOverrideRef.current = true;
      return {
        longitude: initialViewStateOverride.longitude,
        latitude: initialViewStateOverride.latitude,
        zoom: initialViewStateOverride.zoom,
        transitionDuration: 0,
      };
    }
    return {
      longitude: targetViewState.longitude,
      latitude: targetViewState.latitude,
      zoom: targetViewState.zoom,
      transitionDuration: 1500,
      transitionInterpolator: TRANSITION_INTERPOLATOR,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    targetViewState.longitude,
    targetViewState.latitude,
    targetViewState.zoom,
  ]);

  const effects = useMemo(
    () => [
      new LightingEffect({
        ambientLight: new AmbientLight({
          color: [255, 255, 255],
          intensity: palette.ambient,
        }),
      }),
    ],
    [palette.ambient]
  );

  /* eslint-disable @typescript-eslint/no-explicit-any */

  // Static base layers: earth sphere, satellite tiles, land, borders.
  // Separated from data layer so timestep changes (every 2s during
  // autoplay) don't rebuild these expensive layers.
  const staticLayers = useMemo(
    (): any[] => [
      // Z-ordering via polygonOffset (higher = further back):
      //   sphere [50,50] → satellite tiles [30,30] → land [20,20] → borders [10,10] → H3 (front)

      // 1. Earth sphere — ocean background (pickable for cursor detection)
      new SimpleMeshLayer({
        id: 'earth-sphere',
        data: [0],
        mesh: SPHERE_MESH,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPosition: () => [0, 0, 0],
        getColor: palette.sphere,
        pickable: true,
        parameters: { depthTest: true, polygonOffset: [50, 50] },
      }),

      // 2. EOX Sentinel-2 cloudless 2024 satellite tiles
      new TileLayer({
        id: BASE_SATELLITE_ID,
        data: SATELLITE_TILE_URL,
        minZoom: 0,
        maxZoom: 18,
        tileSize: 256,
        maxRequests: 20,
        visible: baseControls?.[BASE_SATELLITE_ID]?.visible ?? false,
        opacity: baseControls?.[BASE_SATELLITE_ID]?.opacity ?? 0.8,
        renderSubLayers: (props: Record<string, unknown>) => {
          const tile = props.tile as {
            boundingBox: [[number, number], [number, number]];
          };
          const {
            boundingBox: [[west, south], [east, north]],
          } = tile;
          return new BitmapLayer({
            ...props,
            data: undefined,
            image: props.data as string,
            bounds: [west, south, east, north] as [
              number,
              number,
              number,
              number,
            ],
            parameters: { depthTest: true, polygonOffset: [30, 30] },
          });
        },
      }),

      // 3. Land masses
      new GeoJsonLayer({
        id: 'earth-land',
        data: LAND_GEOJSON,
        visible: baseControls?.[BASE_LAND_ID]?.visible ?? false,
        stroked: false,
        filled: true,
        opacity: baseControls?.[BASE_LAND_ID]?.opacity ?? palette.landOpacity,
        getFillColor: palette.land,
        parameters: { depthTest: true, polygonOffset: [20, 20] },
      }),

      // 4. Country borders
      new GeoJsonLayer({
        id: 'country-borders',
        data: COUNTRY_BORDERS,
        visible: baseControls?.[BASE_BORDERS_ID]?.visible ?? false,
        stroked: true,
        filled: false,
        lineWidthMinPixels: 0.5,
        opacity: baseControls?.[BASE_BORDERS_ID]?.opacity ?? 1,
        getLineColor: palette.borders,
        parameters: { depthTest: true, polygonOffset: [10, 10] },
      }),
    ],
    [palette, baseControls]
  );

  // H3 data layer — rebuilt when layerData/colors/style change
  // (e.g. on each timestep tick during autoplay).
  const dataLayer = useMemo((): any[] => {
    if (layerData.length === 0 || !layerVisible) return [];
    return [
      new H3HexagonLayer({
        id: 'h3-layer',
        data: layerData,
        pickable: true,
        filled: true,
        highPrecision: true,
        extruded,
        elevationScale,
        getHexagon: getHexagon as (d: unknown) => string,
        getFillColor: (d: unknown) =>
          getFillColor(d as Record<string, unknown>, colorRange),
        getElevation:
          (getElevation as ((d: unknown) => number) | undefined) ?? (() => 0),
        opacity: layerOpacity,
        coverage: 0.92,
        material: {
          ambient: 0.64,
          diffuse: 0.6,
          shininess: 32,
        },
        updateTriggers: {
          getFillColor: [colorRange.min, colorRange.max, extruded],
          getElevation: [extruded, elevationScale],
        },
      }),
    ];
  }, [
    layerData,
    colorRange,
    getHexagon,
    getFillColor,
    getElevation,
    extruded,
    elevationScale,
    layerOpacity,
    layerVisible,
  ]);

  // Static pin layers: dot + beam + head. Rebuild only on userLocation/h3Res/extruded change.
  const staticPinLayers = useMemo((): any[] => {
    if (!userLocation) return [];
    const pinPos = [userLocation.longitude, userLocation.latitude] as [
      number,
      number,
    ];
    const pm = pinMetrics(h3Res, extruded);
    return [
      new ScatterplotLayer({
        id: 'user-pin-center',
        data: [{ position: pinPos }],
        getPosition: (d: { position: [number, number] }) => d.position,
        getRadius: pm.dotRadius,
        getFillColor: [255, 220, 40, 200],
        radiusMinPixels: 5,
        radiusMaxPixels: 14,
      }),
      new ColumnLayer({
        id: 'user-pin-column',
        data: [{ position: pinPos }],
        getPosition: (d: { position: [number, number] }) => d.position,
        getElevation: pm.height,
        diskResolution: 12,
        radius: pm.beamRadius,
        getFillColor: [255, 200, 0, 130],
        extruded: true,
        material: { ambient: 0.9, diffuse: 0.3, shininess: 32 },
      }),
      new ColumnLayer({
        id: 'user-pin-head',
        data: [{ position: pinPos }],
        getPosition: (d: { position: [number, number] }) => d.position,
        getElevation: pm.height * 1.1,
        offset: [0, 0],
        diskResolution: 6,
        radius: pm.headRadius,
        getFillColor: [255, 220, 40, 230],
        extruded: true,
        material: { ambient: 0.95, diffuse: 0.5, shininess: 64 },
      }),
    ];
  }, [userLocation, h3Res, extruded]);

  // Pulse rings only: rebuilt every pulseTick (30fps).
  const pulseLayers = useMemo((): any[] => {
    if (!userLocation) return [];
    const pinPos = [userLocation.longitude, userLocation.latitude] as [
      number,
      number,
    ];
    const pm = pinMetrics(h3Res, extruded);
    const result: any[] = [];
    const PULSE_COUNT = 3;
    for (let i = 0; i < PULSE_COUNT; i++) {
      const phase = (pulseTick + i / PULSE_COUNT) % 1;
      const radius = pm.pulseBase + phase * pm.pulseRange;
      const alpha = Math.round((1 - phase) * 180);
      result.push(
        new ScatterplotLayer({
          id: `user-pulse-${i}`,
          data: [{ position: pinPos }],
          getPosition: (d: { position: [number, number] }) => d.position,
          getRadius: radius,
          getFillColor: [255, 200, 0, Math.round(alpha * 0.15)],
          getLineColor: [255, 200, 0, alpha],
          stroked: true,
          filled: true,
          lineWidthMinPixels: 1.5,
          radiusMinPixels: 4,
          radiusMaxPixels: 60,
        })
      );
    }
    return result;
  }, [pulseTick, userLocation, extruded, h3Res]);

  // Combined layers — static base → data → pin (front to back via polygonOffset).
  const layers = useMemo(
    () => [...staticLayers, ...dataLayer, ...staticPinLayers, ...pulseLayers],
    [staticLayers, dataLayer, staticPinLayers, pulseLayers]
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // ── Custom reactive tooltip ──
  // deck.gl's getTooltip only fires on pointer-move. During timeseries
  // playback the data changes under a stationary cursor, so we track
  // the hovered H3 index + screen position and derive tooltip text from
  // the current layerData reactively.
  //
  // We use a ref + forceUpdate to avoid re-render loops: the 60fps
  // pulseTick loop reconstructs layers, which can re-trigger onHover —
  // using setState here would create an infinite render cascade.
  const hoverRef = useRef<{ h3: string; x: number; y: number } | null>(null);
  const [, forceTooltip] = useState(0);

  const handleHover = useCallback(
    (info: PickingInfo) => {
      onCursorOverGlobe?.(info.coordinate != null);
      if (info.object) {
        const d = info.object as Record<string, unknown>;
        const h3 = getHexagon(d);
        if (h3) {
          const prev = hoverRef.current;
          if (
            !prev ||
            prev.h3 !== h3 ||
            prev.x !== info.x ||
            prev.y !== info.y
          ) {
            hoverRef.current = { h3, x: info.x, y: info.y };
            forceTooltip((n) => n + 1);
          }
          return;
        }
      }
      if (hoverRef.current) {
        hoverRef.current = null;
        forceTooltip((n) => n + 1);
      }
    },
    [onCursorOverGlobe, getHexagon]
  );

  // Re-derive tooltip from current layerData whenever data or hover changes
  const hoverInfo = hoverRef.current;
  const tooltipText = useMemo(() => {
    if (!hoverInfo) return null;
    const row = layerData.find((r) => getHexagon(r) === hoverInfo.h3);
    if (!row) return null;
    if (formatTooltip) return formatTooltip(row);
    return `H3: ${hoverInfo.h3}`;
  }, [hoverInfo, layerData, getHexagon, formatTooltip]);

  return (
    <div
      className="globe-bg absolute inset-0"
      onPointerDown={(e) => {
        tapRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
        onInteraction?.();
      }}
      onPointerUp={(e) => {
        const s = tapRef.current;
        if (!s) return;
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;
        const dt = Date.now() - s.t;
        // Short press + minimal movement = tap
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 300) {
          onTap?.();
        }
        tapRef.current = null;
      }}
    >
      <DeckGL
        ref={deckRef}
        views={GLOBE_VIEW}
        initialViewState={initialViewState}
        controller={true}
        effects={effects}
        layers={layers}
        onHover={handleHover}
        onAfterRender={handleAfterRender}
        style={{ width: '100%', height: '100%' }}
      />
      {tooltipText && hoverInfo && (
        <div
          className="border-border bg-popover text-popover-foreground pointer-events-none absolute z-50 max-w-xs rounded border px-2.5 py-2.5 whitespace-pre-line shadow-lg backdrop-blur-sm"
          style={{
            left: hoverInfo.x + 12,
            top: hoverInfo.y,
            transform: 'translateY(-50%)',
          }}
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
});

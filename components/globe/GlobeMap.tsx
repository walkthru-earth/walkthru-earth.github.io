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
import { GeoJsonLayer, ColumnLayer, ScatterplotLayer } from '@deck.gl/layers';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { SphereGeometry } from '@luma.gl/engine';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import type { ViewState, ColorRange } from './data/sections';
import { BASE_LAND_ID, BASE_BORDERS_ID } from './data/constants';
import type { UserLocation } from './hooks/useUserLocation';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const EARTH_RADIUS_METERS = 6.3e6;
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

/** Base height of the user location beam in meters — overridden when extruded layers are tall */
const USER_PIN_HEIGHT_BASE = 1_200_000;
const USER_PIN_HEIGHT_EXTRUDED = 3_500_000;

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
  /** Opacity for the H3 layer (controlled by LayerPanel). */
  layerOpacity?: number;
  /** Visibility for the H3 layer (controlled by LayerPanel). */
  layerVisible?: boolean;
  /** Base layer controls — visibility & opacity for land/borders. */
  baseControls?: Record<string, { visible: boolean; opacity: number }>;
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
  layerOpacity = 0.85,
  layerVisible = true,
  baseControls,
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
    const loop = () => {
      // 2.5 second cycle
      setPulseTick((Date.now() % 2500) / 2500);
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
        const pinH = extrudedRef.current
          ? USER_PIN_HEIGHT_EXTRUDED
          : USER_PIN_HEIGHT_BASE;
        try {
          const [x, y] = viewport.project([
            loc.longitude,
            loc.latitude,
            pinH + 120_000,
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
          const bounds = viewport.getBounds?.() as
            | [number, number, number, number]
            | undefined;
          console.log(
            `[Globe:Map] viewport z=${z.toFixed(2)} lng=${lng.toFixed(1)} lat=${lat.toFixed(1)} bounds=${
              bounds
                ? `[${bounds.map((v) => v.toFixed(1)).join(', ')}]`
                : 'null'
            }`
          );
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

  // deck.gl manages internal state — animates to new position on change
  const initialViewState = useMemo(() => {
    return {
      longitude: targetViewState.longitude,
      latitude: targetViewState.latitude,
      zoom: targetViewState.zoom,
      transitionDuration: 1500,
      transitionInterpolator: TRANSITION_INTERPOLATOR,
    };
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

  // Base layers: earth sphere, land, borders, H3 hexagon layer.
  // Separated from pin layers so pulseTick (60fps) does not cause
  // expensive H3HexagonLayer reconstruction every frame.
  const baseLayers = useMemo((): any[] => {
    const result: any[] = [
      // 1. Earth sphere — ocean background (pickable for cursor detection)
      new SimpleMeshLayer({
        id: 'earth-sphere',
        data: [0],
        mesh: SPHERE_MESH,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPosition: () => [0, 0, 0],
        getColor: palette.sphere,
        pickable: true,
      }),

      // 2. Land masses
      new GeoJsonLayer({
        id: 'earth-land',
        data: LAND_GEOJSON,
        visible:
          baseControls?.[BASE_LAND_ID]?.visible ?? layerData.length === 0,
        stroked: false,
        filled: true,
        opacity: baseControls?.[BASE_LAND_ID]?.opacity ?? palette.landOpacity,
        getFillColor: palette.land,
      }),

      // 3. Country borders
      new GeoJsonLayer({
        id: 'country-borders',
        data: COUNTRY_BORDERS,
        visible:
          baseControls?.[BASE_BORDERS_ID]?.visible ?? layerData.length === 0,
        stroked: true,
        filled: false,
        lineWidthMinPixels: 0.5,
        opacity: baseControls?.[BASE_BORDERS_ID]?.opacity ?? 1,
        getLineColor: palette.borders,
      }),
    ];

    // 4. H3 data layer
    console.log(
      `[Globe:Map] baseLayers rebuild: layerData=${layerData.length} visible=${layerVisible} opacity=${layerOpacity} extruded=${extruded}`
    );
    if (layerData.length > 0 && layerVisible) {
      result.push(
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
            getFillColor: [getFillColor, colorRange.min, colorRange.max],
            getElevation: [getElevation],
          },
        })
      );
    }

    return result;
  }, [
    layerData,
    colorRange,
    getHexagon,
    getFillColor,
    getElevation,
    extruded,
    elevationScale,
    palette,
    layerOpacity,
    layerVisible,
    baseControls,
  ]);

  // Pin layers: user location pulse rings, center dot, beam, and head.
  // These depend on pulseTick (60fps) but are cheap to reconstruct.
  const pinLayers = useMemo((): any[] => {
    if (!userLocation) return [];

    const pinPos = [userLocation.longitude, userLocation.latitude] as [
      number,
      number,
    ];
    const pinH = extruded ? USER_PIN_HEIGHT_EXTRUDED : USER_PIN_HEIGHT_BASE;
    const result: any[] = [];

    // Expanding pulse rings (3 staggered waves)
    const PULSE_COUNT = 3;
    for (let i = 0; i < PULSE_COUNT; i++) {
      const phase = (pulseTick + i / PULSE_COUNT) % 1;
      const radius = 40_000 + phase * 300_000;
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

    // Static base dot
    result.push(
      new ScatterplotLayer({
        id: 'user-pin-center',
        data: [{ position: pinPos }],
        getPosition: (d: { position: [number, number] }) => d.position,
        getRadius: 35_000,
        getFillColor: [255, 220, 40, 200],
        radiusMinPixels: 5,
        radiusMaxPixels: 14,
      })
    );

    // Vertical column beam — amber/gold
    result.push(
      new ColumnLayer({
        id: 'user-pin-column',
        data: [{ position: pinPos }],
        getPosition: (d: { position: [number, number] }) => d.position,
        getElevation: pinH,
        diskResolution: 12,
        radius: 10_000,
        getFillColor: [255, 200, 0, 130],
        extruded: true,
        material: {
          ambient: 0.9,
          diffuse: 0.3,
          shininess: 32,
        },
      })
    );

    // Top marker — hexagonal head in bright yellow
    result.push(
      new ColumnLayer({
        id: 'user-pin-head',
        data: [{ position: pinPos }],
        getPosition: (d: { position: [number, number] }) => d.position,
        getElevation: pinH + 120_000,
        offset: [0, 0],
        diskResolution: 6,
        radius: 40_000,
        getFillColor: [255, 220, 40, 230],
        extruded: true,
        material: {
          ambient: 0.95,
          diffuse: 0.5,
          shininess: 64,
        },
      })
    );

    return result;
  }, [pulseTick, userLocation, extruded]);

  // Combined layers — pin layers render on top of base layers.
  const layers = useMemo(
    () => [...baseLayers, ...pinLayers],
    [baseLayers, pinLayers]
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const handleTooltip = useMemo(() => {
    return ({ object }: PickingInfo) => {
      if (!object) return null;
      const d = object as Record<string, unknown>;
      if (formatTooltip) return formatTooltip(d);
      return d.h3_index ? `H3: ${d.h3_index}` : null;
    };
  }, [formatTooltip]);

  // Detect whether cursor is over the globe surface (any layer picked = on globe)
  const handleHover = useCallback(
    (info: PickingInfo) => {
      onCursorOverGlobe?.(info.coordinate != null);
    },
    [onCursorOverGlobe]
  );

  return (
    <div
      className="globe-bg absolute inset-0"
      onPointerDown={(e) => {
        tapRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
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
        getTooltip={handleTooltip}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
});

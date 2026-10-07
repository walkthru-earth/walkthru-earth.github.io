'use client';

import { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import DeckGL, { type DeckGLRef } from '@deck.gl/react';
import { useH3Data } from './hooks/useH3Data';
import {
  _GlobeView as GlobeView,
  COORDINATE_SYSTEM,
  LightingEffect,
  AmbientLight,
  LinearInterpolator,
  type PickingInfo,
  type Layer,
  type Viewport,
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
import { capExtrusionScale } from './utils/globe-rendering';

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

// The Cartesian background mesh only represents the earth in spherical
// coordinates. GlobeView switches to a Mercator viewport above zoom 12.
const filterLayers = ({
  layer,
  viewport,
}: {
  layer: Layer;
  viewport: Viewport;
}) => layer.id !== 'earth-sphere' || 'resolution' in viewport;

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
 * H3 circumradius ≈ edge length. The H3HexagonLayer uses full coverage,
 * so the displayed hex radius matches the edge length.
 */
function pinMetrics(h3Res: number, extruded: boolean) {
  const edge = H3_EDGE_LENGTH_M[h3Res] ?? 59_811 / Math.pow(2.6, h3Res - 3);
  const hexRadius = edge;
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
  targetViewState?: ViewState;
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

  const deckRef = useRef<DeckGLRef>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const handleRenderError = useCallback(
    (error: Error) => setRenderError(error.message),
    []
  );
  const { hexagons, lookup } = useH3Data(layerData, getHexagon);
  const maxRawElevation = useMemo(() => {
    if (!extruded || !getElevation) return 0;
    let maximum = 0;
    for (const row of layerData) {
      const elevation = getElevation(row);
      if (Number.isFinite(elevation)) maximum = Math.max(maximum, elevation);
    }
    return maximum;
  }, [layerData, getElevation, extruded]);
  const [cameraAltitude, setCameraAltitude] = useState(0);
  const cappedElevationScale = extruded
    ? capExtrusionScale(elevationScale, maxRawElevation, cameraAltitude)
    : elevationScale;

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
    width: number;
    height: number;
    bearing: number;
    pitch: number;
  } | null>(null);

  // Project user pin to screen coords + report viewport bounds after each frame
  const handleAfterRender = useCallback(() => {
    const deck = deckRef.current?.deck;
    if (!deck) return;
    const viewport = deck.getViewports?.()?.[0];
    if (!viewport) return;

    // Keep extrusions below the camera in both spherical and Mercator views.
    // Publish only changes that affect the cap, rather than every drawn frame.
    if (extruded && maxRawElevation > 0) {
      const altitude = viewport.unprojectPosition(viewport.cameraPosition)[2];
      if (Number.isFinite(altitude) && altitude > 0) {
        setCameraAltitude((previous) => {
          const oldScale = capExtrusionScale(
            elevationScale,
            maxRawElevation,
            previous
          );
          const nextScale = capExtrusionScale(
            elevationScale,
            maxRawElevation,
            altitude
          );
          return nextScale < oldScale || nextScale > oldScale * 1.01
            ? altitude
            : previous;
        });
      }
    }

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
        const lng = 'longitude' in viewport ? Number(viewport.longitude) : 0;
        const lat = 'latitude' in viewport ? Number(viewport.latitude) : 0;
        const bearing = 'bearing' in viewport ? Number(viewport.bearing) : 0;
        const pitch = 'pitch' in viewport ? Number(viewport.pitch) : 0;
        const last = lastReportedViewport.current;
        if (
          !last ||
          Math.abs(z - last.zoom) > 0.01 ||
          Math.abs(lng - last.longitude) > 0.01 ||
          Math.abs(lat - last.latitude) > 0.01 ||
          viewport.width !== last.width ||
          viewport.height !== last.height ||
          bearing !== last.bearing ||
          pitch !== last.pitch
        ) {
          lastReportedViewport.current = {
            zoom: z,
            longitude: lng,
            latitude: lat,
            width: viewport.width,
            height: viewport.height,
            bearing,
            pitch,
          };
          const bounds = viewport.getBounds?.() as
            [number, number, number, number] | undefined;

          // Preserve deck.gl's bounds. A zoom-derived longitude/latitude
          // clamp loses visible data, especially across the dateline or poles.
          // h3-viewport handles wrapping and bounds predicate cost by coarsening.

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
  }, [h3Res, extruded, elevationScale, maxRawElevation]);

  // deck.gl manages internal state — animates to new position on change.
  // On first render, use URL override (no transition); afterwards fly-to
  // only when targetViewState actually changes (i.e. section switch).
  const [cameraRequest, setCameraRequest] = useState(() => ({
    target: targetViewState,
    override: initialViewStateOverride,
  }));
  // A URL camera applies to the initial section only. Keep render calculations
  // pure: Strict Mode can call memo factories twice before committing them.
  if (cameraRequest.target !== targetViewState) {
    setCameraRequest({ target: targetViewState, override: undefined });
  }
  const initialViewState = useMemo(() => {
    if (cameraRequest.override && cameraRequest.target === targetViewState) {
      return {
        longitude: cameraRequest.override.longitude,
        latitude: cameraRequest.override.latitude,
        zoom: cameraRequest.override.zoom,
        transitionDuration: 0,
      };
    }
    if (!targetViewState) return undefined;
    return {
      longitude: targetViewState.longitude,
      latitude: targetViewState.latitude,
      zoom: targetViewState.zoom,
      transitionDuration: 1500,
      transitionInterpolator: TRANSITION_INTERPOLATOR,
    };
  }, [cameraRequest, targetViewState]);

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

  // Static base layers: earth sphere, satellite tiles, land, borders.
  // Separated from data layer so timestep changes (every 2s during
  // autoplay) don't rebuild these expensive layers.
  const staticLayers = useMemo(
    (): Layer[] => [
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
        parameters: { depthCompare: 'less-equal' },
        getPolygonOffset: () => [50, 50],
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
            // EOX tiles use Web Mercator, including while the geometry is
            // projected onto the globe. Do not interpolate their Y in latitude.
            _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            bounds: [west, south, east, north] as [
              number,
              number,
              number,
              number,
            ],
            parameters: {
              depthCompare: 'less-equal',
              depthWriteEnabled: false,
            },
            getPolygonOffset: () => [30, 30],
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
        parameters: { depthCompare: 'less-equal', depthWriteEnabled: false },
        getPolygonOffset: () => [20, 20],
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
        parameters: { depthCompare: 'less-equal', depthWriteEnabled: false },
        getPolygonOffset: () => [10, 10],
      }),
    ],
    [palette, baseControls]
  );

  // H3 data layer — rebuilt when layerData/colors/style change
  // (e.g. on each timestep tick during autoplay).
  const dataLayer = useMemo((): Layer[] => {
    if (layerData.length === 0 || !layerVisible) return [];
    return [
      new H3HexagonLayer<string>({
        id: 'h3-layer',
        data: hexagons,
        pickable: true,
        filled: true,
        // Flat cells need only the fill; PolygonLayer otherwise also creates
        // a PathLayer for every boundary, including another picking draw.
        stroked: false,
        highPrecision: true,
        extruded,
        elevationScale: cappedElevationScale,
        getHexagon: (hex) => hex,
        getFillColor: (_hex, { index }) =>
          getFillColor(layerData[index], colorRange),
        getElevation: (_hex, { index }) =>
          getElevation?.(layerData[index]) ?? 0,
        opacity: layerOpacity,
        coverage: 1,
        material: {
          ambient: 0.64,
          diffuse: 0.6,
          shininess: 32,
        },
        updateTriggers: {
          getFillColor: [
            layerData,
            getFillColor,
            colorRange.min,
            colorRange.max,
          ],
          getElevation: [layerData, getElevation],
        },
      }),
    ];
  }, [
    hexagons,
    layerData,
    colorRange,
    getFillColor,
    getElevation,
    extruded,
    cappedElevationScale,
    layerOpacity,
    layerVisible,
  ]);

  // Static pin layers: dot + beam + head. Rebuild only on userLocation/h3Res/extruded change.
  const staticPinLayers = useMemo((): Layer[] => {
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

  // Static location rings keep the globe idle when the user is not interacting.
  const pulseLayers = useMemo((): Layer[] => {
    if (!userLocation) return [];
    const pinPos = [userLocation.longitude, userLocation.latitude] as [
      number,
      number,
    ];
    const pm = pinMetrics(h3Res, extruded);
    const result: Layer[] = [];
    const PULSE_COUNT = 3;
    for (let i = 0; i < PULSE_COUNT; i++) {
      const phase = (i + 1) / (PULSE_COUNT + 1);
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
  }, [userLocation, extruded, h3Res]);

  // Combined layers — static base → data → pin (front to back via polygonOffset).
  const layers = useMemo(
    () => [...staticLayers, ...dataLayer, ...staticPinLayers, ...pulseLayers],
    [staticLayers, dataLayer, staticPinLayers, pulseLayers]
  );

  // ── Custom reactive tooltip ──
  // deck.gl's getTooltip only fires on pointer-move. During timeseries
  // playback the data changes under a stationary cursor, so we track
  // the hovered H3 index + screen position and derive tooltip text from
  // the current layerData reactively.
  //
  // Identical picks retain state identity, so redraws cannot trigger a loop.
  const [hoverInfo, setHoverInfo] = useState<{
    h3: string;
    x: number;
    y: number;
  } | null>(null);

  const handleHover = useCallback(
    (info: PickingInfo) => {
      const coordinate = info.coordinate;
      let overGlobe = Boolean(
        coordinate &&
        Number.isFinite(coordinate[0]) &&
        Number.isFinite(coordinate[1])
      );
      if (
        overGlobe &&
        !info.picked &&
        info.viewport &&
        'resolution' in info.viewport
      ) {
        // Globe unproject clamps rays that miss the sphere to its horizon.
        // A surface coordinate must project back to the original pointer.
        const [x, y] = info.viewport.project(coordinate!);
        overGlobe =
          Math.abs(x + info.viewport.x - info.x) < 2 &&
          Math.abs(y + info.viewport.y - info.y) < 2;
      }
      onCursorOverGlobe?.(overGlobe);
      if (info.object) {
        const h3 =
          info.layer?.id === 'h3-layer' && typeof info.object === 'string'
            ? info.object
            : '';
        if (h3) {
          setHoverInfo((previous) =>
            previous?.h3 === h3 &&
            previous.x === info.x &&
            previous.y === info.y
              ? previous
              : { h3, x: info.x, y: info.y }
          );
          return;
        }
      }
      setHoverInfo(null);
    },
    [onCursorOverGlobe]
  );

  // Re-derive tooltip from current layerData whenever data or hover changes
  const tooltipText = useMemo(() => {
    if (!hoverInfo) return null;
    const row = lookup.get(hoverInfo.h3);
    if (!row) return null;
    if (formatTooltip) return formatTooltip(row);
    return `H3: ${hoverInfo.h3}`;
  }, [hoverInfo, lookup, formatTooltip]);

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
        useDevicePixels={Math.min(2, window.devicePixelRatio || 1)}
        effects={effects}
        layers={layers}
        layerFilter={filterLayers}
        onHover={handleHover}
        onAfterRender={handleAfterRender}
        onError={handleRenderError}
        style={{ width: '100%', height: '100%' }}
      />
      {renderError && (
        <p
          role="alert"
          className="bg-background/95 text-foreground absolute top-20 right-4 z-30 max-w-sm rounded-xl border p-4 text-sm"
        >
          The globe could not be rendered. Reload the page or try a browser with
          WebGL enabled.
        </p>
      )}
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

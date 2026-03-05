'use client';

import { memo, useMemo, useCallback } from 'react';
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
import { GeoJsonLayer } from '@deck.gl/layers';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { SphereGeometry } from '@luma.gl/engine';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import type { ViewState, ColorRange } from './data/sections';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const EARTH_RADIUS_METERS = 6.3e6;
const LAND_GEOJSON =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson';
const COUNTRY_BORDERS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_boundary_lines_land.geojson';

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

/* Theme palettes — colors for globe rendering */
const THEMES = {
  dark: {
    background: 'linear-gradient(0deg, #000, #112)',
    sphere: [10, 15, 30] as [number, number, number],
    land: [40, 80, 120] as [number, number, number],
    landOpacity: 0.15,
    borders: [60, 100, 140, 120] as [number, number, number, number],
    ambient: 0.6,
  },
  light: {
    background: 'linear-gradient(0deg, #d4e6f1, #eaf2f8)',
    sphere: [160, 200, 230] as [number, number, number],
    land: [80, 140, 80] as [number, number, number],
    landOpacity: 0.3,
    borders: [100, 100, 100, 160] as [number, number, number, number],
    ambient: 1.0,
  },
};

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
  ) => [number, number, number, number];
  getElevation?: (d: Record<string, unknown>) => number;
  formatTooltip?: (d: Record<string, unknown>) => string | null;
  extruded: boolean;
  elevationScale?: number;
  /** Called when cursor enters/leaves the globe surface. */
  onCursorOverGlobe?: (isOver: boolean) => void;
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
}: GlobeMapProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';
  const palette = isDark ? THEMES.dark : THEMES.light;

  // deck.gl manages internal state — animates to new position on change
  const initialViewState = useMemo(() => {
    console.log(
      `[DeckGL] View transition → lon=${targetViewState.longitude}, lat=${targetViewState.latitude}, zoom=${targetViewState.zoom}`
    );
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
  const layers = useMemo((): any[] => {
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

      // 2. Land masses (hidden when H3 data covers the globe)
      new GeoJsonLayer({
        id: 'earth-land',
        data: LAND_GEOJSON,
        visible: layerData.length === 0,
        stroked: false,
        filled: true,
        opacity: palette.landOpacity,
        getFillColor: palette.land,
      }),

      // 3. Country borders (hidden when H3 data covers the globe)
      new GeoJsonLayer({
        id: 'country-borders',
        data: COUNTRY_BORDERS,
        visible: layerData.length === 0,
        stroked: true,
        filled: false,
        lineWidthMinPixels: 0.5,
        getLineColor: palette.borders,
      }),
    ];

    // 4. H3 data layer
    if (layerData.length > 0) {
      console.log(
        `[DeckGL] Adding H3 layer: ${layerData.length} hexagons, extruded=${extruded}, elevationScale=${elevationScale}, colorRange=[${colorRange.min.toFixed(1)}, ${colorRange.max.toFixed(1)}]`
      );
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
          getFillColor: ((d: unknown) =>
            getFillColor(d as Record<string, unknown>, colorRange)) as (
            d: unknown
          ) => [number, number, number, number],
          getElevation:
            (getElevation as ((d: unknown) => number) | undefined) ?? (() => 0),
          opacity: 0.85,
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

    console.log(
      `[DeckGL] Layers: ${result.map((l: { id: string }) => l.id).join(', ')} | land/borders visible=${layerData.length === 0}`
    );

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
  ]);
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
      style={{ position: 'absolute', inset: 0, background: palette.background }}
    >
      <DeckGL
        views={GLOBE_VIEW}
        initialViewState={initialViewState}
        controller={true}
        effects={effects}
        layers={layers}
        onHover={handleHover}
        getTooltip={handleTooltip}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
});

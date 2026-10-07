import {
  _GlobeView as GlobeView,
  _GlobeViewport as GlobeViewport,
  WebMercatorViewport,
} from '@deck.gl/core';
import { describe, expect, it } from 'vitest';
import { capExtrusionScale } from './globe-rendering';

const view = new GlobeView({ id: 'globe', resolution: 5 });
const MAX_TERRAIN_ELEVATION = 8_000;

describe('globe extrusion clipping', () => {
  it('preserves the requested exaggeration when the camera has room', () => {
    expect(capExtrusionScale(50, MAX_TERRAIN_ELEVATION, 6_000_000)).toBe(50);
    expect(capExtrusionScale(1, 0, 10)).toBe(1);
  });

  it.each([
    { width: 1440, height: 900, latitude: 28.5, zoom: 8, pitch: 0 },
    { width: 390, height: 844, latitude: 28.5, zoom: 10, pitch: 0 },
    { width: 844, height: 390, latitude: 28.5, zoom: 10, pitch: 0 },
    { width: 1440, height: 900, latitude: 90, zoom: 10, pitch: 0 },
    { width: 1440, height: 900, latitude: -90, zoom: 10, pitch: 0 },
    { width: 1440, height: 900, latitude: 28.5, zoom: 10, pitch: 60 },
    { width: 1440, height: 900, latitude: 28.5, zoom: 12, pitch: 0 },
    { width: 1440, height: 900, latitude: 28.5, zoom: 12.1, pitch: 0 },
    { width: 390, height: 844, latitude: 28.5, zoom: 14, pitch: 60 },
  ])(
    'keeps the highest terrain below the camera at $width×$height, latitude $latitude, zoom $zoom, pitch $pitch',
    ({ width, height, latitude, zoom, pitch }) => {
      // Pitch is supported by the installed viewport but omitted from its
      // GlobeViewState declaration.
      const viewState = { latitude, longitude: 86.5, zoom, pitch };
      const viewport = view.makeViewport({
        width,
        height,
        viewState,
      })!;
      expect(viewport).toBeInstanceOf(
        zoom > 12 ? WebMercatorViewport : GlobeViewport
      );
      const cameraAltitude = viewport.unprojectPosition(
        viewport.cameraPosition
      )[2];
      expect(cameraAltitude).toBeGreaterThan(0);
      const scale = capExtrusionScale(
        50,
        MAX_TERRAIN_ELEVATION,
        cameraAltitude
      );
      expect(scale).toBeGreaterThan(0);
      expect(scale).toBeLessThan(50);
      const displayHeight = MAX_TERRAIN_ELEVATION * scale;
      expect(displayHeight).toBeLessThan(cameraAltitude);
      const projectedTip = viewport.project([86.5, latitude, displayHeight]);
      expect(projectedTip.every(Number.isFinite)).toBe(true);
      expect(projectedTip[2]).toBeGreaterThan(-1);
      expect(projectedTip[2]).toBeLessThan(1);
    }
  );

  it.each([
    [Number.NaN, 100, 1000],
    [Number.POSITIVE_INFINITY, 100, 1000],
    [-1, 100, 1000],
    [50, Number.NaN, 1000],
    [50, Number.POSITIVE_INFINITY, 1000],
    [50, -100, 1000],
    [50, 100, Number.NaN],
    [50, 100, Number.POSITIVE_INFINITY],
    [50, 100, -1000],
    [50, 100, 0],
  ])(
    'returns a finite safe scale for invalid inputs (%s, %s, %s)',
    (...args) => {
      expect(capExtrusionScale(...args)).toBe(0);
    }
  );
});

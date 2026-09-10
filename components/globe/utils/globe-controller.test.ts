import {
  _GlobeController as GlobeController,
  _GlobeView as GlobeView,
  _GlobeViewport as GlobeViewport,
  WebMercatorViewport,
  type GlobeViewState,
} from '@deck.gl/core';
import { Timeline } from '@luma.gl/engine';
import { describe, expect, it } from 'vitest';

const WIDTH = 1000;
const HEIGHT = 700;
const POINTER: [number, number] = [650, 280];
const view = new GlobeView({ id: 'globe' });

function makeViewport(props: Record<string, unknown>) {
  return view.makeViewport({
    width: WIDTH,
    height: HEIGHT,
    viewState: props as GlobeViewState,
  })!;
}

function createState(zoom: number) {
  type ControllerOptions = ConstructorParameters<typeof GlobeController>[0];
  const controller = new GlobeController({
    timeline: new Timeline(),
    // These tests exercise the real controller state without DOM event binding.
    eventManager: {} as ControllerOptions['eventManager'],
    makeViewport,
    onViewStateChange: () => {},
    onStateChange: () => {},
  });
  const state = new controller.ControllerState({
    width: WIDTH,
    height: HEIGHT,
    longitude: 30,
    latitude: 0,
    zoom,
    minZoom: 0,
    maxZoom: 18,
    makeViewport,
  });
  controller.finalize();
  return state;
}

describe('deck.gl globe zoom regression', () => {
  it.each([
    { from: 11.9, scale: 2, viewportType: WebMercatorViewport },
    { from: 13, scale: 2, viewportType: WebMercatorViewport },
    { from: 12.9, scale: 0.5, viewportType: GlobeViewport },
    { from: 10, scale: 2, viewportType: GlobeViewport },
  ])(
    'preserves the pointer anchor zooming from $from by $scale',
    ({ from, scale, viewportType }) => {
      const state = createState(from);
      const anchor = makeViewport(state.getViewportProps()).unproject(POINTER);
      const next = state.zoom({ pos: POINTER, scale });
      const props = next.getViewportProps();
      const viewport = makeViewport(props);

      expect(viewport).toBeInstanceOf(viewportType);
      expect(props.zoom).toBeCloseTo(from + Math.log2(scale), 4);
      for (const value of [
        props.longitude,
        props.latitude,
        props.zoom,
        props.bearing,
      ]) {
        expect(Number.isFinite(value)).toBe(true);
      }
      const projectedAnchor = viewport.project(anchor);
      expect(Math.abs(projectedAnchor[0] - POINTER[0])).toBeLessThan(0.1);
      expect(Math.abs(projectedAnchor[1] - POINTER[1])).toBeLessThan(0.1);
    }
  );

  it('retains high zoom navigation and respects the configured maximum', () => {
    const state = createState(17.5);
    const next = state.zoom({ pos: [WIDTH / 2, HEIGHT / 2], scale: 4 });
    const props = next.getViewportProps();

    expect(props.zoom).toBeCloseTo(18, 8);
    expect(makeViewport(props)).toBeInstanceOf(WebMercatorViewport);
    expect(props.longitude).toBeCloseTo(30, 8);
    expect(props.latitude).toBeCloseTo(0, 8);
  });

  it('respects the configured minimum when zooming out', () => {
    const state = createState(0.1);
    const next = state.zoom({ pos: [WIDTH / 2, HEIGHT / 2], scale: 0.25 });

    expect(next.getViewportProps().zoom).toBeCloseTo(0, 8);
  });
});

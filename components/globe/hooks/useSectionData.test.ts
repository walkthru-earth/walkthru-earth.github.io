/* eslint-disable react-hooks/rules-of-hooks -- The hook harness commits effects explicitly without a renderer. */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GlobeSection } from '../data/section-shared';
import type { LoadResult, Row } from '../utils/parquet-types';

// Exercise request transitions without a DOM/WebGL renderer. Each render reads
// retained hook state; effects and their cleanup are committed explicitly.
const hooks = vi.hoisted(() => ({
  value: undefined as unknown,
  effect: undefined as undefined | (() => void | (() => void)),
}));
vi.mock('react', () => ({
  useState: <T>(initial: T) => {
    hooks.value ??= initial;
    return [
      hooks.value as T,
      (update: T | ((previous: T) => T)) => {
        hooks.value =
          typeof update === 'function'
            ? (update as (previous: T) => T)(hooks.value as T)
            : update;
      },
    ];
  },
  useEffect: (effect: () => void | (() => void)) => {
    hooks.effect = effect;
  },
  useMemo: <T>(compute: () => T) => compute(),
}));

import { useSectionData } from './useSectionData';

type Request = {
  signal?: AbortSignal;
  progress?: (rows: Row[]) => void;
  resolve: (result: LoadResult) => void;
};

function fixture() {
  const requests: Request[] = [];
  const section: GlobeSection = {
    id: 'test',
    title: 'Test',
    subtitle: '',
    description: '',
    stat: { label: '', value: '' },
    viewState: { longitude: 0, latitude: 0, zoom: 1 },
    colorColumn: 'metric',
    buildQuery: () => 'SELECT metric',
    loadData: (context, progress) =>
      new Promise((resolve) => {
        requests.push({ signal: context.signal, progress, resolve });
      }),
    getFillColor: () => [0, 0, 0, 255],
    extruded: false,
    colorLegend: [],
    sourceCoopUrl: '',
    githubUrl: '',
    defaultH3Res: 1,
    h3ResRange: [1, 10],
  };
  return { section, requests };
}

beforeEach(() => {
  hooks.value = undefined;
  hooks.effect = undefined;
});

describe('useSectionData request identity', () => {
  it.each(['resolution', 'viewport'] as const)(
    'hides previous rows before committing a changed %s request and ignores its late results',
    async (change) => {
      const { section, requests } = fixture();
      const firstBounds: [string, string][] = [['1', '2']];
      useSectionData(section, 3, firstBounds);
      const cleanup = hooks.effect?.();
      await vi.waitFor(() => expect(requests).toHaveLength(1));
      requests[0].progress?.([{ h3_index: 'old', metric: 1 }]);
      expect(useSectionData(section, 3, firstBounds).rows).toHaveLength(1);

      const resolution = change === 'resolution' ? 5 : 3;
      const bounds = change === 'viewport' ? [['3', '4']] : firstBounds;
      const render = () =>
        useSectionData(section, resolution, bounds as [string, string][]);
      expect(render().rows).toEqual([]);
      expect(render().info).toBeNull();
      expect(render().loading).toBe(true);
      if (typeof cleanup === 'function') cleanup();
      hooks.effect?.();
      await vi.waitFor(() => expect(requests).toHaveLength(2));
      expect(requests[0].signal?.aborted).toBe(true);

      requests[0].progress?.([{ h3_index: 'late-old', metric: 99 }]);
      requests[0].resolve({ rows: [{ h3_index: 'late-old' }], info: null });
      await Promise.resolve();
      expect(render().rows).toEqual([]);

      requests[1].progress?.([{ h3_index: 'current', metric: 2 }]);
      expect(render().rows).toEqual([{ h3_index: 'current', metric: 2 }]);
      requests[1].resolve({
        rows: [{ h3_index: 'current', metric: 3 }],
        info: null,
      });
      await vi.waitFor(() => expect(render().loading).toBe(false));
      expect(render().rows).toEqual([{ h3_index: 'current', metric: 3 }]);
    }
  );

  it('hides retained data while the request is disabled', async () => {
    const { section, requests } = fixture();
    useSectionData(section, 1);
    hooks.effect?.();
    await vi.waitFor(() => expect(requests).toHaveLength(1));
    requests[0].progress?.([{ h3_index: 'old', metric: 1 }]);
    expect(useSectionData(section, 1).rows).toHaveLength(1);
    expect(useSectionData(section, 1, null, false).rows).toEqual([]);
  });
});

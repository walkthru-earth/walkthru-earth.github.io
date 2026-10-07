import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fallbackBasemap,
  loadBasemap,
} from '../app/capybrain/components/explorer/basemap';
import { CAPYBRAIN_MAP_STYLE } from '../app/capybrain/components/explorer/config';

type MapEvent = 'error' | 'render';
type Listener = () => void;

function createMap() {
  const listeners = new Map<MapEvent, Set<Listener>>();
  const stub = {
    on: vi.fn((type: MapEvent, listener: Listener) => {
      const current = listeners.get(type) ?? new Set<Listener>();
      current.add(listener);
      listeners.set(type, current);
      return { unsubscribe: () => current.delete(listener) };
    }),
    off: vi.fn((type: MapEvent, listener: Listener) => {
      listeners.get(type)?.delete(listener);
    }),
    setStyle: vi.fn(),
    loaded: vi.fn(() => false),
  };
  return {
    ...stub,
    map: stub as unknown as Parameters<typeof loadBasemap>[0],
    listeners,
    emit(type: MapEvent) {
      // MapLibre snapshots its listeners when firing an event.
      [...(listeners.get(type) ?? [])].forEach((listener) => listener());
    },
  };
}

describe('CapyBrain basemap lifecycle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it.each(['light', 'dark'] as const)(
    'keeps a network-free fallback for the %s theme',
    (theme) => {
      const style = fallbackBasemap(theme);
      expect(style.version).toBe(8);
      expect(style.sources).toEqual({});
      expect(style.layers).toHaveLength(1);
      expect(style.layers[0].type).toBe('background');
      expect(style.sprite).toBeUndefined();
      expect(style.glyphs).toBeUndefined();
      expect(style).not.toEqual(
        fallbackBasemap(theme === 'light' ? 'dark' : 'light')
      );
    }
  );

  it('replaces a failed URL once and does not mark its local fallback ready', () => {
    const map = createMap();
    const status = vi.fn();
    const dispose = loadBasemap(map.map, 'light', status);

    expect(status.mock.calls).toEqual([['loading']]);
    expect(map.setStyle).toHaveBeenCalledWith(CAPYBRAIN_MAP_STYLE.light, {
      diff: false,
    });

    map.emit('error');
    map.emit('error');
    map.loaded.mockReturnValue(true);
    map.emit('render');
    vi.advanceTimersByTime(30_000);

    expect(map.setStyle).toHaveBeenCalledTimes(2);
    expect(map.setStyle).toHaveBeenLastCalledWith(fallbackBasemap('light'), {
      diff: false,
    });
    expect(status.mock.calls).toEqual([['loading'], ['unavailable']]);
    dispose();
  });

  it('falls back when a style request stalls without emitting an error', () => {
    const map = createMap();
    const status = vi.fn();
    const dispose = loadBasemap(map.map, 'dark', status);

    vi.advanceTimersByTime(14_999);
    expect(map.setStyle).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(map.setStyle).toHaveBeenLastCalledWith(fallbackBasemap('dark'), {
      diff: false,
    });
    expect(status).toHaveBeenLastCalledWith('unavailable');
    expect(vi.getTimerCount()).toBe(0);
    dispose();
  });

  it('cancels the initial timeout when ready but still catches later tile failures', () => {
    const map = createMap();
    const status = vi.fn();
    const dispose = loadBasemap(map.map, 'light', status);

    map.loaded.mockReturnValue(true);
    map.emit('render');
    vi.advanceTimersByTime(30_000);
    expect(map.setStyle).toHaveBeenCalledTimes(1);
    expect(status.mock.calls).toEqual([['loading'], ['ready']]);

    map.emit('error');
    map.loaded.mockReturnValue(true);
    map.emit('render');
    expect(map.setStyle).toHaveBeenCalledTimes(2);
    expect(status.mock.calls).toEqual([
      ['loading'],
      ['ready'],
      ['unavailable'],
    ]);
    dispose();
  });

  it('does not cancel the stall timeout just because an incomplete map renders', () => {
    const map = createMap();
    const status = vi.fn();
    const dispose = loadBasemap(map.map, 'light', status);

    for (let elapsed = 0; elapsed < 14_000; elapsed += 1_000) {
      map.emit('render');
      vi.advanceTimersByTime(1_000);
    }
    expect(status.mock.calls).toEqual([['loading']]);
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(1_000);
    expect(status.mock.calls).toEqual([['loading'], ['unavailable']]);
    expect(map.setStyle).toHaveBeenLastCalledWith(fallbackBasemap('light'), {
      diff: false,
    });
    dispose();
  });

  it('accepts a loaded render without idle during continuous camera movement, announcing readiness once', () => {
    const map = createMap();
    const status = vi.fn();
    const dispose = loadBasemap(map.map, 'dark', status);

    map.emit('render');
    vi.advanceTimersByTime(14_000);
    map.loaded.mockReturnValue(true);
    map.emit('render');
    expect(vi.getTimerCount()).toBe(0);

    for (let frame = 0; frame < 20; frame += 1) map.emit('render');
    vi.advanceTimersByTime(30_000);
    expect(status.mock.calls).toEqual([['loading'], ['ready']]);
    expect(map.setStyle).toHaveBeenCalledTimes(1);
    dispose();
  });

  it('removes listeners and timers and ignores already queued callbacks on cleanup', () => {
    const map = createMap();
    const status = vi.fn();
    const dispose = loadBasemap(map.map, 'light', status);
    const queuedCallbacks = [...map.listeners.values()].flatMap((set) => [
      ...set,
    ]);

    dispose();
    expect(map.listeners.get('error')?.size).toBe(0);
    expect(map.listeners.get('render')?.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    queuedCallbacks.forEach((callback) => callback());
    vi.advanceTimersByTime(30_000);
    expect(status.mock.calls).toEqual([['loading']]);
    expect(map.setStyle).toHaveBeenCalledTimes(1);
  });

  it('starts a new theme request after cleanup without retaining the previous timeout', () => {
    const map = createMap();
    const previousStatus = vi.fn();
    const nextStatus = vi.fn();
    const disposePrevious = loadBasemap(map.map, 'light', previousStatus);
    const staleError = [...map.listeners.get('error')!][0];
    vi.advanceTimersByTime(10_000);
    disposePrevious();

    const disposeNext = loadBasemap(map.map, 'dark', nextStatus);
    staleError();
    vi.advanceTimersByTime(5_000);
    expect(map.setStyle.mock.calls).toEqual([
      [CAPYBRAIN_MAP_STYLE.light, { diff: false }],
      [CAPYBRAIN_MAP_STYLE.dark, { diff: false }],
    ]);
    expect(map.listeners.get('error')?.size).toBe(1);
    expect(map.listeners.get('render')?.size).toBe(1);
    expect(previousStatus.mock.calls).toEqual([['loading']]);

    map.loaded.mockReturnValue(true);
    map.emit('render');
    vi.advanceTimersByTime(30_000);
    expect(nextStatus.mock.calls).toEqual([['loading'], ['ready']]);
    expect(map.setStyle).toHaveBeenCalledTimes(2);
    disposeNext();
  });

  it('can explicitly retry a failed theme and recover to ready', () => {
    const map = createMap();
    const status = vi.fn();
    const disposeFailed = loadBasemap(map.map, 'light', status);
    map.emit('error');
    disposeFailed();

    const disposeRetry = loadBasemap(map.map, 'light', status);
    expect(map.setStyle).toHaveBeenLastCalledWith(CAPYBRAIN_MAP_STYLE.light, {
      diff: false,
    });
    map.loaded.mockReturnValue(true);
    map.emit('render');
    expect(status.mock.calls).toEqual([
      ['loading'],
      ['unavailable'],
      ['loading'],
      ['ready'],
    ]);
    expect(map.listeners.get('error')?.size).toBe(1);
    disposeRetry();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('handles a synchronous style error without recursion or a leftover timeout', () => {
    const map = createMap();
    const status = vi.fn();
    map.setStyle.mockImplementation(() => map.emit('error'));

    const dispose = loadBasemap(map.map, 'dark', status);
    expect(map.setStyle).toHaveBeenCalledTimes(2);
    expect(status.mock.calls).toEqual([['loading'], ['unavailable']]);
    expect(vi.getTimerCount()).toBe(0);
    dispose();
  });
});

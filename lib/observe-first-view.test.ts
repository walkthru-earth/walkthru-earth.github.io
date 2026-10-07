import { afterEach, describe, expect, it, vi } from 'vitest';
import { observeFirstView } from './observe-first-view';

function observerHarness() {
  let callback: IntersectionObserverCallback;
  const disconnect = vi.fn();
  const observe = vi.fn();
  class Observer {
    constructor(onIntersection: IntersectionObserverCallback) {
      callback = onIntersection;
    }
    disconnect = disconnect;
    observe = observe;
  }
  vi.stubGlobal('IntersectionObserver', Observer);
  return {
    disconnect,
    observe,
    notify(isIntersecting: boolean) {
      callback(
        [{ isIntersecting } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    },
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('viewport demo activation', () => {
  it('does not activate off screen, activates once on entry and disconnects', () => {
    const observer = observerHarness();
    const activate = vi.fn();
    const element = {} as Element;
    observeFirstView(element, activate);
    expect(observer.observe).toHaveBeenCalledWith(element);
    observer.notify(false);
    expect(activate).not.toHaveBeenCalled();
    observer.notify(true);
    expect(activate).toHaveBeenCalledOnce();
    expect(observer.disconnect).toHaveBeenCalledOnce();
    observer.notify(false);
    observer.notify(true);
    expect(activate).toHaveBeenCalledOnce();
  });

  it('ignores queued entry callbacks after the demo is unmounted', () => {
    const observer = observerHarness();
    const activate = vi.fn();
    const cleanup = observeFirstView({} as Element, activate);
    cleanup();
    expect(observer.disconnect).toHaveBeenCalledOnce();
    observer.notify(true);
    expect(activate).not.toHaveBeenCalled();
  });

  it('loads without an observer in browsers missing the API', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const activate = vi.fn();
    const cleanup = observeFirstView({} as Element, activate);
    expect(activate).toHaveBeenCalledOnce();
    cleanup();
  });
});

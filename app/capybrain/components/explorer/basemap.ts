import type { Map as MlMap, StyleSpecification } from 'maplibre-gl';
import { CAPYBRAIN_MAP_STYLE, type ThemeMode } from './config';

export type BasemapStatus = 'loading' | 'ready' | 'unavailable';

/** No network resources: capture markers remain usable without street tiles. */
export function fallbackBasemap(theme: ThemeMode): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': theme === 'dark' ? '#172623' : '#e8efeb',
        },
      },
    ],
  };
}

/** Own one style request, including late tile failures and stalled requests. */
export function loadBasemap(
  map: Pick<MlMap, 'on' | 'off' | 'setStyle' | 'loaded'>,
  theme: ThemeMode,
  onStatus: (status: BasemapStatus) => void
): () => void {
  let active = true;
  let failed = false;
  let loaded = false;
  let timer: ReturnType<typeof setTimeout>;

  const fail = () => {
    if (!active || failed) return;
    failed = true;
    clearTimeout(timer);
    // Replace the failed style, canceling its outstanding resource requests.
    // Disable diffing because an incompletely loaded style cannot be diffed.
    map.setStyle(fallbackBasemap(theme), { diff: false });
    onStatus('unavailable');
  };
  const ready = () => {
    if (!active || failed || loaded || !map.loaded()) return;
    loaded = true;
    clearTimeout(timer);
    onStatus('ready');
  };

  onStatus('loading');
  map.on('error', fail);
  // Unlike idle, render also fires during continuous auto-walk camera motion.
  map.on('render', ready);
  timer = setTimeout(fail, 15_000);
  map.setStyle(CAPYBRAIN_MAP_STYLE[theme], { diff: false });

  return () => {
    active = false;
    clearTimeout(timer);
    map.off('error', fail);
    map.off('render', ready);
  };
}

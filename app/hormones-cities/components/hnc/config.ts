/**
 * HNC explorer configuration.
 * One place to tune asset paths, AOI, colormap range, walker pacing.
 */

export const HNC_BASE = '/hnc';

export const HNC_PARQUET_URL = `${HNC_BASE}/hnc_borough.parquet`;

export const HNC_GLB = {
  high: {
    inflated: {
      left: `${HNC_BASE}/glb/brain-left-hemishpere-high-inflated.glb`,
      right: `${HNC_BASE}/glb/brain-right-hemisphere-high-inflated.glb`,
    },
    pial: {
      left: `${HNC_BASE}/glb/brain-left-hemishpere-high.glb`,
      right: `${HNC_BASE}/glb/brain-right-hemisphere-high.glb`,
    },
  },
  low: {
    inflated: {
      left: `${HNC_BASE}/glb/brain-left-hemisphere-inflated.glb`,
      right: `${HNC_BASE}/glb/brain-right-hemisphere-inflated.glb`,
    },
    pial: {
      left: `${HNC_BASE}/glb/brain-left-hemisphere.glb`,
      right: `${HNC_BASE}/glb/brain-right-hemisphere.glb`,
    },
  },
} as const;

export const HNC_MAP_STYLE = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
} as const;

export const HNC_INITIAL_VIEW = {
  center: [-0.0913, 51.5054] as [number, number],
  zoom: 15.5,
  pitch: 35,
  bearing: -10,
} as const;

export const HNC_CMAP_RANGE: [number, number] = [-0.25, 0.1];

export const FSAVERAGE5_HEMI_VERTS = 10242;

export const HNC_WALK_INTERVAL_MS = 2400;

/**
 * Cinematic flyTo settings. The map rotates so the camera faces the
 * direction the photo was taken (compass_angle), tilts forward for a
 * first-person walk feel, and eases over `durationMs`. Tune freely.
 */
export const HNC_FLY = {
  zoom: 18,
  pitch: 60,
  durationMs: 1600,
  curve: 1.2,
} as const;

export type SurfaceMode = 'inflated' | 'pial';
export type ThemeMode = 'light' | 'dark';
export type ScoreScale = 'raw' | 'aoi';

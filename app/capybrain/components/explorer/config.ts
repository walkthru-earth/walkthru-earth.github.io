/**
 * CapyBrain explorer configuration.
 * One place to tune asset paths, AOI, colormap range, walker pacing.
 */

export const CAPYBRAIN_BASE = '/capybrain-assets';
export const CAPYBRAIN_BASELINES_URL = `${CAPYBRAIN_BASE}/region_baselines.json`;
export const CAPYBRAIN_ATLAS_URL = `${CAPYBRAIN_BASE}/parcel_aliases.json`;

export const CAPYBRAIN_PARQUET_URL = `${CAPYBRAIN_BASE}/capybrain_borough.parquet`;

export const CAPYBRAIN_GLB = {
  high: {
    inflated: {
      left: `${CAPYBRAIN_BASE}/glb/brain-left-hemishpere-high-inflated.glb`,
      right: `${CAPYBRAIN_BASE}/glb/brain-right-hemisphere-high-inflated.glb`,
    },
    pial: {
      left: `${CAPYBRAIN_BASE}/glb/brain-left-hemishpere-high.glb`,
      right: `${CAPYBRAIN_BASE}/glb/brain-right-hemisphere-high.glb`,
    },
  },
  low: {
    inflated: {
      left: `${CAPYBRAIN_BASE}/glb/brain-left-hemisphere-inflated.glb`,
      right: `${CAPYBRAIN_BASE}/glb/brain-right-hemisphere-inflated.glb`,
    },
    pial: {
      left: `${CAPYBRAIN_BASE}/glb/brain-left-hemisphere.glb`,
      right: `${CAPYBRAIN_BASE}/glb/brain-right-hemisphere.glb`,
    },
  },
} as const;

export const CAPYBRAIN_MAP_STYLE = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
} as const;

export const CAPYBRAIN_INITIAL_VIEW = {
  center: [-0.0913, 51.5054] as [number, number],
  zoom: 15.5,
  pitch: 35,
  bearing: -10,
} as const;

export const CAPYBRAIN_CMAP_RANGE: [number, number] = [-0.25, 0.1];

export const FSAVERAGE5_HEMI_VERTS = 10242;

export const CAPYBRAIN_WALK_INTERVAL_MS = 2400;

/**
 * Cinematic flyTo settings. The map rotates so the camera faces the
 * direction the photo was taken (compass_angle), tilts forward for a
 * first-person walk feel, and eases over `durationMs`. Tune freely.
 */
export const CAPYBRAIN_FLY = {
  zoom: 18,
  pitch: 60,
  durationMs: 1600,
  curve: 1.2,
} as const;

export type SurfaceMode = 'inflated' | 'pial';
export type ThemeMode = 'light' | 'dark';
export type ScoreScale = 'raw' | 'aoi';

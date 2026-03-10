/**
 * Interpolate between color stops based on a normalized value [0, 1].
 *
 * Returns a reusable Uint8Array(4) — deck.gl accepts typed arrays for
 * color accessors and this avoids allocating a new tuple per hexagon.
 * Callers must NOT retain a reference to the returned buffer.
 */
const _rgba = new Uint8Array(4);

export function interpolateColor(
  t: number,
  stops: [number, number, number][]
): Uint8Array {
  const clamped = Math.max(0, Math.min(1, t));
  if (stops.length === 1) {
    _rgba[0] = stops[0][0];
    _rgba[1] = stops[0][1];
    _rgba[2] = stops[0][2];
    _rgba[3] = 220;
    return _rgba;
  }
  const segCount = stops.length - 1;
  const segIndex = Math.min(Math.floor(clamped * segCount), segCount - 1);
  const segT = clamped * segCount - segIndex;
  const a = stops[segIndex];
  const b = stops[segIndex + 1];
  _rgba[0] = a[0] + (b[0] - a[0]) * segT;
  _rgba[1] = a[1] + (b[1] - a[1]) * segT;
  _rgba[2] = a[2] + (b[2] - a[2]) * segT;
  _rgba[3] = 220;
  return _rgba;
}

/** Normalize a value to [0, 1] given min/max bounds. */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

// ── Color palettes ──

export const ELEVATION_COLORS: [number, number, number][] = [
  [34, 139, 34], // green (low)
  [139, 119, 42], // olive-brown
  [160, 82, 45], // sienna
  [205, 133, 63], // peru
  [255, 250, 250], // snow white (high)
];

export const POPULATION_GROWTH_COLORS: [number, number, number][] = [
  [49, 130, 189], // blue (shrinking)
  [158, 202, 225], // light blue
  [255, 255, 178], // yellow
  [253, 141, 60], // orange
  [227, 26, 28], // red (rapid growth)
];

export const BUILDING_HEIGHT_COLORS: [number, number, number][] = [
  [200, 200, 200], // light gray (low-rise)
  [253, 184, 99], // amber
  [230, 120, 50], // orange
  [215, 48, 39], // deep red (high-rise)
];

export const TEMPERATURE_COLORS: [number, number, number][] = [
  [49, 54, 149], // deep blue (cold)
  [69, 117, 180], // blue
  [116, 173, 209], // light blue
  [171, 217, 233], // pale blue
  [255, 255, 191], // yellow
  [253, 174, 97], // orange
  [244, 109, 67], // red-orange
  [215, 48, 39], // red
  [165, 0, 38], // deep red (hot)
];

export const WIND_SPEED_COLORS: [number, number, number][] = [
  [240, 249, 232], // pale green (calm)
  [186, 228, 188], // light green
  [123, 204, 196], // teal
  [67, 162, 202], // blue
  [8, 104, 172], // dark blue
  [8, 64, 129], // navy (storm)
];

export const PRECIPITATION_COLORS: [number, number, number][] = [
  [255, 255, 204], // pale yellow (dry)
  [161, 218, 180], // light green
  [65, 182, 196], // teal
  [44, 127, 184], // blue
  [37, 52, 148], // deep blue (heavy rain)
];

export const POPULATION_DENSITY_COLORS: [number, number, number][] = [
  [255, 255, 204], // pale (sparse)
  [255, 237, 160],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38], // deep red (dense)
];

export const PRESSURE_COLORS: [number, number, number][] = [
  [103, 0, 31], // deep red (low pressure / storm)
  [178, 24, 43],
  [253, 174, 97], // orange
  [255, 255, 191], // yellow (normal ~1013 hPa)
  [166, 217, 106], // green
  [26, 152, 80], // dark green (high pressure)
];

export const SLOPE_COLORS: [number, number, number][] = [
  [255, 255, 204], // pale yellow (flat)
  [254, 217, 118],
  [254, 178, 76], // orange
  [253, 141, 60],
  [240, 59, 32], // red
  [189, 0, 38], // deep red (steep)
];

export const RUGGEDNESS_COLORS: [number, number, number][] = [
  [237, 248, 233], // pale green (smooth)
  [186, 228, 179],
  [116, 196, 118], // green
  [49, 163, 84],
  [0, 109, 44], // deep green (extremely rugged)
];

export const HOUSING_PRESSURE_COLORS: [number, number, number][] = [
  [49, 163, 84], // green (low pressure)
  [173, 221, 142],
  [255, 255, 178], // yellow
  [253, 141, 60], // orange
  [227, 26, 28], // red
  [128, 0, 38], // deep red (extreme pressure)
];

export const VERTICAL_DENSITY_COLORS: [number, number, number][] = [
  [158, 202, 225], // light blue (spacious — high bldg/person)
  [66, 146, 198],
  [8, 104, 172], // blue
  [253, 174, 97], // orange (compressed)
  [215, 48, 39], // red
  [128, 0, 38], // deep red (most compressed — low bldg/person)
];

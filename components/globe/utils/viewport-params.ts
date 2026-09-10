/** Deep links are user input: invalid camera values must never reach WebGL. */
export function parseViewportParams(params: {
  get(name: string): string | null;
}) {
  const number = (key: string, min: number, max: number) => {
    const raw = params.get(key);
    if (raw === null || raw.trim() === '') return undefined;
    const value = Number(raw);
    return Number.isFinite(value) && value >= min && value <= max
      ? value
      : undefined;
  };
  const h3 = number('h3', 0, 15);
  return {
    initialZoom: number('z', 0, 16),
    initialLat: number('y', -90, 90),
    initialLng: number('x', -180, 180),
    initialH3Res: h3 !== undefined && Number.isInteger(h3) ? h3 : undefined,
  };
}

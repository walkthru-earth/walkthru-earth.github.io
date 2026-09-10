/** hyparquet timestamps: Date, legacy epoch seconds/ms, or raw INT64 microseconds. */
export function timestampToMs(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'bigint') return Number(value / 1000n);
  if (typeof value === 'number') return value > 1e12 ? value : value * 1000;
  return 0;
}

/** Missing or invalid values use the fallback; zero remains a valid measurement. */
export function finiteNumber(value: unknown, fallback: number): number {
  if (value == null) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

/**
 * Per-AOI per-region baseline statistics. Pre-computed by DuckDB at build /
 * publish time from hnc_borough.parquet, see scripts in /hnc and the
 * `COPY ... TO 'region_baselines.json'` query.
 *
 * Lets us σ-normalize a frame's region score against the AOI baseline:
 *
 *     z_aoi = (raw_z − mean_z) / sd_z
 *
 * which reads as "this region was N σ above/below the AOI's average for this
 * region", i.e. a *frame-relative* signal instead of the raw model output.
 */

export interface RegionBaseline {
  alias: string;
  mean_z: number;
  sd_z: number;
  n: number;
}

let baselinePromise: Promise<Record<string, RegionBaseline> | null> | null =
  null;

export function loadRegionBaselines(
  url = '/hnc/region_baselines.json'
): Promise<Record<string, RegionBaseline> | null> {
  if (baselinePromise) return baselinePromise;
  baselinePromise = fetch(url, { cache: 'force-cache' })
    .then((r) => (r.ok ? (r.json() as Promise<RegionBaseline[]>) : null))
    .then((arr) => {
      if (!arr) return null;
      const out: Record<string, RegionBaseline> = {};
      for (const row of arr) out[row.alias] = row;
      return out;
    })
    .catch(() => null);
  return baselinePromise;
}

/** Convert a raw z to AOI-relative σ. NaN-safe; returns raw if sd_z is 0/NaN. */
export function aoiSigma(
  rawZ: number,
  baseline: RegionBaseline | undefined
): number {
  if (!baseline || !Number.isFinite(baseline.sd_z) || baseline.sd_z === 0) {
    return rawZ;
  }
  return (rawZ - baseline.mean_z) / baseline.sd_z;
}

/** Exact interval membership. Linear for sorted H3; binary search on order resets. */
export function buildH3KeepMask(
  h3: ArrayLike<bigint>,
  ranges: [bigint, bigint][] | null
): Uint8Array | null {
  if (!ranges) return null;
  const mask = new Uint8Array(h3.length);
  let r = 0;
  for (let i = 0; i < h3.length; i++) {
    const value = h3[i];
    if (i > 0 && value < h3[i - 1]) {
      let lo = 0;
      let hi = ranges.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (ranges[mid][1] < value) lo = mid + 1;
        else hi = mid;
      }
      r = lo;
    } else {
      while (r < ranges.length && value > ranges[r][1]) r++;
    }
    if (r < ranges.length && value >= ranges[r][0]) mask[i] = 1;
  }
  return mask;
}

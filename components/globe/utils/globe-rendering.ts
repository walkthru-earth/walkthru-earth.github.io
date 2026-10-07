/**
 * Preserve relative column heights while leaving room below the camera and
 * near clipping plane. Use the viewport's actual camera elevation: globe and
 * Mercator projections, viewport height, latitude, and pitch all affect it.
 */
export function capExtrusionScale(
  requestedScale: number,
  maxRawElevation: number,
  cameraAltitudeMeters: number
): number {
  if (!Number.isFinite(requestedScale) || requestedScale <= 0) return 0;
  if (!Number.isFinite(maxRawElevation) || maxRawElevation < 0) return 0;
  if (maxRawElevation === 0) return requestedScale;
  if (!Number.isFinite(cameraAltitudeMeters) || cameraAltitudeMeters <= 0)
    return 0;

  return Math.min(
    requestedScale,
    (cameraAltitudeMeters * 0.2) / maxRawElevation
  );
}

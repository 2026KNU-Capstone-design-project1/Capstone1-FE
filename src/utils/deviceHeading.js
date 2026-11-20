export function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

export function getScreenOrientationAngle() {
  const screenAngle = globalThis.screen?.orientation?.angle;
  if (Number.isFinite(screenAngle)) return normalizeDegrees(screenAngle);

  const legacyAngle = globalThis.orientation;
  return Number.isFinite(legacyAngle) ? normalizeDegrees(legacyAngle) : 0;
}

/**
 * Returns a clockwise, screen-corrected heading where 0° is north. Relative
 * alpha values are used as a best-effort fallback when absolute data is absent.
 */
export function getDeviceHeading(event, screenOrientationAngle = 0) {
  if (Number.isFinite(event.webkitCompassHeading)) {
    const accuracy = event.webkitCompassAccuracy;
    if (Number.isFinite(accuracy) && accuracy < 0) return null;
    return normalizeDegrees(event.webkitCompassHeading + screenOrientationAngle);
  }

  if (!Number.isFinite(event.alpha)) return null;

  // Relative alpha is also accepted as a best-effort fallback. It is less
  // reliable than an absolute bearing, but still follows screen rotation.
  return normalizeDegrees(360 - event.alpha + screenOrientationAngle);
}

export function smoothHeading(previousHeading, nextHeading, smoothingFactor = 0.18) {
  if (!Number.isFinite(previousHeading)) return normalizeDegrees(nextHeading);

  const shortestTurn = ((nextHeading - previousHeading + 540) % 360) - 180;
  return normalizeDegrees(previousHeading + shortestTurn * smoothingFactor);
}

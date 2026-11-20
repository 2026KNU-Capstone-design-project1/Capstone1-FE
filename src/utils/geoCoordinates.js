function assertFiniteCoordinate(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

function validateBounds(bounds) {
  const { northWest, southEast } = bounds;

  assertFiniteCoordinate(northWest.latitude, 'northWest.latitude');
  assertFiniteCoordinate(northWest.longitude, 'northWest.longitude');
  assertFiniteCoordinate(southEast.latitude, 'southEast.latitude');
  assertFiniteCoordinate(southEast.longitude, 'southEast.longitude');

  if (northWest.latitude <= southEast.latitude || northWest.longitude >= southEast.longitude) {
    throw new RangeError('Map bounds must run from north-west to south-east.');
  }
}

/**
 * Converts a GPS coordinate to the map image's percentage coordinate system.
 * Values outside 0–100 are intentionally preserved so callers can detect an
 * out-of-bounds position without pinning a marker to the image edge.
 */
export function gpsToMapPosition({ latitude, longitude }, bounds) {
  assertFiniteCoordinate(latitude, 'latitude');
  assertFiniteCoordinate(longitude, 'longitude');
  validateBounds(bounds);

  const { northWest, southEast } = bounds;
  const xPercent = ((longitude - northWest.longitude)
    / (southEast.longitude - northWest.longitude)) * 100;
  const yPercent = ((northWest.latitude - latitude)
    / (northWest.latitude - southEast.latitude)) * 100;

  return {
    xPercent,
    yPercent,
    isWithinBounds: xPercent >= 0 && xPercent <= 100 && yPercent >= 0 && yPercent <= 100,
  };
}

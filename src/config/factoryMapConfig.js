export const FACTORY_MAP_BOUNDS = Object.freeze({
  northWest: Object.freeze({
    latitude: 35.230501,
    longitude: 129.084101,
  }),
  southEast: Object.freeze({
    latitude: 35.229791,
    longitude: 129.084843,
  }),
});

export const FACTORY_MAP_GEOLOCATION_OPTIONS = Object.freeze({
  enableHighAccuracy: true,
  maximumAge: 5_000,
  timeout: 15_000,
});

export const FACTORY_MAP_LOW_ACCURACY_THRESHOLD_METERS = 20;

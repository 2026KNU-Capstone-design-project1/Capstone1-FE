export const FACTORY_MAP_BOUNDS = Object.freeze({
  northWest: Object.freeze({
    latitude: 35.216664,
    longitude: 129.088299,
  }),
  southEast: Object.freeze({
    latitude: 35.213114,
    longitude: 129.092006,
  }),
});

export const FACTORY_MAP_GEOLOCATION_OPTIONS = Object.freeze({
  enableHighAccuracy: true,
  maximumAge: 5_000,
  timeout: 15_000,
});

export const FACTORY_MAP_LOW_ACCURACY_THRESHOLD_METERS = 20;

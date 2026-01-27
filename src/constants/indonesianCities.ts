/**
 * Indonesian Cities and Tourist Destinations
 * 
 * ⚠️ DATA MOVED TO data/indonesianCities.ts
 * This file re-exports for backward compatibility
 */

export type {
  CityLocation,
  CityCategory
} from '../data/indonesianCities';

export {
  INDONESIAN_CITIES_CATEGORIZED,
  ALL_INDONESIAN_CITIES,
  TOURIST_DESTINATIONS,
  MAIN_CITIES,
  findCityByName,
  calculateDistance,
  findNearestCities,
  matchProviderToCity,
  findCityByCoordinates
} from '../data/indonesianCities';
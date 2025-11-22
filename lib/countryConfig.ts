// Simplified Indonesia-only configuration
import type { CountryAppConfig } from '../config/countries/defaults';
import ID from '../config/countries/ID';

// Always return Indonesian config; parameter ignored for single-country deployment
export function getCountryConfig(_countryCode?: string | null): CountryAppConfig {
  return ID;
}

export const ACTIVE_COUNTRY_CONFIG: CountryAppConfig = ID;

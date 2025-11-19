import { DEFAULT_COUNTRY_CONFIG, type CountryAppConfig } from '../config/countries/defaults';

// Vite glob for available country configs
const configs = import.meta.glob('../config/countries/*.ts', { eager: true }) as Record<string, any>;

const byCode = new Map<string, CountryAppConfig>();
for (const [path, mod] of Object.entries(configs)) {
  // Expect default export
  const cfg = mod.default as CountryAppConfig | undefined;
  if (cfg && cfg.code) {
    byCode.set(cfg.code.toUpperCase(), cfg);
  }
}

export function getCountryConfig(countryCode?: string | null): CountryAppConfig {
  if (!countryCode) return DEFAULT_COUNTRY_CONFIG;
  const cfg = byCode.get(countryCode.toUpperCase());
  return cfg || DEFAULT_COUNTRY_CONFIG;
}

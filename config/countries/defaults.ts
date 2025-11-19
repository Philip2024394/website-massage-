export type FeatureFlags = {
  agents: boolean;
  commissions: boolean;
  marketplace: boolean;
};

export type CountryAppConfig = {
  code: string;
  name: string;
  currencyCode: string; // e.g., 'IDR', 'GBP', 'USD', 'AUD'
  currencyLocale?: string; // e.g., 'id-ID'
  features: FeatureFlags;
};

export const DEFAULT_COUNTRY_CONFIG: CountryAppConfig = {
  code: 'XX',
  name: 'Generic',
  currencyCode: 'USD',
  currencyLocale: 'en-US',
  features: {
    agents: false,
    commissions: false,
    marketplace: true,
  },
};

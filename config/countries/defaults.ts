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
  // SEO metadata
  seo?: {
    title: string;
    description: string;
    keywords?: string;
    geoRegion?: string; // e.g., 'ID-BA', 'GB-ENG'
    geoPlacename?: string; // e.g., 'Bali, Indonesia'
    geoCoordinates?: { lat: number; lng: number };
    ogLocale: string; // e.g., 'id_ID', 'en_GB'
    ogLocaleAlternates?: string[];
  };
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
  seo: {
    title: 'IndaStreet - Professional Massage Services',
    description: 'Find professional massage therapists and spas near you. Book trusted massage services 24/7.',
    ogLocale: 'en_US',
    ogLocaleAlternates: ['id_ID', 'en_GB'],
  },
};

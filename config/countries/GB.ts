import type { CountryAppConfig } from './defaults';

const GB: CountryAppConfig = {
  code: 'GB',
  name: 'United Kingdom',
  currencyCode: 'GBP',
  currencyLocale: 'en-GB',
  features: {
    agents: false,
    commissions: false,
    marketplace: true,
  },
};

export default GB;

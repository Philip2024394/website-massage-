import type { CountryAppConfig } from './defaults';

const US: CountryAppConfig = {
  code: 'US',
  name: 'United States',
  currencyCode: 'USD',
  currencyLocale: 'en-US',
  features: {
    agents: false,
    commissions: false,
    marketplace: true,
  },
};

export default US;

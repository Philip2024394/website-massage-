import type { CountryAppConfig } from './defaults';

const AU: CountryAppConfig = {
  code: 'AU',
  name: 'Australia',
  currencyCode: 'AUD',
  currencyLocale: 'en-AU',
  features: {
    agents: false,
    commissions: false,
    marketplace: true,
  },
};

export default AU;

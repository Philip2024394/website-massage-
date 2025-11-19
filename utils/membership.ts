import { detectUserCurrency } from './currency';

export type RegionKey = 'EU' | 'ID' | 'US' | 'UK' | 'AU';

const EU_COUNTRIES = new Set([
  'DE','FR','ES','IT','NL','BE','PT','IE','AT','FI','GR','LU','MT','CY','SI','SK','LV','LT','EE'
]);

export const resolveRegion = (countryCode?: string): RegionKey => {
  const cc = (countryCode || detectUserCurrency().countryCode || 'ID').toUpperCase();
  if (cc === 'ID') return 'ID';
  if (cc === 'US') return 'US';
  if (cc === 'GB' || cc === 'UK') return 'UK';
  if (cc === 'AU') return 'AU';
  if (EU_COUNTRIES.has(cc)) return 'EU';
  return 'US';
};

export const getMonthlyPriceDisplay = (region: RegionKey): string => {
  switch (region) {
    case 'EU': return '€10 / month';
    case 'ID': return 'IDR 160.000 / month';
    case 'US': return '$15 / month';
    case 'UK': return '£10 / month';
    case 'AU': return 'A$20 / month';
    default: return '$15 / month';
  }
};

export const getMonthlyPaymentLink = (region: RegionKey): string | undefined => {
  const env = import.meta.env as any;
  switch (region) {
    case 'EU': return env.VITE_STRIPE_LINK_EU as string | undefined;
    case 'ID': return env.VITE_STRIPE_LINK_ID as string | undefined;
    case 'US': return env.VITE_STRIPE_LINK_US as string | undefined;
    case 'UK': return env.VITE_STRIPE_LINK_UK as string | undefined;
    case 'AU': return env.VITE_STRIPE_LINK_AU as string | undefined;
    default: return env.VITE_STRIPE_PAYMENT_LINK_URL as string | undefined;
  }
};

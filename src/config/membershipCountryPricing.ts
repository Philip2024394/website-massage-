/**
 * Country-specific membership pricing for Partner / Join flow.
 * Used by membership pages and Stripe checkout; supports monthly fee OR commission.
 *
 * Backend: Use these keys (e.g. countryCode) to create Stripe Products/Prices or
 * to attach commission rules to partner accounts.
 */

export type MembershipPricingType = 'monthly_fee' | 'commission';

export interface MonthlyFeePricing {
  type: 'monthly_fee';
  currency: string;
  symbol: string;
  monthlyAmount: number;
  monthlyFormatted: string;
  /** Optional yearly amount for display; Stripe can use monthly * 12 or custom yearly price */
  yearlyAmount?: number;
  yearlyFormatted?: string;
  /** First month free for all monthly-fee countries to drive signups */
  firstMonthFree?: boolean;
}

export interface CommissionPricing {
  type: 'commission';
  commissionPercent: number;
  /** Optional monthly fee alternative (e.g. Malaysia, Singapore, Philippines, Thailand) */
  optionalMonthlyFee?: {
    currency: string;
    symbol: string;
    monthlyAmount: number;
    monthlyFormatted: string;
  };
}

export type CountryPricing = MonthlyFeePricing | CommissionPricing;

export const MEMBERSHIP_COUNTRY_PRICING: Record<string, CountryPricing> = {
  GB: {
    type: 'monthly_fee',
    currency: 'GBP',
    symbol: '£',
    monthlyAmount: 15,
    monthlyFormatted: '£15',
    yearlyAmount: 150,
    yearlyFormatted: '£150',
    firstMonthFree: true,
  },
  US: {
    type: 'monthly_fee',
    currency: 'USD',
    symbol: '$',
    monthlyAmount: 19,
    monthlyFormatted: '$19',
    yearlyAmount: 190,
    yearlyFormatted: '$190',
    firstMonthFree: true,
  },
  AU: {
    type: 'monthly_fee',
    currency: 'AUD',
    symbol: 'AU$',
    monthlyAmount: 30,
    monthlyFormatted: 'AU$30',
    yearlyAmount: 300,
    yearlyFormatted: 'AU$300',
    firstMonthFree: true,
  },
  DE: {
    type: 'monthly_fee',
    currency: 'EUR',
    symbol: '€',
    monthlyAmount: 19.99,
    monthlyFormatted: '€19.99',
    yearlyAmount: 199.99,
    yearlyFormatted: '€199.99',
    firstMonthFree: true,
  },
  /** Indonesia: commission only (30%), no monthly fee */
  ID: {
    type: 'commission',
    commissionPercent: 30,
  },
  VN: {
    type: 'monthly_fee',
    currency: 'VND',
    symbol: '₫',
    monthlyAmount: 499000,
    monthlyFormatted: '₫499,000',
    yearlyAmount: 4990000,
    yearlyFormatted: '₫4,990,000',
    firstMonthFree: true,
  },
  MY: {
    type: 'monthly_fee',
    currency: 'MYR',
    symbol: 'RM',
    monthlyAmount: 79,
    monthlyFormatted: 'RM79',
    yearlyAmount: 790,
    yearlyFormatted: 'RM790',
    firstMonthFree: true,
  },
  SG: {
    type: 'monthly_fee',
    currency: 'SGD',
    symbol: 'S$',
    monthlyAmount: 29,
    monthlyFormatted: 'S$29',
    yearlyAmount: 290,
    yearlyFormatted: 'S$290',
    firstMonthFree: true,
  },
  PH: {
    type: 'monthly_fee',
    currency: 'PHP',
    symbol: '₱',
    monthlyAmount: 999,
    monthlyFormatted: '₱999',
    yearlyAmount: 9990,
    yearlyFormatted: '₱9,990',
    firstMonthFree: true,
  },
  TH: {
    type: 'monthly_fee',
    currency: 'THB',
    symbol: '฿',
    monthlyAmount: 599,
    monthlyFormatted: '฿599',
    yearlyAmount: 5990,
    yearlyFormatted: '฿5,990',
    firstMonthFree: true,
  },
};

/** Countries that use Stripe recurring (monthly/yearly); all have first month free */
export const MONTHLY_FEE_COUNTRY_CODES = ['GB', 'US', 'AU', 'DE', 'VN', 'MY', 'SG', 'PH', 'TH'] as const;

/** Indonesia only: commission (30%), no monthly fee */
export const COMMISSION_COUNTRY_CODES = ['ID'] as const;

export function getMembershipPricing(countryCode: string): CountryPricing | null {
  const key = String(countryCode || '').toUpperCase();
  return MEMBERSHIP_COUNTRY_PRICING[key] ?? null;
}

export function isMonthlyFeeCountry(countryCode: string): boolean {
  return MONTHLY_FEE_COUNTRY_CODES.includes(countryCode as any);
}

export function isCommissionCountry(countryCode: string): boolean {
  return COMMISSION_COUNTRY_CODES.includes(countryCode as any);
}

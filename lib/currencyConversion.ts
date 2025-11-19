import { getCountryConfig } from './countryConfig';

// Approximate exchange rate map (from 1 unit of source to 1 unit of target)
// These are rough daily rates as of Nov 2025; in production use a live API (e.g., Open Exchange Rates, Fixer.io)
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  IDR: { IDR: 1, GBP: 0.000049, USD: 0.000062, AUD: 0.000091, EUR: 0.000057 },
  GBP: { IDR: 20408, GBP: 1, USD: 1.27, AUD: 1.85, EUR: 1.17 },
  USD: { IDR: 16129, GBP: 0.79, USD: 1, AUD: 1.46, EUR: 0.92 },
  AUD: { IDR: 10989, GBP: 0.54, USD: 0.68, AUD: 1, EUR: 0.63 },
  EUR: { IDR: 17544, GBP: 0.85, USD: 1.09, AUD: 1.59, EUR: 1 }
};

/**
 * Convert amount from source currency to target currency using approximate exchange rates.
 * Returns converted amount or original if conversion not available.
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (!amount || fromCurrency === toCurrency) return amount;
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  const rate = EXCHANGE_RATES[from]?.[to];
  if (!rate) return amount; // fallback: no conversion
  return amount * rate;
}

/**
 * Format amount in the given currency using country locale.
 * Zero-decimal currencies (IDR, JPY, KRW) show no fraction digits.
 */
export function formatCurrency(amount: number, currencyCode: string, countryCode?: string): string {
  const cfg = getCountryConfig(countryCode);
  const locale = cfg.currencyLocale || 'en-US';
  const currency = currencyCode.toUpperCase();
  const zeroDecimal = ['IDR', 'JPY', 'KRW', 'VND'].includes(currency);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: zeroDecimal ? 0 : 2,
      maximumFractionDigits: zeroDecimal ? 0 : 2
    }).format(amount);
  } catch {
    // Fallback if Intl fails
    const sym = currencySymbol(currency);
    const rounded = zeroDecimal ? Math.round(amount) : amount.toFixed(2);
    return `${sym}${rounded}`;
  }
}

function currencySymbol(currency: string): string {
  switch (currency) {
    case 'IDR': return 'Rp ';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'AUD': return 'A$';
    case 'SGD': return 'S$';
    case 'MYR': return 'RM ';
    case 'THB': return '฿';
    case 'VND': return '₫';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    case 'KRW': return '₩';
    case 'RUB': return '₽';
    case 'AED': return 'د.إ ';
    case 'HKD': return 'HK$';
    case 'CAD': return 'CA$';
    case 'CHF': return 'CHF ';
    case 'INR': return '₹';
    default: return '';
  }
}

/**
 * Format compact for card display (e.g., 1.5M, 280K, £150)
 */
export function formatCurrencyCompact(amount: number, currencyCode: string): string {
  const currency = currencyCode.toUpperCase();
  const zeroDecimal = ['IDR', 'JPY', 'KRW', 'VND'].includes(currency);
  const sym = currencySymbol(currency);
  
  if (amount >= 1_000_000_000) {
    const val = (amount / 1_000_000_000).toFixed(1);
    return `${sym}${val}B`;
  }
  if (amount >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(1);
    return `${sym}${val}M`;
  }
  if (amount >= 1_000) {
    const val = Math.round(amount / 1_000);
    return `${sym}${val}K`;
  }
  const val = zeroDecimal ? Math.round(amount) : amount.toFixed(2);
  return `${sym}${val}`;
}

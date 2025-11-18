// Lightweight currency utilities for displaying prices per country.

type CurrencyCode =
  | 'IDR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'SGD' | 'MYR' | 'THB'
  | 'VND' | 'JPY' | 'CNY' | 'KRW' | 'RUB' | 'AED' | 'HKD' | 'CAD'
  | 'CHF' | 'INR';

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  ID: 'IDR',
  US: 'USD',
  GB: 'GBP',
  AU: 'AUD',
  SG: 'SGD',
  MY: 'MYR',
  TH: 'THB',
  VN: 'VND',
  PH: 'PHP' as any, // Not in CurrencyCode; fallback handled below
  JP: 'JPY',
  CN: 'CNY',
  KR: 'KRW',
  RU: 'RUB',
  AE: 'AED',
  HK: 'HKD',
  CA: 'CAD',
  CH: 'CHF',
  IN: 'INR',
  // Common EU country codes mapped to EUR
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  AT: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  LU: 'EUR',
  MT: 'EUR',
  CY: 'EUR',
  SI: 'EUR',
  SK: 'EUR',
  LV: 'EUR',
  LT: 'EUR',
  EE: 'EUR'
};

// Approximate conversion factors FROM 1 IDR to target currency unit.
// These are rough and can be refreshed as needed.
// Example: amountTarget = amountIdr * EXCHANGE_FROM_IDR[target]
const EXCHANGE_FROM_IDR: Record<CurrencyCode, number> = {
  IDR: 1,
  USD: 0.000062,
  EUR: 0.000057,
  GBP: 0.000049,
  AUD: 0.000091,
  SGD: 0.000085,
  MYR: 0.00030,
  THB: 0.0022,
  VND: 1.55, // 1 IDR ≈ 1.55 VND
  JPY: 0.0091,
  CNY: 0.00044,
  KRW: 0.083,
  RUB: 0.0056,
  AED: 0.00023,
  HKD: 0.00049,
  CAD: 0.000085,
  CHF: 0.000056,
  INR: 0.0053
};

const ZERO_DECIMAL: Set<CurrencyCode> = new Set(['IDR', 'JPY', 'KRW', 'VND']);

export const getCurrencyForCountry = (countryCode?: string): CurrencyCode => {
  if (!countryCode) return 'IDR';
  const cc = countryCode.toUpperCase();
  const found = COUNTRY_TO_CURRENCY[cc];
  if (!found) return 'IDR';
  // If mapping produced a non-supported type (e.g., PHP), fallback to USD
  if (!EXCHANGE_FROM_IDR[found as CurrencyCode]) return 'USD';
  return found as CurrencyCode;
};

export const detectUserCurrency = (): { currency: CurrencyCode; countryCode: string } => {
  try {
    const raw = localStorage.getItem('app_user_location');
    if (raw) {
      const parsed = JSON.parse(raw);
      const cc = (parsed?.countryCode as string) || 'ID';
      return { currency: getCurrencyForCountry(cc), countryCode: cc };
    }
  } catch {}
  return { currency: 'IDR', countryCode: 'ID' };
};

export const normalizeIdrAmount = (raw: number): number => {
  // If very small, assume value is in thousands (legacy format like 280 → 280k)
  if (!raw || isNaN(raw as any)) return 0;
  if (raw < 1000) return Math.round(raw * 1000);
  return Math.round(raw);
};

export const convertFromIdr = (amountIdr: number, target: CurrencyCode): number => {
  const factor = EXCHANGE_FROM_IDR[target] ?? 1;
  return amountIdr * factor;
};

export const formatCurrencyCompact = (amount: number, currency: CurrencyCode, locale?: string): string => {
  const maximumFractionDigits = ZERO_DECIMAL.has(currency) ? 0 : 0; // keep compact whole-number style
  // Special case: show IDR as text "IDR" instead of symbol "Rp"
  if (currency === 'IDR') {
    return `IDR ${compactNumber(amount)}`;
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits
    }).format(amount);
  } catch {
    // Fallback basic format if Intl fails
    const symbol = currencySymbol(currency);
    const compact = compactNumber(amount);
    return `${symbol}${compact}`;
  }
};

const currencySymbol = (currency: CurrencyCode): string => {
  switch (currency) {
    case 'IDR': return 'IDR ';
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
};

const compactNumber = (n: number): string => {
  if (n >= 1_000_000_000) return `${Math.round(n / 1_000_000_000)}B`;
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${Math.round(n)}`;
};

export const formatAmountForUser = (amount: number, countryCodeHint?: string): string => {
  // No exchange: treat entered price as native to currency context
  const { currency } = countryCodeHint
    ? { currency: getCurrencyForCountry(countryCodeHint) }
    : detectUserCurrency();
  return formatCurrencyCompact(amount, currency);
};

/**
 * Currency Service - Multi-Currency Support for 6 Countries
 * Handles currency formatting, conversion, and display across all dashboards and components
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  symbolPosition: 'before' | 'after';
  spaceAfterSymbol: boolean;
}

// Currency configuration for all 6 countries
export const CURRENCIES: Record<string, CurrencyInfo> = {
  ID: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    locale: 'id-ID',
    decimals: 0,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolPosition: 'before',
    spaceAfterSymbol: true
  },
  MY: {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    locale: 'ms-MY',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: true
  },
  SG: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    locale: 'en-SG',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: false
  },
  TH: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    locale: 'th-TH',
    decimals: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: false
  },
  PH: {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    locale: 'en-PH',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: false
  },
  VN: {
    code: 'VND',
    symbol: '₫',
    name: 'Vietnamese Dong',
    locale: 'vi-VN',
    decimals: 0,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolPosition: 'after',
    spaceAfterSymbol: true
  }
};

// Approximate exchange rates (IDR as base currency - 1 IDR)
// Note: In production, these should be fetched from a real-time API
export const EXCHANGE_RATES: Record<string, number> = {
  ID: 1,              // Indonesian Rupiah (base)
  MY: 0.00029,        // 1 IDR = 0.00029 MYR
  SG: 0.000087,       // 1 IDR = 0.000087 SGD
  TH: 0.0022,         // 1 IDR = 0.0022 THB
  PH: 0.0036,         // 1 IDR = 0.0036 PHP
  VN: 1.63            // 1 IDR = 1.63 VND
};

class CurrencyService {
  private currentCountry: string = 'ID'; // Default to Indonesia
  
  /**
   * Set the current country for currency operations
   */
  setCountry(countryCode: string): void {
    if (CURRENCIES[countryCode]) {
      this.currentCountry = countryCode;
      console.log(`💱 Currency set to ${CURRENCIES[countryCode].name} (${CURRENCIES[countryCode].code})`);
      
      // Store in localStorage for persistence
      try {
        localStorage.setItem('app_currency_country', countryCode);
      } catch (error) {
        console.warn('Failed to store currency country:', error);
      }
    } else {
      console.warn(`Unknown country code: ${countryCode}, using default (ID)`);
      this.currentCountry = 'ID';
    }
  }
  
  /**
   * Get the current country code
   */
  getCountry(): string {
    return this.currentCountry;
  }
  
  /**
   * Get currency info for a specific country
   */
  getCurrency(countryCode?: string): CurrencyInfo {
    const code = countryCode || this.currentCountry;
    return CURRENCIES[code] || CURRENCIES.ID;
  }
  
  /**
   * Convert amount from IDR (base currency) to target country currency
   */
  convert(amountInIDR: number, targetCountry?: string): number {
    const country = targetCountry || this.currentCountry;
    const rate = EXCHANGE_RATES[country] || 1;
    return Math.round(amountInIDR * rate);
  }
  
  /**
   * Convert amount from any currency to IDR
   */
  convertToIDR(amount: number, sourceCountry: string): number {
    const rate = EXCHANGE_RATES[sourceCountry] || 1;
    return Math.round(amount / rate);
  }
  
  /**
   * Format price with currency symbol and proper locale formatting
   * @param amount - Amount in local currency (not IDR)
   * @param countryCode - Country code (optional, uses current country if not provided)
   * @param compact - Use compact format (e.g., 250k instead of 250,000)
   */
  formatPrice(amount: number, countryCode?: string, compact: boolean = false): string {
    const currency = this.getCurrency(countryCode);
    
    if (compact && amount >= 1000) {
      // Compact format for prices >= 1000
      const inK = Math.round(amount / 1000);
      const symbol = currency.symbolPosition === 'before' 
        ? `${currency.symbol}${currency.spaceAfterSymbol ? ' ' : ''}`
        : `${currency.spaceAfterSymbol ? ' ' : ''}${currency.symbol}`;
      
      return currency.symbolPosition === 'before'
        ? `${symbol}${inK}k`
        : `${inK}k${symbol}`;
    }
    
    // Format number with proper locale
    const formattedNumber = amount.toLocaleString(currency.locale, {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals
    });
    
    // Add currency symbol
    if (currency.symbolPosition === 'before') {
      return `${currency.symbol}${currency.spaceAfterSymbol ? ' ' : ''}${formattedNumber}`;
    } else {
      return `${formattedNumber}${currency.spaceAfterSymbol ? ' ' : ''}${currency.symbol}`;
    }
  }
  
  /**
   * Format price from IDR base amount to current country currency
   */
  formatFromIDR(amountInIDR: number, countryCode?: string, compact: boolean = false): string {
    const targetCountry = countryCode || this.currentCountry;
    const convertedAmount = this.convert(amountInIDR, targetCountry);
    return this.formatPrice(convertedAmount, targetCountry, compact);
  }
  
  /**
   * Parse price input string and return numeric value
   * Handles: "250k", "250K", "250000", "250,000", etc.
   */
  parsePrice(input: string, countryCode?: string): number {
    const currency = this.getCurrency(countryCode);
    
    // Remove currency symbol and spaces
    let cleaned = input.trim()
      .replace(new RegExp(currency.symbol, 'g'), '')
      .replace(/\s/g, '');
    
    // Handle 'k' or 'K' suffix (thousands)
    if (cleaned.toLowerCase().endsWith('k')) {
      const numericPart = cleaned.slice(0, -1);
      const value = parseFloat(numericPart.replace(/[.,]/g, ''));
      return value * 1000;
    }
    
    // Remove separators and parse
    cleaned = cleaned
      .replace(new RegExp(`\\${currency.thousandsSeparator}`, 'g'), '')
      .replace(currency.decimalSeparator, '.');
    
    return parseFloat(cleaned) || 0;
  }
  
  /**
   * Get currency symbol for display
   */
  getSymbol(countryCode?: string): string {
    const currency = this.getCurrency(countryCode);
    return currency.symbol;
  }
  
  /**
   * Get currency code (ISO 4217)
   */
  getCode(countryCode?: string): string {
    const currency = this.getCurrency(countryCode);
    return currency.code;
  }
  
  /**
   * Initialize from localStorage
   */
  initialize(): void {
    try {
      const stored = localStorage.getItem('app_currency_country');
      if (stored && CURRENCIES[stored]) {
        this.currentCountry = stored;
        console.log(`💱 Currency initialized from storage: ${CURRENCIES[stored].code}`);
      }
    } catch (error) {
      console.warn('Failed to initialize currency from storage:', error);
    }
  }
  
  /**
   * Get all available currencies
   */
  getAllCurrencies(): Array<{ country: string; currency: CurrencyInfo }> {
    return Object.entries(CURRENCIES).map(([country, currency]) => ({
      country,
      currency
    }));
  }
}

// Export singleton instance
export const currencyService = new CurrencyService();

// Initialize on module load
if (typeof window !== 'undefined') {
  currencyService.initialize();
}

// Export convenience functions
export const formatPrice = (amount: number, countryCode?: string, compact?: boolean) => 
  currencyService.formatPrice(amount, countryCode, compact);

export const formatFromIDR = (amountInIDR: number, countryCode?: string, compact?: boolean) => 
  currencyService.formatFromIDR(amountInIDR, countryCode, compact);

export const parsePrice = (input: string, countryCode?: string) => 
  currencyService.parsePrice(input, countryCode);

export const getCurrencySymbol = (countryCode?: string) => 
  currencyService.getSymbol(countryCode);

export const getCurrencyCode = (countryCode?: string) => 
  currencyService.getCode(countryCode);

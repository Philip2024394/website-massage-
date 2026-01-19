/**
 * Currency Hook - React hook for accessing currency service
 * Provides easy currency formatting and conversion in React components
 */

import { useState, useEffect } from 'react';
import { currencyService, CurrencyInfo, formatPrice, formatFromIDR, getCurrencySymbol, getCurrencyCode } from '../lib/currencyService';
import { useCityContext } from '../context/CityContext';

export interface UseCurrencyReturn {
  // Current currency info
  currency: CurrencyInfo;
  symbol: string;
  code: string;
  countryCode: string;
  
  // Formatting functions
  format: (amount: number, compact?: boolean) => string;
  formatFromIDR: (amountInIDR: number, compact?: boolean) => string;
  parse: (input: string) => number;
  
  // Conversion functions
  convert: (amountInIDR: number) => number;
  convertToIDR: (amount: number) => number;
}

/**
 * Hook to access currency formatting and conversion
 * Automatically syncs with country selection from CityContext
 */
export function useCurrency(): UseCurrencyReturn {
  const { countryCode } = useCityContext();
  const [, forceUpdate] = useState(0);
  
  // Update when country changes
  useEffect(() => {
    currencyService.setCountry(countryCode);
    forceUpdate(prev => prev + 1);
  }, [countryCode]);
  
  return {
    // Current currency info
    currency: currencyService.getCurrency(),
    symbol: getCurrencySymbol(),
    code: getCurrencyCode(),
    countryCode,
    
    // Formatting functions
    format: (amount: number, compact?: boolean) => formatPrice(amount, undefined, compact),
    formatFromIDR: (amountInIDR: number, compact?: boolean) => formatFromIDR(amountInIDR, undefined, compact),
    parse: (input: string) => currencyService.parsePrice(input),
    
    // Conversion functions
    convert: (amountInIDR: number) => currencyService.convert(amountInIDR),
    convertToIDR: (amount: number) => currencyService.convertToIDR(amount, countryCode),
  };
}

/**
 * Hook to format prices with currency
 * Simple helper for components that just need to display prices
 */
export function useCurrencyFormatter() {
  const { format, formatFromIDR, symbol } = useCurrency();
  
  return {
    format,
    formatFromIDR,
    symbol
  };
}

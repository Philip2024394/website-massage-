/**
 * usePricing Hook
 * Handles pricing logic, formatting, and hotel/villa pricing validation
 * Max size: 8KB (Facebook/Amazon standard)
 */

import { useCallback } from 'react';

interface Pricing {
  '60': number;
  '90': number;
  '120': number;
}

interface UsePricingProps {
  pricing: Pricing;
  setPricing: (value: Pricing | ((prev: Pricing) => Pricing)) => void;
  hotelVillaPricing: Pricing;
  setHotelVillaPricing: (value: Pricing | ((prev: Pricing) => Pricing)) => void;
  useSamePricing: boolean;
  setUseSamePricing: (value: boolean) => void;
}

export const usePricing = ({
  pricing,
  setPricing,
  hotelVillaPricing: _hotelVillaPricing,
  setHotelVillaPricing,
  useSamePricing,
  setUseSamePricing,
}: UsePricingProps) => {
  
  // Helper function to format price for display (supports 345k format)
  const formatPriceForDisplay = useCallback((value: number): string => {
    if (value === 0) return '';
    if (value >= 1000) {
      return Math.floor(value / 1000) + 'k';
    }
    return value.toString();
  }, []);

  // Helper function to parse price from input
  const parsePriceFromInput = useCallback((value: string): number => {
    if (!value) return 0;
    
    // Handle 'k' suffix (e.g., "345k" becomes 345000)
    if (value.toLowerCase().endsWith('k')) {
      const numPart = value.slice(0, -1);
      const num = parseInt(numPart, 10);
      return isNaN(num) ? 0 : num * 1000;
    }
    
    // Handle regular numbers
    const num = parseInt(value, 10);
    return isNaN(num) ? 0 : num;
  }, []);

  // Handle regular price change
  const handlePriceChange = useCallback((duration: keyof Pricing, value: string) => {
    const numValue = parsePriceFromInput(value);
    setPricing(prev => ({ ...prev, [duration]: numValue }));
    
    // If "use same pricing" is checked, update hotel/villa pricing too
    if (useSamePricing) {
      setHotelVillaPricing(prev => ({ ...prev, [duration]: numValue }));
    }
  }, [parsePriceFromInput, setPricing, useSamePricing, setHotelVillaPricing]);

  // Handle hotel/villa price change with 20% validation
  const handleHotelVillaPriceChange = useCallback((duration: keyof Pricing, value: string) => {
    let numValue = parsePriceFromInput(value);
    
    // Validate: Hotel/villa price cannot be more than 20% higher than regular price
    const regularPrice = pricing[duration];
    const maxAllowedPrice = regularPrice * 1.2; // 20% increase max
    
    if (numValue > maxAllowedPrice && regularPrice > 0) {
      // Cap at 20% increase
      numValue = Math.floor(maxAllowedPrice);
    }
    
    setHotelVillaPricing(prev => ({ ...prev, [duration]: numValue }));
  }, [parsePriceFromInput, pricing, setHotelVillaPricing]);

  // Handle "use same pricing" toggle
  const handleUseSamePricingChange = useCallback((checked: boolean) => {
    setUseSamePricing(checked);
    if (checked) {
      // Copy regular pricing to hotel/villa pricing
      setHotelVillaPricing({ ...pricing });
    }
  }, [setUseSamePricing, pricing, setHotelVillaPricing]);

  return {
    formatPriceForDisplay,
    parsePriceFromInput,
    handlePriceChange,
    handleHotelVillaPriceChange,
    handleUseSamePricingChange,
  };
};

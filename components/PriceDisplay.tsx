import React from 'react';
import { useCountryContext } from '../context/CountryContext';
import { getCountryConfig } from '../lib/countryConfig';

interface PriceDisplayProps {
  amount: number | string;
  duration?: '60' | '90' | '120';
  className?: string;
  showDuration?: boolean;
}

/**
 * PriceDisplay Component
 * Automatically formats prices according to the user's active country and currency
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  duration,
  className = '',
  showDuration = false,
}) => {
  const { activeCountry } = useCountryContext();
  const config = getCountryConfig(activeCountry);

  // Parse amount to number
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Handle invalid amounts
  if (isNaN(numericAmount)) {
    return <span className={className}>-</span>;
  }

  // Format price using Intl.NumberFormat
  const formattedPrice = new Intl.NumberFormat(config.currencyLocale || 'en-US', {
    style: 'currency',
    currency: config.currencyCode || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount * 1000); // Multiply by 1000 for Indonesian pricing (e.g., 250 = 250k IDR)

  return (
    <span className={className}>
      {formattedPrice}
      {showDuration && duration && (
        <span className="text-sm opacity-75"> / {duration} min</span>
      )}
    </span>
  );
};

export default PriceDisplay;

import { describe, it, expect } from 'vitest';

describe('Pricing Utilities', () => {
  describe('Price Calculation', () => {
    it('calculates price with discount', () => {
      const calculateDiscountedPrice = (basePrice: number, discountPercent: number) => {
        const discount = basePrice * (discountPercent / 100);
        return basePrice - discount;
      };
      
      expect(calculateDiscountedPrice(150000, 10)).toBe(135000);
      expect(calculateDiscountedPrice(300000, 20)).toBe(240000);
      expect(calculateDiscountedPrice(150000, 0)).toBe(150000);
    });

    it('formats price for display', () => {
      const formatPrice = (price: number) => {
        return `Rp ${price.toLocaleString('id-ID')}`;
      };
      
      expect(formatPrice(150000)).toBe('Rp 150.000');
      expect(formatPrice(1000000)).toBe('Rp 1.000.000');
    });

    it('formats price in thousands', () => {
      const formatPriceThousands = (price: number) => {
        const thousands = Math.floor(price / 1000);
        return `${thousands}k`;
      };
      
      expect(formatPriceThousands(150000)).toBe('150k');
      expect(formatPriceThousands(225000)).toBe('225k');
      expect(formatPriceThousands(300000)).toBe('300k');
    });
  });

  describe('Commission Calculation', () => {
    it('calculates 30% commission', () => {
      const calculateCommission = (amount: number) => {
        return Math.floor(amount * 0.30);
      };
      
      expect(calculateCommission(150000)).toBe(45000);
      expect(calculateCommission(300000)).toBe(90000);
      expect(calculateCommission(100000)).toBe(30000);
    });

    it('calculates provider payout (70%)', () => {
      const calculatePayout = (amount: number) => {
        return Math.floor(amount * 0.70);
      };
      
      expect(calculatePayout(150000)).toBe(105000);
      expect(calculatePayout(300000)).toBe(210000);
    });
  });

  describe('Pricing Validation', () => {
    it('validates pricing structure', () => {
      interface Pricing {
        '60': number;
        '90': number;
        '120': number;
      }
      
      const isValidPricing = (pricing: Pricing) => {
        return (
          pricing['60'] > 0 &&
          pricing['90'] > pricing['60'] &&
          pricing['120'] > pricing['90'] &&
          pricing['60'] >= 50000 &&
          pricing['120'] <= 1000000
        );
      };
      
      const validPricing: Pricing = { '60': 150000, '90': 225000, '120': 300000 };
      const invalidPricing: Pricing = { '60': 200000, '90': 150000, '120': 300000 };
      
      expect(isValidPricing(validPricing)).toBe(true);
      expect(isValidPricing(invalidPricing)).toBe(false);
    });
  });
});

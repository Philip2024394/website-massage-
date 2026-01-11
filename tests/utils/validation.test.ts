import { describe, it, expect } from 'vitest';

describe('Validation Utilities', () => {
  describe('WhatsApp Number Validation', () => {
    const validateWhatsApp = (number: string) => {
      const cleaned = number.replace(/\D/g, '');
      return cleaned.length >= 8 && cleaned.length <= 15;
    };
    
    it('accepts valid WhatsApp numbers', () => {
      expect(validateWhatsApp('+6281234567890')).toBe(true);
      expect(validateWhatsApp('081234567890')).toBe(true);
    });
    
    it('rejects invalid WhatsApp numbers', () => {
      expect(validateWhatsApp('123')).toBe(false);
      expect(validateWhatsApp('12345678901234567890')).toBe(false);
    });
  });

  describe('Price Validation', () => {
    const validatePrice = (price: number) => {
      return price >= 50000 && price <= 1000000 && price % 1000 === 0;
    };
    
    it('accepts valid prices', () => {
      expect(validatePrice(150000)).toBe(true);
      expect(validatePrice(300000)).toBe(true);
    });
    
    it('rejects invalid prices', () => {
      expect(validatePrice(150)).toBe(false);
      expect(validatePrice(150500)).toBe(false);
      expect(validatePrice(2000000)).toBe(false);
    });
  });

  describe('Location Validation', () => {
    const validateLocation = (location: string) => {
      return location.trim().length >= 10 && location.trim().length <= 500;
    };
    
    it('accepts valid locations', () => {
      expect(validateLocation('123 Main Street, Seminyak, Bali')).toBe(true);
    });
    
    it('rejects invalid locations', () => {
      expect(validateLocation('Short')).toBe(false);
      expect(validateLocation('')).toBe(false);
    });
  });

  describe('Duration Validation', () => {
    const validateDuration = (duration: string) => {
      return ['60', '90', '120'].includes(duration);
    };
    
    it('accepts valid durations', () => {
      expect(validateDuration('60')).toBe(true);
      expect(validateDuration('90')).toBe(true);
      expect(validateDuration('120')).toBe(true);
    });
    
    it('rejects invalid durations', () => {
      expect(validateDuration('45')).toBe(false);
      expect(validateDuration('150')).toBe(false);
    });
  });

  describe('Rating Validation', () => {
    const validateRating = (rating: number) => {
      return rating >= 1 && rating <= 5 && Number.isFinite(rating);
    };
    
    it('accepts valid ratings', () => {
      expect(validateRating(4.5)).toBe(true);
      expect(validateRating(5)).toBe(true);
      expect(validateRating(1)).toBe(true);
    });
    
    it('rejects invalid ratings', () => {
      expect(validateRating(0)).toBe(false);
      expect(validateRating(6)).toBe(false);
      expect(validateRating(NaN)).toBe(false);
    });
  });
});

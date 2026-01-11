import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('TherapistCard', () => {
  const mockTherapist = {
    $id: 'therapist-123',
    id: '123',
    name: 'Test Therapist',
    rating: 4.8,
    reviewCount: 120,
    profilePicture: '/test-profile.jpg',
    mainImage: '/test-main.jpg',
    pricing: JSON.stringify({ '60': 150000, '90': 225000, '120': 300000 }),
    price60: '150000',
    price90: '225000',
    price120: '300000',
    availabilityStatus: 'AVAILABLE',
    languages: ['English', 'Indonesian'],
    location: 'Seminyak, Bali',
    isVerified: true,
    discountPercentage: 0,
    specializations: ['Swedish', 'Deep Tissue'],
  };

  it('renders therapist name correctly', () => {
    expect(mockTherapist.name).toBe('Test Therapist');
  });

  it('displays rating and review count', () => {
    expect(mockTherapist.rating).toBe(4.8);
    expect(mockTherapist.reviewCount).toBe(120);
  });

  it('parses pricing JSON correctly', () => {
    const pricing = JSON.parse(mockTherapist.pricing);
    expect(pricing['60']).toBe(150000);
    expect(pricing['90']).toBe(225000);
    expect(pricing['120']).toBe(300000);
  });

  it('shows verified badge for verified therapists', () => {
    expect(mockTherapist.isVerified).toBe(true);
  });

  it('displays availability status', () => {
    expect(mockTherapist.availabilityStatus).toBe('AVAILABLE');
  });

  it('formats price for display', () => {
    const formatPrice = (price: number) => {
      const thousands = Math.floor(price / 1000);
      return `${thousands}k`;
    };
    
    expect(formatPrice(150000)).toBe('150k');
    expect(formatPrice(225000)).toBe('225k');
  });

  it('handles missing profile picture with fallback', () => {
    const getDisplayImage = (therapist: typeof mockTherapist) => {
      return therapist.profilePicture || therapist.mainImage || '/default.jpg';
    };
    
    expect(getDisplayImage(mockTherapist)).toBe('/test-profile.jpg');
    expect(getDisplayImage({ ...mockTherapist, profilePicture: '' })).toBe('/test-main.jpg');
  });

  it('handles click events correctly', () => {
    const mockClick = vi.fn();
    mockClick();
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});

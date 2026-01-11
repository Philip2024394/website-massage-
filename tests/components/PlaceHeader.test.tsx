import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlaceHeader from '../../modules/massage-place/PlaceHeader';

describe('PlaceHeader Component', () => {
  const mockPlace = {
    $id: '1',
    name: 'Test Massage Place',
    isVerified: true,
    rating: 4.5,
    reviewCount: 100,
    discountPercentage: 20,
  };

  const mockT = (key: string) => key;
  const mockOnShare = () => {};
  const mockIsDiscountActive = () => true;

  it('renders without crashing', () => {
    render(
      <PlaceHeader
        place={mockPlace}
        onShare={mockOnShare}
        mainImage="test.jpg"
        displayRating={true}
        isDiscountActive={mockIsDiscountActive}
        t={mockT}
      />
    );
  });

  it('displays verified badge when place is verified', () => {
    render(
      <PlaceHeader
        place={mockPlace}
        onShare={mockOnShare}
        mainImage="test.jpg"
        displayRating={true}
        isDiscountActive={mockIsDiscountActive}
        t={mockT}
      />
    );
    
    const verifiedBadge = screen.getByText(/verified/i);
    expect(verifiedBadge).toBeInTheDocument();
  });

  it('displays discount badge when discount is active', () => {
    render(
      <PlaceHeader
        place={mockPlace}
        onShare={mockOnShare}
        mainImage="test.jpg"
        displayRating={true}
        isDiscountActive={mockIsDiscountActive}
        t={mockT}
      />
    );
    
    const discountBadge = screen.getByText(/20% OFF/i);
    expect(discountBadge).toBeInTheDocument();
  });

  it('calls onShare when share button is clicked', () => {
    let shareCalled = false;
    const mockOnShare = () => { shareCalled = true; };

    render(
      <PlaceHeader
        place={mockPlace}
        onShare={mockOnShare}
        mainImage="test.jpg"
        displayRating={true}
        isDiscountActive={mockIsDiscountActive}
        t={mockT}
      />
    );
    
    const shareButton = screen.getByRole('button');
    shareButton.click();
    expect(shareCalled).toBe(true);
  });
});

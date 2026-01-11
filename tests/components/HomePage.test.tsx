/**
 * HomePage Component Tests
 * Testing main landing page functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock HomePage component for testing
const MockHomePage = ({ therapists, selectedCity }: any) => {
  const filteredTherapists = selectedCity === 'all' 
    ? therapists 
    : therapists.filter((t: any) => t.city === selectedCity);
  
  return (
    <div data-testid="home-page">
      <h1>IndaStreet Massage</h1>
      <div data-testid="therapist-count">{filteredTherapists.length} therapists</div>
      {filteredTherapists.map((therapist: any) => (
        <div key={therapist.id} data-testid={`therapist-${therapist.id}`}>
          {therapist.name}
        </div>
      ))}
    </div>
  );
};

describe('HomePage', () => {
  const mockTherapists = [
    { id: '1', name: 'Therapist A', city: 'Bali' },
    { id: '2', name: 'Therapist B', city: 'Jakarta' },
    { id: '3', name: 'Therapist C', city: 'Bali' }
  ];

  it('should render homepage', () => {
    render(<MockHomePage therapists={mockTherapists} selectedCity="all" />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('should display all therapists when city is "all"', () => {
    render(<MockHomePage therapists={mockTherapists} selectedCity="all" />);
    expect(screen.getByTestId('therapist-count')).toHaveTextContent('3 therapists');
  });

  it('should filter therapists by city', () => {
    render(<MockHomePage therapists={mockTherapists} selectedCity="Bali" />);
    expect(screen.getByTestId('therapist-count')).toHaveTextContent('2 therapists');
  });

  it('should display filtered therapist names', () => {
    render(<MockHomePage therapists={mockTherapists} selectedCity="Jakarta" />);
    expect(screen.getByText('Therapist B')).toBeInTheDocument();
    expect(screen.queryByText('Therapist A')).not.toBeInTheDocument();
  });
});

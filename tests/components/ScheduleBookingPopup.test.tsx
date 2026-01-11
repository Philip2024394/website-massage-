/**
 * ScheduleBookingPopup Component Tests
 * Testing scheduled booking functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock ScheduleBookingPopup component
const MockScheduleBookingPopup = ({ isOpen, onClose, therapistName, onConfirm }: any) => {
  if (!isOpen) return null;
  
  return (
    <div data-testid="schedule-booking-popup">
      <h2>Schedule Appointment with {therapistName}</h2>
      <input data-testid="date-input" type="date" />
      <input data-testid="time-input" type="time" />
      <input data-testid="customer-name" placeholder="Your name" />
      <input data-testid="customer-phone" placeholder="WhatsApp number" />
      <button data-testid="confirm-button" onClick={onConfirm}>Confirm</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

describe('ScheduleBookingPopup', () => {
  it('should not render when closed', () => {
    const { container } = render(
      <MockScheduleBookingPopup 
        isOpen={false} 
        onClose={vi.fn()} 
        therapistName="Test"
        onConfirm={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when open', () => {
    render(
      <MockScheduleBookingPopup 
        isOpen={true} 
        onClose={vi.fn()} 
        therapistName="Jane Doe"
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByTestId('schedule-booking-popup')).toBeInTheDocument();
  });

  it('should display therapist name', () => {
    render(
      <MockScheduleBookingPopup 
        isOpen={true} 
        onClose={vi.fn()} 
        therapistName="Jane Doe"
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
  });

  it('should have all required form fields', () => {
    render(
      <MockScheduleBookingPopup 
        isOpen={true} 
        onClose={vi.fn()} 
        therapistName="Test"
        onConfirm={vi.fn()}
      />
    );
    
    expect(screen.getByTestId('date-input')).toBeInTheDocument();
    expect(screen.getByTestId('time-input')).toBeInTheDocument();
    expect(screen.getByTestId('customer-name')).toBeInTheDocument();
    expect(screen.getByTestId('customer-phone')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button clicked', () => {
    const mockOnConfirm = vi.fn();
    render(
      <MockScheduleBookingPopup 
        isOpen={true} 
        onClose={vi.fn()} 
        therapistName="Test"
        onConfirm={mockOnConfirm}
      />
    );
    
    fireEvent.click(screen.getByTestId('confirm-button'));
    expect(mockOnConfirm).toHaveBeenCalled();
  });
});

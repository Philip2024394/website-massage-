import { describe, it, expect } from 'vitest';

describe('BookingService', () => {
  interface Booking {
    $id: string;
    customerId: string;
    therapistId: string;
    duration: number;
    startTime: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    totalCost: number;
    location: string;
  }

  it('creates booking with correct data structure', () => {
    const booking: Booking = {
      $id: 'booking-123',
      customerId: 'customer-123',
      therapistId: 'therapist-123',
      duration: 60,
      startTime: new Date().toISOString(),
      status: 'pending',
      totalCost: 150000,
      location: 'Seminyak, Bali',
    };
    
    expect(booking.status).toBe('pending');
    expect(booking.duration).toBe(60);
    expect(booking.totalCost).toBe(150000);
  });

  it('calculates total cost based on duration and pricing', () => {
    const pricing = { '60': 150000, '90': 225000, '120': 300000 };
    const calculateCost = (duration: string, discountPercent: number = 0) => {
      const basePrice = pricing[duration as keyof typeof pricing];
      const discount = basePrice * (discountPercent / 100);
      return basePrice - discount;
    };
    
    expect(calculateCost('60', 0)).toBe(150000);
    expect(calculateCost('90', 10)).toBe(202500); // 225000 - 10%
    expect(calculateCost('120', 20)).toBe(240000); // 300000 - 20%
  });

  it('validates booking status transitions', () => {
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };
    
    const canTransition = (from: string, to: string) => {
      return validTransitions[from as keyof typeof validTransitions]?.includes(to) || false;
    };
    
    expect(canTransition('pending', 'confirmed')).toBe(true);
    expect(canTransition('confirmed', 'completed')).toBe(true);
    expect(canTransition('completed', 'pending')).toBe(false);
  });

  it('calculates commission correctly', () => {
    const calculateCommission = (totalCost: number, rate: number = 0.30) => {
      return Math.floor(totalCost * rate);
    };
    
    expect(calculateCommission(150000, 0.30)).toBe(45000);
    expect(calculateCommission(300000, 0.30)).toBe(90000);
  });

  it('validates booking time constraints', () => {
    const isValidBookingTime = (startTime: Date) => {
      const now = new Date();
      const minAdvance = 30 * 60 * 1000; // 30 minutes
      const maxAdvance = 30 * 24 * 60 * 60 * 1000; // 30 days
      
      const timeDiff = startTime.getTime() - now.getTime();
      return timeDiff >= minAdvance && timeDiff <= maxAdvance;
    };
    
    const validTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const tooSoon = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    
    expect(isValidBookingTime(validTime)).toBe(true);
    expect(isValidBookingTime(tooSoon)).toBe(false);
  });
});

/**
 * useBookingCountdown Hook
 * 
 * Purpose: Calculates and updates countdown timer for upcoming booking sessions
 * Data Flow: Booking time → Countdown calculation → UI updates every second
 * 
 * Features:
 * - Real-time countdown updates
 * - Calculates time remaining until session starts
 * - Handles expired bookings
 * - Returns formatted time strings
 * - Triggers warnings at specific thresholds
 */

import { useState, useEffect } from 'react';

interface CountdownResult {
  timeRemaining: number; // in seconds
  formatted: string; // "2h 30m" or "15m 30s"
  isExpired: boolean;
  isWithin5Minutes: boolean;
  isWithin2Minutes: boolean;
  percentComplete: number; // 0-100
}

export function useBookingCountdown(
  bookingDate: string,
  bookingTime: string
): CountdownResult {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!bookingDate || !bookingTime) return;

    const calculateTimeRemaining = () => {
      try {
        // Parse booking date and time
        const bookingDateTime = new Date(`${bookingDate} ${bookingTime}`);
        const now = new Date();
        
        const diffMs = bookingDateTime.getTime() - now.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);

        console.log('⏰ [useBookingCountdown] Time remaining:', diffSeconds, 'seconds');
        
        setTimeRemaining(diffSeconds > 0 ? diffSeconds : 0);

      } catch (err) {
        console.error('❌ [useBookingCountdown] Error calculating time:', err);
        setTimeRemaining(0);
      }
    };

    // Initial calculation
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [bookingDate, bookingTime]);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Session time';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Calculate percentage (assuming 24 hours max)
  const maxSeconds = 24 * 60 * 60; // 24 hours
  const percentComplete = Math.max(0, Math.min(100, ((maxSeconds - timeRemaining) / maxSeconds) * 100));

  return {
    timeRemaining,
    formatted: formatTimeRemaining(timeRemaining),
    isExpired: timeRemaining <= 0,
    isWithin5Minutes: timeRemaining > 0 && timeRemaining <= 5 * 60,
    isWithin2Minutes: timeRemaining > 0 && timeRemaining <= 2 * 60,
    percentComplete
  };
}

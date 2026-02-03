/**
 * Enhanced Booking Timeout Hook
 * Provides comprehensive timeout handling with location-based broadcasting
 */

import { useState, useEffect, useCallback } from 'react';
import { handleBookingTimeout, BookingTimeoutRequest, TimeoutHandlerResult } from '../services/bookingTimeoutHandler';
import { getProviderTimeoutDuration } from '../services/enhancedBroadcastService';
import { logger } from '../lib/logger';

export interface UseEnhancedTimeoutProps {
  bookingId: string;
  originalTherapistId: string;
  providerType: 'therapist' | 'massage_place' | 'skincare_clinic'; // NEW: Provider type
  bookingType: 'immediate' | 'scheduled'; // NEW: Booking type  
  customerName: string;
  serviceType: string;
  duration: number;
  price: number;
  initialCountdown?: number; // Optional override, will use provider/booking type defaults
  onTimeoutTriggered?: (result: TimeoutHandlerResult) => void;
  onCancelBooking?: () => void;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface UseEnhancedTimeoutReturn {
  // Countdown state
  timeLeft: number;
  isActive: boolean;
  isExpired: boolean;
  formattedTime: string;
  
  // Timeout handling state
  timeoutResult: TimeoutHandlerResult | null;
  isHandlingTimeout: boolean;
  
  // Actions
  startCountdown: () => void;
  pauseCountdown: () => void;
  resetCountdown: () => void;
  cancelBooking: () => void;
  retryWithLocation: () => Promise<void>;
  
  // Status
  status: 'idle' | 'counting' | 'expired' | 'timeout_handled' | 'cancelled';
  providerCount: number;
}

export const useEnhancedTimeout = ({
  bookingId,
  originalTherapistId,
  providerType,
  bookingType,
  customerName,
  serviceType,
  duration,
  price,
  initialCountdown, // Optional override
  onTimeoutTriggered,
  onCancelBooking,
  location
}: UseEnhancedTimeoutProps): UseEnhancedTimeoutReturn => {
  
  // Calculate timeout duration based on provider type and booking type
  const dynamicCountdown = initialCountdown || getProviderTimeoutDuration(providerType, bookingType);
  
  // Countdown state
  const [timeLeft, setTimeLeft] = useState(dynamicCountdown);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'counting' | 'expired' | 'timeout_handled' | 'cancelled'>('idle');
  
  // Timeout handling state
  const [timeoutResult, setTimeoutResult] = useState<TimeoutHandlerResult | null>(null);
  const [isHandlingTimeout, setIsHandlingTimeout] = useState(false);
  const [providerCount, setProviderCount] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0 && status === 'counting') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setStatus('expired');
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, status]);

  // Handle timeout when countdown reaches zero
  const handleTimeout = useCallback(async () => {
    if (isHandlingTimeout) return; // Prevent multiple timeout handling
    
    try {
      setIsHandlingTimeout(true);
      logger.info('⏰ Handling booking timeout for:', bookingId);
      
      const timeoutRequest: BookingTimeoutRequest = {
        bookingId,
        originalTherapistId,
        providerType,
        bookingType,
        customerName,
        serviceType,
        duration,
        price,
        location
      };

      const result = await handleBookingTimeout(timeoutRequest);
      setTimeoutResult(result);
      
      if (result.success && result.action === 'broadcasted') {
        setProviderCount(result.providerCount || 0);
        setStatus('timeout_handled');
      } else {
        setStatus('timeout_handled');
      }
      
      if (onTimeoutTriggered) {
        onTimeoutTriggered(result);
      }
      
    } catch (error) {
      logger.error('❌ Timeout handling failed:', error);
      setTimeoutResult({
        success: false,
        action: 'failed',
        message: 'Unable to process timeout. Please try again.'
      });
      setStatus('timeout_handled');
    } finally {
      setIsHandlingTimeout(false);
    }
  }, [bookingId, originalTherapistId, providerType, bookingType, customerName, serviceType, duration, price, location, onTimeoutTriggered, isHandlingTimeout]);

  // Start countdown
  const startCountdown = useCallback(() => {
    setIsActive(true);
    setStatus('counting');
    logger.info('⏰ Starting enhanced countdown for booking:', bookingId);
  }, [bookingId]);

  // Pause countdown
  const pauseCountdown = useCallback(() => {
    setIsActive(false);
  }, []);

  // Reset countdown
  const resetCountdown = useCallback(() => {
    setTimeLeft(dynamicCountdown);
    setIsActive(false);
    setStatus('idle');
    setTimeoutResult(null);
    setProviderCount(0);
  }, [dynamicCountdown]);

  // Cancel booking with directory redirect
  const cancelBooking = useCallback(() => {
    setIsActive(false);
    setStatus('cancelled');
    setTimeLeft(0);
    
    if (onCancelBooking) {
      onCancelBooking();
    }
    
    // Redirect to directory after brief delay
    setTimeout(() => {
      window.location.href = '/therapists';
    }, 1000);
    
    logger.info('❌ Booking cancelled by user, redirecting to directory');
  }, [onCancelBooking]);

  // Retry timeout handling with location
  const retryWithLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      logger.warn('⚠️ Geolocation not available');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      setIsHandlingTimeout(true);
      
      const timeoutRequest: BookingTimeoutRequest = {
        bookingId,
        originalTherapistId,
        providerType,
        bookingType,
        customerName,
        serviceType,
        duration,
        price,
        location: newLocation
      };

      const result = await handleBookingTimeout(timeoutRequest);
      setTimeoutResult(result);
      
      if (result.success && result.action === 'broadcasted') {
        setProviderCount(result.providerCount || 0);
      }
      
      if (onTimeoutTriggered) {
        onTimeoutTriggered(result);
      }

    } catch (error) {
      logger.error('❌ Location retry failed:', error);
      setTimeoutResult({
        success: false,
        action: 'failed',
        message: 'Unable to get location. Please enable location services.'
      });
    } finally {
      setIsHandlingTimeout(false);
    }
  }, [bookingId, originalTherapistId, providerType, bookingType, customerName, serviceType, duration, price, onTimeoutTriggered]);

  // Format time for display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // Countdown state
    timeLeft,
    isActive,
    isExpired: timeLeft === 0,
    formattedTime: formatTime(timeLeft),
    
    // Timeout handling state
    timeoutResult,
    isHandlingTimeout,
    
    // Actions
    startCountdown,
    pauseCountdown,
    resetCountdown,
    cancelBooking,
    retryWithLocation,
    
    // Status
    status,
    providerCount
  };
};
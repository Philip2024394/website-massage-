/**
 * Enhanced Timeout Handler for Booking Flow
 * Handles advanced timeout scenarios with location-based broadcasting
 */

import { broadcastToNearbyProviders, BroadcastRequest } from './enhancedBroadcastService';
import { logger } from '../lib/logger';

export interface BookingTimeoutRequest {
  bookingId: string;
  originalTherapistId: string;
  providerType: 'therapist' | 'massage_place' | 'skincare_clinic'; // NEW: Provider type
  bookingType: 'immediate' | 'scheduled'; // NEW: Booking type
  customerName: string;
  serviceType: string;
  duration: number;
  price: number;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface TimeoutHandlerResult {
  success: boolean;
  action: 'broadcasted' | 'location_required' | 'failed';
  providerCount?: number;
  message: string;
}

class BookingTimeoutHandler {
  
  /**
   * Enhanced timeout handler for when booking timer reaches zero
   * Implements the user's requirement for location-based broadcast
   */
  async handleBookingTimeout(request: BookingTimeoutRequest): Promise<TimeoutHandlerResult> {
    try {
      logger.info('⏰ Handling booking timeout:', request.bookingId);
      
      // Get user location if not provided
      let userLocation = request.location;
      if (!userLocation) {
        userLocation = await this.getCurrentLocation();
      }
      
      if (!userLocation) {
        return {
          success: false,
          action: 'location_required',
          message: 'Location services required to find nearby therapists. Please enable location and try again.'
        };
      }
      
      // Create broadcast request
      const broadcastRequest: BroadcastRequest = {
        bookingId: request.bookingId,
        userLocation,
        serviceType: request.serviceType,
        duration: request.duration,
        price: request.price,
        customerName: request.customerName,
        isUrgent: true, // Mark as urgent since it's a timeout fallback
        excludeProviderIds: [request.originalTherapistId],
        maxRadius: 15 // Extended radius for timeout scenarios
      };
      
      // Broadcast to nearby providers
      const broadcastResult = await broadcastToNearbyProviders(broadcastRequest);
      
      if (broadcastResult.success && broadcastResult.providerCount > 0) {
        return {
          success: true,
          action: 'broadcasted',
          providerCount: broadcastResult.providerCount,
          message: `Found ${broadcastResult.providerCount} nearby providers. First to accept gets the booking!`
        };
      } else {
        return {
          success: false,
          action: 'failed',
          message: 'No nearby therapists or places currently available. Please try again later.'
        };
      }
      
    } catch (error) {
      logger.error('❌ Timeout handling failed:', error);
      return {
        success: false,
        action: 'failed',
        message: 'Unable to find alternative providers. Please try again.'
      };
    }
  }
  
  /**
   * Get current location from browser geolocation API
   */
  private getCurrentLocation(): Promise<{lat: number, lng: number} | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          logger.warn('⚠️ Geolocation failed:', error.message);
          resolve(null);
        },
        { 
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  }
  
  /**
   * Generate user-friendly timeout messages
   */
  generateTimeoutMessage(result: TimeoutHandlerResult): string {
    switch (result.action) {
      case 'broadcasted':
        return `⏰ No response received. We are now finding the next available therapist in your location for first-come-first-serve acceptance. Found ${result.providerCount} nearby providers!`;
        
      case 'location_required':
        return '⏰ No response received. Enable location services to find nearby therapists automatically, or cancel to browse directory manually.';
        
      case 'failed':
      default:
        return '⏰ No response received and no nearby providers available. Please cancel booking to browse directory for your preferred therapist/place.';
    }
  }
  
  /**
   * Generate cancel button message based on timeout state
   */
  generateCancelMessage(result: TimeoutHandlerResult): string {
    if (result.action === 'broadcasted' && result.success) {
      return 'Cancel & Browse Directory';
    }
    return 'Browse Directory for Preferred Therapist/Place';
  }
}

export const bookingTimeoutHandler = new BookingTimeoutHandler();

// Helper function for easy use in components
export async function handleBookingTimeout(request: BookingTimeoutRequest): Promise<TimeoutHandlerResult> {
  return bookingTimeoutHandler.handleBookingTimeout(request);
}
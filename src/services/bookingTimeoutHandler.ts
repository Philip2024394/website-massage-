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
      const broadcastRequest: BroadcastRequest = {\n        bookingId: request.bookingId,\n        userLocation,\n        serviceType: request.serviceType,\n        duration: request.duration,\n        price: request.price,\n        customerName: request.customerName,\n        isUrgent: true, // Mark as urgent since it's a timeout fallback\n        excludeProviderIds: [request.originalTherapistId],\n        maxRadius: 15 // Extended radius for timeout scenarios\n      };\n      \n      // Broadcast to nearby providers\n      const broadcastResult = await broadcastToNearbyProviders(broadcastRequest);\n      \n      if (broadcastResult.success && broadcastResult.providerCount > 0) {\n        return {\n          success: true,\n          action: 'broadcasted',\n          providerCount: broadcastResult.providerCount,\n          message: `Found ${broadcastResult.providerCount} nearby providers. First to accept gets the booking!`\n        };\n      } else {\n        return {\n          success: false,\n          action: 'failed',\n          message: 'No nearby therapists or places currently available. Please try again later.'\n        };\n      }\n      \n    } catch (error) {\n      logger.error('❌ Timeout handling failed:', error);\n      return {\n        success: false,\n        action: 'failed',\n        message: 'Unable to find alternative providers. Please try again.'\n      };\n    }\n  }\n  \n  /**\n   * Get current location from browser geolocation API\n   */\n  private getCurrentLocation(): Promise<{lat: number, lng: number} | null> {\n    return new Promise((resolve) => {\n      if (!navigator.geolocation) {\n        resolve(null);\n        return;\n      }\n      \n      navigator.geolocation.getCurrentPosition(\n        (position) => {\n          resolve({\n            lat: position.coords.latitude,\n            lng: position.coords.longitude\n          });\n        },\n        (error) => {\n          logger.warn('⚠️ Geolocation failed:', error.message);\n          resolve(null);\n        },\n        { \n          timeout: 10000,\n          enableHighAccuracy: true,\n          maximumAge: 300000 // 5 minutes cache\n        }\n      );\n    });\n  }\n  \n  /**\n   * Generate user-friendly timeout messages\n   */\n  generateTimeoutMessage(result: TimeoutHandlerResult): string {\n    switch (result.action) {\n      case 'broadcasted':\n        return `⏰ No response received. We are now finding the next available therapist in your location for first-come-first-serve acceptance. Found ${result.providerCount} nearby providers!`;\n        \n      case 'location_required':\n        return '⏰ No response received. Enable location services to find nearby therapists automatically, or cancel to browse directory manually.';\n        \n      case 'failed':\n      default:\n        return '⏰ No response received and no nearby providers available. Please cancel booking to browse directory for your preferred therapist/place.';\n    }\n  }\n  \n  /**\n   * Generate cancel button message based on timeout state\n   */\n  generateCancelMessage(result: TimeoutHandlerResult): string {\n    if (result.action === 'broadcasted' && result.success) {\n      return 'Cancel & Browse Directory';\n    }\n    return 'Browse Directory for Preferred Therapist/Place';\n  }\n}\n\nexport const bookingTimeoutHandler = new BookingTimeoutHandler();\n\n// Helper function for easy use in components\nexport async function handleBookingTimeout(request: BookingTimeoutRequest): Promise<TimeoutHandlerResult> {\n  return bookingTimeoutHandler.handleBookingTimeout(request);\n}
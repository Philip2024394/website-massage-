import { databases } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { ID } from 'appwrite';

/**
 * Location Verification Service
 * Handles mandatory GPS verification for bookings
 * 
 * SECURITY: One-time capture only, no background tracking
 * PRIVACY: Auto-delete after booking completion
 */

export interface LocationData {
  bookingId: string;
  chatRoomId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  source: 'user';
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

/**
 * Capture live GPS location from browser
 */
export const captureLiveLocation = (): Promise<GeolocationResult> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by browser'));
      return;
    }

    console.log('📍 Requesting live GPS location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const result: GeolocationResult = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        
        console.log('✅ GPS location captured:', {
          lat: result.latitude.toFixed(6),
          lng: result.longitude.toFixed(6),
          accuracy: `±${result.accuracy.toFixed(0)}m`
        });
        
        resolve(result);
      },
      (error) => {
        console.error('❌ GPS capture failed:', error.message);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // No cached location
      }
    );
  });
};

/**
 * Save location to Appwrite booking_locations collection
 */
export const saveBookingLocation = async (data: LocationData): Promise<string> => {
  try {
    console.log('💾 Saving booking location to Appwrite...');
    
    const document = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.booking_locations,
      ID.unique(),
      {
        bookingId: data.bookingId,
        chatRoomId: data.chatRoomId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        timestamp: data.timestamp,
        source: data.source
      }
    );

    console.log('✅ Location saved:', document.$id);
    return document.$id;
  } catch (error) {
    console.error('❌ Failed to save location:', error);
    throw error;
  }
};

/**
 * Update booking status after location shared
 */
export const updateBookingWithLocation = async (
  bookingId: string,
  accuracy: number
): Promise<void> => {
  try {
    console.log('🔄 Updating booking status to location_shared...');
    
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.bookings,
      bookingId,
      {
        status: 'location_shared',
        locationAccuracy: accuracy,
        locationSharedAt: new Date().toISOString()
      }
    );

    console.log('✅ Booking updated with location status');
  } catch (error) {
    console.error('❌ Failed to update booking:', error);
    throw error;
  }
};

/**
 * Update chat room with location verification status
 */
export const updateChatRoomLocation = async (
  chatRoomId: string,
  locationVerified: boolean,
  accuracy?: number
): Promise<void> => {
  try {
    console.log('🔄 Updating chat room location status...');
    
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.chatRooms,
      chatRoomId,
      {
        locationVerified,
        locationAccuracy: accuracy || 0
      }
    );

    console.log('✅ Chat room updated with location verification');
  } catch (error) {
    console.error('❌ Failed to update chat room:', error);
    throw error;
  }
};

/**
 * Auto-cancel booking if no location shared within timeout
 */
export const scheduleLocationTimeout = (
  bookingId: string,
  chatRoomId: string,
  onTimeout: () => void,
  timeoutMinutes: number = 5
): NodeJS.Timeout => {
  console.log(`⏱️ Location verification timeout set: ${timeoutMinutes} minutes`);
  
  return setTimeout(async () => {
    try {
      console.warn('⚠️ Location timeout reached for booking:', bookingId);
      
      // Update booking status
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        bookingId,
        {
          status: 'cancelled_no_location',
          cancelledAt: new Date().toISOString(),
          cancellationReason: 'Location not shared within 5 minutes'
        }
      );

      // Update chat room
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatRooms,
        chatRoomId,
        {
          status: 'cancelled',
          requiresLocation: false
        }
      );

      console.log('✅ Booking auto-cancelled due to location timeout');
      onTimeout();
    } catch (error) {
      console.error('❌ Failed to auto-cancel booking:', error);
    }
  }, timeoutMinutes * 60 * 1000);
};

/**
 * Cancel booking when user denies GPS permission
 */
export const cancelBookingLocationDenied = async (
  bookingId: string,
  chatRoomId: string
): Promise<void> => {
  try {
    console.log('🚫 Cancelling booking - GPS denied by user');
    
    // Update booking
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.bookings,
      bookingId,
      {
        status: 'cancelled_location_denied',
        cancelledAt: new Date().toISOString(),
        cancellationReason: 'User denied GPS permission'
      }
    );

    // Update chat room
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.chatRooms,
      chatRoomId,
      {
        status: 'cancelled',
        requiresLocation: false
      }
    );

    console.log('✅ Booking cancelled - location denied');
  } catch (error) {
    console.error('❌ Failed to cancel booking:', error);
    throw error;
  }
};

/**
 * Therapist rejects location (suspicious/outside service area)
 */
export const rejectBookingLocation = async (
  bookingId: string,
  chatRoomId: string,
  reason: string
): Promise<void> => {
  try {
    console.log('🚫 Therapist rejecting location:', reason);
    
    // Update booking
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.bookings,
      bookingId,
      {
        status: 'rejected_location',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason
      }
    );

    // Update chat room
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.chatRooms,
      chatRoomId,
      {
        status: 'rejected',
        locationVerified: false
      }
    );

    console.log('✅ Location rejected by therapist');
  } catch (error) {
    console.error('❌ Failed to reject location:', error);
    throw error;
  }
};

/**
 * Get location data for a booking
 */
export const getBookingLocation = async (bookingId: string): Promise<LocationData | null> => {
  try {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.booking_locations,
      [
        `bookingId="${bookingId}"`
      ]
    );

    if (response.documents.length === 0) {
      return null;
    }

    const doc = response.documents[0];
    return {
      bookingId: doc.bookingId,
      chatRoomId: doc.chatRoomId,
      latitude: doc.latitude,
      longitude: doc.longitude,
      accuracy: doc.accuracy,
      timestamp: doc.timestamp,
      source: doc.source
    };
  } catch (error) {
    console.error('❌ Failed to fetch location:', error);
    return null;
  }
};

/**
 * Check if accuracy is acceptable (< 500m)
 */
export const isAccuracyAcceptable = (accuracy: number): boolean => {
  return accuracy <= 500;
};

/**
 * Format accuracy for display
 */
export const formatAccuracy = (accuracy: number): string => {
  if (accuracy < 50) return `±${accuracy.toFixed(0)}m (Excellent)`;
  if (accuracy < 100) return `±${accuracy.toFixed(0)}m (Good)`;
  if (accuracy < 500) return `±${accuracy.toFixed(0)}m (Fair)`;
  return `±${accuracy.toFixed(0)}m (Poor)`;
};

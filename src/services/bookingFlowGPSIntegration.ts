/**
 * ============================================================================
 * 🎯 BOOKING FLOW GPS INTEGRATION - CUSTOMER & THERAPIST LOCATION SHARING
 * ============================================================================
 * 
 * This service integrates customer GPS data into the booking flow and enables
 * seamless location sharing with therapists for proximity verification.
 * 
 * Features:
 * • Automatic customer GPS inclusion in booking data
 * • Distance calculation between customer and therapist
 * • Location verification alerts for therapists
 * • Book now feature with GPS proximity matching
 * • No backend changes required - works with existing collections
 * 
 * ============================================================================
 */

import { customerGPSService, CustomerGPSUtils, type CustomerGPSData, type TherapistLocationComparison } from './customerGPSCollectionService';
import type { BookingRequest } from './enterpriseBookingFlowService';

export interface GPSEnhancedBookingData {
  // Standard booking data
  customerName: string;
  customerWhatsApp: string;
  therapistId: string;
  therapistName: string;
  duration: number;
  price: number;
  location: string;
  
  // GPS-enhanced data
  customerGPS?: CustomerGPSData;
  locationVerification?: TherapistLocationComparison;
  gpsSharedWithTherapist: boolean;
  proximityStatus: 'verified' | 'warning' | 'unknown';
  estimatedDistance?: number;
}

export interface TherapistGPSAlert {
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  distance?: number;
  customerAddress?: string;
  recommendation?: string;
}

class BookingFlowGPSIntegration {

  /**
   * � MAP VERIFICATION STATUS TO PROXIMITY STATUS
   * Converts detailed verification status to simpler proximity status for booking flow
   */
  private mapVerificationStatusToProximity(
    status: 'verified' | 'needs_check' | 'mismatch' | 'no_therapist_gps'
  ): 'verified' | 'warning' | 'unknown' {
    switch (status) {
      case 'verified':
        return 'verified';
      case 'needs_check':
      case 'mismatch':
        return 'warning';
      case 'no_therapist_gps':
        return 'unknown';
      default:
        return 'unknown';
    }
  }

  /**
   * �🚀 ENHANCE BOOKING DATA WITH GPS INFORMATION
   * Automatically includes customer GPS when available
   */
  async enhanceBookingWithGPS(bookingData: any, therapistData?: any): Promise<GPSEnhancedBookingData> {
    console.log('🌍 [BOOKING GPS] Enhancing booking with GPS data...');

    const gpsBookingData: GPSEnhancedBookingData = {
      ...bookingData,
      gpsSharedWithTherapist: false,
      proximityStatus: 'unknown'
    };

    try {
      // Get customer GPS data
      const customerGPS = customerGPSService.getCachedGPSData();
      
      if (customerGPS) {
        gpsBookingData.customerGPS = customerGPS;
        gpsBookingData.gpsSharedWithTherapist = true;
        
        // If we have therapist data, perform location comparison
        if (therapistData) {
          const comparison = await customerGPSService.compareWithTherapist(
            therapistData.$id || therapistData.id,
            therapistData
          );
          
          if (comparison) {
            gpsBookingData.locationVerification = comparison;
            gpsBookingData.proximityStatus = this.mapVerificationStatusToProximity(comparison.verificationStatus);
            gpsBookingData.estimatedDistance = comparison.distance;
            
            console.log('📏 [BOOKING GPS] Distance verification:', {
              distance: `${comparison.distance.toFixed(2)}km`,
              status: comparison.verificationStatus
            });
          }
        }

        // Override location with GPS address if more accurate
        if (customerGPS.address && customerGPS.address.length > bookingData.location?.length) {
          gpsBookingData.location = customerGPS.address;
        }

        console.log('✅ [BOOKING GPS] Booking enhanced with GPS data');
      } else {
        console.log('📍 [BOOKING GPS] No customer GPS available - using standard booking');
      }

    } catch (error) {
      console.error('❌ [BOOKING GPS] Enhancement failed:', error);
      // Graceful fallback - booking continues without GPS
    }

    return gpsBookingData;
  }

  /**
   * 🏠 GENERATE THERAPIST GPS ALERT
   * Creates alert message for therapist about customer location
   */
  generateTherapistLocationAlert(bookingData: GPSEnhancedBookingData): TherapistGPSAlert {
    if (!bookingData.customerGPS || !bookingData.locationVerification) {
      return {
        type: 'info',
        title: 'Customer Location',
        message: `📍 Customer address: ${bookingData.location}`,
        recommendation: 'Please confirm the exact location with the customer before heading out.'
      };
    }

    const verification = bookingData.locationVerification;
    const distance = verification.distance;

    if (verification.verificationStatus === 'verified') {
      return {
        type: 'info',
        title: '✅ Location Verified',
        message: `Customer is ${distance.toFixed(1)}km away from your location.`,
        distance: distance,
        customerAddress: bookingData.customerGPS.address,
        recommendation: verification.recommendation
      };
    }

    if (verification.verificationStatus === 'needs_check') {
      return {
        type: 'warning',
        title: '⚠️ Distance Check Required',
        message: `Customer is ${distance.toFixed(1)}km away from your registered location.`,
        distance: distance,
        customerAddress: bookingData.customerGPS.address,
        recommendation: verification.recommendation
      };
    }

    // verification.verificationStatus === 'mismatch'
    return {
      type: 'error',
      title: '❌ Distance Alert',
      message: `Customer is ${distance.toFixed(1)}km away - please verify you can serve this area.`,
      distance: distance,
      customerAddress: bookingData.customerGPS.address,
      recommendation: verification.recommendation
    };
  }

  /**
   * 🔍 FIND NEARBY THERAPISTS USING CUSTOMER GPS
   * Enhanced therapist filtering based on customer location
   */
  async findNearbyTherapists(
    allTherapists: any[],
    maxDistance: number = 25
  ): Promise<Array<any & { distance: number; proximityScore: number }>> {
    const customerGPS = customerGPSService.getCachedGPSData();
    
    if (!customerGPS) {
      console.log('📍 [NEARBY SEARCH] No customer GPS - returning all therapists');
      return allTherapists.map(t => ({ ...t, distance: 0, proximityScore: 0 }));
    }

    console.log('🔍 [NEARBY SEARCH] Finding therapists near customer location...');
    
    const therapistsWithDistance: Array<any & { distance: number; proximityScore: number }> = [];

    for (const therapist of allTherapists) {
      try {
        const comparison = await customerGPSService.compareWithTherapist(
          therapist.$id || therapist.id,
          therapist
        );
        
        if (comparison && comparison.distance <= maxDistance) {
          const proximityScore = this.calculateProximityScore(comparison.distance);
          
          therapistsWithDistance.push({
            ...therapist,
            distance: comparison.distance,
            proximityScore
          });
        }
      } catch (error) {
        console.warn('⚠️ [NEARBY SEARCH] Failed to calculate distance for therapist:', therapist.name);
        // Include therapist without distance data
        therapistsWithDistance.push({
          ...therapist,
          distance: 999,
          proximityScore: 0
        });
      }
    }

    // Sort by distance (closest first)
    therapistsWithDistance.sort((a, b) => a.distance - b.distance);

    console.log(`✅ [NEARBY SEARCH] Found ${therapistsWithDistance.length} nearby therapists`);
    
    return therapistsWithDistance;
  }

  /**
   * 🎯 CALCULATE PROXIMITY SCORE FOR RANKING
   * Higher score = better proximity match
   */
  private calculateProximityScore(distance: number): number {
    if (distance <= 2) return 100;   // Perfect - very close
    if (distance <= 5) return 90;    // Excellent - nearby
    if (distance <= 10) return 75;   // Good - reasonable distance
    if (distance <= 15) return 50;   // Fair - still serviceable
    if (distance <= 25) return 25;   // Poor - far but possible
    return 0;                        // Too far
  }

  /**
   * 📝 CREATE CHAT MESSAGE WITH LOCATION DATA
   * Generates location-aware chat message for therapist
   */
  createLocationAwareBookingMessage(bookingData: GPSEnhancedBookingData): string {
    let message = `🎯 New booking request!\n\n`;
    message += `👤 Customer: ${bookingData.customerName}\n`;
    message += `📱 WhatsApp: ${bookingData.customerWhatsApp}\n`;
    message += `⏰ Duration: ${bookingData.duration} minutes\n`;
    message += `💰 Price: IDR ${bookingData.price.toLocaleString()}\n\n`;

    // Add location information
    if (bookingData.customerGPS && bookingData.locationVerification) {
      const distance = bookingData.locationVerification.distance;
      
      if (distance <= 5) {
        message += `📍 Location: ${bookingData.customerGPS.address}\n`;
        message += `✅ Distance: ${distance.toFixed(1)}km (Very close to you)\n`;
        message += `🗺️ Maps: https://maps.google.com/maps?q=${bookingData.customerGPS.coordinates.lat},${bookingData.customerGPS.coordinates.lng}\n\n`;
      } else if (distance <= 15) {
        message += `📍 Location: ${bookingData.customerGPS.address}\n`;
        message += `⚠️ Distance: ${distance.toFixed(1)}km (Please confirm you serve this area)\n`;
        message += `🗺️ Maps: https://maps.google.com/maps?q=${bookingData.customerGPS.coordinates.lat},${bookingData.customerGPS.coordinates.lng}\n\n`;
      } else {
        message += `📍 Location: ${bookingData.customerGPS.address}\n`;
        message += `❌ Distance: ${distance.toFixed(1)}km (This may be too far - please verify)\n`;
        message += `🗺️ Maps: https://maps.google.com/maps?q=${bookingData.customerGPS.coordinates.lat},${bookingData.customerGPS.coordinates.lng}\n\n`;
      }

      message += `${bookingData.locationVerification.recommendation}\n\n`;
    } else {
      message += `📍 Location: ${bookingData.location}\n`;
      message += `🔍 GPS data not available - please confirm exact location with customer\n\n`;
    }

    message += `Reply with:
✅ "ACCEPT" to confirm this booking
❌ "DECLINE" if you cannot serve this location`;

    return message;
  }

  /**
   * 📊 GET BOOKING GPS STATISTICS
   * For analytics and system monitoring
   */
  getBookingGPSStats(): {
    hasCustomerGPS: boolean;
    gpsAge?: number;
    gpsAccuracy?: number;
    availableForBooking: boolean;
  } {
    const stats = customerGPSService.getDataStats();
    
    return {
      hasCustomerGPS: stats.hasData,
      gpsAge: stats.age,
      gpsAccuracy: stats.accuracy,
      availableForBooking: CustomerGPSUtils.isGPSAvailableForBooking()
    };
  }

  /**
   * 🎯 BOOK NOW FEATURE WITH GPS PROXIMITY
   * Enhanced book now that prioritizes nearby therapists
   */
  async bookNowWithProximity(
    customerDetails: {
      name: string;
      whatsapp: string;
      duration: number;
      serviceType?: string;
    },
    therapistPool: any[]
  ): Promise<{
    success: boolean;
    bookingData?: GPSEnhancedBookingData;
    selectedTherapist?: any;
    error?: string;
  }> {
    try {
      console.log('🎯 [BOOK NOW GPS] Starting proximity-based booking...');

      // Find nearby therapists
      const nearbyTherapists = await this.findNearbyTherapists(therapistPool);
      
      if (nearbyTherapists.length === 0) {
        return {
          success: false,
          error: 'No therapists available in your area. Please try selecting a different location.'
        };
      }

      // Select the closest available therapist
      const selectedTherapist = nearbyTherapists[0];
      
      // Create enhanced booking data
      const bookingData = await this.enhanceBookingWithGPS({
        customerName: customerDetails.name,
        customerWhatsApp: customerDetails.whatsapp,
        therapistId: selectedTherapist.$id || selectedTherapist.id,
        therapistName: selectedTherapist.name,
        duration: customerDetails.duration,
        price: selectedTherapist.pricing || 150000,
        location: CustomerGPSUtils.getAddressForBooking() || 'Customer location',
        serviceType: customerDetails.serviceType || 'Home Massage'
      }, selectedTherapist);

      console.log('✅ [BOOK NOW GPS] Proximity booking successful:', {
        therapist: selectedTherapist.name,
        distance: selectedTherapist.distance,
        status: bookingData.proximityStatus
      });

      return {
        success: true,
        bookingData,
        selectedTherapist
      };

    } catch (error) {
      console.error('❌ [BOOK NOW GPS] Proximity booking failed:', error);
      return {
        success: false,
        error: 'Failed to create proximity-based booking. Please try manual booking.'
      };
    }
  }
}

// Create and export singleton instance
export const bookingGPSIntegration = new BookingFlowGPSIntegration();

// Export utility functions for easy integration
export const BookingGPSUtils = {
  /**
   * Quick function to add GPS to any booking
   */
  addGPSToBooking: async (bookingData: any, therapistData?: any) => {
    return await bookingGPSIntegration.enhanceBookingWithGPS(bookingData, therapistData);
  },

  /**
   * Generate therapist alert message
   */
  getTherapistAlert: (bookingData: GPSEnhancedBookingData) => {
    return bookingGPSIntegration.generateTherapistLocationAlert(bookingData);
  },

  /**
   * Create GPS-aware booking message
   */
  createBookingMessage: (bookingData: GPSEnhancedBookingData) => {
    return bookingGPSIntegration.createLocationAwareBookingMessage(bookingData);
  },

  /**
   * Check if GPS booking is available
   */
  isGPSBookingAvailable: () => {
    return CustomerGPSUtils.isGPSAvailableForBooking();
  }
};

// Console output for immediate verification
console.log(`
🎯 ============================================================================
   BOOKING FLOW GPS INTEGRATION - READY
   ============================================================================
   
   🌍 FEATURES AVAILABLE:
   • Automatic GPS inclusion in booking data
   • Customer-therapist distance calculation  
   • Smart therapist proximity filtering
   • Location-aware chat messages
   • Enhanced "Book Now" with GPS matching
   
   🎯 INTEGRATION EXAMPLES:
   
   // 1. Enhance any booking with GPS
   const gpsBooking = await BookingGPSUtils.addGPSToBooking(bookingData, therapist);
   
   // 2. Find nearby therapists
   const nearby = await bookingGPSIntegration.findNearbyTherapists(allTherapists);
   
   // 3. Create location-aware message
   const message = BookingGPSUtils.createBookingMessage(gpsBooking);
   
   // 4. Book now with proximity
   const result = await bookingGPSIntegration.bookNowWithProximity(customer, therapists);
   
   🛡️ COMPATIBILITY:
   • Works with existing booking collections ✅
   • No backend modifications required ✅
   • Golden Plus Protection System safe ✅
   • Graceful fallback for non-GPS bookings ✅
   
   🎯 READY FOR THERAPIST LOCATION SHARING!
   ============================================================================
`);

export default bookingGPSIntegration;
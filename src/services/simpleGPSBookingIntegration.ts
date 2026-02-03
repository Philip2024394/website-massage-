/**
 * ============================================================================
 * 🎯 SIMPLE GPS BOOKING INTEGRATION - CLEAN & MINIMAL
 * ============================================================================
 * 
 * This is the clean implementation you requested:
 * • Landing page GPS auto-collection (one-time permission)
 * • Automatic location sharing with therapists during booking
 * • No complex chat window modifications
 * • Works with your existing booking flow
 * 
 * ============================================================================
 */

import { customerGPSService, type CustomerGPSData } from './customerGPSCollectionService';

export interface SimpleGPSBookingData {
  // Your existing booking data
  customerName: string;
  customerWhatsApp: string;
  therapistId: string;
  therapistName: string;
  duration: number;
  price: number;
  location: string;
  
  // GPS enhancement (automatically added if available)
  customerGPS?: {
    coordinates: { lat: number; lng: number };
    address: string;
    accuracy: number;
  };
  distanceToTherapist?: number;
  googleMapsLink?: string;
}

class SimpleGPSBookingIntegration {

  /**
   * 🚀 ENHANCE ANY BOOKING WITH GPS (IF AVAILABLE)
   * Simply call this on any booking - GPS is added automatically if user granted permission
   */
  enhanceBookingWithGPS(bookingData: any, therapistData?: any): SimpleGPSBookingData {
    const enhanced: SimpleGPSBookingData = { ...bookingData };

    // Get customer GPS if available (no permission popup - uses existing permission)
    const customerGPS = customerGPSService.getCachedGPSData();
    
    if (customerGPS) {
      enhanced.customerGPS = {
        coordinates: customerGPS.coordinates,
        address: customerGPS.address,
        accuracy: customerGPS.accuracy
      };

      // Create Google Maps link for therapist
      enhanced.googleMapsLink = `https://maps.google.com/maps?q=${customerGPS.coordinates.lat},${customerGPS.coordinates.lng}`;

      // Calculate distance if therapist has GPS
      if (therapistData && this.getTherapistGPS(therapistData)) {
        const therapistGPS = this.getTherapistGPS(therapistData);
        if (therapistGPS) {
          enhanced.distanceToTherapist = this.calculateDistance(
            customerGPS.coordinates,
            therapistGPS
          );
        }
      }

      // Use more accurate GPS address if available
      if (customerGPS.address.length > enhanced.location.length) {
        enhanced.location = customerGPS.address;
      }

      console.log('✅ [SIMPLE GPS] Booking enhanced with GPS data');
    } else {
      console.log('📍 [SIMPLE GPS] No GPS available - using standard booking');
    }

    return enhanced;
  }

  /**
   * 📝 CREATE THERAPIST MESSAGE WITH LOCATION (FOR YOUR EXISTING CHAT SYSTEM)
   */
  createTherapistMessage(bookingData: SimpleGPSBookingData): string {
    let message = `🎯 New booking request!\n\n`;
    message += `👤 Customer: ${bookingData.customerName}\n`;
    message += `📱 WhatsApp: ${bookingData.customerWhatsApp}\n`;
    message += `⏰ Duration: ${bookingData.duration} minutes\n`;
    message += `💰 Price: IDR ${bookingData.price.toLocaleString()}\n\n`;

    // Add location info - enhanced with GPS if available
    if (bookingData.customerGPS) {
      message += `📍 Location: ${bookingData.customerGPS.address}\n`;
      
      if (bookingData.distanceToTherapist) {
        const distance = bookingData.distanceToTherapist;
        if (distance <= 5) {
          message += `✅ Distance: ${distance.toFixed(1)}km (Very close to you!)\n`;
        } else if (distance <= 15) {
          message += `⚠️ Distance: ${distance.toFixed(1)}km (Please confirm you serve this area)\n`;
        } else {
          message += `❌ Distance: ${distance.toFixed(1)}km (This may be too far)\n`;
        }
      }

      if (bookingData.googleMapsLink) {
        message += `🗺️ Google Maps: ${bookingData.googleMapsLink}\n`;
      }
      
      message += `📍 GPS Accuracy: ±${bookingData.customerGPS.accuracy}m\n\n`;
    } else {
      message += `📍 Location: ${bookingData.location}\n`;
      message += `ℹ️ GPS not available - please confirm exact location\n\n`;
    }

    message += `Reply ACCEPT to confirm this booking`;

    return message;
  }

  /**
   * 🎯 FIND NEARBY THERAPISTS (SIMPLE VERSION)
   */
  findNearbyTherapists(allTherapists: any[], maxDistanceKm: number = 25): any[] {
    const customerGPS = customerGPSService.getCachedGPSData();
    
    if (!customerGPS) {
      // No GPS - return all therapists
      return allTherapists;
    }

    const nearby: any[] = [];

    for (const therapist of allTherapists) {
      const therapistGPS = this.getTherapistGPS(therapist);
      
      if (!therapistGPS) {
        // Include therapists without GPS
        nearby.push({ ...therapist, distance: 999 });
        continue;
      }

      const distance = this.calculateDistance(customerGPS.coordinates, therapistGPS);
      
      if (distance <= maxDistanceKm) {
        nearby.push({ ...therapist, distance });
      }
    }

    // Sort by distance (closest first)
    return nearby.sort((a, b) => a.distance - b.distance);
  }

  /**
   * 📏 CALCULATE DISTANCE BETWEEN TWO POINTS
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLng = this.toRad(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) * Math.cos(this.toRad(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 🔍 EXTRACT THERAPIST GPS FROM YOUR EXISTING DATA STRUCTURE
   */
  private getTherapistGPS(therapistData: any): { lat: number; lng: number } | null {
    // Method 1: Check geopoint field (your GPS-authoritative field)
    if (therapistData.geopoint?.lat && therapistData.geopoint?.lng) {
      return {
        lat: therapistData.geopoint.lat,
        lng: therapistData.geopoint.lng
      };
    }

    // Method 2: Check coordinate field
    if (therapistData.coordinate?.lat && therapistData.coordinate?.lng) {
      return {
        lat: therapistData.coordinate.lat,
        lng: therapistData.coordinate.lng
      };
    }

    // Method 3: Parse coordinates JSON string
    if (therapistData.coordinates && typeof therapistData.coordinates === 'string') {
      try {
        const parsed = JSON.parse(therapistData.coordinates);
        if (parsed.lat && parsed.lng) {
          return { lat: parsed.lat, lng: parsed.lng };
        }
      } catch (e) {
        console.warn('Failed to parse therapist coordinates');
      }
    }

    return null;
  }

  /**
   * 📊 CHECK IF GPS IS AVAILABLE FOR BOOKING
   */
  isGPSAvailable(): boolean {
    return customerGPSService.getCachedGPSData() !== null;
  }

  /**
   * 📍 GET GPS STATS FOR DEBUGGING
   */
  getGPSStats() {
    const data = customerGPSService.getCachedGPSData();
    if (!data) return { available: false };

    return {
      available: true,
      city: data.city,
      accuracy: data.accuracy,
      age: (Date.now() - data.timestamp.getTime()) / (1000 * 60), // minutes
      coordinates: data.coordinates
    };
  }
}

// Export singleton instance
export const simpleGPSBooking = new SimpleGPSBookingIntegration();

// Export simple utility functions
export const SimpleGPSUtils = {
  /**
   * Add GPS to any booking (main function you'll use)
   */
  enhanceBooking: (booking: any, therapist?: any) => 
    simpleGPSBooking.enhanceBookingWithGPS(booking, therapist),

  /**
   * Create message for therapist with location data
   */
  createMessage: (booking: SimpleGPSBookingData) => 
    simpleGPSBooking.createTherapistMessage(booking),

  /**
   * Filter therapists by proximity
   */
  findNearby: (therapists: any[], maxDistance?: number) => 
    simpleGPSBooking.findNearbyTherapists(therapists, maxDistance),

  /**
   * Check if GPS is ready
   */
  hasGPS: () => simpleGPSBooking.isGPSAvailable(),

  /**
   * Get GPS status
   */
  getStats: () => simpleGPSBooking.getGPSStats()
};

// Console verification
console.log(`
🎯 ============================================================================
   SIMPLE GPS BOOKING INTEGRATION - READY
   ============================================================================
   
   ✅ CLEAN & MINIMAL IMPLEMENTATION:
   
   // 1. Landing page collects GPS automatically (one permission popup)
   await customerGPSService.autoCollectOnEntry()
   
   // 2. Any booking automatically includes GPS if available
   const gpsBooking = SimpleGPSUtils.enhanceBooking(booking, therapist)
   
   // 3. Create therapist message with location
   const message = SimpleGPSUtils.createMessage(gpsBooking)
   
   // 4. Find nearby therapists
   const nearby = SimpleGPSUtils.findNearby(allTherapists)
   
   🔒 PRIVACY: GPS stored locally only, shared with therapist only during booking
   🛡️ SAFE: No complex chat modifications, works with existing flow
   ⚡ SIMPLE: Just 2 lines of code to add to any booking
   
   ============================================================================
`);

export default simpleGPSBooking;
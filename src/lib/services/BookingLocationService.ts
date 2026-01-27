/**
 * 🌍 BOOKING LOCATION SERVICE
 * 
 * Automatically detects and manages user location for booking operations
 * Integrates with existing location services and provides fallbacks for BookingEngine
 */

import { locationService } from '../../services/locationService';
import { ipGeolocationService } from '../ipGeolocationService';
import type { UserLocation } from '../../types';

interface LocationZoneMapping {
  [key: string]: string;
}

// Map coordinates/cities to location zones used in booking system
const LOCATION_ZONE_MAPPING: LocationZoneMapping = {
  // Indonesia Major Cities
  'jakarta': 'Jakarta',
  'surabaya': 'Surabaya', 
  'bandung': 'Bandung',
  'medan': 'Medan',
  'semarang': 'Semarang',
  'makassar': 'Makassar',
  'palembang': 'Palembang',
  'yogyakarta': 'Yogyakarta',
  'yogya': 'Yogyakarta',
  'depok': 'Jakarta', // Greater Jakarta
  'tangerang': 'Jakarta', // Greater Jakarta
  'bekasi': 'Jakarta', // Greater Jakarta
  'bogor': 'Jakarta', // Greater Jakarta
  
  // Default zones by province/region
  'bali': 'Bali',
  'denpasar': 'Bali',
  'ubud': 'Bali',
  'sanur': 'Bali',
  'kuta': 'Bali',
  'nusa dua': 'Bali',
};

class BookingLocationService {
  private static instance: BookingLocationService;
  private cachedLocationZone: string | null = null;
  private lastLocationUpdate: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  public static getInstance(): BookingLocationService {
    if (!BookingLocationService.instance) {
      BookingLocationService.instance = new BookingLocationService();
    }
    return BookingLocationService.instance;
  }

  /**
   * 🎯 PRIMARY METHOD: Get location zone for booking
   * 
   * Priority:
   * 1. Cached location zone (if fresh)
   * 2. GPS detection + mapping
   * 3. IP geolocation + mapping 
   * 4. Default fallback (Jakarta)
   */
  public async getLocationZoneForBooking(): Promise<string> {
    console.log('🌍 BookingLocationService: Getting location zone for booking...');

    // Check cache first
    if (this.isCacheValid()) {
      console.log('📋 Using cached location zone:', this.cachedLocationZone);
      return this.cachedLocationZone!;
    }

    try {
      // Step 1: Try GPS detection
      const gpsLocation = await this.tryGPSDetection();
      if (gpsLocation) {
        const zone = this.mapLocationToZone(gpsLocation);
        this.cacheLocationZone(zone);
        console.log('📍 GPS location zone:', zone);
        return zone;
      }
    } catch (error) {
      console.log('📍 GPS detection failed, trying IP geolocation...');
    }

    try {
      // Step 2: Try IP geolocation
      const ipLocation = await this.tryIPGeolocation();
      if (ipLocation) {
        const zone = this.mapLocationToZone(ipLocation);
        this.cacheLocationZone(zone);
        console.log('🌐 IP location zone:', zone);
        return zone;
      }
    } catch (error) {
      console.log('🌐 IP geolocation failed, using default...');
    }

    // Step 3: Default fallback
    const defaultZone = 'Jakarta';
    this.cacheLocationZone(defaultZone);
    console.log('🏠 Using default location zone:', defaultZone);
    return defaultZone;
  }

  /**
   * Try GPS detection with timeout
   */
  private async tryGPSDetection(): Promise<UserLocation | null> {
    try {
      // Quick GPS attempt with short timeout
      const location = await Promise.race([
        locationService.getCurrentLocation({
          enableHighAccuracy: false,
          timeout: 5000, // Short timeout for booking flow
          maximumAge: 300000 // 5 minutes cache
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('GPS timeout')), 6000)
        )
      ]);

      return location;
    } catch (error) {
      console.log('📍 GPS detection quick attempt failed:', error);
      return null;
    }
  }

  /**
   * Try IP geolocation as fallback
   */
  private async tryIPGeolocation(): Promise<{ address: string; city?: string } | null> {
    try {
      const ipLocation = await ipGeolocationService.getUserLocation();
      
      if (ipLocation.city) {
        return {
          address: ipLocation.city,
          city: ipLocation.city
        };
      }

      return null;
    } catch (error) {
      console.log('🌐 IP geolocation failed:', error);
      return null;
    }
  }

  /**
   * Map detected location to booking location zone
   */
  private mapLocationToZone(location: UserLocation | { address: string; city?: string }): string {
    const address = location.address.toLowerCase();
    const city = (location as any).city?.toLowerCase() || '';

    // Try exact city matches first
    for (const [key, zone] of Object.entries(LOCATION_ZONE_MAPPING)) {
      if (city.includes(key) || address.includes(key)) {
        return zone;
      }
    }

    // Try province/region matches
    if (address.includes('bali')) return 'Bali';
    if (address.includes('yogya') || address.includes('jogja')) return 'Yogyakarta';
    if (address.includes('bandung')) return 'Bandung';
    if (address.includes('surabaya')) return 'Surabaya';
    if (address.includes('medan')) return 'Medan';
    if (address.includes('jakarta') || address.includes('dki')) return 'Jakarta';

    // Default to Jakarta for Indonesia
    return 'Jakarta';
  }

  /**
   * Cache management
   */
  private isCacheValid(): boolean {
    return this.cachedLocationZone && 
           (Date.now() - this.lastLocationUpdate) < this.CACHE_DURATION;
  }

  private cacheLocationZone(zone: string): void {
    this.cachedLocationZone = zone;
    this.lastLocationUpdate = Date.now();
  }

  /**
   * Clear cache (for testing or manual refresh)
   */
  public clearCache(): void {
    this.cachedLocationZone = null;
    this.lastLocationUpdate = 0;
  }

  /**
   * Get available location zones
   */
  public getAvailableZones(): string[] {
    return [...new Set(Object.values(LOCATION_ZONE_MAPPING))];
  }

  /**
   * Manual override for specific location zone
   */
  public setLocationZone(zone: string): void {
    console.log('🎯 Manual location zone override:', zone);
    this.cacheLocationZone(zone);
  }
}

// Export singleton instance
export const bookingLocationService = BookingLocationService.getInstance();
export type { LocationZoneMapping };
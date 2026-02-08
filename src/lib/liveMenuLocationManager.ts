/**
 * Enhanced Location Manager for Live Menu
 * Provides location services specifically optimized for hotel/villa guests
 */

import { logger } from '@/lib/logger.production';
import { locationService } from '../services/locationService';
import { enhancedDistanceService } from './googleMapsDistanceService';
import type { UserLocation } from '../types';

interface LocationManagerOptions {
  venueLocation?: UserLocation;
  userLocation?: UserLocation;
  radiusKm?: number;
  useVenueAsDefault?: boolean;
}

export class LiveMenuLocationManager {
  private static instance: LiveMenuLocationManager;
  private venueLocation: UserLocation | null = null;
  private guestLocation: UserLocation | null = null;

  public static getInstance(): LiveMenuLocationManager {
    if (!LiveMenuLocationManager.instance) {
      LiveMenuLocationManager.instance = new LiveMenuLocationManager();
    }
    return LiveMenuLocationManager.instance;
  }

  /**
   * Initialize location for live menu with venue as primary reference
   */
  async initializeLiveMenuLocation(options: LocationManagerOptions): Promise<UserLocation> {
    logger.debug('🏨 Initializing Live Menu location system...');

    // Set venue location as primary reference
    if (options.venueLocation) {
      this.venueLocation = options.venueLocation;
      logger.debug('🏨 Venue location set:', this.venueLocation);
    }

    // Try to get guest's current location for more accurate distances
    try {
      logger.debug('📱 Attempting to get guest location for precise distances...');
      const guestLocation = await locationService.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000, // Shorter timeout for guests
        maximumAge: 300000 // 5-minute cache for live menu
      });
      
      this.guestLocation = guestLocation;
      logger.debug('✅ Guest location obtained:', guestLocation);
      return guestLocation;
      
    } catch (error) {
      logger.debug('⚠️ Guest location unavailable, using venue location:', error);
      
      // Fallback to venue location if guest denies permission
      if (this.venueLocation) {
        logger.debug('🏨 Using venue location as fallback');
        return this.venueLocation;
      }
      
      // Final fallback to default location
      logger.debug('🌍 Using default location fallback');
      return locationService.getDefaultLocation();
    }
  }

  /**
   * Get the best available location for distance calculations
   * Priority: Guest Location > Venue Location > Default Location
   */
  getBestLocationForDistances(): UserLocation {
    if (this.guestLocation) {
      logger.debug('📱 Using guest location for distances');
      return this.guestLocation;
    }
    
    if (this.venueLocation) {
      logger.debug('🏨 Using venue location for distances');
      return this.venueLocation;
    }
    
    logger.debug('🌍 Using default location for distances');
    return locationService.getDefaultLocation();
  }

  /**
   * Calculate distances for multiple providers with enhanced accuracy
   */
  async calculateProviderDistances(
    providers: Array<{ id: string | number; coordinates: string | { lat: number; lng: number } }>,
    options: { radiusKm?: number; includeOutsideRadius?: boolean } = {}
  ) {
    const { radiusKm = 15, includeOutsideRadius = true } = options;
    const referenceLocation = this.getBestLocationForDistances();

    logger.debug(`📏 Calculating distances from:`, referenceLocation);
    logger.debug(`🎯 Search radius: ${radiusKm}km`);

const providersWithDistance: any[] = [];

    for (const provider of providers) {
      try {
        // Parse coordinates
        const coords = typeof provider.coordinates === 'string' 
          ? JSON.parse(provider.coordinates)
          : provider.coordinates;

        if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
          logger.warn(`❌ Invalid coordinates for provider ${provider.id}`);
          continue;
        }

        // Calculate accurate distance with travel time
        const distanceResult = await enhancedDistanceService.getDistanceWithTravelTime(
          { lat: referenceLocation.lat, lng: referenceLocation.lng },
          { lat: coords.lat, lng: coords.lng }
        );

        // Include provider if within radius or if configured to include all
        if ((distanceResult as any).distance as any <= radiusKm || includeOutsideRadius) {
          providersWithDistance.push({
            ...provider,
            distance: (distanceResult as any as any).distance as any,
            distanceText: enhancedDistanceService.formatDistance((distanceResult as any).distance as any as any as any as any),
            travelTime: distanceResult.duration,
            travelTimeText: distanceResult.duration ? enhancedDistanceService.formatTravelTime(distanceResult.duration) : undefined
          });
        }

      } catch (error) {
        logger.error(`❌ Distance calculation failed for provider ${provider.id}:`, error);
      }
    }

    // Sort by distance (closest first)
    providersWithDistance.sort((a, b) => (a as any).distance as any - (b as any).distance as any);

    logger.debug(`✅ Distance calculation complete: ${providersWithDistance.length} providers within ${radiusKm}km`);
    return providersWithDistance;
  }

  /**
   * Show location permission prompt for guests
   */
  async requestGuestLocationPermission(): Promise<boolean> {
    try {
      await locationService.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 5000
      });
      return true;
    } catch (error) {
      logger.debug('Guest declined location permission:', error);
      return false;
    }
  }

  /**
   * Get location accuracy info for debugging
   */
  getLocationInfo() {
    return {
      venueLocation: this.venueLocation,
      guestLocation: this.guestLocation,
      activeLocation: this.getBestLocationForDistances(),
      locationSource: this.guestLocation ? 'guest' : this.venueLocation ? 'venue' : 'default'
    };
  }
}

// Export singleton instance
export const liveMenuLocationManager = LiveMenuLocationManager.getInstance();



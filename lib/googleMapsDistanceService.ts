import { getStoredGoogleMapsApiKey } from '../utils/appConfig';
import { loadGoogleMapsScript } from '../constants/appConstants';

interface DistanceResult {
  distance: number; // in kilometers
  duration?: number; // in minutes
  distanceText?: string; // formatted distance text (e.g., "5.2 km")
  durationText?: string; // formatted duration text (e.g., "15 mins")
}

interface LocationCoords {
  lat: number;
  lng: number;
}

/**
 * Google Maps Distance Service
 * Provides accurate distance and travel time calculations using Google Maps API
 */
export class GoogleMapsDistanceService {
  private static instance: GoogleMapsDistanceService;
  private isLoaded = false;
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = getStoredGoogleMapsApiKey();
  }

  public static getInstance(): GoogleMapsDistanceService {
    if (!GoogleMapsDistanceService.instance) {
      GoogleMapsDistanceService.instance = new GoogleMapsDistanceService();
    }
    return GoogleMapsDistanceService.instance;
  }

  /**
   * Initialize Google Maps API
   */
  private async initializeGoogleMaps(): Promise<boolean> {
    if (this.isLoaded) return true;
    if (!this.apiKey) {
      console.warn('Google Maps API key not found. Using fallback Haversine calculation.');
      return false;
    }

    return new Promise((resolve) => {
      loadGoogleMapsScript(
        this.apiKey!,
        () => {
          this.isLoaded = true;
          console.log('✅ Google Maps API loaded successfully');
          resolve(true);
        },
        () => {
          console.error('❌ Failed to load Google Maps API');
          resolve(false);
        }
      );
    });
  }

  /**
   * Calculate accurate distance and travel time using Google Maps Distance Matrix API
   */
  public async calculateDistanceWithGoogleMaps(
    origin: LocationCoords,
    destination: LocationCoords,
    mode: 'DRIVING' | 'WALKING' | 'TRANSIT' = 'DRIVING'
  ): Promise<DistanceResult> {
    const isApiLoaded = await this.initializeGoogleMaps();
    
    if (!isApiLoaded || !(window as any).google?.maps) {
      // Fallback to Haversine formula
      return this.calculateHaversineDistance(origin, destination);
    }

    return new Promise((resolve) => {
      const service = new (window as any).google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix({
        origins: [new (window as any).google.maps.LatLng(origin.lat, origin.lng)],
        destinations: [new (window as any).google.maps.LatLng(destination.lat, destination.lng)],
        travelMode: (window as any).google.maps.TravelMode[mode],
        unitSystem: (window as any).google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (response: any, status: any) => {
        if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
          const element = response.rows[0].elements[0];
          resolve({
            distance: element.distance.value / 1000, // Convert meters to kilometers
            duration: element.duration.value / 60, // Convert seconds to minutes
            distanceText: element.distance.text,
            durationText: element.duration.text
          });
        } else {
          console.warn('Google Maps Distance Matrix failed, using Haversine fallback');
          resolve(this.calculateHaversineDistance(origin, destination));
        }
      });
    });
  }

  /**
   * Fallback Haversine formula calculation
   */
  private calculateHaversineDistance(origin: LocationCoords, destination: LocationCoords): DistanceResult {
    const R = 6371; // Radius of the Earth in km
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLng = (destination.lng - origin.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return {
      distance,
      distanceText: `${distance.toFixed(1)} km`,
      durationText: `~${Math.round(distance * 3)} mins` // Rough estimate: 3 minutes per km
    };
  }

  /**
   * Get distance with intelligent API usage
   * Uses Google Maps for precise calculations, falls back to Haversine if needed
   */
  public async getDistance(origin: LocationCoords, destination: LocationCoords): Promise<DistanceResult> {
    try {
      return await this.calculateDistanceWithGoogleMaps(origin, destination);
    } catch (error) {
      console.warn('Distance calculation error, using fallback:', error);
      return this.calculateHaversineDistance(origin, destination);
    }
  }

  /**
   * Calculate distances for multiple destinations (batch processing)
   */
  public async getMultipleDistances(
    origin: LocationCoords,
    destinations: LocationCoords[]
  ): Promise<DistanceResult[]> {
    const isApiLoaded = await this.initializeGoogleMaps();
    
    if (!isApiLoaded || !(window as any).google?.maps || destinations.length > 25) {
      // Use Haversine for fallback or if too many destinations
      return destinations.map(dest => this.calculateHaversineDistance(origin, dest));
    }

    return new Promise((resolve) => {
      const service = new (window as any).google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix({
        origins: [new (window as any).google.maps.LatLng(origin.lat, origin.lng)],
        destinations: destinations.map(dest => 
          new (window as any).google.maps.LatLng(dest.lat, dest.lng)
        ),
        travelMode: (window as any).google.maps.TravelMode.DRIVING,
        unitSystem: (window as any).google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (response: any, status: any) => {
        if (status === 'OK') {
          const results = response.rows[0].elements.map((element: any, index: number) => {
            if (element.status === 'OK') {
              return {
                distance: element.distance.value / 1000,
                duration: element.duration.value / 60,
                distanceText: element.distance.text,
                durationText: element.duration.text
              };
            } else {
              return this.calculateHaversineDistance(origin, destinations[index]);
            }
          });
          resolve(results);
        } else {
          console.warn('Google Maps batch distance calculation failed, using Haversine fallback');
          resolve(destinations.map(dest => this.calculateHaversineDistance(origin, dest)));
        }
      });
    });
  }

  /**
   * Check if Google Maps API is available and working
   */
  public async isGoogleMapsAvailable(): Promise<boolean> {
    return await this.initializeGoogleMaps();
  }

  /**
   * Update API key (for admin dashboard)
   */
  public updateApiKey(newApiKey: string): void {
    this.apiKey = newApiKey;
    this.isLoaded = false; // Reset to reload with new key
  }
}

// Export singleton instance
export const googleMapsDistanceService = GoogleMapsDistanceService.getInstance();

/**
 * Enhanced distance service that combines Google Maps API with Haversine fallback
 */
export const enhancedDistanceService = {
  /**
   * Get accurate distance between two points with travel time
   */
  async getDistanceWithTravelTime(
    origin: LocationCoords,
    destination: LocationCoords
  ): Promise<DistanceResult> {
    return await googleMapsDistanceService.getDistance(origin, destination);
  },

  /**
   * Format distance for display
   */
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  },

  /**
   * Format travel time for display
   */
  formatTravelTime(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMins = Math.round(minutes % 60);
    return `${hours}h ${remainingMins}m`;
  },

  /**
   * Check if location is within service radius
   */
  isWithinRadius(distance: number, radiusKm: number): boolean {
    return distance <= radiusKm;
  },

  /**
   * Get travel mode icon
   */
  getTravelModeIcon(mode: 'DRIVING' | 'WALKING' | 'TRANSIT' = 'DRIVING'): string {
    switch (mode) {
      case 'DRIVING': return '🚗';
      case 'WALKING': return '🚶';
      case 'TRANSIT': return '🚌';
      default: return '📍';
    }
  }
};
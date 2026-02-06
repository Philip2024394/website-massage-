/**
 * IP Geolocation Service
 * Detects user's country automatically using multiple fallback methods
 * Falls back to the nearest supported country by geographic distance
 */

interface GeolocationResult {
  countryCode: string;
  countryName: string;
  city?: string;
  detected: boolean;
  method: 'saved' | 'ip' | 'manual' | 'default' | 'nearest';
  detectedCountry?: string; // Original detected country if fallback was used
  latitude?: number;
  longitude?: number;
}

const SUPPORTED_COUNTRIES = ['ID', 'MY', 'SG', 'TH', 'PH', 'VN', 'GB', 'US', 'AU', 'DE'];
const DEFAULT_COUNTRY = 'ID';

// Country coordinates (approximate centers) for distance calculation
const COUNTRY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  // Supported countries
  'ID': { lat: -2.5, lng: 118.0 },      // Indonesia (center)
  'MY': { lat: 4.2, lng: 101.9 },       // Malaysia (Kuala Lumpur)
  'SG': { lat: 1.35, lng: 103.8 },      // Singapore
  'TH': { lat: 15.87, lng: 100.99 },    // Thailand (Bangkok)
  'PH': { lat: 12.88, lng: 121.77 },    // Philippines (Manila)
  'VN': { lat: 14.06, lng: 108.28 },    // Vietnam (center)
  'GB': { lat: 51.51, lng: -0.13 },     // United Kingdom (London)
  'US': { lat: 37.09, lng: -95.71 },    // United States (center)
  'AU': { lat: -25.27, lng: 133.78 },   // Australia (center)
  'DE': { lat: 51.17, lng: 10.45 },     // Germany (center)
  
  // Additional countries for distance calculation
  'AF': { lat: 33.94, lng: 67.71 },
  'AL': { lat: 41.15, lng: 20.17 },
  'DZ': { lat: 28.03, lng: 1.66 },
  'AR': { lat: -38.42, lng: -63.62 },
  'AT': { lat: 47.52, lng: 14.55 },
  'BD': { lat: 23.68, lng: 90.36 },
  'BE': { lat: 50.50, lng: 4.47 },
  'BN': { lat: 4.54, lng: 114.73 },
  'BR': { lat: -14.24, lng: -51.93 },
  'CA': { lat: 56.13, lng: -106.35 },
  'CH': { lat: 46.82, lng: 8.23 },
  'CL': { lat: -35.68, lng: -71.54 },
  'CN': { lat: 35.86, lng: 104.20 },
  'CZ': { lat: 49.82, lng: 15.47 },
  'ES': { lat: 40.46, lng: -3.75 },
  'FJ': { lat: -17.71, lng: 178.07 },
  'FR': { lat: 46.23, lng: 2.21 },
  'HK': { lat: 22.40, lng: 114.11 },
  'IN': { lat: 20.59, lng: 78.96 },
  'IT': { lat: 41.87, lng: 12.57 },
  'JP': { lat: 36.20, lng: 138.25 },
  'KH': { lat: 12.57, lng: 104.99 },
  'KR': { lat: 35.91, lng: 127.77 },
  'LA': { lat: 19.86, lng: 102.50 },
  'LK': { lat: 7.87, lng: 80.77 },
  'MO': { lat: 22.20, lng: 113.54 },
  'MM': { lat: 21.91, lng: 95.96 },
  'MX': { lat: 23.63, lng: -102.55 },
  'NL': { lat: 52.13, lng: 5.29 },
  'NP': { lat: 28.39, lng: 84.12 },
  'NZ': { lat: -40.90, lng: 174.89 },
  'PG': { lat: -6.31, lng: 143.96 },
  'PK': { lat: 30.38, lng: 69.35 },
  'PL': { lat: 51.92, lng: 19.15 },
  'RU': { lat: 61.52, lng: 105.32 },
  'TL': { lat: -8.87, lng: 125.73 },
  'TW': { lat: 23.70, lng: 120.96 },
};

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  
  const lat1Rad = (point1.lat * Math.PI) / 180;
  const lat2Rad = (point2.lat * Math.PI) / 180;
  const deltaLatRad = ((point2.lat - point1.lat) * Math.PI) / 180;
  const deltaLngRad = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a = 
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in kilometers
}

/**
 * Find the nearest supported country based on geographic coordinates
 */
function findNearestSupportedCountry(
  unsupportedCountryCode: string,
  latitude?: number,
  longitude?: number
): string {
  // If we have coordinates from IP, use them for precise calculation
  if (latitude !== undefined && longitude !== undefined) {
    const userLocation = { lat: latitude, lng: longitude };
    
    let nearestCountry = DEFAULT_COUNTRY;
    let minDistance = Infinity;
    
    for (const countryCode of SUPPORTED_COUNTRIES) {
      const countryCoords = COUNTRY_COORDINATES[countryCode];
      if (countryCoords) {
        const distance = calculateDistance(userLocation, countryCoords);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCountry = countryCode;
        }
      }
    }
    
    console.log(
      `📍 User at [${latitude.toFixed(2)}, ${longitude.toFixed(2)}] from ${unsupportedCountryCode} ` +
      `→ Nearest supported: ${nearestCountry} (${minDistance.toFixed(0)}km away)`
    );
    
    return nearestCountry;
  }
  
  // Fallback: Use country-to-country distance
  const unsupportedCoords = COUNTRY_COORDINATES[unsupportedCountryCode];
  if (!unsupportedCoords) {
    console.log(`📍 No coordinates for ${unsupportedCountryCode}, using default: ${DEFAULT_COUNTRY}`);
    return DEFAULT_COUNTRY;
  }
  
  let nearestCountry = DEFAULT_COUNTRY;
  let minDistance = Infinity;
  
  for (const countryCode of SUPPORTED_COUNTRIES) {
    const countryCoords = COUNTRY_COORDINATES[countryCode];
    if (countryCoords) {
      const distance = calculateDistance(unsupportedCoords, countryCoords);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCountry = countryCode;
      }
    }
  }
  
  console.log(
    `📍 Country ${unsupportedCountryCode} → Nearest supported: ${nearestCountry} ` +
    `(${minDistance.toFixed(0)}km away)`
  );
  
  return nearestCountry;
}

class IPGeolocationService {
  private cachedLocation: GeolocationResult | null = null;

  /**
   * Get user's location with priority:
   * 1. Saved preference (localStorage)
   * 2. IP detection
   * 3. Default (Indonesia)
   */
  async getUserLocation(): Promise<GeolocationResult> {
    // Priority 1: Check saved preference
    const saved = this.getSavedLocation();
    if (saved) {
      console.log('📍 Using saved location preference:', saved);
      return saved;
    }

    // Priority 2: IP detection
    const detected = await this.detectCountryFromIP();
    if (detected) {
      console.log('🌍 Detected country from IP:', detected);
      return detected;
    }

    // Priority 3: Default
    console.log('🏠 Using default country (Indonesia)');
    return {
      countryCode: DEFAULT_COUNTRY,
      countryName: 'Indonesia',
      detected: false,
      method: 'default'
    };
  }

  /**
   * Detect country from IP using multiple free services
   */
  private async detectCountryFromIP(): Promise<GeolocationResult | null> {
    // Try multiple services in sequence
    const services = [
      this.detectFromCloudflare.bind(this),
      this.detectFromIPAPI.bind(this),
      this.detectFromIPInfo.bind(this)
    ];

    for (const service of services) {
      try {
        const result = await service();
        if (result) {
          this.cachedLocation = result;
          return result;
        }
      } catch (error) {
        console.warn('IP detection service failed:', error);
        continue;
      }
    }

    return null;
  }

  /**
   * Try Cloudflare headers (best if available)
   */
  private async detectFromCloudflare(): Promise<GeolocationResult | null> {
    try {
      // Cloudflare adds country code to request headers
      // This needs server-side support or Cloudflare Workers
      const response = await fetch('/cdn-cgi/trace');
      const text = await response.text();
      const lines = text.split('\n');
      const locLine = lines.find(line => line.startsWith('loc='));
      
      if (locLine) {
        const countryCode = locLine.split('=')[1].trim();
        if (SUPPORTED_COUNTRIES.includes(countryCode)) {
          return {
            countryCode,
            countryName: this.getCountryName(countryCode),
            detected: true,
            method: 'ip'
          };
        }
      }
    } catch (error) {
      // Cloudflare not available
    }
    return null;
  }

  /**
   * Use ipapi.co (free tier: 1000 requests/day, no API key needed)
   */
  private async detectFromIPAPI(): Promise<GeolocationResult | null> {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('IPAPI request failed');

      const data = await response.json();
      const countryCode = data.country_code;
      const latitude = data.latitude;
      const longitude = data.longitude;

      // Check if detected country is directly supported
      if (countryCode && SUPPORTED_COUNTRIES.includes(countryCode)) {
        return {
          countryCode,
          countryName: data.country_name || this.getCountryName(countryCode),
          city: data.city,
          latitude,
          longitude,
          detected: true,
          method: 'ip'
        };
      }

      // Find nearest supported country using distance calculation
      if (countryCode) {
        const nearestCountry = findNearestSupportedCountry(countryCode, latitude, longitude);
        console.log(
          `🌍 IP detected: ${data.country_name} (${countryCode}) at [${latitude}, ${longitude}]\n` +
          `   → Redirecting to nearest: ${this.getCountryName(nearestCountry)} (${nearestCountry})`
        );
        
        return {
          countryCode: nearestCountry,
          countryName: this.getCountryName(nearestCountry),
          city: data.city,
          latitude,
          longitude,
          detected: true,
          method: 'nearest',
          detectedCountry: `${data.country_name} (${countryCode})`
        };
      }
    } catch (error) {
      console.warn('IPAPI detection failed:', error);
    }
    return null;
  }

  /**
   * Use ipinfo.io as fallback (free tier: 50k requests/month)
   */
  private async detectFromIPInfo(): Promise<GeolocationResult | null> {
    try {
      const response = await fetch('https://ipinfo.io/json');
      if (!response.ok) throw new Error('IPInfo request failed');

      const data = await response.json();
      const countryCode = data.country;
      
      // Parse location coordinates (format: "lat,lng")
      let latitude: number | undefined;
      let longitude: number | undefined;
      if (data.loc) {
        const [lat, lng] = data.loc.split(',').map(Number);
        latitude = lat;
        longitude = lng;
      }

      // Check if detected country is directly supported
      if (countryCode && SUPPORTED_COUNTRIES.includes(countryCode)) {
        return {
          countryCode,
          countryName: this.getCountryName(countryCode),
          city: data.city,
          latitude,
          longitude,
          detected: true,
          method: 'ip'
        };
      }

      // Find nearest supported country using distance calculation
      if (countryCode) {
        const nearestCountry = findNearestSupportedCountry(countryCode, latitude, longitude);
        console.log(
          `🌍 IP detected: ${countryCode} at [${latitude}, ${longitude}]\n` +
          `   → Redirecting to nearest: ${this.getCountryName(nearestCountry)} (${nearestCountry})`
        );
        
        return {
          countryCode: nearestCountry,
          countryName: this.getCountryName(nearestCountry),
          city: data.city,
          latitude,
          longitude,
          detected: true,
          method: 'nearest',
          detectedCountry: countryCode
        };
      }
    } catch (error) {
      console.warn('IPInfo detection failed:', error);
    }
    return null;
  }

  /**
   * Save user's location preference
   */
  saveLocation(countryCode: string, city?: string): void {
    try {
      const location: GeolocationResult = {
        countryCode,
        countryName: this.getCountryName(countryCode),
        city,
        detected: false,
        method: 'manual'
      };

      localStorage.setItem('user_location_preference', JSON.stringify(location));
      this.cachedLocation = location;
      console.log('💾 Saved location preference:', location);
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  }

  /**
   * Get saved location preference
   */
  private getSavedLocation(): GeolocationResult | null {
    try {
      const saved = localStorage.getItem('user_location_preference');
      if (saved) {
        const location = JSON.parse(saved) as GeolocationResult;
        location.method = 'saved';
        return location;
      }
    } catch (error) {
      console.error('Failed to retrieve saved location:', error);
    }
    return null;
  }

  /**
   * Clear saved location
   */
  clearSavedLocation(): void {
    try {
      localStorage.removeItem('user_location_preference');
      this.cachedLocation = null;
      console.log('🗑️ Cleared saved location');
    } catch (error) {
      console.error('Failed to clear location:', error);
    }
  }

  /**
   * Map country code to name
   */
  private getCountryName(code: string): string {
    const names: Record<string, string> = {
      ID: 'Indonesia',
      MY: 'Malaysia',
      SG: 'Singapore',
      TH: 'Thailand',
      PH: 'Philippines',
      VN: 'Vietnam',
      GB: 'United Kingdom',
      US: 'United States',
      AU: 'Australia',
      DE: 'Germany'
    };
    return names[code] || code;
  }

  /**
   * Get country flag emoji
   */
  getCountryFlag(code: string): string {
    const flags: Record<string, string> = {
      ID: '🇮🇩',
      MY: '🇲🇾',
      SG: '🇸🇬',
      TH: '🇹🇭',
      PH: '🇵🇭',
      VN: '🇻🇳',
      GB: '🇬🇧',
      US: '🇺🇸',
      AU: '🇦🇺',
      DE: '🇩🇪'
    };
    return flags[code] || '🌍';
  }

  /**
   * Check if a country is supported
   */
  isCountrySupported(code: string): boolean {
    return SUPPORTED_COUNTRIES.includes(code);
  }

  /**
   * Get all supported countries
   */
  getSupportedCountries(): Array<{ code: string; name: string; flag: string }> {
    return SUPPORTED_COUNTRIES.map(code => ({
      code,
      name: this.getCountryName(code),
      flag: this.getCountryFlag(code)
    }));
  }

  /**
   * Calculate and return the nearest supported country for a given location
   */
  getNearestCountry(latitude: number, longitude: number): {
    code: string;
    name: string;
    flag: string;
    distance: number;
  } {
    const userLocation = { lat: latitude, lng: longitude };
    
    let nearestCountry = DEFAULT_COUNTRY;
    let minDistance = Infinity;
    
    for (const countryCode of SUPPORTED_COUNTRIES) {
      const countryCoords = COUNTRY_COORDINATES[countryCode];
      if (countryCoords) {
        const distance = calculateDistance(userLocation, countryCoords);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCountry = countryCode;
        }
      }
    }
    
    return {
      code: nearestCountry,
      name: this.getCountryName(nearestCountry),
      flag: this.getCountryFlag(nearestCountry),
      distance: Math.round(minDistance)
    };
  }
}

// Export singleton instance
export const ipGeolocationService = new IPGeolocationService();

// Export types
export type { GeolocationResult };

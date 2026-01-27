/**
 * IP Geolocation Service
 * Detects user's country automatically using multiple fallback methods
 */

interface GeolocationResult {
  countryCode: string;
  countryName: string;
  city?: string;
  detected: boolean;
  method: 'saved' | 'ip' | 'manual' | 'default';
}

const SUPPORTED_COUNTRIES = ['ID', 'MY', 'SG', 'TH', 'PH', 'VN'];
const DEFAULT_COUNTRY = 'ID';

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

      if (countryCode && SUPPORTED_COUNTRIES.includes(countryCode)) {
        return {
          countryCode,
          countryName: data.country_name || this.getCountryName(countryCode),
          city: data.city,
          detected: true,
          method: 'ip'
        };
      }

      // If detected country not supported, default to Indonesia
      if (countryCode) {
        console.log(`📍 Detected ${countryCode} but not supported, using default`);
        return {
          countryCode: DEFAULT_COUNTRY,
          countryName: 'Indonesia',
          detected: false,
          method: 'default'
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

      if (countryCode && SUPPORTED_COUNTRIES.includes(countryCode)) {
        return {
          countryCode,
          countryName: this.getCountryName(countryCode),
          city: data.city,
          detected: true,
          method: 'ip'
        };
      }

      // If detected country not supported, default to Indonesia
      if (countryCode) {
        console.log(`📍 Detected ${countryCode} but not supported, using default`);
        return {
          countryCode: DEFAULT_COUNTRY,
          countryName: 'Indonesia',
          detected: false,
          method: 'default'
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
      VN: 'Vietnam'
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
      VN: '🇻🇳'
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
}

// Export singleton instance
export const ipGeolocationService = new IPGeolocationService();

// Export types
export type { GeolocationResult };

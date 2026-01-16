/**
 * Location Service - GPS + Dropdown Hybrid System
 * Smart location detection and selection for Indonesia
 * No Google Maps API required - uses browser geolocation + curated city list
 */

export interface LocationOption {
  id: string;
  name: string;
  region: string;
  province: string;
  coordinates: { lat: number; lng: number };
  isPopular: boolean;
  searchKeywords: string[];
}

export interface DetectedLocation {
  city: string;
  region: string;
  accuracy: number;
  confidence: 'high' | 'medium' | 'low';
}

class LocationService {
  private locations: LocationOption[] = [
    // DKI Jakarta
    { id: 'jakarta-pusat', name: 'Jakarta Pusat', region: 'Jakarta', province: 'DKI Jakarta', coordinates: { lat: -6.1805, lng: 106.8284 }, isPopular: true, searchKeywords: ['jakarta', 'pusat', 'central', 'monas'] },
    { id: 'jakarta-selatan', name: 'Jakarta Selatan', region: 'Jakarta', province: 'DKI Jakarta', coordinates: { lat: -6.2614, lng: 106.8106 }, isPopular: true, searchKeywords: ['jakarta', 'selatan', 'south', 'kemang', 'blok m'] },
    { id: 'jakarta-utara', name: 'Jakarta Utara', region: 'Jakarta', province: 'DKI Jakarta', coordinates: { lat: -6.1381, lng: 106.8628 }, isPopular: true, searchKeywords: ['jakarta', 'utara', 'north', 'ancol', 'kelapa gading'] },
    { id: 'jakarta-barat', name: 'Jakarta Barat', region: 'Jakarta', province: 'DKI Jakarta', coordinates: { lat: -6.1352, lng: 106.7449 }, isPopular: true, searchKeywords: ['jakarta', 'barat', 'west', 'grogol'] },
    { id: 'jakarta-timur', name: 'Jakarta Timur', region: 'Jakarta', province: 'DKI Jakarta', coordinates: { lat: -6.2744, lng: 106.9020 }, isPopular: true, searchKeywords: ['jakarta', 'timur', 'east', 'cakung'] },

    // Bali
    { id: 'denpasar', name: 'Denpasar', region: 'Bali', province: 'Bali', coordinates: { lat: -8.6500, lng: 115.2167 }, isPopular: true, searchKeywords: ['denpasar', 'bali', 'airport', 'ngurah rai'] },
    { id: 'ubud', name: 'Ubud', region: 'Gianyar', province: 'Bali', coordinates: { lat: -8.5069, lng: 115.2624 }, isPopular: true, searchKeywords: ['ubud', 'bali', 'rice terrace', 'monkey forest'] },
    { id: 'seminyak', name: 'Seminyak', region: 'Badung', province: 'Bali', coordinates: { lat: -8.6919, lng: 115.1721 }, isPopular: true, searchKeywords: ['seminyak', 'bali', 'beach', 'kuta'] },
    { id: 'canggu', name: 'Canggu', region: 'Badung', province: 'Bali', coordinates: { lat: -8.6476, lng: 115.1384 }, isPopular: true, searchKeywords: ['canggu', 'bali', 'surf', 'beach'] },
    { id: 'sanur', name: 'Sanur', region: 'Denpasar', province: 'Bali', coordinates: { lat: -8.6882, lng: 115.2623 }, isPopular: true, searchKeywords: ['sanur', 'bali', 'beach', 'sunrise'] },
    { id: 'jimbaran', name: 'Jimbaran', region: 'Badung', province: 'Bali', coordinates: { lat: -8.7973, lng: 115.1647 }, isPopular: true, searchKeywords: ['jimbaran', 'bali', 'seafood', 'beach'] },

    // Jawa Barat
    { id: 'bandung', name: 'Bandung', region: 'Bandung Raya', province: 'Jawa Barat', coordinates: { lat: -6.9175, lng: 107.6191 }, isPopular: true, searchKeywords: ['bandung', 'paris van java', 'factory outlet'] },
    { id: 'bogor', name: 'Bogor', region: 'Bogor Raya', province: 'Jawa Barat', coordinates: { lat: -6.5950, lng: 106.7987 }, isPopular: true, searchKeywords: ['bogor', 'botanical garden', 'puncak'] },
    { id: 'bekasi', name: 'Bekasi', region: 'Bekasi', province: 'Jawa Barat', coordinates: { lat: -6.2349, lng: 106.9896 }, isPopular: true, searchKeywords: ['bekasi', 'summarecon', 'grand mall'] },
    { id: 'depok', name: 'Depok', region: 'Depok', province: 'Jawa Barat', coordinates: { lat: -6.4025, lng: 106.7942 }, isPopular: true, searchKeywords: ['depok', 'ui', 'universitas indonesia'] },

    // Jawa Timur
    { id: 'surabaya', name: 'Surabaya', region: 'Surabaya Raya', province: 'Jawa Timur', coordinates: { lat: -7.2492, lng: 112.7508 }, isPopular: true, searchKeywords: ['surabaya', 'east java', 'heroes day'] },
    { id: 'malang', name: 'Malang', region: 'Malang', province: 'Jawa Timur', coordinates: { lat: -7.9797, lng: 112.6304 }, isPopular: true, searchKeywords: ['malang', 'apple city', 'batu'] },
    { id: 'sidoarjo', name: 'Sidoarjo', region: 'Sidoarjo', province: 'Jawa Timur', coordinates: { lat: -7.4478, lng: 112.7183 }, isPopular: false, searchKeywords: ['sidoarjo', 'delta mas'] },

    // DIY Yogyakarta
    { id: 'yogyakarta', name: 'Yogyakarta', region: 'Yogyakarta', province: 'DIY Yogyakarta', coordinates: { lat: -7.7956, lng: 110.3695 }, isPopular: true, searchKeywords: ['yogyakarta', 'jogja', 'gudeg', 'malioboro'] },

    // Jawa Tengah
    { id: 'semarang', name: 'Semarang', region: 'Semarang', province: 'Jawa Tengah', coordinates: { lat: -6.9667, lng: 110.4167 }, isPopular: true, searchKeywords: ['semarang', 'central java', 'simpang lima'] },
    { id: 'solo', name: 'Solo (Surakarta)', region: 'Solo', province: 'Jawa Tengah', coordinates: { lat: -7.5560, lng: 110.8316 }, isPopular: true, searchKeywords: ['solo', 'surakarta', 'batik', 'keraton'] },

    // Sumatera Utara
    { id: 'medan', name: 'Medan', region: 'Medan', province: 'Sumatera Utara', coordinates: { lat: 3.5952, lng: 98.6722 }, isPopular: true, searchKeywords: ['medan', 'north sumatra', 'maimun palace'] },

    // Sumatera Selatan
    { id: 'palembang', name: 'Palembang', region: 'Palembang', province: 'Sumatera Selatan', coordinates: { lat: -2.9167, lng: 104.7458 }, isPopular: true, searchKeywords: ['palembang', 'south sumatra', 'ampera bridge'] },

    // Kalimantan Selatan
    { id: 'banjarmasin', name: 'Banjarmasin', region: 'Banjarmasin', province: 'Kalimantan Selatan', coordinates: { lat: -3.3194, lng: 114.5906 }, isPopular: false, searchKeywords: ['banjarmasin', 'south kalimantan', 'floating market'] },

    // Sulawesi Selatan
    { id: 'makassar', name: 'Makassar', region: 'Makassar', province: 'Sulawesi Selatan', coordinates: { lat: -5.1477, lng: 119.4327 }, isPopular: true, searchKeywords: ['makassar', 'ujung pandang', 'south sulawesi'] },

    // Lombok
    { id: 'mataram', name: 'Mataram', region: 'Lombok', province: 'NTB', coordinates: { lat: -8.5833, lng: 116.1167 }, isPopular: true, searchKeywords: ['mataram', 'lombok', 'gili islands'] },

    // Batam
    { id: 'batam', name: 'Batam', region: 'Kepulauan Riau', province: 'Kepulauan Riau', coordinates: { lat: 1.0456, lng: 103.9018 }, isPopular: true, searchKeywords: ['batam', 'riau islands', 'singapore'] }
  ];

  /**
   * Get all available locations
   */
  getAllLocations(): LocationOption[] {
    return this.locations;
  }

  /**
   * Get popular locations for quick selection
   */
  getPopularLocations(): LocationOption[] {
    return this.locations.filter(location => location.isPopular);
  }

  /**
   * Search locations by query
   */
  searchLocations(query: string): LocationOption[] {
    if (!query.trim()) return this.getPopularLocations();
    
    const searchTerm = query.toLowerCase().trim();
    
    return this.locations.filter(location => 
      location.name.toLowerCase().includes(searchTerm) ||
      location.region.toLowerCase().includes(searchTerm) ||
      location.province.toLowerCase().includes(searchTerm) ||
      location.searchKeywords.some(keyword => keyword.includes(searchTerm))
    ).sort((a, b) => {
      // Prioritize exact matches and popular locations
      const aExact = a.name.toLowerCase().startsWith(searchTerm) ? 1 : 0;
      const bExact = b.name.toLowerCase().startsWith(searchTerm) ? 1 : 0;
      const aPopular = a.isPopular ? 1 : 0;
      const bPopular = b.isPopular ? 1 : 0;
      
      return (bExact + bPopular) - (aExact + aPopular);
    });
  }

  /**
   * Get locations by province
   */
  getLocationsByProvince(province: string): LocationOption[] {
    return this.locations.filter(location => location.province === province);
  }

  /**
   * Auto-detect user location using GPS
   */
  async detectCurrentLocation(): Promise<DetectedLocation | null> {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        console.warn('🌍 Geolocation not supported');
        resolve(null);
        return;
      }

      const timeoutId = setTimeout(() => {
        console.warn('🌍 Geolocation timeout');
        resolve(null);
      }, 10000); // 10 second timeout

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const { latitude, longitude, accuracy } = position.coords;
          
          console.log('🌍 GPS detected:', { latitude, longitude, accuracy });
          
          // Find nearest city
          const nearestCity = this.findNearestCity(latitude, longitude);
          
          if (nearestCity) {
            const distance = this.calculateDistance(
              latitude, 
              longitude, 
              nearestCity.coordinates.lat, 
              nearestCity.coordinates.lng
            );
            
            // Determine confidence based on accuracy and distance
            let confidence: 'high' | 'medium' | 'low' = 'low';
            if (accuracy < 100 && distance < 25) confidence = 'high';
            else if (accuracy < 1000 && distance < 50) confidence = 'medium';
            
            resolve({
              city: nearestCity.name,
              region: nearestCity.region,
              accuracy: Math.round(accuracy),
              confidence
            });
          } else {
            resolve(null);
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          console.warn('🌍 Geolocation error:', error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  }

  /**
   * Find nearest city to given coordinates
   */
  private findNearestCity(lat: number, lng: number): LocationOption | null {
    if (this.locations.length === 0) return null;

    let nearestCity = this.locations[0];
    let minDistance = this.calculateDistance(
      lat, lng, 
      nearestCity.coordinates.lat, 
      nearestCity.coordinates.lng
    );

    this.locations.forEach(location => {
      const distance = this.calculateDistance(
        lat, lng,
        location.coordinates.lat,
        location.coordinates.lng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = location;
      }
    });

    // Only return if within reasonable distance (200km)
    return minDistance < 200 ? nearestCity : null;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get location by ID
   */
  getLocationById(id: string): LocationOption | null {
    return this.locations.find(location => location.id === id) || null;
  }

  /**
   * Get location by name
   */
  getLocationByName(name: string): LocationOption | null {
    return this.locations.find(location => 
      location.name.toLowerCase() === name.toLowerCase()
    ) || null;
  }

  /**
   * Generate Google Maps directions URL
   */
  getDirectionsUrl(locationName: string, fromAddress?: string): string {
    const encodedLocation = encodeURIComponent(locationName);
    const baseUrl = 'https://www.google.com/maps/dir/';
    
    if (fromAddress) {
      const encodedFrom = encodeURIComponent(fromAddress);
      return `${baseUrl}${encodedFrom}/${encodedLocation}`;
    }
    
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  }

  /**
   * Get provinces list
   */
  getProvinces(): string[] {
    const provinces = new Set(this.locations.map(location => location.province));
    return Array.from(provinces).sort();
  }

  /**
   * Format location display name
   */
  formatLocationDisplay(location: LocationOption): string {
    if (location.region === location.province) {
      return location.name;
    }
    return `${location.name}, ${location.region}`;
  }

  /**
   * Check if location is in major city area
   */
  isMajorCity(locationId: string): boolean {
    const majorCityIds = [
      'jakarta-pusat', 'jakarta-selatan', 'jakarta-utara', 'jakarta-barat', 'jakarta-timur',
      'denpasar', 'ubud', 'seminyak', 'canggu',
      'bandung', 'surabaya', 'yogyakarta', 'medan'
    ];
    
    return majorCityIds.includes(locationId);
  }

  /**
   * Get service area coverage
   */
  getServiceAreaCoverage(): {
    totalCities: number;
    majorCities: number;
    provinces: number;
  } {
    return {
      totalCities: this.locations.length,
      majorCities: this.locations.filter(l => this.isMajorCity(l.id)).length,
      provinces: this.getProvinces().length
    };
  }
}

// Singleton instance
export const locationService = new LocationService();
export default locationService;
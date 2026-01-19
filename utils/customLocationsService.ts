import { therapistService } from '../lib/appwriteService';
import type { Therapist } from '../types';
import { ALL_INDONESIAN_CITIES } from '../data/indonesianCities';

export interface PopularCustomLocation {
  customCity: string;
  count: number;
  centerCoordinates: { lat: number; lng: number };
  locationId: string; // normalized ID for filtering
}

/**
 * Fetches popular custom locations (with 5+ therapists)
 * Aggregates therapists by customCity and calculates GPS center
 */
export async function getPopularCustomLocations(minTherapists: number = 5): Promise<PopularCustomLocation[]> {
  try {
    // Fetch all therapists with custom locations
    const allTherapists = await therapistService.getTherapists({ limit: 1000 });
    
    // Filter for custom locations only
    const customLocationTherapists = allTherapists.filter(
      (t: Therapist) => t.isCustomLocation && t.customCity && t.geopoint
    );
    
    if (customLocationTherapists.length === 0) {
      return [];
    }
    
    // Group by customCity (case-insensitive)
    const locationGroups = new Map<string, Therapist[]>();
    
    customLocationTherapists.forEach((therapist: Therapist) => {
      const cityKey = therapist.customCity!.toLowerCase().trim();
      if (!locationGroups.has(cityKey)) {
        locationGroups.set(cityKey, []);
      }
      locationGroups.get(cityKey)!.push(therapist);
    });
    
    // Calculate popular locations
    const popularLocations: PopularCustomLocation[] = [];
    
    locationGroups.forEach((therapists, cityKey) => {
      if (therapists.length >= minTherapists) {
        // Calculate GPS center (average of all therapist coordinates)
        let totalLat = 0;
        let totalLng = 0;
        let validCount = 0;
        
        therapists.forEach((t: Therapist) => {
          if (t.geopoint?.lat && t.geopoint?.lng) {
            totalLat += t.geopoint.lat;
            totalLng += t.geopoint.lng;
            validCount++;
          }
        });
        
        if (validCount > 0) {
          const centerLat = totalLat / validCount;
          const centerLng = totalLng / validCount;
          
          // Use first therapist's customCity for display (preserves capitalization)
          const displayName = therapists[0].customCity!;
          
          // Create normalized locationId
          const locationId = `custom-${cityKey.replace(/\s+/g, '-')}`;
          
          popularLocations.push({
            customCity: displayName,
            count: therapists.length,
            centerCoordinates: {
              lat: centerLat,
              lng: centerLng
            },
            locationId
          });
        }
      }
    });
    
    // Sort by count (descending)
    popularLocations.sort((a, b) => b.count - a.count);
    
    console.log(`📍 Found ${popularLocations.length} popular custom locations (min ${minTherapists} therapists)`);
    
    return popularLocations;
  } catch (error) {
    console.error('❌ Error fetching popular custom locations:', error);
    return [];
  }
}

/**
 * Normalizes custom city name for comparison
 */
export function normalizeCustomCityName(cityName: string): string {
  return cityName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Gets GPS center coordinates for a custom location
 */
export async function getCustomLocationCenter(customCity: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const allTherapists = await therapistService.getTherapists({ limit: 1000 });
    
    const matchingTherapists = allTherapists.filter(
      (t: Therapist) => 
        t.isCustomLocation && 
        t.customCity?.toLowerCase().trim() === customCity.toLowerCase().trim() &&
        t.geopoint
    );
    
    if (matchingTherapists.length === 0) {
      return null;
    }
    
    // Calculate average GPS coordinates
    let totalLat = 0;
    let totalLng = 0;
    let validCount = 0;
    
    matchingTherapists.forEach((t: Therapist) => {
      if (t.geopoint?.lat && t.geopoint?.lng) {
        totalLat += t.geopoint.lat;
        totalLng += t.geopoint.lng;
        validCount++;
      }
    });
    
    if (validCount === 0) {
      return null;
    }
    
    return {
      lat: totalLat / validCount,
      lng: totalLng / validCount
    };
  } catch (error) {
    console.error('❌ Error getting custom location center:', error);
    return null;
  }
}

/**
 * Gets coordinates for any location (predefined or custom)
 * This is the main function to use for GPS-based filtering
 */
export async function getLocationCoordinates(locationId: string): Promise<{ lat: number; lng: number } | null> {
  // Check if it's a predefined city
  const predefinedCity = ALL_INDONESIAN_CITIES.find(city => city.locationId === locationId);
  if (predefinedCity) {
    return predefinedCity.coordinates;
  }
  
  // Check if it's a custom location (starts with "custom-")
  if (locationId.startsWith('custom-')) {
    const customCityName = locationId.replace('custom-', '').replace(/-/g, ' ');
    return await getCustomLocationCenter(customCityName);
  }
  
  return null;
}

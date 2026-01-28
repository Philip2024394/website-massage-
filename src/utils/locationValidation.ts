/**
 * Location Validation and Matching Utility
 * Ensures GPS coordinates match selected city and validates location consistency
 */

import { matchProviderToCity } from '../constants/indonesianCities';

interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Validate that GPS coordinates are within or near the selected city
 * Returns validation result with message
 */
export function validateCoordinatesMatchCity(
    coordinates: Coordinates | null,
    selectedCity: string,
    maxDistanceKm: number = 50
): { isValid: boolean; message: string; detectedCity?: string } {
    
    // No coordinates provided - always valid (city dropdown is enough)
    if (!coordinates || coordinates.lat === 0 || coordinates.lng === 0) {
        return {
            isValid: true,
            message: 'No GPS coordinates set - using city name only'
        };
    }
    
    // No city selected
    if (!selectedCity || selectedCity === 'all') {
        return {
            isValid: false,
            message: 'Please select a city from dropdown before setting GPS location'
        };
    }
    
    // Try to detect city from coordinates
    const detectedCity = matchProviderToCity(coordinates, maxDistanceKm);
    
    if (!detectedCity) {
        return {
            isValid: false,
            message: `GPS coordinates are not within ${maxDistanceKm}km of any known city. Please check your location.`
        };
    }
    
    // Check if detected city matches selected city
    const selectedCityLower = selectedCity.toLowerCase();
    const detectedCityLower = detectedCity.name.toLowerCase();
    
    // Exact match
    if (detectedCityLower === selectedCityLower) {
        return {
            isValid: true,
            message: `✅ GPS location confirmed in ${detectedCity.name}`,
            detectedCity: detectedCity.name
        };
    }
    
    // Check aliases (e.g., "Yogya" matches "Yogyakarta")
    if (detectedCity.aliases) {
        const aliasMatch = detectedCity.aliases.some(alias => 
            alias.toLowerCase().includes(selectedCityLower) || 
            selectedCityLower.includes(alias.toLowerCase())
        );
        
        if (aliasMatch) {
            return {
                isValid: true,
                message: `✅ GPS location confirmed in ${detectedCity.name}`,
                detectedCity: detectedCity.name
            };
        }
    }
    
    // Coordinates don't match selected city
    return {
        isValid: false,
        message: `⚠️ GPS location is in ${detectedCity.name}, but you selected ${selectedCity}. Please ensure your GPS location is within your selected city area.`,
        detectedCity: detectedCity.name
    };
}

/**
 * Auto-detect city from GPS coordinates
 * Useful for setting city dropdown when user sets GPS first
 */
export function detectCityFromCoordinates(
    coordinates: Coordinates | null,
    maxDistanceKm: number = 50
): string | null {
    if (!coordinates || coordinates.lat === 0 || coordinates.lng === 0) {
        return null;
    }
    
    const detectedCity = matchProviderToCity(coordinates, maxDistanceKm);
    return detectedCity ? detectedCity.name : null;
}

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lng - coord1.lng);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Check if coordinates are within city boundaries (with tolerance)
 */
export function isWithinCityBounds(
    coordinates: Coordinates,
    cityName: string,
    toleranceKm: number = 25
): boolean {
    const detectedCity = matchProviderToCity(coordinates, toleranceKm);
    if (!detectedCity) return false;
    
    return detectedCity.name.toLowerCase() === cityName.toLowerCase() ||
           (detectedCity.aliases?.some(alias => 
               alias.toLowerCase() === cityName.toLowerCase()
           ) || false);
}

import type { Therapist, Place } from '../types';
import { AvailabilityStatus } from '../types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Parse coordinates string from therapist/place data
 */
const parseCoordinates = (coordinatesString: string): { lat: number; lng: number } | null => {
    try {
        const coords = JSON.parse(coordinatesString);
        if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
            return coords;
        }
    } catch (error) {
        console.warn('Failed to parse coordinates:', coordinatesString);
    }
    return null;
};

/**
 * Find nearby therapists within specified radius (default 15km)
 * Excludes the original therapist and only includes available ones
 */
export const findNearbyTherapists = async (
    originalTherapistId: string | number,
    customerLocation: { lat: number; lng: number },
    radiusKm: number = 15
): Promise<Therapist[]> => {
    try {
        // Import data service to get all therapists
        const { dataService } = await import('../services/dataService');
        
        console.log('🔍 Finding nearby therapists...', {
            originalId: originalTherapistId,
            customerLocation,
            radiusKm
        });
        
        // Get all therapists
        const allTherapists = await dataService.getTherapists();
        
        // Filter nearby available therapists
        const nearbyTherapists = allTherapists
            .filter((therapist: Therapist) => {
                // Exclude original therapist
                if (therapist.id.toString() === originalTherapistId.toString()) {
                    return false;
                }
                
                // Only available therapists
                if (therapist.status !== AvailabilityStatus.Available) {
                    return false;
                }
                
                // Parse therapist coordinates
                const therapistCoords = parseCoordinates(therapist.coordinates);
                if (!therapistCoords) {
                    console.warn(`Therapist ${therapist.id} has invalid coordinates`);
                    return false;
                }
                
                // Calculate distance
                const distance = calculateDistance(
                    customerLocation.lat,
                    customerLocation.lng,
                    therapistCoords.lat,
                    therapistCoords.lng
                );
                
                // Update therapist distance for sorting
                therapist.distance = distance;
                
                return distance <= radiusKm;
            })
            // Sort by distance (closest first)
            .sort((a: Therapist, b: Therapist) => a.distance - b.distance);
        
        console.log(`✅ Found ${nearbyTherapists.length} nearby therapists within ${radiusKm}km`);
        
        return nearbyTherapists;
        
    } catch (error) {
        console.error('❌ Error finding nearby therapists:', error);
        return [];
    }
};

/**
 * Find nearby massage places within specified radius (default 15km)
 * Excludes the original place and only includes available ones
 */
export const findNearbyPlaces = async (
    originalPlaceId: string | number,
    customerLocation: { lat: number; lng: number },
    radiusKm: number = 15
): Promise<Place[]> => {
    try {
        // Import data service to get all places
        const { dataService } = await import('../services/dataService');
        
        console.log('🔍 Finding nearby massage places...', {
            originalId: originalPlaceId,
            customerLocation,
            radiusKm
        });
        
        // Get all places
        const allPlaces = await dataService.getPlaces();
        
        // Filter nearby available places
        const nearbyPlaces = allPlaces
            .filter((place: Place) => {
                // Exclude original place
                if (place.id.toString() === originalPlaceId.toString()) {
                    return false;
                }
                
                // Only live places
                if (!place.isLive) {
                    return false;
                }
                
                // Parse place coordinates
                const placeCoords = parseCoordinates(place.coordinates);
                if (!placeCoords) {
                    console.warn(`Place ${place.id} has invalid coordinates`);
                    return false;
                }
                
                // Calculate distance
                const distance = calculateDistance(
                    customerLocation.lat,
                    customerLocation.lng,
                    placeCoords.lat,
                    placeCoords.lng
                );
                
                // Update place distance for sorting
                place.distance = distance;
                
                return distance <= radiusKm;
            })
            // Sort by distance (closest first)
            .sort((a: Place, b: Place) => a.distance - b.distance);
        
        console.log(`✅ Found ${nearbyPlaces.length} nearby places within ${radiusKm}km`);
        
        return nearbyPlaces;
        
    } catch (error) {
        console.error('❌ Error finding nearby places:', error);
        return [];
    }
};

/**
 * Get customer location from browser geolocation
 */
export const getCustomerLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                reject(new Error(`Location error: ${error.message}`));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes cache
            }
        );
    });
};
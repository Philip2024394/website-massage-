import type { Therapist, Place } from '../types';
import { AvailabilityStatus } from '../types';
import { enhancedDistanceService } from './googleMapsDistanceService';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 * @deprecated Use enhancedDistanceService.getDistanceWithTravelTime for Google Maps integration
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
 * Enhanced distance calculation using Google Maps API with Haversine fallback
 */
const calculateEnhancedDistance = async (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): Promise<{ distance: number; travelTime?: number }> => {
    try {
        const result = await enhancedDistanceService.getDistanceWithTravelTime(
            { lat: lat1, lng: lng1 },
            { lat: lat2, lng: lng2 }
        );
        return {
            distance: result.distance,
            travelTime: result.duration
        };
    } catch (error) {
        console.warn('Google Maps distance calculation failed, using Haversine fallback:', error);
        return {
            distance: calculateDistance(lat1, lng1, lat2, lng2)
        };
    }
};

/**
 * Parse coordinates from therapist/place data - handles string, object, or array formats
 */
const parseCoordinates = (coordinates: any): { lat: number; lng: number } | null => {
    try {
        let coords = coordinates;
        
        // If it's a string, parse it
        if (typeof coordinates === 'string') {
            coords = JSON.parse(coordinates);
        }
        
        // Handle object format: {lat: number, lng: number} (also legacy 'lon')
        if (coords && typeof coords === 'object') {
            if (typeof (coords as any).lat === 'number') {
                // Legacy fix: rename lon -> lng if present
                if (typeof (coords as any).lon === 'number' && (coords as any).lng === undefined) {
                    (coords as any).lng = (coords as any).lon;
                }
                if (typeof (coords as any).lng === 'number') {
                    return { lat: (coords as any).lat, lng: (coords as any).lng };
                }
            }
        }
        
        // Handle array format: [lat, lng]
        if (Array.isArray(coords) && coords.length === 2 && 
            typeof coords[0] === 'number' && typeof coords[1] === 'number') {
            return { lat: coords[0], lng: coords[1] };
        }
        
        console.warn('Coordinates format not recognized:', coords);
    } catch (error) {
        console.warn('Failed to parse coordinates:', coordinates, error);
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
        
        // Filter nearby available therapists using async processing
        const nearbyTherapists = [];
        
        for (const therapist of allTherapists) {
            // Exclude original therapist
            if (therapist.id.toString() === originalTherapistId.toString()) {
                continue;
            }
            
            // Only available therapists
            if (therapist.status !== AvailabilityStatus.Available) {
                continue;
            }
            
            // Parse therapist coordinates
            const therapistCoords = parseCoordinates(therapist.coordinates);
            if (!therapistCoords) {
                console.warn(`Therapist ${therapist.id} has invalid coordinates`);
                continue;
            }
            
            // Calculate distance using enhanced service (Google Maps + Haversine fallback)
            const distanceResult = await calculateEnhancedDistance(
                customerLocation.lat,
                customerLocation.lng,
                therapistCoords.lat,
                therapistCoords.lng
            );
            
            // Update therapist distance and travel time for sorting and display
            therapist.distance = distanceResult.distance;
            if (distanceResult.travelTime) {
                (therapist as any).travelTime = distanceResult.travelTime;
            }

            if (distanceResult.distance <= radiusKm) {
                nearbyTherapists.push(therapist);
            }
        }
        
        // Sort by distance (closest first)
        nearbyTherapists.sort((a: Therapist, b: Therapist) => a.distance - b.distance);
        
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
        const nearbyPlaces = [];
        
        for (const place of allPlaces) {
            // Exclude original place
            if (place.id.toString() === originalPlaceId.toString()) {
                continue;
            }
            
            // Only live places
            if (!place.isLive) {
                continue;
            }
            
            // Parse place coordinates
            const placeCoords = parseCoordinates(place.coordinates);
            if (!placeCoords) {
                console.warn(`Place ${place.id} has invalid coordinates`);
                continue;
            }
            
            // Calculate distance using enhanced service (Google Maps + Haversine fallback)
            const distanceResult = await calculateEnhancedDistance(
                customerLocation.lat,
                customerLocation.lng,
                placeCoords.lat,
                placeCoords.lng
            );
            
            // Update place distance and travel time for sorting and display
            place.distance = distanceResult.distance;
            if (distanceResult.travelTime) {
                (place as any).travelTime = distanceResult.travelTime;
            }
            
            if (distanceResult.distance <= radiusKm) {
                nearbyPlaces.push(place);
            }
        }
        
        // Sort by distance (closest first)
        nearbyPlaces.sort((a: Place, b: Place) => a.distance - b.distance);
        
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
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
        const nearbyTherapists: any[] = [];
        
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
 * Find ALL therapists within specified radius (for directory/homepage display)
 * Does NOT filter by availability status - shows all therapists regardless if busy/available
 * Use this for homepage/directory where you want to show all providers
 * Uses pure Haversine distance for speed (no Google Maps API calls)
 */
export const findAllNearbyTherapists = async (
    customerLocation: { lat: number; lng: number },
    radiusKm: number = 25
): Promise<Therapist[]> => {
    try {
        // Import data service to get all therapists
        const { dataService } = await import('../services/dataService');
        
        console.log('🔍 Finding ALL nearby therapists (ignoring status)...', {
            customerLocation,
            radiusKm
        });
        
        // Get all therapists
        const allTherapists = await dataService.getTherapists();
        console.log(`📋 Retrieved ${allTherapists.length} therapists from database`);
        
        // Filter nearby therapists using sync Haversine calculation (NO STATUS FILTER)
        const nearbyTherapists: any[] = [];
        let parsedCount = 0;
        let withinRadiusCount = 0;
        
        for (const therapist of allTherapists) {
            // Parse therapist coordinates
            const therapistCoords = parseCoordinates(therapist.coordinates);
            if (!therapistCoords) {
                console.warn(`⚠️ Therapist ${therapist.name} (${therapist.id}) has invalid coordinates:`, therapist.coordinates);
                continue;
            }
            
            parsedCount++;
            
            // Calculate distance using pure Haversine (fast, synchronous, no API calls)
            const distance = calculateDistance(
                customerLocation.lat,
                customerLocation.lng,
                therapistCoords.lat,
                therapistCoords.lng
            );
            
            // Update therapist distance for sorting and display
            therapist.distance = distance;
            
            if (distance <= radiusKm) {
                nearbyTherapists.push(therapist);
                withinRadiusCount++;
                console.log(`✅ ${therapist.name}: ${distance.toFixed(2)}km (status: ${therapist.status})`);
            } else {
                console.log(`❌ ${therapist.name}: ${distance.toFixed(2)}km - beyond ${radiusKm}km`);
            }
        }
        
        console.log(`📊 Coordinate parsing: ${parsedCount}/${allTherapists.length} therapists had valid coordinates`);
        console.log(`📍 Distance filtering: ${withinRadiusCount}/${parsedCount} within ${radiusKm}km radius`);
        
        // Sort by status priority (available → busy → offline), then by distance within each status group
        const statusPriority = {
            'available': 1,
            'busy': 2,
            'offline': 3
        };
        
        nearbyTherapists.sort((a: Therapist, b: Therapist) => {
            const statusA = (a.status || 'offline').toLowerCase();
            const statusB = (b.status || 'offline').toLowerCase();
            const priorityA = statusPriority[statusA] || 4;
            const priorityB = statusPriority[statusB] || 4;
            
            // Primary sort: by status priority
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            
            // Secondary sort: by distance (closest first)
            return a.distance - b.distance;
        });
        
        console.log(`✅ Found ${nearbyTherapists.length} nearby therapists (all statuses) within ${radiusKm}km`);
        
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
 * Find ALL places within specified radius (for directory/homepage display)
 * Does NOT filter by isLive status - shows all places
 * Use this for homepage/directory where you want to show all providers
 * Uses pure Haversine distance for speed (no Google Maps API calls)
 */
export const findAllNearbyPlaces = async (
    customerLocation: { lat: number; lng: number },
    radiusKm: number = 25
): Promise<Place[]> => {
    try {
        // Import data service to get all places
        const { dataService } = await import('../services/dataService');
        
        console.log('🔍 Finding ALL nearby places (ignoring isLive)...', {
            customerLocation,
            radiusKm
        });
        
        // Get all places
        const allPlaces = await dataService.getPlaces();
        console.log(`📋 Retrieved ${allPlaces.length} places from database`);
        
        // Filter nearby places using sync Haversine calculation (NO isLive FILTER)
        const nearbyPlaces: any[] = [];
        let parsedCount = 0;
        let withinRadiusCount = 0;
        
        for (const place of allPlaces) {
            // Parse place coordinates
            const placeCoords = parseCoordinates(place.coordinates);
            if (!placeCoords) {
                console.warn(`⚠️ Place ${place.name} (${place.id}) has invalid coordinates:`, place.coordinates);
                continue;
            }
            
            parsedCount++;
            
            // Calculate distance using pure Haversine (fast, synchronous, no API calls)
            const distance = calculateDistance(
                customerLocation.lat,
                customerLocation.lng,
                placeCoords.lat,
                placeCoords.lng
            );
            
            // Update place distance for sorting and display
            place.distance = distance;
            
            if (distance <= radiusKm) {
                nearbyPlaces.push(place);
                withinRadiusCount++;
                console.log(`✅ ${place.name}: ${distance.toFixed(2)}km (isLive: ${place.isLive})`);
            } else {
                console.log(`❌ ${place.name}: ${distance.toFixed(2)}km - beyond ${radiusKm}km`);
            }
        }
        
        console.log(`📊 Coordinate parsing: ${parsedCount}/${allPlaces.length} places had valid coordinates`);
        console.log(`📍 Distance filtering: ${withinRadiusCount}/${parsedCount} within ${radiusKm}km radius`);
        
        // Sort by isLive status (live first), then by distance within each group
        nearbyPlaces.sort((a: Place, b: Place) => {
            // Primary sort: live places first
            if (a.isLive !== b.isLive) {
                return a.isLive ? -1 : 1;
            }
            
            // Secondary sort: by distance (closest first)
            return a.distance - b.distance;
        });
        
        console.log(`✅ Found ${nearbyPlaces.length} nearby places (all statuses) within ${radiusKm}km`);
        
        return nearbyPlaces;
        
    } catch (error) {
        console.error('❌ Error finding nearby places:', error);
        return [];
    }
};

/**
 * Get customer location - GPS ONLY (NO IP-BASED DETECTION)
 * 
 * ⚠️ IP-based location intentionally disabled due to inaccuracy in Indonesia.
 * ISPs often route traffic through Jakarta, causing incorrect city detection.
 * 
 * GPS is the ONLY acceptable location source:
 * - High-accuracy GPS (fresh, not cached)
 * - Accuracy validation (rejects inaccurate results)
 * - NO IP geolocation fallback
 * - NO browser locale/timezone detection
 * - NO automatic city assignment
 */
export const getCustomerLocation = async (): Promise<{ lat: number; lng: number }> => {
    console.log('📍 Starting GPS location detection (NO IP fallback)...');
    
    // GPS ONLY - Try GPS with strict accuracy requirements
    if (navigator.geolocation) {
        try {
            const gpsLocation = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const accuracy = position.coords.accuracy;
                        console.log(`✅ GPS location obtained with accuracy: ${accuracy}m`);
                        
                        // Reject if accuracy is worse than 500 meters (inaccurate)
                        if (accuracy > 500) {
                            console.warn(`⚠️ GPS accuracy too low: ${accuracy}m - REJECTING (no fallback)`);
                            reject(new Error(`GPS accuracy insufficient: ${accuracy}m`));
                            return;
                        }
                        
                        resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    },
                    (error) => {
                        console.warn('⚠️ GPS failed:', error.message);
                        reject(error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 15000, // 15 seconds for accurate GPS lock
                        maximumAge: 0 // CRITICAL: NO CACHE - Always get fresh location
                    }
                );
            });
            
            console.log('🎯 Using accurate GPS location:', gpsLocation);
            return gpsLocation;
            
        } catch (gpsError) {
            console.warn('⚠️ GPS failed - NO IP FALLBACK (intentionally disabled)');
            throw gpsError;
        }
    }
    
    // NO IP-BASED GEOLOCATION FALLBACK
    // IP-based location intentionally disabled due to inaccuracy in Indonesia.
    // Users MUST enable GPS or manually select their city.
    console.error('❌ GPS not available - location detection failed');
    throw new Error('GPS location required. Please enable location permissions.');
};



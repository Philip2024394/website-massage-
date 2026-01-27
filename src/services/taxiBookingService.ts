/**
 * Taxi Booking Service
 * Handles bike taxi and car taxi booking logic with Appwrite integration
 */

import { Client, Databases, ID } from 'appwrite';
import { APP_CONFIG } from '../config';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(APP_CONFIG.APPWRITE.ENDPOINT)
    .setProject(APP_CONFIG.APPWRITE.PROJECT_ID);

const databases = new Databases(client);

// Collection ID for ride requests
const RIDE_REQUESTS_COLLECTION_ID = 'riderequests';

interface TaxiBookingParams {
    userLocation: { lat: number; lng: number };
    placeLocation: { lat: number; lng: number };
    taxiType: 'bike' | 'car';
    placeName: string;
    userId?: string;
}

interface TaxiBookingResponse {
    success: boolean;
    deepLink?: string;
    error?: string;
    estimatedPrice?: number;
    estimatedDuration?: number;
    requestId?: string;
}

/**
 * Get user's current location using Geolocation API
 */
export const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
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
                maximumAge: 0
            }
        );
    });
};

/**
 * Calculate distance between two coordinates (Haversine formula)
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
 * Estimate taxi price based on distance and type
 */
const estimateTaxiPrice = (distanceKm: number, taxiType: 'bike' | 'car'): number => {
    // Base fare + per km rate
    const baseFare = taxiType === 'bike' ? 5000 : 10000; // IDR
    const perKmRate = taxiType === 'bike' ? 3000 : 5000; // IDR
    
    return Math.round(baseFare + (distanceKm * perKmRate));
};

/**
 * Create a taxi booking link via Appwrite Function
 * This will be replaced with actual Appwrite function call
 */
export const createTaxiBookingLink = async (
    params: TaxiBookingParams
): Promise<TaxiBookingResponse> => {
    try {
        // Calculate distance
        const distance = calculateDistance(
            params.userLocation.lat,
            params.userLocation.lng,
            params.placeLocation.lat,
            params.placeLocation.lng
        );

        // Estimate price
        const estimatedPrice = estimateTaxiPrice(distance, params.taxiType);
        const estimatedDuration = Math.ceil(distance / 30 * 60); // Assuming 30 km/h average

        // Generate unique request ID
        const requestId = `RR${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        
        // Deep link format for popular Indonesian taxi apps
        let deepLink = '';
        
        if (params.taxiType === 'bike') {
            // Gojek Bike deep link
            deepLink = `gojek://booking?` +
                `type=bike&` +
                `pickup_lat=${params.userLocation.lat}&` +
                `pickup_lng=${params.userLocation.lng}&` +
                `dropoff_lat=${params.placeLocation.lat}&` +
                `dropoff_lng=${params.placeLocation.lng}&` +
                `destination=${encodeURIComponent(params.placeName)}`;
        } else {
            // Grab Car deep link
            deepLink = `grab://open?` +
                `screen=booking&` +
                `pickup_lat=${params.userLocation.lat}&` +
                `pickup_lng=${params.userLocation.lng}&` +
                `dropoff_lat=${params.placeLocation.lat}&` +
                `dropoff_lng=${params.placeLocation.lng}&` +
                `dropoff_name=${encodeURIComponent(params.placeName)}`;
        }

        // Save ride request to Appwrite
        try {
            const rideRequest = await databases.createDocument(
                APP_CONFIG.APPWRITE.DATABASE_ID,
                RIDE_REQUESTS_COLLECTION_ID,
                ID.unique(),
                {
                    requestId: requestId,
                    pickupLocation: `${params.userLocation.lat},${params.userLocation.lng}`,
                    dropoffLocation: `${params.placeLocation.lat},${params.placeLocation.lng}`,
                    requestedTime: new Date().toISOString(),
                    rideType: params.taxiType === 'bike' ? 'gojek-bike' : 'grab-car',
                    estimatedCost: estimatedPrice,
                    pickupLat: params.userLocation.lat,
                    pickupLon: params.userLocation.lng,
                    destLat: params.placeLocation.lat,
                    destLon: params.placeLocation.lng,
                    vehicleType: params.taxiType, // 'bike' or 'car'
                    userID: params.userId || 'guest',
                    status: 'pending',
                    createdAt: new Date().toISOString()
                }
            );

            console.log('Ride request saved to Appwrite:', rideRequest.$id);

            return {
                success: true,
                deepLink,
                estimatedPrice,
                estimatedDuration,
                requestId: rideRequest.$id
            };

        } catch (dbError) {
            console.error('Error saving to Appwrite, continuing with deep link:', dbError);
            
            // Continue with deep link even if database save fails
            return {
                success: true,
                deepLink,
                estimatedPrice,
                estimatedDuration,
                requestId
            };
        }

    } catch (error) {
        console.error('Error creating taxi booking link:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

/**
 * Open taxi app or fallback to web
 */
export const openTaxiApp = (deepLink: string, taxiType: 'bike' | 'car') => {
    // Try to open the deep link
    window.location.href = deepLink;

    // Fallback to web version after a delay if app is not installed
    setTimeout(() => {
        const webFallback = taxiType === 'bike' 
            ? 'https://www.gojek.com' 
            : 'https://www.grab.com';
        
        // Check if still on the same page (app didn't open)
        if (document.hasFocus()) {
            const shouldFallback = confirm(
                `${taxiType === 'bike' ? 'Gojek' : 'Grab'} app not installed. Open web version?`
            );
            if (shouldFallback) {
                window.open(webFallback, '_blank');
            }
        }
    }, 2000);
};

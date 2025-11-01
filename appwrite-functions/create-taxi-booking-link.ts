/**
 * Appwrite Function: Create Taxi Booking Link
 * 
 * This function should be deployed to Appwrite to handle taxi booking requests.
 * It will validate data, call taxi pricing APIs, and generate secure booking links.
 * 
 * Environment Variables Required:
 * - GOJEK_API_KEY: API key for Gojek pricing API
 * - GRAB_API_KEY: API key for Grab pricing API
 * - APPWRITE_DATABASE_ID: Database ID for storing bookings
 * - APPWRITE_COLLECTION_ID: Collection ID for taxi bookings
 */

import { Client, Databases } from 'node-appwrite';

interface TaxiBookingRequest {
    userLocation: { lat: number; lng: number };
    placeLocation: { lat: number; lng: number };
    taxiType: 'bike' | 'car';
    placeName: string;
    userId?: string;
}

// Appwrite Function Entry Point
export default async ({ req, res, log, error }: any) => {
    try {
        // Parse request body
        const body: TaxiBookingRequest = JSON.parse(req.body || '{}');
        
        // Validate required fields
        if (!body.userLocation || !body.placeLocation || !body.taxiType || !body.placeName) {
            return res.json({
                success: false,
                error: 'Missing required fields'
            }, 400);
        }

        // Validate coordinates
        const validateCoords = (coords: any) => {
            return coords && 
                   typeof coords.lat === 'number' && 
                   typeof coords.lng === 'number' &&
                   coords.lat >= -90 && coords.lat <= 90 &&
                   coords.lng >= -180 && coords.lng <= 180;
        };

        if (!validateCoords(body.userLocation) || !validateCoords(body.placeLocation)) {
            return res.json({
                success: false,
                error: 'Invalid coordinates'
            }, 400);
        }

        log('Processing taxi booking request:', body.taxiType);

        // Calculate distance (Haversine formula)
        const distance = calculateDistance(
            body.userLocation.lat,
            body.userLocation.lng,
            body.placeLocation.lat,
            body.placeLocation.lng
        );

        log('Calculated distance:', distance, 'km');

        // Get real-time pricing from taxi API
        let pricing;
        let deepLink;

        if (body.taxiType === 'bike') {
            // Call Gojek API for pricing
            pricing = await getGojekPricing(body.userLocation, body.placeLocation);
            deepLink = generateGojekDeepLink(body);
        } else {
            // Call Grab API for pricing
            pricing = await getGrabPricing(body.userLocation, body.placeLocation);
            deepLink = generateGrabDeepLink(body);
        }

        // Store booking request in Appwrite Database
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT || '')
            .setProject(process.env.APPWRITE_PROJECT_ID || '')
            .setKey(process.env.APPWRITE_API_KEY || '');

        const databases = new Databases(client);

        const bookingDocument = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID || '',
            process.env.APPWRITE_COLLECTION_ID || '',
            'unique()',
            {
                userId: body.userId || 'guest',
                taxiType: body.taxiType,
                placeName: body.placeName,
                userLocation: JSON.stringify(body.userLocation),
                placeLocation: JSON.stringify(body.placeLocation),
                estimatedPrice: pricing.price,
                estimatedDuration: pricing.duration,
                distance: distance,
                deepLink: deepLink,
                status: 'pending',
                createdAt: new Date().toISOString()
            }
        );

        log('Booking created:', bookingDocument.$id);

        // Return success response
        return res.json({
            success: true,
            deepLink: deepLink,
            estimatedPrice: pricing.price,
            estimatedDuration: pricing.duration,
            distance: distance,
            bookingId: bookingDocument.$id
        });

    } catch (err: any) {
        error('Function error:', err.message);
        return res.json({
            success: false,
            error: err.message || 'Internal server error'
        }, 500);
    }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Get pricing from Gojek API
 * TODO: Replace with actual Gojek API call
 */
async function getGojekPricing(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number }
): Promise<{ price: number; duration: number }> {
    // TODO: Implement actual Gojek API call
    // const response = await fetch('https://api.gojek.com/pricing', {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${process.env.GOJEK_API_KEY}`,
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ pickup, dropoff, service: 'bike' })
    // });
    // return await response.json();

    // Fallback estimation
    const distance = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    return {
        price: Math.round(5000 + distance * 3000),
        duration: Math.ceil(distance / 30 * 60)
    };
}

/**
 * Get pricing from Grab API
 * TODO: Replace with actual Grab API call
 */
async function getGrabPricing(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number }
): Promise<{ price: number; duration: number }> {
    // TODO: Implement actual Grab API call
    // const response = await fetch('https://api.grab.com/pricing', {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${process.env.GRAB_API_KEY}`,
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ pickup, dropoff, service: 'car' })
    // });
    // return await response.json();

    // Fallback estimation
    const distance = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    return {
        price: Math.round(10000 + distance * 5000),
        duration: Math.ceil(distance / 30 * 60)
    };
}

/**
 * Generate Gojek deep link
 */
function generateGojekDeepLink(data: TaxiBookingRequest): string {
    return `gojek://booking?` +
        `type=bike&` +
        `pickup_lat=${data.userLocation.lat}&` +
        `pickup_lng=${data.userLocation.lng}&` +
        `dropoff_lat=${data.placeLocation.lat}&` +
        `dropoff_lng=${data.placeLocation.lng}&` +
        `destination=${encodeURIComponent(data.placeName)}`;
}

/**
 * Generate Grab deep link
 */
function generateGrabDeepLink(data: TaxiBookingRequest): string {
    return `grab://open?` +
        `screen=booking&` +
        `pickup_lat=${data.userLocation.lat}&` +
        `pickup_lng=${data.userLocation.lng}&` +
        `dropoff_lat=${data.placeLocation.lat}&` +
        `dropoff_lng=${data.placeLocation.lng}&` +
        `dropoff_name=${encodeURIComponent(data.placeName)}`;
}

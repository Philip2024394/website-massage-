/**
 * useHomePageLocation - Location detection and city filtering logic
 * Extracted from HomePage.tsx to reduce file size
 */

import { useState, useEffect } from 'react';
import type { UserLocation, Therapist, Place } from '../types';
import { getCustomerLocation, findAllNearbyTherapists, findAllNearbyPlaces } from '../lib/nearbyProvidersService';
import { findCityByCoordinates, matchProviderToCity } from '../constants/indonesianCities';
import { matchesLocation } from '../utils/locationNormalization';
import { filterTherapistsByCity, filterPlacesByCity } from '../utils/cityFilterUtils';

interface UseHomePageLocationProps {
    therapists: Therapist[];
    places: Place[];
    hotels: any[];
    selectedCity: string;
    propSelectedCity?: string;
    userLocation: UserLocation | null;
    previewTherapistId: string | null;
    adminViewArea: string | null;
    bypassRadiusForAdmin: boolean;
    devLocationOverride: {lat: number, lng: number, label: string} | null;
    devShowAllTherapists: boolean;
    hasAdminPrivileges: boolean;
    onSetUserLocation: (location: UserLocation) => void;
}

export function useHomePageLocation({
    therapists,
    places,
    hotels,
    selectedCity,
    propSelectedCity,
    userLocation,
    previewTherapistId,
    adminViewArea,
    bypassRadiusForAdmin,
    devLocationOverride,
    devShowAllTherapists,
    hasAdminPrivileges,
    onSetUserLocation
}: UseHomePageLocationProps) {
    const [autoDetectedLocation, setAutoDetectedLocation] = useState<{lat: number, lng: number} | null>(null);
    const [nearbyTherapists, setNearbyTherapists] = useState<Therapist[]>([]);
    const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
    const [nearbyHotels, setNearbyHotels] = useState<any[]>([]);
    const [cityFilteredTherapists, setCityFilteredTherapists] = useState<Therapist[]>([]);
    const [isLocationDetecting, setIsLocationDetecting] = useState(false);
    
    // Parse coordinates utility
    const parseCoordinates = (coordinates: any): { lat: number; lng: number } | null => {
        if (!coordinates) return null;
        
        // Handle Point format [lng, lat] - Appwrite GeoJSON standard
        if (Array.isArray(coordinates) && coordinates.length === 2) {
            return { lat: coordinates[1], lng: coordinates[0] };
        }
        
        // Handle JSON string format
        if (typeof coordinates === 'string') {
            try {
                const parsed = JSON.parse(coordinates);
                if (parsed.lat && parsed.lng) {
                    return { lat: parsed.lat, lng: parsed.lng };
                }
            } catch {}
        }
        
        // Handle object format
        if (coordinates.lat && coordinates.lng) {
            return { lat: coordinates.lat, lng: coordinates.lng };
        }
        
        return null;
    };
    
    // Auto-detect location on mount
    useEffect(() => {
        const detectLocation = async () => {
            if (userLocation) {
                console.log('📍 Using existing user location:', userLocation);
                setAutoDetectedLocation({ lat: userLocation.lat, lng: userLocation.lng });
                return;
            }
            
            setIsLocationDetecting(true);
            try {
                const customerLocation = await getCustomerLocation();
                if (customerLocation) {
                    const { lat, lng } = customerLocation;
                    console.log('📍 Auto-detected customer location:', { lat, lng });
                    setAutoDetectedLocation({ lat, lng });
                    onSetUserLocation({ lat, lng, address: 'Detected Location' });
                }
            } catch (error) {
                console.error('❌ Failed to detect location:', error);
            } finally {
                setIsLocationDetecting(false);
            }
        };
        
        detectLocation();
    }, []); // Run once on mount
    
    // City-based filtering logic
    useEffect(() => {
        const safeTherapists = Array.isArray(therapists) ? therapists : [];
        const effectiveSelectedCity = propSelectedCity || selectedCity;
        
        if (!effectiveSelectedCity || effectiveSelectedCity === 'all') {
            setCityFilteredTherapists(safeTherapists);
            return;
        }
        
        const filtered = filterTherapistsByCity(safeTherapists, effectiveSelectedCity);
        setCityFilteredTherapists(filtered);
        
        const effectiveLocation = devLocationOverride || autoDetectedLocation || (userLocation ? {lat: userLocation.lat, lng: userLocation.lng} : null);
        
        if (!effectiveLocation) {
            setNearbyTherapists([]);
            setNearbyPlaces([]);
            setNearbyHotels([]);
            return;
        }
        
        if (previewTherapistId && hasAdminPrivileges) {
            const previewTherapist = safeTherapists.find(t => t.$id === previewTherapistId || t.id === previewTherapistId);
            if (previewTherapist) {
                setNearbyTherapists([previewTherapist]);
                console.log('🔍 Preview mode: Showing single therapist:', previewTherapist.name);
                return;
            }
        }
        
        if (adminViewArea && bypassRadiusForAdmin && hasAdminPrivileges) {
            const adminFiltered = safeTherapists.filter(t => {
                const city = t.city || t.location;
                return city && matchesLocation(city.toLowerCase(), adminViewArea.toLowerCase());
            });
            setNearbyTherapists(adminFiltered);
            console.log('🔐 Admin view: ' + adminFiltered.length + ' therapists in ' + adminViewArea);
            return;
        }
        
        if (devShowAllTherapists) {
            setNearbyTherapists(safeTherapists);
            setNearbyPlaces(Array.isArray(places) ? places : []);
            setNearbyHotels(hotels);
            console.log('🛠️ Dev mode: Showing all providers (radius bypass)');
            return;
        }
        
        // Normal nearby logic (10km radius) - Filter locally for speed and consistency
        const nearbyTherapistResults = safeTherapists.filter(t => {
            const coords = parseCoordinates(t.coordinates);
            if (!coords) return false;
            return calculateDistance(effectiveLocation, coords) <= 10;
        });

        const safePlaces = Array.isArray(places) ? places : [];
        const nearbyPlaceResults = safePlaces.filter(p => {
            const coords = parseCoordinates(p.coordinates);
            if (!coords) return false;
            return calculateDistance(effectiveLocation, coords) <= 10;
        });

        const safeHotels = Array.isArray(hotels) ? hotels : [];
        const nearbyHotelResults = safeHotels.filter(hotel => {
            const coords = parseCoordinates(hotel.coordinates);
            if (!coords) return false;
            return calculateDistance(effectiveLocation, coords) <= 10;
        });
        
        setNearbyTherapists(nearbyTherapistResults);
        setNearbyPlaces(nearbyPlaceResults);
        setNearbyHotels(nearbyHotelResults);
        
        console.log('📍 Nearby providers updated:', {
            therapists: nearbyTherapistResults.length,
            places: nearbyPlaceResults.length,
            hotels: nearbyHotelResults.length
        });
    }, [
        autoDetectedLocation,
        devLocationOverride,
        devShowAllTherapists,
        therapists,
        places,
        hotels,
        previewTherapistId,
        adminViewArea,
        bypassRadiusForAdmin,
        hasAdminPrivileges,
        selectedCity,
        propSelectedCity,
        userLocation
    ]);
    
    return {
        autoDetectedLocation,
        setAutoDetectedLocation,
        nearbyTherapists,
        setNearbyTherapists,
        nearbyPlaces,
        setNearbyPlaces,
        nearbyHotels,
        setNearbyHotels,
        cityFilteredTherapists,
        setCityFilteredTherapists,
        isLocationDetecting,
        setIsLocationDetecting,
        parseCoordinates,
        // Re-export utility functions used by HomePage
        getCustomerLocation,
        findAllNearbyTherapists,
        findAllNearbyPlaces,
        findCityByCoordinates
    };
}

// Distance calculation (Haversine formula)
function calculateDistance(loc1: {lat: number, lng: number}, loc2: {lat: number, lng: number}): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(loc2.lat - loc1.lat);
    const dLng = toRad(loc2.lng - loc1.lng);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * useDataFetching Hook
 * Handles all data fetching operations for therapists and places
 */

import { useState, useCallback } from 'react';
import type { Therapist, Place } from '../types';
import { therapistService, placesService, hotelService, facialPlaceService } from '../lib/appwriteService';
import { reviewService } from '../lib/reviewService';
import { APP_CONFIG } from '../config/appConfig';
import { robustCollectionQuery } from '../lib/robustApiWrapper';
import { updateYogyakartaTherapists } from '../lib/therapistListProvider';
import { filterTherapistsByCity, filterPlacesByCity } from '../utils/cityFilterUtils';

export const useDataFetching = () => {
    const [isLoading, setIsLoading] = useState(false);

    const fetchPublicData = useCallback(async (activeCity?: string): Promise<{
        therapists: Therapist[];
        places: Place[];
        hotels: any[];
        facialPlaces: Place[];
    }> => {
        try {
            setIsLoading(true);
            
            // Fetch therapists first (this should work)
            console.log('� [STAGE 2 - HOOK] Fetching therapists data...');
            const [therapistsData, placesData, facialPlacesData, hotelsData] = await Promise.all([
                robustCollectionQuery(() => therapistService.getTherapists(activeCity && activeCity !== 'all' ? activeCity : undefined), 'therapists', [] as Therapist[]),
                robustCollectionQuery(() => placesService.getPlaces(), 'places', [] as Place[]),
                robustCollectionQuery(() => facialPlaceService.getAll(), 'facial_places', [] as Place[]),
                robustCollectionQuery(() => hotelService.getHotels(), 'hotels', [] as any[])
            ]);
            let finalTherapistsData = therapistsData ?? [];
            if (finalTherapistsData.length === 0) {
                console.warn('[fetchPublicData] getTherapists returned 0. Trying getAll() fallback for massage home service.');
                try {
                    // Fetch ALL therapists (no city filter) so client-side city filter can still show results
                    // if server-side locationId/country query returned 0 (e.g. docs use primary_city instead of locationId)
                    const allTherapists = await therapistService.getAll(undefined, undefined, { liveOnly: false });
                    if (Array.isArray(allTherapists) && allTherapists.length > 0) {
                        finalTherapistsData = allTherapists;
                        console.warn('[fetchPublicData] Using getAll() fallback:', allTherapists.length, 'therapists for home page (city filter will be applied client-side).');
                    }
                } catch (fallbackErr) {
                    console.error('[fetchPublicData] getAll() fallback failed:', fallbackErr);
                }
            }
            console.log('[fetchPublicData] Therapists from Appwrite:', finalTherapistsData.length, '| places:', (placesData ?? []).length, '| facial:', (facialPlacesData ?? []).length);
            if (finalTherapistsData.length === 0) {
                console.warn('[fetchPublicData] No therapists to display. Check Appwrite: collection ID, read permission (Role: Any), and therapist documents.');
                console.warn('[fetchPublicData] Fix: Set VITE_THERAPISTS_COLLECTION_ID in .env to your exact Appwrite collection ID (Appwrite Console → Database → therapists). Run the "Audit Therapist Live Display" on the Appwrite Diagnostic page (/appwrite-diagnostic) to verify.');
            }
            // Initialize review data for new accounts
            const therapistsWithReviews = (finalTherapistsData || []).map((therapist: Therapist) =>
                reviewService.initializeProvider(therapist) as Therapist
            );
            
            // CRITICAL CITY FILTERING: If activeCity is specified, filter all data by city
            let finalTherapists = therapistsWithReviews;
            if (activeCity && activeCity !== 'all') {
                console.log(`🔒 CITY FILTER: Filtering ${therapistsWithReviews.length} therapists by city="${activeCity}"`);
                finalTherapists = filterTherapistsByCity(therapistsWithReviews, activeCity);
                console.log(`🔒 CITY FILTER: After filtering, ${finalTherapists.length} therapists remain`);
            }
            
            // ✅ CRITICAL FIX: Update therapist list provider state when real data arrives
            if (finalTherapists && finalTherapists.length > 0) {
                console.log('🔄 Updating therapist list provider with fetched data...');
                updateYogyakartaTherapists(finalTherapists);
                console.log('✅ Therapist list provider updated - fallback data replaced with fetched data');
            }
            
            const placesWithReviews = (placesData || []).map((place: Place) => 
                reviewService.initializeProvider(place) as Place
            );
            
            // CRITICAL CITY FILTERING: Filter places by city if specified
            let finalPlaces = placesWithReviews;
            if (activeCity && activeCity !== 'all') {
                console.log(`🔒 CITY FILTER: Filtering ${placesWithReviews.length} places by city="${activeCity}"`);
                finalPlaces = filterPlacesByCity(placesWithReviews, activeCity);
                console.log(`🔒 CITY FILTER: After filtering, ${finalPlaces.length} places remain`);
            }
            
            // Initialize review data for facial places
            const facialPlacesWithReviews = (facialPlacesData || []).map((facialPlace: Place) => 
                reviewService.initializeProvider(facialPlace) as Place
            );
            
            // CRITICAL CITY FILTERING: Filter facial places by city if specified
            let finalFacialPlaces = facialPlacesWithReviews;
            if (activeCity && activeCity !== 'all') {
                console.log(`🔒 CITY FILTER: Filtering ${facialPlacesWithReviews.length} facial places by city="${activeCity}"`);
                finalFacialPlaces = filterPlacesByCity(facialPlacesWithReviews, activeCity);
                console.log(`🔒 CITY FILTER: After filtering, ${finalFacialPlaces.length} facial places remain`);
            }
            
            // Initialize review data for hotels (if needed)
            const hotelsWithReviews = (hotelsData || []).map((hotel: any) => 
                reviewService.initializeProvider(hotel) as any
            );
            
            return {
                therapists: finalTherapists,
                places: finalPlaces,
                facialPlaces: finalFacialPlaces,
                hotels: hotelsWithReviews
            };
        } catch (error) {
            console.error('❌ Error fetching public data from Appwrite:', error);
            console.error('🔧 Please ensure your collection IDs in lib/appwrite.config.ts are correct.');
            
            // Log specific error details to help with debugging
            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack?.substring(0, 200)
                });
                
                if (error.message.includes('Collection with the requested ID could not be found')) {
                    console.error('💡 This error means the collection ID in your config file is incorrect or the collection doesn\'t exist.');
                    console.error('💡 Use the debug-collection-ids.html tool to find the correct collection IDs.');
                }
            }
            
            // Return empty arrays instead of mock data - force real Appwrite connection
            return {
                therapists: [],
                places: [],
                facialPlaces: [],
                hotels: []
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchAdminData = useCallback(async (): Promise<{
        therapists: Therapist[];
        places: Place[];
    }> => {
        try {
            setIsLoading(true);
            const [therapistsData, placesData] = await Promise.all([
                therapistService.getAll(), // All therapists (admin); getTherapists() is live-only for consumer
                placesService.getPlaces()
            ]);

            return {
                therapists: therapistsData || [],
                places: placesData || []
            };
        } catch (error) {
            console.error('Error fetching admin data:', error);
            return {
                therapists: [],
                places: []
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        fetchPublicData,
        fetchAdminData
    };
};

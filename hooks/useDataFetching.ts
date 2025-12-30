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

export const useDataFetching = () => {
    const [isLoading, setIsLoading] = useState(false);

    const fetchPublicData = useCallback(async (): Promise<{
        therapists: Therapist[];
        places: Place[];
        hotels: any[];
        facialPlaces: Place[];
    }> => {
        try {
            setIsLoading(true);
            
            // Fetch therapists first (this should work)
            console.log('🔄 Fetching therapists data...');
            const therapistsData = await robustCollectionQuery(
                () => therapistService.getTherapists(),
                'therapists',
                [] as Therapist[]
            );
            console.log('✅ Therapists data received:', therapistsData?.length || 0);
            console.log('🔍 THERAPIST QUERY RESULT DEBUG:');
            console.log('  📊 Total therapists:', therapistsData?.length || 0);
            console.log('  🆔 Document IDs:', therapistsData?.map(t => t.$id) || []);
            console.log('  📄 Full result:', therapistsData);
            
            // Try to fetch places, but handle gracefully if collection is empty
            console.log('🔄 Attempting to fetch places data...');
            const placesData = await robustCollectionQuery(
                () => placesService.getPlaces(),
                'places',
                [] as Place[]
            );
            console.log('✅ Places data received:', placesData?.length || 0);
            
            // Try to fetch facial places
            console.log('🔄 Attempting to fetch facial places data...');
            console.log('📋 facialPlaceService exists:', !!facialPlaceService);
            console.log('📋 facialPlaceService.getAll exists:', !!facialPlaceService?.getAll);
            
            const facialPlacesData = await robustCollectionQuery(
                () => {
                    console.log('🎯 Inside robustCollectionQuery callback for facial places');
                    return facialPlaceService.getAll();
                },
                'facial_places',
                [] as Place[]
            );
            console.log('✅ Facial places data received:', facialPlacesData?.length || 0);
            if (facialPlacesData && facialPlacesData.length > 0) {
                console.log('📸 First facial place:', facialPlacesData[0]);
            }
            
            // Try to fetch hotels for location dropdown filtering
            console.log('🔄 Attempting to fetch hotels data...');
            const hotelsData = await robustCollectionQuery(
                () => hotelService.getHotels(),
                'hotels',
                [] as any[]
            );
            console.log('✅ Hotels data received:', hotelsData?.length || 0);
            
            // Initialize review data for new accounts
            console.log('🎯 Initializing reviews for therapists...');
            const therapistsWithReviews = (therapistsData || []).map((therapist: Therapist) => {
                const initialized = reviewService.initializeProvider(therapist) as Therapist;
                if (initialized.rating !== therapist.rating || initialized.reviewCount !== (therapist as any).reviewcount) {
                    console.log(`📊 Initialized ${therapist.name}: ${initialized.rating}★ (${initialized.reviewCount} reviews)`);
                }
                return initialized;
            });
            
            // ✅ CRITICAL FIX: Update therapist list provider state when real data arrives
            if (therapistsWithReviews && therapistsWithReviews.length > 0) {
                console.log('🔄 Updating therapist list provider with fetched data...');
                updateYogyakartaTherapists(therapistsWithReviews);
                console.log('✅ Therapist list provider updated - fallback data replaced with fetched data');
            }
            
            const placesWithReviews = (placesData || []).map((place: Place) => 
                reviewService.initializeProvider(place) as Place
            );
            
            // Initialize review data for facial places
            const facialPlacesWithReviews = (facialPlacesData || []).map((facialPlace: Place) => 
                reviewService.initializeProvider(facialPlace) as Place
            );
            
            // Initialize review data for hotels (if needed)
            const hotelsWithReviews = (hotelsData || []).map((hotel: any) => 
                reviewService.initializeProvider(hotel) as any
            );
            
            return {
                therapists: therapistsWithReviews,
                places: placesWithReviews,
                facialPlaces: facialPlacesWithReviews,
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
                therapistService.getTherapists(),
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

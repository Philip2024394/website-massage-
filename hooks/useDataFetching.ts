/**
 * useDataFetching Hook
 * Handles all data fetching operations for therapists and places
 */

import { useState, useCallback } from 'react';
import type { Therapist, Place } from '../types';
import { therapistService, placeService } from '../lib/appwriteService';
import { reviewService } from '../lib/reviewService';
import { APP_CONFIG } from '../config/appConfig';

export const useDataFetching = () => {
    const [isLoading, setIsLoading] = useState(false);

    const fetchPublicData = useCallback(async (): Promise<{
        therapists: Therapist[];
        places: Place[];
    }> => {
        try {
            setIsLoading(true);
            

            
            // Add timeout to prevent infinite loading
            const timeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Fetch timeout')), APP_CONFIG.DATA_FETCH_TIMEOUT)
            );
            
            // Fetch therapists first (this should work)
            console.log('🔄 Fetching therapists data...');
            const therapistsData = await therapistService.getTherapists();
            console.log('✅ Therapists data received:', therapistsData?.length || 0);
            
            // Try to fetch places, but handle gracefully if collection is empty
            let placesData: Place[] = [];
            try {
                console.log('🔄 Attempting to fetch places data...');
                placesData = await placeService.getPlaces();
                console.log('✅ Places data received:', placesData?.length || 0);
            } catch (placeError) {
                console.warn('⚠️ Places collection not available (this is OK):', placeError);
                placesData = []; // Continue with empty places array
            }
            
            // Initialize review data for new accounts
            const therapistsWithReviews = (therapistsData || []).map((therapist: Therapist) => 
                reviewService.initializeProvider(therapist) as Therapist
            );
            
            const placesWithReviews = (placesData || []).map((place: Place) => 
                reviewService.initializeProvider(place) as Place
            );
            
            return {
                therapists: therapistsWithReviews,
                places: placesWithReviews
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
                places: []
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
                placeService.getPlaces()
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

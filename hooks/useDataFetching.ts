/**
 * useDataFetching Hook
 * Handles all data fetching operations for therapists and places
 */

import { useState, useCallback } from 'react';
import type { Therapist, Place } from '../types';
import { therapistService, placeService } from '../lib/appwriteService';
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
            
            const dataFetch = Promise.all([
                therapistService.getTherapists(),
                (async () => {
                    console.log('🔥 About to call placeService.getPlaces()');
                    const result = await placeService.getPlaces();
                    console.log('🔥 placeService.getPlaces() returned:', result?.length, 'places');
                    return result;
                })()
            ]);
            
            const [therapistsData, placesData] = await Promise.race([dataFetch, timeout]) as any;
            
            console.log('🏠 HomePage: Fetched therapists:', therapistsData?.length);
            therapistsData?.forEach((t: any) => {
                console.log(`  👤 ${t.name}:`, {
                    mainImage: t.mainImage?.substring(0, 60) + '...',
                    profilePicture: t.profilePicture?.substring(0, 60) + '...',
                    isLive: t.isLive,
                    id: t.id || t.$id
                });
            });
            
            const liveTherapists = therapistsData?.filter((t: any) => t.isLive === true);
            console.log('✅ Live therapists count:', liveTherapists?.length);
            
            console.log('🏨 HomePage: Fetched PLACES:', placesData?.length);
            placesData?.forEach((p: any) => {
                console.log(`  🏨 ${p.name}:`, {
                    mainImage: p.mainImage?.substring(0, 60) + '...',
                    isLive: p.isLive,
                    id: p.id || p.$id,
                    location: p.location
                });
            });
            
            const livePlaces = placesData?.filter((p: any) => p.isLive === true);
            console.log('✅ Live PLACES count:', livePlaces?.length);
            console.log('📊 Live therapists details:');
            liveTherapists?.forEach((t: any, index: number) => {
                console.log(`  ${index + 1}. ${t.name} (ID: ${t.id || t.$id}) - Rating: ${t.rating || 'N/A'}`);
            });
            
            const allTherapists = therapistsData || [];
            console.log('📊 Total therapists in database:', allTherapists.length);
            console.log('📊 Breakdown:');
            console.log('  ✅ Live (isLive=true):', allTherapists.filter((t: any) => t.isLive === true).length);
            console.log('  ❌ Not Live (isLive=false):', allTherapists.filter((t: any) => t.isLive === false).length);
            console.log('  ⚠️ Unknown (isLive=undefined):', allTherapists.filter((t: any) => t.isLive === undefined).length);
            
            return {
                therapists: therapistsData || [],
                places: placesData || []
            };
        } catch (error) {
            console.error('Error fetching public data:', error);
            console.warn('⚠️ Continuing with empty data - check Appwrite configuration');
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

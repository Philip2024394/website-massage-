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
            
            console.log('🔄 Attempting to fetch data from Appwrite...');
            
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
            console.error('❌ Error fetching public data from Appwrite:', error);
            console.warn('⚠️ Using mock data - Appwrite collections may need configuration');
            
            // Return mock data to test the app pages
            const mockTherapists = [
                {
                    $id: 'mock-1',
                    id: 'mock-1',
                    name: 'Sarah Johnson',
                    bio: 'Professional massage therapist with 5 years experience',
                    rating: 4.8,
                    experience: '5 years',
                    isLive: true,
                    location: 'Ubud, Bali',
                    price: 250000,
                    massageTypes: ['Swedish', 'Deep Tissue', 'Aromatherapy'],
                    mainImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
                    profilePicture: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200'
                },
                {
                    $id: 'mock-2',
                    id: 'mock-2',
                    name: 'Made Wijaya',
                    bio: 'Traditional Balinese massage specialist',
                    rating: 4.9,
                    experience: '8 years',
                    isLive: true,
                    location: 'Seminyak, Bali',
                    price: 300000,
                    massageTypes: ['Balinese', 'Hot Stone', 'Reflexology'],
                    mainImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
                    profilePicture: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200'
                },
                {
                    $id: 'mock-3',
                    id: 'mock-3',
                    name: 'Lisa Chen',
                    bio: 'Sports massage and rehabilitation expert',
                    rating: 4.7,
                    experience: '6 years',
                    isLive: true,
                    location: 'Canggu, Bali',
                    price: 280000,
                    massageTypes: ['Sports', 'Thai', 'Myofascial'],
                    mainImage: 'https://images.unsplash.com/photo-1594824804732-ca8db0cd94e0?w=400',
                    profilePicture: 'https://images.unsplash.com/photo-1594824804732-ca8db0cd94e0?w=200'
                }
            ];

            const mockPlaces = [
                {
                    $id: 'place-1',
                    id: 'place-1',
                    name: 'Bliss Spa Ubud',
                    description: 'Luxury spa experience in the heart of Ubud',
                    rating: 4.9,
                    isLive: true,
                    location: 'Ubud, Bali',
                    averagePrice: 350000,
                    services: ['Full Body Massage', 'Facial', 'Body Scrub'],
                    mainImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400'
                },
                {
                    $id: 'place-2',
                    id: 'place-2',
                    name: 'Ocean Wellness Center',
                    description: 'Beachfront spa with ocean views',
                    rating: 4.8,
                    isLive: true,
                    location: 'Seminyak, Bali',
                    averagePrice: 400000,
                    services: ['Couples Massage', 'Hot Stone', 'Aromatherapy'],
                    mainImage: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400'
                }
            ];

            console.log('📊 Using mock data:');
            console.log('  👤 Mock therapists:', mockTherapists.length);
            console.log('  🏨 Mock places:', mockPlaces.length);
            
            return {
                therapists: mockTherapists as any[],
                places: mockPlaces as any[]
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

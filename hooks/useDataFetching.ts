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
            
            const dataFetch = Promise.all([
                therapistService.getTherapists(),
                placeService.getPlaces()
            ]);
            
            const [therapistsData, placesData] = await Promise.race([dataFetch, timeout]) as any;
            
            // Initialize review data for new accounts
            const therapistsWithReviews = (therapistsData || []).map((therapist: Therapist) => 
                reviewService.initializeProvider(therapist)
            );
            
            const placesWithReviews = (placesData || []).map((place: Place) => 
                reviewService.initializeProvider(place)
            );
            
            return {
                therapists: therapistsWithReviews,
                places: placesWithReviews
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
                    massageTypes: ['Swedish Massage', 'Deep Tissue Massage', 'Aromatherapy Massage', 'Hot Stone Massage', 'Reflexology'],
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
                    massageTypes: ['Balinese Massage', 'Thai Massage', 'Shiatsu Massage', 'Acupressure', 'Jamu Massage'],
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
                    massageTypes: ['Sports Massage', 'Lymphatic Massage', 'Deep Tissue Massage', 'Prenatal Massage', 'Reflexology'],
                    mainImage: 'https://images.unsplash.com/photo-1594824804732-ca8db0cd94e0?w=400',
                    profilePicture: 'https://images.unsplash.com/photo-1594824804732-ca8db0cd94e0?w=200'
                },
                {
                    $id: 'mock-4',
                    id: 'mock-4',
                    name: 'Kadek Sari',
                    bio: 'Traditional Indonesian massage expert specializing in heritage techniques',
                    rating: 4.9,
                    experience: '10 years',
                    isLive: true,
                    location: 'Denpasar, Bali',
                    price: 320000,
                    massageTypes: ['Javanese Massage', 'Kerokan (Coin Rub)', 'Jamu Massage', 'Acupressure', 'Lomi Lomi Massage'],
                    mainImage: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400',
                    profilePicture: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200'
                },
                {
                    $id: 'mock-5',
                    id: 'mock-5',
                    name: 'Alex Rodriguez',
                    bio: 'Certified therapeutic massage specialist with western and eastern techniques',
                    rating: 4.6,
                    experience: '4 years',
                    isLive: true,
                    location: 'Sanur, Bali',
                    price: 260000,
                    massageTypes: ['Indian Head Massage', 'Hot Stone Massage', 'Aromatherapy Massage', 'Thai Massage', 'Prenatal Massage'],
                    mainImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
                    profilePicture: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200'
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
                    massageTypes: ['Swedish Massage', 'Balinese Massage', 'Aromatherapy Massage', 'Hot Stone Massage', 'Javanese Massage'],
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
                    massageTypes: ['Thai Massage', 'Lomi Lomi Massage', 'Deep Tissue Massage', 'Shiatsu Massage', 'Indian Head Massage'],
                    mainImage: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400'
                },
                {
                    $id: 'place-3',
                    id: 'place-3',
                    name: 'Traditional Healing Sanctuary',
                    description: 'Authentic Indonesian healing and massage center',
                    rating: 4.7,
                    isLive: true,
                    location: 'Sanur, Bali',
                    averagePrice: 275000,
                    services: ['Traditional Healing', 'Herbal Treatments', 'Jamu Massage'],
                    massageTypes: ['Jamu Massage', 'Kerokan (Coin Rub)', 'Acupressure', 'Reflexology', 'Prenatal Massage'],
                    mainImage: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400'
                },
                {
                    $id: 'place-4',
                    id: 'place-4',
                    name: 'Sports Recovery Clinic',
                    description: 'Professional sports massage and rehabilitation center',
                    rating: 4.6,
                    isLive: true,
                    location: 'Canggu, Bali',
                    averagePrice: 320000,
                    services: ['Sports Massage', 'Injury Recovery', 'Physiotherapy'],
                    massageTypes: ['Sports Massage', 'Lymphatic Massage', 'Deep Tissue Massage', 'Hot Stone Massage', 'Swedish Massage'],
                    mainImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
                }
            ];

            console.log('📊 Using mock data:');
            console.log('  👤 Mock therapists:', mockTherapists.length);
            console.log('  🏨 Mock places:', mockPlaces.length);
            
            // Initialize review data for mock accounts too
            const mockTherapistsWithReviews = mockTherapists.map((therapist: any) => 
                reviewService.initializeProvider(therapist as Therapist)
            );
            
            const mockPlacesWithReviews = mockPlaces.map((place: any) => 
                reviewService.initializeProvider(place as Place)
            );
            
            return {
                therapists: mockTherapistsWithReviews as any[],
                places: mockPlacesWithReviews as any[]
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

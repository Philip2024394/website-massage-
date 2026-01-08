/**
 * useHomePageHandlers - Event handler logic for HomePage
 * Extracted from HomePage.tsx to reduce file size
 */

import { useState } from 'react';
import { reviewService } from '../lib/appwriteService';
import { getCustomerLocation } from '../lib/nearbyProvidersService';
import type { Therapist, UserLocation } from '../types';

interface UseHomePageHandlersProps {
    loggedInCustomer: any;
    onShowRegisterPrompt?: () => void;
    onSetUserLocation: (location: UserLocation) => void;
    setSelectedRatingItem: (item: {item: any, type: 'therapist' | 'place'} | null) => void;
    setSelectedTherapist: (therapist: Therapist | null) => void;
    setShowRatingModal: (show: boolean) => void;
    setIsLocationModalOpen: (open: boolean) => void;
    setAutoDetectedLocation: (location: {lat: number, lng: number} | null) => void;
    selectedRatingItem: {item: any, type: 'therapist' | 'place'} | null;
}

export function useHomePageHandlers({
    loggedInCustomer,
    onShowRegisterPrompt,
    onSetUserLocation,
    setSelectedRatingItem,
    setSelectedTherapist,
    setShowRatingModal,
    setIsLocationModalOpen,
    setAutoDetectedLocation,
    selectedRatingItem
}: UseHomePageHandlersProps) {
    
    const handleOpenRatingModal = (item: any, type: 'therapist' | 'place' = 'therapist') => {
        // Check if customer is logged in before allowing review
        if (!loggedInCustomer) {
            if (onShowRegisterPrompt) {
                onShowRegisterPrompt();
            }
            return;
        }
        setSelectedRatingItem({ item, type });
        if (type === 'therapist') {
            setSelectedTherapist(item);
        }
        setShowRatingModal(true);
    };

    const handleCloseRatingModal = () => {
        setShowRatingModal(false);
        setSelectedTherapist(null);
        setSelectedRatingItem(null);
    };

    const handleSubmitReview = async () => {
        if (!selectedRatingItem) return;

        try {
            const itemId = selectedRatingItem.item.id || (selectedRatingItem.item as any).$id;
            await reviewService.create({
                providerId: String(itemId),
                providerType: selectedRatingItem.type,
                rating: 0, // Will be set by RatingModal
                reviewContent: '',
                reviewerId: '',
                status: 'pending'
            });
            handleCloseRatingModal();
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    const handleLocationRequest = () => {
        console.log('📍 Showing custom orange location modal...');
        setIsLocationModalOpen(true);
    };

    const handleLocationAllow = async () => {
        setIsLocationModalOpen(false);
        try {
            console.log('📍 User allowed location, requesting via browser API...');
            const location = await getCustomerLocation();
            
            console.log('✅ Location detected:', location);
            
            // Use Google Maps Geocoding to get address from coordinates
            let address = 'Current location';
            
            if ((window as any).google?.maps?.Geocoder) {
                try {
                    const geocoder = new (window as any).google.maps.Geocoder();
                    const result = await new Promise<any>((resolve, reject) => {
                        geocoder.geocode(
                            { location: { lat: location.lat, lng: location.lng } },
                            (results: any[], status: string) => {
                                if (status === 'OK' && results && results.length > 0) {
                                    resolve(results[0]);
                                } else {
                                    reject(new Error('Geocoding failed'));
                                }
                            }
                        );
                    });
                    
                    address = result.formatted_address || 'Current location';
                    console.log('✅ Reverse geocoded address:', address);
                } catch (geoError) {
                    console.warn('⚠️ Reverse geocoding failed, using default address:', geoError);
                }
            }
            
            // Update the app's user location
            if (onSetUserLocation) {
                onSetUserLocation({
                    address,
                    lat: location.lat,
                    lng: location.lng
                });
            }
            
            // Update auto-detected location state
            setAutoDetectedLocation(location);
            
        } catch (error) {
            console.log('❌ Location detection failed:', error);
            alert('Unable to detect location. Please enable location permissions in your browser and try again.');
        }
    };

    const handleLocationDeny = () => {
        console.log('📍 User denied location access');
        setIsLocationModalOpen(false);
    };
    
    return {
        handleOpenRatingModal,
        handleCloseRatingModal,
        handleSubmitReview,
        handleLocationRequest,
        handleLocationAllow,
        handleLocationDeny
    };
}

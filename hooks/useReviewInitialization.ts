import { useEffect, useState } from 'react';
import { reviewService } from '../lib/reviewService';
import type { Therapist, Place } from '../types';

/**
 * Hook to handle review initialization and management for providers
 */
export function useReviewInitialization() {
    const [isInitialized, setIsInitialized] = useState(false);

    /**
     * Initialize a single provider with review data if needed
     */
    const initializeProvider = <T extends Therapist | Place>(provider: T): T => {
        if (provider.rating === 0 && provider.reviewCount === 0) {
            return reviewService.initializeProvider(provider) as T;
        }
        return provider;
    };

    /**
     * Initialize multiple providers
     */
    const initializeProviders = <T extends Therapist | Place>(providers: T[]): T[] => {
        return providers.map(provider => initializeProvider(provider));
    };

    /**
     * Initialize therapists array
     */
    const initializeTherapists = (therapists: Therapist[]): Therapist[] => {
        return initializeProviders(therapists);
    };

    /**
     * Initialize places array
     */
    const initializePlaces = (places: Place[]): Place[] => {
        return initializeProviders(places);
    };

    /**
     * Update provider after receiving a review
     */
    const updateProviderWithNewReview = <T extends Therapist | Place>(
        provider: T, 
        newRating: number
    ): T => {
        return reviewService.updateProviderRating(provider, newRating) as T;
    };

    /**
     * Check if provider needs initialization
     */
    const needsInitialization = (provider: Therapist | Place): boolean => {
        return provider.rating === 0 && provider.reviewCount === 0;
    };

    /**
     * Get provider reviews
     */
    const getProviderReviews = (providerId: string | number, providerType: 'therapist' | 'place') => {
        return reviewService.getProviderReviews(providerId, providerType);
    };

    /**
     * Get provider review summary
     */
    const getProviderReviewSummary = (providerId: string | number, providerType: 'therapist' | 'place') => {
        return reviewService.getProviderReviewSummary(providerId, providerType);
    };

    /**
     * Check if user can review provider
     */
    const canUserReview = (userId: string, providerId: string | number, providerType: 'therapist' | 'place') => {
        return reviewService.canUserReview(userId, providerId, providerType);
    };

    /**
     * Add a new review
     */
    const addReview = (
        providerId: string | number,
        providerType: 'therapist' | 'place',
        userId: string,
        userName: string,
        rating: number,
        comment: string,
        bookingId?: string
    ) => {
        return reviewService.addReview(providerId, providerType, userId, userName, rating, comment, bookingId);
    };

    useEffect(() => {
        setIsInitialized(true);
    }, []);

    return {
        isInitialized,
        initializeProvider,
        initializeProviders,
        initializeTherapists,
        initializePlaces,
        updateProviderWithNewReview,
        needsInitialization,
        getProviderReviews,
        getProviderReviewSummary,
        canUserReview,
        addReview,
        reviewService
    };
}

export default useReviewInitialization;
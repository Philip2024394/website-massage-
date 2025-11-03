/**
 * Review Management System
 * Handles user reviews for therapists and massage places
 */

import { generateInitialReviewData, updateRatingWithNewReview, removeReviewRating } from './reviewInitializationService';
import type { Therapist, Place } from '../types';

export interface Review {
    id: string;
    providerId: string | number;
    providerType: 'therapist' | 'place';
    userId: string;
    userName: string;
    rating: number; // 1-5 stars
    comment: string;
    createdAt: string;
    isVerified?: boolean; // Whether the review is from a verified booking
    bookingId?: string; // Associated booking ID if from verified booking
}

export interface ReviewSummary {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

class ReviewService {
    private reviews: Review[] = [];
    private localStorageKey = 'massage_app_reviews';

    constructor() {
        this.loadReviews();
    }

    /**
     * Load reviews from localStorage
     */
    private loadReviews(): void {
        try {
            const stored = localStorage.getItem(this.localStorageKey);
            if (stored) {
                this.reviews = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            this.reviews = [];
        }
    }

    /**
     * Save reviews to localStorage
     */
    private saveReviews(): void {
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.reviews));
        } catch (error) {
            console.error('Error saving reviews:', error);
        }
    }

    /**
     * Initialize a new provider with initial review data
     */
    initializeProvider(provider: Therapist | Place): Therapist | Place {
        if (provider.rating === 0 && provider.reviewCount === 0) {
            const initialData = generateInitialReviewData();
            return {
                ...provider,
                rating: initialData.rating,
                reviewCount: initialData.reviewCount
            };
        }
        return provider;
    }

    /**
     * Add a new review
     */
    addReview(
        providerId: string | number,
        providerType: 'therapist' | 'place',
        userId: string,
        userName: string,
        rating: number,
        comment: string,
        bookingId?: string
    ): Review {
        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        // Check if user already reviewed this provider
        const existingReview = this.reviews.find(
            r => r.providerId === providerId && 
                 r.providerType === providerType && 
                 r.userId === userId
        );

        if (existingReview) {
            throw new Error('User has already reviewed this provider');
        }

        // Create new review
        const review: Review = {
            id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            providerId,
            providerType,
            userId,
            userName,
            rating,
            comment: comment.trim(),
            createdAt: new Date().toISOString(),
            isVerified: !!bookingId,
            bookingId
        };

        this.reviews.push(review);
        this.saveReviews();

        return review;
    }

    /**
     * Update provider rating after new review
     */
    updateProviderRating(
        provider: Therapist | Place,
        newRating: number
    ): Therapist | Place {
        const updatedData = updateRatingWithNewReview(
            provider.rating,
            provider.reviewCount,
            newRating
        );

        return {
            ...provider,
            rating: updatedData.rating,
            reviewCount: updatedData.reviewCount
        };
    }

    /**
     * Get reviews for a specific provider
     */
    getProviderReviews(
        providerId: string | number,
        providerType: 'therapist' | 'place'
    ): Review[] {
        return this.reviews.filter(
            r => r.providerId === providerId && r.providerType === providerType
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    /**
     * Get review summary for a provider
     */
    getProviderReviewSummary(
        providerId: string | number,
        providerType: 'therapist' | 'place'
    ): ReviewSummary {
        const providerReviews = this.getProviderReviews(providerId, providerType);
        
        if (providerReviews.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            };
        }

        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let totalRating = 0;

        providerReviews.forEach(review => {
            totalRating += review.rating;
            ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
        });

        return {
            averageRating: Math.round((totalRating / providerReviews.length) * 10) / 10,
            totalReviews: providerReviews.length,
            ratingDistribution
        };
    }

    /**
     * Delete a review (admin function)
     */
    deleteReview(reviewId: string): boolean {
        const index = this.reviews.findIndex(r => r.id === reviewId);
        if (index === -1) {
            return false;
        }

        this.reviews.splice(index, 1);
        this.saveReviews();
        return true;
    }

    /**
     * Update provider rating after review deletion
     */
    updateProviderRatingAfterDeletion(
        provider: Therapist | Place,
        deletedRating: number
    ): Therapist | Place {
        try {
            const updatedData = removeReviewRating(
                provider.rating,
                provider.reviewCount,
                deletedRating
            );

            return {
                ...provider,
                rating: updatedData.rating,
                reviewCount: updatedData.reviewCount
            };
        } catch (error) {
            // If removal would result in no reviews, reinitialize
            const initialData = generateInitialReviewData();
            return {
                ...provider,
                rating: initialData.rating,
                reviewCount: initialData.reviewCount
            };
        }
    }

    /**
     * Get all reviews (admin function)
     */
    getAllReviews(): Review[] {
        return [...this.reviews].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    /**
     * Get reviews by user (for user dashboard)
     */
    getUserReviews(userId: string): Review[] {
        return this.reviews.filter(r => r.userId === userId).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    /**
     * Check if user can review a provider
     */
    canUserReview(
        userId: string,
        providerId: string | number,
        providerType: 'therapist' | 'place'
    ): boolean {
        return !this.reviews.some(
            r => r.userId === userId && 
                 r.providerId === providerId && 
                 r.providerType === providerType
        );
    }

    /**
     * Get recent reviews across all providers
     */
    getRecentReviews(limit: number = 10): Review[] {
        return [...this.reviews]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
    }
}

// Create singleton instance
export const reviewService = new ReviewService();

// Export for use in other components
export default reviewService;
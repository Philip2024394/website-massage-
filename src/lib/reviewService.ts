/**
 * Review Management System
 * Handles user reviews for therapists and massage places
 */

import { generateInitialReviewData, updateRatingWithNewReview, removeReviewRating } from './reviewInitializationService';
import { getYogyakartaTherapists } from './therapistListProvider';
import type { Therapist, Place } from '../types';

// Import Surtiningsih mock reviews
const surtiningsihMockReviews = [
    {
        id: 'review_surtiningsih_001',
        providerId: '693cfadf003d16b9896a',
        providerType: 'therapist' as const,
        userId: 'user_james_mitchell',
        userName: 'James Mitchell',
        rating: 5,
        comment: 'Absolutely phenomenal experience! Surtiningsih was incredibly professional and skilled. Had a 90-minute session at my hotel and it was exactly what I needed after long flights. Her technique for my leg injury was spot on - the pain is significantly reduced. Cannot recommend her more highly!',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-01T14:30:00.000Z',
        isVerified: true,
        bookingId: 'booking_001'
    },
    {
        id: 'review_surtiningsih_002',
        providerId: '693cfadf003d16b9896a',
        providerType: 'therapist' as const,
        userId: 'user_sari_dewi',
        userName: 'Sari Dewi',
        rating: 5,
        comment: 'Terapis yang sangat profesional dan berpengalaman! Surtiningsih datang ke hotel saya dan memberikan pijat yang luar biasa. Tekniknya sangat baik, terutama untuk mengatasi nyeri punggung saya. Sangat direkomendasikan untuk siapa saja yang membutuhkan terapi pijat berkualitas tinggi.',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-05T16:45:00.000Z',
        isVerified: true,
        bookingId: 'booking_002'
    },
    {
        id: 'review_surtiningsih_003',
        providerId: '693cfadf003d16b9896a',
        providerType: 'therapist' as const,
        userId: 'user_michael_thompson',
        userName: 'Michael Thompson',
        rating: 4,
        comment: 'Very professional therapist with excellent skills. Surtiningsih arrived on time at my hotel and provided a fantastic 60-minute deep tissue massage. Really helped with my shoulder tension from work stress. The only minor thing was she was about 10 minutes late, but the massage quality more than made up for it.',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-08T19:20:00.000Z',
        isVerified: true,
        bookingId: 'booking_003'
    },
    {
        id: 'review_surtiningsih_004',
        providerId: '693cfadf003d16b9896a',
        providerType: 'therapist' as const,
        userId: 'user_budi_santoso',
        userName: 'Budi Santoso',
        rating: 5,
        comment: 'Pelayanan yang sangat memuaskan! Surtiningsih adalah terapis pijat yang benar-benar ahli. Saya memiliki masalah dengan lutut yang sakit dan setelah sesi pijat 120 menit, rasa sakitnya berkurang drastis. Tekniknya sangat tepat dan profesional. Pasti akan menggunakan jasanya lagi!',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-12T10:15:00.000Z',
        isVerified: true,
        bookingId: 'booking_004'
    },
    {
        id: 'review_surtiningsih_005',
        providerId: '693cfadf003d16b9896a',
        providerType: 'therapist' as const,
        userId: 'user_emma_rodriguez',
        userName: 'Emma Rodriguez',
        rating: 5,
        comment: 'Outstanding massage therapist! Surtiningsih came to my villa and provided the most relaxing and therapeutic massage I\'ve ever had. Her technique is exceptional and she really knows how to work out muscle knots. The 90-minute session was perfect after my hiking activities. Highly professional and friendly!',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-15T17:30:00.000Z',
        isVerified: true,
        bookingId: 'booking_005'
    },
    {
        id: 'review_surtiningsih_006',
        providerId: '693cfadf003d16b9896a',
        providerType: 'therapist' as const,
        userId: 'user_david_chen',
        userName: 'David Chen',
        rating: 4,
        comment: 'Excellent professional massage service. Surtiningsih is very skilled and experienced. Had a 60-minute session at my hotel for my back pain and it helped tremendously. She was punctual, brought all her equipment, and created a very relaxing atmosphere. Would definitely book again when I return to Bali.',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-19T13:45:00.000Z',
        isVerified: true,
        bookingId: 'booking_006'
    }
];

// Wiwid's mock reviews
const wiwidMockReviews = [
    {
        id: 'review_wiwid_001',
        providerId: '694ed78e002b0c06171e',
        providerType: 'therapist' as const,
        userId: 'user_sophia_anderson',
        userName: 'Sophia Anderson',
        rating: 5,
        comment: 'Excellent massage! Very professional.',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-02T10:00:00.000Z',
        isVerified: true,
        bookingId: 'booking_wiwid_001'
    },
    {
        id: 'review_wiwid_002',
        providerId: '694ed78e002b0c06171e',
        providerType: 'therapist' as const,
        userId: 'user_ahmad_rahman',
        userName: 'Ahmad Rahman',
        rating: 5,
        comment: 'Pelayanan luar biasa! Wiwid sangat terampil dalam teknik pijat tradisional. Saya merasa jauh lebih baik setelah sesi 60 menit. Sangat direkomendasikan untuk relaksasi dan pemulihan otot.',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-06T14:20:00.000Z',
        isVerified: true,
        bookingId: 'booking_wiwid_002'
    },
    {
        id: 'review_wiwid_003',
        providerId: '694ed78e002b0c06171e',
        providerType: 'therapist' as const,
        userId: 'user_robert_taylor',
        userName: 'Robert Taylor',
        rating: 5,
        comment: 'Outstanding service from Wiwid! I booked a 90-minute deep tissue massage at my hotel in Yogyakarta. He was punctual, professional, and really knew how to work out the knots in my shoulders from travel. The pressure was perfect and I felt incredibly relaxed afterwards. Highly recommend!',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-09T16:30:00.000Z',
        isVerified: true,
        bookingId: 'booking_wiwid_003'
    },
    {
        id: 'review_wiwid_004',
        providerId: '694ed78e002b0c06171e',
        providerType: 'therapist' as const,
        userId: 'user_maya_kusuma',
        userName: 'Maya Kusuma',
        rating: 4,
        comment: 'Great technique and friendly service. Worth the booking!',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-13T11:15:00.000Z',
        isVerified: true,
        bookingId: 'booking_wiwid_004'
    },
    {
        id: 'review_wiwid_005',
        providerId: '694ed78e002b0c06171e',
        providerType: 'therapist' as const,
        userId: 'user_daniel_kim',
        userName: 'Daniel Kim',
        rating: 5,
        comment: 'Incredible massage experience! Wiwid came to my villa and provided one of the best therapeutic massages I\'ve had in Indonesia. Very skilled with traditional Indonesian techniques combined with sports massage. My back pain from hiking has completely disappeared. Professional, courteous, and excellent value.',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-16T09:45:00.000Z',
        isVerified: true,
        bookingId: 'booking_wiwid_005'
    },
    {
        id: 'review_wiwid_006',
        providerId: '694ed78e002b0c06171e',
        providerType: 'therapist' as const,
        userId: 'user_siti_rahayu',
        userName: 'Siti Rahayu',
        rating: 5,
        comment: 'Sangat puas dengan layanan Wiwid! Teknik pijetnya sangat baik dan membantu mengurangi nyeri punggung saya. Datang tepat waktu dan sangat profesional. Pasti akan booking lagi.',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-20T15:00:00.000Z',
        isVerified: true,
        bookingId: 'booking_wiwid_006'
    },
    {
        id: 'review_wiwid_007',
        providerId: '694ed78f9574395fd7b9',
        providerType: 'therapist' as const,
        userId: 'user_jennifer_lopez',
        userName: 'Jennifer Lopez',
        rating: 5,
        comment: 'Perfect session, exactly what I needed!',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-22T12:30:00.000Z',
        isVerified: true,
        bookingId: 'booking_wiwid_007'
    },
    {
        id: 'review_wiwid_008',
        providerId: '694ed78f9574395fd7b9',
        providerType: 'therapist' as const,
        userId: 'user_rudi_hartono',
        userName: 'Rudi Hartono',
        rating: 4,
        comment: 'Terapis yang baik dengan teknik yang solid. Pijatan sangat membantu untuk relaksasi setelah perjalanan panjang. Recommended!',
        location: 'Yogyakarta, Indonesia',
        createdAt: '2025-12-24T17:20:00.000Z',
        isVerified: true,
        bookingId: 'booking_wiwid_008'
    }
];

export interface Review {
    id: string;
    providerId: string | number;
    providerType: 'therapist' | 'place';
    userId: string;
    userName: string;
    rating: number; // 1-5 stars
    comment: string;
    createdAt: string;
    location?: string; // Location/city of the provider
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
        
        // Add Surtiningsih mock reviews if they don't exist
        this.initializeSurtiningsihReviews();
        
        // Add Wiwid mock reviews if they don't exist
        this.initializeWiwidReviews();
        
        // Initialize reviews for all Yogyakarta therapists
        this.initializeYogyakartaTherapistReviews();
    }

    /**
     * Initialize reviews for all Yogyakarta therapists if they don't have any
     */
    private initializeYogyakartaTherapistReviews(): void {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return; // Skip in SSR
        }
        
        // Get dynamic list of Yogyakarta therapists
        const yogyaTherapists = getYogyakartaTherapists();
        
        console.log(`🔄 Initializing reviews for ${yogyaTherapists.length} Yogyakarta therapists...`);
        
        const names = [
            'Sarah Mitchell', 'Budi Santoso', 'Emma Rodriguez', 'Ahmad Hidayat',
            'David Chen', 'Sari Wulandari', 'Michael Johnson', 'Dewi Lestari',
            'James Anderson', 'Rina Putri', 'Lisa Thompson', 'Agus Wijaya',
            'Tom Wilson', 'Maya Kusuma', 'Anna Schmidt', 'Rudi Hartono'
        ];
        
        // Unique comment templates for each therapist
        const commentSets = [
            // Set 1
            [
                'Excellent massage! Very professional and punctual.',
                'Amazing experience, highly recommend for back pain relief.',
                'Great service, will definitely book again soon.',
                'Fantastic technique and wonderful atmosphere throughout.',
                'Professional from start to finish, helped with muscle tension.'
            ],
            // Set 2
            [
                'Very relaxing experience with skilled hands.',
                'Outstanding therapist, knew exactly what I needed.',
                'Perfect pressure and timing, felt rejuvenated after.',
                'Incredible deep tissue work, my shoulders feel amazing.',
                'Wonderful massage in comfortable setting, very satisfied.'
            ],
            // Set 3
            [
                'Best massage I\'ve had in Indonesia! Truly exceptional.',
                'Highly skilled with traditional techniques combined well.',
                'Professional service, booking process was easy and smooth.',
                'Great value for money, will use again for sure.',
                'Exceeded expectations, therapist was friendly and expert.'
            ],
            // Set 4
            [
                'Remarkable experience! Pain relief was immediate and lasting.',
                'Very knowledgeable about different massage techniques.',
                'Convenient location service, came right to my hotel.',
                'Attentive to my specific needs and problem areas.',
                'Simply outstanding work, completely resolved my neck pain.'
            ]
        ];
        
        let totalAdded = 0;
        yogyaTherapists.forEach((therapist, therapistIndex) => {
            const existingReviews = this.reviews.filter(r => r.providerId === therapist.id);
            
            if (existingReviews.length === 0) {
                // Use unique comment set for each therapist (cycle through sets)
                const commentSet = commentSets[therapistIndex % commentSets.length];
                
                // Add 5 initial reviews for each therapist with unique comments
                const reviewsToAdd = commentSet.map((comment, i) => ({
                    id: `review_${therapist.id}_init_${i}`,
                    providerId: therapist.id,
                    providerType: 'therapist' as const,
                    userId: `user_init_${therapist.id}_${i}`,
                    userName: names[(therapistIndex * 3 + i) % names.length], // Unique name distribution
                    rating: Math.random() > 0.2 ? 5 : 4, // 80% 5-star
                    comment: comment,
                    location: 'Yogyakarta, Indonesia',
                    createdAt: new Date(Date.now() - (i * 86400000)).toISOString(), // Spread over days
                    isVerified: false
                }));
                
                this.reviews.push(...reviewsToAdd);
                totalAdded += reviewsToAdd.length;
            }
        });
        
        if (totalAdded > 0) {
            this.saveReviews();
            console.log(`✅ Initialized ${totalAdded} reviews for Yogyakarta therapists`);
        }
    }

    /**
     * Initialize Surtiningsih's mock reviews
     */
    private initializeSurtiningsihReviews(): void {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return; // Skip in SSR
        }
        
        const surtiningsihId = '693cfadf003d16b9896a';
        const existingReviews = this.reviews.filter(r => r.providerId === surtiningsihId);
        
        if (existingReviews.length === 0) {
            // Add all mock reviews for Surtiningsih
            this.reviews.push(...surtiningsihMockReviews);
            this.saveReviews();
            console.log('✅ Added 6 mock reviews for Surtiningsih');
        }
    }

    /**
     * Initialize Wiwid's mock reviews
     */
    private initializeWiwidReviews(): void {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return; // Skip in SSR
        }
        
        const wiwidId = '694ed78e002b0c06171e'; // ✅ FIXED: Correct Wiwid ID matching profile page
        const existingReviews = this.reviews.filter(r => r.providerId === wiwidId);
        
        if (existingReviews.length === 0) {
            // Add all mock reviews for Wiwid
            this.reviews.push(...wiwidMockReviews);
            this.saveReviews();
            console.log('✅ Added 8 mock reviews for Wiwid');
        }
    }

    /**
     * Load reviews from localStorage
     */
    private loadReviews(): void {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return; // Skip in SSR
        }
        try {
            const stored = localStorage.getItem(this.localStorageKey);
            if (stored) {
                this.reviews = JSON.parse(stored);
                console.log(`📋 Loaded ${this.reviews.length} reviews from localStorage`);
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
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return; // Skip in SSR
        }
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.reviews));
            console.log(`💾 Saved ${this.reviews.length} reviews to localStorage`);
        } catch (error) {
            // Handle QuotaExceededError by trimming old reviews
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.warn('⚠️ localStorage quota exceeded. Trimming old reviews...');
                
                // Keep only the last 500 reviews (most recent)
                const MAX_REVIEWS = 500;
                if (this.reviews.length > MAX_REVIEWS) {
                    const trimmedCount = this.reviews.length - MAX_REVIEWS;
                    this.reviews = this.reviews.slice(-MAX_REVIEWS);
                    console.log(`✂️ Trimmed ${trimmedCount} old reviews, keeping ${this.reviews.length} most recent`);
                    
                    // Retry saving with trimmed data
                    try {
                        localStorage.setItem(this.localStorageKey, JSON.stringify(this.reviews));
                        console.log(`💾 Successfully saved ${this.reviews.length} reviews after trimming`);
                    } catch (retryError) {
                        // If still failing, clear all auto-generated reviews and keep only real ones
                        console.warn('⚠️ Still exceeding quota. Removing auto-generated reviews...');
                        this.reviews = this.reviews.filter(r => !r.userId.startsWith('auto_'));
                        try {
                            localStorage.setItem(this.localStorageKey, JSON.stringify(this.reviews));
                            console.log(`💾 Saved ${this.reviews.length} real reviews (auto-reviews removed)`);
                        } catch (finalError) {
                            // Last resort: fail silently
                            console.error('❌ Unable to save reviews even after cleanup. Continuing without save.');
                        }
                    }
                } else {
                    // Already at or below max, can't trim further - fail silently
                    console.error('❌ localStorage quota exceeded with minimal reviews. Skipping save.');
                }
            } else {
                console.error('Error saving reviews:', error);
            }
        }
    }

    /**
     * Initialize a new provider with initial review data
     */
    initializeProvider(provider: Therapist | Place): Therapist | Place {
        // Handle both reviewCount and reviewcount field names (database uses lowercase)
        const reviewCount = provider.reviewCount || (provider as any).reviewcount;
        
        // Initialize if rating/reviewCount is null, undefined, or 0
        const needsInitialization = !provider.rating || provider.rating === 0 || 
                                   !reviewCount || reviewCount === 0;
                                   
        if (needsInitialization) {
            const initialData = generateInitialReviewData();
            console.log(`🎯 Initializing reviews for ${(provider as any).name}: ${initialData.rating} stars, ${initialData.reviewCount} reviews`);
            return {
                ...provider,
                rating: initialData.rating,
                reviewCount: initialData.reviewCount,
                // Also set the database field name if it exists
                ...(provider as any).reviewcount !== undefined && { reviewcount: initialData.reviewCount }
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
        location?: string,
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
            location: location, // No default - let caller specify
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
        } catch {
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

    /**
     * Get reviews for a specific provider (therapist or place)
     */
    getReviewsForProvider(
        providerId: string | number,
        providerType: 'therapist' | 'place',
        limit?: number
    ): Review[] {
        const providerReviews = this.reviews
            .filter(r => r.providerId === providerId && r.providerType === providerType)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return limit ? providerReviews.slice(0, limit) : providerReviews;
    }

    /**
     * Get reviews for Yogyakarta location (for showcase profiles)
     */
    getYogyakartaReviews(limit: number = 5): Review[] {
        // Get dynamic list of Yogyakarta therapist IDs
        const yogyaTherapistIds = getYogyakartaTherapists().map(t => t.id);
        
        const yogyaReviews = this.reviews
            .filter(r => yogyaTherapistIds.includes(r.providerId.toString()) && r.providerType === 'therapist')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
        
        return yogyaReviews;
    }
}

// Create singleton instance with lazy initialization
let reviewServiceInstance: ReviewService | null = null;

export const reviewService = (() => {
    if (typeof window !== 'undefined' && !reviewServiceInstance) {
        reviewServiceInstance = new ReviewService();
        console.log('✅ ReviewService initialized client-side');
    }
    return reviewServiceInstance || new ReviewService();
})();

// Export for use in other components
export default reviewService;
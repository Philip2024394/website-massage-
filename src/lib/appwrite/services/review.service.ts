/**
 * Reviews and ratings management
 * Extracted from monolithic appwriteService.ts for better maintainability
 */

import { databases, storage, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

export const reviewService = {
    async create(review: {
        providerId: string;
        providerType: 'therapist' | 'place';
        rating: number;
        reviewContent: string;
        reviewerId: string;
        userName?: string;
        userId?: string;
        status?: 'pending' | 'approved' | 'rejected';
    }): Promise<any> {
        try {
            const now = new Date().toISOString();
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                ID.unique(),
                {
                    reviewId: ID.unique(),
                    providerId: review.providerId,
                    providerType: review.providerType,
                    rating: review.rating,
                    reviewContent: review.reviewContent,
                    reviewerId: review.reviewerId,
                    reviewDate: now,
                    createdAt: now,
                    userName: review.userName || 'Anonymous',
                    userId: review.userId || null,
                    status: review.status || 'approved',
                    likes: 0,
                    comment: null
                }
            );
            console.log('✅ Review created successfully:', response.$id);
            return response;
        } catch (error) {
            console.error('❌ Error creating review:', error);
            throw error;
        }
    },

    async createAnonymous(review: {
        providerId: string;
        providerType: 'therapist' | 'place';
        rating: number;
        reviewerName: string;
        reviewContent: string;
    }): Promise<any> {
        try {
            const now = new Date().toISOString();
            const reviewerId = `anonymous_${Date.now()}`;
            
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                ID.unique(),
                {
                    reviewId: ID.unique(),
                    providerId: review.providerId,
                    providerType: review.providerType,
                    rating: review.rating,
                    reviewContent: review.reviewContent,
                    reviewerId: reviewerId,
                    reviewDate: now,
                    createdAt: now,
                    userName: review.reviewerName,
                    userId: null,
                    status: 'approved', // Auto-approve anonymous reviews
                    likes: 0,
                    comment: null
                }
            );
            console.log('✅ Anonymous review created successfully:', response.$id);
            
            // Update provider's average rating
            await this.updateProviderRating(review.providerId, review.providerType);
            
            return response;
        } catch (error) {
            console.error('❌ Error creating anonymous review:', error);
            throw error;
        }
    },

    async updateProviderRating(providerId: string | number, providerType: 'therapist' | 'place'): Promise<void> {
        try {
            // Get all approved reviews for this provider
            const reviews = await this.getByProvider(Number(providerId), providerType);
            
            if (reviews.length === 0) return;
            
            // Calculate average rating
            const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
            const averageRating = totalRating / reviews.length;
            const roundedRating = Math.round(averageRating * 10) / 10; // Round to 1 decimal
            
            console.log(`📊 Updating ${providerType} ${providerId} rating: ${roundedRating} (from ${reviews.length} reviews)`);
            
            // Update the provider's rating
            const collectionId = providerType === 'therapist' 
                ? APPWRITE_CONFIG.collections.therapists 
                : APPWRITE_CONFIG.collections.places;
            
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                String(providerId),
                {
                    rating: roundedRating,
                    reviewCount: reviews.length
                }
            );
            
            console.log(`✅ Updated ${providerType} rating to ${roundedRating}`);
        } catch (error) {
            console.error('❌ Error updating provider rating:', error);
            // Don't throw - rating update failure shouldn't prevent review submission
        }
    },

    async getAll(): Promise<any[]> {
        try {
            // Check if reviews collection is disabled
            const reviewsCollection = APPWRITE_CONFIG.collections.reviews;
            if (!reviewsCollection) {
                console.log('🔄 Reviews collection disabled, returning empty array');
                return [];
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                reviewsCollection
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    },

    /** Latest approved reviews across all providers (for “Latest Reviews” page). Order: newest first. */
    async getLatest(limit: number = 50): Promise<any[]> {
        try {
            const reviewsCollection = APPWRITE_CONFIG.collections.reviews;
            if (!reviewsCollection) return [];
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                reviewsCollection,
                [
                    Query.equal('status', 'approved'),
                    Query.orderDesc('reviewDate'),
                    Query.limit(Math.min(limit, 100))
                ]
            );
            return response.documents || [];
        } catch (error) {
            console.error('Error fetching latest reviews:', error);
            return [];
        }
    },

    async getByProvider(providerId: string | number, providerType: 'therapist' | 'place'): Promise<any[]> {
        try {
            // Check if reviews collection is disabled
            const reviewsCollection = APPWRITE_CONFIG.collections.reviews;
            if (!reviewsCollection) {
                console.log('🔄 Reviews collection disabled, returning empty array');
                return [];
            }
            
            // Validate providerId is not null
            if (!providerId) {
                console.error('❌ Invalid providerId (null/undefined), cannot fetch reviews');
                return [];
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                reviewsCollection,
                [
                    Query.equal('providerId', String(providerId)),
                    Query.equal('providerType', providerType),
                    Query.equal('status', 'approved'),
                    Query.orderDesc('reviewDate')
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching provider reviews:', error);
            return [];
        }
    },

    async updateStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                reviewId,
                { status }
            );
            console.log(`✅ Review ${reviewId} ${status}`);
            return response;
        } catch (error) {
            console.error(`Error updating review status to ${status}:`, error);
            throw error;
        }
    },

    async delete(reviewId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                reviewId
            );
            console.log('✅ Review deleted:', reviewId);
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    }
};

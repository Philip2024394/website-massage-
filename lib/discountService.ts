import { databases } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { ID, Query } from 'appwrite';

// Collection ID for active discounts
export const ACTIVE_DISCOUNTS_COLLECTION_ID = 'active_discounts';
const DATABASE_ID = APPWRITE_CONFIG.databaseId;

export interface ActiveDiscount {
    $id?: string;
    providerId: string;
    providerName: string;
    providerType: 'therapist' | 'place';
    percentage: number;
    expiresAt: string; // ISO date string
    duration: number; // hours
    activatedAt: string; // ISO date string
    imageUrl: string;
    location?: string;
    rating?: number;
    profilePicture?: string;
}

/**
 * Activate a discount for a provider
 */
export const activateDiscount = async (
    providerId: string,
    providerName: string,
    providerType: 'therapist' | 'place',
    percentage: number,
    duration: number,
    imageUrl: string,
    location?: string,
    rating?: number,
    profilePicture?: string
): Promise<ActiveDiscount> => {
    try {
        // First, check if provider already has an active discount
        const existing = await getActiveDiscountByProvider(providerId, providerType);
        if (existing) {
            // Deactivate the existing one first
            await deactivateDiscount(existing.$id!);
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000);

        const discount = await databases.createDocument(
            DATABASE_ID,
            ACTIVE_DISCOUNTS_COLLECTION_ID,
            ID.unique(),
            {
                providerId,
                providerName,
                providerType,
                percentage,
                expiresAt: expiresAt.toISOString(),
                duration,
                activatedAt: now.toISOString(),
                imageUrl,
                location: location || '',
                rating: rating || 0,
                profilePicture: profilePicture || ''
            }
        );

        return discount as unknown as ActiveDiscount;
    } catch (error) {
        console.error('Error activating discount:', error);
        throw error;
    }
};

/**
 * Deactivate a discount
 */
export const deactivateDiscount = async (discountId: string): Promise<void> => {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            ACTIVE_DISCOUNTS_COLLECTION_ID,
            discountId
        );
    } catch (error) {
        console.error('Error deactivating discount:', error);
        throw error;
    }
};

/**
 * Get active discount for a specific provider
 */
export const getActiveDiscountByProvider = async (
    providerId: string,
    providerType: 'therapist' | 'place'
): Promise<ActiveDiscount | null> => {
    try {
        const now = new Date().toISOString();
        const response = await databases.listDocuments(
            DATABASE_ID,
            ACTIVE_DISCOUNTS_COLLECTION_ID,
            [
                Query.equal('providerId', providerId),
                Query.equal('providerType', providerType),
                Query.greaterThan('expiresAt', now),
                Query.limit(1)
            ]
        );

        if (response.documents.length > 0) {
            return response.documents[0] as unknown as ActiveDiscount;
        }
        return null;
    } catch (error) {
        console.error('Error fetching provider discount:', error);
        return null;
    }
};

/**
 * Get all active discounts (not expired)
 */
export const getAllActiveDiscounts = async (): Promise<ActiveDiscount[]> => {
    try {
        const now = new Date().toISOString();
        const response = await databases.listDocuments(
            DATABASE_ID,
            ACTIVE_DISCOUNTS_COLLECTION_ID,
            [
                Query.greaterThan('expiresAt', now),
                Query.orderDesc('activatedAt'),
                Query.limit(100)
            ]
        );

        return response.documents as unknown as ActiveDiscount[];
    } catch (error) {
        console.error('Error fetching active discounts:', error);
        return [];
    }
};

/**
 * Subscribe to real-time discount updates
 */
export const subscribeToDiscounts = (
    callback: (discounts: ActiveDiscount[]) => void
): (() => void) => {
    // Initial fetch
    getAllActiveDiscounts().then(callback);

    // Set up real-time subscription
    const unsubscribe = databases.client.subscribe(
        `databases.${DATABASE_ID}.collections.${ACTIVE_DISCOUNTS_COLLECTION_ID}.documents`,
        () => {
            // Refetch all discounts on any change
            getAllActiveDiscounts().then(callback);
        }
    );

    // Return cleanup function
    return () => {
        if (typeof unsubscribe === 'function') {
            unsubscribe();
        }
    };
};

/**
 * Clean up expired discounts (can be called periodically)
 */
export const cleanupExpiredDiscounts = async (): Promise<number> => {
    try {
        const now = new Date().toISOString();
        const response = await databases.listDocuments(
            DATABASE_ID,
            ACTIVE_DISCOUNTS_COLLECTION_ID,
            [
                Query.lessThan('expiresAt', now),
                Query.limit(100)
            ]
        );

        let deletedCount = 0;
        for (const doc of response.documents) {
            await databases.deleteDocument(
                DATABASE_ID,
                ACTIVE_DISCOUNTS_COLLECTION_ID,
                doc.$id
            );
            deletedCount++;
        }

        return deletedCount;
    } catch (error) {
        console.error('Error cleaning up expired discounts:', error);
        return 0;
    }
};

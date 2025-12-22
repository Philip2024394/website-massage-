/**
 * Discount Codes Service
 * Manages discount code generation, validation, and redemption
 */

import { databases, DATABASE_ID } from '../config';
import { ID, Query } from 'appwrite';

export const DISCOUNT_CODES_COLLECTION_ID = 'discount_codes';

export interface DiscountCode {
    $id?: string;
    code: string;
    description?: string;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    usageLimit?: number;
    memberId: string;
    memberName: string;
    memberType: 'therapist' | 'massage-place' | 'facial-place';
    customerId?: string;
    customerName: string;
    percentage: number;
    bannerUrl: string;
    message?: string;
    expiresAt: string;
    used: boolean;
    usedAt?: string;
    createdAt?: string;
}

/**
 * Generate unique discount code
 */
export function generateDiscountCode(
    memberType: string,
    memberId: string,
    percentage: number
): string {
    const prefix = memberType === 'therapist' ? 'TH' : 
                   memberType === 'facial-place' ? 'FC' : 'MP';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const memberShort = memberId.substring(0, 4).toUpperCase();
    return `${prefix}${percentage}-${memberShort}-${random}`;
}

/**
 * Create a new discount code
 */
export async function createDiscountCode(
    memberId: string,
    memberName: string,
    memberType: 'therapist' | 'massage-place' | 'facial-place',
    customerId: string,
    customerName: string,
    percentage: number,
    bannerUrl: string,
    message?: string
): Promise<DiscountCode> {
    try {
        const code = generateDiscountCode(memberType, memberId, percentage);
        
        // Set expiry to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        // Start date is now
        const startDate = new Date();
        
        const discountCode = await databases.createDocument(
            DATABASE_ID,
            DISCOUNT_CODES_COLLECTION_ID,
            ID.unique(),
            {
                code,
                description: `${percentage}% discount for ${customerName}`,
                discountPercentage: percentage,
                startDate: startDate.toISOString(),
                endDate: expiresAt.toISOString(),
                isActive: true,
                usageLimit: 1,
                memberId,
                memberName,
                memberType,
                customerId: customerId || '',
                customerName,
                percentage,
                bannerUrl,
                message: message || '',
                expiresAt: expiresAt.toISOString(),
                used: false,
                createdAt: new Date().toISOString()
            }
        );
        
        return discountCode as DiscountCode;
    } catch (error) {
        console.error('Error creating discount code:', error);
        throw error;
    }
}

/**
 * Get discount code by code string
 */
export async function getDiscountByCode(code: string): Promise<DiscountCode | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            DISCOUNT_CODES_COLLECTION_ID,
            [
                Query.equal('code', code),
                Query.limit(1)
            ]
        );
        
        return response.documents.length > 0 ? response.documents[0] as DiscountCode : null;
    } catch (error) {
        console.error('Error fetching discount code:', error);
        return null;
    }
}

/**
 * Get customer's available discounts
 */
export async function getCustomerDiscounts(customerId: string): Promise<DiscountCode[]> {
    try {
        const now = new Date().toISOString();
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            DISCOUNT_CODES_COLLECTION_ID,
            [
                Query.equal('customerId', customerId),
                Query.equal('used', false),
                Query.equal('isActive', true),
                Query.greaterThan('endDate', now),
                Query.orderDesc('createdAt'),
                Query.limit(50)
            ]
        );
        
        return response.documents as DiscountCode[];
    } catch (error) {
        console.error('Error fetching customer discounts:', error);
        return [];
    }
}

/**
 * Get member's sent discounts
 */
export async function getMemberDiscounts(
    memberId: string,
    includeUsed: boolean = false
): Promise<DiscountCode[]> {
    try {
        const queries = [
            Query.equal('memberId', memberId),
            Query.orderDesc('createdAt'),
            Query.limit(100)
        ];
        
        if (!includeUsed) {
            queries.push(Query.equal('used', false));
        }
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            DISCOUNT_CODES_COLLECTION_ID,
            queries
        );
        
        return response.documents as DiscountCode[];
    } catch (error) {
        console.error('Error fetching member discounts:', error);
        return [];
    }
}

/**
 * Validate and use discount code
 * @param bookingMemberId - ID of the member the customer is booking with
 * @param bookingMemberType - Type of member (therapist/massage-place/facial-place)
 */
export async function useDiscountCode(
    code: string,
    customerId: string,
    bookingMemberId?: string,
    bookingMemberType?: 'therapist' | 'massage-place' | 'facial-place'
): Promise<{ valid: boolean; discount?: DiscountCode; error?: string }> {
    try {
        const discount = await getDiscountByCode(code);
        
        if (!discount) {
            return { valid: false, error: 'Invalid discount code' };
        }

        if (!discount.isActive) {
            return { valid: false, error: 'This discount code is no longer active' };
        }
        
        // ⭐ CRITICAL: Verify discount is for the correct member
        if (bookingMemberId && discount.memberId !== bookingMemberId) {
            return { 
                valid: false, 
                error: `This discount is only valid with ${discount.memberName}. Cannot be used with other members.` 
            };
        }
        
        // ⭐ CRITICAL: Verify discount is for the correct member type
        if (bookingMemberType && discount.memberType !== bookingMemberType) {
            const typeLabel = discount.memberType === 'therapist' ? 'therapist' :
                            discount.memberType === 'facial-place' ? 'facial place' : 'massage place';
            return { 
                valid: false, 
                error: `This discount is only valid for ${typeLabel} services.` 
            };
        }
        
        if (discount.customerId && discount.customerId !== customerId) {
            return { valid: false, error: 'This discount code is not for your account' };
        }
        
        if (discount.used) {
            return { valid: false, error: 'This discount code has already been used' };
        }
        
        const now = new Date();
        const expiryDate = new Date(discount.endDate);
        
        if (now > expiryDate) {
            return { valid: false, error: 'This discount code has expired' };
        }
        
        // Mark as used
        await databases.updateDocument(
            DATABASE_ID,
            DISCOUNT_CODES_COLLECTION_ID,
            discount.$id!,
            {
                used: true,
                usedAt: new Date().toISOString(),
                isActive: false
            }
        );
        
        return { valid: true, discount };
    } catch (error) {
        console.error('Error using discount code:', error);
        return { valid: false, error: 'Failed to apply discount code' };
    }
}

/**
 * Get discount statistics for member
 */
export async function getDiscountStats(memberId: string): Promise<{
    totalSent: number;
    totalUsed: number;
    totalExpired: number;
    redemptionRate: number;
}> {
    try {
        const allDiscounts = await getMemberDiscounts(memberId, true);
        const now = new Date();
        
        const totalSent = allDiscounts.length;
        const totalUsed = allDiscounts.filter(d => d.used).length;
        const totalExpired = allDiscounts.filter(d => 
            !d.used && new Date(d.endDate) < now
        ).length;
        const redemptionRate = totalSent > 0 ? (totalUsed / totalSent) * 100 : 0;
        
        return {
            totalSent,
            totalUsed,
            totalExpired,
            redemptionRate: Math.round(redemptionRate)
        };
    } catch (error) {
        console.error('Error calculating discount stats:', error);
        return {
            totalSent: 0,
            totalUsed: 0,
            totalExpired: 0,
            redemptionRate: 0
        };
    }
}

/**
 * Delete expired discount codes (cleanup)
 */
export async function cleanupExpiredDiscounts(): Promise<number> {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            DISCOUNT_CODES_COLLECTION_ID,
            [
                Query.lessThan('endDate', thirtyDaysAgo.toISOString()),
                Query.limit(100)
            ]
        );

        let deletedCount = 0;
        for (const doc of response.documents) {
            try {
                await databases.deleteDocument(
                    DATABASE_ID,
                    DISCOUNT_CODES_COLLECTION_ID,
                    doc.$id
                );
                deletedCount++;
            } catch (error) {
                console.error(`Error deleting discount ${doc.$id}:`, error);
            }
        }
        
        return deletedCount;
    } catch (error) {
        console.error('Error cleaning up expired discounts:', error);
        return 0;
    }
}

/**
 * Validate discount code WITHOUT redeeming it (for checkout preview)
 * @param bookingMemberId - ID of the member the customer is booking with
 * @param bookingMemberType - Type of member (therapist/massage-place/facial-place)
 */
export async function validateDiscountCode(
    code: string,
    customerId: string,
    bookingMemberId: string,
    bookingMemberType: 'therapist' | 'massage-place' | 'facial-place'
): Promise<{ valid: boolean; discount?: DiscountCode; error?: string }> {
    try {
        const discount = await getDiscountByCode(code);
        
        if (!discount) {
            return { valid: false, error: 'Invalid discount code' };
        }

        if (!discount.isActive) {
            return { valid: false, error: 'This discount code is no longer active' };
        }
        
        // ⭐ CRITICAL: Verify discount is for the correct member
        if (discount.memberId !== bookingMemberId) {
            return { 
                valid: false, 
                error: `❌ This discount is only valid with ${discount.memberName}. Cannot be used with other members.` 
            };
        }
        
        // ⭐ CRITICAL: Verify discount is for the correct member type
        if (discount.memberType !== bookingMemberType) {
            const typeLabel = discount.memberType === 'therapist' ? 'therapist' :
                            discount.memberType === 'facial-place' ? 'facial place' : 'massage place';
            return { 
                valid: false, 
                error: `❌ This discount is only valid for ${typeLabel} services.` 
            };
        }
        
        if (discount.customerId && discount.customerId !== customerId) {
            return { valid: false, error: 'This discount code is not for your account' };
        }
        
        if (discount.used) {
            return { valid: false, error: 'This discount code has already been used' };
        }
        
        const now = new Date();
        const expiryDate = new Date(discount.endDate);
        
        if (now > expiryDate) {
            return { valid: false, error: 'This discount code has expired' };
        }
        
        // Return valid WITHOUT marking as used
        return { valid: true, discount };
    } catch (error) {
        console.error('Error validating discount code:', error);
        return { valid: false, error: 'Failed to validate discount code' };
    }
}

/**
 * Clean up expired discount codes
 */
export async function cleanupExpiredDiscounts(): Promise<number> {
    try {
        const databases = new Databases(client);
        const now = new Date().toISOString();

        const response = await databases.listDocuments(
            DATABASE_ID,
            DISCOUNTS_COLLECTION_ID,
            [
                Query.lessThan('validUntil', now),
                Query.equal('isUsed', false)
            ]
        );

        let deletedCount = 0;
        for (const discount of response.documents) {
            await databases.deleteDocument(
                DATABASE_ID,
                DISCOUNTS_COLLECTION_ID,
                discount.$id
            );
            deletedCount++;
        }

        return deletedCount;
    } catch (error) {
        console.error('Error cleaning up expired discounts:', error);
        return 0;
    }
}

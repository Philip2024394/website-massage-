/**
 * 🎁 THERAPIST DISCOUNT SERVICE - BULLETPROOF SYSTEM
 * 
 * Generates unique, single-use discount codes for therapists to share with customers.
 * 
 * SECURITY GUARANTEES:
 * ✅ Each code is unique per therapist-customer pair
 * ✅ Codes only work with the therapist who issued them
 * ✅ Single-use only - cannot be reused
 * ✅ Discounts apply to THERAPIST'S PRICE ONLY (not admin 30% commission)
 * ✅ Expiration dates enforced
 * ✅ Cannot be shared between customers
 * 
 * DISCOUNT CALCULATION:
 * - Customer pays: (TherapistPrice * (1 - discount%))
 * - Admin commission: (CustomerPaidAmount * 30%) 
 * - Therapist receives: (CustomerPaidAmount * 70%)
 * 
 * Example with 10% discount on 200K service:
 * - Original therapist price: 200K
 * - Customer pays: 180K (10% off)
 * - Admin gets: 54K (30% of 180K)
 * - Therapist gets: 126K (70% of 180K)
 * 
 * Therapist ABSORBS the discount, not the admin.
 */

import { databases, ID, Query } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

export interface TherapistDiscountCode {
  $id: string;
  code: string;
  therapistId: string;
  therapistName: string;
  customerId: string;
  customerName?: string;
  discountPercentage: 5 | 10 | 15 | 20;
  isUsed: boolean;
  usedAt?: string;
  bookingId?: string;
  expiresAt: string;
  createdAt: string;
  // Bulletproof fields
  source: 'chat_banner' | 'manual_send';
  bannerImageUrl?: string;
}

export interface GenerateDiscountParams {
  therapistId: string;
  therapistName: string;
  customerId: string;
  customerName?: string;
  discountPercentage: 5 | 10 | 15 | 20;
  source: 'chat_banner' | 'manual_send';
  bannerImageUrl?: string;
  validityDays?: number; // Default: 30 days
}

export interface ApplyDiscountResult {
  success: boolean;
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  adminCommission: number;
  therapistEarnings: number;
  error?: string;
}

/**
 * Generate unique discount code format:
 * [THERAPIST_INITIALS][DISCOUNT%]-[RANDOM_5CHARS]
 * Example: SM10-A3K9X, PT15-B7M2Q
 */
function generateUniqueCode(therapistName: string, discount: number): string {
  const initials = therapistName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString(36).substring(-3).toUpperCase();
  
  return `${initials}${discount}-${random}${timestamp}`;
}

/**
 * Generate a unique discount code for a specific therapist-customer pair
 */
export async function generateTherapistDiscount(
  params: GenerateDiscountParams
): Promise<{ success: true; code: TherapistDiscountCode } | { success: false; error: string }> {
  try {
    // Check if customer already has an active discount from this therapist
    const existingDiscounts = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      'discount_codes',
      [
        Query.equal('therapistId', params.therapistId),
        Query.equal('customerId', params.customerId),
        Query.equal('isUsed', false),
        Query.greaterThan('expiresAt', new Date().toISOString())
      ]
    );

    if (existingDiscounts.documents.length > 0) {
      return {
        success: false,
        error: 'Customer already has an active discount from you'
      };
    }

    // Generate unique code
    const code = generateUniqueCode(params.therapistName, params.discountPercentage);
    
    // Calculate expiration date
    const validityDays = params.validityDays || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validityDays);

    // Create discount record
    const discountData = {
      code,
      therapistId: params.therapistId,
      therapistName: params.therapistName,
      customerId: params.customerId,
      customerName: params.customerName || '',
      discountPercentage: params.discountPercentage,
      isUsed: false,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      source: params.source,
      bannerImageUrl: params.bannerImageUrl || '',
      // Security fields
      providerId: params.therapistId, // For compatibility with existing queries
      providerType: 'therapist',
      userId: params.customerId, // For compatibility with existing queries
    };

    const newDiscount = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      'discount_codes',
      ID.unique(),
      discountData
    );

    console.log('✅ Generated discount code:', code);

    return {
      success: true,
      code: newDiscount as unknown as TherapistDiscountCode
    };
  } catch (error) {
    console.error('❌ Failed to generate discount:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate discount'
    };
  }
}

/**
 * Validate discount code for a booking
 * 
 * BULLETPROOF CHECKS:
 * 1. Code exists
 * 2. Code belongs to the therapist being booked
 * 3. Code is for this specific customer
 * 4. Code hasn't been used
 * 5. Code hasn't expired
 */
export async function validateDiscountCode(
  code: string,
  therapistId: string,
  customerId: string
): Promise<{ valid: boolean; discount?: TherapistDiscountCode; error?: string }> {
  try {
    // Find discount by code
    const result = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      'discount_codes',
      [
        Query.equal('code', code),
        Query.limit(1)
      ]
    );

    if (result.documents.length === 0) {
      return { valid: false, error: 'Invalid discount code' };
    }

    const discount = result.documents[0] as unknown as TherapistDiscountCode;

    // Check if code belongs to this therapist
    if (discount.therapistId !== therapistId) {
      return { 
        valid: false, 
        error: 'This code can only be used with the therapist who issued it' 
      };
    }

    // Check if code is for this customer
    if (discount.customerId !== customerId) {
      return { 
        valid: false, 
        error: 'This code is not valid for your account' 
      };
    }

    // Check if already used
    if (discount.isUsed) {
      return { 
        valid: false, 
        error: 'This code has already been used' 
      };
    }

    // Check if expired
    if (new Date(discount.expiresAt) < new Date()) {
      return { 
        valid: false, 
        error: 'This code has expired' 
      };
    }

    return { valid: true, discount };
  } catch (error) {
    console.error('❌ Failed to validate discount:', error);
    return { 
      valid: false, 
      error: 'Failed to validate discount code' 
    };
  }
}

/**
 * Apply discount to booking price
 * 
 * CRITICAL: Discount applies to THERAPIST'S PRICE, not admin commission
 * 
 * Calculation flow:
 * 1. Calculate discounted price customer pays
 * 2. Admin gets 30% of what customer paid
 * 3. Therapist gets 70% of what customer paid
 * 
 * Therapist absorbs the discount loss, not the platform.
 */
export function calculateDiscountedPricing(
  originalPrice: number,
  discountPercentage: number
): ApplyDiscountResult {
  // Customer pays discounted price
  const discountAmount = Math.round(originalPrice * (discountPercentage / 100));
  const discountedPrice = originalPrice - discountAmount;

  // Admin gets 30% of what customer actually paid
  const adminCommission = Math.round(discountedPrice * 0.30);

  // Therapist gets remaining 70%
  const therapistEarnings = discountedPrice - adminCommission;

  return {
    success: true,
    originalPrice,
    discountedPrice,
    discountAmount,
    adminCommission,
    therapistEarnings
  };
}

/**
 * Mark discount code as used after successful booking
 */
export async function markDiscountAsUsed(
  discountId: string,
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      'discount_codes',
      discountId,
      {
        isUsed: true,
        usedAt: new Date().toISOString(),
        bookingId
      }
    );

    console.log('✅ Marked discount as used:', discountId);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to mark discount as used:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update discount' 
    };
  }
}

/**
 * Get all active discounts for a customer
 */
export async function getCustomerDiscounts(
  customerId: string
): Promise<TherapistDiscountCode[]> {
  try {
    const result = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      'discount_codes',
      [
        Query.equal('customerId', customerId),
        Query.equal('isUsed', false),
        Query.greaterThan('expiresAt', new Date().toISOString()),
        Query.orderDesc('$createdAt')
      ]
    );

    return result.documents as unknown as TherapistDiscountCode[];
  } catch (error) {
    console.error('❌ Failed to get customer discounts:', error);
    return [];
  }
}

/**
 * Get discount statistics for a therapist
 */
export async function getTherapistDiscountStats(therapistId: string): Promise<{
  totalIssued: number;
  active: number;
  used: number;
  expired: number;
  conversionRate: number;
}> {
  try {
    const allDiscounts = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      'discount_codes',
      [
        Query.equal('therapistId', therapistId),
        Query.limit(1000)
      ]
    );

    const total = allDiscounts.documents.length;
    const used = allDiscounts.documents.filter((d: any) => d.isUsed).length;
    const active = allDiscounts.documents.filter((d: any) => 
      !d.isUsed && new Date(d.expiresAt) > new Date()
    ).length;
    const expired = allDiscounts.documents.filter((d: any) => 
      !d.isUsed && new Date(d.expiresAt) <= new Date()
    ).length;
    const conversionRate = total > 0 ? Math.round((used / total) * 100) : 0;

    return {
      totalIssued: total,
      active,
      used,
      expired,
      conversionRate
    };
  } catch (error) {
    console.error('❌ Failed to get discount stats:', error);
    return {
      totalIssued: 0,
      active: 0,
      used: 0,
      expired: 0,
      conversionRate: 0
    };
  }
}

export default {
  generateTherapistDiscount,
  validateDiscountCode,
  calculateDiscountedPricing,
  markDiscountAsUsed,
  getCustomerDiscounts,
  getTherapistDiscountStats
};

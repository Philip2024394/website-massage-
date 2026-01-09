/**
 * ============================================================================
 * 🎁 DISCOUNT REWARD SERVICE
 * ============================================================================
 * 
 * Client-side service for therapists/places to send discount rewards
 * to customers who left reviews.
 * 
 * Features:
 * - Discount percentage selection (predefined options only)
 * - Validity period selection (predefined options only)
 * - NO manual text input (all codes are system-generated)
 * - Discount sent to: User chat + User rewards section
 * 
 * Usage:
 * ```typescript
 * import { sendReviewDiscount, DISCOUNT_OPTIONS, VALIDITY_OPTIONS } from '@/lib/services/discountRewardService';
 * 
 * // In your component:
 * const result = await sendReviewDiscount({
 *   reviewId: 'review-abc123',
 *   providerId: 'therapist-123',
 *   providerType: 'therapist',
 *   providerName: 'Sarah',
 *   userId: 'user-456',
 *   userName: 'John',
 *   discountPercentage: 10, // Must be from DISCOUNT_OPTIONS
 *   validityDays: 14,       // Must be from VALIDITY_OPTIONS
 * });
 * 
 * if (result.success) {
 *   console.log('Discount sent!', result.code);
 * }
 * ```
 */

import { Client, Functions } from 'appwrite';

// ============================================================================
// CONFIGURATION
// ============================================================================

const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const DATABASE_ID = '68f76ee1000e64ca8d05';

// ============================================================================
// TYPES
// ============================================================================

export interface DiscountRewardInput {
  /** Review ID that this discount is thanking */
  reviewId: string;
  
  /** Provider (therapist/place) details */
  providerId: string;
  providerType: 'therapist' | 'place';
  providerName: string;
  
  /** User (reviewer) details */
  userId: string;
  userName?: string;
  
  /** Discount settings (must be from predefined options) */
  discountPercentage: DiscountPercentage;
  validityDays: ValidityPeriod;
}

export interface DiscountRewardResult {
  success: boolean;
  discountId?: string;
  code?: string;
  discountPercentage?: number;
  expiresAt?: string;
  message?: string;
  error?: string;
}

// ============================================================================
// PREDEFINED OPTIONS (No manual input allowed)
// ============================================================================

/** Available discount percentages */
export const DISCOUNT_OPTIONS = [5, 10, 15, 20, 25, 30] as const;
export type DiscountPercentage = typeof DISCOUNT_OPTIONS[number];

/** Available validity periods (in days) */
export const VALIDITY_OPTIONS = [7, 14, 30, 60, 90] as const;
export type ValidityPeriod = typeof VALIDITY_OPTIONS[number];

/** Display labels for discount options */
export const DISCOUNT_LABELS: Record<DiscountPercentage, string> = {
  5: '5% off',
  10: '10% off',
  15: '15% off',
  20: '20% off',
  25: '25% off',
  30: '30% off (Max)',
};

/** Display labels for validity options */
export const VALIDITY_LABELS: Record<ValidityPeriod, string> = {
  7: '1 week',
  14: '2 weeks',
  30: '1 month',
  60: '2 months',
  90: '3 months',
};

// ============================================================================
// SERVER FUNCTION EXECUTION
// ============================================================================

const FUNCTION_ID = 'sendReviewDiscount';

/**
 * Send a discount reward to a customer who left a review.
 * 
 * The discount code is SYSTEM-GENERATED - no manual text input.
 * Therapist only selects percentage and validity period.
 * 
 * Discount is sent to:
 * 1. User's chat (as a banner message)
 * 2. User's rewards section (Account → Rewards)
 * 3. User's notifications
 */
export async function sendReviewDiscount(
  input: DiscountRewardInput
): Promise<DiscountRewardResult> {
  console.log('🎁 [DiscountRewardService] Sending discount...', {
    reviewId: input.reviewId,
    providerId: input.providerId,
    percentage: input.discountPercentage,
    days: input.validityDays,
  });
  
  // Validate percentage is from predefined options
  if (!DISCOUNT_OPTIONS.includes(input.discountPercentage)) {
    console.error('❌ Invalid discount percentage:', input.discountPercentage);
    return {
      success: false,
      error: 'INVALID_PERCENTAGE',
      message: `Invalid discount percentage. Choose from: ${DISCOUNT_OPTIONS.join(', ')}%`,
    };
  }
  
  // Validate validity is from predefined options
  if (!VALIDITY_OPTIONS.includes(input.validityDays)) {
    console.error('❌ Invalid validity period:', input.validityDays);
    return {
      success: false,
      error: 'INVALID_PERIOD',
      message: `Invalid validity period. Choose from: ${VALIDITY_OPTIONS.join(', ')} days`,
    };
  }
  
  try {
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    
    const functions = new Functions(client);
    
    const execution = await functions.createExecution(
      FUNCTION_ID,
      JSON.stringify({
        reviewId: input.reviewId,
        providerId: input.providerId,
        providerType: input.providerType,
        providerName: input.providerName,
        userId: input.userId,
        userName: input.userName,
        discountPercentage: input.discountPercentage,
        validityDays: input.validityDays,
      }),
      false // async = false (wait for result)
    );
    
    console.log('📬 [DiscountRewardService] Execution result:', execution.status);
    
    // Parse response
    const response = JSON.parse(execution.responseBody || '{}');
    
    if (response.success) {
      console.log('✅ [DiscountRewardService] Discount sent!', {
        code: response.code,
        discountId: response.discountId,
        expiresAt: response.expiresAt,
      });
      
      return {
        success: true,
        discountId: response.discountId,
        code: response.code,
        discountPercentage: response.discountPercentage,
        expiresAt: response.expiresAt,
        message: response.message,
      };
    } else {
      console.error('❌ [DiscountRewardService] Server error:', response.error);
      return {
        success: false,
        error: response.error,
        message: response.message,
      };
    }
  } catch (err) {
    console.error('❌ [DiscountRewardService] Execution failed:', err);
    
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Could not send discount. Please try again.',
    };
  }
}

// ============================================================================
// HELPER: Check if discount already sent for review
// ============================================================================

/**
 * Check if a discount has already been sent for a specific review.
 * Use this to disable the "Send Discount" button.
 */
export async function hasDiscountBeenSent(reviewId: string): Promise<boolean> {
  try {
    const { Databases, Query } = await import('appwrite');
    
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    
    const databases = new Databases(client);
    
    const result = await databases.listDocuments(
      DATABASE_ID,
      'discount_codes',
      [
        Query.equal('reviewId', reviewId),
        Query.limit(1),
      ]
    );
    
    return result.documents.length > 0;
  } catch {
    // If collection doesn't exist or query fails, assume no discount sent
    return false;
  }
}

// ============================================================================
// HELPER: Calculate expiry date for display
// ============================================================================

export function calculateExpiryDate(validityDays: ValidityPeriod): Date {
  return new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
}

export function formatExpiryDate(validityDays: ValidityPeriod): string {
  const expiry = calculateExpiryDate(validityDays);
  return expiry.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

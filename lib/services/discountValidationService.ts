/**
 * ============================================================================
 * 🎫 DISCOUNT VALIDATION SERVICE
 * ============================================================================
 * 
 * Client-side service for validating and redeeming discount codes.
 * Routes through server-side Appwrite Function for security.
 * 
 * Usage:
 * ```typescript
 * import { validateDiscountCode, redeemDiscountCode } from '@/lib/services/discountValidationService';
 * 
 * // Validate a code (check if valid, get percentage)
 * const result = await validateDiscountCode('SARAH-A7B3-K9M2', {
 *   userId: 'user123',      // Optional: verify code is for this user
 *   providerId: 'therapist456' // Optional: verify code is for this provider
 * });
 * 
 * if (result.valid) {
 *   console.log(`Discount: ${result.discountPercentage}%`);
 * }
 * 
 * // Redeem a code (mark as used)
 * const redeemResult = await redeemDiscountCode('SARAH-A7B3-K9M2', 'booking789');
 * ```
 */

import { Client, Functions } from 'appwrite';

// ============================================================================
// CONFIGURATION
// ============================================================================

const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const FUNCTION_ID = 'validateDiscount';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidateCodeOptions {
  userId?: string;      // Optional: verify code is for this user
  providerId?: string;  // Optional: verify code is for this provider
}

export interface ValidateCodeResult {
  success: boolean;
  valid: boolean;
  discountId?: string;
  code?: string;
  discountPercentage?: number;
  expiresAt?: string;
  daysRemaining?: number;
  providerId?: string;
  providerName?: string;
  message?: string;
  error?: string;
}

export interface RedeemCodeResult {
  success: boolean;
  discountPercentage?: number;
  discountId?: string;
  message?: string;
  error?: string;
}

// ============================================================================
// VALIDATE DISCOUNT CODE
// ============================================================================

/**
 * Validate a discount code without marking it as used.
 * Use this to check the code and show the discount percentage before booking.
 */
export async function validateDiscountCode(
  code: string,
  options: ValidateCodeOptions = {}
): Promise<ValidateCodeResult> {
  console.log('🎫 [DiscountValidation] Validating code:', code);
  
  if (!code || code.trim().length === 0) {
    return {
      success: false,
      valid: false,
      error: 'EMPTY_CODE',
      message: 'Please enter a discount code',
    };
  }
  
  try {
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    
    const functions = new Functions(client);
    
    const execution = await functions.createExecution(
      FUNCTION_ID,
      JSON.stringify({
        action: 'validate',
        code: code.toUpperCase().trim(),
        userId: options.userId,
        providerId: options.providerId,
      }),
      false // async = false (wait for result)
    );
    
    console.log('📬 [DiscountValidation] Execution result:', execution.status);
    
    const response = JSON.parse(execution.responseBody || '{}');
    
    if (response.valid) {
      console.log('✅ [DiscountValidation] Code valid:', {
        code: response.code,
        discountPercentage: response.discountPercentage,
        expiresAt: response.expiresAt,
      });
    } else {
      console.log('❌ [DiscountValidation] Code invalid:', response.error);
    }
    
    return response;
  } catch (error) {
    console.error('❌ [DiscountValidation] Validation failed:', error);
    return {
      success: false,
      valid: false,
      error: 'NETWORK_ERROR',
      message: 'Could not validate code. Please try again.',
    };
  }
}

// ============================================================================
// REDEEM DISCOUNT CODE
// ============================================================================

/**
 * Redeem a discount code, marking it as used on a specific booking.
 * Call this after the booking is confirmed.
 */
export async function redeemDiscountCode(
  code: string,
  bookingId: string
): Promise<RedeemCodeResult> {
  console.log('🎁 [DiscountValidation] Redeeming code:', code, 'for booking:', bookingId);
  
  if (!code || !bookingId) {
    return {
      success: false,
      error: 'MISSING_PARAMS',
      message: 'Code and booking ID are required',
    };
  }
  
  try {
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    
    const functions = new Functions(client);
    
    const execution = await functions.createExecution(
      FUNCTION_ID,
      JSON.stringify({
        action: 'redeem',
        code: code.toUpperCase().trim(),
        bookingId,
      }),
      false // async = false (wait for result)
    );
    
    console.log('📬 [DiscountValidation] Redeem result:', execution.status);
    
    const response = JSON.parse(execution.responseBody || '{}');
    
    if (response.success) {
      console.log('✅ [DiscountValidation] Code redeemed successfully');
    } else {
      console.log('❌ [DiscountValidation] Redeem failed:', response.error);
    }
    
    return response;
  } catch (error) {
    console.error('❌ [DiscountValidation] Redeem failed:', error);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Could not redeem code. Please try again.',
    };
  }
}

// ============================================================================
// HELPER: Calculate discounted price
// ============================================================================

/**
 * Calculate the discounted price given original price and discount percentage.
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  discountPercentage: number
): { discountedPrice: number; savings: number } {
  const savings = Math.round(originalPrice * (discountPercentage / 100));
  const discountedPrice = originalPrice - savings;
  return { discountedPrice, savings };
}

/**
 * Calculate admin commission after discount.
 * Admin gets 30% of the DISCOUNTED price.
 */
export function calculateCommissionAfterDiscount(
  originalPrice: number,
  discountPercentage: number,
  commissionRate: number = 0.30
): {
  discountedPrice: number;
  adminCommission: number;
  providerPayout: number;
  customerSavings: number;
} {
  const customerSavings = Math.round(originalPrice * (discountPercentage / 100));
  const discountedPrice = originalPrice - customerSavings;
  const adminCommission = Math.round(discountedPrice * commissionRate);
  const providerPayout = discountedPrice - adminCommission;
  
  return {
    discountedPrice,
    adminCommission,
    providerPayout,
    customerSavings,
  };
}

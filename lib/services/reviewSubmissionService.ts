/**
 * ============================================================================
 * 🔒 REVIEW SUBMISSION SERVICE
 * ============================================================================
 * 
 * Client-side service for submitting reviews.
 * Routes through server-side Appwrite Function for security.
 * 
 * Security Features:
 * - Only completed bookings can be reviewed
 * - One review per booking (server-enforced)
 * - Contact info blocked
 * - Suspicious content auto-flagged
 * - Reviews are immutable (cannot edit/delete)
 */

import { Client, Functions } from 'appwrite';

// ============================================================================
// CONFIGURATION
// ============================================================================

const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '675d5d0e00328cac5bb5';
const SUBMIT_REVIEW_FUNCTION_ID = 'submitReview';

// ============================================================================
// TYPES
// ============================================================================

export type TargetType = 'therapist' | 'place' | 'hotel' | 'villa' | 'facial';

export interface SubmitReviewRequest {
  bookingId: string;
  reviewerId: string;
  reviewerName?: string;
  targetId: string;
  targetType: TargetType;
  targetName?: string;
  starRating: number; // 1-5
  reviewText?: string; // Optional, will be filtered
  token?: string; // From secure review link
  hash?: string; // From secure review link
}

export interface SubmitReviewResponse {
  success: boolean;
  reviewId?: string;
  message?: string;
  error?: string;
  isAutoFlagged?: boolean;
  violations?: string[];
}

// ============================================================================
// APPWRITE CLIENT
// ============================================================================

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const functions = new Functions(client);

// ============================================================================
// REVIEW SUBMISSION SERVICE
// ============================================================================

class ReviewSubmissionService {
  
  /**
   * 🔒 Submit a review through the SERVER-ENFORCED endpoint
   * 
   * Server validates:
   * - Booking is COMPLETED
   * - No existing review for this booking
   * - No contact information in text
   * - Auto-flags suspicious content
   */
  async submitReview(request: SubmitReviewRequest): Promise<SubmitReviewResponse> {
    console.log('⭐ [SERVER] Submitting review for booking:', request.bookingId);
    
    // Quick client-side validation
    if (request.starRating < 1 || request.starRating > 5) {
      return {
        success: false,
        error: 'INVALID_RATING',
        message: 'Star rating must be between 1 and 5',
      };
    }
    
    try {
      // Execute the server function
      const execution = await functions.createExecution(
        SUBMIT_REVIEW_FUNCTION_ID,
        JSON.stringify(request),
        false, // async = false
        '/', // path
        'POST', // method
        { 'Content-Type': 'application/json' }
      );
      
      // Parse response
      let response: SubmitReviewResponse;
      
      try {
        response = JSON.parse(execution.responseBody);
      } catch {
        console.error('❌ [SERVER] Failed to parse response:', execution.responseBody);
        return {
          success: false,
          error: 'PARSE_ERROR',
          message: 'Failed to process server response',
        };
      }
      
      // Log result
      if (response.success) {
        console.log('✅ [SERVER] Review submitted:', response.reviewId);
        if (response.isAutoFlagged) {
          console.log('⚠️ [SERVER] Review was auto-flagged for admin review');
        }
      } else {
        console.error('❌ [SERVER] Submission failed:', response.error);
      }
      
      return response;
      
    } catch (error) {
      console.error('❌ [SERVER] Function execution failed:', error);
      
      return {
        success: false,
        error: 'FUNCTION_ERROR',
        message: 'Failed to submit review. Please try again.',
      };
    }
  }
  
  /**
   * Quick client-side text validation (for UI feedback)
   * NOT security - server does real validation
   */
  quickValidateText(text: string): { mayBeBlocked: boolean; reason?: string } {
    if (!text) return { mayBeBlocked: false };
    
    const normalizedText = text.toLowerCase();
    
    // Quick phone check
    if (/\b0\s*8\s*\d/.test(normalizedText) || /\b6\s*2\s*\d/.test(normalizedText)) {
      return { mayBeBlocked: true, reason: 'Phone number detected' };
    }
    
    // Quick WhatsApp check
    if (/\bwa\b/.test(normalizedText) || /whatsapp/i.test(normalizedText)) {
      return { mayBeBlocked: true, reason: 'WhatsApp reference detected' };
    }
    
    // Quick email check
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
      return { mayBeBlocked: true, reason: 'Email address detected' };
    }
    
    // Quick social media check
    if (/@[a-zA-Z0-9_]{3,}/.test(text)) {
      return { mayBeBlocked: true, reason: 'Social media handle detected' };
    }
    
    return { mayBeBlocked: false };
  }
  
  /**
   * Format star rating for display
   */
  formatStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
  }
  
  /**
   * Get rating description
   */
  getRatingDescription(rating: number): string {
    const descriptions: Record<number, string> = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    };
    return descriptions[rating] || '';
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const reviewSubmissionService = new ReviewSubmissionService();
export default reviewSubmissionService;

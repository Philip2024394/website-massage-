/**
 * ============================================================================
 * 🔒 PAYMENT CONFIRMATION SERVICE
 * ============================================================================
 * 
 * Client-side service to confirm payment received.
 * Routes through server-side Appwrite Function for security.
 * 
 * When therapist/place clicks "Payment Received":
 * 1. Calls confirmPaymentReceived function
 * 2. Server updates booking status
 * 3. Server generates secure review link
 * 4. Server sends system message to user
 * 5. User receives notification + chat message
 * 
 * Security:
 * - All logic server-side (tamper-resistant)
 * - Review link cryptographically generated
 * - One review per booking enforced
 * - System messages cannot be edited/deleted
 */

import { Client, Functions } from 'appwrite';

// ============================================================================
// CONFIGURATION
// ============================================================================

const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '675d5d0e00328cac5bb5';
const CONFIRM_PAYMENT_FUNCTION_ID = 'confirmPaymentReceived';

// ============================================================================
// TYPES
// ============================================================================

export type ProviderType = 'therapist' | 'place' | 'hotel' | 'villa' | 'facial';

export interface ConfirmPaymentRequest {
  bookingId: string;
  providerId: string;
  providerType: ProviderType;
  providerName: string;
  userId: string;
  userName: string;
  serviceName?: string;
  amount?: number;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  messageId?: string;
  reviewUrl?: string;
  reviewExpiresAt?: string;
  message?: string;
  error?: string;
}

// ============================================================================
// APPWRITE CLIENT
// ============================================================================

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const functions = new Functions(client);

// ============================================================================
// PAYMENT CONFIRMATION SERVICE
// ============================================================================

class PaymentConfirmationService {
  
  /**
   * 🔒 Confirm payment received for a booking
   * 
   * Triggers:
   * - Booking status update to 'payment_received'
   * - Secure review link generation
   * - System message to user with review request
   * - Notification to user
   * 
   * Called when therapist/place clicks "Payment Received"
   */
  async confirmPayment(request: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> {
    console.log('💰 [SERVER] Confirming payment for booking:', request.bookingId);
    
    try {
      // Execute the server function
      const execution = await functions.createExecution(
        CONFIRM_PAYMENT_FUNCTION_ID,
        JSON.stringify(request),
        false, // async = false (wait for response)
        '/', // path
        'POST', // method
        { 'Content-Type': 'application/json' }
      );
      
      // Parse response
      let response: ConfirmPaymentResponse;
      
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
        console.log('✅ [SERVER] Payment confirmed, review request sent');
        console.log('   Review URL:', response.reviewUrl);
        console.log('   Expires:', response.reviewExpiresAt);
      } else {
        console.error('❌ [SERVER] Confirmation failed:', response.error);
      }
      
      return response;
      
    } catch (error) {
      console.error('❌ [SERVER] Function execution failed:', error);
      
      return {
        success: false,
        error: 'FUNCTION_ERROR',
        message: 'Failed to confirm payment. Please try again.',
      };
    }
  }
  
  /**
   * Helper to format amount for display
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const paymentConfirmationService = new PaymentConfirmationService();
export default paymentConfirmationService;

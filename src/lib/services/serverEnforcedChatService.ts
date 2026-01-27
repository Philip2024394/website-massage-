/**
 * ============================================================================
 * 🔒 SERVER-ENFORCED CHAT SERVICE
 * ============================================================================
 * 
 * This service routes ALL chat messages through the backend Appwrite Function.
 * NO direct database writes are allowed - ensures tamper-resistant validation.
 * 
 * Security Architecture:
 * ┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
 * │  Client (UI)    │────▶│  Appwrite Function  │────▶│  Database       │
 * │  (No DB access) │     │  (Validation + Log) │     │  (Protected)    │
 * └─────────────────┘     └─────────────────────┘     └─────────────────┘
 * 
 * - All messages validated server-side
 * - Violations logged with admin notifications
 * - Auto-restriction after 5 violations
 * - Account status checked before each message
 */

import { Client, Functions } from 'appwrite';

// ============================================================================
// CONFIGURATION
// ============================================================================

const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664'; // Main project ID
const SEND_MESSAGE_FUNCTION_ID = '6972e0c30012060a2762'; // Appwrite Function ID (deployed sendChatMessage)

// ============================================================================
// TYPES
// ============================================================================

export interface SendMessageRequest {
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'therapist' | 'user' | 'place' | 'business';
  recipientId: string;
  recipientName: string;
  recipientType?: string;
  message: string;
  roomId: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
  isViolation?: boolean;
  isRestricted?: boolean;
  violationType?: string;
  violationCount?: number;
}

export type ViolationType = 
  | 'PHONE_NUMBER_DIGITS'
  | 'PHONE_NUMBER_WORDS'
  | 'WHATSAPP_REFERENCE'
  | 'CONTACT_PHRASE'
  | 'SOCIAL_MEDIA'
  | 'EMAIL_ADDRESS'
  | 'BANK_NUMBER';

// ============================================================================
// APPWRITE CLIENT (Read-only for real-time, writes go through function)
// ============================================================================

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const functions = new Functions(client);

// ============================================================================
// SERVER-ENFORCED CHAT SERVICE
// ============================================================================

class ServerEnforcedChatService {
  private functionId: string;

  constructor() {
    this.functionId = SEND_MESSAGE_FUNCTION_ID;
  }

  /**
   * 🔒 Send a message through the SERVER-ENFORCED endpoint
   * 
   * This is the ONLY way to send messages - no direct database writes.
   * The server validates for contact information, tracks violations,
   * and auto-restricts accounts after threshold.
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      console.log('📤 [SERVER] Sending message through secure endpoint...');
      
      // Execute the Appwrite Function
      const execution = await functions.createExecution(
        this.functionId,
        JSON.stringify(request),
        false, // async = false (wait for response)
        '/', // path
        'POST', // method
        { 'Content-Type': 'application/json' } // headers
      );

      // Parse the response
      let response: SendMessageResponse;
      
      console.log('🔍 [SERVER] Raw execution response:', execution);
      console.log('🔍 [SERVER] Response body:', execution.responseBody);
      console.log('🔍 [SERVER] Status code:', execution.statusCode);
      
      try {
        response = JSON.parse(execution.responseBody);
        console.log('🔍 [SERVER] Parsed response:', response);
      } catch (parseError) {
        console.error('❌ [SERVER] Failed to parse response:', execution.responseBody);
        console.error('❌ [SERVER] Parse error:', parseError);
        return {
          success: false,
          error: 'PARSE_ERROR',
          message: 'Failed to process server response',
        };
      }

      // Log the result
      if (response.success) {
        console.log('✅ [SERVER] Message sent:', response.messageId);
      } else if (response.isViolation) {
        console.warn('⚠️ [SERVER] Violation detected:', response.violationType);
      } else if (response.isRestricted) {
        console.error('🚫 [SERVER] Account restricted');
      } else {
        console.error('❌ [SERVER] Send failed:', response.error);
      }

      return response;

    } catch (error) {
      console.error('❌ [SERVER] Function execution failed:', error);
      
      // Check if it's a network error
      if (error instanceof Error && error.message.includes('network')) {
        return {
          success: false,
          error: 'NETWORK_ERROR',
          message: 'Unable to connect to server. Please check your internet connection.',
        };
      }

      return {
        success: false,
        error: 'FUNCTION_ERROR',
        message: 'Failed to send message. Please try again.',
      };
    }
  }

  /**
   * Quick validation check (for UI feedback only)
   * NOTE: This is NOT security - server does the real validation
   */
  quickValidate(message: string): { mayBeBlocked: boolean; reason?: string } {
    const normalizedMessage = message.toLowerCase();
    
    // Quick checks for immediate UI feedback
    const quickPatterns = [
      { pattern: /\b0\s*8\s*\d/gi, reason: 'Phone number detected' },
      { pattern: /\bwa\b/gi, reason: 'WhatsApp reference detected' },
      { pattern: /\bcall\s+me\b/gi, reason: 'Contact phrase detected' },
      { pattern: /@[a-zA-Z0-9_]{3,}/g, reason: 'Social media handle detected' },
      { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, reason: 'Email detected' },
    ];

    for (const { pattern, reason } of quickPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(normalizedMessage)) {
        return { mayBeBlocked: true, reason };
      }
    }

    return { mayBeBlocked: false };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const serverEnforcedChatService = new ServerEnforcedChatService();

// Export default for convenience
export default serverEnforcedChatService;

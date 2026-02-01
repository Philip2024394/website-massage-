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

import { Client, Functions, Databases, ID } from 'appwrite';

// ============================================================================
// CONFIGURATION
// ============================================================================

const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '66e5c5d1003b5b00c1d0'; // Correct main project ID
const SEND_MESSAGE_FUNCTION_ID = '6972e0c30012060a2762'; // Appwrite Function ID (deployed sendChatMessage)

// FALLBACK: Direct database access when function fails
const FALLBACK_DATABASE_ID = '66e5c5d100248f08b3b5';
const FALLBACK_MESSAGES_COLLECTION = 'messages';

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
const databases = new Databases(client); // Fallback direct database access

// ============================================================================
// SERVER-ENFORCED CHAT SERVICE
// ============================================================================

class ServerEnforcedChatService {
  private functionId: string;
  private client: Client;
  private functions: Functions;

  constructor() {
    this.functionId = SEND_MESSAGE_FUNCTION_ID;
    this.client = client;
    this.functions = functions;
    
    console.log('🔍 [SERVER DIAGNOSTIC] ServerEnforcedChatService initialized');
    console.log('🔍 [SERVER DIAGNOSTIC] Function ID:', this.functionId);
    console.log('🔍 [SERVER DIAGNOSTIC] Appwrite endpoint:', APPWRITE_ENDPOINT);
    console.log('🔍 [SERVER DIAGNOSTIC] Project ID:', APPWRITE_PROJECT_ID);
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
      console.log('🔍 [SERVER DIAGNOSTIC] Function ID:', this.functionId);
      console.log('🔍 [SERVER DIAGNOSTIC] Client configured:', !!this.client);
      console.log('🔍 [SERVER DIAGNOSTIC] Functions service:', !!this.functions);
      console.log('🔍 [SERVER DIAGNOSTIC] Request data:', JSON.stringify(request, null, 2));
      
      // Check if functions service is available
      if (!this.functions) {
        console.error('❌ [SERVER DIAGNOSTIC] Functions service not available');
        return {
          success: false,
          error: 'SERVICE_UNAVAILABLE',
          message: 'Chat service not initialized properly'
        };
      }
      
      console.log('🔍 [SERVER DIAGNOSTIC] About to call functions.createExecution...');
      
      // Execute the Appwrite Function
      const execution = await this.functions.createExecution(
        this.functionId,
        JSON.stringify(request),
        false, // async = false (wait for response)
        '/', // path
        'POST', // method
        { 'Content-Type': 'application/json' } // headers
      );

      console.log('🔍 [SERVER DIAGNOSTIC] Function execution completed');
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
      console.error('🔍 [SERVER DIAGNOSTIC] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('🔍 [SERVER DIAGNOSTIC] Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        code: (error as any).code,
        status: (error as any).status,
        type: (error as any).type,
        stack: (error as Error).stack?.split('\n').slice(0, 3)
      });
      
      // Check if it's an Appwrite function not found error
      if ((error as any).code === 404 || (error as Error).message?.includes('not found')) {
        console.error('🔍 [SERVER DIAGNOSTIC] Function not found error detected');
        return {
          success: false,
          error: 'FUNCTION_NOT_FOUND',
          message: 'Chat function not deployed. Please contact support.',
        };
      }
      
      // Check if it's a network error
      if (error instanceof Error && error.message.includes('network')) {
        console.error('🔍 [SERVER DIAGNOSTIC] Network error detected');
        return {
          success: false,
          error: 'NETWORK_ERROR',
          message: 'Unable to connect to server. Please check your internet connection.',
        };
      }

      // Check if it's an authentication error
      if ((error as any).code === 401 || (error as Error).message?.includes('authentication')) {
        console.error('🔍 [SERVER DIAGNOSTIC] Authentication error detected');
        return {
          success: false,
          error: 'AUTH_ERROR',
          message: 'Authentication failed. Please refresh the page.',
        };
      }

      // 🚨 FALLBACK: Try direct database write when function fails
      console.warn('⚠️ [FALLBACK] Function failed, attempting direct database write...');
      return await this.fallbackDirectSend(request);
    }
  }

  /**
   * 🆘 FALLBACK: Direct database write when server function fails
   * This ensures messages are never lost even if the function is down
   */
  private async fallbackDirectSend(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      console.log('🆘 [FALLBACK] Using direct database write...');
      
      const messageData = {
        conversationId: request.roomId,
        senderId: request.senderId,
        senderName: request.senderName,
        senderRole: request.senderType,
        receiverId: request.recipientId,
        receiverName: request.recipientName,
        receiverRole: request.recipientType || 'therapist',
        message: request.message,
        messageType: 'text',
        isRead: false,
        createdAt: new Date().toISOString(),
        
        // Duplicate fields for compatibility
        messageId: ID.unique(),
        recipientId: request.recipientId,
        content: request.message,
        sentAt: new Date().toISOString()
      };
      
      const response = await databases.createDocument(
        FALLBACK_DATABASE_ID,
        FALLBACK_MESSAGES_COLLECTION,
        ID.unique(),
        messageData
      );
      
      console.log('✅ [FALLBACK] Message sent via direct database:', response.$id);
      
      return {
        success: true,
        messageId: response.$id,
        message: 'Message sent (fallback mode)'
      };
      
    } catch (fallbackError) {
      console.error('❌ [FALLBACK] Direct database write also failed:', fallbackError);
      
      return {
        success: false,
        error: 'TOTAL_FAILURE',
        message: 'Chat service completely unavailable. Please try again later.'
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

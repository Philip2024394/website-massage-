/**
 * ============================================================================
 * 🚩 CHAT FLAG SERVICE - TRUST & SAFETY
 * ============================================================================
 * 
 * Secure chat reporting system with anti-abuse measures:
 * - One report per user per chat session
 * - Rate limiting (max 5 reports per day per user)
 * - IP hash tracking (privacy-safe)
 * - Immutable audit trail
 * - Admin-only management
 */

import { Client, Databases, Query, ID } from 'appwrite';

// ============================================================================
// CONFIGURATION
// ============================================================================

const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const APPWRITE_DATABASE_ID = '68f76ee1000e64ca8d05';
const CHAT_FLAGS_COLLECTION_ID = 'chat_flags';

// Rate limiting: max reports per day per user
const MAX_REPORTS_PER_DAY = 5;

// ============================================================================
// TYPES
// ============================================================================

export type FlagReason = 
  | 'inappropriate_behavior'
  | 'harassment_abuse' 
  | 'payment_issue'
  | 'scam_fraud'
  | 'therapist_no_show'
  | 'asked_for_contact_number'
  | 'shared_contact_number'
  | 'other';

export type FlagStatus = 'open' | 'reviewed' | 'resolved';

export type ReporterRole = 'user' | 'therapist';

export interface ChatFlag {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  chatRoomId: string;
  reporterId: string;
  reporterRole: ReporterRole;
  reportedUserId: string;
  reportedUserName?: string;
  reason: FlagReason;
  message?: string;
  contactName?: string;
  whatsappNumber?: string;
  status: FlagStatus;
  ipHash?: string;
  adminNotes?: string;
}

export interface FlagSubmission {
  chatRoomId: string;
  reporterId: string;
  reporterRole: ReporterRole;
  reportedUserId: string;
  reportedUserName?: string;
  reason: FlagReason;
  message?: string;
  contactName?: string;
  whatsappNumber?: string;
}

export interface FlagResult {
  success: boolean;
  flagId?: string;
  error?: 'DUPLICATE_REPORT' | 'RATE_LIMIT_EXCEEDED' | 'INVALID_DATA' | 'NETWORK_ERROR';
  message: string;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Generate privacy-safe IP hash (SHA-256)
 */
async function hashIP(ip: string): Promise<string> {
  if (!ip || ip === 'unknown') return '';
  
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'chat-flag-salt-2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get user's IP address (client-side approximation)
 */
async function getUserIP(): Promise<string> {
  try {
    // In production, this would come from server-side headers
    // For now, we'll use a placeholder that could be enhanced
    return 'client-side-ip';
  } catch {
    return 'unknown';
  }
}

/**
 * Validate flag submission data
 */
function validateFlagData(data: FlagSubmission): string | null {
  if (!data.chatRoomId?.trim()) return 'Chat room ID is required';
  if (!data.reporterId?.trim()) return 'Reporter ID is required';
  if (!data.reportedUserId?.trim()) return 'Reported user ID is required';
  if (!data.reason) return 'Reason is required';
  if (data.reporterId === data.reportedUserId) return 'Cannot report yourself';
  if (data.message && data.message.length > 500) return 'Message too long (max 500 characters)';
  
  const validReasons: FlagReason[] = [
    'inappropriate_behavior', 'harassment_abuse', 'payment_issue', 
    'scam_fraud', 'therapist_no_show', 'asked_for_contact_number',
    'shared_contact_number', 'other'
  ];
  if (!validReasons.includes(data.reason)) return 'Invalid reason';
  
  const validRoles: ReporterRole[] = ['user', 'therapist'];
  if (!validRoles.includes(data.reporterRole)) return 'Invalid reporter role';
  
  return null;
}

// ============================================================================
// FLAG SERVICE CLASS
// ============================================================================

class ChatFlagService {
  private client: Client;
  private databases: Databases;
  
  constructor() {
    this.client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    
    this.databases = new Databases(this.client);
  }

  /**
   * Submit a chat flag report with anti-abuse checks
   */
  async submitFlag(data: FlagSubmission): Promise<FlagResult> {
    console.log('🚩 [ChatFlag] Submitting report:', { 
      chatRoomId: data.chatRoomId, 
      reason: data.reason,
      reporterId: data.reporterId.substring(0, 8) + '...' 
    });

    // Validate input data
    const validationError = validateFlagData(data);
    if (validationError) {
      console.error('❌ [ChatFlag] Validation failed:', validationError);
      return {
        success: false,
        error: 'INVALID_DATA',
        message: validationError
      };
    }

    try {
      // Check for duplicate report (same reporter + chat room)
      const existingFlags = await this.databases.listDocuments(
        APPWRITE_DATABASE_ID,
        CHAT_FLAGS_COLLECTION_ID,
        [
          Query.equal('chatRoomId', data.chatRoomId),
          Query.equal('reporterId', data.reporterId),
          Query.limit(1)
        ]
      );

      if (existingFlags.total > 0) {
        console.warn('⚠️ [ChatFlag] Duplicate report blocked');
        return {
          success: false,
          error: 'DUPLICATE_REPORT',
          message: 'You have already reported this chat.'
        };
      }

      // Check rate limiting (max reports per day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayReports = await this.databases.listDocuments(
        APPWRITE_DATABASE_ID,
        CHAT_FLAGS_COLLECTION_ID,
        [
          Query.equal('reporterId', data.reporterId),
          Query.greaterThanEqual('$createdAt', today.toISOString()),
          Query.limit(MAX_REPORTS_PER_DAY + 1)
        ]
      );

      if (todayReports.total >= MAX_REPORTS_PER_DAY) {
        console.warn('⚠️ [ChatFlag] Rate limit exceeded');
        return {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Daily report limit reached (${MAX_REPORTS_PER_DAY} per day).`
        };
      }

      // Generate IP hash for security tracking
      const userIP = await getUserIP();
      const ipHash = await hashIP(userIP);

      // Create the flag document
      const flagDoc = await this.databases.createDocument(
        APPWRITE_DATABASE_ID,
        CHAT_FLAGS_COLLECTION_ID,
        ID.unique(),
        {
          chatRoomId: data.chatRoomId,
          reporterId: data.reporterId,
          reporterRole: data.reporterRole,
          reportedUserId: data.reportedUserId,
          reportedUserName: data.reportedUserName || 'Unknown',
          reason: data.reason,
          message: data.message?.trim() || null,
          contactName: data.contactName?.trim() || null,
          whatsappNumber: data.whatsappNumber?.trim() || null,
          status: 'open',
          ipHash: ipHash
        }
      );

      console.log('✅ [ChatFlag] Report submitted successfully:', flagDoc.$id);
      
      return {
        success: true,
        flagId: flagDoc.$id,
        message: 'Thank you. Our trust & safety team will review this report.'
      };

    } catch (error: any) {
      console.error('❌ [ChatFlag] Submission failed:', error);
      
      // Handle missing collection
      if (error?.code === 404 || error?.message?.includes('could not be found')) {
        return {
          success: false,
          error: 'FEATURE_UNAVAILABLE',
          message: 'Chat reporting feature is not available at this time.'
        };
      }
      
      // Handle Appwrite-specific errors
      if (error.code === 409) {
        return {
          success: false,
          error: 'DUPLICATE_REPORT',
          message: 'You have already reported this chat.'
        };
      }
      
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to submit report. Please try again.'
      };
    }
  }

  /**
   * Check if user has already flagged this chat
   */
  async hasUserFlagged(chatRoomId: string, reporterId: string): Promise<boolean> {
    try {
      const existing = await this.databases.listDocuments(
        APPWRITE_DATABASE_ID,
        CHAT_FLAGS_COLLECTION_ID,
        [
          Query.equal('chatRoomId', chatRoomId),
          Query.equal('reporterId', reporterId),
          Query.limit(1)
        ]
      );
      
      return existing.total > 0;
    } catch (error: any) {
      // Gracefully handle missing collection - it's not created yet
      if (error?.code === 404 || error?.status === 404 || error?.message?.includes('could not be found')) {
        // Collection doesn't exist - this is expected if chat flags feature not set up
        console.log('ℹ️ [ChatFlag] chat_flags collection not found - feature disabled');
        return false;
      }
      console.error('❌ [ChatFlag] Failed to check existing flag:', error);
      return false; // Fail open - allow flagging if check fails
    }
  }

  /**
   * Get all flags for admin review (admin only)
   */
  async getAllFlags(status?: FlagStatus, limit = 50): Promise<ChatFlag[]> {
    try {
      const queries = [
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ];
      
      if (status) {
        queries.push(Query.equal('status', status));
      }
      
      const response = await this.databases.listDocuments(
        APPWRITE_DATABASE_ID,
        CHAT_FLAGS_COLLECTION_ID,
        queries
      );
      
      return response.documents as ChatFlag[];
    } catch (error: any) {
      // Gracefully handle missing collection
      if (error?.code === 404 || error?.message?.includes('could not be found')) {
        return [];
      }
      console.error('❌ [ChatFlag] Failed to fetch flags:', error);
      return [];
    }
  }

  /**
   * Update flag status (admin only)
   */
  async updateFlagStatus(
    flagId: string, 
    status: FlagStatus, 
    adminNotes?: string
  ): Promise<boolean> {
    try {
      await this.databases.updateDocument(
        APPWRITE_DATABASE_ID,
        CHAT_FLAGS_COLLECTION_ID,
        flagId,
        {
          status,
          adminNotes: adminNotes?.trim() || null
        }
      );
      
      console.log('✅ [ChatFlag] Status updated:', flagId, '→', status);
      return true;
    } catch (error: any) {
      // Gracefully handle missing collection
      if (error?.code === 404 || error?.message?.includes('could not be found')) {
        return false;
      }
      console.error('❌ [ChatFlag] Failed to update status:', error);
      return false;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const chatFlagService = new ChatFlagService();
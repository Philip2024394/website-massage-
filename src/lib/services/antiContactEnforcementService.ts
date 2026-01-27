/**
 * 🔒 ANTI-CONTACT ENFORCEMENT SERVICE
 * Strict prevention of contact information sharing in chat
 * 
 * Blocks:
 * - Phone numbers (digits or words like "zero eight")
 * - WhatsApp references (WA, WhatsApp, etc.)
 * - Contact phrases ("call me", "my number", etc.)
 * - Social media handles
 * 
 * On violation:
 * - Block message immediately
 * - Show warning to user
 * - Log violation for admin review
 * - Track repeated attempts
 * - Auto-restrict account after threshold
 * 
 * Applies to:
 * - Users (customers)
 * - Therapists
 * - Businesses
 */

import { databases, ID, Query } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';

// ============================================================================
// VIOLATION TYPES
// ============================================================================

export enum ViolationType {
  PHONE_NUMBER_DIGITS = 'PHONE_NUMBER_DIGITS',
  PHONE_NUMBER_WORDS = 'PHONE_NUMBER_WORDS',
  WHATSAPP_REFERENCE = 'WHATSAPP_REFERENCE',
  CONTACT_PHRASE = 'CONTACT_PHRASE',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  EMAIL_ADDRESS = 'EMAIL_ADDRESS',
  BANK_NUMBER = 'BANK_NUMBER',
}

export enum UserRole {
  USER = 'user',
  THERAPIST = 'therapist',
  BUSINESS = 'business',
}

export interface ContactViolation {
  $id?: string;
  violationId: string;
  
  // Violator info
  userId: string;
  userName: string;
  userRole: UserRole;
  
  // Violation details
  violationType: ViolationType;
  originalMessage: string;     // The blocked message
  detectedContent: string;     // The specific violation found
  
  // Context
  chatRoomId?: string;
  recipientId?: string;
  recipientName?: string;
  
  // Status
  warningShown: boolean;
  accountRestricted: boolean;
  adminReviewed: boolean;
  adminAction?: string;
  
  // Timestamps
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ViolationCheckResult {
  isViolation: boolean;
  violationType?: ViolationType;
  detectedContent?: string;
  warningMessage?: string;
}

export interface UserViolationSummary {
  userId: string;
  totalViolations: number;
  recentViolations: number;     // Last 24 hours
  isRestricted: boolean;
  lastViolationAt?: string;
}

// ============================================================================
// DETECTION PATTERNS
// ============================================================================

// Phone number patterns (digits)
const PHONE_DIGIT_PATTERNS = [
  /\b0\d{9,12}\b/g,                                    // Indonesian mobile: 08123456789
  /\b\+?\d{1,4}[-.\s]?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,  // International format
  /\b\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,        // Grouped format
  /\b(?:62|08)\d{8,12}\b/g,                           // Indonesian formats
];

// Phone number in words (Indonesian + English)
const PHONE_WORD_PATTERNS = [
  // English number words
  /\b(zero|one|two|three|four|five|six|seven|eight|nine)(\s+(zero|one|two|three|four|five|six|seven|eight|nine)){7,}\b/gi,
  // Indonesian number words
  /\b(nol|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan)(\s+(nol|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan)){7,}\b/gi,
  // Mixed patterns
  /\b(o|oh)\s*(eight|delapan)\s*(one|satu|two|dua|three|tiga)/gi,
];

// WhatsApp references
const WHATSAPP_PATTERNS = [
  /\b(whatsapp|whats\s*app|wa|w\.a|w\/a)\b/gi,
  /\b(chat\s*wa|hubungi\s*wa|kontak\s*wa|nomor\s*wa)\b/gi,
  /\b(add\s*me\s*on\s*wa|tambah\s*wa)\b/gi,
  /\bwa\s*:?\s*0\d+/gi,
  /\bwhatsapp\s*:?\s*[\d\s+-]+/gi,
];

// Contact phrases (English + Indonesian)
const CONTACT_PHRASES = [
  // English
  /\b(call\s*me|my\s*number|my\s*phone|contact\s*me|text\s*me|message\s*me|reach\s*me)\b/gi,
  /\b(give\s*you\s*my\s*number|send\s*my\s*number|here'?s?\s*my\s*number)\b/gi,
  /\b(phone\s*number|cell\s*number|mobile\s*number)\b/gi,
  // Indonesian
  /\b(hubungi\s*saya|nomor\s*saya|telepon\s*saya|telp\s*saya|hp\s*saya)\b/gi,
  /\b(kontak\s*saya|no\s*hp|nomer\s*hp|nomor\s*hp|nomer\s*saya)\b/gi,
  /\b(chat\s*saya|sms\s*saya|kirim\s*pesan)\b/gi,
  /\b(ini\s*nomor|ini\s*no|ini\s*nomer)\b/gi,
];

// Social media handles
const SOCIAL_MEDIA_PATTERNS = [
  /\b(instagram|ig|insta)\s*:?\s*@?\w+/gi,
  /\b(telegram|tg)\s*:?\s*@?\w+/gi,
  /\b(line)\s*:?\s*@?\w+/gi,
  /\b(facebook|fb)\s*:?\s*.+/gi,
  /\b@\w{3,30}\b/g,  // Generic handle pattern
];

// Email patterns
const EMAIL_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  /\b(email|mail)\s*:?\s*\S+@\S+/gi,
];

// ============================================================================
// WARNING MESSAGES
// ============================================================================

const WARNING_MESSAGE = `🚫 Sharing contact information is prohibited.
Violations may deactivate your account.

Use the platform's secure messaging system to communicate.`;

const REPEATED_WARNING_MESSAGE = `⚠️ WARNING: Multiple contact sharing attempts detected.
Your account has been flagged for review.
Further violations will result in account restriction.`;

const RESTRICTION_MESSAGE = `🔒 Your account has been restricted due to repeated attempts to share contact information.
Please contact support to appeal this restriction.`;

// ============================================================================
// THRESHOLDS
// ============================================================================

const VIOLATION_THRESHOLD_FOR_WARNING = 3;   // Show enhanced warning after 3 violations
const VIOLATION_THRESHOLD_FOR_RESTRICTION = 5; // Auto-restrict after 5 violations
const RECENT_VIOLATION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// ANTI-CONTACT ENFORCEMENT SERVICE
// ============================================================================

class AntiContactEnforcementService {
  /**
   * Check message for contact information violations
   * Returns immediately if violation found
   */
  checkMessage(message: string): ViolationCheckResult {
    if (!message || message.trim().length === 0) {
      return { isViolation: false };
    }

    const normalizedMessage = message.toLowerCase();

    // 1. Check phone numbers (digits)
    for (const pattern of PHONE_DIGIT_PATTERNS) {
      const matches = message.match(pattern);
      if (matches) {
        // Filter out short numbers (prices, etc.)
        const phoneNumbers = matches.filter(m => {
          const digits = m.replace(/\D/g, '');
          return digits.length >= 8 && digits.length <= 15;
        });
        
        if (phoneNumbers.length > 0) {
          return {
            isViolation: true,
            violationType: ViolationType.PHONE_NUMBER_DIGITS,
            detectedContent: phoneNumbers[0],
            warningMessage: WARNING_MESSAGE,
          };
        }
      }
    }

    // 2. Check phone numbers (words)
    for (const pattern of PHONE_WORD_PATTERNS) {
      if (pattern.test(message)) {
        return {
          isViolation: true,
          violationType: ViolationType.PHONE_NUMBER_WORDS,
          detectedContent: message.match(pattern)?.[0] || 'phone number in words',
          warningMessage: WARNING_MESSAGE,
        };
      }
    }

    // 3. Check WhatsApp references
    for (const pattern of WHATSAPP_PATTERNS) {
      if (pattern.test(message)) {
        return {
          isViolation: true,
          violationType: ViolationType.WHATSAPP_REFERENCE,
          detectedContent: message.match(pattern)?.[0] || 'WhatsApp reference',
          warningMessage: WARNING_MESSAGE,
        };
      }
    }

    // 4. Check contact phrases
    for (const pattern of CONTACT_PHRASES) {
      if (pattern.test(message)) {
        return {
          isViolation: true,
          violationType: ViolationType.CONTACT_PHRASE,
          detectedContent: message.match(pattern)?.[0] || 'contact phrase',
          warningMessage: WARNING_MESSAGE,
        };
      }
    }

    // 5. Check social media handles
    for (const pattern of SOCIAL_MEDIA_PATTERNS) {
      const matches = message.match(pattern);
      if (matches) {
        // Filter out common words that might match
        const socialHandles = matches.filter(m => 
          !['ig', 'line'].includes(m.toLowerCase()) || m.includes(':') || m.includes('@')
        );
        
        if (socialHandles.length > 0) {
          return {
            isViolation: true,
            violationType: ViolationType.SOCIAL_MEDIA,
            detectedContent: socialHandles[0],
            warningMessage: WARNING_MESSAGE,
          };
        }
      }
    }

    // 6. Check email addresses
    for (const pattern of EMAIL_PATTERNS) {
      if (pattern.test(message)) {
        return {
          isViolation: true,
          violationType: ViolationType.EMAIL_ADDRESS,
          detectedContent: message.match(pattern)?.[0] || 'email address',
          warningMessage: WARNING_MESSAGE,
        };
      }
    }

    return { isViolation: false };
  }

  /**
   * Full validation with logging and restriction check
   */
  async validateAndEnforce(
    message: string,
    userId: string,
    userName: string,
    userRole: UserRole,
    context?: {
      chatRoomId?: string;
      recipientId?: string;
      recipientName?: string;
    }
  ): Promise<{
    allowed: boolean;
    warningMessage?: string;
    accountRestricted?: boolean;
  }> {
    // Check for violations
    const check = this.checkMessage(message);
    
    if (!check.isViolation) {
      return { allowed: true };
    }

    // Log the violation
    await this.logViolation({
      userId,
      userName,
      userRole,
      violationType: check.violationType!,
      originalMessage: message,
      detectedContent: check.detectedContent!,
      chatRoomId: context?.chatRoomId,
      recipientId: context?.recipientId,
      recipientName: context?.recipientName,
    });

    // Get violation count for user
    const summary = await this.getUserViolationSummary(userId);

    // Check if should restrict account
    if (summary.totalViolations >= VIOLATION_THRESHOLD_FOR_RESTRICTION) {
      await this.restrictAccount(userId, userRole);
      
      console.log(`🔒 [AntiContact] Account restricted: ${userId} (${summary.totalViolations} violations)`);
      
      return {
        allowed: false,
        warningMessage: RESTRICTION_MESSAGE,
        accountRestricted: true,
      };
    }

    // Check if should show enhanced warning
    if (summary.totalViolations >= VIOLATION_THRESHOLD_FOR_WARNING) {
      return {
        allowed: false,
        warningMessage: REPEATED_WARNING_MESSAGE,
        accountRestricted: false,
      };
    }

    // Standard warning
    return {
      allowed: false,
      warningMessage: check.warningMessage,
      accountRestricted: false,
    };
  }

  /**
   * Log violation for admin review
   */
  async logViolation(data: {
    userId: string;
    userName: string;
    userRole: UserRole;
    violationType: ViolationType;
    originalMessage: string;
    detectedContent: string;
    chatRoomId?: string;
    recipientId?: string;
    recipientName?: string;
  }): Promise<ContactViolation | null> {
    const now = new Date();
    const violationId = `VIO_${now.getTime()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const violation: Omit<ContactViolation, '$id'> = {
      violationId,
      userId: data.userId,
      userName: data.userName,
      userRole: data.userRole,
      violationType: data.violationType,
      originalMessage: data.originalMessage.substring(0, 500), // Truncate for storage
      detectedContent: data.detectedContent.substring(0, 100),
      chatRoomId: data.chatRoomId,
      recipientId: data.recipientId,
      recipientName: data.recipientName,
      warningShown: true,
      accountRestricted: false,
      adminReviewed: false,
      createdAt: now.toISOString(),
    };

    try {
      const result = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications || 'notifications',
        ID.unique(),
        {
          type: 'contact_violation',
          recipientId: 'admin',
          recipientType: 'admin',
          title: `⚠️ Contact Violation: ${data.violationType}`,
          message: `User: ${data.userName} (${data.userRole})\nType: ${data.violationType}\nDetected: ${data.detectedContent}`,
          violationData: JSON.stringify(violation),
          urgent: true,
          read: false,
          createdAt: violation.createdAt,
        }
      );

      console.log(`⚠️ [AntiContact] Violation logged: ${violationId}`);
      console.log(`   User: ${data.userName} (${data.userRole})`);
      console.log(`   Type: ${data.violationType}`);
      console.log(`   Detected: ${data.detectedContent}`);

      return { ...violation, $id: result.$id };
    } catch (error) {
      console.error('❌ [AntiContact] Failed to log violation:', error);
      return null;
    }
  }

  /**
   * Get user's violation summary
   */
  async getUserViolationSummary(userId: string): Promise<UserViolationSummary> {
    try {
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications || 'notifications',
        [
          Query.equal('type', 'contact_violation'),
          Query.search('message', userId),
          Query.limit(100),
        ]
      );

      const now = Date.now();
      const recentThreshold = now - RECENT_VIOLATION_WINDOW_MS;

      let recentCount = 0;
      let lastViolationAt: string | undefined;

      result.documents.forEach((doc: any) => {
        try {
          const data = JSON.parse(doc.violationData);
          if (data.userId === userId) {
            if (new Date(data.createdAt).getTime() > recentThreshold) {
              recentCount++;
            }
            if (!lastViolationAt || data.createdAt > lastViolationAt) {
              lastViolationAt = data.createdAt;
            }
          }
        } catch {}
      });

      const totalViolations = result.documents.filter((doc: any) => {
        try {
          const data = JSON.parse(doc.violationData);
          return data.userId === userId;
        } catch {
          return false;
        }
      }).length;

      return {
        userId,
        totalViolations,
        recentViolations: recentCount,
        isRestricted: totalViolations >= VIOLATION_THRESHOLD_FOR_RESTRICTION,
        lastViolationAt,
      };
    } catch (error) {
      console.error('Error getting violation summary:', error);
      return {
        userId,
        totalViolations: 0,
        recentViolations: 0,
        isRestricted: false,
      };
    }
  }

  /**
   * Restrict account due to repeated violations
   */
  async restrictAccount(userId: string, userRole: UserRole): Promise<void> {
    try {
      let collectionId: string | null = null;
      
      switch (userRole) {
        case UserRole.THERAPIST:
          collectionId = APPWRITE_CONFIG.collections.therapists;
          break;
        case UserRole.BUSINESS:
          collectionId = APPWRITE_CONFIG.collections.places;
          break;
        case UserRole.USER:
          collectionId = APPWRITE_CONFIG.collections.users;
          break;
      }

      if (collectionId) {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          collectionId,
          userId,
          {
            status: 'RESTRICTED',
            restrictionReason: 'Repeated contact information sharing violations',
            restrictedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        );
      }

      // Create admin notification
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications || 'notifications',
        ID.unique(),
        {
          type: 'account_restricted',
          recipientId: 'admin',
          recipientType: 'admin',
          title: '🔒 Account Auto-Restricted',
          message: `Account ${userId} (${userRole}) has been automatically restricted due to repeated contact sharing violations.`,
          urgent: true,
          read: false,
          createdAt: new Date().toISOString(),
        }
      );

      console.log(`🔒 [AntiContact] Account restricted: ${userId} (${userRole})`);
    } catch (error) {
      console.error('❌ [AntiContact] Failed to restrict account:', error);
    }
  }

  /**
   * Check if user is currently restricted
   */
  async isUserRestricted(userId: string, userRole: UserRole): Promise<boolean> {
    try {
      let collectionId: string | null = null;
      
      switch (userRole) {
        case UserRole.THERAPIST:
          collectionId = APPWRITE_CONFIG.collections.therapists;
          break;
        case UserRole.BUSINESS:
          collectionId = APPWRITE_CONFIG.collections.places;
          break;
        case UserRole.USER:
          collectionId = APPWRITE_CONFIG.collections.users;
          break;
      }

      if (!collectionId) return false;

      const doc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        collectionId,
        userId
      );

      return doc.status === 'RESTRICTED';
    } catch {
      return false;
    }
  }

  /**
   * Get all violations for admin review
   */
  async getViolationsForReview(limit: number = 50): Promise<ContactViolation[]> {
    try {
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications || 'notifications',
        [
          Query.equal('type', 'contact_violation'),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
        ]
      );

      return result.documents.map((doc: any) => {
        try {
          return JSON.parse(doc.violationData);
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('Error fetching violations:', error);
      return [];
    }
  }

  /**
   * Mark violation as reviewed by admin
   */
  async markAsReviewed(violationDocId: string, adminId: string, action: string): Promise<void> {
    try {
      const doc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications || 'notifications',
        violationDocId
      );

      const violationData = JSON.parse(doc.violationData);
      violationData.adminReviewed = true;
      violationData.adminAction = action;
      violationData.reviewedAt = new Date().toISOString();
      violationData.reviewedBy = adminId;

      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications || 'notifications',
        violationDocId,
        {
          violationData: JSON.stringify(violationData),
          read: true,
        }
      );

      console.log(`✅ [AntiContact] Violation ${violationDocId} reviewed by ${adminId}: ${action}`);
    } catch (error) {
      console.error('Error marking violation as reviewed:', error);
    }
  }
}

// Export singleton instance
export const antiContactEnforcementService = new AntiContactEnforcementService();
export default antiContactEnforcementService;

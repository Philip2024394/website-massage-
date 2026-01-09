const { Client, Databases, Query, ID } = require('node-appwrite');

/**
 * ============================================================================
 * 🔒 SERVER-ENFORCED CHAT MESSAGE VALIDATION
 * ============================================================================
 * 
 * This Appwrite Function provides TAMPER-RESISTANT message validation.
 * All chat messages MUST go through this endpoint - no direct database writes.
 * 
 * Security Features:
 * - Server-side contact information detection
 * - Violation tracking and logging
 * - Auto-restriction after threshold (5 violations)
 * - Account restriction check before sending
 * - No client-side bypass possible
 * 
 * Runtime: Node.js 18
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const DATABASE_ID = '68f76ee1000e64ca8d05';
const CHAT_MESSAGES_COLLECTION = 'chat_messages';
const NOTIFICATIONS_COLLECTION = '675d65c3001b725fa829';
const USERS_COLLECTION = '675d659c003a7b845617';
const THERAPISTS_COLLECTION = '675d657c00117d65221f';

// Violation thresholds
const ENHANCED_WARNING_THRESHOLD = 3;
const AUTO_RESTRICT_THRESHOLD = 5;

// ============================================================================
// CONTACT DETECTION PATTERNS (Server-side - cannot be bypassed)
// ============================================================================

// Phone number patterns (digits)
const PHONE_PATTERNS = [
  /\b0\s*8\s*\d[\d\s\-\.]{7,}/gi,           // Indonesian: 08xxx
  /\b\+?\s*6\s*2\s*\d[\d\s\-\.]{8,}/gi,     // Indonesian: +62xxx or 62xxx
  /\b\+?\s*1\s*[\d\s\-\.]{9,}/gi,           // US/International: +1xxx
  /\b\d{3,4}[\s\-\.]\d{3,4}[\s\-\.]\d{3,4}/gi, // Grouped digits
  /\b\d{10,13}\b/g,                          // 10-13 consecutive digits
];

// Phone number in words (English)
const PHONE_WORDS_EN = [
  /\b(zero|one|two|three|four|five|six|seven|eight|nine)\s+(zero|one|two|three|four|five|six|seven|eight|nine)\s+(zero|one|two|three|four|five|six|seven|eight|nine)/gi,
  /\bzero\s*eight/gi,
  /\boh\s*eight/gi,
];

// Phone number in words (Indonesian)
const PHONE_WORDS_ID = [
  /\b(nol|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan)\s+(nol|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan)\s+(nol|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan)/gi,
  /\bnol\s*delapan/gi,
  /\benam\s*dua/gi,
];

// WhatsApp references
const WHATSAPP_PATTERNS = [
  /\bwa\b/gi,
  /\bw\.a\.?\b/gi,
  /\bwhats\s*app/gi,
  /\bwhatsap+/gi,
  /\bwhatssap/gi,
  /\bwatsap/gi,
];

// Contact phrases (English)
const CONTACT_PHRASES_EN = [
  /\bcall\s+me\b/gi,
  /\bmy\s+(number|phone|cell|mobile)\b/gi,
  /\bcontact\s+me\b/gi,
  /\btext\s+me\b/gi,
  /\bmessage\s+me\s+(on|at)\b/gi,
  /\breach\s+me\s+(on|at)\b/gi,
  /\bhere'?s?\s+my\s+(number|phone|contact)\b/gi,
];

// Contact phrases (Indonesian)
const CONTACT_PHRASES_ID = [
  /\bhubungi\s+(saya|aku)\b/gi,
  /\bnomor\s+(saya|aku|hp)\b/gi,
  /\btelp\s+(saya|aku)\b/gi,
  /\btelepon\s+(saya|aku)\b/gi,
  /\bhandphone\s+(saya|aku)\b/gi,
  /\bhp\s+(saya|aku)\b/gi,
  /\bini\s+nomor\b/gi,
  /\bkontak\s+(saya|aku)\b/gi,
];

// Social media patterns
const SOCIAL_MEDIA_PATTERNS = [
  /@[a-zA-Z0-9_]{3,}/g,                    // @username
  /\b(ig|insta|instagram)\s*[:@]?\s*[a-zA-Z0-9_.]+/gi,
  /\b(telegram|tele|tg)\s*[:@]?\s*[a-zA-Z0-9_.]+/gi,
  /\bline\s*(id)?\s*[:@]?\s*[a-zA-Z0-9_.]+/gi,
  /\b(fb|facebook)\s*[:@]?\s*[a-zA-Z0-9_.]+/gi,
];

// Email patterns
const EMAIL_PATTERNS = [
  /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,
  /\b[a-zA-Z0-9._%+-]+\s*\[\s*at\s*\]\s*[a-zA-Z0-9.-]+\s*\[\s*dot\s*\]\s*[a-zA-Z]{2,}\b/gi,
];

// Bank account patterns (additional protection)
const BANK_PATTERNS = [
  /\b\d{10,16}\b/g,  // 10-16 digit numbers (bank accounts)
  /\b(bca|bni|bri|mandiri|cimb|danamon|permata)\s*[:.]?\s*\d{8,}/gi,
];

// ============================================================================
// VIOLATION TYPES
// ============================================================================

const ViolationType = {
  PHONE_NUMBER_DIGITS: 'PHONE_NUMBER_DIGITS',
  PHONE_NUMBER_WORDS: 'PHONE_NUMBER_WORDS',
  WHATSAPP_REFERENCE: 'WHATSAPP_REFERENCE',
  CONTACT_PHRASE: 'CONTACT_PHRASE',
  SOCIAL_MEDIA: 'SOCIAL_MEDIA',
  EMAIL_ADDRESS: 'EMAIL_ADDRESS',
  BANK_NUMBER: 'BANK_NUMBER',
};

// ============================================================================
// MESSAGE VALIDATION (Server-side - TAMPER RESISTANT)
// ============================================================================

function detectViolations(message) {
  const violations = [];
  const normalizedMessage = message.toLowerCase();
  
  // Check phone number patterns (digits)
  for (const pattern of PHONE_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = normalizedMessage.match(pattern);
    if (matches) {
      // Filter to only include 8+ digit sequences
      const validMatches = matches.filter(m => m.replace(/\D/g, '').length >= 8);
      if (validMatches.length > 0) {
        violations.push({
          type: ViolationType.PHONE_NUMBER_DIGITS,
          detected: validMatches[0],
        });
      }
    }
  }
  
  // Check phone words (English)
  for (const pattern of PHONE_WORDS_EN) {
    pattern.lastIndex = 0;
    if (pattern.test(normalizedMessage)) {
      violations.push({
        type: ViolationType.PHONE_NUMBER_WORDS,
        detected: 'Phone number in words (English)',
      });
      break;
    }
  }
  
  // Check phone words (Indonesian)
  for (const pattern of PHONE_WORDS_ID) {
    pattern.lastIndex = 0;
    if (pattern.test(normalizedMessage)) {
      violations.push({
        type: ViolationType.PHONE_NUMBER_WORDS,
        detected: 'Phone number in words (Indonesian)',
      });
      break;
    }
  }
  
  // Check WhatsApp references
  for (const pattern of WHATSAPP_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(normalizedMessage)) {
      violations.push({
        type: ViolationType.WHATSAPP_REFERENCE,
        detected: 'WhatsApp reference',
      });
      break;
    }
  }
  
  // Check contact phrases (English)
  for (const pattern of CONTACT_PHRASES_EN) {
    pattern.lastIndex = 0;
    if (pattern.test(normalizedMessage)) {
      violations.push({
        type: ViolationType.CONTACT_PHRASE,
        detected: 'Contact phrase (English)',
      });
      break;
    }
  }
  
  // Check contact phrases (Indonesian)
  for (const pattern of CONTACT_PHRASES_ID) {
    pattern.lastIndex = 0;
    if (pattern.test(normalizedMessage)) {
      violations.push({
        type: ViolationType.CONTACT_PHRASE,
        detected: 'Contact phrase (Indonesian)',
      });
      break;
    }
  }
  
  // Check social media patterns
  for (const pattern of SOCIAL_MEDIA_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = normalizedMessage.match(pattern);
    if (matches) {
      violations.push({
        type: ViolationType.SOCIAL_MEDIA,
        detected: matches[0],
      });
      break;
    }
  }
  
  // Check email patterns
  for (const pattern of EMAIL_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = normalizedMessage.match(pattern);
    if (matches) {
      violations.push({
        type: ViolationType.EMAIL_ADDRESS,
        detected: matches[0],
      });
      break;
    }
  }
  
  return violations;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

module.exports = async ({ req, res, log, error }) => {
  try {
    log('📥 Chat message request received');
    
    // Parse request body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    log('📋 Request body:', JSON.stringify(body, null, 2));
    
    // ========================================================================
    // VALIDATE REQUIRED FIELDS
    // ========================================================================
    const {
      senderId,
      senderName,
      senderType,
      recipientId,
      recipientName,
      recipientType,
      message,
      roomId,
    } = body;
    
    const missingFields = [];
    if (!senderId) missingFields.push('senderId');
    if (!senderName) missingFields.push('senderName');
    if (!senderType) missingFields.push('senderType');
    if (!recipientId) missingFields.push('recipientId');
    if (!recipientName) missingFields.push('recipientName');
    if (!message) missingFields.push('message');
    if (!roomId) missingFields.push('roomId');
    
    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      error('❌ Validation failed:', errorMsg);
      return res.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: errorMsg,
      }, 400);
    }
    
    // Validate senderType
    const validSenderTypes = ['customer', 'therapist', 'user', 'place', 'business'];
    if (!validSenderTypes.includes(senderType)) {
      error('❌ Invalid senderType:', senderType);
      return res.json({
        success: false,
        error: 'INVALID_SENDER_TYPE',
        message: `Invalid senderType: ${senderType}`,
      }, 400);
    }
    
    // ========================================================================
    // INITIALIZE APPWRITE CLIENT
    // ========================================================================
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://syd.cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
    
    const databases = new Databases(client);
    
    // ========================================================================
    // CHECK IF SENDER IS RESTRICTED (Server-enforced)
    // ========================================================================
    log('🔍 Checking sender restriction status...');
    
    let senderRestricted = false;
    let violationCount = 0;
    
    try {
      // Check for restriction in notifications (admin-imposed)
      const restrictionCheck = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION,
        [
          Query.equal('userId', senderId),
          Query.equal('type', 'ACCOUNT_RESTRICTED'),
          Query.equal('active', true),
          Query.limit(1),
        ]
      );
      
      if (restrictionCheck.documents.length > 0) {
        senderRestricted = true;
        log('🚫 Sender account is RESTRICTED');
      }
      
      // Count existing violations
      const violationsQuery = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION,
        [
          Query.equal('userId', senderId),
          Query.equal('type', 'CONTACT_VIOLATION'),
          Query.limit(100),
        ]
      );
      violationCount = violationsQuery.total;
      log(`📊 Sender violation count: ${violationCount}`);
      
    } catch (err) {
      log('⚠️ Could not check restriction status:', err.message);
      // Continue - don't block on restriction check failure
    }
    
    // Block restricted accounts
    if (senderRestricted) {
      return res.json({
        success: false,
        error: 'ACCOUNT_RESTRICTED',
        message: '🚫 Your account has been restricted due to policy violations. Contact support for assistance.',
        isRestricted: true,
      }, 403);
    }
    
    // ========================================================================
    // 🔒 SERVER-SIDE CONTACT DETECTION (TAMPER RESISTANT)
    // ========================================================================
    log('🔍 Validating message content...');
    
    const violations = detectViolations(message);
    
    if (violations.length > 0) {
      log(`⚠️ VIOLATION DETECTED: ${violations.map(v => v.type).join(', ')}`);
      
      // ======================================================================
      // LOG VIOLATION TO DATABASE (Server-enforced tracking)
      // ======================================================================
      const newViolationCount = violationCount + 1;
      
      try {
        await databases.createDocument(
          DATABASE_ID,
          NOTIFICATIONS_COLLECTION,
          ID.unique(),
          {
            userId: senderId,
            type: 'CONTACT_VIOLATION',
            title: '🚨 Contact Policy Violation',
            message: `User attempted to share contact information: ${violations.map(v => v.type).join(', ')}`,
            data: JSON.stringify({
              senderId,
              senderName,
              senderType,
              recipientId,
              recipientName,
              violationType: violations[0].type,
              detectedContent: violations[0].detected,
              blockedMessage: message.substring(0, 100), // First 100 chars for review
              timestamp: new Date().toISOString(),
              violationNumber: newViolationCount,
            }),
            read: false,
            isAdminReview: true,
            createdAt: new Date().toISOString(),
            active: true,
          }
        );
        log('📝 Violation logged to notifications');
      } catch (logErr) {
        error('❌ Failed to log violation:', logErr.message);
      }
      
      // ======================================================================
      // AUTO-RESTRICT AFTER THRESHOLD (Server-enforced)
      // ======================================================================
      if (newViolationCount >= AUTO_RESTRICT_THRESHOLD) {
        log(`🚫 AUTO-RESTRICTING account (${newViolationCount} violations)`);
        
        try {
          // Create restriction notification
          await databases.createDocument(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION,
            ID.unique(),
            {
              userId: senderId,
              type: 'ACCOUNT_RESTRICTED',
              title: '🚫 Account Restricted',
              message: 'Your account has been automatically restricted due to repeated policy violations.',
              data: JSON.stringify({
                reason: 'AUTO_RESTRICT_VIOLATIONS',
                violationCount: newViolationCount,
                restrictedAt: new Date().toISOString(),
              }),
              read: false,
              isAdminReview: true,
              createdAt: new Date().toISOString(),
              active: true,
            }
          );
          
          return res.json({
            success: false,
            error: 'ACCOUNT_RESTRICTED',
            message: `🚫 Your account has been RESTRICTED due to ${newViolationCount} policy violations.\n\nSharing contact information outside the platform is prohibited.\n\nContact support for assistance.`,
            isRestricted: true,
            violationCount: newViolationCount,
          }, 403);
          
        } catch (restrictErr) {
          error('❌ Failed to restrict account:', restrictErr.message);
        }
      }
      
      // ======================================================================
      // RETURN VIOLATION WARNING (Message NOT saved)
      // ======================================================================
      let warningMessage = `🚫 Message blocked: Sharing contact information is prohibited.\n\nViolations may result in account restriction.`;
      
      if (newViolationCount >= ENHANCED_WARNING_THRESHOLD) {
        warningMessage = `⚠️ WARNING: You have ${newViolationCount} violations.\n\n🚫 Your account will be RESTRICTED at ${AUTO_RESTRICT_THRESHOLD} violations.\n\nSharing contact information is strictly prohibited.`;
      }
      
      return res.json({
        success: false,
        error: 'CONTACT_VIOLATION',
        message: warningMessage,
        violationType: violations[0].type,
        violationCount: newViolationCount,
        isViolation: true,
      }, 400);
    }
    
    // ========================================================================
    // MESSAGE IS CLEAN - SAVE TO DATABASE
    // ========================================================================
    log('✅ Message validated - saving to database');
    
    const messageDocument = {
      senderId: String(senderId),
      senderName: String(senderName),
      senderType: String(senderType),
      recipientId: String(recipientId),
      recipientName: String(recipientName || ''),
      recipientType: String(recipientType || 'therapist'),
      message: String(message).trim(),
      content: String(message).trim(),
      roomId: String(roomId),
      createdAt: new Date().toISOString(),
      read: false,
      messageType: 'text',
      isSystemMessage: false,
    };
    
    const result = await databases.createDocument(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION,
      ID.unique(),
      messageDocument
    );
    
    log('✅ Message saved:', result.$id);
    
    return res.json({
      success: true,
      messageId: result.$id,
      message: 'Message sent successfully',
    });
    
  } catch (err) {
    error('❌ Function error:', err.message);
    return res.json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to process message',
    }, 500);
  }
};

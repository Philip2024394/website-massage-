const { Client, Databases, Query, ID } = require('node-appwrite');

/**
 * ============================================================================
 * 🔒 SERVER-ENFORCED REVIEW SUBMISSION
 * ============================================================================
 * 
 * Secure review submission with server-side validation.
 * 
 * Rules Enforced:
 * - Only COMPLETED bookings can be reviewed
 * - One review per booking (immutable)
 * - Contact information blocked & flagged
 * - Star rating validated (1-5)
 * - Review stored as immutable record
 * 
 * Runtime: Node.js 18
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const DATABASE_ID = '68f76ee1000e64ca8d05';
const REVIEWS_COLLECTION = 'reviews'; // TEXT-BASED ID
const BOOKINGS_COLLECTION = '675e13fc002aaf0777ce';
const NOTIFICATIONS_COLLECTION = '675d65c3001b725fa829';

// Valid booking statuses that allow reviews
const REVIEWABLE_STATUSES = ['completed', 'payment_received', 'COMPLETED', 'PAYMENT_RECEIVED'];

// ============================================================================
// CONTACT DETECTION PATTERNS (Same as chat enforcement)
// ============================================================================

const PHONE_PATTERNS = [
  /\b0\s*8\s*\d[\d\s\-\.]{7,}/gi,
  /\b\+?\s*6\s*2\s*\d[\d\s\-\.]{8,}/gi,
  /\b\d{3,4}[\s\-\.]\d{3,4}[\s\-\.]\d{3,4}/gi,
  /\b\d{10,13}\b/g,
];

const WHATSAPP_PATTERNS = [
  /\bwa\b/gi,
  /\bw\.a\.?\b/gi,
  /\bwhats\s*app/gi,
  /\bwhatsap+/gi,
];

const CONTACT_PHRASES = [
  /\bcall\s+me\b/gi,
  /\bmy\s+(number|phone|cell|mobile)\b/gi,
  /\bcontact\s+me\b/gi,
  /\bhubungi\s+(saya|aku)\b/gi,
  /\bnomor\s+(saya|aku|hp)\b/gi,
];

const SOCIAL_MEDIA_PATTERNS = [
  /@[a-zA-Z0-9_]{3,}/g,
  /\b(ig|insta|instagram)\s*[:@]?\s*[a-zA-Z0-9_.]+/gi,
  /\b(telegram|tele|tg)\s*[:@]?\s*[a-zA-Z0-9_.]+/gi,
];

const EMAIL_PATTERNS = [
  /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,
];

// Suspicious content patterns (for flagging)
const SUSPICIOUS_PATTERNS = [
  /\b(scam|fraud|fake|cheat|lie|liar)\b/gi,
  /\b(steal|stolen|theft|rob)\b/gi,
  /\b(police|lawyer|sue|court)\b/gi,
  /\b(hate|kill|death|die)\b/gi,
];

// ============================================================================
// CONTENT FILTERING
// ============================================================================

function detectContactInfo(text) {
  const violations = [];
  const normalizedText = text.toLowerCase();
  
  // Check phone patterns
  for (const pattern of PHONE_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = normalizedText.match(pattern);
    if (matches) {
      const validMatches = matches.filter(m => m.replace(/\D/g, '').length >= 8);
      if (validMatches.length > 0) {
        violations.push({ type: 'PHONE_NUMBER', detected: validMatches[0] });
      }
    }
  }
  
  // Check WhatsApp
  for (const pattern of WHATSAPP_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(normalizedText)) {
      violations.push({ type: 'WHATSAPP', detected: 'WhatsApp reference' });
      break;
    }
  }
  
  // Check contact phrases
  for (const pattern of CONTACT_PHRASES) {
    pattern.lastIndex = 0;
    if (pattern.test(normalizedText)) {
      violations.push({ type: 'CONTACT_PHRASE', detected: 'Contact phrase' });
      break;
    }
  }
  
  // Check social media
  for (const pattern of SOCIAL_MEDIA_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = normalizedText.match(pattern);
    if (matches) {
      violations.push({ type: 'SOCIAL_MEDIA', detected: matches[0] });
      break;
    }
  }
  
  // Check email
  for (const pattern of EMAIL_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = normalizedText.match(pattern);
    if (matches) {
      violations.push({ type: 'EMAIL', detected: matches[0] });
      break;
    }
  }
  
  return violations;
}

function detectSuspiciousContent(text) {
  const flags = [];
  const normalizedText = text.toLowerCase();
  
  for (const pattern of SUSPICIOUS_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = normalizedText.match(pattern);
    if (matches) {
      flags.push({ type: 'SUSPICIOUS_CONTENT', detected: matches[0] });
    }
  }
  
  return flags;
}

function sanitizeText(text) {
  if (!text) return '';
  
  // Remove excessive whitespace
  let sanitized = text.replace(/\s+/g, ' ').trim();
  
  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000) + '...';
  }
  
  return sanitized;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

module.exports = async ({ req, res, log, error }) => {
  try {
    log('📥 Review submission request received');
    
    // Parse request
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    log('📋 Request body:', JSON.stringify(body, null, 2));
    
    // ========================================================================
    // VALIDATE REQUIRED FIELDS
    // ========================================================================
    const {
      bookingId,
      reviewerId,
      reviewerName,
      targetId,
      targetType, // 'therapist', 'place', 'hotel', 'villa', 'facial'
      targetName,
      starRating,
      reviewText,
      token, // From secure review link
      hash,  // From secure review link
    } = body;
    
    const missingFields = [];
    if (!bookingId) missingFields.push('bookingId');
    if (!reviewerId) missingFields.push('reviewerId');
    if (!targetId) missingFields.push('targetId');
    if (!targetType) missingFields.push('targetType');
    if (starRating === undefined) missingFields.push('starRating');
    
    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      error('❌ Validation failed:', errorMsg);
      return res.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: errorMsg,
      }, 400);
    }
    
    // Validate star rating (1-5)
    const rating = parseInt(starRating, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      error('❌ Invalid star rating:', starRating);
      return res.json({
        success: false,
        error: 'INVALID_RATING',
        message: 'Star rating must be between 1 and 5',
      }, 400);
    }
    
    // Validate target type
    const validTargetTypes = ['therapist', 'place', 'hotel', 'villa', 'facial'];
    if (!validTargetTypes.includes(targetType)) {
      error('❌ Invalid targetType:', targetType);
      return res.json({
        success: false,
        error: 'INVALID_TARGET_TYPE',
        message: `Invalid targetType: ${targetType}`,
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
    // CHECK BOOKING STATUS (Must be COMPLETED)
    // ========================================================================
    log('🔍 Verifying booking status...');
    
    let booking;
    try {
      booking = await databases.getDocument(
        DATABASE_ID,
        BOOKINGS_COLLECTION,
        bookingId
      );
      
      log('📋 Booking status:', booking.status);
      
      if (!REVIEWABLE_STATUSES.includes(booking.status)) {
        error('❌ Booking not completed:', booking.status);
        return res.json({
          success: false,
          error: 'BOOKING_NOT_COMPLETED',
          message: 'Reviews are only allowed for completed bookings',
        }, 400);
      }
      
    } catch (bookingErr) {
      error('❌ Booking not found:', bookingErr.message);
      return res.json({
        success: false,
        error: 'BOOKING_NOT_FOUND',
        message: 'Booking not found or invalid',
      }, 404);
    }
    
    // ========================================================================
    // CHECK FOR EXISTING REVIEW (One per booking)
    // ========================================================================
    log('🔍 Checking for existing review...');
    
    try {
      const existingReviews = await databases.listDocuments(
        DATABASE_ID,
        REVIEWS_COLLECTION,
        [
          Query.equal('bookingId', bookingId),
          Query.limit(1),
        ]
      );
      
      if (existingReviews.documents.length > 0) {
        log('⚠️ Review already exists for this booking');
        return res.json({
          success: false,
          error: 'REVIEW_EXISTS',
          message: 'A review has already been submitted for this booking',
        }, 400);
      }
    } catch (checkErr) {
      log('⚠️ Could not check existing reviews:', checkErr.message);
      // Continue - will fail on duplicate if exists
    }
    
    // ========================================================================
    // FILTER REVIEW TEXT (Block contact info, flag suspicious)
    // ========================================================================
    let filteredText = sanitizeText(reviewText || '');
    let isAutoFlagged = false;
    let flagReasons = [];
    
    if (filteredText) {
      log('🔍 Filtering review text...');
      
      // Check for contact information (BLOCK)
      const contactViolations = detectContactInfo(filteredText);
      if (contactViolations.length > 0) {
        log('🚫 Contact info detected in review:', contactViolations);
        return res.json({
          success: false,
          error: 'CONTACT_INFO_BLOCKED',
          message: '🚫 Reviews cannot contain phone numbers, WhatsApp, or contact information.\n\nPlease remove any contact details and try again.',
          violations: contactViolations.map(v => v.type),
        }, 400);
      }
      
      // Check for suspicious content (FLAG for review)
      const suspiciousFlags = detectSuspiciousContent(filteredText);
      if (suspiciousFlags.length > 0) {
        log('⚠️ Suspicious content flagged:', suspiciousFlags);
        isAutoFlagged = true;
        flagReasons = suspiciousFlags.map(f => f.detected);
      }
    }
    
    // ========================================================================
    // CREATE IMMUTABLE REVIEW RECORD
    // ========================================================================
    log('💾 Creating review record...');
    
    const reviewDocument = {
      // Core fields
      bookingId: String(bookingId),
      reviewerId: String(reviewerId),
      reviewerName: String(reviewerName || 'Anonymous'),
      targetId: String(targetId),
      targetType: String(targetType),
      targetName: String(targetName || ''),
      
      // Rating
      starRating: rating,
      
      // Optional text (filtered)
      reviewText: filteredText,
      
      // Metadata
      createdAt: new Date().toISOString(),
      
      // Security flags
      isAutoFlagged: isAutoFlagged,
      flagReasons: flagReasons.length > 0 ? JSON.stringify(flagReasons) : null,
      
      // Immutability markers
      isVerified: true, // Verified from completed booking
      canEdit: false,   // Reviews are immutable
      canDelete: false, // Reviews cannot be deleted
      
      // Tracking
      submittedVia: 'secure_link',
      ipHash: null, // Could hash IP for fraud detection
    };
    
    const result = await databases.createDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION,
      ID.unique(),
      reviewDocument
    );
    
    log('✅ Review created:', result.$id);
    
    // ========================================================================
    // UPDATE BOOKING (Mark as reviewed)
    // ========================================================================
    try {
      await databases.updateDocument(
        DATABASE_ID,
        BOOKINGS_COLLECTION,
        bookingId,
        {
          hasReview: true,
          reviewId: result.$id,
          reviewedAt: new Date().toISOString(),
        }
      );
      log('✅ Booking marked as reviewed');
    } catch (updateErr) {
      log('⚠️ Could not update booking:', updateErr.message);
    }
    
    // ========================================================================
    // NOTIFY PROVIDER (Optional)
    // ========================================================================
    try {
      await databases.createDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION,
        ID.unique(),
        {
          userId: targetId,
          type: 'new_review',
          title: `⭐ New ${rating}-Star Review`,
          message: `${reviewerName || 'A customer'} left you a ${rating}-star review!`,
          data: JSON.stringify({
            reviewId: result.$id,
            bookingId,
            starRating: rating,
            hasText: filteredText.length > 0,
          }),
          read: false,
          createdAt: new Date().toISOString(),
          active: true,
        }
      );
      log('✅ Provider notified');
    } catch (notifErr) {
      log('⚠️ Could not notify provider:', notifErr.message);
    }
    
    // ========================================================================
    // FLAG FOR ADMIN IF NEEDED
    // ========================================================================
    if (isAutoFlagged) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          NOTIFICATIONS_COLLECTION,
          ID.unique(),
          {
            userId: 'admin',
            type: 'flagged_review',
            title: '🚩 Review Flagged for Review',
            message: `A review has been auto-flagged for suspicious content`,
            data: JSON.stringify({
              reviewId: result.$id,
              bookingId,
              targetId,
              targetType,
              flagReasons,
            }),
            read: false,
            isAdminReview: true,
            createdAt: new Date().toISOString(),
            active: true,
          }
        );
        log('✅ Admin notified of flagged review');
      } catch (adminErr) {
        log('⚠️ Could not notify admin:', adminErr.message);
      }
    }
    
    // ========================================================================
    // RETURN SUCCESS
    // ========================================================================
    return res.json({
      success: true,
      reviewId: result.$id,
      message: 'Thank you for your review!',
      isAutoFlagged,
    });
    
  } catch (err) {
    error('❌ Function error:', err.message);
    error('Stack:', err.stack);
    
    return res.json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to submit review. Please try again.',
    }, 500);
  }
};

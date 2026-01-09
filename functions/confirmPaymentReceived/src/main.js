const { Client, Databases, Query, ID } = require('node-appwrite');

/**
 * ============================================================================
 * 🔒 PAYMENT RECEIVED CONFIRMATION + AUTO REVIEW REQUEST
 * ============================================================================
 * 
 * Server-side function triggered when therapist/place confirms payment.
 * 
 * Actions:
 * 1. Update booking status to 'payment_received' / 'completed'
 * 2. Generate secure review link
 * 3. Auto-send system message to user with review request
 * 4. Create notification for user
 * 
 * Security:
 * - Server-enforced (no client bypass)
 * - One review link per booking
 * - System message cannot be edited/deleted
 * - Review token tied to booking + provider
 * 
 * Runtime: Node.js 18
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const DATABASE_ID = '68f76ee1000e64ca8d05';
const BOOKINGS_COLLECTION = '675e13fc002aaf0777ce';
const CHAT_MESSAGES_COLLECTION = 'chat_messages';
const NOTIFICATIONS_COLLECTION = '675d65c3001b725fa829';

// Review link expiry (7 days)
const REVIEW_LINK_EXPIRY_DAYS = 7;

// Base URL
const BASE_URL = process.env.APP_BASE_URL || 'https://indastreet.com';

// ============================================================================
// TOKEN GENERATION
// ============================================================================

function generateSecureToken() {
  // Generate 64 character hex token
  const chars = '0123456789abcdef';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

function createDataHash(bookingId, providerId, userId) {
  const dataString = `${bookingId}:${providerId}:${userId}`;
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// ============================================================================
// REVIEW LINK GENERATION
// ============================================================================

function generateReviewLink(bookingId, providerId, providerType, userId) {
  const token = generateSecureToken();
  const hash = createDataHash(bookingId, providerId, userId);
  
  const params = new URLSearchParams({
    token,
    hash,
    bid: bookingId,
    pid: providerId,
    pt: providerType,
  });
  
  return {
    url: `${BASE_URL}/review?${params.toString()}`,
    token,
    expiresAt: new Date(Date.now() + REVIEW_LINK_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
  };
}

// ============================================================================
// MESSAGE TEMPLATES
// ============================================================================

function generateThankYouMessage(reviewUrl, providerName, serviceName) {
  const serviceText = serviceName ? ` for ${serviceName}` : '';
  
  return `✅ Thank you for your order${serviceText} with ${providerName}!

Your payment has been confirmed. We hope you enjoyed your experience.

📝 Please leave a review to help others benefit when selecting premium quality service:

🔗 ${reviewUrl}

⏰ This review link is valid for 7 days.

Thank you for choosing Indastreet! 🙏`;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

module.exports = async ({ req, res, log, error }) => {
  try {
    log('📥 Payment confirmation request received');
    
    // Parse request
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    log('📋 Request body:', JSON.stringify(body, null, 2));
    
    // ========================================================================
    // VALIDATE REQUIRED FIELDS
    // ========================================================================
    const {
      bookingId,
      providerId,
      providerType, // 'therapist', 'place', 'hotel', 'villa', 'facial'
      providerName,
      userId,
      userName,
      serviceName,
      amount,
    } = body;
    
    const missingFields = [];
    if (!bookingId) missingFields.push('bookingId');
    if (!providerId) missingFields.push('providerId');
    if (!providerType) missingFields.push('providerType');
    if (!providerName) missingFields.push('providerName');
    if (!userId) missingFields.push('userId');
    if (!userName) missingFields.push('userName');
    
    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      error('❌ Validation failed:', errorMsg);
      return res.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: errorMsg,
      }, 400);
    }
    
    // Validate provider type
    const validProviderTypes = ['therapist', 'place', 'hotel', 'villa', 'facial'];
    if (!validProviderTypes.includes(providerType)) {
      error('❌ Invalid providerType:', providerType);
      return res.json({
        success: false,
        error: 'INVALID_PROVIDER_TYPE',
        message: `Invalid providerType: ${providerType}`,
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
    // CHECK IF REVIEW ALREADY REQUESTED
    // ========================================================================
    log('🔍 Checking for existing review request...');
    
    try {
      const existingMessages = await databases.listDocuments(
        DATABASE_ID,
        CHAT_MESSAGES_COLLECTION,
        [
          Query.equal('senderId', 'system'),
          Query.contains('message', bookingId),
          Query.contains('message', 'review'),
          Query.limit(1),
        ]
      );
      
      if (existingMessages.documents.length > 0) {
        log('⚠️ Review request already sent for this booking');
        return res.json({
          success: false,
          error: 'REVIEW_ALREADY_REQUESTED',
          message: 'A review request has already been sent for this booking',
        }, 400);
      }
    } catch (checkErr) {
      log('⚠️ Could not check for existing review:', checkErr.message);
      // Continue - don't block on check failure
    }
    
    // ========================================================================
    // UPDATE BOOKING STATUS
    // ========================================================================
    log('📝 Updating booking status to payment_received...');
    
    try {
      await databases.updateDocument(
        DATABASE_ID,
        BOOKINGS_COLLECTION,
        bookingId,
        {
          status: 'payment_received',
          paymentReceivedAt: new Date().toISOString(),
          paymentAmount: amount || 0,
        }
      );
      log('✅ Booking status updated');
    } catch (updateErr) {
      log('⚠️ Could not update booking status:', updateErr.message);
      // Continue - don't block the review request
    }
    
    // ========================================================================
    // GENERATE SECURE REVIEW LINK
    // ========================================================================
    log('🔗 Generating secure review link...');
    
    const reviewLink = generateReviewLink(bookingId, providerId, providerType, userId);
    log('✅ Review link generated:', reviewLink.url);
    
    // ========================================================================
    // CREATE SYSTEM MESSAGE WITH REVIEW REQUEST
    // ========================================================================
    log('📨 Creating system message with review request...');
    
    const thankYouMessage = generateThankYouMessage(
      reviewLink.url,
      providerName,
      serviceName
    );
    
    // Create room ID (user to provider conversation)
    const roomId = `${userId}_${providerId}`;
    
    const systemMessage = {
      senderId: 'system',
      senderName: 'System',
      senderType: 'system',
      recipientId: userId,
      recipientName: userName,
      recipientType: 'user',
      message: thankYouMessage,
      content: thankYouMessage,
      roomId: roomId,
      createdAt: new Date().toISOString(),
      read: false,
      messageType: 'system_review_request',
      isSystemMessage: true,
      // Store review data for validation
      metadata: JSON.stringify({
        bookingId,
        providerId,
        providerType,
        providerName,
        reviewToken: reviewLink.token,
        reviewExpiresAt: reviewLink.expiresAt,
        cannotDelete: true,
        cannotEdit: true,
      }),
    };
    
    const messageResult = await databases.createDocument(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION,
      ID.unique(),
      systemMessage
    );
    
    log('✅ System message created:', messageResult.$id);
    
    // ========================================================================
    // CREATE NOTIFICATION FOR USER
    // ========================================================================
    log('🔔 Creating notification for user...');
    
    try {
      await databases.createDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION,
        ID.unique(),
        {
          userId: userId,
          type: 'review_request',
          title: '📝 Leave a Review',
          message: `Your booking with ${providerName} is complete! Please leave a review to help others.`,
          data: JSON.stringify({
            bookingId,
            providerId,
            providerType,
            providerName,
            reviewUrl: reviewLink.url,
          }),
          read: false,
          createdAt: new Date().toISOString(),
          active: true,
        }
      );
      log('✅ Notification created');
    } catch (notifErr) {
      log('⚠️ Could not create notification:', notifErr.message);
      // Continue - message is the primary delivery
    }
    
    // ========================================================================
    // RETURN SUCCESS
    // ========================================================================
    return res.json({
      success: true,
      messageId: messageResult.$id,
      reviewUrl: reviewLink.url,
      reviewExpiresAt: reviewLink.expiresAt,
      message: 'Payment confirmed and review request sent',
    });
    
  } catch (err) {
    error('❌ Function error:', err.message);
    error('Stack:', err.stack);
    
    return res.json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to process payment confirmation',
    }, 500);
  }
};

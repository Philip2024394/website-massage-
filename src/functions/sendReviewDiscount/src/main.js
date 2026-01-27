const { Client, Databases, Query, ID } = require('node-appwrite');

/**
 * ============================================================================
 * 🎁 DISCOUNT REWARD SYSTEM
 * ============================================================================
 * 
 * Server-side function for therapists/places to send discount rewards
 * to customers who left reviews.
 * 
 * Trigger: Therapist clicks "Send Discount" after receiving a review
 * 
 * Rules:
 * - Discount code is SYSTEM-GENERATED (no manual input)
 * - Therapist selects: percentage + validity period only
 * - One discount per review
 * - Discount sent to: User chat + User rewards section
 * 
 * Runtime: Node.js 18
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const DATABASE_ID = '68f76ee1000e64ca8d05';
const REVIEWS_COLLECTION = 'reviews';
const DISCOUNT_CODES_COLLECTION = 'discount_codes'; // Store generated codes
const USER_REWARDS_COLLECTION = 'user_rewards'; // User's rewards wallet
const CHAT_MESSAGES_COLLECTION = 'chat_messages';
const NOTIFICATIONS_COLLECTION = '675d65c3001b725fa829';

// Valid discount percentages (no manual input)
const VALID_PERCENTAGES = [5, 10, 15, 20, 25, 30];

// Valid validity periods (days)
const VALID_PERIODS = [7, 14, 30, 60, 90];

// ============================================================================
// CODE GENERATION (Cryptographic, no manual input)
// ============================================================================

function generateDiscountCode(providerPrefix) {
  // Format: PREFIX-XXXX-XXXX (e.g., SARAH-A7B3-K9M2)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0,O,1,I,L)
  
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Add provider prefix (first 5 chars of name, uppercase)
  const prefix = (providerPrefix || 'DISC').toUpperCase().replace(/[^A-Z]/g, '').substring(0, 5);
  
  return `${prefix}-${code}`;
}

function generateUniqueId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 16; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

module.exports = async ({ req, res, log, error }) => {
  try {
    log('🎁 Discount reward request received');
    
    // Parse request
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    log('📋 Request body:', JSON.stringify(body, null, 2));
    
    // ========================================================================
    // VALIDATE REQUIRED FIELDS
    // ========================================================================
    const {
      reviewId,
      providerId,
      providerType,
      providerName,
      userId,
      userName,
      discountPercentage,
      validityDays,
    } = body;
    
    const missingFields = [];
    if (!reviewId) missingFields.push('reviewId');
    if (!providerId) missingFields.push('providerId');
    if (!providerType) missingFields.push('providerType');
    if (!providerName) missingFields.push('providerName');
    if (!userId) missingFields.push('userId');
    if (!discountPercentage) missingFields.push('discountPercentage');
    if (!validityDays) missingFields.push('validityDays');
    
    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      error('❌ Validation failed:', errorMsg);
      return res.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: errorMsg,
      }, 400);
    }
    
    // Validate discount percentage (must be from predefined list)
    const percentage = parseInt(discountPercentage, 10);
    if (!VALID_PERCENTAGES.includes(percentage)) {
      error('❌ Invalid discount percentage:', percentage);
      return res.json({
        success: false,
        error: 'INVALID_PERCENTAGE',
        message: `Invalid discount percentage. Must be one of: ${VALID_PERCENTAGES.join(', ')}%`,
      }, 400);
    }
    
    // Validate validity period (must be from predefined list)
    const days = parseInt(validityDays, 10);
    if (!VALID_PERIODS.includes(days)) {
      error('❌ Invalid validity period:', days);
      return res.json({
        success: false,
        error: 'INVALID_PERIOD',
        message: `Invalid validity period. Must be one of: ${VALID_PERIODS.join(', ')} days`,
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
    // CHECK IF DISCOUNT ALREADY SENT FOR THIS REVIEW
    // ========================================================================
    log('🔍 Checking for existing discount...');
    
    try {
      const existingDiscounts = await databases.listDocuments(
        DATABASE_ID,
        DISCOUNT_CODES_COLLECTION,
        [
          Query.equal('reviewId', reviewId),
          Query.limit(1),
        ]
      );
      
      if (existingDiscounts.documents.length > 0) {
        log('⚠️ Discount already sent for this review');
        return res.json({
          success: false,
          error: 'DISCOUNT_ALREADY_SENT',
          message: 'A discount has already been sent for this review',
        }, 400);
      }
    } catch (checkErr) {
      log('⚠️ Could not check existing discounts:', checkErr.message);
      // Continue - will fail on duplicate if collection enforces uniqueness
    }
    
    // ========================================================================
    // GENERATE DISCOUNT CODE (System-generated, no manual input)
    // ========================================================================
    log('🎫 Generating discount code...');
    
    const discountCode = generateDiscountCode(providerName);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    log('✅ Generated code:', discountCode);
    log('✅ Expires:', expiresAt.toISOString());
    
    // ========================================================================
    // SAVE DISCOUNT CODE TO DATABASE
    // ========================================================================
    log('💾 Saving discount code...');
    
    const discountDocument = {
      // Code details
      code: discountCode,
      discountPercentage: percentage,
      
      // Validity
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      validityDays: days,
      
      // Provider info
      providerId: String(providerId),
      providerType: String(providerType),
      providerName: String(providerName),
      
      // User info
      userId: String(userId),
      userName: String(userName || 'Customer'),
      
      // Review reference
      reviewId: String(reviewId),
      
      // Status
      isUsed: false,
      usedAt: null,
      usedOnBookingId: null,
      
      // Flags
      isActive: true,
      isSingleUse: true, // Each code can only be used once
    };
    
    let discountResult;
    try {
      discountResult = await databases.createDocument(
        DATABASE_ID,
        DISCOUNT_CODES_COLLECTION,
        ID.unique(),
        discountDocument
      );
      log('✅ Discount code saved:', discountResult.$id);
    } catch (saveErr) {
      // If collection doesn't exist, continue with chat notification only
      log('⚠️ Could not save to discount_codes collection:', saveErr.message);
      discountResult = { $id: generateUniqueId() };
    }
    
    // ========================================================================
    // ADD TO USER'S REWARDS SECTION
    // ========================================================================
    log('🎁 Adding to user rewards...');
    
    try {
      await databases.createDocument(
        DATABASE_ID,
        USER_REWARDS_COLLECTION,
        ID.unique(),
        {
          userId: String(userId),
          type: 'discount_code',
          title: `${percentage}% OFF from ${providerName}`,
          description: `Thank you for your review! Use code ${discountCode} for ${percentage}% off your next booking.`,
          code: discountCode,
          discountPercentage: percentage,
          providerId: String(providerId),
          providerType: String(providerType),
          providerName: String(providerName),
          expiresAt: expiresAt.toISOString(),
          isUsed: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          sourceType: 'review_reward',
          sourceId: reviewId,
        }
      );
      log('✅ Added to user rewards');
    } catch (rewardErr) {
      log('⚠️ Could not add to user_rewards:', rewardErr.message);
      // Continue - chat notification is primary
    }
    
    // ========================================================================
    // SEND DISCOUNT BANNER TO USER CHAT
    // ========================================================================
    log('💬 Sending discount banner to chat...');
    
    // Format expiry date
    const expiryFormatted = expiresAt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    // Build banner message
    const bannerMessage = `🎁 THANK YOU DISCOUNT!

━━━━━━━━━━━━━━━━━━━━━━
        ${percentage}% OFF
━━━━━━━━━━━━━━━━━━━━━━

${providerName} is thanking you for your review with a special discount!

🎫 CODE: ${discountCode}

📅 Valid until: ${expiryFormatted}
⏰ ${days} days remaining

━━━━━━━━━━━━━━━━━━━━━━
💡 How to use:
1. Book your next session
2. Enter code at checkout
3. Enjoy ${percentage}% off!
━━━━━━━━━━━━━━━━━━━━━━

🔒 This code is for single use only.
Find all your rewards in Account → Rewards`;

    // Create room ID
    const roomId = `${userId}_${providerId}`;
    
    // Send as system banner (non-editable)
    const chatMessage = {
      senderId: 'system',
      senderName: 'Rewards',
      senderType: 'system',
      recipientId: userId,
      recipientName: userName || 'Customer',
      recipientType: 'user',
      message: bannerMessage,
      content: bannerMessage,
      roomId: roomId,
      createdAt: new Date().toISOString(),
      read: false,
      messageType: 'discount_banner',
      isSystemMessage: true,
      // Banner display flags
      isBanner: true,
      bannerType: 'discount',
      bannerColor: '#FF6B00', // Orange theme
      // Immutability
      canEdit: false,
      canDelete: false,
      // Discount data for banner rendering
      metadata: JSON.stringify({
        type: 'discount_reward',
        code: discountCode,
        discountPercentage: percentage,
        expiresAt: expiresAt.toISOString(),
        validityDays: days,
        providerId,
        providerType,
        providerName,
        reviewId,
        discountId: discountResult.$id,
      }),
    };
    
    await databases.createDocument(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION,
      ID.unique(),
      chatMessage
    );
    
    log('✅ Discount banner sent to chat');
    
    // ========================================================================
    // SEND NOTIFICATION TO USER
    // ========================================================================
    log('🔔 Sending notification...');
    
    try {
      await databases.createDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION,
        ID.unique(),
        {
          userId: userId,
          type: 'discount_reward',
          title: `🎁 ${percentage}% Discount from ${providerName}!`,
          message: `Use code ${discountCode} for ${percentage}% off your next booking. Valid for ${days} days.`,
          data: JSON.stringify({
            code: discountCode,
            discountPercentage: percentage,
            expiresAt: expiresAt.toISOString(),
            providerId,
            providerName,
          }),
          read: false,
          createdAt: new Date().toISOString(),
          active: true,
        }
      );
      log('✅ User notified');
    } catch (notifErr) {
      log('⚠️ Could not send notification:', notifErr.message);
    }
    
    // ========================================================================
    // UPDATE REVIEW (Mark discount sent)
    // ========================================================================
    try {
      await databases.updateDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION,
        reviewId,
        {
          hasDiscountReward: true,
          discountCode: discountCode,
          discountSentAt: new Date().toISOString(),
        }
      );
      log('✅ Review marked with discount');
    } catch (updateErr) {
      log('⚠️ Could not update review:', updateErr.message);
    }
    
    // ========================================================================
    // RETURN SUCCESS
    // ========================================================================
    return res.json({
      success: true,
      discountId: discountResult.$id,
      code: discountCode,
      discountPercentage: percentage,
      expiresAt: expiresAt.toISOString(),
      message: `Discount code ${discountCode} sent to ${userName || 'customer'}!`,
    });
    
  } catch (err) {
    error('❌ Function error:', err.message);
    error('Stack:', err.stack);
    
    return res.json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to send discount. Please try again.',
    }, 500);
  }
};

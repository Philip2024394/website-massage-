const { Client, Databases, Query } = require('node-appwrite');

/**
 * ============================================================================
 * 🎫 DISCOUNT CODE VALIDATION & REDEMPTION
 * ============================================================================
 * 
 * Server-side function to validate and redeem discount codes during booking.
 * 
 * Features:
 * - Validates code exists and is active
 * - Checks expiration date
 * - Verifies single-use (not already used)
 * - Checks if code belongs to correct provider
 * - Returns discount percentage for price calculation
 * - Marks code as used when booking is confirmed
 * 
 * Runtime: Node.js 18
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const DATABASE_ID = '68f76ee1000e64ca8d05';
const DISCOUNT_CODES_COLLECTION = 'discount_codes';
const USER_REWARDS_COLLECTION = 'user_rewards';

// ============================================================================
// MAIN FUNCTION
// ============================================================================

module.exports = async ({ req, res, log, error }) => {
  try {
    log('🎫 Discount code validation request received');
    
    // Parse request
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    log('📋 Request body:', JSON.stringify(body, null, 2));
    
    const { action, code, userId, providerId, bookingId } = body;
    
    // ========================================================================
    // INITIALIZE APPWRITE CLIENT
    // ========================================================================
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://syd.cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
    
    const databases = new Databases(client);
    
    // ========================================================================
    // ACTION: VALIDATE CODE
    // ========================================================================
    if (action === 'validate') {
      if (!code) {
        return res.json({
          success: false,
          error: 'MISSING_CODE',
          message: 'Please enter a discount code',
        }, 400);
      }
      
      log('🔍 Validating code:', code);
      
      // Find the discount code
      const discounts = await databases.listDocuments(
        DATABASE_ID,
        DISCOUNT_CODES_COLLECTION,
        [
          Query.equal('code', code.toUpperCase().trim()),
          Query.limit(1),
        ]
      );
      
      if (discounts.documents.length === 0) {
        log('❌ Code not found');
        return res.json({
          success: false,
          error: 'INVALID_CODE',
          message: 'This discount code is not valid',
        });
      }
      
      const discount = discounts.documents[0];
      log('✅ Code found:', discount.$id);
      
      // Check if already used
      if (discount.isUsed) {
        log('❌ Code already used');
        return res.json({
          success: false,
          error: 'CODE_USED',
          message: 'This discount code has already been used',
        });
      }
      
      // Check if expired
      const expiresAt = new Date(discount.expiresAt);
      if (expiresAt < new Date()) {
        log('❌ Code expired');
        return res.json({
          success: false,
          error: 'CODE_EXPIRED',
          message: 'This discount code has expired',
        });
      }
      
      // Check if code is active
      if (!discount.isActive) {
        log('❌ Code is inactive');
        return res.json({
          success: false,
          error: 'CODE_INACTIVE',
          message: 'This discount code is no longer active',
        });
      }
      
      // Optional: Check if code belongs to the correct provider
      if (providerId && discount.providerId !== providerId) {
        log('⚠️ Code is for different provider');
        return res.json({
          success: false,
          error: 'WRONG_PROVIDER',
          message: `This code is only valid for bookings with ${discount.providerName}`,
        });
      }
      
      // Optional: Check if code is for this user
      if (userId && discount.userId !== userId) {
        log('⚠️ Code is for different user');
        return res.json({
          success: false,
          error: 'WRONG_USER',
          message: 'This discount code was issued to a different customer',
        });
      }
      
      log('✅ Code is valid!');
      
      // Calculate days remaining
      const daysRemaining = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));
      
      return res.json({
        success: true,
        valid: true,
        discountId: discount.$id,
        code: discount.code,
        discountPercentage: discount.discountPercentage,
        expiresAt: discount.expiresAt,
        daysRemaining,
        providerId: discount.providerId,
        providerName: discount.providerName,
        message: `${discount.discountPercentage}% discount applied!`,
      });
    }
    
    // ========================================================================
    // ACTION: REDEEM CODE (Mark as used)
    // ========================================================================
    if (action === 'redeem') {
      if (!code || !bookingId) {
        return res.json({
          success: false,
          error: 'MISSING_PARAMS',
          message: 'Code and booking ID are required',
        }, 400);
      }
      
      log('🎁 Redeeming code:', code);
      
      // Find the discount code
      const discounts = await databases.listDocuments(
        DATABASE_ID,
        DISCOUNT_CODES_COLLECTION,
        [
          Query.equal('code', code.toUpperCase().trim()),
          Query.limit(1),
        ]
      );
      
      if (discounts.documents.length === 0) {
        return res.json({
          success: false,
          error: 'INVALID_CODE',
          message: 'Discount code not found',
        });
      }
      
      const discount = discounts.documents[0];
      
      // Double-check it hasn't been used (race condition protection)
      if (discount.isUsed) {
        return res.json({
          success: false,
          error: 'CODE_ALREADY_USED',
          message: 'This code has already been redeemed',
        });
      }
      
      // Mark as used
      await databases.updateDocument(
        DATABASE_ID,
        DISCOUNT_CODES_COLLECTION,
        discount.$id,
        {
          isUsed: true,
          usedAt: new Date().toISOString(),
          usedOnBookingId: bookingId,
        }
      );
      
      log('✅ Code marked as used');
      
      // Also update user_rewards if exists
      try {
        const rewards = await databases.listDocuments(
          DATABASE_ID,
          USER_REWARDS_COLLECTION,
          [
            Query.equal('code', code.toUpperCase().trim()),
            Query.limit(1),
          ]
        );
        
        if (rewards.documents.length > 0) {
          await databases.updateDocument(
            DATABASE_ID,
            USER_REWARDS_COLLECTION,
            rewards.documents[0].$id,
            {
              isUsed: true,
              usedAt: new Date().toISOString(),
              usedOnBookingId: bookingId,
            }
          );
          log('✅ User reward also marked as used');
        }
      } catch (e) {
        log('⚠️ Could not update user_rewards:', e.message);
      }
      
      return res.json({
        success: true,
        message: 'Discount code redeemed successfully',
        discountPercentage: discount.discountPercentage,
        discountId: discount.$id,
      });
    }
    
    // ========================================================================
    // UNKNOWN ACTION
    // ========================================================================
    return res.json({
      success: false,
      error: 'UNKNOWN_ACTION',
      message: 'Invalid action. Use "validate" or "redeem".',
    }, 400);
    
  } catch (err) {
    error('❌ Function error:', err.message);
    error('Stack:', err.stack);
    
    return res.json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to process discount code. Please try again.',
    }, 500);
  }
};

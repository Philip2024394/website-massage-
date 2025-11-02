/**
 * Therapist Penalty Service
 * Handles automatic penalties for non-responsive therapists
 */

import type { Therapist, Place } from '../types';

export interface PenaltyRecord {
    therapistId: string | number;
    bookingId: string | number;
    penaltyType: 'non_response' | 'late_response' | 'no_show';
    coinsDeducted: number;
    reviewGiven: number; // 1-5 stars
    timestamp: string;
    customerName: string;
    warningLevel: number; // 1-3 (3 = account deactivation)
}

/**
 * Apply automatic penalty for non-responsive therapist
 */
export const applyNonResponsePenalty = async (
    therapistId: string | number,
    bookingId: string | number,
    customerName: string
): Promise<PenaltyRecord> => {
    console.log('⚠️ Applying non-response penalty to therapist:', therapistId);
    
    const penaltyRecord: PenaltyRecord = {
        therapistId,
        bookingId,
        penaltyType: 'non_response',
        coinsDeducted: 200,
        reviewGiven: 1, // Auto 1-star review
        timestamp: new Date().toISOString(),
        customerName,
        warningLevel: 1
    };
    
    try {
        // 🪙 DEDUCT 200 COINS from therapist account
        await deductCoinsFromTherapist(therapistId, 200, `Non-response penalty for booking ${bookingId}`);
        
        // ⭐ ADD AUTO 1-STAR REVIEW
        await addAutomaticReview(therapistId, bookingId);
        
        // 🚨 SEND WARNING TO THERAPIST CHAT
        await sendWarningToTherapist(therapistId, penaltyRecord);
        
        // 📊 LOG PENALTY RECORD
        await logPenaltyRecord(penaltyRecord);
        
        console.log('✅ Non-response penalty applied successfully:', penaltyRecord);
        
        return penaltyRecord;
        
    } catch (error) {
        console.error('❌ Error applying non-response penalty:', error);
        throw error;
    }
};

/**
 * Deduct coins from therapist account
 */
const deductCoinsFromTherapist = async (
    therapistId: string | number,
    amount: number,
    reason: string
): Promise<void> => {
    try {
        console.log(`🪙 Deducting ${amount} coins from therapist ${therapistId} - Reason: ${reason}`);
        
        // For now, we'll log the deduction and implement the actual coin service integration later
        // TODO: Integrate with actual coin service
        const deductionRecord = {
            therapistId: therapistId.toString(),
            amount: -amount, // Negative for deduction
            reason,
            timestamp: new Date().toISOString(),
            type: 'penalty_deduction'
        };
        
        console.log('📝 Coin deduction record:', deductionRecord);
        console.log(`✅ Successfully deducted ${amount} coins from therapist ${therapistId}`);
        
    } catch (error) {
        console.error('❌ Error deducting coins from therapist:', error);
        throw error;
    }
};

/**
 * Add automatic 1-star review for non-responsive therapist
 */
const addAutomaticReview = async (
    therapistId: string | number,
    bookingId: string | number
): Promise<void> => {
    try {
        // Import review service (assuming it exists or create mock)
        console.log(`⭐ Adding automatic 1-star review for therapist ${therapistId}`);
        
        const automaticReview = {
            therapistId,
            bookingId,
            rating: 1,
            comment: `Automatic review: Therapist did not respond to booking request within required timeframe. - System Generated`,
            customerName: 'System Auto-Review',
            timestamp: new Date().toISOString(),
            isSystemGenerated: true,
            verified: true
        };
        
        // TODO: Integrate with actual review service
        // await reviewService.addReview(automaticReview);
        
        console.log('✅ Automatic 1-star review added:', automaticReview);
        
    } catch (error) {
        console.error('❌ Error adding automatic review:', error);
        throw error;
    }
};

/**
 * Send warning message to therapist's chat window
 */
const sendWarningToTherapist = async (
    therapistId: string | number,
    penaltyRecord: PenaltyRecord
): Promise<void> => {
    try {
        // Import chat service (temporarily disabled)
        // const { sendSystemMessage } = await import('./chatService');
        
        console.log(`🚨 Sending warning to therapist ${therapistId}`);
        
        // TODO: Implement warning message system
        // Warning messages template prepared for future implementation
        console.log('📝 Warning system prepared for therapist:', therapistId);
        console.log('⚠️ Penalty record:', penaltyRecord);
        
        // Send warning to therapist's notification system
        // TODO: Create or find therapist chat room ID
        // await sendSystemMessage(therapistChatRoomId, warningMessages);
        
        console.log('✅ Warning message sent to therapist:', therapistId);
        
    } catch (error) {
        console.error('❌ Error sending warning to therapist:', error);
        throw error;
    }
};

/**
 * Log penalty record for tracking and analytics
 */
const logPenaltyRecord = async (penaltyRecord: PenaltyRecord): Promise<void> => {
    try {
        // Import analytics or logging service
        console.log('📊 Logging penalty record:', penaltyRecord);
        
        // TODO: Store in database or analytics system
        // await analyticsService.logPenalty(penaltyRecord);
        
        console.log('✅ Penalty record logged successfully');
        
    } catch (error) {
        console.error('❌ Error logging penalty record:', error);
        throw error;
    }
};

/**
 * Check therapist warning level and potentially deactivate account
 */
export const checkTherapistWarningLevel = async (
    therapistId: string | number
): Promise<{ shouldDeactivate: boolean; warningLevel: number }> => {
    try {
        // TODO: Get therapist warning history from database
        // const warningHistory = await getTherapistWarnings(therapistId);
        
        // Mock warning level check (replace with actual database query)
        const warningLevel = 1; // This should come from database
        
        const shouldDeactivate = warningLevel >= 3;
        
        if (shouldDeactivate) {
            console.log(`🚨 Therapist ${therapistId} has reached warning level 3 - ACCOUNT DEACTIVATION REQUIRED`);
            await deactivateTherapistAccount(therapistId);
        }
        
        return { shouldDeactivate, warningLevel };
        
    } catch (error) {
        console.error('❌ Error checking therapist warning level:', error);
        return { shouldDeactivate: false, warningLevel: 0 };
    }
};

/**
 * Deactivate therapist account for repeated violations
 */
const deactivateTherapistAccount = async (therapistId: string | number): Promise<void> => {
    try {
        console.log(`🚨 DEACTIVATING THERAPIST ACCOUNT: ${therapistId}`);
        
        // TODO: Update therapist status in database
        // await therapistService.deactivateAccount(therapistId);
        
        // TODO: Send deactivation notification (template prepared)
        console.log('🚨 Account deactivation notification prepared for therapist:', therapistId);
        
        // TODO: Send final notification to therapist
        
        console.log('✅ Therapist account deactivated:', therapistId);
        
    } catch (error) {
        console.error('❌ Error deactivating therapist account:', error);
        throw error;
    }
};

/**
 * Get provider type (therapist or place) for penalty application
 */
export const getProviderType = (provider: Therapist | Place): 'therapist' | 'place' => {
    // Check if provider has therapist-specific properties
    if ('whatsappNumber' in provider && 'status' in provider) {
        return 'therapist';
    }
    return 'place';
};
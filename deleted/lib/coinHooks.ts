/**
 * Integration Hooks for Coin Rewards System
 * 
 * This file contains hooks to integrate coin rewards into existing workflows:
 * - Daily sign-ins
 * - Booking completions
 * - Referral tracking
 * - First-time user bonuses
 */

import { coinService } from './coinService';
import { rewardBannerService, UserType } from './rewardBannerService';

/**
 * Track daily sign-in and award coins
 * Call this when user opens the app each day
 */
export async function trackDailySignIn(userId: string, currentStreak: number = 1, userType: UserType = 'user'): Promise<boolean> {
    try {
        const today = new Date().toDateString();
        const lastSignIn = localStorage.getItem(`lastSignIn_${userId}`);

        // Check if already signed in today
        if (lastSignIn === today) {
            return false; // Already signed in today
        }

        // Award coins based on streak
        await coinService.awardDailySignIn(userId, currentStreak);
        
        // Queue reward banner for display
        rewardBannerService.queueRewardBanner(
            userType,
            'daily-signin',
            currentStreak >= 7 ? 25 : currentStreak >= 2 ? 15 : 10,
            currentStreak
        );
        
        // Update last sign-in
        localStorage.setItem(`lastSignIn_${userId}`, today);
        
        return true;
    } catch (error) {
        console.error('Error tracking daily sign-in:', error);
        return false;
    }
}

/**
 * Track booking completion and award coins
 * Call this when a booking is marked as completed
 */
export async function trackBookingCompletion(
    userId: string,
    bookingId: string,
    totalBookings: number,
    userType: UserType = 'user'
): Promise<boolean> {
    try {
        // Check if this booking already awarded coins
        const awardedKey = `booking_awarded_${bookingId}`;
        if (localStorage.getItem(awardedKey)) {
            return false; // Already awarded
        }

        // Award coins
        const isFirstBooking = totalBookings === 1;
        await coinService.awardBookingCompletion(userId, totalBookings, isFirstBooking);
        
        // Queue reward banner for display
        let coinAmount = 5; // Regular booking
        if (isFirstBooking) {
            coinAmount = 10;
        } else if (totalBookings === 5) {
            coinAmount = 20;
        } else if (totalBookings === 10) {
            coinAmount = 50;
        }
        rewardBannerService.queueRewardBanner(
            userType,
            'booking-completion',
            coinAmount,
            undefined,
            totalBookings
        );
        
        // Mark as awarded
        localStorage.setItem(awardedKey, 'true');

        // Check if this completes a referral (first booking)
        if (isFirstBooking) {
            await coinService.processReferralReward(userId);
        }
        
        return true;
    } catch (error) {
        console.error('Error tracking booking completion:', error);
        return false;
    }
}

/**
 * Process referral code during user sign-up
 * Call this when a new user registers with a referral code
 */
export async function processSignUpReferral(
    newUserId: string,
    referralCode?: string
): Promise<boolean> {
    try {
        if (!referralCode) return false;

        // Create referral and award welcome bonus
        const referral = await coinService.createReferral(referralCode, newUserId);
        
        return referral !== null;
    } catch (error) {
        console.error('Error processing sign-up referral:', error);
        return false;
    }
}

/**
 * Get user's current coin balance
 * Use this to display coin count in UI
 */
export async function getUserCoinBalance(userId: string): Promise<number> {
    try {
        const balance = await coinService.getCoinBalance(userId);
        return balance.total;
    } catch (error) {
        console.error('Error getting coin balance:', error);
        return 0;
    }
}

/**
 * Check if user has coins expiring soon
 * Use this to show expiration warnings
 */
export async function checkExpiringCoins(userId: string): Promise<{
    hasExpiring: boolean;
    amount: number;
    daysUntilExpiry: number;
} | null> {
    try {
        const balance = await coinService.getCoinBalance(userId);
        
        if (balance.expiringSoon > 0) {
            return {
                hasExpiring: true,
                amount: balance.expiringSoon,
                daysUntilExpiry: 30 // Within 30 days
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error checking expiring coins:', error);
        return null;
    }
}

/**
 * Redeem coins for a reward
 * Call this when user purchases something from coin shop
 */
export async function redeemCoins(
    userId: string,
    amount: number,
    itemName: string,
    itemId?: string
): Promise<boolean> {
    try {
        const reason = `Redeemed: ${itemName}`;
        const metadata = itemId ? { itemId, itemName } : { itemName };
        
        return await coinService.spendCoins(userId, amount, reason, metadata);
    } catch (error) {
        console.error('Error redeeming coins:', error);
        return false;
    }
}

/**
 * Award achievement coins
 * Call this when user completes special achievements
 */
export async function awardAchievement(
    userId: string,
    achievementName: string,
    coinAmount: number
): Promise<boolean> {
    try {
        // Check if achievement already awarded
        const achievementKey = `achievement_${userId}_${achievementName}`;
        if (localStorage.getItem(achievementKey)) {
            return false; // Already awarded
        }

        await coinService.awardCoins(
            userId,
            coinAmount,
            `Achievement unlocked: ${achievementName}`,
            { achievement: achievementName }
        );
        
        localStorage.setItem(achievementKey, 'true');
        return true;
    } catch (error) {
        console.error('Error awarding achievement:', error);
        return false;
    }
}

/**
 * Initialize user's referral code
 * Call this when user first accesses referral page
 */
export async function initializeUserReferralCode(userId: string): Promise<string> {
    try {
        return await coinService.initializeReferralCode(userId);
    } catch (error) {
        console.error('Error initializing referral code:', error);
        return '';
    }
}

/**
 * Get user's referral statistics
 * Use this to display on referral page
 */
export async function getUserReferralStats(userId: string) {
    try {
        return await coinService.getReferralStats(userId);
    } catch (error) {
        console.error('Error getting referral stats:', error);
        return {
            totalReferrals: 0,
            activeReferrals: 0,
            coinsEarned: 0,
            pendingRewards: 0,
            thisMonthReferrals: 0,
        };
    }
}

/**
 * Daily cron job to expire old coins
 * This should be run once per day via Appwrite function or similar
 */
export async function runDailyCoinExpiration(): Promise<number> {
    try {
        const expiredCount = await coinService.expireOldCoins();
        console.log(`Expired ${expiredCount} coin transactions`);
        return expiredCount;
    } catch (error) {
        console.error('Error running daily coin expiration:', error);
        return 0;
    }
}

/**
 * Get users who need expiration warnings
 * This should be run daily to send notifications
 */
export async function getUsersNeedingExpirationWarnings(daysUntilExpiry: number = 30) {
    try {
        return await coinService.getUsersWithExpiringSoonCoins(daysUntilExpiry);
    } catch (error) {
        console.error('Error getting users needing expiration warnings:', error);
        return [];
    }
}

/**
 * Example usage in your components:
 * 
 * // In App.tsx or HomePage - track daily sign-in
 * useEffect(() => {
 *     if (loggedInUser) {
 *         trackDailySignIn(loggedInUser.id, currentStreak);
 *     }
 * }, [loggedInUser]);
 * 
 * // In BookingPage - when booking is completed
 * const handleBookingComplete = async () => {
 *     await trackBookingCompletion(userId, bookingId, totalBookings);
 *     // Show celebration popup
 * };
 * 
 * // In SignUpPage - when user signs up with referral code
 * const handleSignUp = async (userData, referralCode) => {
 *     const user = await createUser(userData);
 *     if (referralCode) {
 *         await processSignUpReferral(user.id, referralCode);
 *     }
 * };
 * 
 * // In Header/Nav - display coin balance
 * const [coinBalance, setCoinBalance] = useState(0);
 * useEffect(() => {
 *     if (userId) {
 *         getUserCoinBalance(userId).then(setCoinBalance);
 *     }
 * }, [userId]);
 * 
 * // In CoinShopPage - redeem coins
 * const handleRedeem = async (item) => {
 *     const success = await redeemCoins(userId, item.cost, item.name, item.id);
 *     if (success) {
 *         alert('Redeemed successfully!');
 *     } else {
 *         alert('Insufficient coins');
 *     }
 * };
 */

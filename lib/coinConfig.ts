// Coin System Configuration
// This file contains all the coin earning rates and rewards for the platform

export const COIN_CONFIG = {
    // Customer Earning Rates
    BOOKING_COMPLETION: 0,      // Guests disabled from earning (was 25)
    REFERRAL_BONUS: 50,         // Coins earned when someone uses your referral
    DAILY_CHECK_IN: 0,          // Guests disabled from earning (was 5)
    
    // Therapist Earning Rates
    THERAPIST_BOOKING_COMPLETION: 15,  // Coins for completing a booking
    THERAPIST_5_STAR_BONUS: 10,        // Bonus for 5-star rating
    THERAPIST_WEEKLY_60_HOURS: 10,     // Bonus for working 60+ hours/week (reduced from 100 for 40+ hours)
    THERAPIST_MONTHLY_PERFECT_RATING: 200, // Bonus for maintaining 5.0 rating all month
    THERAPIST_STREAK_BONUS: 25,        // Bonus for 7+ consecutive days working
    THERAPIST_EARLY_BIRD_BONUS: 5,     // Bonus for accepting bookings within 5 minutes
    THERAPIST_WEEKEND_BONUS: 20,       // Extra coins for weekend bookings
    
    // Massage Place Earning Rates
    PLACE_BOOKING_COMPLETION: 12,      // Coins for completed booking
    PLACE_5_STAR_BONUS: 8,            // Bonus for 5-star rating
    PLACE_WEEKLY_10_BOOKINGS: 75,     // Bonus for 10+ bookings per week
    PLACE_MONTHLY_HIGH_VOLUME: 150,   // Bonus for 50+ bookings per month
    PLACE_CUSTOMER_RETENTION: 30,     // Bonus when customer books again within 30 days
    PLACE_PREMIUM_SERVICE_BONUS: 15,  // Bonus for 120-minute bookings
    
    // Hotel/Villa Earning Rates
    HOTEL_GUEST_BOOKING: 10,          // Coins when guest books through hotel (reduced from 20)
    HOTEL_CHAT_BOOKING: 25,           // Extra coins for chat-initiated bookings
    HOTEL_COMMISSION_CONFIRMATION: 5, // Coins for confirming payment receipt (reduced from 10)
    HOTEL_WEEKLY_ACTIVITY: 50,        // Bonus for 5+ guest bookings per week
    HOTEL_MONTHLY_PARTNERSHIP: 100,   // Bonus for active monthly partnership
    
    VILLA_GUEST_BOOKING: 10,          // Coins when guest books through villa (reduced from 20)
    VILLA_CHAT_BOOKING: 25,           // Extra coins for chat-initiated bookings
    VILLA_COMMISSION_CONFIRMATION: 5, // Coins for confirming payment receipt (reduced from 10)
    VILLA_WEEKLY_ACTIVITY: 50,        // Bonus for 5+ guest bookings per week
    VILLA_MONTHLY_PARTNERSHIP: 100,   // Bonus for active monthly partnership
    
    // Admin Earning Rates
    ADMIN_DAILY_SYSTEM_CHECK: 20,     // Coins for daily system maintenance
    ADMIN_DISPUTE_RESOLUTION: 15,     // Coins for resolving customer disputes
    ADMIN_CONTENT_MODERATION: 10,     // Coins for moderating reviews/content
    
    // Agent Earning Rates  
    AGENT_VISIT_COMPLETION: 30,       // Coins for completing provider visits
    AGENT_MEMBERSHIP_SIGNUP: 100,     // Bonus when provider signs membership
    AGENT_MONTHLY_TARGET: 200,        // Bonus for meeting monthly visit targets

    // Promoter / Partnership Earning Rates (new)
    PROMOTER_TASK_COMPLETION: 10,     // Standard promoter task reward (was 5)
    PROMOTER_BOOKING_ATTRIBUTION: 10, // Coins per attributed booking
    PROMOTER_MONTHLY_TARGET: 150,     // Bonus for meeting monthly booking attribution target
    
    // Universal Bonuses
    LOYALTY_TIER_BONUS: {
        BRONZE: 10,             // +10 coins bonus for bronze tier
        SILVER: 12,             // +12 coins bonus for silver tier  
        GOLD: 15,               // +15 coins bonus for gold tier
        PLATINUM: 15            // +15 coins bonus for platinum tier
    },
    
    // Activity Thresholds
    THERAPIST_WEEKLY_HOURS_THRESHOLD: 40,      // Hours needed for weekly bonus
    PLACE_WEEKLY_BOOKINGS_THRESHOLD: 10,       // Bookings needed for weekly bonus
    PLACE_MONTHLY_BOOKINGS_THRESHOLD: 50,      // Bookings needed for monthly bonus
    HOTEL_VILLA_WEEKLY_THRESHOLD: 5,           // Guest bookings needed for weekly bonus
    
    // Rating Thresholds
    PERFECT_RATING: 5.0,                       // Rating needed for perfect bonuses
    HIGH_RATING_THRESHOLD: 4.8,                // Rating threshold for bonuses
    
    // Time-based Bonuses
    EARLY_ACCEPTANCE_MINUTES: 5,               // Minutes to accept for early bird bonus
    WEEKEND_DAYS: ['saturday', 'sunday'],      // Days that count as weekend
    
    // Legacy Customer Bonuses (for backward compatibility)
    FIRST_BOOKING_BONUS: 50,    // Extra bonus for first booking
    WEEKLY_STREAK_BONUS: 25,    // Bonus for booking same day of week
    MONTHLY_LOYALTY_BONUS: 100, // Bonus for 4+ bookings in a month
    
    // Loyalty Tier Requirements (number of bookings needed)
    LOYALTY_TIER_REQUIREMENTS: {
        BRONZE: 5,              // 5 completed bookings
        SILVER: 15,             // 15 completed bookings
        GOLD: 30,               // 30 completed bookings
        PLATINUM: 50            // 50 completed bookings
    },
    
    // Referral System
    REFERRER_REWARD: 50,        // Coins for person who referred
    REFEREE_WELCOME_BONUS: 25,  // Welcome bonus for new user who was referred
    
    // Daily Check-in Streak Multipliers
    CHECK_IN_STREAK_MULTIPLIER: {
        7: 2,   // 2x coins after 7 day streak
        14: 3,  // 3x coins after 14 day streak  
        30: 5   // 5x coins after 30 day streak
    }
};

// Helper function to calculate total coins earned for a booking
export const calculateBookingCoins = (
    isFirstBooking: boolean = false,
    loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | null = null,
    hasWeeklyStreak: boolean = false
): number => {
    let totalCoins = COIN_CONFIG.BOOKING_COMPLETION;
    
    // Add first booking bonus
    if (isFirstBooking) {
        totalCoins += COIN_CONFIG.FIRST_BOOKING_BONUS;
    }
    
    // Add loyalty tier bonus
    if (loyaltyTier && COIN_CONFIG.LOYALTY_TIER_BONUS[loyaltyTier]) {
        totalCoins += COIN_CONFIG.LOYALTY_TIER_BONUS[loyaltyTier];
    }
    
    // Add weekly streak bonus
    if (hasWeeklyStreak) {
        totalCoins += COIN_CONFIG.WEEKLY_STREAK_BONUS;
    }
    
    return totalCoins;
};

// Helper function to calculate daily check-in coins
export const calculateDailyCheckInCoins = (streakDays: number): number => {
    let baseCoins = COIN_CONFIG.DAILY_CHECK_IN;
    
    // Apply streak multipliers
    for (const [days, multiplier] of Object.entries(COIN_CONFIG.CHECK_IN_STREAK_MULTIPLIER)) {
        if (streakDays >= parseInt(days)) {
            baseCoins = COIN_CONFIG.DAILY_CHECK_IN * multiplier;
        }
    }
    
    return baseCoins;
};

// Helper function to determine loyalty tier based on completed bookings
export const getLoyaltyTier = (completedBookings: number): 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | null => {
    if (completedBookings >= COIN_CONFIG.LOYALTY_TIER_REQUIREMENTS.PLATINUM) return 'PLATINUM';
    if (completedBookings >= COIN_CONFIG.LOYALTY_TIER_REQUIREMENTS.GOLD) return 'GOLD';
    if (completedBookings >= COIN_CONFIG.LOYALTY_TIER_REQUIREMENTS.SILVER) return 'SILVER';
    if (completedBookings >= COIN_CONFIG.LOYALTY_TIER_REQUIREMENTS.BRONZE) return 'BRONZE';
    return null;
};
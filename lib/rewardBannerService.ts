/**
 * Reward Banner Display Service
 * Handles displaying reward banners when users earn coins
 */

export type UserType = 'user' | 'therapist' | 'place' | 'admin' | 'agent' | 'hotel' | 'villa';
export type RewardType = 'daily-signin' | 'booking-completion' | 'milestone' | 'referral';

export interface RewardBannerData {
    type: RewardType;
    userType: UserType;
    coinAmount: number;
    bannerNumber: number;
    title: string;
    subtitle: string;
}

// Mapping of reward types to banner configurations
const BANNER_CONFIGS: Record<RewardType, {
    user: { coins: number; bannerNumber: number; title: string; subtitle: string }[];
    therapist: { coins: number; bannerNumber: number; title: string; subtitle: string }[];
    place: { coins: number; bannerNumber: number; title: string; subtitle: string }[];
}> = {
    'daily-signin': {
        user: [
            { coins: 10, bannerNumber: 1, title: 'Daily Check-in!', subtitle: 'Welcome back! Keep your streak going!' },
            { coins: 15, bannerNumber: 2, title: 'Day 2 Streak!', subtitle: 'You\'re building a great habit!' },
            { coins: 25, bannerNumber: 3, title: 'Week Warrior!', subtitle: '7 days in a row - amazing!' }
        ],
        therapist: [
            { coins: 20, bannerNumber: 11, title: 'Therapist Daily Bonus!', subtitle: 'Ready to help customers today!' },
            { coins: 25, bannerNumber: 12, title: 'Professional Dedication!', subtitle: 'Your consistency is inspiring!' }
        ],
        place: [
            { coins: 25, bannerNumber: 16, title: 'Business Daily Check!', subtitle: 'Another day serving customers!' },
            { coins: 30, bannerNumber: 17, title: 'Place Commitment!', subtitle: 'Your dedication shows!' }
        ]
    },
    'booking-completion': {
        user: [
            { coins: 50, bannerNumber: 4, title: 'Booking Completed!', subtitle: 'Thank you for your business!' },
            { coins: 100, bannerNumber: 5, title: 'Loyal Customer!', subtitle: 'Your 5th booking milestone!' }
        ],
        therapist: [
            { coins: 30, bannerNumber: 13, title: 'Service Complete!', subtitle: 'Another satisfied customer!' },
            { coins: 50, bannerNumber: 14, title: 'Professional Excellence!', subtitle: '10 bookings completed!' }
        ],
        place: [
            { coins: 25, bannerNumber: 18, title: 'Booking Facilitated!', subtitle: 'Great service coordination!' },
            { coins: 30, bannerNumber: 19, title: 'Business Success!', subtitle: 'Multiple bookings completed!' }
        ]
    },
    'milestone': {
        user: [
            { coins: 200, bannerNumber: 6, title: 'Milestone Master!', subtitle: '10 bookings achieved!' },
            { coins: 500, bannerNumber: 7, title: 'VIP Customer!', subtitle: '25 bookings - you\'re amazing!' }
        ],
        therapist: [
            { coins: 40, bannerNumber: 15, title: 'Therapy Master!', subtitle: '25 successful sessions!' }
        ],
        place: [
            { coins: 30, bannerNumber: 20, title: 'Place Excellence!', subtitle: 'Top-rated business achievement!' }
        ]
    },
    'referral': {
        user: [
            { coins: 100, bannerNumber: 8, title: 'Referral Reward!', subtitle: 'Thanks for sharing the love!' }
        ],
        therapist: [
            { coins: 50, bannerNumber: 15, title: 'Network Builder!', subtitle: 'Growing our therapist community!' }
        ],
        place: [
            { coins: 30, bannerNumber: 21, title: 'Partnership Bonus!', subtitle: 'Expanding our network!' }
        ]
    }
};

class RewardBannerService {
    private bannerQueue: RewardBannerData[] = [];
    private displayCallback: ((banner: RewardBannerData) => void) | null = null;
    private isDisplaying = false;

    /**
     * Set the callback function that will display the banner
     */
    setDisplayCallback(callback: (banner: RewardBannerData) => void) {
        this.displayCallback = callback;
    }

    /**
     * Queue a reward banner for display
     */
    queueRewardBanner(
        userType: UserType,
        rewardType: RewardType,
        coinAmount: number,
        dayStreak?: number,
        totalBookings?: number
    ) {
        const bannerConfig = this.getBannerConfig(userType, rewardType, coinAmount, dayStreak, totalBookings);
        if (bannerConfig) {
            this.bannerQueue.push(bannerConfig);
            this.processQueue();
        }
    }

    /**
     * Get the appropriate banner configuration
     */
    private getBannerConfig(
        userType: UserType,
        rewardType: RewardType,
        coinAmount: number,
        dayStreak?: number,
        totalBookings?: number
    ): RewardBannerData | null {
        // Map user types to our config keys
        const configUserType = this.mapUserType(userType);
        const configs = BANNER_CONFIGS[rewardType]?.[configUserType];
        
        if (!configs) return null;

        // Find the best matching config
        let selectedConfig = configs[0]; // Default to first config
        
        if (rewardType === 'daily-signin' && dayStreak) {
            if (dayStreak >= 7) {
                selectedConfig = configs[2] || configs[1] || configs[0];
            } else if (dayStreak >= 2) {
                selectedConfig = configs[1] || configs[0];
            }
        } else if (rewardType === 'booking-completion' && totalBookings) {
            if (totalBookings >= 10) {
                selectedConfig = configs[1] || configs[0];
            }
        } else if (rewardType === 'milestone') {
            // Choose based on coin amount or booking count
            const bestMatch = configs.find(c => c.coins <= coinAmount) || configs[0];
            selectedConfig = bestMatch;
        }

        return {
            type: rewardType,
            userType,
            coinAmount: selectedConfig.coins,
            bannerNumber: selectedConfig.bannerNumber,
            title: selectedConfig.title,
            subtitle: selectedConfig.subtitle
        };
    }

    /**
     * Map various user types to our config categories
     */
    private mapUserType(userType: UserType): 'user' | 'therapist' | 'place' {
        switch (userType) {
            case 'therapist':
                return 'therapist';
            case 'place':
            case 'hotel':
            case 'villa':
            case 'admin':
                return 'place';
            default:
                return 'user';
        }
    }

    /**
     * Process the banner queue
     */
    private async processQueue() {
        if (this.isDisplaying || this.bannerQueue.length === 0 || !this.displayCallback) {
            return;
        }

        this.isDisplaying = true;
        const banner = this.bannerQueue.shift()!;
        
        try {
            this.displayCallback(banner);
            // Wait for banner display duration
            await new Promise(resolve => setTimeout(resolve, 4000));
        } finally {
            this.isDisplaying = false;
            // Process next banner if any
            if (this.bannerQueue.length > 0) {
                setTimeout(() => this.processQueue(), 500);
            }
        }
    }

    /**
     * Clear all queued banners
     */
    clearQueue() {
        this.bannerQueue = [];
        this.isDisplaying = false;
    }
}

export const rewardBannerService = new RewardBannerService();
export default rewardBannerService;
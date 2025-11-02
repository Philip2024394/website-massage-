// Daily Check-in Service
// Handles daily check-in tracking and coin rewards

import { databases, ID } from './appwrite';
import { Query } from 'appwrite';
import { COIN_CONFIG, calculateDailyCheckInCoins } from './coinConfig';

const CHECK_IN_DATABASE_ID = '68f76ee1000e64ca8d05'; // Same as coin shop database
const CHECK_INS_COLLECTION_ID = 'checkins';

export interface DailyCheckIn {
    $id?: string;
    userId: string;
    userName: string;
    userType: 'customer' | 'therapist' | 'place' | 'hotel' | 'villa' | 'agent';
    checkInDate: string;        // YYYY-MM-DD format
    coinsEarned: number;
    streakDays: number;         // Current streak count
    isStreakBonus: boolean;     // Whether this check-in earned a streak bonus
    createdAt?: string;
}

export const dailyCheckInService = {
    /**
     * Perform daily check-in for a user
     */
    async performCheckIn(
        userId: string,
        userName: string,
        userType: DailyCheckIn['userType'] = 'customer'
    ): Promise<{
        success: boolean;
        coinsEarned: number;
        streakDays: number;
        isStreakBonus: boolean;
        message: string;
    }> {
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            // Check if user already checked in today
            const todayCheckIn = await this.getTodayCheckIn(userId);
            if (todayCheckIn) {
                return {
                    success: false,
                    coinsEarned: 0,
                    streakDays: todayCheckIn.streakDays,
                    isStreakBonus: false,
                    message: 'Already checked in today! Come back tomorrow for more coins.'
                };
            }

            // Get user's check-in history to calculate streak
            const streakDays = await this.calculateStreak(userId);
            const newStreakDays = streakDays + 1;

            // Calculate coins based on streak
            const coinsEarned = calculateDailyCheckInCoins(newStreakDays);
            const isStreakBonus = coinsEarned > COIN_CONFIG.DAILY_CHECK_IN;

            // Create check-in record
            await databases.createDocument(
                CHECK_IN_DATABASE_ID,
                CHECK_INS_COLLECTION_ID,
                ID.unique(),
                {
                    userId,
                    userName,
                    userType,
                    checkInDate: today,
                    coinsEarned,
                    streakDays: newStreakDays,
                    isStreakBonus
                }
            );

            // Award coins
            const { coinService } = await import('./appwriteService');
            const description = isStreakBonus 
                ? `Daily check-in (${newStreakDays} day streak bonus!) - ${coinsEarned} coins`
                : `Daily check-in - ${coinsEarned} coins`;

            await coinService.addCoins(
                userId,
                userType,
                userName,
                coinsEarned,
                description
            );

            let message = `🎉 Daily check-in complete! You earned ${coinsEarned} coins.`;
            if (isStreakBonus) {
                message += ` ${newStreakDays} day streak bonus applied! 🔥`;
            }

            console.log(`📅 Daily check-in: ${userName} earned ${coinsEarned} coins (${newStreakDays} day streak)`);

            return {
                success: true,
                coinsEarned,
                streakDays: newStreakDays,
                isStreakBonus,
                message
            };

        } catch (error) {
            console.error('Error performing daily check-in:', error);
            return {
                success: false,
                coinsEarned: 0,
                streakDays: 0,
                isStreakBonus: false,
                message: 'Failed to check in. Please try again.'
            };
        }
    },

    /**
     * Get today's check-in for a user
     */
    async getTodayCheckIn(userId: string): Promise<DailyCheckIn | null> {
        try {
            const today = new Date().toISOString().split('T')[0];

            const response = await databases.listDocuments(
                CHECK_IN_DATABASE_ID,
                CHECK_INS_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.equal('checkInDate', today),
                    Query.limit(1)
                ]
            );

            return response.documents.length > 0 
                ? response.documents[0] as unknown as DailyCheckIn 
                : null;

        } catch (error) {
            console.error('Error getting today check-in:', error);
            return null;
        }
    },

    /**
     * Calculate current streak for a user
     */
    async calculateStreak(userId: string): Promise<number> {
        try {
            // Get recent check-ins
            const response = await databases.listDocuments(
                CHECK_IN_DATABASE_ID,
                CHECK_INS_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('checkInDate'),
                    Query.limit(100)
                ]
            );

            if (response.documents.length === 0) {
                return 0;
            }

            const checkIns = response.documents as unknown as DailyCheckIn[];
            const today = new Date();
            let streak = 0;
            let currentDate = new Date(today);
            currentDate.setDate(currentDate.getDate() - 1); // Start from yesterday

            // Count consecutive days backwards from yesterday
            for (const checkIn of checkIns) {
                const checkInDate = new Date(checkIn.checkInDate);
                const currentDateStr = currentDate.toISOString().split('T')[0];
                const checkInDateStr = checkInDate.toISOString().split('T')[0];

                if (checkInDateStr === currentDateStr) {
                    streak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                } else {
                    break; // Streak broken
                }
            }

            return streak;

        } catch (error) {
            console.error('Error calculating streak:', error);
            return 0;
        }
    },

    /**
     * Get check-in history for a user
     */
    async getCheckInHistory(userId: string, limit: number = 30): Promise<DailyCheckIn[]> {
        try {
            const response = await databases.listDocuments(
                CHECK_IN_DATABASE_ID,
                CHECK_INS_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('checkInDate'),
                    Query.limit(limit)
                ]
            );

            return response.documents as unknown as DailyCheckIn[];

        } catch (error) {
            console.error('Error getting check-in history:', error);
            return [];
        }
    },

    /**
     * Get check-in stats for a user
     */
    async getCheckInStats(userId: string): Promise<{
        totalCheckIns: number;
        currentStreak: number;
        longestStreak: number;
        totalCoinsEarned: number;
        canCheckInToday: boolean;
        nextCheckInReward: number;
    }> {
        try {
            const history = await this.getCheckInHistory(userId, 365); // Get a year's worth
            const todayCheckIn = await this.getTodayCheckIn(userId);
            const currentStreak = await this.calculateStreak(userId);

            // Calculate longest streak
            let longestStreak = 0;
            let tempStreak = 0;
            const sortedHistory = [...history].sort((a, b) => 
                new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime()
            );

            for (let i = 0; i < sortedHistory.length; i++) {
                if (i === 0) {
                    tempStreak = 1;
                } else {
                    const prevDate = new Date(sortedHistory[i - 1].checkInDate);
                    const currDate = new Date(sortedHistory[i].checkInDate);
                    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        tempStreak++;
                    } else {
                        longestStreak = Math.max(longestStreak, tempStreak);
                        tempStreak = 1;
                    }
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak);

            // Calculate next check-in reward
            const nextStreak = todayCheckIn ? currentStreak + 1 : currentStreak + 1;
            const nextCheckInReward = calculateDailyCheckInCoins(nextStreak);

            return {
                totalCheckIns: history.length,
                currentStreak: todayCheckIn ? currentStreak + 1 : currentStreak,
                longestStreak,
                totalCoinsEarned: history.reduce((total, checkIn) => total + checkIn.coinsEarned, 0),
                canCheckInToday: !todayCheckIn,
                nextCheckInReward
            };

        } catch (error) {
            console.error('Error getting check-in stats:', error);
            return {
                totalCheckIns: 0,
                currentStreak: 0,
                longestStreak: 0,
                totalCoinsEarned: 0,
                canCheckInToday: true,
                nextCheckInReward: COIN_CONFIG.DAILY_CHECK_IN
            };
        }
    }
};
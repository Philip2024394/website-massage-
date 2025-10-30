import { databases, ID } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { Query } from 'appwrite';

export interface CoinTransaction {
    $id?: string;
    userId: string;
    amount: number;
    type: 'earn' | 'spend' | 'expire';
    reason: string;
    earnedAt: Date;
    expiryAt?: Date;
    status: 'active' | 'expired' | 'spent';
    referralCode?: string;
    referredUserId?: string;
    metadata?: any;
}

export interface CoinBalance {
    total: number;
    active: number;
    expired: number;
    spent: number;
    expiringSoon: number; // Coins expiring in next 30 days
}

export interface Referral {
    $id?: string;
    referrerId: string;
    referredUserId?: string;
    referralCode: string;
    status: 'pending' | 'completed' | 'rewarded';
    coinsAwarded: number;
    createdAt: Date;
    firstBookingAt?: Date;
    metadata?: any;
}

class CoinService {
    private readonly COLLECTION_COINS = APPWRITE_CONFIG.collections.coins || 'coins';
    private readonly COLLECTION_REFERRALS = APPWRITE_CONFIG.collections.referrals || 'referrals';
    private readonly COIN_EXPIRY_MONTHS = 12;
    private readonly REFERRAL_REWARD = 100;
    private readonly REFERRAL_WELCOME_BONUS = 50;

    /**
     * Generate unique referral code for user
     */
    generateReferralCode(userId: string): string {
        const shortId = userId.slice(0, 6).toUpperCase();
        return `INDA${shortId}`;
    }

    /**
     * Create referral entry when user signs up with referral code
     */
    async createReferral(referralCode: string, newUserId: string): Promise<Referral | null> {
        try {
            // Find the referrer by code
            const existingReferrals = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_REFERRALS,
                [Query.equal('referralCode', referralCode)]
            );

            if (existingReferrals.documents.length === 0) {
                console.error('Invalid referral code');
                return null;
            }

            const referrerId = existingReferrals.documents[0].referrerId;

            // Check if user already used a referral code
            const existingUserReferrals = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_REFERRALS,
                [Query.equal('referredUserId', newUserId)]
            );

            if (existingUserReferrals.documents.length > 0) {
                console.error('User already used a referral code');
                return null;
            }

            // Create referral record
            const referral = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_REFERRALS,
                ID.unique(),
                {
                    referrerId,
                    referredUserId: newUserId,
                    referralCode,
                    status: 'pending',
                    coinsAwarded: 0,
                    createdAt: new Date().toISOString(),
                }
            );

            // Award welcome bonus to new user
            await this.awardCoins(
                newUserId,
                this.REFERRAL_WELCOME_BONUS,
                'Welcome bonus from referral',
                { referralCode }
            );

            return referral as unknown as Referral;
        } catch (error) {
            console.error('Error creating referral:', error);
            return null;
        }
    }

    /**
     * Initialize referral code for existing user
     */
    async initializeReferralCode(userId: string): Promise<string> {
        try {
            const referralCode = this.generateReferralCode(userId);

            // Check if referral code already exists
            const existing = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_REFERRALS,
                [Query.equal('referrerId', userId), Query.limit(1)]
            );

            if (existing.documents.length > 0) {
                return existing.documents[0].referralCode;
            }

            // Create referral code entry
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_REFERRALS,
                ID.unique(),
                {
                    referrerId: userId,
                    referralCode,
                    status: 'pending',
                    coinsAwarded: 0,
                    createdAt: new Date().toISOString(),
                }
            );

            return referralCode;
        } catch (error) {
            console.error('Error initializing referral code:', error);
            return this.generateReferralCode(userId);
        }
    }

    /**
     * Process referral reward when referred user completes first booking
     */
    async processReferralReward(referredUserId: string): Promise<boolean> {
        try {
            // Find referral record
            const referrals = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_REFERRALS,
                [
                    Query.equal('referredUserId', referredUserId),
                    Query.equal('status', 'pending')
                ]
            );

            if (referrals.documents.length === 0) {
                return false;
            }

            const referral = referrals.documents[0];

            // Award coins to referrer
            await this.awardCoins(
                referral.referrerId,
                this.REFERRAL_REWARD,
                `Referral reward - ${referredUserId} completed first booking`,
                { referredUserId, referralCode: referral.referralCode }
            );

            // Update referral status
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_REFERRALS,
                referral.$id,
                {
                    status: 'rewarded',
                    coinsAwarded: this.REFERRAL_REWARD,
                    firstBookingAt: new Date().toISOString(),
                }
            );

            return true;
        } catch (error) {
            console.error('Error processing referral reward:', error);
            return false;
        }
    }

    /**
     * Award coins to user
     */
    async awardCoins(
        userId: string,
        amount: number,
        reason: string,
        metadata?: any
    ): Promise<CoinTransaction | null> {
        try {
            const now = new Date();
            const expiryDate = new Date(now);
            expiryDate.setMonth(expiryDate.getMonth() + this.COIN_EXPIRY_MONTHS);

            const transaction: any = {
                userId,
                amount,
                type: 'earn',
                reason,
                earnedAt: now.toISOString(),
                expiryAt: expiryDate.toISOString(),
                status: 'active',
                metadata: metadata ? JSON.stringify(metadata) : null,
            };

            const result = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_COINS,
                ID.unique(),
                transaction
            );

            return result as unknown as CoinTransaction;
        } catch (error) {
            console.error('Error awarding coins:', error);
            return null;
        }
    }

    /**
     * Spend coins (FIFO - oldest first)
     */
    async spendCoins(
        userId: string,
        amount: number,
        reason: string,
        metadata?: any
    ): Promise<boolean> {
        try {
            // Get active coins sorted by earnedAt (oldest first)
            const activeCoins = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_COINS,
                [
                    Query.equal('userId', userId),
                    Query.equal('status', 'active'),
                    Query.equal('type', 'earn'),
                    Query.orderAsc('earnedAt'),
                    Query.limit(100)
                ]
            );

            // Calculate total available coins
            const totalAvailable = activeCoins.documents.reduce(
                (sum, doc) => sum + doc.amount,
                0
            );

            if (totalAvailable < amount) {
                throw new Error('Insufficient coins');
            }

            // Deduct coins using FIFO
            let remaining = amount;
            for (const coin of activeCoins.documents) {
                if (remaining <= 0) break;

                if (coin.amount <= remaining) {
                    // Use entire coin transaction
                    await databases.updateDocument(
                        APPWRITE_CONFIG.databaseId,
                        this.COLLECTION_COINS,
                        coin.$id,
                        { status: 'spent' }
                    );
                    remaining -= coin.amount;
                } else {
                    // Partial use - need to split transaction
                    const usedAmount = remaining;
                    const remainingAmount = coin.amount - usedAmount;

                    // Mark original as spent
                    await databases.updateDocument(
                        APPWRITE_CONFIG.databaseId,
                        this.COLLECTION_COINS,
                        coin.$id,
                        { status: 'spent', amount: usedAmount }
                    );

                    // Create new transaction for remaining amount
                    await databases.createDocument(
                        APPWRITE_CONFIG.databaseId,
                        this.COLLECTION_COINS,
                        ID.unique(),
                        {
                            userId,
                            amount: remainingAmount,
                            type: 'earn',
                            reason: coin.reason,
                            earnedAt: coin.earnedAt,
                            expiryAt: coin.expiryAt,
                            status: 'active',
                            metadata: coin.metadata,
                        }
                    );

                    remaining = 0;
                }
            }

            // Record spending transaction
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_COINS,
                ID.unique(),
                {
                    userId,
                    amount: -amount,
                    type: 'spend',
                    reason,
                    earnedAt: new Date().toISOString(),
                    status: 'active',
                    metadata: metadata ? JSON.stringify(metadata) : null,
                }
            );

            return true;
        } catch (error) {
            console.error('Error spending coins:', error);
            return false;
        }
    }

    /**
     * Get user's coin balance
     */
    async getCoinBalance(userId: string): Promise<CoinBalance> {
        try {
            const transactions = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_COINS,
                [Query.equal('userId', userId), Query.limit(1000)]
            );

            const now = new Date();
            const thirtyDaysFromNow = new Date(now);
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

            let total = 0;
            let active = 0;
            let expired = 0;
            let spent = 0;
            let expiringSoon = 0;

            transactions.documents.forEach((doc) => {
                if (doc.type === 'earn' && doc.status === 'active') {
                    active += doc.amount;
                    total += doc.amount;

                    // Check if expiring soon
                    if (doc.expiryAt) {
                        const expiryDate = new Date(doc.expiryAt);
                        if (expiryDate <= thirtyDaysFromNow) {
                            expiringSoon += doc.amount;
                        }
                    }
                } else if (doc.type === 'spend') {
                    spent += Math.abs(doc.amount);
                } else if (doc.status === 'expired') {
                    expired += doc.amount;
                }
            });

            return {
                total: active,
                active,
                expired,
                spent,
                expiringSoon,
            };
        } catch (error) {
            console.error('Error getting coin balance:', error);
            return {
                total: 0,
                active: 0,
                expired: 0,
                spent: 0,
                expiringSoon: 0,
            };
        }
    }

    /**
     * Get user's transaction history
     */
    async getTransactionHistory(
        userId: string,
        limit: number = 50
    ): Promise<CoinTransaction[]> {
        try {
            const transactions = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_COINS,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('earnedAt'),
                    Query.limit(limit)
                ]
            );

            return transactions.documents.map(doc => ({
                ...doc,
                earnedAt: new Date(doc.earnedAt),
                expiryAt: doc.expiryAt ? new Date(doc.expiryAt) : undefined,
            })) as unknown as CoinTransaction[];
        } catch (error) {
            console.error('Error getting transaction history:', error);
            return [];
        }
    }

    /**
     * Get referral statistics
     */
    async getReferralStats(userId: string): Promise<{
        totalReferrals: number;
        activeReferrals: number;
        coinsEarned: number;
        pendingRewards: number;
        thisMonthReferrals: number;
    }> {
        try {
            const referrals = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_REFERRALS,
                [Query.equal('referrerId', userId), Query.limit(100)]
            );

            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            let totalReferrals = 0;
            let activeReferrals = 0;
            let coinsEarned = 0;
            let pendingRewards = 0;
            let thisMonthReferrals = 0;

            referrals.documents.forEach((doc) => {
                if (doc.referredUserId) {
                    totalReferrals++;

                    const createdAt = new Date(doc.createdAt);
                    if (createdAt >= firstDayOfMonth) {
                        thisMonthReferrals++;
                    }

                    if (doc.status === 'rewarded') {
                        activeReferrals++;
                        coinsEarned += doc.coinsAwarded || 0;
                    } else if (doc.status === 'completed') {
                        pendingRewards += this.REFERRAL_REWARD;
                    }
                }
            });

            return {
                totalReferrals,
                activeReferrals,
                coinsEarned,
                pendingRewards,
                thisMonthReferrals,
            };
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
     * Expire old coins (should be run daily via cron)
     */
    async expireOldCoins(): Promise<number> {
        try {
            const now = new Date();
            const activeCoins = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_COINS,
                [
                    Query.equal('status', 'active'),
                    Query.equal('type', 'earn'),
                    Query.limit(1000)
                ]
            );

            let expiredCount = 0;

            for (const coin of activeCoins.documents) {
                if (coin.expiryAt) {
                    const expiryDate = new Date(coin.expiryAt);
                    if (expiryDate <= now) {
                        // Mark as expired
                        await databases.updateDocument(
                            APPWRITE_CONFIG.databaseId,
                            this.COLLECTION_COINS,
                            coin.$id,
                            { status: 'expired' }
                        );

                        // Create expiration transaction record
                        await databases.createDocument(
                            APPWRITE_CONFIG.databaseId,
                            this.COLLECTION_COINS,
                            ID.unique(),
                            {
                                userId: coin.userId,
                                amount: -coin.amount,
                                type: 'expire',
                                reason: 'Coins expired (12 months inactivity)',
                                earnedAt: new Date().toISOString(),
                                status: 'expired',
                            }
                        );

                        expiredCount++;
                    }
                }
            }

            return expiredCount;
        } catch (error) {
            console.error('Error expiring old coins:', error);
            return 0;
        }
    }

    /**
     * Get users with coins expiring soon (for notifications)
     */
    async getUsersWithExpiringSoonCoins(daysUntilExpiry: number = 30): Promise<{
        userId: string;
        expiringAmount: number;
        expiryDate: Date;
    }[]> {
        try {
            const now = new Date();
            const futureDate = new Date(now);
            futureDate.setDate(futureDate.getDate() + daysUntilExpiry);

            const activeCoins = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.COLLECTION_COINS,
                [
                    Query.equal('status', 'active'),
                    Query.equal('type', 'earn'),
                    Query.limit(1000)
                ]
            );

            const userExpiryMap = new Map<string, { amount: number; date: Date }>();

            activeCoins.documents.forEach((coin) => {
                if (coin.expiryAt) {
                    const expiryDate = new Date(coin.expiryAt);
                    if (expiryDate <= futureDate && expiryDate > now) {
                        const existing = userExpiryMap.get(coin.userId);
                        if (existing) {
                            existing.amount += coin.amount;
                            if (expiryDate < existing.date) {
                                existing.date = expiryDate;
                            }
                        } else {
                            userExpiryMap.set(coin.userId, {
                                amount: coin.amount,
                                date: expiryDate,
                            });
                        }
                    }
                }
            });

            return Array.from(userExpiryMap.entries()).map(([userId, data]) => ({
                userId,
                expiringAmount: data.amount,
                expiryDate: data.date,
            }));
        } catch (error) {
            console.error('Error getting users with expiring coins:', error);
            return [];
        }
    }

    /**
     * Award daily sign-in coins
     */
    async awardDailySignIn(userId: string, dayStreak: number): Promise<CoinTransaction | null> {
        try {
            let amount = 10; // Day 1
            let reason = 'Daily sign-in - Day 1';

            if (dayStreak === 7) {
                amount = 15;
                reason = 'Daily sign-in - Day 7 streak';
            } else if (dayStreak === 30) {
                amount = 50;
                reason = 'Daily sign-in - Day 30 streak';
            }

            return await this.awardCoins(userId, amount, reason, { dayStreak });
        } catch (error) {
            console.error('Error awarding daily sign-in:', error);
            return null;
        }
    }

    /**
     * Award booking completion coins
     */
    async awardBookingCompletion(
        userId: string,
        bookingNumber: number,
        isFirstBooking: boolean = false
    ): Promise<CoinTransaction | null> {
        try {
            let amount = 50;
            let reason = 'Booking completed';

            if (isFirstBooking) {
                amount = 100;
                reason = 'First booking completed';
            } else if (bookingNumber === 5) {
                amount = 200;
                reason = '5th booking milestone';
            } else if (bookingNumber === 10) {
                amount = 500;
                reason = '10th booking milestone';
            }

            return await this.awardCoins(userId, amount, reason, { bookingNumber });
        } catch (error) {
            console.error('Error awarding booking completion:', error);
            return null;
        }
    }
}

export const coinService = new CoinService();

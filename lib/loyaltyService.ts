import { databases } from './appwrite';
import APPWRITE_CONFIG from './appwrite.config';
import { Query } from 'appwrite';
import {
    LoyaltyWallet,
    ProviderLoyaltySettings,
    CoinTransaction,
    LoyaltyWalletStatus,
    CoinTransactionType,
    LoyaltyEarnedEvent
} from '../types';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const collections = APPWRITE_CONFIG.collections;

// ============================================
// PROVIDER LOYALTY SETTINGS
// ============================================

/**
 * Get or create default loyalty settings for a provider
 */
export const getProviderSettings = async (
    providerId: number,
    providerType: 'therapist' | 'place',
    providerName: string
): Promise<ProviderLoyaltySettings> => {
    try {
        // Try to find existing settings
        const response = await databases.listDocuments(
            DATABASE_ID,
            collections.providerLoyaltySettings,
            [
                Query.equal('providerId', providerId),
                Query.equal('providerType', providerType)
            ]
        );

        if (response.documents.length > 0) {
            return response.documents[0] as unknown as ProviderLoyaltySettings;
        }

        // Create default settings
        const providerCoinId = providerType === 'therapist' 
            ? `T${String(providerId).padStart(3, '0')}-COINS`
            : `P${String(providerId).padStart(3, '0')}-COINS`;

        const defaultSettings: Omit<ProviderLoyaltySettings, '$id'> = {
            providerId,
            providerType,
            providerName,
            providerCoinId,
            tier1: { visits: 3, discount: 5, coinsRequired: 15 },
            tier2: { visits: 5, discount: 10, coinsRequired: 25 },
            tier3: { visits: 10, discount: 15, coinsRequired: 50 },
            tier4: { visits: 20, discount: 20, coinsRequired: 100 },
            coinsPerVisit: 5,
            enableDecay: true,
            decayGracePeriod: 14,
            streakBonus: true,
            birthdayBonus: 10,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const created = await databases.createDocument(
            DATABASE_ID,
            collections.providerLoyaltySettings,
            'unique()',
            defaultSettings
        );

        return created as unknown as ProviderLoyaltySettings;
    } catch (error) {
        console.error('Error getting provider settings:', error);
        throw error;
    }
};

/**
 * Update provider loyalty settings
 */
export const updateProviderSettings = async (
    settingsId: string,
    updates: Partial<ProviderLoyaltySettings>
): Promise<ProviderLoyaltySettings> => {
    try {
        const updated = await databases.updateDocument(
            DATABASE_ID,
            collections.providerLoyaltySettings,
            settingsId,
            {
                ...updates,
                updatedAt: new Date().toISOString()
            }
        );

        return updated as unknown as ProviderLoyaltySettings;
    } catch (error) {
        console.error('Error updating provider settings:', error);
        throw error;
    }
};

// ============================================
// WALLET MANAGEMENT
// ============================================

/**
 * Get or create a loyalty wallet for a user and provider
 */
export const getOrCreateWallet = async (
    userId: string,
    providerId: number,
    providerType: 'therapist' | 'place',
    providerName: string
): Promise<LoyaltyWallet> => {
    try {
        // Try to find existing wallet
        const response = await databases.listDocuments(
            DATABASE_ID,
            collections.loyaltyWallets,
            [
                Query.equal('userId', userId),
                Query.equal('providerId', providerId),
                Query.equal('providerType', providerType)
            ]
        );

        if (response.documents.length > 0) {
            return response.documents[0] as unknown as LoyaltyWallet;
        }

        // Get provider settings to get coin ID
        const settings = await getProviderSettings(providerId, providerType, providerName);

        // Create new wallet
        const newWallet: Omit<LoyaltyWallet, '$id'> = {
            userId,
            providerId,
            providerType,
            providerName,
            providerCoinId: settings.providerCoinId,
            totalCoins: 0,
            coinsEarned: 0,
            coinsRedeemed: 0,
            totalVisits: 0,
            firstVisitDate: new Date().toISOString(),
            decayRate: 0,
            currentTier: 0,
            currentDiscount: 0,
            status: LoyaltyWalletStatus.Active,
            streak: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const created = await databases.createDocument(
            DATABASE_ID,
            collections.loyaltyWallets,
            'unique()',
            newWallet
        );

        return created as unknown as LoyaltyWallet;
    } catch (error) {
        console.error('Error getting/creating wallet:', error);
        throw error;
    }
};

/**
 * Get all wallets for a user
 */
export const getUserWallets = async (userId: string): Promise<LoyaltyWallet[]> => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            collections.loyaltyWallets,
            [
                Query.equal('userId', userId),
                Query.orderDesc('totalCoins')
            ]
        );

        return response.documents as unknown as LoyaltyWallet[];
    } catch (error) {
        const msg = (error as any)?.message || '';
        const code = (error as any)?.code;
        if (code === 404 || /could not be found/i.test(msg)) {
            console.warn('loyalty_wallets collection missing; returning empty wallets.');
            return [];
        }
        console.error('Error getting user wallets:', error);
        return [];
    }
};

/**
 * Get wallet by ID
 */
export const getWalletById = async (walletId: string): Promise<LoyaltyWallet> => {
    try {
        const wallet = await databases.getDocument(
            DATABASE_ID,
            collections.loyaltyWallets,
            walletId
        );

        return wallet as unknown as LoyaltyWallet;
    } catch (error) {
        console.error('Error getting wallet:', error);
        throw error;
    }
};

// ============================================
// TIER CALCULATION
// ============================================

/**
 * Calculate current tier based on visits and coins
 */
const calculateTier = (
    totalVisits: number,
    totalCoins: number,
    settings: ProviderLoyaltySettings
): { tier: number; discount: number } => {
    const tiers = [settings.tier1, settings.tier2, settings.tier3, settings.tier4];
    
    let currentTier = 0;
    let currentDiscount = 0;

    for (let i = tiers.length - 1; i >= 0; i--) {
        const tier = tiers[i];
        if (totalVisits >= tier.visits && totalCoins >= tier.coinsRequired) {
            currentTier = i + 1;
            currentDiscount = tier.discount;
            break;
        }
    }

    return { tier: currentTier, discount: currentDiscount };
};

// ============================================
// COIN OPERATIONS
// ============================================

/**
 * Award coins to a user after a booking
 */
export const awardCoins = async (
    userId: string,
    providerId: number,
    providerType: 'therapist' | 'place',
    providerName: string,
    bookingId: number
): Promise<LoyaltyEarnedEvent> => {
    try {
        // Get or create wallet
        const wallet = await getOrCreateWallet(userId, providerId, providerType, providerName);
        const settings = await getProviderSettings(providerId, providerType, providerName);

        // Calculate coins to award
        let coinsToAward = settings.coinsPerVisit;

        // Check for streak bonus
        const now = new Date();
        const lastVisit = wallet.lastVisitDate ? new Date(wallet.lastVisitDate) : null;
        let newStreak = wallet.streak;

        if (lastVisit) {
            const daysSinceLastVisit = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLastVisit <= 7) {
                // Within a week - continue streak
                newStreak = wallet.streak + 1;
                if (settings.streakBonus && newStreak >= 3) {
                    coinsToAward += 2; // Bonus for 3+ consecutive bookings
                }
            } else {
                // Streak broken
                newStreak = 1;
            }
        } else {
            newStreak = 1;
        }

        // Update wallet
        const newTotalCoins = wallet.totalCoins + coinsToAward;
        const newTotalVisits = wallet.totalVisits + 1;
        const newCoinsEarned = wallet.coinsEarned + coinsToAward;

        // Calculate new tier
        const { tier: newTier, discount: newDiscount } = calculateTier(
            newTotalVisits,
            newTotalCoins,
            settings
        );

        const tierUnlocked = newTier > wallet.currentTier ? newTier : undefined;
        const discountUnlocked = tierUnlocked ? newDiscount : undefined;

        // Update wallet
        await databases.updateDocument(
            DATABASE_ID,
            collections.loyaltyWallets,
            wallet.$id!,
            {
                totalCoins: newTotalCoins,
                coinsEarned: newCoinsEarned,
                totalVisits: newTotalVisits,
                lastVisitDate: now.toISOString(),
                currentTier: newTier,
                currentDiscount: newDiscount,
                streak: newStreak,
                status: LoyaltyWalletStatus.Active,
                updatedAt: now.toISOString()
            }
        );

        // Create transaction record
        await createTransaction(
            userId,
            wallet.$id!,
            providerId,
            providerType,
            CoinTransactionType.Earned,
            coinsToAward,
            `Earned from booking #${bookingId}`,
            wallet.totalCoins,
            newTotalCoins,
            bookingId
        );

        // Return event for UI celebration
        return {
            userId,
            providerId,
            providerType,
            providerName,
            providerCoinId: settings.providerCoinId,
            coinsEarned: coinsToAward,
            totalCoins: newTotalCoins,
            totalVisits: newTotalVisits,
            tierUnlocked: (tierUnlocked ?? 0) > 0,
            discountUnlocked: (discountUnlocked ?? 0) > 0,
            streakCount: newStreak >= 3 ? newStreak : undefined
        };
    } catch (error) {
        console.error('Error awarding coins:', error);
        throw error;
    }
};

/**
 * Redeem coins for a discount
 */
export const redeemCoins = async (
    userId: string,
    providerId: number,
    providerType: 'therapist' | 'place',
    bookingId: number,
    amount: number
): Promise<LoyaltyWallet> => {
    try {
        // Get wallet
        const response = await databases.listDocuments(
            DATABASE_ID,
            collections.loyaltyWallets,
            [
                Query.equal('userId', userId),
                Query.equal('providerId', providerId),
                Query.equal('providerType', providerType)
            ]
        );

        if (response.documents.length === 0) {
            throw new Error('Wallet not found');
        }

        const wallet = response.documents[0] as unknown as LoyaltyWallet;

        if (wallet.totalCoins < amount) {
            throw new Error('Insufficient coins');
        }

        // Update wallet
        const newTotalCoins = wallet.totalCoins - amount;
        const newCoinsRedeemed = wallet.coinsRedeemed + amount;

        await databases.updateDocument(
            DATABASE_ID,
            collections.loyaltyWallets,
            wallet.$id!,
            {
                totalCoins: newTotalCoins,
                coinsRedeemed: newCoinsRedeemed,
                updatedAt: new Date().toISOString()
            }
        );

        // Create transaction
        await createTransaction(
            userId,
            wallet.$id!,
            providerId,
            providerType,
            CoinTransactionType.Redeemed,
            -amount,
            `Redeemed for booking #${bookingId}`,
            wallet.totalCoins,
            newTotalCoins,
            bookingId
        );

        return await getWalletById(wallet.$id!);
    } catch (error) {
        console.error('Error redeeming coins:', error);
        throw error;
    }
};

/**
 * Calculate available discount for a user with a provider
 */
export const calculateDiscount = async (
    userId: string,
    providerId: number,
    providerType: 'therapist' | 'place'
): Promise<{ discount: number; tier: number; coinsAvailable: number }> => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            collections.loyaltyWallets,
            [
                Query.equal('userId', userId),
                Query.equal('providerId', providerId),
                Query.equal('providerType', providerType)
            ]
        );

        if (response.documents.length === 0) {
            return { discount: 0, tier: 0, coinsAvailable: 0 };
        }

        const wallet = response.documents[0] as unknown as LoyaltyWallet;

        return {
            discount: wallet.currentDiscount,
            tier: wallet.currentTier,
            coinsAvailable: wallet.totalCoins
        };
    } catch (error) {
        console.error('Error calculating discount:', error);
        return { discount: 0, tier: 0, coinsAvailable: 0 };
    }
};

// ============================================
// DECAY SYSTEM
// ============================================

/**
 * Apply decay to inactive wallets
 */
export const applyDecay = async (walletId: string): Promise<LoyaltyWallet> => {
    try {
        const wallet = await getWalletById(walletId);
        const settings = await getProviderSettings(
            wallet.providerId,
            wallet.providerType,
            wallet.providerName
        );

        if (!settings.enableDecay || !wallet.lastVisitDate) {
            return wallet;
        }

        const now = new Date();
        const lastVisit = new Date(wallet.lastVisitDate);
        const daysSinceLastVisit = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24);

        // No decay within grace period
        if (daysSinceLastVisit <= settings.decayGracePeriod) {
            return wallet;
        }

        // Calculate decay amount based on inactivity
        let coinsToDecay = 0;
        if (daysSinceLastVisit >= 90) {
            // After 90 days, expire all coins
            coinsToDecay = wallet.totalCoins;
        } else if (daysSinceLastVisit >= 60) {
            coinsToDecay = 5; // 5 coins per week
        } else if (daysSinceLastVisit >= 30) {
            coinsToDecay = 2; // 2 coins per week
        } else {
            coinsToDecay = 1; // 1 coin per week
        }

        if (coinsToDecay === 0 || wallet.totalCoins === 0) {
            return wallet;
        }

        // Apply decay
        const newTotalCoins = Math.max(0, wallet.totalCoins - coinsToDecay);
        const newStatus = newTotalCoins === 0 
            ? LoyaltyWalletStatus.Dormant 
            : daysSinceLastVisit >= 30 
                ? LoyaltyWalletStatus.Inactive 
                : LoyaltyWalletStatus.Active;

        await databases.updateDocument(
            DATABASE_ID,
            collections.loyaltyWallets,
            walletId,
            {
                totalCoins: newTotalCoins,
                lastDecayDate: now.toISOString(),
                decayRate: coinsToDecay,
                status: newStatus,
                updatedAt: now.toISOString()
            }
        );

        // Create decay transaction
        await createTransaction(
            wallet.userId,
            walletId,
            wallet.providerId,
            wallet.providerType,
            daysSinceLastVisit >= 90 ? CoinTransactionType.Expired : CoinTransactionType.Decayed,
            -coinsToDecay,
            `Decay due to ${Math.floor(daysSinceLastVisit)} days of inactivity`,
            wallet.totalCoins,
            newTotalCoins
        );

        return await getWalletById(walletId);
    } catch (error) {
        console.error('Error applying decay:', error);
        throw error;
    }
};

// ============================================
// TRANSACTIONS
// ============================================

/**
 * Create a coin transaction record
 */
const createTransaction = async (
    userId: string,
    walletId: string,
    providerId: number,
    providerType: 'therapist' | 'place',
    type: CoinTransactionType,
    amount: number,
    reason: string,
    balanceBefore: number,
    balanceAfter: number,
    bookingId?: number
): Promise<CoinTransaction> => {
    try {
        const transaction: Omit<CoinTransaction, '$id'> = {
            userId,
            walletId,
            providerId,
            providerType,
            type,
            amount,
            reason,
            balanceBefore,
            balanceAfter,
            bookingId,
            createdAt: new Date().toISOString()
        };

        const created = await databases.createDocument(
            DATABASE_ID,
            collections.coinTransactions,
            'unique()',
            transaction
        );

        return created as unknown as CoinTransaction;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
};

/**
 * Get transaction history for a wallet
 */
export const getTransactionHistory = async (
    walletId: string,
    limit: number = 50
): Promise<CoinTransaction[]> => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            collections.coinTransactions,
            [
                Query.equal('walletId', walletId),
                Query.orderDesc('createdAt'),
                Query.limit(limit)
            ]
        );

        return response.documents as unknown as CoinTransaction[];
    } catch (error) {
        const msg = (error as any)?.message || '';
        const code = (error as any)?.code;
        if (code === 404 || /could not be found/i.test(msg)) {
            console.warn('coin_transactions collection missing; returning empty history.');
            return [];
        }
        console.error('Error getting transaction history:', error);
        return [];
    }
};

/**
 * Get all transactions for a user
 */
export const getUserTransactions = async (
    userId: string,
    limit: number = 100
): Promise<CoinTransaction[]> => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            collections.coinTransactions,
            [
                Query.equal('userId', userId),
                Query.orderDesc('createdAt'),
                Query.limit(limit)
            ]
        );

        return response.documents as unknown as CoinTransaction[];
    } catch (error) {
        console.error('Error getting user transactions:', error);
        throw error;
    }
};

// ============================================
// BIRTHDAY BONUS
// ============================================

/**
 * Award birthday bonus coins
 */
export const awardBirthdayBonus = async (
    userId: string,
    providerId: number,
    providerType: 'therapist' | 'place',
    providerName: string
): Promise<LoyaltyWallet> => {
    try {
        const wallet = await getOrCreateWallet(userId, providerId, providerType, providerName);
        const settings = await getProviderSettings(providerId, providerType, providerName);

        if (settings.birthdayBonus === 0) {
            return wallet;
        }

        const newTotalCoins = wallet.totalCoins + settings.birthdayBonus;
        const newCoinsEarned = wallet.coinsEarned + settings.birthdayBonus;

        await databases.updateDocument(
            DATABASE_ID,
            collections.loyaltyWallets,
            wallet.$id!,
            {
                totalCoins: newTotalCoins,
                coinsEarned: newCoinsEarned,
                updatedAt: new Date().toISOString()
            }
        );

        await createTransaction(
            userId,
            wallet.$id!,
            providerId,
            providerType,
            CoinTransactionType.BirthdayBonus,
            settings.birthdayBonus,
            'Birthday bonus',
            wallet.totalCoins,
            newTotalCoins
        );

        return await getWalletById(wallet.$id!);
    } catch (error) {
        console.error('Error awarding birthday bonus:', error);
        throw error;
    }
};

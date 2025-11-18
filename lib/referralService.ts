// Enhanced Referral System Service
// Handles WhatsApp-based referral tracking, social sharing, and spam prevention

import { databases, ID } from './appwrite';
import { Query } from 'appwrite';
import { COIN_CONFIG } from './coinConfig';

const REFERRAL_DATABASE_ID = '68f76ee1000e64ca8d05'; // Same as coin shop database
const REFERRALS_COLLECTION_ID = 'referrals';
const REFERRAL_CLICKS_COLLECTION_ID = 'referralclicks';

export interface Referral {
    $id?: string;
    referrerUserId: string;           // User who referred
    referrerUserName: string;
    referrerWhatsApp: string;         // WhatsApp number with +62 prefix
    refereeUserId?: string;           // User who was referred (set when they sign up)
    refereeUserName?: string;
    refereeWhatsApp?: string;         // Referee's WhatsApp number
    referralCode: string;             // Unique referral code
    referralLink: string;             // Full referral link
    status: 'pending' | 'clicked' | 'signed_up' | 'completed' | 'expired';
    rewardClaimed: boolean;
    coinsAwarded: number;
    clickCount: number;               // Number of times link was clicked
    deviceFingerprints: string[];     // Array of device fingerprints that clicked
    createdAt?: string;
    clickedAt?: string;               // First click timestamp
    signedUpAt?: string;              // When referee signed up
    completedAt?: string;             // When first booking completed
    expiresAt?: string;               // Referral link expiration
}

export interface ReferralClick {
    $id?: string;
    referralCode: string;
    deviceFingerprint: string;        // Browser/device identification
    ipAddress?: string;
    userAgent?: string;
    clickedAt?: string;
    convertedToSignup?: boolean;
    userId?: string;                  // Set when user signs up
}

// WhatsApp number validation and formatting
export const formatWhatsAppNumber = (number: string): string => {
    // Remove all non-digits
    const cleaned = number.replace(/\D/g, '');
    
    // Add +62 prefix if not present
    if (cleaned.startsWith('62')) {
        return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
        return `+62${cleaned.substring(1)}`;
    } else {
        return `+62${cleaned}`;
    }
};

export const validateWhatsAppNumber = (number: string): boolean => {
    const formatted = formatWhatsAppNumber(number);
    // Indonesian WhatsApp numbers should be +62 followed by 8-12 digits
    return /^\+62\d{8,12}$/.test(formatted);
};

// Device fingerprinting for spam prevention
export const generateDeviceFingerprint = (): string => {
    if (typeof window === 'undefined') return 'server';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL(),
        navigator.hardwareConcurrency || 0,
        navigator.maxTouchPoints || 0
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
};

export const enhancedReferralService = {
    /**
     * Create a referral link for a user
     */
    async createReferralLink(
        referrerUserId: string,
        referrerUserName: string,
        referrerWhatsApp: string
    ): Promise<{
        success: boolean;
        referralCode: string;
        referralLink: string;
        shareText: string;
        error?: string;
    }> {
        try {
            // Validate and format WhatsApp number
            if (!validateWhatsAppNumber(referrerWhatsApp)) {
                return {
                    success: false,
                    referralCode: '',
                    referralLink: '',
                    shareText: '',
                    error: 'Invalid WhatsApp number. Please enter a valid Indonesian number.'
                };
            }

            const formattedWhatsApp = formatWhatsAppNumber(referrerWhatsApp);
            
            // Generate unique referral code
            const referralCode = this.generateReferralCode(referrerUserId, referrerUserName);
            
            // Create referral link
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';
            const referralLink = `${baseUrl}/signup?ref=${referralCode}`;
            
            // Set expiration (90 days from now)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 90);

            // Check if referral already exists for this user
            const existingReferral = await this.getReferralByUser(referrerUserId);
            
            if (existingReferral) {
                // Update existing referral
                await databases.updateDocument(
                    REFERRAL_DATABASE_ID,
                    REFERRALS_COLLECTION_ID,
                    existingReferral.$id!,
                    {
                        referrerWhatsApp: formattedWhatsApp,
                        referralCode,
                        referralLink,
                        expiresAt: expiresAt.toISOString()
                    }
                );
            } else {
                // Create new referral
                await databases.createDocument(
                    REFERRAL_DATABASE_ID,
                    REFERRALS_COLLECTION_ID,
                    ID.unique(),
                    {
                        referrerUserId,
                        referrerUserName,
                        referrerWhatsApp: formattedWhatsApp,
                        referralCode,
                        referralLink,
                        status: 'pending',
                        rewardClaimed: false,
                        coinsAwarded: 0,
                        clickCount: 0,
                        deviceFingerprints: JSON.stringify([]),
                        expiresAt: expiresAt.toISOString()
                    }
                );
            }

            const shareText = `🌟 Join me on our massage booking platform! Sign up with my link: ${referralLink}`;

            console.log(`🔗 Referral link created for ${referrerUserName}: ${referralCode}`);

            return {
                success: true,
                referralCode,
                referralLink,
                shareText
            };

        } catch (error) {
            console.error('Error creating referral link:', error);
            return {
                success: false,
                referralCode: '',
                referralLink: '',
                shareText: '',
                error: 'Failed to create referral link. Please try again.'
            };
        }
    },

    /**
     * Track referral link click
     */
    async trackReferralClick(
        referralCode: string,
        deviceFingerprint?: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<{
        success: boolean;
        isValidReferral: boolean;
        referrerName?: string;
        welcomeBonus?: number;
    }> {
        try {
            const fingerprint = deviceFingerprint || generateDeviceFingerprint();

            // Find the referral
            const response = await databases.listDocuments(
                REFERRAL_DATABASE_ID,
                REFERRALS_COLLECTION_ID,
                [
                    Query.equal('referralCode', referralCode),
                    Query.limit(1)
                ]
            );

            if (response.documents.length === 0) {
                return {
                    success: false,
                    isValidReferral: false
                };
            }

            const referral = response.documents[0] as unknown as Referral;

            // Check if referral is expired
            if (referral.expiresAt && new Date() > new Date(referral.expiresAt)) {
                await databases.updateDocument(
                    REFERRAL_DATABASE_ID,
                    REFERRALS_COLLECTION_ID,
                    referral.$id!,
                    { status: 'expired' }
                );
                
                return {
                    success: false,
                    isValidReferral: false
                };
            }

            // Check for spam - same device clicking multiple times
            const deviceFingerprintsStr = referral.deviceFingerprints || '[]';
            const deviceFingerprints: string[] = typeof deviceFingerprintsStr === 'string' 
                ? JSON.parse(deviceFingerprintsStr) 
                : deviceFingerprintsStr;
            const isNewDevice = !deviceFingerprints.includes(fingerprint);

            if (isNewDevice) {
                // Track the click
                await databases.createDocument(
                    REFERRAL_DATABASE_ID,
                    REFERRAL_CLICKS_COLLECTION_ID,
                    ID.unique(),
                    {
                        referralCode,
                        deviceFingerprint: fingerprint,
                        ipAddress: ipAddress || 'unknown',
                        userAgent: userAgent || 'unknown',
                        convertedToSignup: false
                    }
                );

                // Update referral click count and device fingerprints
                deviceFingerprints.push(fingerprint);
                await databases.updateDocument(
                    REFERRAL_DATABASE_ID,
                    REFERRALS_COLLECTION_ID,
                    referral.$id!,
                    {
                        status: 'clicked',
                        clickCount: referral.clickCount + 1,
                        deviceFingerprints: JSON.stringify(deviceFingerprints),
                        clickedAt: referral.clickedAt || new Date().toISOString()
                    }
                );
            }

            return {
                success: true,
                isValidReferral: true,
                referrerName: referral.referrerUserName
            };

        } catch (error) {
            console.error('Error tracking referral click:', error);
            return {
                success: false,
                isValidReferral: false
            };
        }
    },

    /**
     * Process referral signup - called when user signs up with referral code
     */
    async processReferralSignup(
        referralCode: string,
        refereeUserId: string,
        refereeUserName: string,
        refereeWhatsApp: string,
        deviceFingerprint?: string
    ): Promise<{
        success: boolean;
        welcomeBonusAwarded: boolean;
        message: string;
    }> {
        try {
            const formattedWhatsApp = formatWhatsAppNumber(refereeWhatsApp);
            const fingerprint = deviceFingerprint || generateDeviceFingerprint();

            // Validate WhatsApp number
            if (!validateWhatsAppNumber(refereeWhatsApp)) {
                return {
                    success: false,
                    welcomeBonusAwarded: false,
                    message: 'Invalid WhatsApp number format.'
                };
            }

            // Find the referral
            const response = await databases.listDocuments(
                REFERRAL_DATABASE_ID,
                REFERRALS_COLLECTION_ID,
                [
                    Query.equal('referralCode', referralCode),
                    Query.limit(1)
                ]
            );

            if (response.documents.length === 0) {
                return {
                    success: false,
                    welcomeBonusAwarded: false,
                    message: 'Invalid referral code.'
                };
            }

            const referral = response.documents[0] as unknown as Referral;

            // Anti-spam checks
            // 1. Check if referee WhatsApp is same as referrer (self-referral)
            if (referral.referrerWhatsApp === formattedWhatsApp) {
                console.log(`🚫 Self-referral attempt blocked: ${formattedWhatsApp}`);
                return {
                    success: false,
                    welcomeBonusAwarded: false,
                    message: 'Cannot refer yourself.'
                };
            }

            // 2. Check if this WhatsApp number was already referred by this user
            const existingReferrals = await databases.listDocuments(
                REFERRAL_DATABASE_ID,
                REFERRALS_COLLECTION_ID,
                [
                    Query.equal('referrerUserId', referral.referrerUserId),
                    Query.equal('refereeWhatsApp', formattedWhatsApp)
                ]
            );

            if (existingReferrals.documents.length > 0) {
                return {
                    success: false,
                    welcomeBonusAwarded: false,
                    message: 'This WhatsApp number has already been referred by this user.'
                };
            }

            // 3. Check if referral was actually clicked by this device
            const clickResponse = await databases.listDocuments(
                REFERRAL_DATABASE_ID,
                REFERRAL_CLICKS_COLLECTION_ID,
                [
                    Query.equal('referralCode', referralCode),
                    Query.equal('deviceFingerprint', fingerprint)
                ]
            );

            if (clickResponse.documents.length === 0) {
                return {
                    success: false,
                    welcomeBonusAwarded: false,
                    message: 'Referral must be accessed through the shared link.'
                };
            }

            // Update referral with referee information
            await databases.updateDocument(
                REFERRAL_DATABASE_ID,
                REFERRALS_COLLECTION_ID,
                referral.$id!,
                {
                    refereeUserId,
                    refereeUserName,
                    refereeWhatsApp: formattedWhatsApp,
                    status: 'signed_up',
                    signedUpAt: new Date().toISOString()
                }
            );

            // Mark click as converted
            if (clickResponse.documents.length > 0) {
                await databases.updateDocument(
                    REFERRAL_DATABASE_ID,
                    REFERRAL_CLICKS_COLLECTION_ID,
                    clickResponse.documents[0].$id,
                    {
                        convertedToSignup: true,
                        userId: refereeUserId
                    }
                );
            }

            console.log(`🎉 Referral signup recorded (no user coin bonus): ${refereeUserName} (${formattedWhatsApp}) referred by ${referral.referrerUserName}`);

            return {
                success: true,
                welcomeBonusAwarded: false,
                message: 'Referral recorded successfully.'
            };

        } catch (error) {
            console.error('Error processing referral signup:', error);
            return {
                success: false,
                welcomeBonusAwarded: false,
                message: 'Failed to process referral. Please try again.'
            };
        }
    },

    /**
     * Complete a referral when the referred user makes their first booking
     */
    async completeReferral(refereeUserId: string): Promise<void> {
        try {
            // Find signed up referral for this user
            const response = await databases.listDocuments(
                REFERRAL_DATABASE_ID,
                REFERRALS_COLLECTION_ID,
                [
                    Query.equal('refereeUserId', refereeUserId),
                    Query.equal('status', 'signed_up')
                ]
            );

            if (response.documents.length === 0) {
                console.log('No signed up referral found for user:', refereeUserId);
                return;
            }

            const referral = response.documents[0] as unknown as Referral;

            // Update referral status
            await databases.updateDocument(
                REFERRAL_DATABASE_ID,
                REFERRALS_COLLECTION_ID,
                referral.$id!,
                {
                    status: 'completed',
                    rewardClaimed: false,
                    coinsAwarded: 0,
                    completedAt: new Date().toISOString()
                }
            );
            console.log(`🎉 Referral completed (no user coin bonus to referrer): ${referral.referrerUserName} referred ${referral.refereeUserName}`);

        } catch (error) {
            console.error('Error completing referral:', error);
            throw error;
        }
    },

    /**
     * Get referrals made by a user
     */
    async getReferralsByUser(userId: string): Promise<Referral[]> {
        try {
            const response = await databases.listDocuments(
                REFERRAL_DATABASE_ID,
                REFERRALS_COLLECTION_ID,
                [
                    Query.equal('referrerUserId', userId),
                    Query.orderDesc('$createdAt')
                ]
            );

            return response.documents as unknown as Referral[];
        } catch (error) {
            console.error('Error getting user referrals:', error);
            return [];
        }
    },

    /**
     * Get referral by user (single active referral link)
     */
    async getReferralByUser(userId: string): Promise<Referral | null> {
        try {
            const response = await databases.listDocuments(
                REFERRAL_DATABASE_ID,
                REFERRALS_COLLECTION_ID,
                [
                    Query.equal('referrerUserId', userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(1)
                ]
            );

            return response.documents.length > 0 
                ? response.documents[0] as unknown as Referral 
                : null;
        } catch (error) {
            console.error('Error getting user referral:', error);
            return null;
        }
    },

    /**
     * Get referral stats for a user
     */
    async getReferralStats(userId: string): Promise<{
        totalReferrals: number;
        completedReferrals: number;
        pendingReferrals: number;
        totalClicks: number;
        totalCoinsEarned: number;
        conversionRate: number;
    }> {
        try {
            const referrals = await this.getReferralsByUser(userId);
            const totalClicks = referrals.reduce((sum, r) => sum + r.clickCount, 0);
            const completedReferrals = referrals.filter(r => r.status === 'completed').length;
            
            return {
                totalReferrals: referrals.length,
                completedReferrals,
                pendingReferrals: referrals.filter(r => r.status === 'pending' || r.status === 'signed_up').length,
                totalClicks,
                totalCoinsEarned: referrals
                    .filter(r => r.rewardClaimed)
                    .reduce((total, r) => total + r.coinsAwarded, 0),
                conversionRate: totalClicks > 0 ? (completedReferrals / totalClicks) * 100 : 0
            };
        } catch (error) {
            console.error('Error getting referral stats:', error);
            return {
                totalReferrals: 0,
                completedReferrals: 0,
                pendingReferrals: 0,
                totalClicks: 0,
                totalCoinsEarned: 0,
                conversionRate: 0
            };
        }
    },

    /**
     * Generate a referral code for a user
     */
    generateReferralCode(userId: string, userName: string): string {
        const name = userName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6);
        const userHash = userId.slice(-4).toUpperCase();
        const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
        return `${name}${userHash}${timestamp}`;
    },

    /**
     * Validate referral code and return referrer info
     */
    async validateReferralCode(referralCode: string): Promise<{
        isValid: boolean;
        referrerUserId?: string;
        referrerUserName?: string;
        isExpired?: boolean;
    }> {
        try {
            const response = await databases.listDocuments(
                REFERRAL_DATABASE_ID,
                REFERRALS_COLLECTION_ID,
                [
                    Query.equal('referralCode', referralCode),
                    Query.limit(1)
                ]
            );

            if (response.documents.length === 0) {
                return { isValid: false };
            }

            const referral = response.documents[0] as unknown as Referral;
            
            // Check if expired
            if (referral.expiresAt && new Date() > new Date(referral.expiresAt)) {
                return { 
                    isValid: false, 
                    isExpired: true 
                };
            }

            return {
                isValid: true,
                referrerUserId: referral.referrerUserId,
                referrerUserName: referral.referrerUserName,
                isExpired: false
            };
        } catch (error) {
            console.error('Error validating referral code:', error);
            return { isValid: false };
        }
    },

    /**
     * Generate social sharing URLs
     */
    generateSocialShareUrls(referralLink: string, shareText: string): {
        whatsapp: string;
        facebook: string;
        twitter: string;
        telegram: string;
        copyLink: string;
    } {
        const encodedText = encodeURIComponent(shareText);
        const encodedLink = encodeURIComponent(referralLink);

        return {
            whatsapp: `https://wa.me/?text=${encodedText}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedText}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
            telegram: `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`,
            copyLink: referralLink
        };
    }
};
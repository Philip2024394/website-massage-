/**
 * Device Tracking & New User Detection Service
 * Automatically detects new users based on device fingerprint and IP
 * Awards welcome coins for first-time registrations
 */

import { databases } from './appwrite';
import { coinService as historyCoinService } from './coinService';
import APPWRITE_CONFIG from './appwrite.config';
import { Query } from 'appwrite';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTIONS = APPWRITE_CONFIG.collections;

// Welcome bonus configuration
export const WELCOME_BONUS = {
    COINS: 100, // 100 coins for new users
    DESCRIPTION: 'Welcome bonus for joining IndaStreet Massage Directory!',
    EXPIRY_DAYS: 30 // Coins must be used within 30 days
};

interface DeviceFingerprint {
    deviceId: string;
    ipAddress: string;
    userAgent: string;
    screenResolution: string;
    timezone: string;
    language: string;
    platform: string;
    createdAt: string;
}

interface UserRegistrationRecord {
    $id?: string; // Appwrite document ID
    userId: string;
    userType: 'customer' | 'therapist' | 'place';
    deviceId: string;
    ipAddress: string;
    hasReceivedWelcomeBonus: boolean;
    welcomeBonusAmount?: number;
    registrationDate: string;
    firstLoginDate?: string;
}

/**
 * Generate a unique device fingerprint based on browser/device characteristics
 */
export const generateDeviceFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Canvas fingerprinting
    let canvasData = '';
    if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('IndaStreet', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Fingerprint', 4, 17);
        canvasData = canvas.toDataURL();
    }
    
    // Combine multiple factors
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset(),
        !!window.sessionStorage,
        !!window.localStorage,
        canvasData
    ].join('|');
    
    // Generate hash
    return hashString(fingerprint);
};

/**
 * Simple hash function for fingerprinting
 */
const hashString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
};

/**
 * Get user's IP address using external API
 */
export const getUserIP = async (): Promise<string> => {
    try {
        // Try multiple IP detection services for reliability
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        console.warn('Primary IP detection failed, trying backup...');
        try {
            const response = await fetch('https://api.myip.com');
            const data = await response.json();
            return data.ip;
        } catch (backupError) {
            console.error('All IP detection methods failed:', backupError);
            return 'unknown';
        }
    }
};

/**
 * Get complete device fingerprint data
 */
export const getDeviceFingerprint = async (): Promise<DeviceFingerprint> => {
    const deviceId = generateDeviceFingerprint();
    const ipAddress = await getUserIP();
    
    return {
        deviceId,
        ipAddress,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        createdAt: new Date().toISOString()
    };
};

/**
 * Check if this device/IP has already registered
 */
export const checkExistingRegistration = async (
    deviceId: string,
    ipAddress: string
): Promise<UserRegistrationRecord | null> => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.userRegistrations,
            [
                Query.or([
                    Query.equal('deviceId', deviceId),
                    Query.equal('ipAddress', ipAddress)
                ]),
                Query.orderDesc('registrationDate'),
                Query.limit(1)
            ]
        );

        if (response.documents.length > 0) {
            return response.documents[0] as unknown as UserRegistrationRecord;
        }

        return null;
    } catch (error) {
        console.error('Error checking existing registration:', error);
        return null;
    }
};

/**
 * Check if user is eligible for welcome bonus
 * Returns true if this is a genuinely new user
 */
export const isEligibleForWelcomeBonus = async (): Promise<{
    eligible: boolean;
    reason: string;
    deviceId: string;
    ipAddress: string;
}> => {
    try {
        const fingerprint = await getDeviceFingerprint();
        
        // Check if this device/IP has registered before
        const existingRegistration = await checkExistingRegistration(
            fingerprint.deviceId,
            fingerprint.ipAddress
        );

        if (existingRegistration) {
            return {
                eligible: false,
                reason: existingRegistration.hasReceivedWelcomeBonus
                    ? 'Welcome bonus already claimed on this device'
                    : 'Account already exists on this device',
                deviceId: fingerprint.deviceId,
                ipAddress: fingerprint.ipAddress
            };
        }

        // Check localStorage for previous registration attempts
        const hasLocalRecord = localStorage.getItem('indastreet_registered');
        if (hasLocalRecord) {
            return {
                eligible: false,
                reason: 'Previous registration detected in browser storage',
                deviceId: fingerprint.deviceId,
                ipAddress: fingerprint.ipAddress
            };
        }

        return {
            eligible: true,
            reason: 'New user detected - eligible for welcome bonus!',
            deviceId: fingerprint.deviceId,
            ipAddress: fingerprint.ipAddress
        };
    } catch (error) {
        console.error('Error checking eligibility:', error);
        return {
            eligible: false,
            reason: 'Error checking eligibility',
            deviceId: 'unknown',
            ipAddress: 'unknown'
        };
    }
};

/**
 * Record a new user registration
 */
export const recordUserRegistration = async (
    userId: string,
    userType: 'customer' | 'therapist' | 'place',
    deviceId: string,
    ipAddress: string
): Promise<UserRegistrationRecord> => {
    try {
        const recordData = {
            userId,
            userType,
            deviceId,
            ipAddress,
            hasReceivedWelcomeBonus: false,
            registrationDate: new Date().toISOString()
        };

        const created = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.userRegistrations,
            'unique()',
            recordData
        );

        // Mark in localStorage as backup
        localStorage.setItem('indastreet_registered', 'true');
        localStorage.setItem('indastreet_registration_date', new Date().toISOString());

        return created as unknown as UserRegistrationRecord;
    } catch (error) {
        const msg = (error as any)?.message || '';
        const code = (error as any)?.code;
        if (code === 404 || /could not be found/i.test(msg)) {
            console.warn('user_registrations collection missing; recording registration locally.');
            // Local fallback record
            const local: UserRegistrationRecord = {
                $id: undefined,
                userId,
                userType,
                deviceId,
                ipAddress,
                hasReceivedWelcomeBonus: false,
                registrationDate: new Date().toISOString(),
                firstLoginDate: undefined
            };
            try {
                localStorage.setItem('indastreet_registered', 'true');
                localStorage.setItem('indastreet_registration_date', local.registrationDate);
            } catch {}
            return local;
        }
        console.error('Error recording registration:', error);
        throw error;
    }
};

/**
 * Award welcome bonus coins to new user
 * This should be called after successful registration
 */
export const awardWelcomeBonus = async (
    userId: string,
    userType: 'customer' | 'therapist' | 'place',
    deviceId: string,
    ipAddress: string,
    userName: string
): Promise<{
    success: boolean;
    coinsAwarded: number;
    message: string;
    registrationId?: string;
}> => {
    try {
        // Double-check eligibility
        const eligibility = await isEligibleForWelcomeBonus();
        
        if (!eligibility.eligible) {
            return {
                success: false,
                coinsAwarded: 0,
                message: eligibility.reason
            };
        }

        // Record the registration
        const registration = await recordUserRegistration(
            userId,
            userType,
            deviceId,
            ipAddress
        );

        // Customer welcome coins disabled: do not award any coins
        const coinsAwarded = 0;
        const awarded = false;

        // Update registration record (best-effort)
        try {
            if (registration.$id) {
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.userRegistrations,
                    registration.$id as string,
                    {
                        hasReceivedWelcomeBonus: awarded,
                        welcomeBonusAmount: awarded ? coinsAwarded : 0,
                        firstLoginDate: new Date().toISOString()
                    }
                );
            }
        } catch (updateErr) {
            const msg = (updateErr as any)?.message || '';
            const code = (updateErr as any)?.code;
            if (code === 404 || /could not be found/i.test(msg)) {
                console.warn('user_registrations collection missing during update; continuing.');
            } else {
                console.error('Error updating registration record:', updateErr);
            }
        }

        // Store in localStorage only if awarded
        // Do not set localStorage flags since no coins are awarded

        return {
            success: true,
            coinsAwarded,
            message: 'Welcome bonus program is currently disabled for customers.',
            registrationId: registration.$id
        };
    } catch (error) {
        console.error('Error awarding welcome bonus:', error);
        return {
            success: false,
            coinsAwarded: 0,
            message: 'Error awarding welcome bonus. Please contact support.'
        };
    }
};

/**
 * Check if user should see the welcome popup
 * Shows popup once for new users who haven't dismissed it
 */
export const shouldShowWelcomePopup = (): boolean => {
    const hasSeenPopup = localStorage.getItem('indastreet_welcome_popup_seen');
    const hasReceivedBonus = localStorage.getItem('indastreet_welcome_bonus_received');
    
    // Show popup if they received bonus but haven't seen the popup yet
    return hasReceivedBonus === 'true' && hasSeenPopup !== 'true';
};

/**
 * Mark welcome popup as seen
 */
export const markWelcomePopupSeen = (): void => {
    localStorage.setItem('indastreet_welcome_popup_seen', 'true');
    localStorage.setItem('indastreet_welcome_popup_seen_date', new Date().toISOString());
};

/**
 * Get welcome bonus details from localStorage
 */
export const getWelcomeBonusDetails = (): {
    received: boolean;
    coins: number;
    popupSeen: boolean;
} => {
    const received = localStorage.getItem('indastreet_welcome_bonus_received') === 'true';
    const coins = parseInt(localStorage.getItem('indastreet_welcome_coins') || '0', 10);
    const popupSeen = localStorage.getItem('indastreet_welcome_popup_seen') === 'true';

    return { received, coins, popupSeen };
};

/**
 * Clear all device tracking data (for testing/development only)
 */
export const clearDeviceTracking = (): void => {
    localStorage.removeItem('indastreet_registered');
    localStorage.removeItem('indastreet_registration_date');
    localStorage.removeItem('indastreet_welcome_bonus_received');
    localStorage.removeItem('indastreet_welcome_coins');
    localStorage.removeItem('indastreet_welcome_popup_seen');
    localStorage.removeItem('indastreet_welcome_popup_seen_date');
    console.log('✅ Device tracking data cleared');
};

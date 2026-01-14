/**
 * Booking Authorization Guards
 * 
 * CRITICAL: Revenue protection through fail-closed authorization checks.
 * 
 * FAIL-CLOSED PRINCIPLE:
 * - If ANY query fails → BLOCK booking
 * - If ANY condition fails → BLOCK booking
 * - No assumptions, no fallbacks
 * - Server data only, never trust client
 * 
 * These guards MUST be called before ANY booking creation.
 */

import { databases, Query } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';

interface AuthResult {
    allowed: boolean;
    reason?: string;
    severity?: 'warning' | 'error' | 'critical';
}

/**
 * Validate therapist can accept new bookings
 * 
 * Checks:
 * 1. therapist_menus.status === 'active'
 * 2. therapist_menus.bookingEnabled === true
 * 3. therapist_menus.scheduleEnabled === true
 * 4. No unpaid commissions (status = pending or expired)
 * 5. Plan validity (if Premium: check planExpiresAt + graceUntil)
 */
export async function validateTherapistBookingAccess(
    therapistId: string
): Promise<AuthResult> {
    try {
        // STEP 1: Query therapist_menus document
        let menuDocs;
        try {
            menuDocs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapistMenus || 'therapist_menus',
                [
                    Query.equal('therapistId', therapistId),
                    Query.limit(1)
                ]
            );
        } catch (queryError: any) {
            console.error('❌ CRITICAL: Failed to query therapist_menus', queryError);
            // FAIL CLOSED: Block booking on database error
            return {
                allowed: false,
                reason: 'Database error - booking blocked for safety',
                severity: 'critical'
            };
        }

        if (!menuDocs || menuDocs.documents.length === 0) {
            console.warn(`⚠️ No therapist_menus document found for therapistId: ${therapistId}`);
            return {
                allowed: false,
                reason: 'Therapist account not found',
                severity: 'error'
            };
        }

        const menu = menuDocs.documents[0];

        // STEP 2: Check account status
        if (menu.status !== 'active') {
            return {
                allowed: false,
                reason: `Therapist account is ${menu.status}. ${menu.deactivationReason || 'Please contact support.'}`,
                severity: 'error'
            };
        }

        // STEP 3: Check bookingEnabled flag
        if (menu.bookingEnabled === false) {
            return {
                allowed: false,
                reason: 'Therapist is currently unavailable for bookings',
                severity: 'warning'
            };
        }

        // STEP 4: Check scheduleEnabled flag
        if (menu.scheduleEnabled === false) {
            return {
                allowed: false,
                reason: 'Therapist schedule is currently disabled',
                severity: 'warning'
            };
        }

        // STEP 5: Check for unpaid commissions (PRO plan only)
        if (menu.planType === 'pro') {
            let unpaidCommissions;
            try {
                unpaidCommissions = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
                    [
                        Query.equal('therapistId', therapistId),
                        Query.equal('status', ['pending', 'expired']),
                        Query.limit(1)
                    ]
                );
            } catch (commissionError: any) {
                console.error('❌ CRITICAL: Failed to query commission_records', commissionError);
                // FAIL CLOSED: Block booking on database error
                return {
                    allowed: false,
                    reason: 'Payment verification failed - booking blocked for safety',
                    severity: 'critical'
                };
            }

            if (unpaidCommissions && unpaidCommissions.documents.length > 0) {
                return {
                    allowed: false,
                    reason: 'Therapist has unpaid commissions. Please complete payment to continue receiving bookings.',
                    severity: 'critical'
                };
            }
        }

        // STEP 6: Check Premium plan validity (if applicable)
        if (menu.planType === 'premium') {
            const now = new Date();
            
            // Check plan expiration
            if (menu.planExpiresAt) {
                const expiresAt = new Date(menu.planExpiresAt);
                
                // Check grace period
                if (menu.graceUntil) {
                    const graceUntil = new Date(menu.graceUntil);
                    if (now > graceUntil) {
                        return {
                            allowed: false,
                            reason: 'Premium plan expired. Please renew to continue receiving bookings.',
                            severity: 'critical'
                        };
                    }
                } else if (now > expiresAt) {
                    // No grace period defined, strict expiration
                    return {
                        allowed: false,
                        reason: 'Premium plan expired. Please renew to continue receiving bookings.',
                        severity: 'critical'
                    };
                }
            }
        }

        // ALL CHECKS PASSED
        return {
            allowed: true
        };

    } catch (error: any) {
        console.error('❌ CRITICAL: Unexpected error in validateTherapistBookingAccess', error);
        // FAIL CLOSED: Block booking on any unexpected error
        return {
            allowed: false,
            reason: 'Authorization check failed - booking blocked for safety',
            severity: 'critical'
        };
    }
}

/**
 * Validate user hasn't exceeded booking limits
 * 
 * Rule: Max 1 active booking per user
 * (Status: pending, accepted, confirmed)
 */
export async function validateUserBookingLimit(
    userId: string
): Promise<AuthResult> {
    try {
        let activeBookings;
        try {
            activeBookings = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'BOOKINGS_COLLECTION_ID',
                [
                    Query.equal('userId', userId),
                    Query.equal('status', ['Pending', 'Accepted', 'Confirmed']),
                    Query.limit(1)
                ]
            );
        } catch (queryError: any) {
            console.error('❌ CRITICAL: Failed to query user bookings', queryError);
            // FAIL CLOSED: Block booking on database error
            return {
                allowed: false,
                reason: 'Booking limit check failed - blocked for safety',
                severity: 'critical'
            };
        }

        if (activeBookings && activeBookings.documents.length > 0) {
            return {
                allowed: false,
                reason: 'You already have an active booking. Please complete or cancel it before creating a new one.',
                severity: 'warning'
            };
        }

        return {
            allowed: true
        };

    } catch (error: any) {
        console.error('❌ CRITICAL: Unexpected error in validateUserBookingLimit', error);
        // FAIL CLOSED: Block booking on any unexpected error
        return {
            allowed: false,
            reason: 'Booking limit check failed - blocked for safety',
            severity: 'critical'
        };
    }
}

/**
 * Comprehensive pre-booking validation
 * 
 * Runs ALL checks before booking creation:
 * 1. Therapist authorization
 * 2. User booking limits
 * 
 * FAIL-CLOSED: Returns first failure encountered
 */
export async function validateBookingCreation(
    userId: string | undefined,
    therapistId: string,
    providerType: string
): Promise<AuthResult> {
    try {
        // Only validate therapists (not places/facial places)
        if (providerType !== 'therapist') {
            return { allowed: true };
        }

        // Check therapist authorization
        const therapistAuth = await validateTherapistBookingAccess(therapistId);
        if (!therapistAuth.allowed) {
            return therapistAuth;
        }

        // Check user booking limits (if userId provided)
        if (userId) {
            const userLimit = await validateUserBookingLimit(userId);
            if (!userLimit.allowed) {
                return userLimit;
            }
        }

        // ALL CHECKS PASSED
        return {
            allowed: true
        };

    } catch (error: any) {
        console.error('❌ CRITICAL: Unexpected error in validateBookingCreation', error);
        // FAIL CLOSED: Block booking on any unexpected error
        return {
            allowed: false,
            reason: 'Authorization check failed - booking blocked for safety',
            severity: 'critical'
        };
    }
}

/**
 * Validate therapist can accept a booking
 * 
 * Checks before therapist accepts:
 * 1. Therapist still has booking authorization
 * 2. Booking status is 'Pending'
 * 3. Booking belongs to this therapist
 */
export async function validateBookingAcceptance(
    bookingId: string,
    therapistId: string
): Promise<AuthResult> {
    try {
        // Check therapist authorization (status, commissions, etc.)
        const therapistAuth = await validateTherapistBookingAccess(therapistId);
        if (!therapistAuth.allowed) {
            return therapistAuth;
        }

        // Verify booking exists and is pending
        let booking;
        try {
            booking = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'BOOKINGS_COLLECTION_ID',
                bookingId
            );
        } catch (queryError: any) {
            console.error('❌ CRITICAL: Failed to query booking', queryError);
            return {
                allowed: false,
                reason: 'Booking verification failed - action blocked for safety',
                severity: 'critical'
            };
        }

        if (booking.status !== 'Pending') {
            return {
                allowed: false,
                reason: `Booking is already ${booking.status}`,
                severity: 'warning'
            };
        }

        if (booking.providerId !== therapistId) {
            return {
                allowed: false,
                reason: 'This booking is not assigned to you',
                severity: 'error'
            };
        }

        return {
            allowed: true
        };

    } catch (error: any) {
        console.error('❌ CRITICAL: Unexpected error in validateBookingAcceptance', error);
        return {
            allowed: false,
            reason: 'Authorization check failed - action blocked for safety',
            severity: 'critical'
        };
    }
}

/**
 * Log authorization violation to audit_logs
 * 
 * Records ALL blocked attempts for security analysis
 */
export async function logAuthViolation(
    type: string,
    userId: string,
    reason: string,
    metadata: Record<string, any>,
    severity: 'warning' | 'error' | 'critical' = 'error'
): Promise<void> {
    try {
        const { ID } = await import('../appwrite');
        
        await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.auditLogs as any || 'audit_logs',
            ID.unique(),
            {
                type,
                userId,
                reason,
                metadata: JSON.stringify(metadata),
                timestamp: new Date().toISOString(),
                severity
            }
        );
    } catch (error) {
        // Don't throw - audit logging failure shouldn't block operations
        console.error('⚠️ Failed to log auth violation (non-blocking):', error);
    }
}

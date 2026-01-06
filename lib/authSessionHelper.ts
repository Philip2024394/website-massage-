/**
 * Authentication Session Helper
 * 
 * Purpose: Ensures anonymous session exists ONLY when needed for protected actions
 * 
 * Use Cases:
 * - User clicks "Book Now" button → needs session to create booking
 * - User opens chat window → needs session for real-time messaging
 * - User performs any protected Appwrite action
 * 
 * DO NOT use:
 * - On landing page load
 * - On app initialization
 * - For read-only operations (viewing therapists, places, etc.)
 */

import { account } from './appwrite';
import { sessionCache } from './sessionCache';

export interface AuthSessionResult {
    success: boolean;
    userId: string | null;
    isAnonymous: boolean;
    error?: string;
}

/**
 * Ensures a valid Appwrite session exists for protected operations
 * 
 * Flow:
 * 1. Check cache for existing session
 * 2. Try to get current session from Appwrite
 * 3. If no session, create anonymous session
 * 4. Return session info
 * 
 * @param reason - Why auth is needed (for logging/debugging)
 * @returns Session result with userId and status
 */
export async function ensureAuthSession(reason: string = 'protected action'): Promise<AuthSessionResult> {
    try {
        // STEP 1: Check cache first (fast path)
        const cached = sessionCache.get();
        if (cached?.hasSession && cached.user?.$id) {
            console.log(`✅ [Auth] Existing session found for: ${reason}`);
            return {
                success: true,
                userId: cached.user.$id,
                isAnonymous: cached.user.labels?.includes('guest') || false
            };
        }

        // STEP 2: Try to get current session (may be real user or existing anonymous)
        try {
            const currentUser = await Promise.race([
                account.get(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
            ]) as any;

            if (currentUser?.$id) {
                sessionCache.set(true, currentUser);
                const isAnon = currentUser.labels?.includes('guest') || false;
                console.log(`✅ [Auth] Session validated for: ${reason} (${isAnon ? 'anonymous' : 'user'})`);
                return {
                    success: true,
                    userId: currentUser.$id,
                    isAnonymous: isAnon
                };
            }
        } catch (sessionError: any) {
            // No existing session - will create anonymous below
            console.log(`ℹ️ [Auth] No existing session for: ${reason}`);
        }

        // STEP 3: Create anonymous session for protected action
        console.log(`🔑 [Auth] Creating anonymous session for: ${reason}`);
        
        try {
            await Promise.race([
                account.createAnonymousSession(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
            ]);

            const anonymousUser = await account.get();
            sessionCache.set(true, anonymousUser);
            
            console.log(`✅ [Auth] Anonymous session created for: ${reason}`);
            return {
                success: true,
                userId: anonymousUser.$id,
                isAnonymous: true
            };
        } catch (anonError: any) {
            const errorCode = anonError?.code || anonError?.status;
            const errorMsg = anonError?.message || '';

            // Handle specific errors
            if (errorCode === 429 || errorMsg.includes('429')) {
                console.warn('⚠️ [Auth] Rate limited - retry later');
                return {
                    success: false,
                    userId: null,
                    isAnonymous: false,
                    error: 'rate_limit'
                };
            } else if (errorCode === 501 || errorMsg.includes('501')) {
                console.warn('⚠️ [Auth] Anonymous sessions not enabled in Appwrite project');
                return {
                    success: false,
                    userId: null,
                    isAnonymous: false,
                    error: 'anonymous_disabled'
                };
            } else if (errorMsg.includes('already exists')) {
                // Session was just created by another call - fetch it
                try {
                    const existingUser = await account.get();
                    sessionCache.set(true, existingUser);
                    console.log(`✅ [Auth] Session already created for: ${reason}`);
                    return {
                        success: true,
                        userId: existingUser.$id,
                        isAnonymous: true
                    };
                } catch {
                    return {
                        success: false,
                        userId: null,
                        isAnonymous: false,
                        error: 'session_fetch_failed'
                    };
                }
            }

            console.error('❌ [Auth] Failed to create session:', errorMsg || errorCode);
            return {
                success: false,
                userId: null,
                isAnonymous: false,
                error: errorMsg || 'unknown_error'
            };
        }
    } catch (error: any) {
        console.error('❌ [Auth] Unexpected error ensuring session:', error);
        return {
            success: false,
            userId: null,
            isAnonymous: false,
            error: error.message || 'unexpected_error'
        };
    }
}

/**
 * Convert anonymous user to real authenticated user after signup/login
 * 
 * This preserves the session data (bookings, chats, etc.) associated with
 * the anonymous session while upgrading to a real user account.
 * 
 * @param email - User's email
 * @param password - User's password
 * @returns Success status
 */
export async function convertAnonymousToUser(email: string, password: string): Promise<boolean> {
    try {
        // Check if current session is anonymous
        const currentUser = await account.get();
        const isAnonymous = currentUser.labels?.includes('guest') || false;

        if (!isAnonymous) {
            console.log('ℹ️ [Auth] User already has real account, skipping conversion');
            return true;
        }

        console.log('🔄 [Auth] Converting anonymous user to real account...');

        // Update the anonymous account with email and password
        // Note: Appwrite may not support this directly - may need to:
        // 1. Create new account
        // 2. Migrate data (bookings, chats)
        // 3. Delete old anonymous session
        
        // For now, just create a new account and the user can start fresh
        // TODO: Implement data migration if needed
        console.warn('⚠️ [Auth] Anonymous to user conversion needs data migration implementation');
        
        return false;
    } catch (error: any) {
        console.error('❌ [Auth] Failed to convert anonymous user:', error);
        return false;
    }
}

/**
 * Check if current session is anonymous (guest)
 */
export async function isAnonymousSession(): Promise<boolean> {
    try {
        const user = await account.get();
        return user.labels?.includes('guest') || false;
    } catch {
        return false; // No session at all
    }
}

/**
 * Get current user ID without creating session
 * Returns null if no session exists
 */
export async function getCurrentUserId(): Promise<string | null> {
    try {
        const cached = sessionCache.get();
        if (cached?.hasSession && cached.user?.$id) {
            return cached.user.$id;
        }

        const user = await account.get();
        return user.$id || null;
    } catch {
        return null;
    }
}

/**
 * Session Manager - Handles persistent authentication across all user types
 * Checks Appwrite sessions on app startup and restores user state
 */

import { account, databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';

export interface SessionUser {
    type: 'admin' | 'hotel' | 'villa' | 'agent' | 'therapist' | 'place' | 'user';
    id: string;
    email: string;
    documentId: string;
    data?: any;
}

/**
 * Check if there's an active Appwrite session and restore user state
 */
export async function restoreSession(): Promise<SessionUser | null> {
    try {
        // Check if there's an active session with timeout
        const user = await Promise.race([
            account.get(),
            new Promise<null>((_, reject) => 
                setTimeout(() => reject(new Error('Session check timeout')), 5000)
            )
        ]);
        
        if (!user) {
            console.log('📭 No active session found');
            return null;
        }

        console.log('✅ Active session found for:', user.email);

        // Try to find user in each collection to determine type with timeout
        const userType = await Promise.race([
            determineUserType(user.$id, user.email),
            new Promise<null>((resolve) => 
                setTimeout(() => resolve(null), 8000)
            )
        ]);
        
        if (!userType) {
            console.log('⚠️ User found but not in any collection or timeout');
            return null;
        }

        console.log('✅ Session restored for', userType.type, ':', user.email);
        return userType;

    } catch (error: any) {
        console.log('📭 No active session:', error.message);
        return null;
    }
}

/**
 * Determine which collection the user belongs to
 */
async function determineUserType(userId: string, email: string): Promise<SessionUser | null> {
    try {
        // Check Admin (with error handling for missing collection)
        try {
            if (!COLLECTIONS.ADMINS) {
                console.log('ℹ️ Admin collection not configured - skipping admin check');
            } else {
                const admins = await Promise.race([
                    databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.ADMINS,
                        [Query.equal('email', email)]
                    ),
                    new Promise<any>((_, reject) => 
                        setTimeout(() => reject(new Error('Admin query timeout')), 3000)
                    )
                ]);
                if (admins.documents.length > 0) {
                    const admin = admins.documents[0];
                    return {
                        type: 'admin',
                        id: userId,
                        email,
                        documentId: admin.$id,
                        data: admin
                    };
                }
            }
        } catch (error) {
            console.warn('⚠️ Admin check failed or timeout, skipping');
        }

        // Check Hotels with timeout
        try {
            const hotels = await Promise.race([
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.HOTELS,
                    [Query.equal('email', email)]
                ),
                new Promise<any>((_, reject) => 
                    setTimeout(() => reject(new Error('Hotel query timeout')), 3000)
                )
            ]);
            if (hotels.documents.length > 0) {
                const hotel = hotels.documents[0];
                return {
                    type: 'hotel',
                    id: userId,
                    email,
                    documentId: hotel.$id,
                    data: hotel
                };
            }
        } catch {
            console.warn('⚠️ Hotel check failed or timeout, skipping');
        }

        // Check Villas with timeout
        try {
            if (!COLLECTIONS.VILLAS) {
                console.log('ℹ️ Villas collection not configured - skipping villas check');
            } else {
                const villas = await Promise.race([
                    databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.VILLAS,
                        [Query.equal('email', email)]
                    ),
                    new Promise<any>((_, reject) => 
                        setTimeout(() => reject(new Error('Villa query timeout')), 3000)
                    )
                ]);
                if (villas.documents.length > 0) {
                    const villa = villas.documents[0];
                    return {
                        type: 'villa',
                        id: userId,
                        email,
                        documentId: villa.$id,
                        data: villa
                    };
                }
            }
        } catch (error) {
            console.warn('⚠️ Villa check failed or timeout, skipping');
        }

        // Check Agents with timeout
        try {
            const agents = await Promise.race([
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.AGENTS,
                    [Query.equal('email', email)]
                ),
                new Promise<any>((_, reject) => 
                    setTimeout(() => reject(new Error('Agent query timeout')), 3000)
                )
            ]);
            if (agents.documents.length > 0) {
                const agent = agents.documents[0];
                return {
                    type: 'agent',
                    id: userId,
                    email,
                    documentId: agent.$id,
                    data: agent
                };
            }
        } catch {
            console.warn('⚠️ Agent check failed or timeout, skipping');
        }

        // Check Therapists with timeout
        try {
            const therapists = await Promise.race([
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.THERAPISTS,
                    [Query.equal('email', email)]
                ),
                new Promise<any>((_, reject) => 
                    setTimeout(() => reject(new Error('Therapist query timeout')), 3000)
                )
            ]);
            if (therapists.documents.length > 0) {
                const therapist = therapists.documents[0];
                return {
                    type: 'therapist',
                    id: therapist.$id,
                    email,
                    documentId: therapist.$id,
                    data: therapist
                };
            }
        } catch {
            console.warn('⚠️ Therapist check failed or timeout, skipping');
        }

        // Check Places (Massage Places) with timeout
        try {
            const places = await Promise.race([
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.PLACES,
                    [Query.equal('email', email)]
                ),
                new Promise<any>((_, reject) => 
                    setTimeout(() => reject(new Error('Place query timeout')), 3000)
                )
            ]);
            if (places.documents.length > 0) {
                const place = places.documents[0];
                return {
                    type: 'place',
                    id: place.$id,
                    email,
                    documentId: place.$id,
                    data: place
                };
            }
        } catch {
            console.warn('⚠️ Place check failed or timeout, skipping');
        }

        // Check Regular Users with timeout
        try {
            const users = await Promise.race([
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.USERS,
                    [Query.equal('email', email)]
                ),
                new Promise<any>((_, reject) => 
                    setTimeout(() => reject(new Error('User query timeout')), 3000)
                )
            ]);
            if (users.documents.length > 0) {
                const regularUser = users.documents[0];
                return {
                    type: 'user',
                    id: userId,
                    email,
                    documentId: regularUser.$id,
                    data: regularUser
                };
            }
        } catch {
            console.warn('⚠️ User check failed or timeout, skipping');
        }

        return null;
    } catch (error: any) {
        console.error('Error determining user type:', error);
        return null;
    }
}

/**
 * Save session info to localStorage for offline/quick access
 */
export function saveSessionCache(_sessionUser: SessionUser): void {
    // localStorage disabled: no-op. Session data now handled by Appwrite only.
}

/**
 * Clear session cache
 */
export function clearSessionCache(): void {
    // localStorage disabled: no-op. Appwrite session deletion handled separately.
}

/**
 * Logout current user and clear session
 */
export async function logout(): Promise<void> {
    try {
        // Check if there's actually a session before attempting to delete
        // This prevents unnecessary 401 errors
        try {
            await account.get();
            // Session exists, proceed with deletion
            await account.deleteSession('current');
            clearSessionCache();
            console.log('✅ Session cleared successfully');
        } catch (checkError: any) {
            // No session exists (401), nothing to delete
            if (checkError.code === 401) {
                console.log('📭 No active session to clear');
                clearSessionCache();
                return;
            }
            throw checkError;
        }
    } catch (error: any) {
        // If error is 401 and user is guest, this is expected behavior
        if (error.code === 401) {
            console.log('📭 Logout attempted on guest user - no active session to clear');
            clearSessionCache();
            return;
        }
        console.error('Error during logout:', error);
        // Still clear cache even if Appwrite logout fails
        clearSessionCache();
    }
}

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
        // Check if there's an active session
        const user = await account.get();
        
        if (!user) {
            console.log('📭 No active session found');
            return null;
        }

        console.log('✅ Active session found for:', user.email);

        // Try to find user in each collection to determine type
        const userType = await determineUserType(user.$id, user.email);
        
        if (!userType) {
            console.log('⚠️ User found but not in any collection');
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
            const admins = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.ADMINS || 'admins_collection_id',
                [Query.equal('email', email)]
            );
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
        } catch (adminError: any) {
            console.warn('⚠️ Admins collection not found, skipping admin check');
        }

        // Check Hotels
        const hotels = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.HOTELS,
            [Query.equal('email', email)]
        );
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

        // Check Villas
        const villas = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.VILLAS || 'villas',
            [Query.equal('email', email)]
        );
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

        // Check Agents
        const agents = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.AGENTS,
            [Query.equal('email', email)]
        );
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

        // Check Therapists
        const therapists = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.THERAPISTS,
            [Query.equal('email', email)]
        );
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

        // Check Places (Massage Places)
        const places = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PLACES,
            [Query.equal('email', email)]
        );
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

        // Check Regular Users
        const users = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USERS,
            [Query.equal('email', email)]
        );
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

        return null;
    } catch (error: any) {
        console.error('Error determining user type:', error);
        return null;
    }
}

/**
 * Save session info to localStorage for offline/quick access
 */
export function saveSessionCache(sessionUser: SessionUser): void {
    try {
        localStorage.setItem('session_cache', JSON.stringify({
            type: sessionUser.type,
            email: sessionUser.email,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Error saving session cache:', error);
    }
}

/**
 * Clear session cache
 */
export function clearSessionCache(): void {
    try {
        localStorage.removeItem('session_cache');
        // Also clear any other auth-related items
        localStorage.removeItem('hotel_session');
        localStorage.removeItem('villa_session');
        localStorage.removeItem('admin_session');
        localStorage.removeItem('agent_session');
        localStorage.removeItem('therapist_session');
        localStorage.removeItem('place_session');
        localStorage.removeItem('customer_session');
    } catch (error) {
        console.error('Error clearing session cache:', error);
    }
}

/**
 * Logout current user and clear session
 */
export async function logout(): Promise<void> {
    try {
        await account.deleteSession('current');
        clearSessionCache();
        console.log('✅ Session cleared successfully');
    } catch (error: any) {
        // If error is 401 and user is guest, this is expected behavior
        if (error.code === 401 && error.message?.includes('missing scopes')) {
            console.log('📭 Logout attempted on guest user - no active session to clear');
            clearSessionCache();
            return;
        }
        console.error('Error during logout:', error);
        // Still clear cache even if Appwrite logout fails
        clearSessionCache();
    }
}

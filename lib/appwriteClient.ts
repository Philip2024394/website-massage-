/**
 * =====================================================================
 * UNIFIED APPWRITE CLIENT - SINGLE SOURCE OF TRUTH
 * =====================================================================
 * 
 * This is the ONLY Appwrite client configuration file for the entire app.
 * All services, components, and features MUST import from this file.
 * 
 * Facebook/Amazon-scale production standards:
 * - Single client instance shared across the app
 * - Centralized configuration
 * - No duplicate Appwrite connections
 * - Role-based access control ready
 * 
 * @version 2.0.0
 * @merged Admin Dashboard + Main App
 */

import { Client, Databases, Account, Storage, Functions, ID, Permission, Role, Query } from 'appwrite';

// =====================================================================
// APPWRITE CLIENT CONFIGURATION
// =====================================================================

const client = new Client();

client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

// Core Appwrite services - instantiated once, used everywhere
export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Export client and utilities
export { client, ID, Permission, Role, Query };

// Backward compatibility exports
export { client as appwriteClient };
export { databases as appwriteDatabases };
export { account as appwriteAccount };
export { storage as appwriteStorage };
export { functions as appwriteFunctions };

// =====================================================================
// DATABASE CONFIGURATION
// =====================================================================

export const DATABASE_ID = '68f76ee1000e64ca8d05';
export const APPWRITE_DATABASE_ID = DATABASE_ID;

// =====================================================================
// COLLECTION IDs - Unified across Admin and Main App
// =====================================================================

export const COLLECTIONS = {
    // Core provider collections
    THERAPISTS: 'therapists_collection_id',
    PLACES: 'places_collection_id',
    FACIAL_PLACES: 'facial_places_collection',
    
    // Booking system
    BOOKINGS: 'bookings',
    THERAPIST_MATCHES: 'therapist_matches',
    
    // Chat system
    CHAT_SESSIONS: 'chat_sessions',
    CHAT_ROOMS: 'chat_rooms',
    MESSAGES: 'messages',
    
    // Reviews & achievements
    REVIEWS: 'reviews',
    ACHIEVEMENTS: 'achievements_collection_id',
    THERAPIST_ACHIEVEMENTS: 'therapist_achievements_collection_id',
    
    // Admin-specific (commission, notifications)
    COMMISSION_RECORDS: 'commission_records',
    NOTIFICATIONS: 'notifications',
    
    // Disabled collections (don't exist yet)
    USERS: '',
    AGENTS: '',
    ANALYTICS: '',
    ANALYTICS_EVENTS: '',
    ADMINS: '',
    HOTELS: '',
    VILLAS: '',
    PARTNERS: '',
    MASSAGE_TYPES: '',
    MEMBERSHIP_PRICING: '',
    CUSTOM_LINKS: '',
    IMAGE_ASSETS: '',
    LOGIN_BACKGROUNDS: '',
    TRANSLATIONS: '',
    ATTRIBUTES: ''
};

// Legacy lowercase alias for admin dashboard compatibility
export const collectionsLowercase = {
    therapists: COLLECTIONS.THERAPISTS,
    places: COLLECTIONS.PLACES,
    facialPlaces: COLLECTIONS.FACIAL_PLACES,
    bookings: COLLECTIONS.BOOKINGS,
    therapistMatches: COLLECTIONS.THERAPIST_MATCHES,
    chatSessions: COLLECTIONS.CHAT_SESSIONS,
    chatRooms: COLLECTIONS.CHAT_ROOMS,
    messages: COLLECTIONS.MESSAGES,
    reviews: COLLECTIONS.REVIEWS,
    achievements: COLLECTIONS.ACHIEVEMENTS,
    therapistAchievements: COLLECTIONS.THERAPIST_ACHIEVEMENTS,
    commissionRecords: COLLECTIONS.COMMISSION_RECORDS,
    notifications: COLLECTIONS.NOTIFICATIONS
};

// =====================================================================
// STORAGE BUCKETS
// =====================================================================

export const STORAGE_BUCKETS = {
    PARTNER_IMAGES: 'partner_images_bucket',
    PROFILE_IMAGES: 'profile_images',
    KTP_DOCUMENTS: 'ktp_documents',
    HOTEL_LETTERS: 'hotel_letters'
};

// =====================================================================
// LEGACY APPWRITE_CONFIG - For backward compatibility
// =====================================================================

export const APPWRITE_CONFIG = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: DATABASE_ID,
    collections: {
        therapists: COLLECTIONS.THERAPISTS,
        places: COLLECTIONS.PLACES,
        facialPlaces: COLLECTIONS.FACIAL_PLACES,
        bookings: COLLECTIONS.BOOKINGS,
        reviews: COLLECTIONS.REVIEWS,
        commissionRecords: COLLECTIONS.COMMISSION_RECORDS,
        chatSessions: COLLECTIONS.CHAT_SESSIONS,
        chatRooms: COLLECTIONS.CHAT_ROOMS,
        messages: COLLECTIONS.MESSAGES,
        notifications: COLLECTIONS.NOTIFICATIONS,
        achievements: COLLECTIONS.ACHIEVEMENTS,
        therapistAchievements: COLLECTIONS.THERAPIST_ACHIEVEMENTS
    },
    storageBuckets: STORAGE_BUCKETS
};

// =====================================================================
// USER ROLES & PERMISSIONS
// =====================================================================

export type UserRole = 'guest' | 'customer' | 'therapist' | 'place' | 'admin' | 'super_admin';

export interface AppUser {
    $id: string;
    email: string;
    name: string;
    role: UserRole;
    emailVerification?: boolean;
    prefs?: Record<string, any>;
}

// =====================================================================
// TYPE EXPORTS
// =====================================================================

export type CommissionStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type BookingLifecycleStatus = 'created' | 'accepted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Achievement {
    $id?: string;
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    requirement: number;
    reward?: string;
    rarity?: string;
}

export interface TherapistAchievement {
    $id?: string;
    id: string;
    therapistId: string;
    achievementId: string;
    earnedAt: string;
    progress: number;
}

export const ACHIEVEMENT_CATEGORIES = {
    PROFILE: 'profile',
    SERVICE: 'service',
    CUSTOMER: 'customer',
    REVENUE: 'revenue'
};

export const SAMPLE_ACHIEVEMENTS: Achievement[] = [
    { id: '1', name: 'First Booking', description: 'Complete your first booking', category: 'service', icon: '🎉', requirement: 1 },
    { id: '2', name: 'Rising Star', description: 'Complete 10 bookings', category: 'service', icon: '⭐', requirement: 10 },
    { id: '3', name: 'Top Performer', description: 'Complete 50 bookings', category: 'service', icon: '🏆', requirement: 50 }
];

// =====================================================================
// AUDIT LOG TYPES
// =====================================================================

export type AuditLogEntry = {
    action: string;
    userId?: string;
    details?: any;
    timestamp: string;
};

console.log('✅ [APPWRITE CLIENT] Unified client initialized - Single source of truth');

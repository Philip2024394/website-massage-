/**
 * 🔒 APPWRITE MASTER CONFIGURATION - SINGLE SOURCE OF TRUTH
 * 
 * ⚠️ CRITICAL: VS Code / Copilot MUST use these TEXT-BASED IDs
 * ⚠️ NEVER use alphanumeric IDs like "6761241900398c596516"
 * ⚠️ ALL collection IDs in Appwrite are TEXT-BASED (snake_case)
 * 
 * Last synced with Appwrite: 2026-01-08
 * API Key: standard_1cea58a1e69f6ade2b3583f08ceb9409fb527ec6e38f3d04818d6cf1c1492082a3c153af8d386ddec1faea977502b614e896b69950aea277f592e6b93ffdfc2c3e39c649cc01c0e54af8c7e1b76c6d299921280366a5e78b6cf8cb1179a34fb208c295e0ff554f7739efd206dc958779d52a4ac5474d289b1c5fe53cf3f9b313
 * 
 * To update this file, run: node fetch-collections.cjs
 */

// ============================================
// APPWRITE CONNECTION SETTINGS
// ============================================
export const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
export const APPWRITE_DATABASE_ID = '68f76ee1000e64ca8d05';

// ============================================
// 🔒 COLLECTION IDs - TEXT-BASED ONLY
// ============================================
// ⚠️ RULE: Collection IDs are ALWAYS text (snake_case), NEVER alphanumeric hashes
// ⚠️ If you see IDs like "6761241900398c596516", they are WRONG - use text IDs below

export const COLLECTIONS = {
  // Core User & Provider Collections
  users: 'users_collection_id',
  therapists: 'therapists_collection_id',
  places: 'places_collection_id',
  hotels: 'hotels_collection_id',
  agents: 'agents_collection_id',
  
  // Booking System
  bookings: 'bookings_collection_id',
  hotel_bookings: 'hotel_bookings',
  
  // Reviews & Notifications
  reviews: 'reviews_collection_id',
  notifications: 'notifications_collection_id',
  
  // Chat System - USE admin_messages (no chat_rooms/chat_messages exist yet)
  // ⚠️ IMPORTANT: If chat doesn't work, chat_rooms and chat_messages collections
  // need to be CREATED in Appwrite Console first
  chat_rooms: 'chat_rooms',           // May need to be created
  chat_messages: 'chat_messages',     // May need to be created
  admin_messages: 'admin_messages',   // ✅ Exists - fallback for chat
  
  // Content & Assets
  image_assets: 'image_assets',
  login_backgrounds: 'login_backgrounds',
  custom_links: 'custom_links_collection_id',
  translations: 'translations_collection_id',
  attributes: 'attributes',
  
  // Analytics & Events
  analytics_events: 'analytics_events',
  
  // Financial
  commission_records: 'commission_records',
  bank_details: 'bank_details',
  payment_transactions: 'payment_transactions',
  bankaccounts: 'bankaccounts',
  
  // Job Listings
  therapist_job_listings: 'therapist_job_listings',
  employer_job_postings: 'employer_job_postings',
  
  // Push Notifications
  push_subscriptions: 'push_subscriptions',
  
  // Membership
  massage_types: 'massage_types_collection_id',
  membership_pricing: 'membership_pricing_collection_id',
} as const;

// Type for collection names
export type CollectionName = keyof typeof COLLECTIONS;

// Helper to get collection ID with validation
export function getCollectionId(name: CollectionName): string {
  const id = COLLECTIONS[name];
  if (!id) {
    throw new Error(`Collection "${name}" not found in APPWRITE_MASTER_CONFIG`);
  }
  // Validate it's a text ID (not alphanumeric hash)
  if (/^[0-9a-f]{20,}$/i.test(id)) {
    console.error(`⚠️ WARNING: Collection "${name}" has alphanumeric ID "${id}". This may be incorrect.`);
  }
  return id;
}

// ============================================
// VALIDATION RULE FOR VS CODE / COPILOT
// ============================================
/**
 * RULE: When editing any file that uses Appwrite collection IDs:
 * 
 * ✅ CORRECT: Use text-based IDs from this file
 *    chatRooms: 'chat_rooms'
 *    users: 'users_collection_id'
 *    bookings: 'bookings_collection_id'
 * 
 * ❌ WRONG: Never use alphanumeric IDs
 *    chatRooms: '6761241900398c596516' // WRONG!
 *    users: '674f38dd0039f3de41ac'      // WRONG!
 * 
 * If unsure, run: node fetch-collections.cjs
 */

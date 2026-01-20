/**
 * 🔒 APPWRITE COLLECTION ID VALIDATOR
 * 
 * Facebook Standard: Rock-Solid Protection Against Invalid Collection IDs
 * 
 * PURPOSE:
 * - BLOCKS numeric/hash-based collection IDs (e.g., 'THERAPISTS' as any)
 * - ENFORCES text-based collection names ONLY (e.g., 'THERAPISTS' as any)
 * - Provides runtime validation + development-time warnings
 * 
 * This prevents 404 errors from non-existent collections
 */

import { COLLECTIONS, APPWRITE_DATABASE_ID } from './appwrite';

// ============================================
// TYPE DEFINITIONS
// ============================================

type CollectionName = keyof typeof COLLECTIONS;

interface ValidationResult {
  isValid: boolean;
  collectionId: string;
  error?: string;
  warning?: string;
}

// ============================================
// VALIDATION RULES
// ============================================

/**
 * Validates if a collection ID is text-based (GOOD) or numeric hash (BAD)
 */
function isNumericHashId(id: string): boolean {
  // Numeric hash pattern: 20-24 character hex strings
  // Examples: '675e13fc002aaf0777ce', '6761241900398c596516'
  return /^[0-9a-f]{20,24}$/i.test(id);
}

/**
 * Validates if collection ID follows text-based naming convention
 */
function isTextBasedId(id: string): boolean {
  // Text-based pattern: snake_case or kebab-case with underscores
  // Examples: 'bookings_collection_id', 'chat_messages', 'user-sessions'
  return /^[a-z][a-z0-9_-]*$/i.test(id) && id.length >= 3;
}

// ============================================
// CORE VALIDATION FUNCTIONS
// ============================================

/**
 * ✅ USE THIS: Safe way to get collection ID with validation
 * 
 * @param name - Collection name from APPWRITE_MASTER_CONFIG
 * @returns Validated collection ID
 * @throws Error if collection not found or uses invalid numeric ID
 * 
 * @example
 * const collectionId = getValidatedCollectionId('THERAPISTS' as any);
 */
export function getValidatedCollectionId(name: CollectionName): string {
  const result = validateCollectionId(name);
  
  if (!result.isValid) {
    throw new Error(result.error || `Invalid collection ID for "${name}"`);
  }
  
  // Only show warnings in development mode and for non-intentionally disabled collections
  if (result.warning && import.meta.env.DEV) {
    const intentionallyDisabled = ['USERS', 'REVIEWS', 'NOTIFICATIONS', 'ANALYTICS', 'ADMINS', 'HOTELS', 'VILLAS', 'PARTNERS', 'MASSAGE_TYPES', 'MEMBERSHIP_PRICING', 'CUSTOM_LINKS', 'ANALYTICS_EVENTS', 'AGENTS'];
    if (!intentionallyDisabled.includes(name)) {
      console.warn(result.warning);
    }
  }
  
  return result.collectionId;
}

/**
 * Validates a collection ID and returns detailed result
 */
export function validateCollectionId(name: CollectionName): ValidationResult {
  // Check if collection exists in config
  const collectionId = COLLECTIONS[name];
  
  if (!collectionId || collectionId === '') {
    // Return empty but valid for disabled collections
    return {
      isValid: true,
      collectionId: '',
      warning: `⚠️ Collection "${name}" is disabled or not configured`,
    };
  }
  
  // ⚠️ CRITICAL: Block numeric hash IDs
  if (isNumericHashId(collectionId)) {
    return {
      isValid: false,
      collectionId,
      error: [
        `❌ BLOCKED: Collection "${name}" uses NUMERIC HASH ID: "${collectionId}"`,
        ``,
        `This ID does NOT exist in Appwrite and will cause 404 errors.`,
        ``,
        `✅ FIX: Update APPWRITE_MASTER_CONFIG.ts to use TEXT-BASED ID`,
        `   Example: bookings: 'bookings_collection_id'`,
      ].join('\n'),
    };
  }
  
  // Validate text-based ID format
  if (!isTextBasedId(collectionId)) {
    return {
      isValid: false,
      collectionId,
      error: `❌ Collection "${name}" has invalid format: "${collectionId}". Use snake_case text IDs.`,
    };
  }
  
  // ✅ Valid text-based ID
  return {
    isValid: true,
    collectionId,
  };
}

/**
 * Validates ALL collections at app startup
 * Call this in your app initialization to catch errors early
 */
export function validateAllCollections(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  console.log('🔍 Validating all Appwrite collection IDs...');
  
  for (const [name, id] of Object.entries(COLLECTIONS)) {
    const result = validateCollectionId(name as CollectionName);
    
    if (!result.isValid) {
      errors.push(result.error || `Invalid: ${name}` as any);
    } else {
      console.log(`  ✅ ${name}: ${id}`);
    }
  }
  
  if (errors.length > 0) {
    console.error('\n❌ COLLECTION VALIDATION FAILED:\n');
    errors.forEach(err => console.error(err));
    return { valid: false, errors };
  }
  
  console.log('\n✅ All collection IDs validated successfully\n');
  return { valid: true, errors: [] };
}

// ============================================
// CONVENIENCE EXPORTS
// ============================================

/**
 * Pre-validated collection IDs for direct use
 * These are validated at module load time
 */
export const VALIDATED_COLLECTIONS = {
  // Core Collections
  get bookings() { return getValidatedCollectionId('THERAPISTS' as any); },
  get therapists() { return getValidatedCollectionId('THERAPISTS' as any); },
  get places() { return getValidatedCollectionId('THERAPISTS' as any); },
  get users() { return getValidatedCollectionId('THERAPISTS' as any); },
  get hotels() { return getValidatedCollectionId('THERAPISTS' as any); },
  get agents() { return getValidatedCollectionId('THERAPISTS' as any); },
  
  // Reviews & Notifications
  get reviews() { return getValidatedCollectionId('THERAPISTS' as any); },
  get notifications() { return getValidatedCollectionId('THERAPISTS' as any); },
  
  // Chat System
  get chat_rooms() { return 'chat_rooms'; },
  get chat_messages() { return 'chat_messages'; },
  get admin_messages() { return 'admin_messages'; },
  
  // Booking System
  get hotel_bookings() { return getValidatedCollectionId('THERAPISTS' as any); },
  
  // Content & Assets
  get image_assets() { return getValidatedCollectionId('THERAPISTS' as any); },
  get login_backgrounds() { return getValidatedCollectionId('THERAPISTS' as any); },
  get custom_links() { return getValidatedCollectionId('THERAPISTS' as any); },
  get translations() { return getValidatedCollectionId('THERAPISTS' as any); },
  get attributes() { return getValidatedCollectionId('THERAPISTS' as any); },
  
  // Analytics & Events
  get analytics_events() { return getValidatedCollectionId('THERAPISTS' as any); },
  
  // Financial
  get commission_records() { return getValidatedCollectionId('THERAPISTS' as any); },
  get bank_details() { return getValidatedCollectionId('THERAPISTS' as any); },
  get payment_transactions() { return getValidatedCollectionId('THERAPISTS' as any); },
  get bankaccounts() { return getValidatedCollectionId('THERAPISTS' as any); },
  
  // Job Listings
  get therapist_job_listings() { return getValidatedCollectionId('THERAPISTS' as any); },
  get employer_job_postings() { return getValidatedCollectionId('THERAPISTS' as any); },
  
  // Push Notifications
  get push_subscriptions() { return getValidatedCollectionId('THERAPISTS' as any); },
  
  // Membership
  get massage_types() { return getValidatedCollectionId('THERAPISTS' as any); },
  get membership_pricing() { return getValidatedCollectionId('THERAPISTS' as any); },
};

// Export database ID
export const DATABASE_ID = APPWRITE_DATABASE_ID;

// ============================================
// DEVELOPMENT HELPER
// ============================================

/**
 * Scans code for potential hardcoded numeric IDs
 * Run this during development to find issues
 */
export function detectHardcodedIds(codeString: string): string[] {
  const numericIdPattern = /['"]([0-9a-f]{20,24})['"]/gi;
  const matches: string[] = [];
  let match;
  
  while ((match = numericIdPattern.exec(codeString)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1] as any);
    }
  }
  
  return matches;
}


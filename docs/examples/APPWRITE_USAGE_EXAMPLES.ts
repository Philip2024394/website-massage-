/**
 * 🔧 QUICK REFERENCE: Using Validated Collection IDs
 * 
 * Copy-paste these examples when writing new code
 */

// ============================================
// ✅ CORRECT WAY - Always use VALIDATED_COLLECTIONS
// ============================================

import { databases } from './lib/appwrite';
import { VALIDATED_COLLECTIONS, DATABASE_ID } from './lib/appwrite-collection-validator';
import { Query } from 'appwrite';

// Example 1: List documents
async function getBookings() {
  const result = await databases.listDocuments(
    DATABASE_ID,
    VALIDATED_COLLECTIONS.bookings,  // ✅ Validated at runtime
    [Query.equal('status', 'pending')]
  );
  return result.documents;
}

// Example 2: Get single document
async function getTherapist(therapistId: string) {
  const therapist = await databases.getDocument(
    DATABASE_ID,
    VALIDATED_COLLECTIONS.therapists,  // ✅ Validated
    therapistId
  );
  return therapist;
}

// Example 3: Create document
async function createReview(data: any) {
  const review = await databases.createDocument(
    DATABASE_ID,
    VALIDATED_COLLECTIONS.reviews,  // ✅ Validated
    'unique()',  // Auto-generate ID
    data
  );
  return review;
}

// Example 4: Update document
async function updateBookingStatus(bookingId: string, status: string) {
  const updated = await databases.updateDocument(
    DATABASE_ID,
    VALIDATED_COLLECTIONS.bookings,  // ✅ Validated
    bookingId,
    { status }
  );
  return updated;
}

// Example 5: Delete document
async function deleteNotification(notificationId: string) {
  await databases.deleteDocument(
    DATABASE_ID,
    VALIDATED_COLLECTIONS.notifications,  // ✅ Validated
    notificationId
  );
}

// ============================================
// ❌ WRONG WAY - Never hardcode collection IDs
// ============================================

// ❌ DON'T DO THIS - Hardcoded numeric hash (will cause 404)
async function getBadBookings() {
  const result = await databases.listDocuments(
    '68f76ee1000e64ca8d05',
    '675e13fc002aaf0777ce',  // ❌ This doesn't exist!
    []
  );
  return result.documents;
}

// ❌ DON'T DO THIS - Using old APPWRITE_CONFIG directly
import { APPWRITE_CONFIG } from './lib/appwrite.config';

async function getBadTherapists() {
  const result = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.collections.therapists,  // ❌ Not validated
    []
  );
  return result.documents;
}

// ============================================
// 🔍 AVAILABLE VALIDATED COLLECTIONS
// ============================================

/*
VALIDATED_COLLECTIONS.bookings
VALIDATED_COLLECTIONS.therapists
VALIDATED_COLLECTIONS.places
VALIDATED_COLLECTIONS.reviews
VALIDATED_COLLECTIONS.notifications
VALIDATED_COLLECTIONS.chat_rooms
VALIDATED_COLLECTIONS.chat_messages
VALIDATED_COLLECTIONS.users
VALIDATED_COLLECTIONS.hotels
VALIDATED_COLLECTIONS.agents
VALIDATED_COLLECTIONS.push_subscriptions
VALIDATED_COLLECTIONS.analytics_events
*/

// ============================================
// 🛡️ ERROR HANDLING
// ============================================

async function safeGetBookings() {
  try {
    // If collection ID is invalid, this will throw at runtime
    const bookings = await databases.listDocuments(
      DATABASE_ID,
      VALIDATED_COLLECTIONS.bookings,
      []
    );
    return bookings.documents;
  } catch (error: any) {
    if (error.code === 404) {
      console.error('Collection not found - check APPWRITE_MASTER_CONFIG.ts');
    } else {
      console.error('Error fetching bookings:', error);
    }
    return [];
  }
}

// ============================================
// 📝 ADDING NEW COLLECTION
// ============================================

/*
Step 1: Add to APPWRITE_MASTER_CONFIG.ts

export const COLLECTIONS = {
  // ... existing ...
  my_new_collection: 'my_new_collection_id',  // Text-based!
};

Step 2: Add to appwrite-collection-validator.ts

export const VALIDATED_COLLECTIONS = {
  // ... existing ...
  get my_new_collection() { 
    return getValidatedCollectionId('my_new_collection'); 
  },
};

Step 3: Use in your code

import { VALIDATED_COLLECTIONS, DATABASE_ID } from './lib/appwrite-collection-validator';

const items = await databases.listDocuments(
  DATABASE_ID,
  VALIDATED_COLLECTIONS.my_new_collection,
  []
);
*/

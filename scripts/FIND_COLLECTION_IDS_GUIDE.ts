/**
 * Get Real Appwrite Collection IDs
 * 
 * This script helps you find the actual collection IDs from your Appwrite database.
 * 
 * EASIEST METHOD:
 * ================
 * 1. Go to: https://cloud.appwrite.io/console
 * 2. Select Project: 68f23b11000d25eb3664
 * 3. Go to Databases → Database: 68f76ee1000e64ca8d05
 * 4. Click on each collection and copy its ID from the top of the page
 * 
 * EXPECTED COLLECTIONS TO FIND:
 * ==============================
 * - therapists (or therapists_collection_id)
 * - places (or places_collection_id)
 * - users (or users_collection_id)
 * - agents (or agents_collection_id)
 * - admins (or admins_collection_id)
 * - hotels (or hotels_collection_id)
 * - villas
 * - bookings (or bookings_collection_id)
 * - reviews (or reviews_collection_id)
 * - notifications (or notifications_collection_id)
 * - massage_types (or massage_types_collection_id)
 * - membership_pricing (or membership_pricing_collection_id)
 * - custom_links (or custom_links_collection_id)
 * - image_assets
 * - login_backgrounds
 * - translations (or translations_collection_id)
 * 
 * WHAT YOU NEED TO DO:
 * ====================
 * For each collection, note down:
 * - Collection Name
 * - Collection ID (16-character string like: 68f76ee1000e64ca8d05)
 * 
 * THEN UPDATE lib/appwrite.ts:
 * ============================
 */

export const COLLECTION_ID_TEMPLATE = `
// BEFORE (with placeholders):
export const COLLECTIONS = {
    THERAPISTS: 'therapists_collection_id',  // ❌ PLACEHOLDER
    PLACES: 'places_collection_id',
    // ... etc
};

// AFTER (with real IDs from Appwrite Console):
export const COLLECTIONS = {
    THERAPISTS: '68fabc1234567890',  // ✅ REAL ID - Copy from Appwrite Console
    PLACES: '68fdef9876543210',      // ✅ REAL ID - Copy from Appwrite Console
    USERS: '68f123abc4567def',       // ✅ REAL ID - Copy from Appwrite Console
    AGENTS: '68f456ghi7890jkl',      // ✅ REAL ID - Copy from Appwrite Console
    ADMINS: '68f789mno1234pqr',      // ✅ REAL ID - Copy from Appwrite Console
    HOTELS: '68fstuvwx5678yz',       // ✅ REAL ID - Copy from Appwrite Console
    VILLAS: '68f987zyx6543wvu',      // ✅ REAL ID - Copy from Appwrite Console
    BOOKINGS: '68fabc7890def123',    // ✅ REAL ID - Copy from Appwrite Console
    REVIEWS: '68fghi4567jkl890',     // ✅ REAL ID - Copy from Appwrite Console
    ANALYTICS: '68fmno1234pqr567',   // ✅ REAL ID - Copy from Appwrite Console
    ANALYTICS_EVENTS: '68fpqr8901stu234',  // ✅ REAL ID
    NOTIFICATIONS: '68fvwx5678yza901',     // ✅ REAL ID
    MASSAGE_TYPES: '68fyz2345abc678',      // ✅ REAL ID
    MEMBERSHIP_PRICING: '68fdef9012ghi345', // ✅ REAL ID
    CUSTOM_LINKS: '68fjkl6789mno012',      // ✅ REAL ID
    IMAGE_ASSETS: '68fpqr3456stu789',      // ✅ REAL ID
    LOGIN_BACKGROUNDS: '68fvwx0123yza456', // ✅ REAL ID
    TRANSLATIONS: '68fabc7890def234',      // ✅ REAL ID
    // ... add any other collections
};

NOTE: The IDs above are EXAMPLES. You must replace them with YOUR actual collection IDs!
`;

console.log(`
🔧 THERAPIST AUTH FIX - Collection ID Guide
============================================

Based on the attributes you provided, your "therapists_collection_id" collection EXISTS in Appwrite.

NOW YOU NEED TO FIND ITS REAL ID:

Step 1: Open Appwrite Console
------------------------------
https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05

Step 2: Find the Therapists Collection
---------------------------------------
Look for a collection with these attributes:
✓ therapistId, id, email, name
✓ specialization, yearsOfExperience, isLicensed
✓ location, coordinates, hourlyRate
✓ isLive, status, pricing
✓ profilePicture, mainImage, description
✓ whatsappNumber, massageTypes, languages
(and more...)

Step 3: Copy the Collection ID
-------------------------------
Click on the collection, and you'll see the ID at the top.
It will look like: 68fabc1234567890 (16 characters)

Step 4: Update lib/appwrite.ts
-------------------------------
Change this line:
    THERAPISTS: 'therapists_collection_id',

To:
    THERAPISTS: 'PASTE_YOUR_REAL_ID_HERE',

Step 5: Repeat for All Collections
-----------------------------------
Do the same for PLACES, USERS, AGENTS, ADMINS, HOTELS, VILLAS, etc.

Step 6: Test Therapist Sign-Up
-------------------------------
Try creating a therapist account again. It should work now!

🎯 QUICK TIP:
If the collection is literally named "therapists_collection_id" in Appwrite,
then the ID might already be correct! Try checking the exact error message
when signing up to see what Appwrite says.
`);

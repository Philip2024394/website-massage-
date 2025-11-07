/**
 * Random Therapist Image Assignment Utility
 * Provides a collection of curated Appwrite URLs for therapist main images
 * to ensure consistent branding and professional appearance
 */

// Curated collection of professional therapist/massage images from Appwrite
const APPWRITE_THERAPIST_IMAGES = [
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4181001758526d84/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4182001d05a11a19/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4183001a3a6fd0de/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4184003b76cb5e94/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4185002b1b9a9f91/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe41860026f1e0cec5/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4187002166c85e5b/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe41880033c86a0901/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4189000f847d1ea0/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418a00159e88de97/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418b003b5dd26c5a/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418c00355b8b4b69/view?project=68f23b11000d25eb3664'
];

/**
 * Get a random therapist image URL from the curated Appwrite collection
 * Uses therapist ID for consistent image assignment (same therapist gets same image)
 * @param therapistId - Unique therapist identifier for consistent randomization
 * @returns Appwrite URL for therapist main image
 */
export const getRandomTherapistImage = (therapistId: string): string => {
    // Use therapist ID to create deterministic randomization
    // This ensures the same therapist always gets the same image
    let hash = 0;
    for (let i = 0; i < therapistId.length; i++) {
        const char = therapistId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use absolute value to ensure positive index
    const index = Math.abs(hash) % APPWRITE_THERAPIST_IMAGES.length;
    const selectedImage = APPWRITE_THERAPIST_IMAGES[index];
    
    console.log(`🎨 [Random Image] Therapist ${therapistId}:`);
    console.log(`   - Hash: ${hash}`);
    console.log(`   - Index: ${index} of ${APPWRITE_THERAPIST_IMAGES.length}`);
    console.log(`   - Selected URL: ${selectedImage}`);
    
    return selectedImage;
};

/**
 * Get a completely random therapist image (for testing or non-persistent assignments)
 * @returns Random Appwrite URL for therapist main image
 */
export const getRandomTherapistImageRandom = (): string => {
    const index = Math.floor(Math.random() * APPWRITE_THERAPIST_IMAGES.length);
    return APPWRITE_THERAPIST_IMAGES[index];
};

/**
 * Get all available therapist images (for admin panels or selection interfaces)
 * @returns Array of all Appwrite therapist image URLs
 */
export const getAllTherapistImages = (): string[] => {
    return [...APPWRITE_THERAPIST_IMAGES];
};

/**
 * Validate if a given URL is from our curated Appwrite collection
 * @param imageUrl - URL to validate
 * @returns Boolean indicating if URL is from our collection
 */
export const isValidTherapistImage = (imageUrl: string): boolean => {
    return APPWRITE_THERAPIST_IMAGES.includes(imageUrl);
};
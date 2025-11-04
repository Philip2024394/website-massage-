/**
 * Random Therapist Image Assignment Utility
 * Provides a collection of curated Appwrite URLs for therapist main images
 * to ensure consistent branding and professional appearance
 */

// Curated collection of professional therapist/massage images from Appwrite
const APPWRITE_THERAPIST_IMAGES = [
    'https://cloud.appwrite.io/v1/storage/buckets/674bf6850035ce7dd4c7/files/674bf6eb003e19b4c5b5/view?project=67473ad100020e4ce652&mode=admin',
    'https://cloud.appwrite.io/v1/storage/buckets/674bf6850035ce7dd4c7/files/674bf6f7000f22dfb9c4/view?project=67473ad100020e4ce652&mode=admin',
    'https://cloud.appwrite.io/v1/storage/buckets/674bf6850035ce7dd4c7/files/674bf701001da6b9a5e2/view?project=67473ad100020e4ce652&mode=admin',
    'https://cloud.appwrite.io/v1/storage/buckets/674bf6850035ce7dd4c7/files/674bf70b0023e3eebe40/view?project=67473ad100020e4ce652&mode=admin',
    'https://cloud.appwrite.io/v1/storage/buckets/674bf6850035ce7dd4c7/files/674bf715003e8fe2be94/view?project=67473ad100020e4ce652&mode=admin',
    'https://cloud.appwrite.io/v1/storage/buckets/674bf6850035ce7dd4c7/files/674bf71f000f3ab8c1d8/view?project=67473ad100020e4ce652&mode=admin',
    'https://cloud.appwrite.io/v1/storage/buckets/674bf6850035ce7dd4c7/files/674bf728003e15cf8ca0/view?project=67473ad100020e4ce652&mode=admin',
    'https://cloud.appwrite.io/v1/storage/buckets/674bf6850035ce7dd4c7/files/674bf7320019749e0a31/view?project=67473ad100020e4ce652&mode=admin',
    'https://cloud.appwrite.io/v1/storage/buckets/674bf6850035ce7dd4c7/files/674bf73c0028b42b2d14/view?project=67473ad100020e4ce652&mode=admin',
    'https://cloud.appwrite.io/v1/storage/buckets/674bf6850035ce7dd4c7/files/674bf746000e40f73e93/view?project=67473ad100020e4ce652&mode=admin',
    'https://cloud.appwrite.io/v1/storage/buckets/674bf6850035ce7dd4c7/files/674bf750002c6e3b35e9/view?project=67473ad100020e4ce652&mode=admin',
    'https://cloud.appwrite.io/v1/storage/buckets/674bf6850035ce7dd4c7/files/674bf759003ab1fa7b25/view?project=67473ad100020e4ce652&mode=admin'
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
    
    console.log(`🎨 [Random Image] Therapist ${therapistId} assigned image index ${index}`);
    return APPWRITE_THERAPIST_IMAGES[index];
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
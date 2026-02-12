/**
 * Random Therapist Image Assignment Utility
 * Uses ImageKit CDN for reliable image delivery (Appwrite storage URLs had 404 issues)
 * to ensure consistent branding and professional appearance
 */

// Reliable ImageKit CDN URLs - same set as heroImages for consistency
const THERAPIST_IMAGES = [
    'https://ik.imagekit.io/7grri5v7d/123456789101112131415161718.png',
    'https://ik.imagekit.io/7grri5v7d/1234567891011121314151617.png',
    'https://ik.imagekit.io/7grri5v7d/12345678910111213141516.png',
    'https://ik.imagekit.io/7grri5v7d/123456789101112131415.png',
    'https://ik.imagekit.io/7grri5v7d/1234567891011121314.png',
    'https://ik.imagekit.io/7grri5v7d/12345678910111213.png',
    'https://ik.imagekit.io/7grri5v7d/123456789101112.png',
    'https://ik.imagekit.io/7grri5v7d/1234567891011.png',
    'https://ik.imagekit.io/7grri5v7d/12345678910.png',
    'https://ik.imagekit.io/7grri5v7d/123456789.png',
    'https://ik.imagekit.io/7grri5v7d/12345678.png',
    'https://ik.imagekit.io/7grri5v7d/1234567.png',
];

/**
 * Get a therapist image URL from the curated ImageKit collection
 * Uses therapist ID for consistent image assignment (same therapist gets same image)
 * @param therapistId - Unique therapist identifier for consistent randomization
 * @returns ImageKit URL for therapist main image
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
    const index = Math.abs(hash) % THERAPIST_IMAGES.length;
    const selectedImage = THERAPIST_IMAGES[index];
    
    return selectedImage;
};

/**
 * Get a completely random therapist image (for testing or non-persistent assignments)
 * @returns Random ImageKit URL for therapist main image
 */
export const getRandomTherapistImageRandom = (): string => {
    const index = Math.floor(Math.random() * THERAPIST_IMAGES.length);
    return THERAPIST_IMAGES[index];
};

/**
 * Get all available therapist images (for admin panels or selection interfaces)
 * @returns Array of all ImageKit therapist image URLs
 */
export const getAllTherapistImages = (): string[] => {
    return [...THERAPIST_IMAGES];
};

/**
 * Validate if a given URL is from our curated ImageKit collection
 * @param imageUrl - URL to validate
 * @returns Boolean indicating if URL is from our collection
 */
export const isValidTherapistImage = (imageUrl: string): boolean => {
    return THERAPIST_IMAGES.includes(imageUrl);
};

/**
 * Get therapist main image - SINGLE SOURCE OF TRUTH for home page card AND profile page.
 * Same image displayed everywhere (home card, profile page, shared links).
 * Priority: mainImage → profileImageUrl → heroImageUrl → getRandomTherapistImage fallback
 */
export const getTherapistMainImage = (therapist: { [key: string]: unknown }): string => {
    const isValidUrl = (url: unknown) =>
        url && typeof url === 'string' && !String(url).startsWith('data:') && /^https?:\/\//.test(url);
    const mainImageRaw = isValidUrl(therapist.mainImage) ? therapist.mainImage : isValidUrl(therapist.mainimage) ? therapist.mainimage : null;
    const profileImageUrl = isValidUrl(therapist.profileImageUrl) ? therapist.profileImageUrl : null;
    const heroImageUrl = isValidUrl(therapist.heroImageUrl) ? therapist.heroImageUrl : null;
    const mainImage = mainImageRaw || profileImageUrl || heroImageUrl;
    const therapistId = String(therapist.$id || therapist.id || therapist.name || '');
    return (mainImage as string) || getRandomTherapistImage(therapistId);
};
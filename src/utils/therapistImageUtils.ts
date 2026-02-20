import { useMemo } from 'react';
import { THERAPIST_MAIN_IMAGES, BEAUTICIAN_MAIN_IMAGES } from '../lib/services/imageService';
import { therapistOffersService, SERVICE_TYPES } from '../constants/serviceTypes';

/**
 * Random Therapist Image Assignment Utility
 * Uses the Appwrite therapist main image gallery (same as imageService) so home and profile
 * show the correct gallery. Therapists only upload profile image (avatar); main image
 * is assigned from this pool by therapist ID for consistency.
 * Beautician profiles use a separate pool (BEAUTICIAN_MAIN_IMAGES) and show a random image per visit.
 */

/** Pool of main/cover images from Appwrite storage – single source for home + profile. */
const THERAPIST_IMAGES = THERAPIST_MAIN_IMAGES;

/**
 * Get a therapist image URL from the Appwrite main image gallery
 * Uses therapist ID for consistent image assignment (same therapist gets same image)
 * @param therapistId - Unique therapist identifier for consistent randomization
 * @returns Appwrite storage URL for therapist main image
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
 * @returns Random URL from Appwrite gallery for therapist main image
 */
export const getRandomTherapistImageRandom = (): string => {
    const index = Math.floor(Math.random() * THERAPIST_IMAGES.length);
    return THERAPIST_IMAGES[index];
};

/**
 * Get all available therapist images (for admin panels or selection interfaces)
 * @returns Array of all Appwrite therapist main image URLs
 */
export const getAllTherapistImages = (): string[] => {
    return [...THERAPIST_IMAGES];
};

/**
 * Validate if a given URL is from our Appwrite main image gallery
 * @param imageUrl - URL to validate
 * @returns Boolean indicating if URL is from our collection
 */
export const isValidTherapistImage = (imageUrl: string): boolean => {
    return THERAPIST_IMAGES.includes(imageUrl);
};

/**
 * Get a random beautician main image – changes each visit (per mount).
 * Used when displaying a therapist who offers beautician service.
 */
export const getRandomBeauticianMainImage = (): string => {
    if (!BEAUTICIAN_MAIN_IMAGES.length) return getRandomTherapistImage('beautician');
    const index = Math.floor(Math.random() * BEAUTICIAN_MAIN_IMAGES.length);
    return BEAUTICIAN_MAIN_IMAGES[index];
};

/**
 * Get therapist main image - SINGLE SOURCE OF TRUTH for home page card AND profile page.
 * Therapists/places only upload their profile image (avatar). They never set main image.
 * Main image = pool from Appwrite storage (imageService), assigned by therapist ID
 * so the same therapist always gets the same image on home and profile.
 * For beautician providers use useTherapistDisplayImage() so the random image is stable per visit.
 */
export const getTherapistMainImage = (therapist: { [key: string]: unknown }): string => {
    const therapistId = String(therapist.$id || therapist.id || therapist.name || '');
    return getRandomTherapistImage(therapistId);
};

/**
 * Hook: main image for display (card or profile). Use this instead of getTherapistMainImage
 * when the provider may be a beautician – beautician gets one random image per visit (stable per mount).
 */
export function useTherapistDisplayImage(therapist: { [key: string]: unknown } | null | undefined): string {
    const isBeautician = therapist ? therapistOffersService(therapist as any, SERVICE_TYPES.BEAUTICIAN) : false;
    return useMemo(() => {
        if (!therapist) return '';
        if (isBeautician) return getRandomBeauticianMainImage();
        return getTherapistMainImage(therapist);
    }, [therapist?.$id, therapist?.id, isBeautician]);
}
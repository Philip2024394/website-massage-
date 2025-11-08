/**
 * Rating utility functions for therapists and massage places
 */

export const DEFAULT_RATING = 4.8;
export const DEFAULT_REVIEW_COUNT = 0;

/**
 * Gets the display rating for a therapist or place
 * New providers start with 4.8 rating, which adjusts as real reviews come in
 * 
 * @param rating - The actual rating from database (could be 0, undefined, or null for new providers)
 * @param reviewCount - Number of reviews (0 for new providers)
 * @returns The rating to display (4.8 for new providers, actual rating for those with reviews)
 */
export const getDisplayRating = (rating?: number | null, reviewCount?: number | null): number => {
    // If no reviews yet, show default 4.8 rating
    if (!reviewCount || reviewCount === 0) {
        return DEFAULT_RATING;
    }
    
    // If has reviews but rating is invalid, show default
    if (!rating || rating <= 0) {
        return DEFAULT_RATING;
    }
    
    // Return actual rating for providers with reviews
    return rating;
};

/**
 * Gets the display review count
 * 
 * @param reviewCount - The actual review count from database
 * @returns The review count to display (0 for new providers)
 */
export const getDisplayReviewCount = (reviewCount?: number | null): number => {
    return reviewCount || DEFAULT_REVIEW_COUNT;
};

/**
 * Formats rating for display (shows 1 decimal place)
 * 
 * @param rating - The rating to format
 * @returns Formatted rating string (e.g., "4.8")
 */
export const formatRating = (rating: number): string => {
    return rating.toFixed(1);
};

/**
 * Checks if a provider is new (no reviews yet)
 * 
 * @param reviewCount - Number of reviews
 * @returns True if provider is new (no reviews)
 */
export const isNewProvider = (reviewCount?: number | null): boolean => {
    return !reviewCount || reviewCount === 0;
};

/**
 * Gets the initial rating and review count for new providers
 * Used when creating new therapist/place profiles
 * 
 * @returns Object with initial rating and review count
 */
export const getInitialRatingData = () => {
    return {
        rating: DEFAULT_RATING,
        reviewCount: DEFAULT_REVIEW_COUNT
    };
};
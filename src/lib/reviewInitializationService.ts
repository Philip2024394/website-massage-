/**
 * Review Initialization Service
 * Handles initial rating and review count setup for new therapists and massage places
 * All new accounts start with realistic ratings and review counts that update with real user reviews
 */

export interface InitialReviewData {
    rating: number;
    reviewCount: number;
}

/**
 * Generates initial review data for new accounts
 * @returns Object with initial rating (4.7-4.8) and review count (28-35)
 */
export function generateInitialReviewData(): InitialReviewData {
    // Generate rating between 4.7 and 4.8 (realistic starting rating)
    const rating = Math.round((4.7 + Math.random() * 0.1) * 10) / 10;
    
    // Generate review count between 28 and 35
    const reviewCount = Math.floor(Math.random() * 8) + 28; // 28 to 35
    
    return {
        rating,
        reviewCount
    };
}

/**
 * Updates rating and review count when a new review is added
 * @param currentRating Current average rating
 * @param currentReviewCount Current number of reviews
 * @param newRating New rating being added (1-5)
 * @returns Updated rating and review count
 */
export function updateRatingWithNewReview(
    currentRating: number, 
    currentReviewCount: number, 
    newRating: number
): InitialReviewData {
    // Validate new rating
    if (newRating < 1 || newRating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    
    // Calculate new average rating
    const totalRatingPoints = currentRating * currentReviewCount;
    const newTotalRatingPoints = totalRatingPoints + newRating;
    const newReviewCount = currentReviewCount + 1;
    const newAverageRating = Math.round((newTotalRatingPoints / newReviewCount) * 10) / 10;
    
    return {
        rating: newAverageRating,
        reviewCount: newReviewCount
    };
}

/**
 * Calculates what the rating would be if a review was removed (for admin purposes)
 * @param currentRating Current average rating
 * @param currentReviewCount Current number of reviews
 * @param removedRating Rating being removed (1-5)
 * @returns Updated rating and review count
 */
export function removeReviewRating(
    currentRating: number, 
    currentReviewCount: number, 
    removedRating: number
): InitialReviewData {
    // Can't remove from accounts with 1 or fewer reviews
    if (currentReviewCount <= 1) {
        throw new Error('Cannot remove review from account with 1 or fewer reviews');
    }
    
    // Validate removed rating
    if (removedRating < 1 || removedRating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    
    // Calculate new average rating
    const totalRatingPoints = currentRating * currentReviewCount;
    const newTotalRatingPoints = totalRatingPoints - removedRating;
    const newReviewCount = currentReviewCount - 1;
    const newAverageRating = Math.round((newTotalRatingPoints / newReviewCount) * 10) / 10;
    
    return {
        rating: newAverageRating,
        reviewCount: newReviewCount
    };
}

/**
 * Checks if an account needs initial review data setup
 * @param rating Current rating
 * @param reviewCount Current review count
 * @returns Whether the account needs initialization
 */
export function needsReviewInitialization(rating: number, reviewCount: number): boolean {
    return rating === 0 && reviewCount === 0;
}

/**
 * Validates rating value
 * @param rating Rating to validate
 * @returns Whether rating is valid
 */
export function isValidRating(rating: number): boolean {
    return rating >= 1 && rating <= 5 && rating % 0.1 === 0;
}

/**
 * Formats rating for display (ensures one decimal place)
 * @param rating Rating number
 * @returns Formatted rating string
 */
export function formatRating(rating: number): string {
    return rating.toFixed(1);
}

/**
 * Formats review count for display with proper pluralization
 * @param count Number of reviews
 * @returns Formatted review count string
 */
export function formatReviewCount(count: number): string {
    if (count === 1) {
        return '1 review';
    }
    return `${count} reviews`;
}

// Example usage:
// const initialData = generateInitialReviewData();
// console.log(`New account: ${formatRating(initialData.rating)} stars, ${formatReviewCount(initialData.reviewCount)}`);
// 
// const updated = updateRatingWithNewReview(4.8, 32, 5);
// console.log(`After 5-star review: ${formatRating(updated.rating)} stars, ${formatReviewCount(updated.reviewCount)}`);
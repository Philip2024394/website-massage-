/**
 * Hybrid Review Service
 * Combines real Appwrite reviews with seed reviews
 * Implements caching with stale-while-revalidate pattern
 */

import { reviewService as appwriteReviewService } from './appwrite/services/review.service';
import { generateSeedReviews, getDisplayReviews, isSeedReview, type SeedReview, type SeedReviewProviderType } from './seedReviews';

interface CachedReviews {
  data: any[];
  timestamp: number;
  profileId: string;
  providerType: string;
}

// Cache store (in-memory)
const reviewCache = new Map<string, CachedReviews>();

// Cache duration: 5 minutes (matches seed review rotation)
const CACHE_DURATION = 5 * 60 * 1000;

/** Provider type for review fetch; facial-place uses 'place' for API but facial templates for seeds. */
export type ReviewProviderType = 'therapist' | 'place' | 'facial-place';

/**
 * Generate cache key for a profile
 */
function getCacheKey(profileId: string | number, providerType: ReviewProviderType): string {
  return `${providerType}_${profileId}`;
}

/** Map to Appwrite providerType (facial-place stores as place). */
function toAppwriteProviderType(providerType: ReviewProviderType): 'therapist' | 'place' {
  return providerType === 'facial-place' ? 'place' : providerType;
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(cached: CachedReviews | undefined): boolean {
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION;
}

/**
 * Fetch reviews with caching
 * Returns cached data immediately if available (stale-while-revalidate)
 * Fetches fresh data in background
 */
export async function getReviewsForProfile(
  profileId: string | number,
  providerType: ReviewProviderType,
  city: string = 'Yogyakarta',
  options: {
    forceRefresh?: boolean;
    includeSeeds?: boolean;
  } = {}
): Promise<{
  reviews: Array<any | SeedReview>;
  fromCache: boolean;
  hasRealReviews: boolean;
}> {
  const { forceRefresh = false, includeSeeds = true } = options;
  const cacheKey = getCacheKey(profileId, providerType);
  const cached = reviewCache.get(cacheKey);
  const seedProviderType: SeedReviewProviderType = providerType;

  // Return cached data immediately if valid and not forcing refresh
  if (!forceRefresh && isCacheValid(cached)) {
    const displayReviews = includeSeeds
      ? getDisplayReviews(String(profileId), cached!.data, city, seedProviderType)
      : cached!.data;

    return {
      reviews: displayReviews,
      fromCache: true,
      hasRealReviews: cached!.data.length > 0
    };
  }

  // If we have stale cache, return it immediately and refresh in background
  if (cached && !forceRefresh) {
    const displayReviews = includeSeeds
      ? getDisplayReviews(String(profileId), cached.data, city, seedProviderType)
      : cached.data;

    // Refresh in background (don't await)
    refreshReviewCache(profileId, providerType, city, includeSeeds).catch(err => {
      console.error('Background refresh failed:', err);
    });

    return {
      reviews: displayReviews,
      fromCache: true,
      hasRealReviews: cached.data.length > 0
    };
  }

  // No cache or forced refresh - fetch fresh data (facial-place uses 'place' in API)
  const apiProviderType = toAppwriteProviderType(providerType);
  try {
    const realReviews = await appwriteReviewService.getByProvider(profileId, apiProviderType);

    // Cache the real reviews
    reviewCache.set(cacheKey, {
      data: realReviews,
      timestamp: Date.now(),
      profileId: String(profileId),
      providerType
    });

    const displayReviews = includeSeeds
      ? getDisplayReviews(String(profileId), realReviews, city, seedProviderType)
      : realReviews;

    return {
      reviews: displayReviews,
      fromCache: false,
      hasRealReviews: realReviews.length > 0
    };
  } catch (error) {
    console.error('Error fetching reviews:', error);

    // If fetch fails but we have cached data, use it
    if (cached) {
      const displayReviews = includeSeeds
        ? getDisplayReviews(String(profileId), cached.data, city, seedProviderType)
        : cached.data;

      return {
        reviews: displayReviews,
        fromCache: true,
        hasRealReviews: cached.data.length > 0
      };
    }

    // No cache and fetch failed - return only seed reviews (facial-place gets facial templates)
    const seedReviews = includeSeeds ? generateSeedReviews(String(profileId), city, 5, seedProviderType) : [];
    return {
      reviews: seedReviews,
      fromCache: false,
      hasRealReviews: false
    };
  }
}

/**
 * Background refresh of review cache
 */
async function refreshReviewCache(
  profileId: string | number,
  providerType: ReviewProviderType,
  city: string,
  includeSeeds: boolean
): Promise<void> {
  const cacheKey = getCacheKey(profileId, providerType);
  const apiProviderType = toAppwriteProviderType(providerType);

  try {
    const realReviews = await appwriteReviewService.getByProvider(profileId, apiProviderType);

    reviewCache.set(cacheKey, {
      data: realReviews,
      timestamp: Date.now(),
      profileId: String(profileId),
      providerType
    });
  } catch (error) {
    console.error('Failed to refresh review cache:', error);
  }
}

/**
 * Get all reviews for a location (for homepage, etc.)
 */
export async function getAllReviewsForLocation(
  location: string,
  providerType?: 'therapist' | 'place'
): Promise<any[]> {
  try {
    const allReviews = await appwriteReviewService.getAll();
    
    let filtered = allReviews.filter((r: any) => r.status === 'approved');
    
    if (providerType) {
      filtered = filtered.filter((r: any) => r.providerType === providerType);
    }
    
    return filtered;
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }
}

/**
 * Submit a new review (anonymous or authenticated)
 */
export async function submitReview(review: {
  providerId: string;
  providerType: 'therapist' | 'place';
  rating: number;
  reviewContent: string;
  reviewerName?: string;
  userId?: string;
}): Promise<any> {
  try {
    let result;
    
    if (review.reviewerName && !review.userId) {
      // Anonymous review
      result = await appwriteReviewService.createAnonymous({
        providerId: review.providerId,
        providerType: review.providerType,
        rating: review.rating,
        reviewContent: review.reviewContent,
        reviewerName: review.reviewerName
      });
    } else {
      // Authenticated review
      result = await appwriteReviewService.create({
        providerId: review.providerId,
        providerType: review.providerType,
        rating: review.rating,
        reviewContent: review.reviewContent,
        reviewerId: review.userId || 'anonymous',
        userName: review.reviewerName,
        userId: review.userId
      });
    }

    // Invalidate cache for this profile
    const cacheKey = getCacheKey(review.providerId, review.providerType);
    reviewCache.delete(cacheKey);

    return result;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
}

/**
 * Preload reviews for multiple profiles
 * Useful for card lists
 */
export async function preloadReviews(
  profiles: Array<{ id: string | number; type: ReviewProviderType; city?: string }>
): Promise<void> {
  const promises = profiles.map(profile =>
    getReviewsForProfile(profile.id, profile.type, profile.city || 'Yogyakarta')
  );

  await Promise.allSettled(promises);
}

/**
 * Clear all cached reviews
 */
export function clearReviewCache(): void {
  reviewCache.clear();
}

/**
 * Clear cache for specific profile
 */
export function clearProfileReviewCache(
  profileId: string | number,
  providerType: ReviewProviderType
): void {
  const cacheKey = getCacheKey(profileId, providerType);
  reviewCache.delete(cacheKey);
}

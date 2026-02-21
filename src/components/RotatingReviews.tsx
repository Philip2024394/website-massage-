import React, { useState, useEffect, useRef } from 'react';
import { Star, MessageSquare, BadgeCheck } from 'lucide-react';
import { getReviewsForProfile } from '../lib/hybridReviewService';
import { isSeedReview } from '../lib/seedReviews';
import { useLanguageContext } from '../context/LanguageContext';
import { logger } from '../utils/logger';
import { REAL_PEOPLE_AVATARS } from '../constants/realPeopleAvatars';

interface Review {
    $id?: string;
    id?: string;
    name?: string;
    reviewerName?: string;
    userName?: string;
    rating: number;
    comment?: string;
    text?: string;
    reviewContent?: string;
    reviewText?: string;
    avatar?: string;
    avatarUrl?: string;
    location?: string;
    city?: string;
    providerId?: string | number;
    providerType?: 'therapist' | 'place';
    createdAt?: string;
    isSeed?: boolean;
}

interface RotatingReviewsProps {
    location: string; // e.g., "Yogyakarta" or "Bali"
    limit?: number;
    providerId?: string | number;
    providerName?: string;
    providerType?: 'therapist' | 'place' | 'facial-place';
    providerImage?: string;
    onNavigate?: (page: string, params?: Record<string, string>) => void; // Optional navigation handler
}

const RotatingReviews: React.FC<RotatingReviewsProps> = ({ 
    location, 
    limit = 5, 
    providerId, 
    providerName, 
    providerType = 'therapist', 
    providerImage,
    onNavigate 
}) => {
    // STABLE RENDERING: Always render component, never conditionally unmount
    const [reviews, setReviews] = useState<Review[]>([]);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [hasRealReviews, setHasRealReviews] = useState(false);
    const isMountedRef = useRef(true);
    const { language } = useLanguageContext();
    
    // Convert 'gb' to 'en' for consistency
    const currentLanguage: 'en' | 'id' = language === 'gb' ? 'en' : language as 'en' | 'id';
    
    // Translations
    const translations = {
        en: {
            title: 'Customer Reviews',
            topReviews: 'Top 5 Reviews',
            post: 'Post',
            loading: 'Loading reviews...',
            showMore: 'Show more',
            showLess: 'Show less',
            previewLabel: 'Preview Review'
        },
        id: {
            title: 'Ulasan Pelanggan',
            topReviews: 'Top 5 Ulasan',
            post: 'Posting',
            loading: 'Memuat ulasan...',
            showMore: 'Baca lebih lanjut',
            showLess: 'Lihat lebih sedikit',
            previewLabel: 'Ulasan Pratinjau'
        }
    };
    
    const t = translations[currentLanguage];

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Fetch reviews with stable, race-condition-free logic
    const fetchReviews = async () => {
        // Don't update state if component unmounted
        if (!isMountedRef.current) return;
        
        try {
            // CRITICAL: For specific provider, use hybrid service with seed reviews
            if (providerId) {
                const result = await getReviewsForProfile(
                    providerId,
                    providerType,
                    location,
                    { includeSeeds: true }
                );
                
                if (!isMountedRef.current) return;
                
                // Format reviews for display
                const formattedReviews = result.reviews.map((review, index) => {
                    const displayComment = review.reviewContent || review.text || review.comment || '';
                    const displayName = review.userName || review.reviewerName || review.name || 'Anonymous';
                    const displayAvatar = review.avatarUrl || review.avatar || REAL_PEOPLE_AVATARS[index % REAL_PEOPLE_AVATARS.length];
                    
                    return {
                        ...review,
                        avatar: displayAvatar,
                        $id: review.$id || review.id || `review-${index}`,
                        name: displayName,
                        reviewerName: displayName,
                        userName: displayName,
                        comment: displayComment,
                        text: displayComment,
                        reviewContent: displayComment,
                        reviewText: displayComment,
                        location: review.location || location,
                        isSeed: isSeedReview(review)
                    };
                });
                
                setReviews(formattedReviews);
                setHasRealReviews(result.hasRealReviews);
                logger.debug(`✅ Loaded ${formattedReviews.length} reviews (${result.hasRealReviews ? 'with' : 'no'} real reviews)`);
            } else {
                // For general/location-based reviews, fetch all approved
                // This is used on homepage or location pages
                setReviews([]);
                logger.debug('ℹ️ No providerId specified, skipping review fetch');
            }
        } catch (err) {
            logger.error('❌ Error fetching reviews:', err);
            // On error, don't clear reviews - keep what we have
        } finally {
            if (isMountedRef.current) {
                setIsInitialLoad(false);
            }
        }
    };

    // Initial fetch on mount and when key props change
    useEffect(() => {
        isMountedRef.current = true;
        fetchReviews();
    }, [location, providerId, providerType]);

    // Rotate seed reviews every 5 minutes
    useEffect(() => {
        // Only set up rotation if we have reviews displayed
        if (reviews.length === 0) return;
        
        const rotationInterval = setInterval(() => {
            logger.debug('🔄 Rotating seed reviews (5-minute refresh)');
            fetchReviews();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(rotationInterval);
    }, [reviews.length, location, providerId, providerType]);

    // STABLE RENDERING: Always render component with placeholder
    // Never show loading spinner that causes layout shift
    const showPlaceholder = isInitialLoad && reviews.length === 0;

    const handlePostClick = () => {
        // If onNavigate is provided, use React routing (preferred)
        if (onNavigate) {
            const params: Record<string, string> = {};
            if (providerId) params.providerId = String(providerId);
            if (providerName) params.providerName = providerName;
            if (providerType) params.providerType = providerType;
            if (providerImage) params.providerImage = providerImage;
            params.returnUrl = window.location.pathname;
            
            // Store params in sessionStorage for the reviews page to read
            sessionStorage.setItem('reviewParams', JSON.stringify(params));
            onNavigate('reviews');
        } else {
            // Fallback to direct URL navigation with query params
            try {
                const url = new URL(window.location.origin + '/reviews');
                if (providerId) url.searchParams.set('providerId', String(providerId));
                if (providerName) url.searchParams.set('providerName', providerName);
                if (providerType) url.searchParams.set('providerType', providerType);
                if (providerImage) url.searchParams.set('providerImage', providerImage);
                url.searchParams.set('returnUrl', window.location.href);
                window.location.href = url.toString();
            } catch {
                window.location.href = '/reviews';
            }
        }
    };

    // STABLE RENDERING: Always render with placeholder-first approach
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex flex-col">
                    <h2 className="text-xl font-medium text-black">{t.title}</h2>
                    <span className="text-sm text-gray-500">
                        {providerName ? `${providerName} ${t.topReviews}` : (location ? `${location} ${t.topReviews}` : t.topReviews)}
                    </span>
                </div>
                <button
                    onClick={handlePostClick}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors shadow-sm"
                    title={t.post}
                >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t.post}</span>
                </button>
            </div>
            
            {/* Show placeholder during initial load */}
            {showPlaceholder ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm animate-pulse">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                    <p className="text-sm">{t.loading}</p>
                </div>
            ) : (
                <div className="space-y-4">{reviews.map((review, index) => {
                    const displayText = review.text || review.reviewContent || review.comment || review.reviewText || '';
                    const displayName = review.userName || review.reviewerName || review.name || 'Anonymous';
                    const displayAvatar = review.avatarUrl || review.avatar || REAL_PEOPLE_AVATARS[index % REAL_PEOPLE_AVATARS.length];
                    const reviewId = review.$id || review.id || `review-${index}`;
                    const isExpanded = expanded.has(reviewId);
                    const isSeed = review.isSeed === true;
                    
                    return (
                        <div key={reviewId} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm relative">
                            {/* Seed review indicator (hidden by default, shows on hover for admins) */}
                            {isSeed && (
                                <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        {t.previewLabel}
                                    </span>
                                </div>
                            )}
                            {/* Admin Approved badge – live (non-seed) comments only */}
                            {!isSeed && (
                                <div className="absolute top-2 right-2 flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1">
                                    <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                                    <span className="text-[10px] font-medium">Admin Approved</span>
                                </div>
                            )}
                            
                            <div className="flex items-start gap-4">
                                {/* Avatar – real people image */}
                                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                                    {displayAvatar && (
                                        <img
                                            src={displayAvatar}
                                            alt={displayName}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    )}
                                </div>

                                {/* Review Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-black truncate">
                                            {displayName}
                                        </h3>
                                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < review.rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Review text with expand/collapse */}
                                    <p className={`text-gray-700 text-sm leading-relaxed whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-3'}`}>
                                        {displayText}
                                    </p>
                                    
                                    {displayText.length > 150 && (
                                        <button
                                            onClick={() => {
                                                setExpanded(prev => {
                                                    const next = new Set(prev);
                                                    if (next.has(reviewId)) {
                                                        next.delete(reviewId);
                                                    } else {
                                                        next.add(reviewId);
                                                    }
                                                    return next;
                                                });
                                            }}
                                            className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                                        >
                                            {isExpanded ? t.showLess : t.showMore}
                                        </button>
                                    )}
                                    
                                    {review.location && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            📍 {review.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}</div>
            )}
        </div>
    );
};

export default RotatingReviews;

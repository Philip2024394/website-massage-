import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import reviewService from '../lib/reviewService';
import { useLanguageContext } from '../context/LanguageContext';

// Avatar pool for review displays
const REVIEW_AVATARS = [
    'https://ik.imagekit.io/7grri5v7d/avatar%201.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%202.png', 
    'https://ik.imagekit.io/7grri5v7d/avatar%203.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%204.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%206.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%207.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%208.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%209.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%2010.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%2011.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%2012.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%2013.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%2014.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%2015.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%2016.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%2017.png',
    'https://ik.imagekit.io/7grri5v7d/avatar%2018.png'
];

interface Review {
    $id?: string;
    id?: string;
    name?: string;
    reviewerName?: string;
    rating: number;
    comment: string;
    reviewText?: string;
    avatar?: string;
    location?: string;
    city?: string;
    providerId?: string | number;
    providerType?: 'therapist' | 'place';
    createdAt?: string;
}

interface RotatingReviewsProps {
    location: string; // e.g., "Yogyakarta" or "Bali"
    limit?: number;
    providerId?: string | number;
    providerName?: string;
    providerType?: 'therapist' | 'place';
    providerImage?: string;
}

const RotatingReviews: React.FC<RotatingReviewsProps> = ({ location, limit = 5, providerId, providerName, providerType = 'therapist', providerImage }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const { language } = useLanguageContext();
    
    // Convert 'gb' to 'en' for consistency
    const currentLanguage: 'en' | 'id' = language === 'gb' ? 'en' : language as 'en' | 'id';
    
    // Translations
    const translations = {
        en: {
            title: 'Customer Reviews',
            topReviews: 'Top 5 Reviews',
            post: 'Post',
            noReviews: 'No reviews available yet. Be the first to review!',
            showMore: 'Show more',
            showLess: 'Show less'
        },
        id: {
            title: 'Ulasan Pelanggan',
            topReviews: 'Top 5 Ulasan',
            post: 'Posting',
            noReviews: 'Belum ada ulasan. Jadilah yang pertama untuk mengulas!',
            showMore: 'Baca lebih lanjut',
            showLess: 'Lihat lebih sedikit'
        }
    };
    
    const t = translations[currentLanguage];

    // Debug component mount
    useEffect(() => {
        console.log('🔧 RotatingReviews mounted with props:', {
            location,
            limit,
            providerId,
            providerName,
            providerType,
            providerImage
        });
    }, []);

    // Function to fetch reviews from local reviewService
    const fetchReviews = () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching reviews for:', { location, providerId, providerType });

            let fetchedReviews: Review[] = [];

            // If providerId is specified, get reviews for that specific provider
            if (providerId) {
                fetchedReviews = reviewService.getReviewsForProvider(providerId, providerType, limit);
                console.log('📋 Provider reviews fetched:', fetchedReviews.length);
            } else {
                // Get Yogyakarta reviews (for showcase profiles)
                const locationLower = location.toLowerCase();
                const isYogyakartaSearch = locationLower.includes('yogya') || locationLower.includes('jogja');
                
                if (isYogyakartaSearch) {
                    fetchedReviews = reviewService.getYogyakartaReviews(limit);
                    console.log('📋 Yogyakarta reviews fetched:', fetchedReviews.length);
                } else {
                    // For other locations, get recent reviews
                    fetchedReviews = reviewService.getRecentReviews(limit);
                    console.log('📋 Recent reviews fetched:', fetchedReviews.length);
                }
            }

            // Assign avatars and adapt location to viewing area
            const reviewsWithAvatars = fetchedReviews.map((review, index) => {
                // Replace Yogyakarta with current viewing location for showcase profiles
                let displayLocation = review.location || location;
                if (review.location?.toLowerCase().includes('yogya') || review.location?.toLowerCase().includes('jogja')) {
                    // For showcase profiles, show the location user is viewing from
                    if (!location.toLowerCase().includes('yogya') && !location.toLowerCase().includes('jogja')) {
                        displayLocation = location;
                    }
                }
                
                // Replace location mentions in comments for showcase profiles
                let displayComment = review.comment || review.reviewText || '';
                if (!location.toLowerCase().includes('yogya') && !location.toLowerCase().includes('jogja')) {
                    displayComment = displayComment
                        .replace(/Yogyakarta/gi, location.split(',')[0])
                        .replace(/Yogya/gi, location.split(',')[0])
                        .replace(/Jogja/gi, location.split(',')[0]);
                }
                
                return {
                    ...review,
                    avatar: review.avatar || REVIEW_AVATARS[index % REVIEW_AVATARS.length],
                    $id: review.$id || review.id || `review-${index}`,
                    location: displayLocation,
                    comment: displayComment,
                    reviewText: displayComment
                };
            });

            setReviews(reviewsWithAvatars);
            console.log('✅ Loaded', reviewsWithAvatars.length, 'reviews');
        } catch (err) {
            console.error('❌ Error fetching reviews:', err);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch - ensure reviewService is initialized
    useEffect(() => {
        // Force reviewService to initialize if in browser
        if (typeof window !== 'undefined') {
            console.log('🔧 Ensuring reviewService is ready...');
            // Trigger a dummy call to ensure reviewService constructor has run
            reviewService.getRecentReviews(1);
        }
        fetchReviews();
    }, [location, providerId, limit]);

    // Listen for review updates from auto-review system
    useEffect(() => {
        const handleReviewUpdate = () => {
            console.log('🔄 Reviews updated, refreshing display...');
            fetchReviews();
        };

        window.addEventListener('reviewsUpdated', handleReviewUpdate);
        return () => window.removeEventListener('reviewsUpdated', handleReviewUpdate);
    }, [location, providerId, limit]);

    // Rotate reviews every 5 minutes (300000ms)
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('🔄 Auto-rotating reviews...');
            fetchReviews();
        }, 300000); // 5 minutes

        return () => clearInterval(interval);
    }, [location, limit, providerId]);

    if (loading) {
        return (
            <div className="mb-6">
                <h2 className="text-xl font-medium text-black mb-4">{t.title}</h2>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
            </div>
        );
    }

    const handlePostClick = () => {
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
    };

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
            
            {reviews.length === 0 ? (
                <div className="text-center py-4 text-gray-600">
                    <p>{t.noReviews}</p>
                </div>
            ) : (
                <div className="space-y-4">{reviews.map((review, index) => (
                    <div key={review.$id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                <img
                                    src={review.avatar}
                                    alt={review.reviewerName || review.name || 'Reviewer'}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Review Content */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-black">
                                        {review.reviewerName || review.name || 'Anonymous'}
                                    </h3>
                                    <div className="flex items-center gap-1">
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
                                {(() => {
                                    const text = review.reviewText || review.comment || '';
                                    const hashSource = `${review.$id}-${index}`;
                                    let hash = 0;
                                    for (let i = 0; i < hashSource.length; i++) hash = ((hash << 5) - hash) + hashSource.charCodeAt(i);
                                    const clampLines = 2 + Math.abs(hash) % 4; // 2..5 lines
                                    const isExpanded = expanded.has(review.$id);
                                    return (
                                        <>
                                            <p className={`text-gray-700 text-sm leading-relaxed ${isExpanded ? '' : `line-clamp-${clampLines}`}`}>
                                                {text}
                                            </p>
                                            {text.length > 120 && (
                                                <button
                                                    onClick={() => {
                                                        setExpanded(prev => {
                                                            const next = new Set(prev);
                                                            if (next.has(review.$id)) next.delete(review.$id); else next.add(review.$id);
                                                            return next;
                                                        });
                                                    }}
                                                    className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
                                                >
                                                    {isExpanded ? t.showLess : t.showMore}
                                                </button>
                                            )}
                                        </>
                                    );
                                })()}
                                {review.location && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        📍 {review.location}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}</div>
            )}
        </div>
    );
};

export default RotatingReviews;

import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus } from 'lucide-react';
import { appwriteDatabases } from '../lib/appwrite/client';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Query } from 'appwrite';

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
    $id: string;
    name?: string;
    reviewerName?: string;
    rating: number;
    comment: string;
    reviewText?: string;
    avatar?: string;
    location?: string;
    city?: string;
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
    const [error, setError] = useState<string | null>(null);

    // Function to fetch reviews from Appwrite
    const fetchReviews = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching reviews for location:', location);

            // Fetch all reviews from Appwrite
            const response = await appwriteDatabases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                [
                    Query.limit(100), // Get up to 100 reviews to filter and randomize
                    Query.orderDesc('$createdAt')
                ]
            );

            console.log('📋 Total reviews fetched:', response.documents.length);

            // Filter for Yogyakarta/Jogja location
            const locationLower = location.toLowerCase();
            const isYogyakartaSearch = locationLower.includes('yogya') || locationLower.includes('jogja');

            let filteredReviews = response.documents.filter((doc: any) => {
                const docLocation = (doc.location || doc.city || '').toLowerCase();
                if (isYogyakartaSearch) {
                    return docLocation.includes('yogya') || docLocation.includes('jogja');
                }
                return docLocation.includes(locationLower);
            });

            console.log('✅ Filtered reviews for', location, ':', filteredReviews.length);

            // If no reviews found for the location, use all reviews as fallback
            if (filteredReviews.length === 0) {
                console.log('⚠️ No reviews found for location, using all reviews');
                filteredReviews = response.documents;
            }

            // Map to Review interface
            const mappedReviews: Review[] = filteredReviews.map((doc: any) => ({
                $id: doc.$id,
                name: doc.name || doc.reviewerName || 'Anonymous',
                reviewerName: doc.reviewerName || doc.name || 'Anonymous',
                rating: doc.rating || 5,
                comment: doc.comment || doc.reviewText || 'Great service!',
                reviewText: doc.reviewText || doc.comment || 'Great service!',
                avatar: doc.avatar || REVIEW_AVATARS[Math.floor(Math.random() * REVIEW_AVATARS.length)],
                location: doc.location || doc.city || location,
                city: doc.city || doc.location || location
            }));

            // Shuffle and select random reviews
            const shuffled = mappedReviews.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, limit);

            // Assign avatars if not present
            const reviewsWithAvatars = selected.map((review, index) => ({
                ...review,
                avatar: review.avatar || REVIEW_AVATARS[index % REVIEW_AVATARS.length]
            }));

            setReviews(reviewsWithAvatars);
            setError(null);
            console.log('✅ Loaded', reviewsWithAvatars.length, 'reviews');
        } catch (err) {
            console.error('❌ Error fetching reviews:', err);
            setError('Failed to load reviews');
            // Set fallback reviews if fetch fails
            setFallbackReviews();
        } finally {
            setLoading(false);
        }
    };

    // Fallback reviews if Appwrite fetch fails
    const setFallbackReviews = () => {
        const fallbackReviewData = [
            { name: 'Andi Prasetyo', rating: 5, comment: 'Excellent massage service in Yogyakarta! The therapist was very professional and skilled.' },
            { name: 'Sari Wulandari', rating: 5, comment: 'Great experience in the Jogja area. Highly recommend for anyone visiting Yogyakarta.' },
            { name: 'Bambang Sutrisno', rating: 5, comment: 'Perfect massage therapy in the heart of Yogyakarta. Will definitely book again.' },
            { name: 'Dewi Lestari', rating: 5, comment: 'Amazing service in the Malioboro area. The therapist knows exactly what they\'re doing.' },
            { name: 'Fajar Nugraha', rating: 5, comment: 'Wonderful massage experience in Yogyakarta. Great value for money in this city.' }
        ];

        const fallbackReviews: Review[] = fallbackReviewData.map((review, index) => ({
            $id: `fallback-${index}`,
            ...review,
            reviewerName: review.name,
            reviewText: review.comment,
            avatar: REVIEW_AVATARS[index % REVIEW_AVATARS.length],
            location,
            city: location
        }));

        setReviews(fallbackReviews);
    };

    // Initial fetch
    useEffect(() => {
        fetchReviews();
    }, [location]);

    // Rotate reviews every 5 minutes (300000ms)
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('🔄 Rotating reviews...');
            fetchReviews();
        }, 300000); // 5 minutes

        return () => clearInterval(interval);
    }, [location, limit]);

    if (loading) {
        return (
            <div className="mb-6">
                <h2 className="text-xl font-medium text-black mb-4">Customer Reviews</h2>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
            </div>
        );
    }

    if (error && reviews.length === 0) {
        return (
            <div className="mb-6">
                <h2 className="text-xl font-medium text-black mb-4">Customer Reviews</h2>
                <div className="text-center py-4 text-gray-600">
                    <p>{error}</p>
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
                    <h2 className="text-xl font-medium text-black">Customer Reviews</h2>
                    <span className="text-sm text-gray-500">
                        {providerName ? `${providerName} Top 5 Reviews` : (location ? `${location} Top 5 Reviews` : 'Top 5 Reviews')}
                    </span>
                </div>
                <button
                    onClick={handlePostClick}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors shadow-sm"
                    title="Post a review"
                >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>Post</span>
                </button>
            </div>
            <div className="space-y-4">
                {reviews.map((review, index) => (
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
                                                    {isExpanded ? 'Show less' : 'Read more'}
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
                ))}
            </div>
        </div>
    );
};

export default RotatingReviews;

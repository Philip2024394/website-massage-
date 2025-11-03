import React, { useState, useEffect } from 'react';
import { Star, User, CheckCircle, MessageSquare } from 'lucide-react';
import { reviewService, type Review, type ReviewSummary } from '../lib/reviewService';
import type { Therapist, Place } from '../types';

interface ReviewSystemProps {
    provider: Therapist | Place;
    providerType: 'therapist' | 'place';
    currentUserId?: string;
    currentUserName?: string;
    showAddReview?: boolean;
    onProviderUpdate?: (updatedProvider: Therapist | Place) => void;
}

interface ReviewFormData {
    rating: number;
    comment: string;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({
    provider,
    providerType,
    currentUserId,
    currentUserName,
    showAddReview = true,
    onProviderUpdate
}) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({
        averageRating: provider.rating,
        totalReviews: provider.reviewCount,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [formData, setFormData] = useState<ReviewFormData>({ rating: 5, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canReview, setCanReview] = useState(false);

    useEffect(() => {
        loadReviews();
        if (currentUserId) {
            setCanReview(reviewService.canUserReview(currentUserId, provider.id, providerType));
        }
    }, [provider.id, providerType, currentUserId]);

    const loadReviews = () => {
        const providerReviews = reviewService.getProviderReviews(provider.id, providerType);
        const summary = reviewService.getProviderReviewSummary(provider.id, providerType);
        setReviews(providerReviews);
        setReviewSummary(summary);
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currentUserId || !currentUserName) {
            alert('Please log in to leave a review');
            return;
        }

        if (!formData.comment.trim()) {
            alert('Please write a comment');
            return;
        }

        setIsSubmitting(true);

        try {
            // Add the review
            reviewService.addReview(
                provider.id,
                providerType,
                currentUserId,
                currentUserName,
                formData.rating,
                formData.comment
            );

            // Update provider rating
            const updatedProvider = reviewService.updateProviderRating(provider, formData.rating);

            // Update state
            loadReviews();
            setShowReviewForm(false);
            setFormData({ rating: 5, comment: '' });
            setCanReview(false);

            // Notify parent component
            if (onProviderUpdate) {
                onProviderUpdate(updatedProvider);
            }

            alert('Review submitted successfully!');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
        const sizeClasses = {
            sm: 'w-3 h-3',
            md: 'w-4 h-4',
            lg: 'w-5 h-5'
        };

        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeClasses[size]} ${
                            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const renderRatingDistribution = () => {
        return (
            <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviewSummary.ratingDistribution[rating as keyof typeof reviewSummary.ratingDistribution];
                    const percentage = reviewSummary.totalReviews > 0 ? (count / reviewSummary.totalReviews) * 100 : 0;
                    
                    return (
                        <div key={rating} className="flex items-center gap-2 text-sm">
                            <span className="w-8">{rating}</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="w-8 text-gray-600">{count}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Reviews & Ratings</h3>
                {showAddReview && canReview && currentUserId && (
                    <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Write Review
                    </button>
                )}
            </div>

            {/* Overall Rating */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800 mb-2">
                        {provider.rating.toFixed(1)}
                    </div>
                    {renderStars(provider.rating, 'lg')}
                    <div className="text-gray-600 mt-2">
                        Based on {provider.reviewCount} reviews
                    </div>
                </div>
                
                <div>
                    <h4 className="font-medium text-gray-800 mb-3">Rating Distribution</h4>
                    {renderRatingDistribution()}
                </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
                <div className="border-t pt-6 mb-6">
                    <h4 className="font-medium text-gray-800 mb-4">Write a Review</h4>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating
                            </label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`w-6 h-6 ${
                                                star <= formData.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300 hover:text-yellow-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comment
                            </label>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Share your experience..."
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowReviewForm(false)}
                                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            <div className="border-t pt-6">
                <h4 className="font-medium text-gray-800 mb-4">Recent Reviews</h4>
                {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No reviews yet. Be the first to leave a review!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.slice(0, 5).map((review) => (
                            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-800">{review.userName}</span>
                                            {review.isVerified && (
                                                <div title="Verified booking">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {renderStars(review.rating, 'sm')}
                                            <span className="text-sm text-gray-500">
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {reviews.length > 5 && (
                            <div className="text-center pt-4">
                                <button className="text-blue-600 hover:text-blue-800 font-medium">
                                    Show all {reviews.length} reviews
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewSystem;
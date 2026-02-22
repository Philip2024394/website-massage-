import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { ReviewData } from './ReviewModal';
import { ReviewCard } from './ReviewCard';

interface ReviewSectionProps {
  providerId: string;
  providerName: string;
  providerType: 'therapist' | 'place';
  reviews: ReviewData[];
  onNavigateToReviews: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  providerId,
  providerName,
  providerType,
  reviews,
  onNavigateToReviews,
}) => {
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  // Show only first 3 reviews on profile page
  const displayedReviews = reviews.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
              </div>
              <span className="text-gray-600">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          {/* View All Reviews Button */}
          <button
            onClick={onNavigateToReviews}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl"
          >
            <MessageSquare className="w-5 h-5" />
            View All Reviews
          </button>
        </div>
      </div>

      {/* Reviews Preview */}
      <div className="space-y-4">
        {displayedReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-6">
              Be the first to share your experience with {providerName}
            </p>
            <button
              onClick={onNavigateToReviews}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl"
            >
              <MessageSquare className="w-5 h-5" />
              Write First Review
            </button>
          </div>
        ) : (
          <>
            {displayedReviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
            {reviews.length > 3 && (
              <div className="text-center">
                <button
                  onClick={onNavigateToReviews}
                  className="text-amber-600 hover:text-amber-700 font-semibold text-sm"
                >
                  View all {reviews.length} reviews →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

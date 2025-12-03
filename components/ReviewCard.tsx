import React from 'react';
import { Calendar, Clock, Star, AlertCircle } from 'lucide-react';
import { ReviewData } from './ReviewModal';

interface ReviewCardProps {
  review: ReviewData;
  showOwnerResponse?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, showOwnerResponse = true }) => {
  const displayOwnerResponse = showOwnerResponse && review.rating < 4;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
      {/* Landscape Layout */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Left Side - User Info and Rating */}
        <div className="flex items-start gap-4 sm:w-1/3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-3xl shadow-lg">
              {review.avatar}
            </div>
          </div>

          {/* Name and Stars */}
          <div className="flex-grow min-w-0">
            <h3 className="font-bold text-gray-900 text-lg truncate">{review.userName}</h3>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-semibold text-gray-700">
                {review.rating}.0
              </span>
            </div>
          </div>
        </div>

        {/* Middle - Review Text */}
        <div className="flex-grow sm:w-1/3">
          <p className="text-gray-700 text-sm leading-relaxed">{review.reviewText}</p>
          
          {/* Owner Response Badge for Low Ratings */}
          {displayOwnerResponse && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 font-medium">
                Owner Addressed The Concern
              </p>
            </div>
          )}
        </div>

        {/* Right Side - Date and Time */}
        <div className="flex flex-col items-end justify-start gap-2 sm:w-1/4 text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="font-medium">{review.date}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="font-medium">{review.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

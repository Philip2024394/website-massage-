import React from 'react';
import type { Therapist } from '../types';
import { getTherapistMainImage, getRandomTherapistImage } from '../../utils/therapistImageUtils';
import { getTherapistDisplayName } from '../../utils/therapistCardHelpers';
import { getDisplayRating, formatRating, getDisplayReviewCount } from '../../utils/ratingUtils';
import { Share2 } from 'lucide-react';

interface TherapistHeaderProps {
  therapist: Therapist;
  onRate: (therapist: Therapist) => void;
  onShare: () => void;
  isDiscountActive: boolean;
  discountPercentage?: number;
}

const TherapistHeader = ({
  therapist,
  onRate,
  onShare,
  isDiscountActive,
  discountPercentage
}: TherapistHeaderProps): JSX.Element => {
  const mainImage = getTherapistMainImage(therapist as any);

  return (
    <div className="relative h-48 overflow-hidden rounded-t-2xl">
      {/* Background Banner Image - same as home card (single source of truth) */}
      <img
        src={mainImage}
        alt={getTherapistDisplayName(therapist.name)}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = getRandomTherapistImage(String(therapist.id || therapist.$id || ''));
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      {/* Discount Badge - Top Left */}
      {isDiscountActive && discountPercentage && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
          🔥 {discountPercentage}% OFF
        </div>
      )}
      
      {/* Star Rating Badge - Top Left, same design as facial main image badges */}
      {getDisplayRating(therapist.rating, therapist.reviewCount) > 0 && (
        <div
          className="absolute top-3 left-3 shadow-lg flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 cursor-pointer hover:bg-black/80 transition-colors"
          onClick={() => onRate(therapist)}
          role="button"
          aria-label={`Rate ${getTherapistDisplayName(therapist.name)}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-bold text-white">{formatRating(getDisplayRating(therapist.rating, therapist.reviewCount))}</span>
        </div>
      )}
      
      {/* Share Button - Bottom right corner, same design as facial main image badges */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShare();
        }}
        className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all z-30"
        title="Share this therapist"
        aria-label="Share this therapist"
      >
        <Share2 className="w-4 h-4 text-white" strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
};

export default TherapistHeader;

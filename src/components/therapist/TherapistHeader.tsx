import type { Therapist } from '../types';
import { getRandomTherapistImage } from '../../utils/therapistImageUtils';
import { getDisplayRating, formatRating, getDisplayReviewCount } from '../../utils/ratingUtils';

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
  const mainImage = therapist.mainImage || getRandomTherapistImage(String(therapist.id));
  
  return (
    <div className="relative h-48 overflow-hidden rounded-t-2xl">
      {/* Background Banner Image */}
      <img
        src={mainImage}
        alt={therapist.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = getRandomTherapistImage(String(therapist.id));
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
      
      {/* Rating Badge - Top Right */}
      {getDisplayRating(therapist.rating, therapist.reviewCount) > 0 && (
        <div
          className="absolute top-2 right-12 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-white transition-colors"
          onClick={() => onRate(therapist)}
          role="button"
          aria-label={`Rate ${therapist.name}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="#eab308">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-bold text-gray-900 text-base">{formatRating(getDisplayRating(therapist.rating, therapist.reviewCount))}</span>
        </div>
      )}
      
      {/* Share Button - Bottom Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShare();
        }}
        className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 z-30"
        title="Share this therapist"
        aria-label="Share this therapist"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>
    </div>
  );
};

export default TherapistHeader;

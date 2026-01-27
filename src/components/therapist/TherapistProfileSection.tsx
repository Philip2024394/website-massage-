import type { Therapist } from '../types';
import { getDisplayRating, formatRating } from '../../utils/ratingUtils';

interface TherapistProfileSectionProps {
  therapist: Therapist;
  onRate: (therapist: Therapist) => void;
}

const TherapistProfileSection = ({ therapist, onRate }: TherapistProfileSectionProps): JSX.Element => {
  const hasQualifiedBadge = (() => {
    const hasTimeRequirement = therapist.membershipStartDate
      ? new Date().getTime() - new Date(therapist.membershipStartDate).getTime() >= 3 * 30 * 24 * 60 * 60 * 1000
      : false;
    const hasPerformanceRequirement =
      (therapist.reviewCount ?? 0) >= 30 || (therapist.analytics && JSON.parse(therapist.analytics).bookings >= 90);
    const hasRatingRequirement = getDisplayRating(therapist.rating, therapist.reviewCount) >= 4.0;
    return hasTimeRequirement && hasPerformanceRequirement && hasRatingRequirement;
  })();

  return (
    <div className="flex-shrink-0">
      <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl relative aspect-square overflow-visible">
        {/* Profile Image */}
        {(therapist as any).profilePicture && (therapist as any).profilePicture.includes('appwrite.io') ? (
          <img
            className="w-full h-full rounded-full object-cover aspect-square"
            src={(therapist as any).profilePicture}
            alt={`${therapist.name} profile`}
            onError={(e) => {
              const imgElement = e.target as HTMLImageElement;
              imgElement.style.display = 'none';
              const placeholder = imgElement.parentElement?.querySelector('.profile-placeholder') as HTMLElement;
              if (placeholder) placeholder.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Placeholder */}
        <div
          className="profile-placeholder w-full h-full rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600"
          style={{
            display: (therapist as any).profilePicture && (therapist as any).profilePicture.includes('appwrite.io') ? 'none' : 'flex',
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}
        >
          {therapist.name ? therapist.name.charAt(0).toUpperCase() : '👤'}
        </div>

        {/* Qualified Therapist Badge */}
        {hasQualifiedBadge && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Verified Pro Badge */}
        {therapist.isVerified && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 1.5l2.19 4.44 4.9.71-3.54 3.45.83 4.86L10 12.9l-4.38 2.33.83-4.86L2.91 6.65l4.9-.71L10 1.5zm-1.2 9.09l-1.6-1.6a.75.75 0 10-1.06 1.06l2.13 2.13a.75.75 0 001.06 0l4.13-4.13a.75.75 0 10-1.06-1.06l-3.6 3.6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Star Rating Badge */}
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1 cursor-pointer z-30"
          onClick={() => onRate(therapist)}
          aria-label={`Rate ${therapist.name}`}
          role="button"
        >
          <span className="font-bold text-gray-900 text-base">{formatRating(getDisplayRating(therapist.rating, therapist.reviewCount))}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="#eab308">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TherapistProfileSection;

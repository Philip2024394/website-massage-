import { formatRating, getDisplayRating } from '../../utils/ratingUtils';
import type { Therapist } from '../../types';

interface TherapistPricingGridProps {
  pricing: { '60': number; '90': number; '120': number };
  therapist: Therapist;
  isDiscountActive: boolean;
  discountPercentage?: number;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID').format(price);
};

const TherapistPricingGrid = ({
  pricing,
  therapist,
  isDiscountActive,
  discountPercentage = 0,
}: TherapistPricingGridProps): JSX.Element => {
  const durations = [
    { label: '60 min', key: '60' as const },
    { label: '90 min', key: '90' as const },
    { label: '120 min', key: '120' as const },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 text-center text-sm mt-1">
      {durations.map(({ label, key }) => (
        <div
          key={key}
          className={`p-2 rounded-lg border shadow-md relative transition-all duration-300 min-h-[75px] flex flex-col justify-center ${
            isDiscountActive ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' : 'bg-gray-100 border-gray-200'
          }`}
        >
          {/* Star Rating - Top Right */}
          {getDisplayRating(therapist.rating, therapist.reviewCount) > 0 && (
            <div className="absolute top-1.5 right-1.5 text-yellow-400 text-xs font-bold">
              ★{formatRating(getDisplayRating(therapist.rating, therapist.reviewCount))}
            </div>
          )}
          
          <p className="text-gray-600 text-xs mb-1">{label}</p>
          
          {isDiscountActive ? (
            <p className="font-bold text-gray-800 text-sm leading-tight">
              IDR {formatPrice(Math.round(Number(pricing[key]) * (1 - discountPercentage / 100)))}
            </p>
          ) : (
            <p className="font-bold text-gray-800 text-sm leading-tight">
              IDR {formatPrice(Number(pricing[key]))}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default TherapistPricingGrid;

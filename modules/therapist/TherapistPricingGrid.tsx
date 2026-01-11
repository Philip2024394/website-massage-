import React from 'react';
import type { Therapist } from '../../types';
import { isDiscountActive } from '../../utils/therapistCardHelpers';

interface TherapistPricingGridProps {
    pricing: { '60': number; '90': number; '120': number };
    therapist: Therapist;
    displayRating: string;
    animatedPriceIndex: number | null;
    formatPrice: (price: number | string) => string;
    getDynamicSpacing: (large: string, medium: string, small: string, descLength: number) => string;
    translatedDescriptionLength: number;
}

const TherapistPricingGrid: React.FC<TherapistPricingGridProps> = ({
    pricing,
    therapist,
    displayRating,
    animatedPriceIndex,
    formatPrice,
    getDynamicSpacing,
    translatedDescriptionLength
}) => {
    console.log('🧱 TherapistPricingGrid rendered');

    return (
        <>
            {/* Discounted Prices Header */}
            {isDiscountActive(therapist) && (
                <div className={`text-center mb-1 px-4 ${getDynamicSpacing('mt-3', 'mt-2', 'mt-1', translatedDescriptionLength)}`}>
                    <p className="text-black font-semibold text-sm flex items-center justify-center gap-1">
                        🔥 Discounted Price's Displayed
                    </p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center text-sm mt-1 px-4">
                {/* 60 min pricing */}
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 min-h-[75px] flex flex-col justify-center ${
                    animatedPriceIndex === 0
                        ? 'bg-gray-100 border-orange-500 border-[3px] shadow-lg scale-[1.02]'
                        : isDiscountActive(therapist)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                }`}>
                    {/* Star Rating - Top Edge Left (50% inside, 50% outside) */}
                    {displayRating && (
                        <div className="absolute -top-2.5 left-2 bg-black text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {displayRating}
                        </div>
                    )}
                    <p className="text-gray-600 text-xs mb-1">60 min</p>
                    {isDiscountActive(therapist) ? (
                        <>
                            <p className="font-bold text-gray-800 text-sm leading-tight">
                                IDR {formatPrice(Math.round(Number(pricing["60"]) * (1 - (therapist.discountPercentage || 0) / 100)))}
                            </p>
                            <p className="text-[11px] text-gray-500 line-through">
                                IDR {formatPrice(Number(pricing["60"]))}
                            </p>
                        </>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            IDR {formatPrice(Number(pricing["60"]))}
                        </p>
                    )}
                </div>

                {/* 90 min pricing */}
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 min-h-[75px] flex flex-col justify-center ${
                    animatedPriceIndex === 1
                        ? 'bg-gray-100 border-orange-500 border-[3px] shadow-lg scale-[1.02]'
                        : isDiscountActive(therapist)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                }`}>
                    {/* Star Rating - Top Edge Left (50% inside, 50% outside) */}
                    {displayRating && (
                        <div className="absolute -top-2.5 left-2 bg-black text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {displayRating}
                        </div>
                    )}
                    <p className="text-gray-600 text-xs mb-1">90 min</p>
                    {isDiscountActive(therapist) ? (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            IDR {formatPrice(Math.round(Number(pricing["90"]) * (1 - (therapist.discountPercentage || 0) / 100)))}
                        </p>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            IDR {formatPrice(Number(pricing["90"]))}
                        </p>
                    )}
                </div>
                
                {/* 120 min pricing */}
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 min-h-[75px] flex flex-col justify-center ${
                    animatedPriceIndex === 2
                        ? 'bg-gray-100 border-orange-500 border-[3px] shadow-lg scale-[1.02]'
                        : isDiscountActive(therapist)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                }`}>
                    {/* Star Rating - Top Edge Left (50% inside, 50% outside) */}
                    {displayRating && (
                        <div className="absolute -top-2.5 left-2 bg-black text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {displayRating}
                        </div>
                    )}
                    <p className="text-gray-600 text-xs mb-1">120 min</p>
                    {isDiscountActive(therapist) ? (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            IDR {formatPrice(Math.round(Number(pricing["120"]) * (1 - (therapist.discountPercentage || 0) / 100)))}
                        </p>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            IDR {formatPrice(Number(pricing["120"]))}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default TherapistPricingGrid;

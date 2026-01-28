/**
 * PlacePricing Component
 * 
 * Extracted from MassagePlaceCard.tsx as part of Phase 3 modularization.
 * Handles the pricing grid display and booking action buttons.
 * 
 * Features:
 * - 3-column pricing grid (60/90/120 min)
 * - Discount pricing with strikethrough
 * - Star rating badges on price cells
 * - Book Now and Schedule buttons
 * - Animated price rim effects for discounts
 */

import React from 'react';
import { isDiscountActive, getDynamicSpacing } from '../../constants/cardConstants';
import type { Analytics } from '../../types';

interface PlacePricingProps {
    place: any;
    pricing: {
        "60": number;
        "90": number; 
        "120": number;
    };
    displayRating: number;
    formatPrice: (price: number) => string;
    t: any;
    addNotification: (type: string, title: string, message: string, options?: any) => void;
    onIncrementAnalytics: (metric: keyof Analytics) => void;
}

const PlacePricing: React.FC<PlacePricingProps> = ({
    place,
    pricing,
    displayRating,
    formatPrice,
    t,
    addNotification,
    onIncrementAnalytics
}) => {
    return (
        <>
            {/* Discounted Prices Header */}
            {isDiscountActive(place) && (
                <div className={`text-center mb-1 ${getDynamicSpacing('mt-3', 'mt-2', 'mt-1')}`}>
                    <p className="text-black font-semibold text-sm flex items-center justify-center gap-1">
                        🔥 Discounted Price's Displayed
                    </p>
                </div>
            )}

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-2 mb-3 px-1">
                {pricing["60"] > 0 && (
                    <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 min-h-[75px] flex flex-col justify-center ${
                        isDiscountActive(place)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                        {/* Star Rating - Top Edge Left (50% inside, 50% outside) */}
                        {displayRating && (
                            <div className="absolute -top-2.5 left-2 bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {displayRating}
                            </div>
                        )}
                        <p className="text-gray-600 text-xs mb-1">60 min</p>
                        {isDiscountActive(place) ? (
                            <>
                                <p className="font-bold text-gray-800 text-sm leading-tight">
                                    Rp {formatPrice(Math.round(pricing["60"] * (1 - (place as any).discountPercentage / 100)))}
                                </p>
                                <p className="text-[11px] text-gray-500 line-through">
                                    Rp {formatPrice(pricing["60"])}
                                </p>
                            </>
                        ) : (
                            <p className="font-bold text-gray-800 text-sm leading-tight">
                                Rp {formatPrice(pricing["60"])}
                            </p>
                        )}
                    </div>
                )}
                {pricing["90"] > 0 && (
                    <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 min-h-[75px] flex flex-col justify-center ${
                        isDiscountActive(place)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                        {/* Star Rating - Top Edge Left (50% inside, 50% outside) */}
                        {displayRating && (
                            <div className="absolute -top-2.5 left-2 bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {displayRating}
                            </div>
                        )}
                        <p className="text-gray-600 text-xs mb-1">90 min</p>
                        {isDiscountActive(place) ? (
                            <>
                                <p className="font-bold text-gray-800 text-sm leading-tight">
                                    Rp {formatPrice(Math.round(pricing["90"] * (1 - (place as any).discountPercentage / 100)))}
                                </p>
                                <p className="text-[11px] text-gray-500 line-through">
                                    Rp {formatPrice(pricing["90"])}
                                </p>
                            </>
                        ) : (
                            <p className="font-bold text-gray-800 text-sm leading-tight">
                                Rp {formatPrice(pricing["90"])}
                            </p>
                        )}
                    </div>
                )}
                {pricing["120"] > 0 && (
                    <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 min-h-[75px] flex flex-col justify-center ${
                        isDiscountActive(place)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                        {/* Star Rating - Top Edge Left (50% inside, 50% outside) */}
                        {displayRating && (
                            <div className="absolute -top-2.5 left-2 bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {displayRating}
                            </div>
                        )}
                        <p className="text-gray-600 text-xs mb-1">120 min</p>
                        {isDiscountActive(place) ? (
                            <>
                                <p className="font-bold text-gray-800 text-sm leading-tight">
                                    Rp {formatPrice(Math.round(pricing["120"] * (1 - (place as any).discountPercentage / 100)))}
                                </p>
                                <p className="text-[11px] text-gray-500 line-through">
                                    Rp {formatPrice(pricing["120"])}
                                </p>
                            </>
                        ) : (
                            <p className="font-bold text-gray-800 text-sm leading-tight">
                                Rp {formatPrice(pricing["120"])}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons - Book Now & Schedule Booking (matching therapist card) */}
            <div className="flex gap-2 px-4 mt-4">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Prevent multiple rapid clicks
                        if ((e.target as HTMLElement).hasAttribute('data-clicking')) {
                            return;
                        }
                        (e.target as HTMLElement).setAttribute('data-clicking', 'true');
                        requestAnimationFrame(() => {
                            (e.target as HTMLElement).removeAttribute('data-clicking');
                        });
                        
                        console.log('🟢 Book Now button clicked - opening chat window for massage place');
                        
                        // Show notification instead of opening chat
                        console.log('🔵 MassagePlaceCard: Instant booking notification for', place.name);
                        
                        addNotification(
                            'info',
                            'Instant Booking',
                            `Please complete booking with ${place.name} to start chatting`,
                            { duration: 4000 }
                        );
                        
                        onIncrementAnalytics('bookings');
                    }}
                    className="w-1/2 flex items-center justify-center gap-1.5 font-bold py-4 px-3 rounded-lg transition-all duration-100 transform touch-manipulation min-h-[48px] bg-green-500 text-white hover:bg-green-600 active:bg-green-700 active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm">{t?.home?.bookNow || 'Book Now'}</span>
                </button>
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Prevent multiple rapid clicks
                        if ((e.target as HTMLElement).hasAttribute('data-clicking')) {
                            return;
                        }
                        (e.target as HTMLElement).setAttribute('data-clicking', 'true');
                        requestAnimationFrame(() => {
                            (e.target as HTMLElement).removeAttribute('data-clicking');
                        });
                        
                        console.log('📅 Schedule button clicked - showing notification for massage place');
                        
                        addNotification(
                            'info',
                            'Schedule Booking',
                            `Please complete booking with ${place.name} to schedule session`,
                            { duration: 4000 }
                        );
                        
                        onIncrementAnalytics('bookings');
                    }} 
                    className="w-1/2 flex items-center justify-center gap-1.5 font-bold py-4 px-3 rounded-lg transition-all duration-100 transform touch-manipulation min-h-[48px] bg-green-500 text-white hover:bg-green-600 active:bg-green-700 active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">{t?.home?.schedule || 'Schedule'}</span>
                </button>
            </div>
        </>
    );
}

export default PlacePricing;
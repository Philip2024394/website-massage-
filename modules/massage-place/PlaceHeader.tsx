/**
 * PlaceHeader Component
 * 
 * Extracted from MassagePlaceCard.tsx as part of Phase 3 modularization.
 * Handles the main image banner, rating badge, discount badge, and share button.
 * 
 * MOBILE RENDER RULES ENFORCED:
 * - Fixed image dimensions with proper aspect ratios (DO NOT MODIFY)
 * - Badge positioning with absolute placement (DO NOT MODIFY)
 * - Discount animations and visual effects (DO NOT MODIFY)
 */

import React from 'react';
import { isDiscountActive } from '../../constants/cardConstants';

interface PlaceHeaderProps {
    place: any;
    mainImage: string;
    displayRating: number;
    onNavigate?: (page: string) => void;
    formatRating: (rating: number) => string;
    getDisplayRating: (rating: number, reviewCount: number) => number;
    t: any;
    onShare: () => void;
    activeDiscount?: { percentage: number; expiresAt: Date } | null;
    discountTimeLeft?: string;
}

const PlaceHeader: React.FC<PlaceHeaderProps> = ({
    place,
    mainImage,
    displayRating,
    onNavigate,
    formatRating,
    getDisplayRating,
    t,
    onShare,
    activeDiscount,
    discountTimeLeft
}) => {
    return (
        <div className="h-48 w-full overflow-visible relative rounded-t-xl">
            <div className="absolute inset-0 rounded-t-xl overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600">
                <img 
                    className="w-full h-full object-cover opacity-90" 
                    src={mainImage}
                    alt={place.name}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
                    }}
                />
            </div>
                
                {/* Star Rating Badge - Top Left (below verified badge) */}
                {(place as any).isVerified && displayRating && (
                    <div className="absolute top-12 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                        <img 
                            src="https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565"
                            alt="Verified"
                            className="w-4 h-4 flex-shrink-0"
                            title="Verified Massage Place"
                        />
                        <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-bold text-gray-900">{displayRating}</span>
                    </div>
                )}
                {!((place as any).isVerified) && displayRating && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                        <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-bold text-gray-900">{displayRating}</span>
                    </div>
                )}

                {/* Discount Badge - Database driven discount */}
                {isDiscountActive(place) && (
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-full px-4 py-2 shadow-lg animate-pulse">
                            <span className="text-white text-sm font-bold">{(place as any).discountPercentage}% OFF</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-full px-3 py-1 shadow-lg">
                            <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-white text-xs font-medium">{place.openingTime}-{place.closingTime}</span>
                        </div>
                    </div>
                )}

                {/* Opening/Closing Time Badge - Shows when NO discount is active */}
                {!isDiscountActive(place) && !activeDiscount && place.openingTime && place.closingTime && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md rounded-full px-3 py-2 shadow-lg">
                        <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-white text-xs font-medium">{place.openingTime}-{place.closingTime}</span>
                    </div>
                )}

                {/* Active Discount Badge - External discount prop (fallback) */}
                {activeDiscount && !isDiscountActive(place) && (
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full px-4 py-2 shadow-lg animate-pulse">
                            <span className="text-white text-sm font-bold">{activeDiscount.percentage}% OFF</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-full px-3 py-1 shadow-lg">
                            <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-white text-xs font-medium">{discountTimeLeft}</span>
                        </div>
                    </div>
                )}

                {/* Share Button - Bottom Right Corner */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onShare();
                    }}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default PlaceHeader;
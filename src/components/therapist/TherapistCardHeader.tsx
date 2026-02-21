import React from 'react';
import type { Therapist } from '../../types';
import { isDiscountActive, getTherapistDisplayName } from '../../utils/therapistCardHelpers';
import { Share2 } from 'lucide-react';
import { getRandomTherapistImage } from '../../utils/therapistImageUtils';
import { devLog } from '../../utils/devMode';
import { logger } from '../../utils/logger';

interface TherapistCardHeaderProps {
    therapist: Therapist;
    displayImage: string;
    onShareClick: () => void;
    customVerifiedBadge?: string;
    bookingsCount?: number;
    displayRating?: string;
    /** Times this shared profile was shared (shown as small counter over image) */
    shareCount?: number;
    /** When true, show orange strip overlay at top of image (matches beautician home card) */
    isBeautician?: boolean;
}

const TherapistCardHeader: React.FC<TherapistCardHeaderProps> = ({
    therapist,
    displayImage,
    onShareClick,
    customVerifiedBadge,
    bookingsCount = 0,
    displayRating,
    shareCount,
    isBeautician = false,
}) => {
    // Keep image URL stable to avoid reload/flicker on re-renders

    return (
        <div className="h-48 w-full overflow-visible relative rounded-t-xl">
            {/* Orange strip overlay at top of image for beautician (matches home card) */}
            {isBeautician && (
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-orange-500 to-orange-600 z-20" aria-hidden />
            )}
            {/* 🔒 MOBILE STABILITY: Reserved background prevents layout shift during image loading */}
            <div className="absolute inset-0 rounded-t-xl overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600" style={{ minHeight: '192px' }}>
                <img 
                    key={displayImage}
                    src={displayImage} 
                    alt={`${getTherapistDisplayName(therapist.name)} cover`} 
                    className="w-full h-full object-cover rounded-t-xl"
                    style={{ aspectRatio: '16/9', minHeight: '192px' }}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    width="400"
                    height="192"
                    onError={(e) => {
                        logger.warn('🖼️ Main image failed to load, using fallback:', typeof displayImage === 'string' ? displayImage.slice(0, 80) : displayImage);
                        // Fallback to a working ImageKit URL (e.g. when Appwrite file returns 404)
                        (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indoniseas.png?updatedAt=1761154913720';
                    }}
                    onLoad={() => {
                        devLog('✅ Main image loaded successfully:', displayImage);
                    }}
                />
            </div>
                
            {/* Star Rating Badge - Top Left, same design as facial main image badges */}
            {displayRating && (
                <div className="absolute top-3 left-3 z-30 shadow-lg flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <svg className="w-4 h-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-bold text-white">{displayRating}</span>
                </div>
            )}

            {/* Orders Badge - Top right, same design as facial main image badges */}
            {bookingsCount > 0 && !isDiscountActive(therapist) && (
                <div className="absolute top-3 right-3 z-30 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {bookingsCount}+ Orders
                </div>
            )}

            {/* 🎯 ENHANCED DISCOUNT BADGE - Larger orange badge in top right corner with glow effect */}
            {/* Orders badge shows with discount if active */}
            {isDiscountActive(therapist) && (
                <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-2">
                    {/* Orders badge when discount is active */}
                    {bookingsCount > 0 && (
                        <div className="bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                            {bookingsCount}+ Orders
                        </div>
                    )}
                    {/* Enhanced Orange Discount Badge with Subtle Fade Effect */}
                    <div className="relative">
                        {/* Main badge with subtle fade animation */}
                        <div className="relative text-white font-bold text-lg px-5 py-2 rounded-full shadow-lg discount-fade">
                            {therapist.discountPercentage}% OFF
                        </div>
                    </div>
                    
                    {/* Countdown Timer with Red Clock Icon */}
                    <div className="bg-black/80 text-white text-xs px-3 py-1 rounded-lg font-mono shadow-lg flex items-center gap-1">
                        {/* Red Clock Icon */}
                        <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {(() => {
                            if (!therapist.discountEndTime) return 'EXPIRED';
                            const now = new Date();
                            const endTime = new Date(therapist.discountEndTime);
                            const timeLeft = endTime.getTime() - now.getTime();
                            if (timeLeft <= 0) return 'EXPIRED';
                            
                            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                            
                            if (hours > 0) return `${hours}h ${minutes}m`;
                            if (minutes > 0) return `${minutes}m ${seconds}s`;
                            return `${seconds}s`;
                        })()}
                    </div>
                </div>
            )}
            
            {/* Share count - bottom right over image (shared profile): how many times this profile was shared */}
            {/* Bottom right over image: share count (shared profile) + share button */}
            <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2">
                {shareCount !== undefined && shareCount >= 0 && (
                    <div className="bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1" title="Times this profile was shared">
                        <Share2 className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden />
                        <span>{shareCount}</span>
                    </div>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onShareClick();
                    }}
                    className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all"
                    title="Share this therapist"
                    aria-label="Share this therapist"
                >
                    <Share2 className="w-4 h-4 text-white" strokeWidth={2.5} aria-hidden />
                </button>
            </div>
        </div>
    );
};

export default TherapistCardHeader;

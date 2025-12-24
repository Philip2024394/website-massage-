import React from 'react';
import type { Therapist } from '../../types';
import { isDiscountActive } from '../../utils/therapistCardHelpers';
import { getRandomTherapistImage } from '../../utils/therapistImageUtils';
import { devLog } from '../../utils/devMode';

interface TherapistCardHeaderProps {
    therapist: Therapist;
    displayImage: string;
    onShareClick: () => void;
    customVerifiedBadge?: string;
    bookingsCount?: number;
    displayRating?: string;
}

const TherapistCardHeader: React.FC<TherapistCardHeaderProps> = ({
    therapist,
    displayImage,
    onShareClick,
    customVerifiedBadge,
    bookingsCount = 0,
    displayRating
}) => {
    return (
        <div className="h-48 w-full overflow-visible relative rounded-t-xl">
            <div className="absolute inset-0 rounded-t-xl overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600">
                <img 
                    src={displayImage} 
                    alt={`${therapist.name} cover`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        console.error('🖼️ Main image failed to load:', displayImage);
                        // Fallback to a working ImageKit URL
                        (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indoniseas.png?updatedAt=1761154913720';
                    }}
                    onLoad={() => {
                        devLog('✅ Main image loaded successfully:', displayImage);
                    }}
                />
            </div>
                
            {/* Verified Badge - Top Left Corner - Custom, Premium, or Basic Admin Verified */}
            {customVerifiedBadge ? (
                <div className="absolute top-2 left-2 z-30 max-w-[25%] max-h-[25%]">
                    <img 
                        src={customVerifiedBadge}
                        alt="Verified Therapist"
                        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto'
                        }}
                    />
                </div>
            ) : (therapist as any).membershipTier === 'premium' ? (
                <div className="absolute top-[2.375rem] left-6 z-30">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/indastreet_verfied-removebg-preview.png?updatedAt=1764750953473" 
                        alt="Verified Member"
                        className="w-28 h-28 drop-shadow-lg"
                    />
                </div>
            ) : therapist.isVerified && (
                <div className="absolute top-3 left-3 bg-blue-600 rounded-full p-3.5 shadow-lg z-30 border-2 border-white">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
            
            {/* Rating Badge - Top Left */}
            {displayRating && (
                <div className="absolute top-3 left-3 z-30 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
                    <svg className="w-4 h-4 fill-current text-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-bold text-white">{displayRating}</span>
                </div>
            )}

            {/* Orders Badge - Top right corner */}
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
            
            {/* Share Button - Bottom Right Corner of image banner */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onShareClick();
                }}
                className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-30"
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

export default TherapistCardHeader;

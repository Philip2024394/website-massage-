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
}

const TherapistCardHeader: React.FC<TherapistCardHeaderProps> = ({
    therapist,
    displayImage,
    onShareClick,
    customVerifiedBadge
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
                
            {/* Verified Badge - Top Left Corner - Custom or Premium - Properly positioned within image */}
            {customVerifiedBadge ? (
                <div className="absolute top-2 left-2 z-30 max-w-[25%] max-h-[25%]">
                    <img 
                        src={customVerifiedBadge}
                        alt="Verified Therapist"
                        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto'
                        }}
                    />
                </div>
            ) : (therapist as any).membershipTier === 'premium' && (
                <div className="absolute top-2 left-2 z-30">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/indastreet_verfied-removebg-preview.png?updatedAt=1764750953473" 
                        alt="Verified Member"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                    />
                </div>
            )}

            {/* 🎯 ENHANCED DISCOUNT BADGE - Larger orange badge in top right corner with glow effect */}
            {isDiscountActive(therapist) && (
                <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-2">
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

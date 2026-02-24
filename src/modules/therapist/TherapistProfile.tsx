/**
 * TherapistProfile Component
 * 
 * Extracted from TherapistCard.tsx as part of Phase 2 modularization.
 * Handles the therapist profile image, name, verification badge, and status display.
 * 
 * MOBILE RENDER RULES ENFORCED:
 * - Fixed positioning with 75px offset (DO NOT MODIFY)
 * - Profile image overlapping main image by 30% (DO NOT MODIFY)
 * - Status badge with animated rings for availability (DO NOT MODIFY)
 */

import React from 'react';
import type { Therapist } from '../../types';
import { AvailabilityStatus } from '../../types';
import { getDisplayStatus, getTherapistDisplayName } from '../../utils/therapistCardHelpers';
import { statusStyles } from '../../constants/therapistCardConstants';
import { VERIFIED_BADGE_IMAGE_URL } from '../../constants/appConstants';
import BusyCountdownTimer from '../../components/BusyCountdownTimer';
import { devLog } from '../../utils/devMode';

interface TherapistProfileProps {
    therapist: Therapist;
    displayStatus: AvailabilityStatus;
    isOvertime: boolean;
    countdown: string | null;
    customVerifiedBadge?: string;
}

const TherapistProfile: React.FC<TherapistProfileProps> = ({
    therapist,
    displayStatus,
    isOvertime,
    countdown,
    customVerifiedBadge
}) => {
    const style = statusStyles[displayStatus] || statusStyles[AvailabilityStatus.Available];

    return (
        <>
            {/* ========================================
             * 🔒 UI DESIGN LOCKED - DO NOT MODIFY
             * Profile positioning and layout finalized
             * ======================================== */}
            {/* Profile Section - Overlapping main image by 30% */}
            <div className="px-4 -mt-24 pb-4 relative z-50 overflow-visible pointer-events-none">
                <div className="flex items-start gap-3">
                    {/* Profile Picture - 30% of card width */}
                    <div className="flex-shrink-0 relative z-50">
                        <div className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden relative">
                            <img 
                                className="w-full h-full object-cover pointer-events-auto border-4 border-white rounded-full" 
                                src={(therapist as any).profilePicture || (therapist as any).mainImage || '/default-avatar.jpg'}
                                alt={`${getTherapistDisplayName(therapist.name)} profile`}
                                style={{ aspectRatio: '1/1' }}
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/default-avatar.jpg';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================
             * 🔒 UI DESIGN LOCKED - DO NOT MODIFY
             * Name and status positioning finalized
             * 75px offset from left is intentional
             * ======================================== */}
            {/* Name and Status - Below main image, left aligned with 75px offset */}
            <div className="px-4 mt-[2px] mb-3 relative z-40">
                <div className="flex-shrink-0">
                    {/* Name left aligned with offset */}
                    <div className="mb-2 ml-[75px]">
                        <div className="flex items-center gap-2">
                            {/* Verified Badge - Show if manually verified OR has both bank details and KTP */}
                            {(() => {
                                // 🏆 VERIFICATION CRITERIA:
                                // 1. Manual verification flag (isVerified/verifiedBadge) OR
                                // 2. Complete bank details (bankName + accountName + accountNumber) AND KTP uploaded
                                const hasVerifiedBadge = (therapist as any).verifiedBadge || therapist.isVerified;
                                const hasBankDetails = therapist.bankName && therapist.accountName && therapist.accountNumber;
                                const hasKtpUploaded = therapist.ktpPhotoUrl;
                                const hasSafePass = (therapist as any).hotelVillaSafePassStatus === 'active';
                                const shouldShowBadge = hasVerifiedBadge || (hasBankDetails && hasKtpUploaded) || hasSafePass;
                                
                                const badgeUrl = customVerifiedBadge || VERIFIED_BADGE_IMAGE_URL;
                                
                                return shouldShowBadge && (
                                    <img 
                                        src={badgeUrl}
                                        alt="Verified"
                                        className="w-5 h-5 flex-shrink-0"
                                        title="Verified Therapist - Bank Details & KTP Complete"
                                    />
                                );
                            })()}
                            
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 uppercase">
                                {getTherapistDisplayName(therapist.name)}
                            </h3>
                        </div>
                    </div>

                    {/* Status Badge and branch image - status left, image right; on mobile image is smaller so it never covers status */}
                    <div className="overflow-visible flex justify-between items-center gap-3 min-w-0 ml-[75px]">
                        <div className={`inline-flex items-center px-2.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${isOvertime ? 'bg-red-100 text-red-800' : style.bg} ${isOvertime ? '' : style.text}`} style={{paddingTop: '0px', paddingBottom: '0px', lineHeight: '1', fontSize: '10px', transform: 'scaleY(0.9)'}}>
                            {/* Pulsing satellite broadcast ring for Available status */}
                            <span className="relative inline-flex mr-1.5" style={{width: '32px', height: '32px', minWidth: '32px', minHeight: '32px'}}>
                                <span key={`${therapist.$id || therapist.id}-dot`} className={`absolute rounded-full ${isOvertime ? 'bg-red-500' : style.dot} ${style.isAvailable && !isOvertime ? '' : 'animate-pulse'} z-10`} style={{width: '8px', height: '8px', left: '12px', top: '12px'}}></span>
                                {!isOvertime && displayStatus === AvailabilityStatus.Available && (
                                    <React.Fragment key={`${therapist.$id || therapist.id}-rings`}>
                                        <span key={`${therapist.$id || therapist.id}-ring1`} className="absolute rounded-full bg-green-400 opacity-75 animate-ping" style={{width: '20px', height: '20px', left: '6px', top: '6px'}}></span>
                                        <span key={`${therapist.$id || therapist.id}-ring2`} className="absolute rounded-full bg-green-300 opacity-50 animate-ping" style={{width: '28px', height: '28px', left: '2px', top: '2px', animationDuration: '1.5s'}}></span>
                                    </React.Fragment>
                                )}
                                {!isOvertime && displayStatus === AvailabilityStatus.Busy && (
                                    <span key={`${therapist.$id || therapist.id}-busy`} className="absolute inset-0 rounded-full animate-ping bg-yellow-400"></span>
                                )}
                            </span>
                            {displayStatus === AvailabilityStatus.Busy ? (
                                therapist.busyUntil ? (
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs">Busy</span>
                                        <BusyCountdownTimer
                                            endTime={therapist.busyUntil}
                                            onExpired={() => {
                                                devLog('Busy period ended – therapist should be available.');
                                            }}
                                        />
                                    </div>
                                ) : countdown ? (
                                    <span className="text-xs">
                                        {isOvertime ? 'Busy - Extra Time ' : 'Busy - Free in '} {countdown}
                                    </span>
                                ) : (
                                    <span className="text-xs">Busy</span>
                                )
                            ) : (
                                <span className="text-xs">{displayStatus}</span>
                            )}
                        </div>
                        <img
                            src="https://ik.imagekit.io/7grri5v7d/branch%205.png"
                            alt=""
                            className="h-[48px] sm:h-[80px] w-auto object-contain flex-shrink-0 translate-x-[10px] min-w-0"
                            aria-hidden
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default TherapistProfile;
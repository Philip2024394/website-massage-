/**
 * Therapist Image Component
 * Extracted from TherapistCard.tsx - preserving exact UI design
 */

import React from 'react';
import type { Therapist } from '../../../types';
import { VERIFIED_BADGE_IMAGE_URL } from '../../../constants/appConstants';

interface TherapistImageProps {
  therapist: Therapist;
  displayImage: string;
}

export const TherapistImage: React.FC<TherapistImageProps> = ({
  therapist,
  displayImage
}) => {
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
                alt={`${therapist.name} profile`}
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
              {/* Verified Badge */}
              {((therapist as any).verifiedBadge || therapist.isVerified) && (
                <img 
                  src={VERIFIED_BADGE_IMAGE_URL}
                  alt="Verified"
                  className="w-5 h-5 flex-shrink-0"
                  title="Verified Therapist"
                />
              )}
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {therapist.name}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
/**
 * 🏠 HOME PAGE BOOKING SLIDER
 * 
 * Specialized booking slider for home page therapist cards
 * - Book Now vs Scheduled Booking options
 * - Verification-based styling for Scheduled button
 * - Bank details and KTP verification requirements
 * - Smooth animations and mobile-optimized
 */

import React, { useState, useCallback } from 'react';
import { Zap, Calendar, AlertTriangle } from 'lucide-react';
import type { Therapist } from '../types';
import { logger } from '../utils/logger';

export interface HomePageBookingType {
  id: 'book-now' | 'scheduled';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  requiresVerification?: boolean;
}

export interface HomePageBookingSliderProps {
  therapist: Therapist;
  onBookingTypeSelect: (type: HomePageBookingType, therapist: Therapist) => void;
  selectedType?: 'book-now' | 'scheduled';
  className?: string;
  disabled?: boolean;
}

const homePageBookingTypes: HomePageBookingType[] = [
  {
    id: 'book-now',
    title: 'Pesan Sekarang',
    subtitle: 'Langsung',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    description: 'Dapatkan layanan pijat dalam 30-60 menit',
    requiresVerification: false
  },
  {
    id: 'scheduled',
    title: 'Terjadwal',
    subtitle: 'Rencanakan',
    icon: <Calendar className="w-5 h-5" />,
    color: 'bg-gradient-to-r from-blue-500 to-purple-500',
    description: 'Jadwalkan untuk tanggal dan waktu tertentu',
    requiresVerification: true
  }
];

/**
 * Check if therapist has completed requirements for scheduled bookings.
 * Requires: KTP uploaded (ktpPhotoUrl) + bank details (bankName, accountName, accountNumber).
 * When both are complete, scheduled booking button becomes active (orange).
 */
const checkTherapistVerification = (therapist: Therapist) => {
  const hasBankDetails = !!(
    therapist.bankName && 
    therapist.accountName && 
    therapist.accountNumber
  );
  
  const hasKtpUploaded = !!(therapist as any).ktpPhotoUrl;
  
  return {
    hasBankDetails,
    hasKtpUploaded,
    isFullyVerified: hasBankDetails && hasKtpUploaded,
    missingRequirements: [
      ...(!hasBankDetails ? ['Detail bank'] : []),
      ...(!hasKtpUploaded ? ['Upload KTP'] : [])
    ]
  };
};

export const HomePageBookingSlider: React.FC<HomePageBookingSliderProps> = ({
  therapist,
  onBookingTypeSelect,
  selectedType = 'book-now',
  className = '',
  disabled = false
}) => {
  const [activeType, setActiveType] = useState<'book-now' | 'scheduled'>(selectedType);

  // Get verification status
  const verificationStatus = checkTherapistVerification(therapist);
  const isScheduledUnverified = !verificationStatus.isFullyVerified;

  const handleTypeSelect = useCallback((type: HomePageBookingType) => {
    if (disabled) return;
    if (type.id === 'scheduled' && isScheduledUnverified) {
      logger.debug('⚠️ Scheduled booking selected for unverified therapist:', {
        therapist: therapist.name,
        missing: verificationStatus.missingRequirements
      });
    }
    setActiveType(type.id);
    onBookingTypeSelect(type, therapist);
  }, [onBookingTypeSelect, disabled, therapist, isScheduledUnverified, verificationStatus.missingRequirements]);

  // Same style as massage city places (HeroSection): grid of two buttons, rounded-lg, min-h-[48px], shadow-lg, amber
  const bookNowType = homePageBookingTypes[0];
  const scheduledType = homePageBookingTypes[1];

  return (
    <div className={`home-page-booking-slider ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        {/* Book Now - same style as city places Book Now button */}
        <button
          type="button"
          onClick={() => handleTypeSelect(bookNowType)}
          disabled={disabled}
          className="flex items-center justify-center gap-2 min-h-[48px] py-2.5 px-4 rounded-lg shadow-lg bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed"
          title={bookNowType.description}
        >
          <Zap className="w-4 h-4 flex-shrink-0" />
          <span>{bookNowType.title}</span>
        </button>

        {/* Schedule - same style as city places Schedule button; disabled/gray when unverified */}
        <button
          type="button"
          onClick={() => handleTypeSelect(scheduledType)}
          disabled={disabled}
          title={
            isScheduledUnverified
              ? `Requires: ${verificationStatus.missingRequirements.join(', ')}`
              : scheduledType.description
          }
          className={`flex items-center justify-center gap-2 min-h-[48px] py-2.5 px-4 rounded-lg shadow-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed ${
            isScheduledUnverified
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400'
          }`}
        >
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>{scheduledType.title}</span>
          {isScheduledUnverified && (
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-slate-500" aria-hidden />
          )}
        </button>
      </div>

      {/* Verification Warning for Scheduled Bookings - show when user clicked Schedule and is unverified */}
      {activeType === 'scheduled' && isScheduledUnverified && (
        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-orange-700">
              <div className="font-medium">Verifikasi Diperlukan</div>
              <div>Kurang: {verificationStatus.missingRequirements.join(', ')}</div>
              <div className="mt-1 opacity-75">
                Penyelesaian dashboard terapis diperlukan untuk pemesanan terjadwal
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePageBookingSlider;
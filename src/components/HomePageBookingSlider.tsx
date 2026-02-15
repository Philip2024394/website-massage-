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
import { Zap, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
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
  const [isAnimating, setIsAnimating] = useState(false);

  // Get verification status
  const verificationStatus = checkTherapistVerification(therapist);

  // Handle type selection with verification check
  const handleTypeSelect = useCallback(async (type: HomePageBookingType) => {
    if (disabled || isAnimating) return;

    // If scheduled booking and not verified, show warning but still allow selection
    if (type.id === 'scheduled' && !verificationStatus.isFullyVerified) {
      logger.debug('⚠️ Scheduled booking selected for unverified therapist:', {
        therapist: therapist.name,
        missing: verificationStatus.missingRequirements
      });
    }

    setIsAnimating(true);
    setActiveType(type.id);

    // Trigger selection callback after animation
    setTimeout(() => {
      onBookingTypeSelect(type, therapist);
      setIsAnimating(false);
    }, 200);
  }, [onBookingTypeSelect, disabled, isAnimating, therapist, verificationStatus]);

  // Get current selected booking type with verification styling
  const getBookingTypeStyle = (type: HomePageBookingType) => {
    const isActive = activeType === type.id;
    const isScheduledUnverified = type.id === 'scheduled' && !verificationStatus.isFullyVerified;
    
    if (isScheduledUnverified && !isActive) {
      return {
        containerClass: 'opacity-60',
        buttonClass: 'bg-gray-300 text-gray-600',
        iconColor: 'text-gray-500'
      };
    }
    
    if (isActive) {
      // Scheduled button turns orange when active (KTP + bank complete); Book Now stays orange/red
      const activeColor = type.id === 'scheduled' && verificationStatus.isFullyVerified
        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
        : type.color + ' text-white shadow-lg';
      return {
        containerClass: 'opacity-100',
        buttonClass: activeColor,
        iconColor: 'text-white'
      };
    }
    
    return {
      containerClass: 'opacity-100',
      buttonClass: 'bg-white text-gray-700 hover:bg-gray-50',
      iconColor: 'text-gray-600'
    };
  };

  return (
    <div className={`home-page-booking-slider ${className}`}>
      {/* Slider Container */}
      <div className="relative bg-gray-100 rounded-lg p-1 shadow-inner">
        {/* Background Slider */}
        <div 
          className={`
            absolute top-1 left-1 w-1/2 h-[calc(100%-8px)] 
            rounded-lg shadow-lg transition-transform duration-300 ease-in-out
            ${activeType === 'scheduled' 
              ? (verificationStatus.isFullyVerified 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 translate-x-full' 
                : 'bg-gray-300 translate-x-full'
              )
              : 'bg-gradient-to-r from-orange-500 to-red-500 translate-x-0'
            }
          `}
        />

        {/* Booking Type Options */}
        <div className="relative grid grid-cols-2 gap-1">
          {homePageBookingTypes.map((type) => {
            const style = getBookingTypeStyle(type);
            const isScheduledUnverified = type.id === 'scheduled' && !verificationStatus.isFullyVerified;
            
            return (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type)}
                disabled={disabled}
                className={`
                  relative z-10 px-4 py-4 min-h-[48px] rounded-lg transition-all duration-300 will-change-transform transform-gpu
                  ${style.containerClass}
                  ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                  ${isAnimating ? 'pointer-events-none' : ''}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                `}
                title={
                  isScheduledUnverified 
                    ? `Requires: ${verificationStatus.missingRequirements.join(', ')}` 
                    : type.description
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className={`transition-transform duration-300 ${style.iconColor}`}>
                    {type.icon}
                  </span>
                  <div className="text-left">
                    <div className="font-semibold text-sm leading-tight">
                      {type.title}
                    </div>
                    <div className="text-xs opacity-75">
                      {type.subtitle}
                    </div>
                  </div>
                </div>
                
                {/* Verification Status Indicator */}
                {type.id === 'scheduled' && (
                  <div className="absolute -top-1 -right-1">
                    {verificationStatus.isFullyVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-500 bg-white rounded-full" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-orange-500 bg-white rounded-full" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Verification Warning for Scheduled Bookings */}
      {activeType === 'scheduled' && !verificationStatus.isFullyVerified && (
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
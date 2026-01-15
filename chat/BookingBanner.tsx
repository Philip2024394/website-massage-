/**
 * BookingBanner Component
 * 
 * Purpose: Displays booking details with countdown timer
 * Data Flow: ChatRoom data + countdown hook → UI display
 * 
 * Features:
 * - Shows therapist profile image
 * - Displays booking time and service details
 * - Live countdown timer until session starts
 * - Visual warnings as time approaches
 * - Responsive layout
 */

import React from 'react';
import { useBookingCountdown } from './hooks/useBookingCountdown';

interface BookingBannerProps {
  therapistName: string;
  therapistPhoto?: string;
  bookingDate: string;
  bookingTime: string;
  serviceDuration: string;
  serviceType: string;
  onClose?: () => void;
}

export const BookingBanner: React.FC<BookingBannerProps> = ({
  therapistName,
  therapistPhoto,
  bookingDate,
  bookingTime,
  serviceDuration,
  serviceType,
  onClose
}) => {
  const countdown = useBookingCountdown(bookingDate, bookingTime);

  // Determine banner color based on countdown
  const getBannerColor = () => {
    if (countdown.isExpired) return 'bg-gray-100 border-gray-300';
    if (countdown.isWithin2Minutes) return 'bg-red-50 border-red-300';
    if (countdown.isWithin5Minutes) return 'bg-yellow-50 border-yellow-300';    
    return 'bg-orange-50 border-orange-300';
  };

  const getTimerColor = () => {
    if (countdown.isExpired) return 'text-gray-600';
    if (countdown.isWithin2Minutes) return 'text-red-600';
    if (countdown.isWithin5Minutes) return 'text-yellow-600';

  return (
    <div className={`${getBannerColor()} border-b p-3 transition-colors duration-300`}>
      <div className="flex items-center gap-3">
        {/* Therapist Photo */}
        <div className="relative flex-shrink-0">
          {therapistPhoto ? (
            <img
              src={therapistPhoto}
              alt={therapistName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-lg font-bold text-orange-700">
                {therapistName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Status indicator */}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            countdown.isExpired ? 'bg-green-500' :
            countdown.isWithin5Minutes ? 'bg-red-500 animate-pulse' :
            countdown.isWithin15Minutes ? 'bg-yellow-500' :
            'bg-blue-500'
          }`} />
        </div>

        {/* Booking Details */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">
            {therapistName}
          </div>
          <div className="text-xs text-gray-600 space-y-0.5">
            <div className="flex items-center gap-2">
              <span>📅 {bookingDate}</span>
              <span>🕐 {bookingTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💆 {serviceType}</span>
              <span>⏱️ {serviceDuration} min</span>
            </div>
          </div>
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            title="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Countdown Timer */}
      <div className={`mt-3 text-center ${getTimerColor()}`}>
        <div className="text-xs font-medium mb-1">
          {countdown.isExpired ? '🎯 Session in Progress' : '⏰ Session Starts In:'}
        </div>
        <div className="text-lg font-bold">
          {countdown.isExpired ? 'Now' : countdown.formatted}
        </div>
        
        {/* Progress bar */}
        {!countdown.isExpired && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                countdown.isWithin2Minutes ? 'bg-red-500' :
                countdown.isWithin5Minutes ? 'bg-yellow-500' :
                'bg-orange-500'
              }`}
              style={{ width: `${countdown.percentComplete}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

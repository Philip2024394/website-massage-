/**
 * Simple Booking Welcome Component
 * Minimal design with therapist image + welcome text + countdown
 * No complex validation - just display
 */

import React from 'react';
import { Clock, X } from 'lucide-react';

interface SimpleBookingWelcomeProps {
  therapistName: string;
  therapistImage?: string;
  bookingCountdown: number | null;
  bookingId?: string;
  onCancelBooking?: () => void;
}

export const SimpleBookingWelcome: React.FC<SimpleBookingWelcomeProps> = ({
  therapistName,
  therapistImage,
  bookingCountdown,
  bookingId,
  onCancelBooking
}) => {
  // Format countdown as MM:SS
  const formatCountdown = (seconds: number | null) => {
    if (seconds === null || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200 p-4">
      {/* Header with therapist info */}
      <div className="flex items-start gap-3">
        {/* Therapist Image */}
        {therapistImage && (
          <img 
            src={therapistImage}
            alt={therapistName}
            className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
          />
        )}
        
        {/* Welcome Text */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-sm">
            Booking Request Sent to {therapistName}
          </h3>
          {bookingId && (
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              ID: {bookingId}
            </p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            ⏳ Waiting for response...
          </p>
        </div>

        {/* Countdown Timer */}
        {bookingCountdown !== null && bookingCountdown > 0 && (
          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-orange-300">
            <Clock className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-sm font-semibold text-orange-600">
              {formatCountdown(bookingCountdown)}
            </span>
          </div>
        )}
      </div>

      {/* Cancel Button */}
      {onCancelBooking && bookingCountdown !== null && bookingCountdown > 0 && (
        <button
          onClick={onCancelBooking}
          className="mt-3 w-full bg-white hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-red-200 flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel Booking</span>
        </button>
      )}
    </div>
  );
};

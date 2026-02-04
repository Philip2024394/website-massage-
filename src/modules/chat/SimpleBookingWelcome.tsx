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
  bookingCountdown: number | null | undefined;
  bookingId?: string;
  onCancelBooking?: () => void;
  bookingDetails?: {
    customerName?: string;
    customerWhatsApp?: string;
    massageFor?: string;
    locationType?: string;
    duration?: number;
    price?: number;
  };
}

export const SimpleBookingWelcome: React.FC<SimpleBookingWelcomeProps> = ({
  therapistName,
  therapistImage,
  bookingCountdown,
  bookingId,
  onCancelBooking,
  bookingDetails
}) => {
  // Format countdown as MM:SS - SAFE VERSION with defensive guards
  const formatCountdown = (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) {
      return '--:--';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 m-4">
      {/* Single unified booking container */}
      
      {/* 1. Therapist/Place Info */}
      <div className="flex items-center gap-3 mb-3">
        {therapistImage && (
          <img 
            src={therapistImage}
            alt={therapistName}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-400"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base">
            {therapistName}
          </h3>
          {bookingId && (
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              ID: {bookingId}
            </p>
          )}
        </div>
      </div>

      {/* 2. Booking Details */}
      <div className="mb-3 pb-3 border-b border-gray-300">
        <p className="text-sm text-gray-700 font-medium">
          📋 Booking Request Sent
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Waiting for response...
        </p>
      </div>

      {/* Booking Information Container */}
      {bookingDetails && (
        <div className="bg-gray-200 rounded-md p-3 mb-3 space-y-1.5 text-sm">
          {bookingDetails.customerName && (
            <div className="text-gray-800">
              <span className="font-medium">Name:</span> {bookingDetails.customerName}
            </div>
          )}
          {bookingDetails.customerWhatsApp && (
            <div className="text-gray-800">
              📱 <span className="font-medium">WhatsApp:</span> {bookingDetails.customerWhatsApp}
            </div>
          )}
          {bookingDetails.massageFor && (
            <div className="text-gray-800">
              🧍 <span className="font-medium">Treatment For:</span> {bookingDetails.massageFor === 'male' ? '👨 Male' : bookingDetails.massageFor === 'female' ? '👩 Female' : bookingDetails.massageFor === 'couple' ? '👫 Couple' : bookingDetails.massageFor}
            </div>
          )}
          {bookingDetails.locationType && (
            <div className="text-gray-800">
              🏢 <span className="font-medium">Treatment At:</span> {bookingDetails.locationType === 'home' ? '🏠 Home' : bookingDetails.locationType === 'hotel' ? '🏨 Hotel' : bookingDetails.locationType === 'villa' ? '🏡 Villa' : bookingDetails.locationType}
            </div>
          )}
          {bookingDetails.duration && (
            <div className="text-gray-800">
              ⏱️ <span className="font-medium">Duration:</span> {bookingDetails.duration} minutes
            </div>
          )}
          {bookingDetails.price && (
            <div className="text-gray-800 font-semibold">
              💰 <span className="font-medium">Price:</span> Rp {bookingDetails.price.toLocaleString('id-ID')}
            </div>
          )}
        </div>
      )}

      {/* 3. Countdown Timer */}
      {Number.isFinite(bookingCountdown) && bookingCountdown !== null && bookingCountdown > 0 && (
        <div className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-md border border-gray-300 mb-3">
          <Clock className="w-4 h-4 text-gray-600" />
          <span className="text-base font-semibold text-gray-800">
            {formatCountdown(bookingCountdown)}
          </span>
          <span className="text-xs text-gray-500">remaining</span>
        </div>
      )}

      {/* 4. Cancel Button */}
      {onCancelBooking && Number.isFinite(bookingCountdown) && bookingCountdown !== null && bookingCountdown > 0 && (
        <button
          onClick={onCancelBooking}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel Booking</span>
        </button>
      )}
    </div>
  );
};

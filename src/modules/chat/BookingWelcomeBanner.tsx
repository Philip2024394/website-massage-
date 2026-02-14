/**
 * Booking Welcome Banner Component
 * Extracted from PersistentChatWindow.tsx - preserving exact UI design
 */

import React from 'react';
import { Clock, Sparkles, User, MapPin, CreditCard, Calendar, Tag, X } from 'lucide-react';
import { formatPrice } from './utils/chatHelpers';

interface BookingBannerProps {
  currentBooking: {
    status: string;
    serviceType: string;
    providerType?: 'therapist' | 'place' | 'facial';
    duration: number;
    customerName: string;
    locationZone?: string;
    totalPrice: number;
    bookingType: string;
    massageFor?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    bookingId?: string;
    id?: string;
  };
  bookingCountdown: number | null;
  onCancelBooking?: () => void;
}

export const BookingWelcomeBanner: React.FC<BookingBannerProps> = ({
  currentBooking,
  bookingCountdown,
  onCancelBooking
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

  const getStatusMessage = (status: string) => {
    const isBookNow = currentBooking.bookingType === 'book_now';
    const timerText = isBookNow ? '5 minutes' : '25 minutes';
    
    switch (status) {
      case 'pending':
        return `⏳ Waiting for therapist to respond (up to ${timerText}). You can cancel below if needed.`;
      case 'waiting_others':
        return '🔍 Searching for available therapists...';
      case 'therapist_accepted':
        return '✅ Therapist accepted! Please confirm your booking below.';
      case 'user_confirmed':
        return '🎯 Booking confirmed! Therapist will contact you shortly.';
      case 'on_the_way':
        return '🚗 Therapist is on the way to your location!';
      case 'completed':
        return '✨ Service completed - Payment is ready';
      case 'cancelled':
        return '❌ Booking was cancelled';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Welcome Header with Status and Countdown */}
      <div className="px-4 py-3 bg-white">
        {/* Text Status */}
        <div className="bg-green-50 rounded-lg p-3 mb-3 border-2 border-green-200">
          <div className="text-center">
            <p className="text-sm font-semibold text-green-800 mb-1">
              ✅ Booking Request Sent
            </p>
            <p className="text-xs text-green-600">
              Waiting for therapist to respond
            </p>
          </div>
        </div>
        
        {/* 5-Minute Countdown Timer */}
        {Number.isFinite(bookingCountdown) && bookingCountdown !== null && bookingCountdown > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-300 mb-3 shadow-md relative">
            {/* Small cancel button - top right */}
            {onCancelBooking && (currentBooking.status === 'pending' || currentBooking.status === 'waiting_others') && (
              <button
                onClick={onCancelBooking}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                title="Cancel booking"
                aria-label="Cancel booking"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="text-center mb-2">
              <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide">
                ⏰ Therapist Response Countdown
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white px-5 py-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 animate-pulse" />
              <span className="text-3xl font-bold text-orange-600 font-mono">
                {formatCountdown(bookingCountdown)}
              </span>
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs text-orange-700 font-medium">
                Time remaining for therapist to respond
              </p>
            </div>
          </div>
        )}
        
        {/* Status Message */}
        <p className="text-gray-600 text-xs mt-2">
          {getStatusMessage(currentBooking.status)}
        </p>
        
        {/* Cancel Button - Only show before therapist accepts */}
        {(currentBooking.status === 'pending' || currentBooking.status === 'waiting_others') && onCancelBooking && (
          <button
            onClick={onCancelBooking}
            className="mt-3 w-full bg-white hover:bg-gray-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-red-300 flex items-center justify-center gap-2"
          >
            <span>✕</span>
            <span>Cancel Booking</span>
          </button>
        )}
      </div>
      
      {/* Booking Details - Enhanced visibility */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {/* Service Details - Massage | Massage Spa | Facial Clinic */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <Sparkles className="w-4 h-4 text-gray-600" />
            <div>
              <div className="text-xs text-gray-500">Service</div>
              <div className="font-bold text-gray-800">
                {currentBooking.providerType === 'facial' ? 'Facial Clinic' : currentBooking.providerType === 'place' ? 'Massage Spa' : 'Massage'}
                {currentBooking.duration ? ` (${currentBooking.duration} min)` : ''}
              </div>
              {currentBooking.massageFor && (
                <div className="text-xs text-gray-600 mt-0.5">
                  For: {currentBooking.massageFor === 'male' ? 'Male' : currentBooking.massageFor === 'female' ? 'Female' : currentBooking.massageFor === 'children' ? 'Children' : currentBooking.massageFor}
                </div>
              )}
            </div>
          </div>
          
          {/* Price - More prominent */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <CreditCard className="w-4 h-4 text-gray-600" />
            <div>
              <div className="text-xs text-gray-500">Total Price</div>
              <div className="font-medium text-gray-800">
                {formatPrice(currentBooking.totalPrice)}
              </div>
            </div>
          </div>
          
          {/* Customer Name */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <User className="w-4 h-4 text-gray-600" />
            <div>
              <div className="text-xs text-gray-500">Customer</div>
              <div className="font-medium text-gray-800">{currentBooking.customerName}</div>
            </div>
          </div>
          
          {/* Location */}
          {currentBooking.locationZone && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <MapPin className="w-4 h-4 text-gray-600" />
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="font-medium text-gray-800">{currentBooking.locationZone}</div>
              </div>
            </div>
          )}
          
          {/* Massage Type - Service name user booked */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Type:</span>
            <span className="font-medium text-gray-800">
              {currentBooking.serviceType || 'Professional Massage'}
              {currentBooking.duration ? ` (${currentBooking.duration} min)` : ''}
              {currentBooking.bookingType === 'scheduled' && currentBooking.scheduledDate && (
                ` · ${currentBooking.scheduledDate} ${currentBooking.scheduledTime || ''}`
              )}
            </span>
          </div>
          
          {/* Booking ID */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">ID:</span>
            <span className="font-mono text-xs text-gray-800">#{currentBooking.bookingId || currentBooking.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};;
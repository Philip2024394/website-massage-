/**
 * Booking Welcome Banner Component
 * Extracted from PersistentChatWindow.tsx - preserving exact UI design
 */

import React from 'react';
import { Clock, Sparkles, User, MapPin, CreditCard, Calendar, Tag } from 'lucide-react';
import { formatPrice } from './utils/chatHelpers';

interface BookingBannerProps {
  currentBooking: {
    status: string;
    serviceType: string;
    duration: number;
    customerName: string;
    locationZone?: string;
    totalPrice: number;
    bookingType: string;
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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
      {/* Welcome Header with Countdown */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-sm">🎉 Booking Request Sent!</h3>
          </div>
          
          {/* Enhanced Countdown Timer - 5 min for Book Now, 25 min for Scheduled */}
          {bookingCountdown !== null && currentBooking.status === 'pending' && (
            <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-full shadow-lg animate-pulse">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-mono font-bold">
                {Math.floor(bookingCountdown / 60)}:{(bookingCountdown % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
        
        {/* Status Message */}
        <p className="text-blue-100 text-xs mt-2">
          {getStatusMessage(currentBooking.status)}
        </p>
        
        {/* Cancel Button - Only show before therapist accepts */}
        {(currentBooking.status === 'pending' || currentBooking.status === 'waiting_others') && onCancelBooking && (
          <button
            onClick={onCancelBooking}
            className="mt-3 w-full bg-red-500/90 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 border border-white/50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-95"
          >
            <span>❌</span>
            <span>Cancel This Booking</span>
          </button>
        )}
      </div>
      
      {/* Booking Details - Enhanced visibility */}
      <div className="px-4 py-3 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {/* Service Details - More prominent */}
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-xs text-gray-500">Service</div>
              <div className="font-bold text-gray-800">
                {currentBooking.serviceType} ({currentBooking.duration}min)
              </div>
            </div>
          </div>
          
          {/* Price - More prominent */}
          <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
            <CreditCard className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-xs text-gray-500">Total Price</div>
              <div className="font-bold text-green-700">
                {formatPrice(currentBooking.totalPrice)}
              </div>
            </div>
          </div>
          
          {/* Customer Name */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <User className="w-4 h-4 text-gray-600" />
            <div>
              <div className="text-xs text-gray-500">Customer</div>
              <div className="font-medium text-gray-800">{currentBooking.customerName}</div>
            </div>
          </div>
          
          {/* Location */}
          {currentBooking.locationZone && (
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-600" />
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="font-medium text-gray-800">{currentBooking.locationZone}</div>
              </div>
            </div>
          )}
          
          {/* Booking Type & Time */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Type:</span>
            <span className="font-medium text-gray-800">
              {currentBooking.bookingType === 'book_now' ? '🔥 Book Now' : '📅 Scheduled'}
              {currentBooking.scheduledDate && (
                ` - ${currentBooking.scheduledDate} ${currentBooking.scheduledTime}`
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
};
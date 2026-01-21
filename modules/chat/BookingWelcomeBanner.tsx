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
        return `⏰ Please wait while therapist connects (up to ${timerText})`;
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
            <dCountdown Timer - 5 min for Book Now, 25 min for Scheduled */}
          {bookingCountdown !== null && currentBooking.status === 'pending' && (
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono font-bold">
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
            className="mt-3 w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/30 flex items-center justify-center gap-2"
          >
            <span>❌</span>
            <span>Cancel Booking</span>
          </button>
        )}
        {/* Status Message */}
        <p className="text-blue-100 text-xs mt-2">
          {getStatusMessage(currentBooking.status)}
        </p>
      </div>
      
      {/* Booking Details */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {/* Service Details */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Service:</span>
            <span className="font-medium text-gray-800">
              {currentBooking.serviceType} ({currentBooking.duration}min)
            </span>
          </div>
          
          {/* Customer Name */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium text-gray-800">{currentBooking.customerName}</span>
          </div>
          
          {/* Location */}
          {currentBooking.locationZone && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">Location:</span>
              <span className="font-medium text-gray-800">{currentBooking.locationZone}</span>
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-green-600">{formatPrice(currentBooking.totalPrice)}</span>
          </div>
          
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
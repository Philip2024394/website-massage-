/**
 * BookingBanner Component - Production Ready
 *
 * Purpose: Displays booking details with live countdown timer for therapist response deadline
 * Data Flow: Real Appwrite booking data → countdown calculation → UI display with notifications
 *
 * Features:
 * - Shows therapist profile image
 * - Displays booking time and service details  
 * - Live countdown timer until therapist must respond (5min book_now, 25min scheduled)
 * - Visual warnings as deadline approaches (green → yellow → red)
 * - Push notifications at critical time intervals
 * - Cancel booking functionality with confirmation
 * - Responsive layout for mobile/desktop
 */

import React, { useEffect, useState } from 'react';
import { bookingChatIntegrationService } from '../lib/services/bookingChatIntegration.service';
import { bookingNotificationService } from '../lib/services/bookingNotification.service';

interface BookingBannerProps {
  therapistName: string;
  therapistPhoto?: string;
  bookingDate: string;
  bookingTime: string;
  serviceDuration: string;
  serviceType: string;
  bookingType?: 'book_now' | 'scheduled';
  bookingStatus?: string;
  responseDeadline?: string; // ISO timestamp when therapist must respond
  bookingId?: string;
  chatRoomId?: string;
  onClose?: () => void;
  onCancelBooking?: () => void;
}

export const BookingBanner: React.FC<BookingBannerProps> = ({
  therapistName,
  therapistPhoto,
  bookingDate,
  bookingTime,
  serviceDuration,
  serviceType,
  bookingType = 'book_now',
  bookingStatus = 'pending',
  responseDeadline,
  bookingId,
  chatRoomId,
  onClose,
  onCancelBooking
}) => {
  const [countdown, setCountdown] = useState({
    timeRemaining: 0,
    formatted: '',
    isExpired: false,
    isWithin5Minutes: false,
    isWithin2Minutes: false
  });

  const [notificationTimersSetup, setNotificationTimersSetup] = useState(false);
  const [cleanupTimers, setCleanupTimers] = useState<(() => void) | null>(null);

  // Update countdown every second
  useEffect(() => {
    if (!responseDeadline) {
      // Fallback: calculate deadline from current time if not provided
      const now = new Date();
      const deadlineMinutes = bookingType === 'book_now' ? 5 : 25;
      const deadline = new Date(now.getTime() + deadlineMinutes * 60 * 1000);
      
      const interval = setInterval(() => {
        const result = bookingChatIntegrationService.calculateTimeRemaining(deadline.toISOString());
        setCountdown(result);
      }, 1000);

      return () => clearInterval(interval);
    }

    const interval = setInterval(() => {
      const result = bookingChatIntegrationService.calculateTimeRemaining(responseDeadline);
      setCountdown(result);
    }, 1000);

    return () => clearInterval(interval);
  }, [responseDeadline, bookingType]);

  // Setup notification timers once
  useEffect(() => {
    if (responseDeadline && bookingId && chatRoomId && !notificationTimersSetup && bookingStatus === 'pending') {
      const cleanup = bookingNotificationService.setupBookingTimers(
        bookingId,
        chatRoomId,
        responseDeadline,
        therapistName,
        serviceType
      );
      
      setCleanupTimers(() => cleanup);
      setNotificationTimersSetup(true);
      
      console.log('⏰ Booking notification timers setup for:', bookingId);
    }

    // Cleanup timers when component unmounts or booking status changes
    return () => {
      if (cleanupTimers) {
        cleanupTimers();
      }
    };
  }, [responseDeadline, bookingId, chatRoomId, notificationTimersSetup, bookingStatus, therapistName, serviceType]);

  // Show cancel button only for pending bookings
  const showCancelButton = onCancelBooking && (bookingStatus === 'pending' || bookingStatus === 'waiting_others');

  // Determine banner color and urgency based on countdown
  const getBannerStyle = () => {
    if (countdown.isExpired) {
      return 'bg-red-100 border-red-300 text-red-800';
    } else if (countdown.isWithin2Minutes) {
      return 'bg-red-50 border-red-200 text-red-700';
    } else if (countdown.isWithin5Minutes) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    } else {
      return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  const getCountdownStyle = () => {
    if (countdown.isExpired) {
      return 'text-red-600 bg-red-100';
    } else if (countdown.isWithin2Minutes) {
      return 'text-red-600 bg-red-50 animate-pulse';
    } else if (countdown.isWithin5Minutes) {
      return 'text-yellow-600 bg-yellow-50';
    } else {
      return 'text-green-600 bg-green-50';
    }
  };

  const getStatusMessage = () => {
    if (countdown.isExpired) {
      return '⏰ Response time expired - Finding other therapists...';
    } else if (bookingStatus === 'accepted') {
      return '✅ Booking accepted! You can now chat with your therapist.';
    } else if (bookingStatus === 'rejected') {
      return '❌ Booking declined - Finding other available therapists...';
    } else {
      const timeType = bookingType === 'book_now' ? '5 minutes' : '25 minutes';
      return `⏳ Waiting for ${therapistName} to respond (up to ${timeType})`;
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 mb-4 ${getBannerStyle()}`}>
      {/* Header with therapist info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {therapistPhoto && (
            <img 
              src={therapistPhoto}
              alt={therapistName}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div>
            <h3 className="font-bold text-lg">{therapistName}</h3>
            <p className="text-sm opacity-75">
              {serviceType} • {serviceDuration} minutes
            </p>
          </div>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Booking details */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-75">Booking Time:</span>
          <span className="font-medium">{bookingDate} at {bookingTime}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="opacity-75">Type:</span>
          <span className="font-medium">
            {bookingType === 'book_now' ? '🔥 Book Now' : '📅 Scheduled'}
          </span>
        </div>
      </div>

      {/* Status message */}
      <div className="mb-3">
        <p className="text-sm font-medium">{getStatusMessage()}</p>
      </div>

      {/* Countdown timer - only show for pending bookings */}
      {bookingStatus === 'pending' && !countdown.isExpired && (
        <div className="mb-3">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCountdownStyle()}`}>
            ⏱️ Response deadline: {countdown.formatted}
          </div>
        </div>
      )}

      {/* Expired state */}
      {countdown.isExpired && (
        <div className="mb-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-red-600 bg-red-100">
            ⏰ Expired - Searching alternatives
          </div>
        </div>
      )}

      {/* Cancel button */}
      {showCancelButton && (
        <div className="mt-3">
          <button
            onClick={onCancelBooking}
            className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Cancel Booking
          </button>
        </div>
      )}

      {/* Booking type indicator */}
      <div className="mt-2 text-xs opacity-60">
        {bookingType === 'book_now' 
          ? 'Immediate booking - therapist has 5 minutes to respond'
          : 'Scheduled booking - therapist has 25 minutes to respond'
        }
      </div>
    </div>
  );
};


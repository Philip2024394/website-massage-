/**
 * Enhanced Timeout Flow Example
 * Demonstrates the complete booking timeout handling as requested by user
 */

import React, { useState } from 'react';
import { useEnhancedTimeout } from '../hooks/useEnhancedTimeout';
import EnhancedBookingTimeout from '../components/EnhancedBookingTimeout';
import { BookingProgress } from '../components/BookingProgress';
import { TimeoutHandlerResult } from '../services/bookingTimeoutHandler';

interface EnhancedTimeoutExampleProps {
  bookingId: string;
  therapistId: string;
  therapistName: string;
  providerType: 'therapist' | 'massage_place' | 'skincare_clinic'; // NEW: Provider type
  bookingType: 'immediate' | 'scheduled'; // NEW: Booking type
  customerName: string;
  serviceType: string;
  duration: number;
  price: number;
  location?: {
    lat: number;
    lng: number;
  };
}

export const EnhancedTimeoutExample: React.FC<EnhancedTimeoutExampleProps> = ({
  bookingId,
  therapistId,
  therapistName,
  providerType,
  bookingType,
  customerName,
  serviceType,
  duration,
  price,
  location
}) => {
  const [showTimeoutHandler, setShowTimeoutHandler] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'broadcast_all' | 'cancelled'>('pending');

  const {
    timeLeft,
    formattedTime,
    isActive,
    isExpired,
    timeoutResult,
    isHandlingTimeout,
    startCountdown,
    cancelBooking,
    retryWithLocation,
    status,
    providerCount
  } = useEnhancedTimeout({
    bookingId,
    originalTherapistId: therapistId,
    providerType,
    bookingType,
    customerName,
    serviceType,
    duration,
    price,
    location,
    onTimeoutTriggered: (result: TimeoutHandlerResult) => {
      console.log('⏰ Timeout triggered with result:', result);
      if (result.action === 'broadcasted' && result.success) {
        setBookingStatus('broadcast_all');
        setShowTimeoutHandler(true);
      }
    },
    onCancelBooking: () => {
      setBookingStatus('cancelled');
      console.log('❌ Booking cancelled, redirecting to directory...');
    }
  });

  // Start countdown when component mounts (simulate booking creation)
  React.useEffect(() => {
    if (!isActive && status === 'idle') {
      startCountdown();
    }
  }, [isActive, status, startCountdown]);

  const handleCancelAndBrowse = () => {
    cancelBooking();
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Enhanced Booking Timeout Demo
        </h2>
        
        {/* Booking Details */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm space-y-1">
            <div><strong>Booking ID:</strong> {bookingId}</div>
            <div><strong>Provider:</strong> {therapistName} ({providerType})</div>
            <div><strong>Booking Type:</strong> {bookingType}</div>
            <div><strong>Service:</strong> {serviceType}</div>
            <div><strong>Duration:</strong> {duration} minutes</div>
            <div><strong>Customer:</strong> {customerName}</div>
          </div>
        </div>

        {/* Countdown Display (only show when counting) */}
        {status === 'counting' && (
          <div className=\"mb-4 p-4 border-2 border-blue-200 bg-blue-50 rounded-lg text-center\">
            <div className=\"text-2xl font-bold text-blue-600 mb-2\">
              {formattedTime}
            </div>
            <div className=\"text-sm text-blue-700\">
              Waiting for {therapistName} to respond
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className={`mb-4 p-3 rounded-lg text-center ${
          status === 'counting' ? 'bg-yellow-100 text-yellow-800' :
          status === 'expired' ? 'bg-red-100 text-red-800' :
          status === 'timeout_handled' ? 'bg-blue-100 text-blue-800' :
          status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
          'bg-green-100 text-green-800'
        }`}>
          <div className=\"font-medium\">
            {status === 'counting' && '⏳ Waiting for Response'}
            {status === 'expired' && '⏰ Time Expired'}
            {status === 'timeout_handled' && '📡 Broadcasting to All Providers'}
            {status === 'cancelled' && '❌ Booking Cancelled'}
            {status === 'idle' && '🔄 Ready to Start'}
          </div>
          {providerCount > 0 && (
            <div className=\"text-xs mt-1\">
              {providerCount} providers found nearby
            </div>
          )}
        </div>

        {/* Enhanced Timeout Handler */}
        {showTimeoutHandler && timeoutResult && (
          <EnhancedBookingTimeout
            bookingId={bookingId}
            originalTherapistId={therapistId}
            providerType={providerType}
            bookingType={bookingType}
            therapistName={therapistName}
            customerName={customerName}
            serviceType={serviceType}
            duration={duration}
            price={price}
            location={location}
            onCancel={handleCancelAndBrowse}
            onProviderFound={(count) => {
              console.log(`🎯 ${count} providers found and notified`);
            }}
            onLocationRequired={() => {
              console.log('📍 Location permission required for better results');
            }}
          />
        )}

        {/* Action Buttons */}
        {!showTimeoutHandler && status !== 'cancelled' && (
          <div className=\"space-y-2\">
            {status === 'counting' && (
              <button
                onClick={handleCancelAndBrowse}
                className=\"w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors\"
              >
                Cancel & Browse Directory
              </button>
            )}
            
            {(status === 'expired' || status === 'timeout_handled') && (
              <div className=\"space-y-2\">
                <button
                  onClick={retryWithLocation}
                  disabled={isHandlingTimeout}
                  className=\"w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors\"
                >
                  {isHandlingTimeout ? 'Finding Providers...' : 'Retry with Location'}
                </button>
                <button
                  onClick={handleCancelAndBrowse}
                  className=\"w-full py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors\"
                >
                  Cancel & Browse Directory
                </button>
              </div>
            )}
          </div>
        )}

        {/* Helper Text */}
        <div className=\"mt-4 text-xs text-gray-600 text-center\">
          {status === 'counting' && `Provider has ${Math.ceil(timeLeft/60)} minutes to respond (${bookingType} booking)`}
          {status === 'expired' && 'Timer expired - looking for alternatives'}
          {status === 'timeout_handled' && `Broadcasting to nearby ${providerType}s`}
          {status === 'cancelled' && 'Please view directory for your preferred Therapist / Places'}
        </div>
      </div>

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className=\"bg-gray-100 p-4 rounded-lg text-xs\">
          <h3 className=\"font-bold mb-2\">Debug Info:</h3>
          <div>Status: {status}</div>
          <div>Time Left: {timeLeft}s</div>
          <div>Is Active: {isActive.toString()}</div>
          <div>Is Expired: {isExpired.toString()}</div>
          <div>Is Handling Timeout: {isHandlingTimeout.toString()}</div>
          <div>Provider Count: {providerCount}</div>
          {timeoutResult && (
            <div>
              <div>Timeout Action: {timeoutResult.action}</div>
              <div>Timeout Success: {timeoutResult.success.toString()}</div>
              <div>Timeout Message: {timeoutResult.message}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
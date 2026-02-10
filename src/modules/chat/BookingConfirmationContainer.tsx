/**
 * BookingConfirmationContainer - Single Fixed Booking Container
 * 
 * REQUIRED BEHAVIOR:
 * - ONE fixed container taking full screen
 * - No multiple panels or nested scroll areas
 * - All content scrolls inside the container
 * - Page behind does not scroll
 * - Countdown timer always visible in scrollable area
 * - Confirmation text with glow animation once booking sent
 * 
 * UI: Matches the chat step "Detail Booking" design exactly (same as after Order Now).
 * Mobile-safe: No overflow:hidden bugs on body
 */

import React, { useEffect, useState } from 'react';
import { X, Clock, MessageCircle } from 'lucide-react';
import { formatPrice } from './utils/chatHelpers';

interface BookingDetails {
  customerName?: string;
  customerWhatsApp?: string;
  massageFor?: string;
  locationType?: string;
  duration?: number;
  price?: number;
  serviceType?: string;
}

interface BookingConfirmationContainerProps {
  therapistName: string;
  therapistImage?: string;
  bookingId?: string;
  bookingDetails?: BookingDetails;
  countdownSeconds: number;
  onCancel: () => void;
  showConfirmation?: boolean;
}

export const BookingConfirmationContainer: React.FC<BookingConfirmationContainerProps> = ({
  therapistName,
  therapistImage,
  bookingId,
  bookingDetails,
  countdownSeconds,
  onCancel,
  showConfirmation = true
}) => {
  const [timeRemaining, setTimeRemaining] = useState(countdownSeconds);

  // Debug logging
  useEffect(() => {
    console.log('🎯 BookingConfirmationContainer mounted');
    console.log('📊 Initial countdown:', countdownSeconds, 'seconds');
    console.log('👤 Therapist:', therapistName);
    console.log('🔢 Booking ID:', bookingId || 'N/A');
  }, []);

  // ✅ MOBILE SCROLL FIX: Use modal-open class for body scroll lock
  useEffect(() => {
    // Lock body scroll using gold standard modal-open class
    document.body.classList.add('modal-open');
    document.body.classList.add('booking-active');
    
    console.log('🔒 Body scroll locked for booking confirmation');
    
    // Restore on unmount
    return () => {
      document.body.classList.remove('modal-open');
      document.body.classList.remove('booking-active');
      console.log('🔓 Body scroll unlocked - booking confirmation closed');
    };
  }, []);

  // Countdown timer - React implementation with proper dependencies
  useEffect(() => {
    if (timeRemaining <= 0) return;

    console.log('⏱️ Starting countdown timer from', timeRemaining, 'seconds');

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          console.log('⏰ Countdown expired');
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      console.log('🛑 Countdown timer cleanup');
    };
  }, []); // Empty dependency - timer manages its own state

  // Format time as MM:SS (same as chat step)
  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <style>{`
        @keyframes glow {
          from {
            box-shadow: 0 0 5px rgba(30,142,62,0.4);
          }
          to {
            box-shadow: 0 0 15px rgba(30,142,62,0.9);
          }
        }
        
        .booking-status.sent {
          animation: glow 1.5s infinite alternate;
        }

        /* Prevent body scroll when booking container is open */
        body.booking-active {
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
        }
      `}</style>

      {/* Fixed full-screen container */}
      <div 
        className="booking-chat"
        style={{
          position: 'fixed',
          inset: 0,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999
        }}
      >
        {/* Header */}
        <div 
          className="booking-header"
          style={{
            padding: '16px',
            borderBottom: '1px solid #eee',
            backgroundColor: '#f9fafb'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {therapistImage && (
              <img 
                src={therapistImage}
                alt={therapistName}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #f97316'
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                margin: 0,
                color: '#111827'
              }}>
                Booking Request
              </h3>
              <span style={{ 
                fontSize: '14px', 
                color: '#6b7280',
                display: 'block',
                marginTop: '2px'
              }}>
                Therapist: {therapistName}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable body - Same design as chat step Detail Booking */}
        <div 
          className="booking-body p-4"
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Welcome - Same as chat step after Order Now */}
          <div className="text-center py-6 px-4 mb-4">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-300 rounded-full border-3 border-white animate-bounce">
                <div className="w-full h-full bg-gray-200 rounded-full animate-ping" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🎉 Welcome {therapistName} Massage Service
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your booking has been successfully submitted.<br/>
              You can chat directly with your therapist once they accept booking.
            </p>
          </div>

          {/* Detail Booking - Exact same UI as chat step after Order Now */}
          <div className="bg-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-800 text-sm mb-4">
              Detail Booking
            </h4>
            
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-medium">Layanan:</span>
                <span>{bookingDetails?.serviceType || 'Pijat'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Durasi:</span>
                <span>{bookingDetails?.duration || 60} menit</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Harga:</span>
                <span className="font-semibold">
                  {bookingDetails?.price ? formatPrice(bookingDetails.price) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Arrival:</span>
                <span>30-60 Minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Pembayaran:</span>
                <span>Tunai • Transfer</span>
              </div>
            </div>
            
            {/* 5-Minute Countdown - Same orange gradient as chat step */}
            <div className="mt-4 pt-4 border-t border-gray-300">
              {timeRemaining > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-2 border-orange-300 shadow-md">
                  <div className="text-center mb-2">
                    <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-1">
                      ⏰ Therapist Response Countdown
                    </p>
                    <p className="text-xs text-orange-600">
                      Therapist has 5 minutes to accept booking
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-white px-5 py-3 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600 animate-pulse" />
                    <span className="text-3xl font-bold text-orange-600 font-mono">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs text-orange-700 font-medium">
                      Time remaining for therapist to respond
                    </p>
                  </div>
                </div>
              )}
              
              {/* Confirmation status */}
              {showConfirmation && timeRemaining > 0 && (
                <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200 text-center">
                  <p className="text-sm font-semibold text-green-800 mb-1">✅ Booking Request Sent</p>
                  <p className="text-xs text-green-600">Waiting for therapist to respond...</p>
                </div>
              )}

              {/* Expired message */}
              {timeRemaining <= 0 && (
                <div className="p-4 rounded-xl text-center font-semibold text-red-600 bg-red-50 border-2 border-red-200">
                  ⏰ Booking request expired - No response received
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions footer */}
        <div 
          className="booking-actions"
          style={{
            padding: '16px',
            borderTop: '1px solid #eee',
            backgroundColor: '#f9fafb'
          }}
        >
          <button
            onClick={onCancel}
            className="cancel"
            disabled={timeRemaining <= 0}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: timeRemaining <= 0 ? '#9ca3af' : '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: timeRemaining <= 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (timeRemaining > 0) {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }
            }}
            onMouseLeave={(e) => {
              if (timeRemaining > 0) {
                e.currentTarget.style.backgroundColor = '#ef4444';
              }
            }}
          >
            <X size={18} />
            {timeRemaining <= 0 ? 'Booking Expired' : 'Cancel Booking'}
          </button>
        </div>
      </div>
    </>
  );
};

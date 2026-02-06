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
 * Mobile-safe: No overflow:hidden bugs on body
 */

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

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

  // Lock body scroll when component mounts
  useEffect(() => {
    // Save current body styles
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.classList.add('booking-active');
    
    console.log('🔒 Body scroll locked for booking confirmation');
    
    // Restore on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
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

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // Format location type
  const formatLocationType = (type?: string): string => {
    if (!type) return '';
    const map: Record<string, string> = {
      'home': '🏠 Home',
      'hotel': '🏨 Hotel',
      'villa': '🏡 Villa',
      'gym': '💪 Gym & Fitness'
    };
    return map[type] || type;
  };

  // Format massage for
  const formatMassageFor = (value?: string): string => {
    if (!value) return '';
    const map: Record<string, string> = {
      'male': '👨 Male',
      'female': '👩 Female',
      'couple': '👫 Couple'
    };
    return map[value] || value;
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

        {/* Scrollable body */}
        <div 
          className="booking-body"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Booking details */}
          <div 
            className="booking-details"
            style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}
          >
            {bookingDetails?.serviceType && (
              <p style={{ fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
                <strong>Service:</strong> {bookingDetails.serviceType}
              </p>
            )}
            
            {bookingDetails?.duration && (
              <p style={{ fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
                <strong>Duration:</strong> {bookingDetails.duration} Minutes
              </p>
            )}
            
            {bookingDetails?.price && (
              <p style={{ fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
                <strong>Price:</strong> IDR {bookingDetails.price.toLocaleString('id-ID')}
              </p>
            )}
            
            {bookingDetails?.locationType && (
              <p style={{ fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
                <strong>Location:</strong> {formatLocationType(bookingDetails.locationType)}
              </p>
            )}
            
            {bookingDetails?.massageFor && (
              <p style={{ fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
                <strong>Treatment For:</strong> {formatMassageFor(bookingDetails.massageFor)}
              </p>
            )}
            
            {bookingDetails?.customerName && (
              <p style={{ fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
                <strong>Customer:</strong> {bookingDetails.customerName}
              </p>
            )}
            
            {bookingDetails?.customerWhatsApp && (
              <p style={{ fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
                <strong>WhatsApp:</strong> {bookingDetails.customerWhatsApp}
              </p>
            )}
          </div>

          {/* Countdown timer - MUST BE VISIBLE */}
          <div 
            className="booking-timer"
            id="bookingTimer"
            style={{
              display: 'block',
              margin: '16px 0',
              padding: '12px',
              background: '#f7f7f7',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '18px',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 700,
              color: timeRemaining <= 60 ? '#dc2626' : '#f97316',
              fontFamily: 'monospace',
              marginBottom: '4px'
            }} id="countdown">
              {formatTime(timeRemaining)}
            </div>
            <small style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              display: 'block'
            }}>
              {timeRemaining <= 0 ? 'Expired' : 'Waiting for therapist response'}
            </small>
          </div>

          {/* Confirmation status */}
          {showConfirmation && timeRemaining > 0 && (
            <div 
              className="booking-status sent" 
              id="bookingStatus"
              style={{
                marginTop: '16px',
                padding: '12px',
                textAlign: 'center',
                fontWeight: 600,
                borderRadius: '8px',
                color: '#1e8e3e',
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac'
              }}
            >
              ✅ Booking request sent to therapist
            </div>
          )}

          {/* Expired message */}
          {timeRemaining <= 0 && (
            <div 
              className="booking-status expired"
              style={{
                marginTop: '16px',
                padding: '12px',
                textAlign: 'center',
                fontWeight: 600,
                borderRadius: '8px',
                color: '#dc2626',
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5'
              }}
            >
              ⏰ Booking request expired - No response received
            </div>
          )}
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

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, Clock, Calendar, User } from 'lucide-react';
import { Booking } from '../../../src/types';

interface BookingNotificationProps {
  booking: Booking;
  onAccept: (bookingId: number) => void;
  onDismiss?: () => void;
  autoShow?: boolean;
}

const BookingNotification: React.FC<BookingNotificationProps> = ({
  booking,
  onAccept,
  onDismiss,
  autoShow = false,
}) => {
  const [isVisible, setIsVisible] = useState(autoShow);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for notification sound
    const audio = new Audio('/notification-sound.mp3');
    audio.loop = true; // Loop until accepted
    audioRef.current = audio;

    // Check if we should show notification (3 hours before booking)
    const checkNotificationTime = () => {
      const bookingTime = new Date(booking.startTime);
      const threeHoursBefore = new Date(bookingTime.getTime() - (3 * 60 * 60 * 1000));
      const now = new Date();

      if (now >= threeHoursBefore && now < bookingTime && !booking.therapistAccepted && !booking.notificationSent) {
        setIsVisible(true);
        playNotificationSound();
      }
    };

    // Check immediately and then every minute
    checkNotificationTime();
    const interval = setInterval(checkNotificationTime, 60000); // Check every minute

    return () => {
      clearInterval(interval);
      stopNotificationSound();
    };
  }, [booking]);

  const playNotificationSound = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(error => {
        console.error('Error playing notification sound:', error);
      });
      setIsPlaying(true);

      // Request notification permission if not granted
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Upcoming Booking Alert! 🔔', {
          body: `You have a booking in 3 hours with ${booking.userName}`,
          icon: '/logo.png',
          badge: '/logo.png',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          tag: `booking-${booking.id}`,
        });
      }
    }
  };

  const stopNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleAccept = () => {
    stopNotificationSound();
    onAccept(booking.id);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    stopNotificationSound();
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const bookingTime = new Date(booking.startTime);
  const timeUntilBooking = bookingTime.getTime() - Date.now();
  const hoursUntil = Math.floor(timeUntilBooking / (1000 * 60 * 60));
  const minutesUntil = Math.floor((timeUntilBooking % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <>
      {/* Fullscreen Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4 animate-pulse-slow">
        <div className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl animate-bounce-gentle">
          {/* Animated Bell Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto animate-ring">
              <Bell className="w-10 h-10 text-white" />
            </div>
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-orange-500 rounded-full opacity-20 animate-ping" />
              </div>
            )}
          </div>

          {/* Alert Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🔔 Booking Alert!
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-lg font-bold text-orange-600">
                {hoursUntil}h {minutesUntil}m remaining
              </span>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="text-sm font-bold text-gray-900">{booking.userName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="text-sm font-bold text-gray-900">
                  {bookingTime.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric' 
                  })} at {bookingTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-bold text-gray-900">{booking.service} minutes</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 animate-pulse-button"
            >
              <CheckCircle className="w-6 h-6" />
              Accept & Stop Alert
            </button>

            {onDismiss && (
              <button
                onClick={handleDismiss}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Dismiss for Now
              </button>
            )}
          </div>

          {/* Warning Text */}
          <p className="text-xs text-center text-gray-500 mt-4">
            🔊 Sound will continue until you accept the booking
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes ring {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        
        @keyframes pulse-button {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        .animate-ring {
          animation: ring 1s ease-in-out infinite;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-pulse-button {
          animation: pulse-button 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default BookingNotification;

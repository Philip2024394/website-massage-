import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Calendar, Clock, MapPin, User as UserIcon } from 'lucide-react';
import { Booking } from '../../types';

interface CustomerNotificationProps {
  booking: Booking;
  onClose?: () => void;
  autoShow?: boolean;
}

const CustomerNotification: React.FC<CustomerNotificationProps> = ({
  booking,
  onClose,
  autoShow = false,
}) => {
  const [isVisible, setIsVisible] = useState(autoShow);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for notification sound
    const audio = new Audio('/customer-notification.mp3');
    audio.loop = false; // Play once for customer
    audioRef.current = audio;

    // Check if we should show notification (5 hours before booking)
    const checkNotificationTime = () => {
      const bookingTime = new Date(booking.startTime);
      const threeHoursBefore = new Date(bookingTime.getTime() - (3 * 60 * 60 * 1000));
      const now = new Date();

      if (now >= threeHoursBefore && now < bookingTime && !booking.notificationSent) {
        setIsVisible(true);
        playNotificationSound();
      }

      // Update countdown
      const timeRemaining = bookingTime.getTime() - now.getTime();
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`${hours}h ${minutes}m`);
    };

    // Check immediately and then every minute
    checkNotificationTime();
    const interval = setInterval(checkNotificationTime, 60000);

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [booking]);

  const playNotificationSound = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(error => {
        console.error('Error playing notification sound:', error);
      });
      setIsPlaying(true);

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Upcoming Massage Appointment! 💆', {
          body: `Your ${booking.service}-minute massage with ${booking.providerName} starts in 3 hours`,
          icon: '/logo.png',
          badge: '/logo.png',
          vibrate: [200, 100, 200, 100, 200],
          requireInteraction: true,
          tag: `booking-${booking.id}`,
        });
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose?.();
  };

  if (!isVisible) return null;

  const bookingTime = new Date(booking.startTime);

  return (
    <>
      {/* Fullscreen Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 bg-opacity-95 z-[9999] flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl animate-slide-in">
          {/* Animated Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto animate-pulse-scale">
              <span className="text-4xl">💆</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 bg-orange-300 rounded-full opacity-30 animate-ping-slow" />
            </div>
          </div>

          {/* Alert Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Appointment Reminder
            </h2>
            <p className="text-gray-600 text-sm mb-3">
              Your massage session is coming up soon!
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full">
              <Bell className="w-5 h-5 text-orange-600 animate-wiggle" />
              <span className="text-lg font-bold text-orange-600">
                In {countdown}
              </span>
            </div>
          </div>

          {/* Booking Details Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 mb-6 space-y-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Your Therapist</p>
                <p className="text-lg font-bold text-gray-900">{booking.providerName}</p>
              </div>
            </div>

            <div className="h-px bg-gray-300" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-bold text-gray-900">
                    {bookingTime.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="text-sm font-bold text-gray-900">
                    {bookingTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-bold text-gray-900">{booking.service} minutes</p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-2">📋 Preparation Tips:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✓ Take a shower before the session</li>
              <li>✓ Wear comfortable loose clothing</li>
              <li>✓ Prepare your space (clean & quiet)</li>
              <li>✓ Have fresh towels ready</li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            Got It, Thanks!
          </button>

          <p className="text-xs text-center text-gray-500 mt-4">
            🙏 Thank you for choosing our service
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        
        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default CustomerNotification;

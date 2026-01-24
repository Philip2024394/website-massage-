/**
 * 🔄 BOOKING PROGRESS INDICATOR
 * 
 * Purpose: Visual progress indicator for booking stages
 * Shows current booking status with colored icons
 */

import React, { useState, useEffect } from 'react';
import { Send, Clock, Check, User, Bike, Star } from 'lucide-react';

interface BookingProgressProps {
  currentStatus?: string;
  className?: string;
  deadline?: string;
  role?: 'user' | 'therapist';
  bookingId?: string;
  therapistName?: string;
  onCancel?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onExpire?: () => void;
}

export function BookingProgress({ 
  currentStatus = 'pending', 
  className = '',
  deadline,
  role,
  bookingId,
  therapistName,
  onCancel,
  onAccept,
  onDecline,
  onExpire
}: BookingProgressProps) {
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Countdown timer effect
  useEffect(() => {
    if (!deadline) return;
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const remaining = Math.max(0, Math.floor((deadlineTime - now) / 1000));
      
      setTimeRemaining(remaining);
      
      if (remaining === 0 && onExpire) {
        onExpire();
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [deadline, onExpire]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const showCountdown = deadline && currentStatus === 'pending' && timeRemaining > 0;
  
  const steps = [
    {
      id: 'sent',
      label: 'Pesanan Dikirim',
      labelEn: 'Order Sent',
      icon: Send,
      description: 'Booking telah dikirim'
    },
    {
      id: 'pending',
      label: 'Menunggu Respon',
      labelEn: 'Waiting Response', 
      icon: Clock,
      description: 'Terapis sedang meninjau'
    },
    {
      id: 'accepted',
      label: 'Diterima',
      labelEn: 'Accepted',
      icon: Check,
      description: 'Terapis menerima'
    },
    {
      id: 'confirmed',
      label: 'Dikonfirmasi',
      labelEn: 'Confirmed',
      icon: User,
      description: 'Booking dikonfirmasi'
    },
    {
      id: 'on_the_way',
      label: 'Dalam Perjalanan',
      labelEn: 'On The Way',
      icon: Bike,
      description: 'Terapis sedang perjalanan'
    },
    {
      id: 'completed',
      label: 'Selesai',
      labelEn: 'Completed',
      icon: Star,
      description: 'Layanan selesai'
    }
  ];

  const getStepStatus = (stepId: string, currentStatus: string) => {
    const stepOrder = ['sent', 'pending', 'accepted', 'confirmed', 'on_the_way', 'completed'];
    const currentIndex = stepOrder.indexOf(currentStatus);
    const stepIndex = stepOrder.indexOf(stepId);

    if (currentIndex === -1) {
      // If current status not found, show first step as active
      return stepIndex === 0 ? 'active' : 'upcoming';
    }

    if (stepIndex < currentIndex) {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'active';
    } else {
      return 'upcoming';
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-500',
          text: 'text-green-600',
          border: 'border-green-500',
          ring: 'ring-green-100'
        };
      case 'active':
        return {
          bg: 'bg-orange-500',
          text: 'text-orange-600',
          border: 'border-orange-500',
          ring: 'ring-orange-100'
        };
      default:
        return {
          bg: 'bg-gray-300',
          text: 'text-gray-400',
          border: 'border-gray-300',
          ring: 'ring-gray-100'
        };
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-3 ${className}`}>
      <h5 className="font-semibold text-gray-800 text-xs mb-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
        <span id="booking-progress-title" data-gb="Progres Booking|Booking Progress">Progres Booking</span>
      </h5>

      {/* Compact 2x3 grid layout for mobile */}
      <div className="grid grid-cols-3 gap-2">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, currentStatus);
          const colors = getStepColor(status);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center">
              {/* Compact icon circle */}
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 
                  ${colors.bg} ${colors.border} transition-all duration-500
                  ${status === 'active' ? `ring-2 ${colors.ring} animate-pulse` : ''}
                `}
              >
                <Icon 
                  className={`w-3.5 h-3.5 ${status === 'completed' || status === 'active' ? 'text-white' : 'text-gray-500'}`} 
                />
              </div>

              {/* Compact step label */}
              <div className="mt-1 text-center">
                <div className={`text-xs font-medium ${colors.text} leading-tight`}>
                  {step.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Countdown Timer Section */}
      {showCountdown && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-600 animate-pulse" />
              <span className="text-lg font-bold text-orange-600">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="text-xs text-center text-gray-600 mb-3">
              <span id="countdown-message" data-gb={role === 'therapist' 
                ? 'Waktu untuk merespon permintaan booking|Time to respond to booking request'
                : `Menunggu respon ${therapistName || 'terapis'}|Waiting for ${therapistName || 'therapist'} response`
              }>
                {role === 'therapist' 
                  ? 'Waktu untuk merespon permintaan booking'
                  : `Menunggu respon ${therapistName || 'terapis'}`
                }
              </span>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 justify-center">
              {role === 'therapist' ? (
                <>
                  <button
                    onClick={onAccept}
                    disabled={timeRemaining === 0}
                    className="px-3 py-1.5 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    id="accept-btn" 
                    data-gb="Terima|Accept"
                  >
                    Terima
                  </button>
                  <button
                    onClick={onDecline}
                    disabled={timeRemaining === 0}
                    className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    id="decline-btn" 
                    data-gb="Tolak|Decline"
                  >
                    Tolak
                  </button>
                </>
              ) : (
                <button
                  onClick={onCancel}
                  disabled={timeRemaining === 0}
                  className="px-3 py-1.5 bg-gray-500 text-white text-xs rounded-full hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  id="cancel-btn" 
                  data-gb="Batal|Cancel"
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Compact status message */}
      {!showCountdown && (
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-500 leading-tight">
            <span id="status-message" data-gb={
              currentStatus === 'sent' ? 'Permintaan dikirim|Request sent' :
              currentStatus === 'pending' ? 'Menunggu respon|Waiting for response' :
              currentStatus === 'accepted' ? 'Diterima|Accepted' :
              currentStatus === 'confirmed' ? 'Dikonfirmasi|Confirmed' :
              currentStatus === 'on_the_way' ? 'Dalam perjalanan|On the way' :
              currentStatus === 'completed' ? 'Selesai|Completed' : ''
            }>
              {currentStatus === 'sent' && '📤 Permintaan dikirim'}
              {currentStatus === 'pending' && '⏰ Menunggu respon'}
              {currentStatus === 'accepted' && '✅ Diterima'}
              {currentStatus === 'confirmed' && '🎯 Dikonfirmasi'}
              {currentStatus === 'on_the_way' && '🏍️ Dalam perjalanan'}
              {currentStatus === 'completed' && '⭐ Selesai'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
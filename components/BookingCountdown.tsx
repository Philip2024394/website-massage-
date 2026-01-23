/**
 * BookingCountdown - Critical countdown timer component
 * Shows 5-minute countdown for booking response with role-based buttons
 */

import React, { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';

interface BookingCountdownProps {
  deadline: string; // ISO timestamp
  role: 'user' | 'therapist';
  bookingId: string;
  onCancel?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onExpire?: () => void;
}

export const BookingCountdown: React.FC<BookingCountdownProps> = ({
  deadline,
  role,
  bookingId,
  onCancel,
  onAccept,
  onDecline,
  onExpire
}) => {
  const [remaining, setRemaining] = useState<number>(0);

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      const deadlineTime = new Date(deadline).getTime();
      const now = Date.now();
      const timeLeft = Math.max(0, deadlineTime - now);
      setRemaining(timeLeft);

      // Auto-expire when countdown reaches 0
      if (timeLeft === 0 && onExpire) {
        onExpire();
      }
    };

    // Initial update
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  // Format time as MM:SS
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage (0-100)
  const progressPercentage = Math.max(0, Math.min(100, (remaining / (5 * 60 * 1000)) * 100));

  // Check if expired
  const isExpired = remaining <= 0;

  return (
    <div className="bg-gradient-to-r from-orange-100 to-orange-50 border-b border-orange-200 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-orange-800">
              {isExpired ? 'Booking Expired' : 'Waiting for Response'}
            </div>
            <div className="text-xs text-orange-600">
              {role === 'therapist' 
                ? (isExpired ? 'Response time exceeded' : 'Please respond to this booking request')
                : (isExpired ? 'No response received' : 'We\'re finding the best therapist for you')
              }
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold mb-1 ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
            {formatTime(remaining)}
          </div>
          <div className="text-xs text-orange-500">
            {isExpired ? 'expired' : 'remaining'}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-orange-200 rounded-full h-2 mt-3 mb-3">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ease-linear ${
            isExpired ? 'bg-red-500' : 'bg-orange-500'
          }`}
          style={{width: `${progressPercentage}%`}}
        ></div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        {role === 'therapist' ? (
          <>
            <button
              onClick={onAccept}
              disabled={isExpired}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Accept Booking
            </button>
            <button
              onClick={onDecline}
              disabled={isExpired}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Decline
            </button>
          </>
        ) : (
          <button
            onClick={onCancel}
            disabled={isExpired}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            {isExpired ? 'Booking Expired' : 'Cancel Booking'}
          </button>
        )}
      </div>
    </div>
  );
};
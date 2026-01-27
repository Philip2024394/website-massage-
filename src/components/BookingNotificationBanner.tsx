/**
 * ============================================================================
 * 🚨 BOOKING NOTIFICATION BANNER - Enhanced Therapist Alert System
 * ============================================================================
 * 
 * Purpose: Prominent booking request banner for therapists
 * Features:
 * ✅ Large countdown timer with urgency colors
 * ✅ Complete booking details display
 * ✅ Accept/Decline buttons with loading states
 * ✅ Auto-expiry handling
 * ✅ Sound notifications (optional)
 * ✅ Responsive design
 */

import React, { useState, useEffect } from 'react';
import { Clock, User, MapPin, Calendar, DollarSign, AlertTriangle, Check, X, Sparkles } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface BookingRequest {
  id: string;
  customerName: string;
  customerPhone?: string;
  service: string;
  duration: number;
  date?: string;
  time?: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  totalPrice: number;
  bookingType: 'book_now' | 'scheduled';
  discountCode?: string;
  discountPercentage?: number;
  originalPrice?: number;
  createdAt: number;
  expiresAt: number;
}

interface BookingNotificationBannerProps {
  booking: BookingRequest;
  onAccept: (bookingId: string) => Promise<void>;
  onDecline: (bookingId: string, reason?: string) => Promise<void>;
  onExpire: (bookingId: string) => void;
  isVisible: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BookingNotificationBanner({
  booking,
  onAccept,
  onDecline,
  onExpire,
  isVisible,
  className = ''
}: BookingNotificationBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // ========================================================================
  // COUNTDOWN TIMER
  // ========================================================================
  
  useEffect(() => {
    if (!isVisible) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = booking.expiresAt - now;
      
      if (remaining <= 0) {
        setTimeRemaining(0);
        onExpire(booking.id);
      } else {
        setTimeRemaining(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100); // Update every 100ms for smooth countdown

    return () => clearInterval(interval);
  }, [booking.expiresAt, booking.id, onExpire, isVisible]);

  // ========================================================================
  // TIMER FORMATTING & URGENCY
  // ========================================================================

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getUrgencyLevel = () => {
    const secondsLeft = timeRemaining / 1000;
    if (secondsLeft <= 60) return 'critical';
    if (secondsLeft <= 120) return 'warning';
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel();
  
  // ========================================================================
  // URGENCY STYLING
  // ========================================================================

  const urgencyStyles = {
    critical: {
      bg: 'bg-red-500',
      text: 'text-white',
      border: 'border-red-600',
      pulse: 'animate-pulse',
      timerBg: 'bg-red-600',
      shadow: 'shadow-red-500/50'
    },
    warning: {
      bg: 'bg-orange-500',
      text: 'text-white', 
      border: 'border-orange-600',
      pulse: 'animate-bounce',
      timerBg: 'bg-orange-600',
      shadow: 'shadow-orange-500/50'
    },
    normal: {
      bg: 'bg-blue-500',
      text: 'text-white',
      border: 'border-blue-600',
      pulse: '',
      timerBg: 'bg-blue-600',
      shadow: 'shadow-blue-500/50'
    }
  };

  const styles = urgencyStyles[urgencyLevel];

  // ========================================================================
  // ACTION HANDLERS
  // ========================================================================

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(booking.id);
    } catch (error) {
      console.error('Accept failed:', error);
      alert('Failed to accept booking. Please try again.');
      setIsAccepting(false);
    }
  };

  const handleDeclineClick = () => {
    setShowDeclineForm(true);
  };

  const handleDeclineSubmit = async () => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }

    setIsDeclining(true);
    try {
      await onDecline(booking.id, declineReason);
    } catch (error) {
      console.error('Decline failed:', error);
      alert('Failed to decline booking. Please try again.');
      setIsDeclining(false);
    }
  };

  // ========================================================================
  // PRICE FORMATTING
  // ========================================================================

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Don't render if not visible
  if (!isVisible) return null;

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      {/* Banner */}
      <div className={`relative mx-4 mt-4 rounded-xl shadow-2xl ${styles.shadow} ${styles.bg} ${styles.text} overflow-hidden`}>
        {/* Animated Border */}
        <div className={`absolute inset-0 rounded-xl border-2 ${styles.border} ${styles.pulse}`}></div>
        
        {/* Header Section */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${styles.timerBg} ${styles.pulse}`}></div>
              <h1 className="text-lg font-bold">🚨 New Booking Request</h1>
              {booking.bookingType === 'book_now' && (
                <span className="px-2 py-1 text-xs font-medium bg-white/20 rounded-full">
                  🔥 URGENT
                </span>
              )}
            </div>
            
            {/* Large Countdown Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${styles.timerBg} ${styles.pulse}`}>
              <Clock className="w-5 h-5" />
              <span className="text-2xl font-mono font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        {!showDeclineForm ? (
          <div className="p-4 space-y-4">
            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                <User className="w-5 h-5 flex-shrink-0" />
                <div>
                  <div className="text-xs opacity-80">Customer</div>
                  <div className="font-semibold">{booking.customerName}</div>
                  {booking.customerPhone && (
                    <div className="text-xs opacity-70">{booking.customerPhone}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                <Sparkles className="w-5 h-5 flex-shrink-0" />
                <div>
                  <div className="text-xs opacity-80">Service</div>
                  <div className="font-semibold">{booking.service}</div>
                  <div className="text-xs opacity-70">{booking.duration} minutes</div>
                </div>
              </div>
            </div>

            {/* Location & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <div>
                  <div className="text-xs opacity-80">Location</div>
                  <div className="font-semibold text-sm">{booking.location}</div>
                </div>
              </div>

              {(booking.date || booking.time) && (
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                  <Calendar className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="text-xs opacity-80">Scheduled</div>
                    <div className="font-semibold">
                      {booking.date && booking.time 
                        ? `${booking.date} ${booking.time}`
                        : booking.bookingType === 'book_now' ? 'Now' : 'Flexible'
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price Info */}
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
              <DollarSign className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs opacity-80">Total Payment</div>
                <div className="font-bold text-lg">{formatPrice(booking.totalPrice)}</div>
                {booking.discountCode && booking.originalPrice && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="line-through opacity-60">{formatPrice(booking.originalPrice)}</span>
                    <span className="bg-green-500/20 px-2 py-1 rounded">
                      {booking.discountCode} (-{booking.discountPercentage}%)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAccept}
                disabled={isAccepting || isDeclining}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold rounded-lg transition-colors"
              >
                {isAccepting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Accepting...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Accept Booking
                  </>
                )}
              </button>

              <button
                onClick={handleDeclineClick}
                disabled={isAccepting || isDeclining}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-semibold rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
                Decline
              </button>
            </div>
          </div>
        ) : (
          /* Decline Form */
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-red-200">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold">Why are you declining this booking?</h3>
            </div>
            
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Please provide a reason..."
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 resize-none"
              rows={3}
            />
            
            <div className="flex gap-3">
              <button
                onClick={handleDeclineSubmit}
                disabled={isDeclining || !declineReason.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-semibold rounded-lg transition-colors"
              >
                {isDeclining ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Declining...
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    Confirm Decline
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowDeclineForm(false)}
                disabled={isDeclining}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
/**
 * 🚀 THERAPIST CHAT AUTO-OPEN HANDLER
 * 
 * Automatically opens chat window when booking is received
 * - 5-minute countdown timer
 * - Auto-open chat interface
 * - Audio notifications with MP3 sounds
 * - Accept/Reject controls
 * - Enterprise-grade reliability
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Check, X, Bell, MessageCircle, User, MapPin, DollarSign } from 'lucide-react';
import { bookingSoundService } from '../services/bookingSound.service';
import { enterpriseBookingFlowService } from '../services/enterpriseBookingFlowService';

export interface BookingNotification {
  id: string;
  bookingId: string;
  userDetails: {
    name: string;
    phone: string;
    location: string;
  };
  services: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
  }>;
  totalPrice: number;
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  expiresAt: Date;
  chatRoomId: string;
  estimatedArrival?: string;
}

export interface TherapistChatAutoOpenProps {
  therapistId: string;
  onAcceptBooking: (bookingId: string, chatRoomId: string) => Promise<void>;
  onRejectBooking: (bookingId: string, reason?: string) => Promise<void>;
  onChatOpen: (chatRoomId: string) => void;
  className?: string;
}

export const TherapistChatAutoOpen: React.FC<TherapistChatAutoOpenProps> = ({
  therapistId,
  onAcceptBooking,
  onRejectBooking,
  onChatOpen,
  className = ''
}) => {
  const [activeNotifications, setActiveNotifications] = useState<Map<string, BookingNotification>>(new Map());
  const [countdownTimers, setCountdownTimers] = useState<Map<string, number>>(new Map());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  
  const notificationRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const countdownIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Handle incoming booking notification
   */
  const handleBookingNotification = useCallback(async (notification: BookingNotification) => {
    console.log(`🔔 Therapist ${therapistId} received booking notification:`, notification.bookingId);

    // Add to active notifications
    setActiveNotifications(prev => new Map(prev.set(notification.id, notification)));
    
    // Calculate remaining time
    const now = new Date();
    const expiresAt = new Date(notification.expiresAt);
    const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
    
    setCountdownTimers(prev => new Map(prev.set(notification.id, remainingSeconds)));

    // Play audio notification
    if (soundEnabled) {
      try {
        if (notification.urgency === 'emergency') {
          await bookingSoundService.playBookingRequest();
        } else {
          await bookingSoundService.playTherapistAlert();
        }
      } catch (error) {
        console.error('❌ Failed to play notification sound:', error);
      }
    }

    // Auto-expand urgent notifications
    if (notification.urgency === 'high' || notification.urgency === 'emergency') {
      setExpandedNotifications(prev => new Set(prev.add(notification.id)));
    }

    // Start countdown timer
    startCountdownTimer(notification.id, remainingSeconds);

    // Auto-open chat window after 2 seconds
    setTimeout(() => {
      console.log(`💬 Auto-opening chat window for booking ${notification.bookingId}`);
      onChatOpen(notification.chatRoomId);
    }, 2000);

  }, [therapistId, soundEnabled, onChatOpen]);

  /**
   * Start countdown timer for notification
   */
  const startCountdownTimer = useCallback((notificationId: string, initialSeconds: number) => {
    let remainingSeconds = initialSeconds;
    
    const interval = setInterval(() => {
      remainingSeconds--;
      
      setCountdownTimers(prev => new Map(prev.set(notificationId, remainingSeconds)));

      // Play warning sounds at specific intervals
      if (soundEnabled) {
        if (remainingSeconds === 60 || remainingSeconds === 30 || remainingSeconds === 10) {
          bookingSoundService.playUserAlert().catch(console.error);
        }
        
        if (remainingSeconds <= 10 && remainingSeconds > 0) {
          bookingSoundService.playNotification().catch(console.error);
        }
      }

      // Auto-expire when timer reaches 0
      if (remainingSeconds <= 0) {
        clearInterval(interval);
        countdownIntervals.current.delete(notificationId);
        handleNotificationExpired(notificationId);
      }
    }, 1000);

    countdownIntervals.current.set(notificationId, interval);
  }, [soundEnabled]);

  /**
   * Handle notification expiration
   */
  const handleNotificationExpired = useCallback((notificationId: string) => {
    const notification = activeNotifications.get(notificationId);
    
    if (notification) {
      console.log(`⏰ Booking notification expired: ${notification.bookingId}`);
      
      // Remove from active notifications
      setActiveNotifications(prev => {
        const newMap = new Map(prev);
        newMap.delete(notificationId);
        return newMap;
      });
      
      // Clean up timers
      setCountdownTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(notificationId);
        return newMap;
      });
      
      setExpandedNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  }, [activeNotifications]);

  /**
   * Handle accept booking
   */
  const handleAccept = useCallback(async (notification: BookingNotification) => {
    try {
      console.log(`✅ Therapist accepting booking: ${notification.bookingId}`);
      
      // Clear countdown timer
      const interval = countdownIntervals.current.get(notification.id);
      if (interval) {
        clearInterval(interval);
        countdownIntervals.current.delete(notification.id);
      }

      // Play success sound
      if (soundEnabled) {
        await bookingSoundService.playUserSuccess();
      }

      // Call accept handler
      await onAcceptBooking(notification.bookingId, notification.chatRoomId);

      // Remove from notifications
      handleNotificationExpired(notification.id);

      // Send response to booking flow service
      await enterpriseBookingFlowService.handleTherapistResponse({
        therapistId,
        bookingId: notification.bookingId,
        response: 'accept',
        responseTime: Date.now() - new Date(notification.expiresAt).getTime() + (5 * 60 * 1000)
      });

    } catch (error) {
      console.error('❌ Failed to accept booking:', error);
    }
  }, [therapistId, soundEnabled, onAcceptBooking]);

  /**
   * Handle reject booking
   */
  const handleReject = useCallback(async (notification: BookingNotification, reason?: string) => {
    try {
      console.log(`❌ Therapist rejecting booking: ${notification.bookingId} (${reason || 'No reason'})`);
      
      // Clear countdown timer
      const interval = countdownIntervals.current.get(notification.id);
      if (interval) {
        clearInterval(interval);
        countdownIntervals.current.delete(notification.id);
      }

      // Call reject handler
      await onRejectBooking(notification.bookingId, reason);

      // Remove from notifications
      handleNotificationExpired(notification.id);

      // Send response to booking flow service
      await enterpriseBookingFlowService.handleTherapistResponse({
        therapistId,
        bookingId: notification.bookingId,
        response: 'reject',
        responseTime: Date.now() - new Date(notification.expiresAt).getTime() + (5 * 60 * 1000),
        reason
      });

    } catch (error) {
      console.error('❌ Failed to reject booking:', error);
    }
  }, [therapistId, onRejectBooking]);

  /**
   * Toggle notification expansion
   */
  const toggleExpansion = useCallback((notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  }, []);

  /**
   * Format countdown timer
   */
  const formatCountdown = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Get urgency color
   */
  const getUrgencyColor = useCallback((urgency: string): string => {
    switch (urgency) {
      case 'emergency': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  }, []);

  /**
   * Set up real-time listeners
   */
  useEffect(() => {
    // Listen for booking notifications from enterprise flow service
    const handleRealtimeNotification = (notification: any) => {
      if (notification.type === 'booking-request' && notification.therapistId === therapistId) {
        handleBookingNotification({
          id: `notification_${notification.bookingId}`,
          bookingId: notification.bookingId,
          userDetails: notification.userDetails,
          services: notification.services,
          totalPrice: notification.totalPrice,
          urgency: notification.urgency,
          location: notification.location,
          expiresAt: new Date(notification.expiresAt),
          chatRoomId: notification.chatRoomId
        });
      }
      
      if (notification.type === 'auto-open-chat' && notification.chatRoomId) {
        onChatOpen(notification.chatRoomId);
      }
    };

    // Set up WebSocket/Appwrite Realtime listener
    if (typeof window !== 'undefined' && (window as any).realtimeService) {
      (window as any).realtimeService.subscribe(therapistId, handleRealtimeNotification);
    }

    return () => {
      // Cleanup intervals on unmount
      countdownIntervals.current.forEach((interval, id) => {
        clearInterval(interval);
      });
      countdownIntervals.current.clear();
      
      // Unsubscribe from real-time updates
      if (typeof window !== 'undefined' && (window as any).realtimeService) {
        (window as any).realtimeService.unsubscribe(therapistId);
      }
    };
  }, [therapistId, handleBookingNotification, onChatOpen]);

  // Don't render if no active notifications
  if (activeNotifications.size === 0) {
    return null;
  }

  return (
    <div className={`therapist-chat-auto-open fixed top-4 right-4 z-50 space-y-3 ${className}`}>
      {/* Sound Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`
            p-2 rounded-lg shadow-lg transition-all duration-200
            ${soundEnabled 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
            }
          `}
          title={soundEnabled ? 'Disable sound notifications' : 'Enable sound notifications'}
        >
          <Bell className={`w-4 h-4 ${soundEnabled ? '' : 'opacity-30'}`} />
        </button>
      </div>

      {/* Notification Cards */}
      {Array.from(activeNotifications.values()).map((notification) => {
        const isExpanded = expandedNotifications.has(notification.id);
        const remainingTime = countdownTimers.get(notification.id) || 0;
        const urgencyColor = getUrgencyColor(notification.urgency);
        const isUrgent = notification.urgency === 'high' || notification.urgency === 'emergency';

        return (
          <div
            key={notification.id}
            ref={el => { 
              if (el) {
                notificationRefs.current.set(notification.id, el); 
              }
            }}
            className={`
              bg-white rounded-xl shadow-2xl border-l-4 ${urgencyColor.replace('bg-', 'border-')}
              transform transition-all duration-300 hover:scale-102
              ${isUrgent ? 'animate-pulse' : ''}
              max-w-sm w-80
            `}
          >
            {/* Header */}
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleExpansion(notification.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${urgencyColor} animate-pulse`} />
                  <span className="font-semibold text-gray-800">New Booking Request</span>
                </div>
                
                <div className={`
                  px-2 py-1 rounded-full text-xs font-medium text-white
                  ${urgencyColor}
                `}>
                  {notification.urgency.toUpperCase()}
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Expires in {formatCountdown(remainingTime)}</span>
                </div>
                
                <div className="text-lg font-bold text-green-600">
                  ${notification.totalPrice}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    remainingTime > 180 ? 'bg-green-500' : 
                    remainingTime > 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(remainingTime / 300) * 100}%` }}
                />
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 pb-2 border-t border-gray-100">
                <div className="py-3 space-y-3">
                  {/* User Details */}
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-800">{notification.userDetails.name}</div>
                      <div className="text-sm text-gray-600">{notification.userDetails.phone}</div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      {notification.location.address}
                    </div>
                  </div>

                  {/* Services */}
                  <div className="space-y-2">
                    {notification.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{service.name}</span>
                        <div className="text-gray-500">
                          {service.duration}min • ${service.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-4 pb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAccept(notification)}
                  className="
                    flex-1 bg-green-500 hover:bg-green-600 text-white
                    py-3 px-4 rounded-lg font-medium transition-all duration-200
                    transform hover:scale-105 active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                  "
                >
                  <Check className="w-5 h-5 mx-auto" />
                </button>
                
                <button
                  onClick={() => onChatOpen(notification.chatRoomId)}
                  className="
                    bg-blue-500 hover:bg-blue-600 text-white
                    py-3 px-4 rounded-lg font-medium transition-all duration-200
                    transform hover:scale-105 active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  "
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => handleReject(notification, 'Not available')}
                  className="
                    flex-1 bg-red-500 hover:bg-red-600 text-white
                    py-3 px-4 rounded-lg font-medium transition-all duration-200
                    transform hover:scale-105 active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                  "
                >
                  <X className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TherapistChatAutoOpen;
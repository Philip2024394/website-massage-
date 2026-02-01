// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, Eye, CheckCircle } from 'lucide-react';
import BookingBadge from './BookingBadge';

interface BookingNotificationBarProps {
  onViewBooking: (bookingId: string) => void;
  onNavigateToBookings: () => void;
}

const BookingNotificationBar: React.FC<BookingNotificationBarProps> = ({
  onViewBooking,
  onNavigateToBookings
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load notifications
    loadNotifications();

    // Listen for new booking notifications
    const handleNewBooking = (event: CustomEvent) => {
      const booking = event.detail;
      
      // Add to notifications if not pending (pending ones show in modal)
      if (booking.status !== 'pending') {
        const notification = {
          id: booking.id || Date.now().toString(),
          type: 'booking-update',
          title: getNotificationTitle(booking.status),
          message: getNotificationMessage(booking),
          booking: booking,
          timestamp: Date.now(),
          read: false
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5
        setIsVisible(true);
        
        // Auto-hide after 10 seconds for non-urgent updates
        setTimeout(() => {
          if (booking.status !== 'pending') {
            markAsRead(notification.id);
          }
        }, 10000);
      }
    };

    window.addEventListener('NEW_BOOKING', handleNewBooking as EventListener);

    return () => {
      window.removeEventListener('NEW_BOOKING', handleNewBooking as EventListener);
    };
  }, []);

  const loadNotifications = () => {
    try {
      // Get recent booking notifications from localStorage
      const stored = localStorage.getItem('booking_notifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        const recent = notifications
          .filter((n: any) => !n.read && Date.now() - n.timestamp < 24 * 60 * 60 * 1000) // 24 hours
          .slice(0, 5);
        
        setNotifications(recent);
        setIsVisible(recent.length > 0);
      }
    } catch (error) {
      console.warn('Failed to load booking notifications:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      // Update localStorage
      const existing = JSON.parse(localStorage.getItem('booking_notifications') || '[]');
      const updatedStored = existing.map((n: any) => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('booking_notifications', JSON.stringify(updatedStored));
      
      // Hide if no unread notifications
      const hasUnread = updated.some(n => !n.read);
      if (!hasUnread) {
        setIsVisible(false);
      }
      
      return updated.filter(n => !n.read);
    });
  };

  const dismissAll = () => {
    notifications.forEach(n => markAsRead(n.id));
  };

  const getNotificationTitle = (status: string): string => {
    const titles: Record<string, string> = {
      confirmed: '✅ Booking Confirmed',
      completed: '🎉 Service Completed',
      cancelled: '❌ Booking Cancelled'
    };
    return titles[status] || 'Booking Update';
  };

  const getNotificationMessage = (booking: any): string => {
    switch (booking.status) {
      case 'confirmed':
        return `${booking.customerName} - ${booking.date} at ${booking.time}`;
      case 'completed':
        return `Service completed for ${booking.customerName}`;
      case 'cancelled':
        return `Booking cancelled: ${booking.customerName}`;
      default:
        return `Update for ${booking.customerName}`;
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Calendar className="w-5 h-5" />
              <BookingBadge 
                size="sm" 
                className="absolute -top-2 -right-2" 
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">
                Booking Updates ({notifications.length})
              </h4>
              <p className="text-xs text-blue-100">
                {notifications[0]?.message}
                {notifications.length > 1 && ` +${notifications.length - 1} more`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onNavigateToBookings}
              className="bg-blue-400 hover:bg-blue-300 text-white px-3 py-1 rounded text-xs font-medium flex items-center space-x-1"
            >
              <Eye className="w-3 h-3" />
              <span>View All</span>
            </button>
            <button
              onClick={dismissAll}
              className="text-blue-100 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Individual notifications */}
        {notifications.length > 1 && (
          <div className="mt-2 space-y-1 max-h-32 ">
            {notifications.slice(1).map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between bg-blue-400 bg-opacity-50 rounded px-2 py-1"
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-blue-200" />
                  <span className="text-xs">{notification.title}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      onViewBooking(notification.booking.id);
                      markAsRead(notification.id);
                    }}
                    className="text-blue-100 hover:text-white text-xs"
                  >
                    View
                  </button>
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-200 hover:text-white"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingNotificationBar;
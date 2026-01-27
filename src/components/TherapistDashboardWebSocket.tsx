/**
 * 🚀 THERAPIST DASHBOARD WEBSOCKET INTEGRATION
 * 
 * Real-time booking window auto-updates for therapist dashboard:
 * - WebSocket connection for live booking notifications
 * - Automatic booking window refresh
 * - MP3 notifications for new bookings
 * - Scheduled reminder integration
 * - Fallback to polling if WebSocket fails
 * 
 * Integration Points:
 * - TherapistDashboard: Auto-update booking list
 * - BookingNotificationBar: Real-time status updates
 * - PersistentBookingAlerts: Live booking alerts
 * - FloatingChat: Auto-open on new bookings
 */

import React, { useEffect, useState, useCallback } from 'react';
import { enterpriseWebSocketService, useWebSocketConnection, WebSocketMessage } from '../services/enterpriseWebSocketService';
import { enterpriseScheduledReminderService } from '../services/enterpriseScheduledReminderService';
import { bookingSoundService } from '../services/bookingSound.service';
import { appDownloadPromptManager } from '../components/AppDownloadPrompt';

interface TherapistDashboardWebSocketProps {
  therapistId: string;
  isActive: boolean;
  onBookingUpdate?: (booking: any) => void;
  onNewBooking?: (booking: any) => void;
  onReminderReceived?: (reminder: any) => void;
  onConnectionStateChange?: (state: string) => void;
}

export const TherapistDashboardWebSocket: React.FC<TherapistDashboardWebSocketProps> = ({
  therapistId,
  isActive,
  onBookingUpdate,
  onNewBooking,
  onReminderReceived,
  onConnectionStateChange
}) => {
  const [bookingUpdates, setBookingUpdates] = useState<any[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  
  const { connectionState, lastMessage, subscribe } = useWebSocketConnection(therapistId, 'therapist');

  // Notify parent of connection state changes
  useEffect(() => {
    onConnectionStateChange?.(connectionState);
  }, [connectionState, onConnectionStateChange]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage || !isActive) return;

    console.log('🔔 [DASHBOARD_WS] Processing message:', lastMessage);

    switch (lastMessage.type) {
      case 'NEW_BOOKING':
        handleNewBooking(lastMessage.payload);
        break;
        
      case 'BOOKING_UPDATE':
        handleBookingUpdate(lastMessage.payload);
        break;
        
      case 'SCHEDULED_REMINDER':
        handleScheduledReminder(lastMessage.payload);
        break;
        
      case 'SYSTEM_ALERT':
        handleSystemAlert(lastMessage.payload);
        break;
    }
  }, [lastMessage, isActive]);

  const handleNewBooking = useCallback(async (booking: any) => {
    console.log('🆕 [NEW_BOOKING] Therapist dashboard processing new booking:', booking);
    
    try {
      // Update booking list
      setBookingUpdates(prev => [booking, ...prev]);
      setLastUpdateTime(new Date());
      
      // Notify parent component
      onNewBooking?.(booking);
      
      // Trigger booking window refresh
      window.dispatchEvent(new CustomEvent('refresh-booking-window'));
      
      // Play MP3 notification
      await bookingSoundService.playTherapistAlert();
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('New Booking Request!', {
          body: `${booking.urgency === 'urgent' ? 'URGENT: ' : ''}New booking from ${booking.customerName || 'Customer'}`,
          icon: '/icons/new-booking.png',
          badge: '/icons/notification-badge.png',
          tag: `booking-${booking.bookingId}`,
          requireInteraction: true,
          actions: [
            { action: 'accept', title: 'Accept Booking' },
            { action: 'view', title: 'View Details' }
          ]
        });
      }
      
      console.log('✅ [NEW_BOOKING] Processed successfully');
      
    } catch (error) {
      console.error('❌ [NEW_BOOKING] Processing failed:', error);
    }
  }, [onNewBooking]);

  const handleBookingUpdate = useCallback(async (update: any) => {
    console.log('🔄 [BOOKING_UPDATE] Processing update:', update);
    
    try {
      // Update booking in list
      setBookingUpdates(prev => 
        prev.map(booking => 
          booking.bookingId === update.bookingId 
            ? { ...booking, ...update }
            : booking
        )
      );
      setLastUpdateTime(new Date());
      
      // Notify parent component
      onBookingUpdate?.(update);
      
      // Trigger booking window refresh
      window.dispatchEvent(new CustomEvent('refresh-booking-window'));
      
      // Play appropriate sound
      if (update.status === 'accepted') {
        await bookingSoundService.playUserSuccess();
      } else if (update.status === 'cancelled') {
        await bookingSoundService.playBookingCancellation();
      }
      
      console.log('✅ [BOOKING_UPDATE] Processed successfully');
      
    } catch (error) {
      console.error('❌ [BOOKING_UPDATE] Processing failed:', error);
    }
  }, [onBookingUpdate]);

  const handleScheduledReminder = useCallback(async (reminder: any) => {
    console.log('⏰ [SCHEDULED_REMINDER] Processing reminder:', reminder);
    
    try {
      // Notify parent component
      onReminderReceived?.(reminder);
      
      // Play scheduled booking MP3 notification
      await bookingSoundService.playScheduledBookingSequence();
      
      // Show reminder notification
      const reminderText = {
        'therapist_5h': 'Your booking is in 5 hours',
        'therapist_4h': 'Your booking is in 4 hours',
        'therapist_3h': 'Your booking is in 3 hours',
        'therapist_2h': 'Your booking is in 2 hours - Please prepare!',
        'therapist_1h': 'Your booking is in 1 hour - Get ready!'
      };
      
      const isUrgent = ['therapist_2h', 'therapist_1h'].includes(reminder.reminderType);
      
      if (Notification.permission === 'granted') {
        new Notification('Booking Reminder', {
          body: `${reminderText[reminder.reminderType]}\n${reminder.bookingDetails.customerName} - ${reminder.bookingDetails.location}`,
          icon: '/icons/reminder-notification.png',
          badge: '/icons/notification-badge.png',
          tag: `reminder-${reminder.bookingId}-${reminder.reminderType}`,
          requireInteraction: isUrgent,
          vibrate: isUrgent ? [200, 100, 200, 100, 200] : [100, 50, 100],
          actions: [
            { action: 'view', title: 'View Booking' },
            { action: 'contact', title: 'Contact Customer' }
          ]
        });
      }
      
      // Trigger dashboard reminder badge update
      window.dispatchEvent(new CustomEvent('reminder-received', {
        detail: reminder
      }));
      
      console.log('✅ [SCHEDULED_REMINDER] Processed successfully');
      
    } catch (error) {
      console.error('❌ [SCHEDULED_REMINDER] Processing failed:', error);
    }
  }, [onReminderReceived]);

  const handleSystemAlert = useCallback(async (alert: any) => {
    console.log('🚨 [SYSTEM_ALERT] Processing alert:', alert);
    
    try {
      // Play system alert sound
      await bookingSoundService.playUserAlert();
      
      // Show system notification
      if (Notification.permission === 'granted') {
        new Notification('System Alert', {
          body: alert.message,
          icon: '/icons/system-alert.png',
          badge: '/icons/notification-badge.png',
          tag: `system-${Date.now()}`,
          requireInteraction: true
        });
      }
      
      console.log('✅ [SYSTEM_ALERT] Processed successfully');
      
    } catch (error) {
      console.error('❌ [SYSTEM_ALERT] Processing failed:', error);
    }
  }, []);

  // Render connection status (for debugging)
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
        connectionState === 'connected' 
          ? 'bg-green-100 text-green-800' 
          : connectionState === 'connecting'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800'
      }`}>
        🔌 {connectionState} • Updates: {bookingUpdates.length}
      </div>
    </div>
  );
};

/**
 * Customer WebSocket Integration for booking updates
 */
interface CustomerWebSocketProps {
  customerId: string;
  isActive: boolean;
  onBookingUpdate?: (booking: any) => void;
  onReminderReceived?: (reminder: any) => void;
}

export const CustomerWebSocket: React.FC<CustomerWebSocketProps> = ({
  customerId,
  isActive,
  onBookingUpdate,
  onReminderReceived
}) => {
  const { connectionState, lastMessage } = useWebSocketConnection(customerId, 'customer');

  useEffect(() => {
    if (!lastMessage || !isActive) return;

    console.log('📱 [CUSTOMER_WS] Processing message:', lastMessage);

    switch (lastMessage.type) {
      case 'BOOKING_UPDATE':
        handleBookingUpdate(lastMessage.payload);
        break;
        
      case 'SCHEDULED_REMINDER':
        handleCustomerReminder(lastMessage.payload);
        break;
    }
  }, [lastMessage, isActive]);

  const handleBookingUpdate = useCallback(async (update: any) => {
    console.log('🔄 [CUSTOMER_BOOKING_UPDATE] Processing update:', update);
    
    try {
      onBookingUpdate?.(update);
      
      // Play success sound for booking acceptance
      if (update.status === 'accepted') {
        await bookingSoundService.playUserSuccess();
        
        // Show success notification
        if (Notification.permission === 'granted') {
          new Notification('Booking Confirmed!', {
            body: `Your booking has been accepted by ${update.therapistName || 'therapist'}`,
            icon: '/icons/booking-confirmed.png',
            badge: '/icons/notification-badge.png',
            tag: `booking-confirmed-${update.bookingId}`
          });
        }
      }
      
    } catch (error) {
      console.error('❌ [CUSTOMER_BOOKING_UPDATE] Processing failed:', error);
    }
  }, [onBookingUpdate]);

  const handleCustomerReminder = useCallback(async (reminder: any) => {
    console.log('⏰ [CUSTOMER_REMINDER] Processing reminder:', reminder);
    
    try {
      onReminderReceived?.(reminder);
      
      // Play customer reminder sound
      await bookingSoundService.playScheduledReminderAlert();
      
      // Show app download prompt
      appDownloadPromptManager.show({
        bookingId: reminder.bookingId,
        message: `Your massage is in 3 hours! Download our app for MP3 notifications.`,
        urgency: 'normal',
        scheduledTime: reminder.scheduledTime,
        therapistName: reminder.bookingDetails.therapistName,
        services: reminder.bookingDetails.services
      });
      
      // Show reminder notification
      if (Notification.permission === 'granted') {
        new Notification('Your Massage in 3 Hours!', {
          body: `${reminder.bookingDetails.therapistName} - ${reminder.bookingDetails.location}\nDownload our app for better experience!`,
          icon: '/icons/customer-reminder.png',
          badge: '/icons/notification-badge.png',
          tag: `customer-reminder-${reminder.bookingId}`,
          actions: [
            { action: 'download', title: 'Download App' },
            { action: 'view', title: 'View Booking' }
          ]
        });
      }
      
    } catch (error) {
      console.error('❌ [CUSTOMER_REMINDER] Processing failed:', error);
    }
  }, [onReminderReceived]);

  return null; // Customer WebSocket is invisible
};

/**
 * Booking Window Auto-Update Component
 * Listens for WebSocket events and refreshes booking displays
 */
export const BookingWindowAutoUpdate: React.FC<{
  onRefresh?: () => void;
}> = ({ onRefresh }) => {
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 [AUTO_UPDATE] Refreshing booking window...');
      onRefresh?.();
      
      // Trigger refresh of all booking-related components
      window.dispatchEvent(new CustomEvent('booking-data-updated'));
    };

    // Listen for WebSocket-triggered refreshes
    window.addEventListener('refresh-booking-window', handleRefresh);
    window.addEventListener('booking-window-update', handleRefresh);
    
    return () => {
      window.removeEventListener('refresh-booking-window', handleRefresh);
      window.removeEventListener('booking-window-update', handleRefresh);
    };
  }, [onRefresh]);

  return null; // Invisible component
};

export default TherapistDashboardWebSocket;
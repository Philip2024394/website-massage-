/**
 * RealTimeNotificationEnhancer Component
 * Enhanced real-time notifications with multiple delivery methods and smart prioritization
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  BellRing, 
  Volume2, 
  VolumeX,
  Smartphone, 
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  X,
  Settings
} from 'lucide-react';
import { BookingProgressStep } from './BookingProgressStepper';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType = 'status_update' | 'message' | 'reminder' | 'error' | 'success' | 'info';
export type DeliveryMethod = 'in_app' | 'push' | 'sms' | 'email' | 'sound';

interface NotificationConfig {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  deliveryMethods: DeliveryMethod[];
  autoClose?: boolean;
  closeAfter?: number; // milliseconds
  sound?: string;
  vibration?: boolean;
  persistent?: boolean;
  actionButtons?: NotificationAction[];
  metadata?: Record<string, any>;
}

interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

interface RealTimeNotificationEnhancerProps {
  bookingStatus: BookingProgressStep;
  onNotificationAction?: (actionId: string, notificationId: string) => void;
  soundEnabled?: boolean;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
  emailEnabled?: boolean;
  maxNotifications?: number;
}

export const RealTimeNotificationEnhancer: React.FC<RealTimeNotificationEnhancerProps> = ({
  bookingStatus,
  onNotificationAction,
  soundEnabled = true,
  pushEnabled = true,
  smsEnabled = false,
  emailEnabled = true,
  maxNotifications = 5
}) => {
  const [notifications, setNotifications] = useState<NotificationConfig[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    sound: soundEnabled,
    push: pushEnabled,
    sms: smsEnabled,
    email: emailEnabled,
    doNotDisturb: false,
    quietHours: { start: '22:00', end: '08:00' }
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const notificationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Sound files for different notification types
  const notificationSounds = {
    status_update: '/sounds/status-update.mp3',
    message: '/sounds/message.mp3',
    reminder: '/sounds/reminder.mp3',
    error: '/sounds/error.mp3',
    success: '/sounds/success.mp3',
    info: '/sounds/info.mp3'
  };

  // Add notification function
  const addNotification = (config: Omit<NotificationConfig, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const notification: NotificationConfig = { ...config, id };
    
    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, maxNotifications);
      return updated;
    });
    
    // Handle delivery methods
    handleNotificationDelivery(notification);
    
    // Auto-close timer
    if (notification.autoClose && notification.closeAfter) {
      const timeout = setTimeout(() => {
        removeNotification(id);
      }, notification.closeAfter);
      notificationTimeouts.current.set(id, timeout);
    }
    
    return id;
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    const timeout = notificationTimeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      notificationTimeouts.current.delete(id);
    }
  };

  // Handle different delivery methods
  const handleNotificationDelivery = async (notification: NotificationConfig) => {
    const { deliveryMethods, type, title, message, sound, vibration } = notification;
    
    // Check quiet hours
    if (isQuietHours() && notification.priority !== 'urgent') {
      return;
    }
    
    // In-app notification is always shown
    if (deliveryMethods.includes('in_app')) {
      // Already handled by adding to notifications state
    }
    
    // Sound notification
    if (deliveryMethods.includes('sound') && userPreferences.sound && !userPreferences.doNotDisturb) {
      playNotificationSound(sound || notificationSounds[type]);
    }
    
    // Vibration (if supported)
    if (vibration && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // Push notification
    if (deliveryMethods.includes('push') && userPreferences.push) {
      await sendPushNotification(title, message, notification);
    }
    
    // SMS notification
    if (deliveryMethods.includes('sms') && userPreferences.sms) {
      await sendSMSNotification(title, message);
    }
    
    // Email notification
    if (deliveryMethods.includes('email') && userPreferences.email) {
      await sendEmailNotification(title, message, notification);
    }
  };

  // Play notification sound
  const playNotificationSound = (soundUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = soundUrl;
      audioRef.current.play().catch(error => {
        console.warn('Failed to play notification sound:', error);
      });
    }
  };

  // Send push notification
  const sendPushNotification = async (title: string, body: string, config: NotificationConfig) => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: config.id,
        requireInteraction: config.persistent,
        silent: userPreferences.doNotDisturb
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await sendPushNotification(title, body, config);
      }
    }
  };

  // Send SMS notification (would integrate with SMS API)
  const sendSMSNotification = async (title: string, message: string) => {
    try {
      // Integration with SMS service (Twilio, etc.)
      console.log('SMS notification:', { title, message });
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  };

  // Send email notification (would integrate with email API)
  const sendEmailNotification = async (title: string, message: string, config: NotificationConfig) => {
    try {
      // Integration with email service (SendGrid, etc.)
      console.log('Email notification:', { title, message, config });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  // Check if current time is within quiet hours
  const isQuietHours = (): boolean => {
    if (userPreferences.doNotDisturb) return true;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = userPreferences.quietHours;
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      return currentTime >= start || currentTime <= end;
    }
  };

  // Status-specific notifications
  useEffect(() => {
    const statusNotifications: Record<BookingProgressStep, () => void> = {
      requested: () => addNotification({
        type: 'status_update',
        priority: 'medium',
        title: 'Booking Requested',
        message: 'Your massage booking has been sent to nearby therapists.',
        deliveryMethods: ['in_app', 'push'],
        autoClose: true,
        closeAfter: 5000
      }),
      
      accepted: () => addNotification({
        type: 'status_update',
        priority: 'high',
        title: 'Booking Accepted!',
        message: 'A therapist has accepted your booking request.',
        deliveryMethods: ['in_app', 'push', 'sound'],
        sound: notificationSounds.success,
        vibration: true,
        autoClose: true,
        closeAfter: 8000,
        actionButtons: [{
          id: 'view_therapist',
          label: 'View Therapist',
          action: () => console.log('View therapist clicked'),
          style: 'primary'
        }]
      }),
      
      confirmed: () => addNotification({
        type: 'status_update',
        priority: 'medium',
        title: 'Booking Confirmed',
        message: 'Your massage booking has been confirmed.',
        deliveryMethods: ['in_app', 'email'],
        autoClose: true,
        closeAfter: 5000
      }),
      
      preparing: () => addNotification({
        type: 'status_update',
        priority: 'medium',
        title: 'Therapist Preparing',
        message: 'Your therapist is preparing equipment and will depart soon.',
        deliveryMethods: ['in_app', 'push'],
        autoClose: true,
        closeAfter: 6000
      }),
      
      en_route: () => addNotification({
        type: 'status_update',
        priority: 'high',
        title: 'Therapist En Route',
        message: 'Your therapist is on the way to your location.',
        deliveryMethods: ['in_app', 'push', 'sound'],
        sound: notificationSounds.status_update,
        vibration: true,
        persistent: true,
        actionButtons: [{
          id: 'track_therapist',
          label: 'Track Location',
          action: () => console.log('Track therapist clicked'),
          style: 'primary'
        }]
      }),
      
      arrived: () => addNotification({
        type: 'status_update',
        priority: 'urgent',
        title: 'Therapist Arrived!',
        message: 'Your therapist has arrived at your location.',
        deliveryMethods: ['in_app', 'push', 'sound', 'sms'],
        sound: notificationSounds.success,
        vibration: true,
        persistent: true,
        actionButtons: [{
          id: 'confirm_arrival',
          label: 'Confirm',
          action: () => console.log('Confirm arrival clicked'),
          style: 'primary'
        }]
      }),
      
      in_progress: () => addNotification({
        type: 'status_update',
        priority: 'low',
        title: 'Session Started',
        message: 'Your massage session has begun. Enjoy and relax!',
        deliveryMethods: ['in_app'],
        autoClose: true,
        closeAfter: 4000
      }),
      
      completed: () => addNotification({
        type: 'success',
        priority: 'medium',
        title: 'Session Completed',
        message: 'Your massage session has ended. Please rate your experience.',
        deliveryMethods: ['in_app', 'push', 'email'],
        sound: notificationSounds.success,
        actionButtons: [{
          id: 'rate_session',
          label: 'Rate & Review',
          action: () => console.log('Rate session clicked'),
          style: 'primary'
        }]
      })
    };

    // Trigger status-specific notification
    if (statusNotifications[bookingStatus]) {
      statusNotifications[bookingStatus]();
    }
  }, [bookingStatus]);

  // Get notification styling based on type and priority
  const getNotificationStyle = (type: NotificationType, priority: NotificationPriority) => {
    const baseClasses = 'border-l-4 transition-all duration-300 hover:shadow-lg';
    
    const priorityClasses = {
      low: 'bg-gray-50 border-l-gray-400',
      medium: 'bg-blue-50 border-l-blue-500',
      high: 'bg-yellow-50 border-l-yellow-500',
      urgent: 'bg-red-50 border-l-red-500 animate-pulse'
    };
    
    const typeIcons = {
      status_update: <Bell className="w-5 h-5" />,
      message: <MessageSquare className="w-5 h-5" />,
      reminder: <Clock className="w-5 h-5" />,
      error: <AlertTriangle className="w-5 h-5" />,
      success: <CheckCircle className="w-5 h-5" />,
      info: <Info className="w-5 h-5" />
    };
    
    return {
      className: `${baseClasses} ${priorityClasses[priority]}`,
      icon: typeIcons[type]
    };
  };

  return (
    <>
      {/* Audio element for sound notifications */}
      <audio ref={audioRef} preload="none" />
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {notifications.map(notification => {
          const style = getNotificationStyle(notification.type, notification.priority);
          
          return (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg ${style.className}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="text-gray-600 mt-0.5">
                    {style.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {notification.title}
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      {notification.message}
                    </p>
                    
                    {/* Action buttons */}
                    {notification.actionButtons && (
                      <div className="flex gap-2 mt-3">
                        {notification.actionButtons.map(button => (
                          <button
                            key={button.id}
                            onClick={() => {
                              button.action();
                              onNotificationAction?.(button.id, notification.id);
                            }}
                            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                              button.style === 'primary'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : button.style === 'danger'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                          >
                            {button.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {!notification.persistent && (
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
/**
 * RealTimeNotificationEnhancer Component
 * Enhanced real-time notifications with multiple delivery methods and smart prioritization
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, BellRing, Volume, VolumeOff, Phone, Mail, MessageSquare, AlertTriangle, CheckCircle, Info, Clock, X, Settings} from 'lucide-react';
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
  
  // Facebook/Amazon Standard: Enhanced state management
  const [escalationState, setEscalationState] = useState<Map<string, number>>(new Map());
  const [failedNotifications, setFailedNotifications] = useState<Set<string>>(new Set());
  const [retryTimeouts, setRetryTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const [connectionHealth, setConnectionHealth] = useState<'healthy' | 'degraded' | 'offline'>('healthy');
  // 🆕 ELITE FIX: Track acknowledged notifications to prevent audio spam
  const [acknowledgedNotifications, setAcknowledgedNotifications] = useState<Set<string>>(new Set());
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const notificationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const escalationIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const audioContext = useRef<AudioContext | null>(null);

  // Sound files for different notification types
  const notificationSounds = {
    status_update: '/sounds/status-update.mp3',
    message: '/sounds/message.mp3',
    reminder: '/sounds/reminder.mp3',
    error: '/sounds/error.mp3',
    success: '/sounds/success.mp3',
    info: '/sounds/info.mp3'
  };

  // Add notification function with Facebook/Amazon standard escalation
  const addNotification = (config: Omit<NotificationConfig, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const notification: NotificationConfig = { ...config, id };
    
    console.log('📢 Adding notification with escalation capability:', notification);
    
    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, maxNotifications);
      return updated;
    });
    
    // Handle delivery methods with retry logic
    handleNotificationDelivery(notification);
    
    // Facebook/Amazon Standard: Start escalation for critical notifications
    if (config.priority === 'urgent' || config.priority === 'high') {
      console.log('🚨 Starting escalation for critical notification:', id);
      setTimeout(() => escalateNotification(id), 10000); // Start escalation after 10 seconds
    }
    
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
  const removeNotification = (id: string, acknowledged: boolean = false) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // 🆕 ELITE FIX: Track acknowledged notifications to prevent audio spam
    if (acknowledged) {
      setAcknowledgedNotifications(prev => new Set([...prev, id]));
      console.log('✅ Notification acknowledged:', id);
    }
    
    const timeout = notificationTimeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      notificationTimeouts.current.delete(id);
    }

    // 🆕 ELITE FIX: Clear all escalation timeouts for this notification
    escalationIntervals.current.forEach((timeout, key) => {
      if (key.startsWith(id)) {
        clearTimeout(timeout);
        escalationIntervals.current.delete(key);
      }
    });
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

  // Facebook/Amazon Standard: Notification escalation with exponential backoff
  const escalateNotification = (notificationId: string, attempt: number = 1) => {
    // 🆕 ELITE FIX: Check if notification already acknowledged (prevent audio spam)
    if (acknowledgedNotifications.has(notificationId)) {
      console.log('✅ Notification already acknowledged, skipping escalation:', notificationId);
      return;
    }

    const maxAttempts = 5;
    const baseDelay = 5000; // 5 seconds
    const maxDelay = 60000; // 1 minute
    
    if (attempt > maxAttempts) {
      console.error('🚨 CRITICAL: Notification escalation failed after max attempts:', notificationId);
      setFailedNotifications(prev => new Set([...prev, notificationId]));
      return;
    }
    
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    console.log(`🔄 Escalating notification ${notificationId}, attempt ${attempt}, delay: ${delay}ms`);
    
    const timeout = setTimeout(() => {
      // 🆕 ELITE FIX: Double-check acknowledgment before retry
      if (acknowledgedNotifications.has(notificationId)) {
        console.log('✅ Notification acknowledged during escalation, stopping:', notificationId);
        return;
      }

      // Retry notification with escalated priority
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !document.hidden && !isQuietHours()) {
        playEnhancedSound(notification.priority === 'urgent' ? 'critical' : 'urgent');
        
        // Vibrate with escalating pattern
        if ('vibrate' in navigator) {
          const pattern = Array(attempt).fill([300, 200]).flat();
          navigator.vibrate(pattern);
        }
        
        // Schedule next escalation
        escalateNotification(notificationId, attempt + 1);
      }
    }, delay);
    
    escalationIntervals.current.set(`${notificationId}-${attempt}`, timeout);
  };
  
  // Enhanced cross-browser audio system
  const playEnhancedSound = async (urgency: 'normal' | 'urgent' | 'critical' = 'normal') => {
    try {
      // Method 1: HTML Audio API
      if (audioRef.current && userPreferences.sound) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        return;
      }
      
      // Method 2: Web Audio API fallback
      if (!audioContext.current && window.AudioContext) {
        audioContext.current = new AudioContext();
      }
      
      if (audioContext.current) {
        const oscillator = audioContext.current.createOscillator();
        const gainNode = audioContext.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.current.destination);
        
        // Different frequencies for urgency levels
        const frequency = urgency === 'critical' ? 1000 : urgency === 'urgent' ? 800 : 600;
        oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.current.currentTime + 0.3);
      }
    } catch (error) {
      console.warn('🔊 Enhanced audio failed:', error);
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
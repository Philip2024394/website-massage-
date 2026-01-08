/**
 * useNotifications Hook
 * 
 * Purpose: Manages toast-style notifications for chat events
 * Data Flow: Event triggers → Notification queue → Auto-dismiss → UI display
 * 
 * Features:
 * - Queue multiple notifications
 * - Auto-dismiss after timeout
 * - Different notification types (info, success, warning, error)
 * - Manual dismiss capability
 * - Sound alerts for important events
 */

import { useState, useCallback } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  autoClose: boolean;
  duration: number; // ms
}

interface UseNotificationsReturn {
  notifications: Notification[];
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    options?: { autoClose?: boolean; duration?: number }
  ) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add new notification
  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    options?: { autoClose?: boolean; duration?: number }
  ) => {
    const id = `notification_${Date.now()}_${Math.random()}`;
    const autoClose = options?.autoClose !== false; // default true
    const duration = options?.duration || 3000; // default 3 seconds

    const notification: Notification = {
      id,
      type,
      title,
      message,
      timestamp: Date.now(),
      autoClose,
      duration
    };

    console.log('🔔 [useNotifications] Adding notification:', notification);

    setNotifications(prev => [...prev, notification]);

    // Play sound for certain types
    if (type === 'success' || type === 'warning' || type === 'error') {
      playNotificationSound(type);
    }

    // Auto-dismiss if enabled
    if (autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    console.log('🗑️ [useNotifications] Removing notification:', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    console.log('🗑️ [useNotifications] Clearing all notifications');
    setNotifications([]);
  }, []);

  // Play notification sound
  const playNotificationSound = (type: NotificationType) => {
    try {
      // Check if audio is available
      if (typeof Audio === 'undefined') return;

      // Use different sounds for different types
      const soundUrls: Record<NotificationType, string> = {
        info: '/sounds/notification-info.mp3',
        success: '/sounds/notification-success.mp3',
        warning: '/sounds/notification-warning.mp3',
        error: '/sounds/notification-error.mp3'
      };

      const audio = new Audio(soundUrls[type]);
      audio.volume = 0.5;
      audio.play().catch(err => {
        console.warn('⚠️ [useNotifications] Could not play sound:', err);
      });
    } catch (err) {
      console.warn('⚠️ [useNotifications] Error playing sound:', err);
    }
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
}

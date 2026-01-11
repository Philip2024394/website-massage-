/**
 * Notification Analytics Service
 * 
 * Tracks notification delivery rates, audio playback success, and user engagement
 * for the Therapist Dashboard. Sends batched analytics to admin dashboard.
 * 
 * Features:
 * - Audio playback success/failure tracking
 * - Notification delivery tracking
 * - User engagement metrics
 * - Automatic batching (every 5 minutes)
 * - Offline queue support
 */

import { client, APPWRITE_CONFIG } from './appwrite/config';
import { ID } from 'appwrite';

interface AnalyticsEvent {
  event: string;
  type?: string;
  soundType?: string;
  therapistId?: string;
  error?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface AnalyticsMetrics {
  totalNotifications: number;
  audioPlaySuccesses: number;
  audioPlayFailures: number;
  notificationsByType: Record<string, number>;
  failuresBySound: Record<string, number>;
  lastSyncTime: number;
}

class NotificationAnalytics {
  private events: AnalyticsEvent[] = [];
  private metrics: AnalyticsMetrics = {
    totalNotifications: 0,
    audioPlaySuccesses: 0,
    audioPlayFailures: 0,
    notificationsByType: {},
    failuresBySound: {},
    lastSyncTime: Date.now()
  };
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_EVENTS = 1000; // Max events to keep in memory

  constructor() {
    this.loadStoredEvents();
    this.startAutoSync();
  }

  /**
   * Track when a notification is sent
   */
  trackNotificationSent(type: string, therapistId: string, metadata?: Record<string, any>) {
    this.events.push({
      event: 'notification_sent',
      type,
      therapistId,
      timestamp: Date.now(),
      metadata
    });

    this.metrics.totalNotifications++;
    this.metrics.notificationsByType[type] = (this.metrics.notificationsByType[type] || 0) + 1;
    
    this.persistEvents();
    console.log(`📊 Analytics: Notification sent (${type})`);
  }

  /**
   * Track successful audio playback
   */
  trackAudioPlaySuccess(soundType: string, therapistId?: string) {
    this.events.push({
      event: 'audio_play_success',
      soundType,
      therapistId,
      timestamp: Date.now()
    });

    this.metrics.audioPlaySuccesses++;
    
    this.persistEvents();
    console.log(`📊 Analytics: Audio play success (${soundType})`);
  }

  /**
   * Track audio playback failures
   */
  trackAudioPlayFailure(soundType: string, error: string, therapistId?: string) {
    this.events.push({
      event: 'audio_play_failure',
      soundType,
      error,
      therapistId,
      timestamp: Date.now()
    });

    this.metrics.audioPlayFailures++;
    this.metrics.failuresBySound[soundType] = (this.metrics.failuresBySound[soundType] || 0) + 1;
    
    this.persistEvents();
    console.warn(`📊 Analytics: Audio play failure (${soundType}):`, error);
  }

  /**
   * Track notification clicked/opened
   */
  trackNotificationClicked(type: string, therapistId: string) {
    this.events.push({
      event: 'notification_clicked',
      type,
      therapistId,
      timestamp: Date.now()
    });
    
    this.persistEvents();
    console.log(`📊 Analytics: Notification clicked (${type})`);
  }

  /**
   * Track notification dismissed
   */
  trackNotificationDismissed(type: string, therapistId: string) {
    this.events.push({
      event: 'notification_dismissed',
      type,
      therapistId,
      timestamp: Date.now()
    });
    
    this.persistEvents();
    console.log(`📊 Analytics: Notification dismissed (${type})`);
  }

  /**
   * Get current metrics summary
   */
  getMetrics(): AnalyticsMetrics {
    return { ...this.metrics };
  }

  /**
   * Get audio playback success rate
   */
  getAudioSuccessRate(): number {
    const total = this.metrics.audioPlaySuccesses + this.metrics.audioPlayFailures;
    if (total === 0) return 100;
    return (this.metrics.audioPlaySuccesses / total) * 100;
  }

  /**
   * Send batched events to admin dashboard
   */
  async sendBatchToServer(): Promise<void> {
    if (this.events.length === 0) {
      console.log('📊 Analytics: No events to sync');
      return;
    }

    try {
      console.log(`📊 Analytics: Syncing ${this.events.length} events to server...`);
      
      // Send to analytics collection in Appwrite
      const batch = {
        events: this.events,
        metrics: this.metrics,
        timestamp: Date.now(),
        source: 'therapist-dashboard'
      };

      await client.databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.analytics || 'analytics',
        ID.unique(),
        batch
      );

      console.log(`✅ Analytics: Sent ${this.events.length} events to server`);
      
      // Clear sent events
      this.events = [];
      this.metrics.lastSyncTime = Date.now();
      this.persistEvents();
      
    } catch (error) {
      console.error('❌ Analytics: Failed to sync to server:', error);
      
      // Keep events for retry, but trim if too many
      if (this.events.length > this.MAX_EVENTS) {
        this.events = this.events.slice(-this.MAX_EVENTS);
        this.persistEvents();
      }
    }
  }

  /**
   * Persist events to localStorage for offline support
   */
  private persistEvents(): void {
    try {
      localStorage.setItem('notification_analytics_events', JSON.stringify(this.events));
      localStorage.setItem('notification_analytics_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Failed to persist analytics events:', error);
    }
  }

  /**
   * Load stored events from localStorage
   */
  private loadStoredEvents(): void {
    try {
      const eventsStr = localStorage.getItem('notification_analytics_events');
      const metricsStr = localStorage.getItem('notification_analytics_metrics');
      
      if (eventsStr) {
        this.events = JSON.parse(eventsStr);
        console.log(`📊 Analytics: Loaded ${this.events.length} stored events`);
      }
      
      if (metricsStr) {
        this.metrics = JSON.parse(metricsStr);
        console.log(`📊 Analytics: Loaded stored metrics`);
      }
    } catch (error) {
      console.error('Failed to load stored analytics:', error);
    }
  }

  /**
   * Start automatic sync every 5 minutes
   */
  private startAutoSync(): void {
    this.syncInterval = setInterval(() => {
      this.sendBatchToServer();
    }, this.BATCH_INTERVAL);
    
    console.log('📊 Analytics: Auto-sync started (every 5 minutes)');
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('📊 Analytics: Auto-sync stopped');
    }
  }

  /**
   * Force immediate sync
   */
  async forceSync(): Promise<void> {
    console.log('📊 Analytics: Force syncing...');
    await this.sendBatchToServer();
  }

  /**
   * Clear all stored events and metrics
   */
  clear(): void {
    this.events = [];
    this.metrics = {
      totalNotifications: 0,
      audioPlaySuccesses: 0,
      audioPlayFailures: 0,
      notificationsByType: {},
      failuresBySound: {},
      lastSyncTime: Date.now()
    };
    
    localStorage.removeItem('notification_analytics_events');
    localStorage.removeItem('notification_analytics_metrics');
    
    console.log('📊 Analytics: Cleared all events and metrics');
  }
}

// Export singleton instance
export const notificationAnalytics = new NotificationAnalytics();

// Export class for testing
export { NotificationAnalytics };

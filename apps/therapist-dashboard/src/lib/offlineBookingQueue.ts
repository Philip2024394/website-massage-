/**
 * Offline Booking Queue Service
 * 
 * Queue booking accepts/rejects when offline, sync when online.
 * Ensures therapists can respond to bookings even with poor connectivity.
 * 
 * Features:
 * - Queue booking actions when offline
 * - Automatic sync when connection restored
 * - Retry failed operations
 * - Persistent storage across sessions
 * - Background sync support
 */

import { bookingService } from './bookingService';

interface QueuedBookingAction {
  id: string;
  action: 'accept' | 'reject';
  bookingId: string;
  timestamp: number;
  retries: number;
  therapistId: string;
  reason?: string;
  metadata?: Record<string, any>;
}

interface QueueStats {
  total: number;
  pending: number;
  failed: number;
  synced: number;
  lastSyncAttempt: number;
}

class OfflineBookingQueue {
  private queue: QueuedBookingAction[] = [];
  private failedActions: QueuedBookingAction[] = [];
  private syncedCount: number = 0;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL = 30 * 1000; // 30 seconds

  constructor() {
    this.loadQueue();
    this.startAutoSync();
    this.setupOnlineListener();
  }

  /**
   * Queue a booking action (accept or reject)
   */
  queueAction(
    action: 'accept' | 'reject',
    bookingId: string,
    therapistId: string,
    reason?: string,
    metadata?: Record<string, any>
  ): string {
    const queueItem: QueuedBookingAction = {
      id: `${action}_${bookingId}_${Date.now()}`,
      action,
      bookingId,
      timestamp: Date.now(),
      retries: 0,
      therapistId,
      reason,
      metadata
    };

    this.queue.push(queueItem);
    this.persistQueue();
    
    console.log(`📥 Offline Queue: Added ${action} for booking ${bookingId}`);

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncQueue();
    }

    return queueItem.id;
  }

  /**
   * Sync all queued actions
   */
  async syncQueue(): Promise<void> {
    if (this.isSyncing) {
      console.log('📤 Offline Queue: Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('📴 Offline Queue: Device is offline, skipping sync');
      return;
    }

    if (this.queue.length === 0) {
      console.log('📤 Offline Queue: No items to sync');
      return;
    }

    this.isSyncing = true;
    console.log(`📤 Offline Queue: Syncing ${this.queue.length} items...`);

    const itemsToSync = [...this.queue];
    
    for (const item of itemsToSync) {
      try {
        await this.syncItem(item);
        
        // Remove from queue on success
        this.removeFromQueue(item.id);
        this.syncedCount++;
        
        console.log(`✅ Offline Queue: Synced ${item.action} for booking ${item.bookingId}`);
        
      } catch (error) {
        console.error(`❌ Offline Queue: Failed to sync ${item.action} for booking ${item.bookingId}:`, error);
        
        // Increment retry count
        item.retries++;
        
        if (item.retries >= this.MAX_RETRIES) {
          console.error(`❌ Offline Queue: Max retries reached for booking ${item.bookingId}, moving to failed queue`);
          this.removeFromQueue(item.id);
          this.failedActions.push(item);
        }
        
        this.persistQueue();
      }
    }

    this.isSyncing = false;
    this.persistQueue();
    
    console.log(`📤 Offline Queue: Sync complete. ${this.syncedCount} items synced, ${this.queue.length} remaining, ${this.failedActions.length} failed`);
  }

  /**
   * Sync a single item
   */
  private async syncItem(item: QueuedBookingAction): Promise<void> {
    if (item.action === 'accept') {
      await bookingService.acceptBooking(item.bookingId, item.therapistId);
    } else if (item.action === 'reject') {
      await bookingService.rejectBooking(item.bookingId, item.therapistId, item.reason);
    }
  }

  /**
   * Remove item from queue by ID
   */
  private removeFromQueue(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id);
  }

  /**
   * Retry all failed actions
   */
  async retryFailed(): Promise<void> {
    if (this.failedActions.length === 0) {
      console.log('📤 Offline Queue: No failed actions to retry');
      return;
    }

    console.log(`🔄 Offline Queue: Retrying ${this.failedActions.length} failed actions...`);
    
    // Move failed items back to queue with reset retry count
    const itemsToRetry = this.failedActions.map(item => ({
      ...item,
      retries: 0
    }));
    
    this.queue.push(...itemsToRetry);
    this.failedActions = [];
    this.persistQueue();
    
    // Attempt sync
    await this.syncQueue();
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return {
      total: this.queue.length + this.failedActions.length + this.syncedCount,
      pending: this.queue.length,
      failed: this.failedActions.length,
      synced: this.syncedCount,
      lastSyncAttempt: Date.now()
    };
  }

  /**
   * Check if a booking has a queued action
   */
  hasQueuedAction(bookingId: string): QueuedBookingAction | null {
    return this.queue.find(item => item.bookingId === bookingId) || null;
  }

  /**
   * Get all queued actions
   */
  getQueue(): QueuedBookingAction[] {
    return [...this.queue];
  }

  /**
   * Get all failed actions
   */
  getFailedActions(): QueuedBookingAction[] {
    return [...this.failedActions];
  }

  /**
   * Persist queue to localStorage
   */
  private persistQueue(): void {
    try {
      localStorage.setItem('offline_booking_queue', JSON.stringify(this.queue));
      localStorage.setItem('offline_booking_failed', JSON.stringify(this.failedActions));
      localStorage.setItem('offline_booking_synced_count', String(this.syncedCount));
    } catch (error) {
      console.error('Failed to persist offline booking queue:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const queueStr = localStorage.getItem('offline_booking_queue');
      const failedStr = localStorage.getItem('offline_booking_failed');
      const syncedStr = localStorage.getItem('offline_booking_synced_count');
      
      if (queueStr) {
        this.queue = JSON.parse(queueStr);
        console.log(`📥 Offline Queue: Loaded ${this.queue.length} queued items`);
      }
      
      if (failedStr) {
        this.failedActions = JSON.parse(failedStr);
        console.log(`📥 Offline Queue: Loaded ${this.failedActions.length} failed items`);
      }
      
      if (syncedStr) {
        this.syncedCount = parseInt(syncedStr, 10);
      }
    } catch (error) {
      console.error('Failed to load offline booking queue:', error);
    }
  }

  /**
   * Start automatic sync every 30 seconds
   */
  private startAutoSync(): void {
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && this.queue.length > 0) {
        this.syncQueue();
      }
    }, this.SYNC_INTERVAL);
    
    console.log('📤 Offline Queue: Auto-sync started (every 30 seconds)');
  }

  /**
   * Setup online event listener
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Offline Queue: Device is back online, syncing queue...');
      this.syncQueue();
    });
    
    window.addEventListener('offline', () => {
      console.log('📴 Offline Queue: Device is offline, actions will be queued');
    });
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('📤 Offline Queue: Auto-sync stopped');
    }
  }

  /**
   * Clear all queued and failed actions
   */
  clear(): void {
    this.queue = [];
    this.failedActions = [];
    this.syncedCount = 0;
    
    localStorage.removeItem('offline_booking_queue');
    localStorage.removeItem('offline_booking_failed');
    localStorage.removeItem('offline_booking_synced_count');
    
    console.log('📤 Offline Queue: Cleared all actions');
  }

  /**
   * Cancel a specific queued action
   */
  cancelAction(id: string): boolean {
    const initialLength = this.queue.length;
    this.removeFromQueue(id);
    
    if (this.queue.length < initialLength) {
      this.persistQueue();
      console.log(`❌ Offline Queue: Cancelled action ${id}`);
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
export const offlineBookingQueue = new OfflineBookingQueue();

// Export class for testing
export { OfflineBookingQueue };

// Export types
export type { QueuedBookingAction, QueueStats };

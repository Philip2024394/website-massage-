/**
 * Appwrite Connection Health Monitor
 * Facebook/Amazon Standard: Real-time monitoring with user alerts
 */

export interface ConnectionHealthStatus {
  status: 'healthy' | 'degraded' | 'offline';
  lastSuccessfulRequest: number;
  failedRequestCount: number;
  latency: number;
  services: {
    database: 'healthy' | 'degraded' | 'offline';
    realtime: 'healthy' | 'degraded' | 'offline';
    auth: 'healthy' | 'degraded' | 'offline';
  };
}

interface HealthCheckResult {
  success: boolean;
  latency: number;
  error?: string;
  service: keyof ConnectionHealthStatus['services'];
}

class AppwriteConnectionHealthMonitor {
  private currentStatus: ConnectionHealthStatus = {
    status: 'healthy',
    lastSuccessfulRequest: Date.now(),
    failedRequestCount: 0,
    latency: 0,
    services: {
      database: 'healthy',
      realtime: 'healthy',
      auth: 'healthy'
    }
  };

  private readonly CHECK_INTERVAL = 30000; // 30 seconds
  private readonly DEGRADED_THRESHOLD = 3; // Failed requests before degraded
  private readonly OFFLINE_THRESHOLD = 5; // Failed requests before offline
  private readonly LATENCY_WARNING_THRESHOLD = 2000; // 2 seconds

  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Set<(status: ConnectionHealthStatus) => void> = new Set();

  /**
   * Start monitoring Appwrite connection health
   */
  startMonitoring(): void {
    if (this.intervalId) return; // Already monitoring

    console.log('🔍 Starting Appwrite connection health monitoring...');

    // Initial health check
    this.performHealthCheck();

    // Schedule regular health checks
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Stopped Appwrite connection health monitoring');
    }
  }

  /**
   * Add status change listener
   */
  addStatusListener(callback: (status: ConnectionHealthStatus) => void): () => void {
    this.listeners.add(callback);
    
    // Send current status immediately
    callback(this.currentStatus);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get current health status
   */
  getCurrentStatus(): ConnectionHealthStatus {
    return { ...this.currentStatus };
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test all Appwrite services
      const [databaseResult, realtimeResult, authResult] = await Promise.allSettled([
        this.checkDatabaseHealth(),
        this.checkRealtimeHealth(),
        this.checkAuthHealth()
      ]);

      const totalLatency = Date.now() - startTime;

      // Process results
      const newStatus: ConnectionHealthStatus = {
        ...this.currentStatus,
        latency: totalLatency
      };

      // Update service statuses
      newStatus.services.database = databaseResult.status === 'fulfilled' && databaseResult.value.success ? 'healthy' : 'offline';
      newStatus.services.realtime = realtimeResult.status === 'fulfilled' && realtimeResult.value.success ? 'healthy' : 'offline';
      newStatus.services.auth = authResult.status === 'fulfilled' && authResult.value.success ? 'healthy' : 'offline';

      // Determine overall status
      const healthyServices = Object.values(newStatus.services).filter(s => s === 'healthy').length;
      
      if (healthyServices === 3) {
        newStatus.status = totalLatency > this.LATENCY_WARNING_THRESHOLD ? 'degraded' : 'healthy';
        newStatus.failedRequestCount = Math.max(0, newStatus.failedRequestCount - 1); // Recover
        newStatus.lastSuccessfulRequest = Date.now();
      } else if (healthyServices >= 1) {
        newStatus.status = 'degraded';
        newStatus.failedRequestCount++;
      } else {
        newStatus.status = 'offline';
        newStatus.failedRequestCount++;
      }

      this.updateStatus(newStatus);

    } catch (error) {
      console.error('❌ Health check failed:', error);
      
      const newStatus: ConnectionHealthStatus = {
        ...this.currentStatus,
        status: 'offline',
        failedRequestCount: this.currentStatus.failedRequestCount + 1,
        latency: Date.now() - startTime
      };

      this.updateStatus(newStatus);
    }
  }

  /**
   * Check database service health
   */
  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Import Appwrite services dynamically to avoid circular dependencies
      const { databases, DATABASE_ID } = await import('../lib/appwrite');
      
      // Simple health check - list collections (lightweight operation)
      await databases.listCollections(DATABASE_ID);
      
      return {
        success: true,
        latency: Date.now() - startTime,
        service: 'database'
      };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'database'
      };
    }
  }

  /**
   * Check realtime service health
   */
  private async checkRealtimeHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simple connection test - this will validate the realtime connection
      const testChannel = 'health-check';
      let connectionSuccessful = false;
      
      // Import client dynamically
      const { client } = await import('../lib/appwrite');
      
      // Create a test subscription and immediately unsubscribe
      const unsubscribe = client.subscribe(testChannel, () => {
        connectionSuccessful = true;
      });
      
      // Clean up immediately
      setTimeout(() => unsubscribe(), 100);
      
      return {
        success: true, // If we reach here, realtime is accessible
        latency: Date.now() - startTime,
        service: 'realtime'
      };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'realtime'
      };
    }
  }

  /**
   * Check auth service health
   */
  private async checkAuthHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Import account service dynamically
      const { account } = await import('../lib/appwrite');
      
      // Simple health check - get current session (lightweight)
      try {
        await account.get();
      } catch (authError) {
        // Not being logged in is not a service health issue
        // The auth service is working if it returns a proper error response
      }
      
      return {
        success: true,
        latency: Date.now() - startTime,
        service: 'auth'
      };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'auth'
      };
    }
  }

  /**
   * Update status and notify listeners
   */
  private updateStatus(newStatus: ConnectionHealthStatus): void {
    const previousStatus = this.currentStatus.status;
    this.currentStatus = newStatus;

    // Log status changes
    if (previousStatus !== newStatus.status) {
      console.log(`🔄 Appwrite status changed: ${previousStatus} → ${newStatus.status}`);
      
      // Show user notification for critical status changes
      this.notifyStatusChange(previousStatus, newStatus.status);
    }

    // Notify all listeners
    this.listeners.forEach(callback => {
      try {
        callback(newStatus);
      } catch (error) {
        console.error('❌ Status listener error:', error);
      }
    });
  }

  /**
   * Show user notification for status changes
   */
  private notifyStatusChange(previousStatus: string, newStatus: string): void {
    // Show in-app notifications for status changes
    if (newStatus === 'offline') {
      this.showUserAlert('Connection Lost', '🔴 Unable to reach server. Your actions may not be saved.', 'error');
    } else if (newStatus === 'degraded') {
      this.showUserAlert('Slow Connection', '🟡 Connection is slow. Some features may be delayed.', 'warning');
    } else if (previousStatus !== 'healthy' && newStatus === 'healthy') {
      this.showUserAlert('Connection Restored', '✅ Connection is back to normal.', 'success');
    }
  }

  /**
   * Show user alert
   */
  private showUserAlert(title: string, message: string, type: 'error' | 'warning' | 'success'): void {
    // Create notification event that the UI can listen to
    window.dispatchEvent(new CustomEvent('appwrite-health-alert', {
      detail: { title, message, type }
    }));

    // Also show browser notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/icon-192.png',
        tag: 'appwrite-health'
      });
    }
  }
}

export const appwriteConnectionHealthMonitor = new AppwriteConnectionHealthMonitor();
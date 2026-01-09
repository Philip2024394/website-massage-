/**
 * System Health Service for Therapist Dashboard
 * Monitors therapist activity and provides health metrics
 */

interface HealthMetrics {
  isOnline: boolean;
  lastActivity: string;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  responseTime: number;
  errorCount: number;
}

class SystemHealthService {
  // private memberId: string | null = null; // Unused
  private healthMetrics: HealthMetrics = {
    isOnline: false,
    lastActivity: new Date().toISOString(),
    connectionStatus: 'disconnected',
    responseTime: 0,
    errorCount: 0
  };
  private listeners: ((metrics: HealthMetrics) => void)[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Start health monitoring for a therapist
   */
  startHealthMonitoring(therapistId: string): void {
    console.log('🏥 Starting health monitoring for therapist:', therapistId);
    // this.memberId = therapistId; // Property removed
    this.healthMetrics.isOnline = true;
    this.healthMetrics.connectionStatus = 'connected';
    this.updateActivity();

    // Start periodic health checks
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Check every 30 seconds

    this.notifyListeners();
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    console.log('🛑 Stopping health monitoring');
    // this.memberId = null; // Property removed
    this.healthMetrics.isOnline = false;
    this.healthMetrics.connectionStatus = 'disconnected';

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.notifyListeners();
  }

  /**
   * Update last activity timestamp
   */
  updateActivity(): void {
    this.healthMetrics.lastActivity = new Date().toISOString();
    this.notifyListeners();
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Simulate health check (in real app, this would ping your backend)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      this.healthMetrics.responseTime = Date.now() - startTime;
      this.healthMetrics.connectionStatus = 'connected';
      this.healthMetrics.isOnline = true;
      
    } catch (error) {
      console.error('Health check failed:', error);
      this.healthMetrics.errorCount++;
      this.healthMetrics.connectionStatus = 'disconnected';
      this.healthMetrics.isOnline = false;
    }

    this.notifyListeners();
  }

  /**
   * Get current health metrics
   */
  getHealthMetrics(): HealthMetrics {
    return { ...this.healthMetrics };
  }

  /**
   * Subscribe to health updates
   */
  subscribe(listener: (metrics: HealthMetrics) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Play notification sound
   */
  playNotificationSound(soundType: 'message' | 'booking' | 'alert' | 'payment' | 'success' = 'message'): void {
    try {
      const soundEnabled = localStorage.getItem('notificationSound') !== 'false';
      if (!soundEnabled) {
        console.log('🔇 Sound disabled by user');
        return;
      }

      const soundFile = `/sounds/${soundType}-notification.mp3`;
      const audio = new Audio(soundFile);
      audio.volume = 0.7; // 70% volume
      
      audio.play().catch(error => {
        console.warn('Failed to play notification sound:', error);
        // Fallback: try alternative path for therapist dashboard
        const altAudio = new Audio('../../../public/sounds/booking-notification.mp3');
        altAudio.volume = 0.7;
        altAudio.play().catch(err => console.error('Audio playback failed:', err));
      });
      
      console.log('🔊 Playing notification sound:', soundFile);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  /**
   * Test notification system
   */
  async testNotificationSystem(): Promise<boolean> {
    try {
      console.log('🔔 Testing notification system...');
      
      // Test notification sound
      this.playNotificationSound('success');
      
      // Show browser notification if enabled
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Test Notification', {
          body: 'System is working correctly! 🎉',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png'
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Notification test successful');
      return true;
      
    } catch (error) {
      console.error('❌ Notification test failed:', error);
      return false;
    }
  }

  /**
   * Record error
   */
  recordError(error: Error): void {
    console.error('System error recorded:', error);
    this.healthMetrics.errorCount++;
    this.notifyListeners();
  }

  /**
   * Notify all listeners of health changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getHealthMetrics());
      } catch (error) {
        console.error('Error notifying health listener:', error);
      }
    });
  }
}

// Export singleton instance
export const systemHealthService = new SystemHealthService();
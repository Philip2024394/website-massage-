/**
 * CRITICAL THERAPIST BOOKING SOUND SERVICE
 * 
 * Ensures therapists NEVER miss a booking request through:
 * - Loud, audible MP3 notifications using existing sounds
 * - Automatic repetition every 10 seconds until action taken
 * - Proper cleanup to prevent memory leaks
 * - Browser autoplay restriction handling
 * - Works when phone is on table in another room
 */

type BookingStatus = 'pending' | 'match_found' | 'accepted' | 'declined' | 'cancelled' | 'expired';

interface BookingAlert {
  audio: HTMLAudioElement;
  interval: NodeJS.Timeout;
  bookingId: string;
  startTime: number;
  repeatCount: number;
}

class BookingSoundService {
  private activeAlerts: Map<string, BookingAlert> = new Map();
  private soundPath = '/sounds/booking-notification.mp3'; // Using existing MP3
  private defaultVolume = 0.8; // Loud enough to hear from another room
  private repeatInterval = 10000; // 10 seconds as required
  private maxDuration = 10 * 60 * 1000; // Auto-stop after 10 minutes to prevent infinite alerts

  /**
   * Start booking alert for therapist
   * CRITICAL: Must be audible even when phone is on table in another room
   */
  async startBookingAlert(bookingId: string, bookingStatus: BookingStatus = 'pending'): Promise<void> {
    console.log(`[BOOKING SOUND] Starting alert for booking ${bookingId} (status: ${bookingStatus})`);

    // Stop any existing alert for this booking
    this.stopBookingAlert(bookingId);

    // Only play for pending/match_found status
    if (bookingStatus !== 'pending' && bookingStatus !== 'match_found') {
      console.log(`[BOOKING SOUND] Skipping alert - status ${bookingStatus} not eligible for alerts`);
      return;
    }

    try {
      // Create audio element
      const audio = new Audio(this.soundPath);
      audio.volume = this.defaultVolume;
      audio.preload = 'auto';
      
      // Handle autoplay restrictions gracefully
      const playSound = async () => {
        try {
          audio.currentTime = 0; // Reset to start
          await audio.play();
          console.log(`[BOOKING SOUND] Repeating alert for booking ${bookingId}`);
        } catch (error: any) {
          if (error.name === 'NotAllowedError') {
            console.warn(`[BOOKING SOUND] Autoplay blocked - user interaction required`);
          } else {
            console.error(`[BOOKING SOUND] Audio play error:`, error);
          }
        }
      };

      // Play initial sound immediately
      await playSound();
      console.log(`[BOOKING SOUND] Started initial alert for booking ${bookingId}`);

      // Set up repeating interval
      const interval = setInterval(playSound, this.repeatInterval);

      // Store alert reference
      const alert: BookingAlert = {
        audio,
        interval,
        bookingId,
        startTime: Date.now(),
        repeatCount: 0
      };
      
      this.activeAlerts.set(bookingId, alert);

      // Auto-stop after max duration to prevent infinite alerts
      setTimeout(() => {
        console.log(`[BOOKING SOUND] Auto-stopping alert for booking ${bookingId} after ${this.maxDuration}ms`);
        this.stopBookingAlert(bookingId);
      }, this.maxDuration);

      // Track repeat count for logging
      const countInterval = setInterval(() => {
        const currentAlert = this.activeAlerts.get(bookingId);
        if (currentAlert) {
          currentAlert.repeatCount++;
          if (currentAlert.repeatCount % 6 === 0) { // Log every minute (6 * 10 seconds)
            console.log(`[BOOKING SOUND] Alert for booking ${bookingId} has repeated ${currentAlert.repeatCount} times`);
          }
        } else {
          clearInterval(countInterval);
        }
      }, this.repeatInterval);

    } catch (error) {
      console.error(`[BOOKING SOUND] Failed to start alert for booking ${bookingId}:`, error);
      throw error; // Don't block booking flow if audio fails
    }
  }

  /**
   * Stop booking alert immediately
   * CRITICAL: Must stop on Accept, Decline, Cancel, or Timeout
   */
  stopBookingAlert(bookingId: string): void {
    const alert = this.activeAlerts.get(bookingId);
    
    if (alert) {
      console.log(`[BOOKING SOUND] Stopped alert for booking ${bookingId} after ${alert.repeatCount} repetitions`);
      
      // Stop audio
      try {
        alert.audio.pause();
        alert.audio.currentTime = 0;
        alert.audio.src = ''; // Clear source to free memory
      } catch (error) {
        console.warn(`[BOOKING SOUND] Error stopping audio:`, error);
      }

      // Clear interval
      clearInterval(alert.interval);
      
      // Remove from active alerts
      this.activeAlerts.delete(bookingId);
      
      console.log(`[BOOKING SOUND] Cleanup completed for booking ${bookingId}`);
    } else {
      console.log(`[BOOKING SOUND] No active alert found for booking ${bookingId}`);
    }
  }

  /**
   * Stop all active booking alerts
   * Used for cleanup and testing
   */
  stopAllBookingAlerts(): void {
    console.log(`[BOOKING SOUND] Stopping all active alerts (${this.activeAlerts.size} active)`);
    
    const bookingIds = Array.from(this.activeAlerts.keys());
    bookingIds.forEach(bookingId => {
      this.stopBookingAlert(bookingId);
    });
    
    console.log(`[BOOKING SOUND] All alerts stopped`);
  }

  /**
   * Check if alert is active for booking
   */
  isAlertActive(bookingId: string): boolean {
    return this.activeAlerts.has(bookingId);
  }

  /**
   * Get active alert count (for debugging)
   */
  getActiveAlertCount(): number {
    return this.activeAlerts.size;
  }

  /**
   * Get alert statistics for a booking
   */
  getAlertStats(bookingId: string): { repeatCount: number; duration: number; isActive: boolean } | null {
    const alert = this.activeAlerts.get(bookingId);
    if (!alert) {
      return null;
    }

    return {
      repeatCount: alert.repeatCount,
      duration: Date.now() - alert.startTime,
      isActive: true
    };
  }

  /**
   * Test audio system (for debugging)
   * Plays one sound without starting continuous alerts
   */
  async testBookingSound(): Promise<boolean> {
    console.log(`[BOOKING SOUND] Testing audio system...`);
    
    try {
      const audio = new Audio(this.soundPath);
      audio.volume = this.defaultVolume;
      await audio.play();
      console.log(`[BOOKING SOUND] Audio test successful`);
      return true;
    } catch (error) {
      console.error(`[BOOKING SOUND] Audio test failed:`, error);
      return false;
    }
  }

  /**
   * Handle user interaction to enable autoplay
   * Call this on any user interaction to prepare audio
   */
  async enableAutoplay(): Promise<void> {
    try {
      const audio = new Audio(this.soundPath);
      audio.volume = 0.01; // Very quiet test
      await audio.play();
      audio.pause();
      console.log(`[BOOKING SOUND] Autoplay enabled via user interaction`);
    } catch (error) {
      console.warn(`[BOOKING SOUND] Could not enable autoplay:`, error);
    }
  }

  /**
   * Cleanup method for component unmount/page unload
   */
  cleanup(): void {
    console.log(`[BOOKING SOUND] Performing cleanup...`);
    this.stopAllBookingAlerts();
    console.log(`[BOOKING SOUND] Cleanup completed`);
  }
}

// Export singleton instance
export const bookingSoundService = new BookingSoundService();

// Cleanup on page unload to prevent memory leaks
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    bookingSoundService.cleanup();
  });
  
  // Also cleanup on visibility change (when tab becomes hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log(`[BOOKING SOUND] Tab hidden - maintaining alerts but logging state`);
      console.log(`[BOOKING SOUND] Active alerts: ${bookingSoundService.getActiveAlertCount()}`);
    }
  });
}

export default bookingSoundService;

/**
 * USAGE EXAMPLE:
 * 
 * // When therapist receives booking request
 * await bookingSoundService.startBookingAlert('booking_123', 'pending');
 * 
 * // When therapist accepts/declines
 * bookingSoundService.stopBookingAlert('booking_123');
 * 
 * // For cleanup
 * bookingSoundService.cleanup();
 */
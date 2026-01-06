/**
 * Continuous Notification Service for Therapists
 * Plays MP3 notification sounds until therapist responds to booking
 * 
 * CRITICAL: Enhanced with booking sound service integration
 * - Better logging with [BOOKING SOUND] prefix
 * - Memory leak prevention
 * - Autoplay restriction handling
 */

import { bookingSoundService } from '../services/bookingSound.service';

const notificationIntervals: Map<string, NodeJS.Timeout> = new Map();
let notificationAudio: HTMLAudioElement | null = null;

/**
 * Initialize audio element for notifications
 */
const initializeNotificationAudio = (): HTMLAudioElement => {
    if (!notificationAudio) {
        notificationAudio = new Audio('/sounds/booking-notification.mp3');
        notificationAudio.loop = false;
        notificationAudio.volume = 0.8;
        
        // Preload the audio
        notificationAudio.load();
        
        // Handle audio errors
        notificationAudio.addEventListener('error', (e) => {
            console.warn('[BOOKING SOUND] Audio initialization error:', e);
        });
        
        console.log('[BOOKING SOUND] Audio element initialized');
    }
    return notificationAudio;
};

/**
 * Play notification sound once
 */
const playNotificationSound = async (): Promise<void> => {
    try {
        const audio = initializeNotificationAudio();
        
        // Reset audio to beginning
        audio.currentTime = 0;
        
        // Play the sound
        await audio.play();
        
        console.log('[BOOKING SOUND] Legacy notification sound played');
    } catch (error: any) {
        if (error.name === 'NotAllowedError') {
            console.warn('[BOOKING SOUND] Legacy sound blocked - autoplay restricted');
        } else {
            console.warn('[BOOKING SOUND] Legacy sound play error:', error);
        }
    }
};

/**
 * Start continuous notifications for a booking
 * Plays sound every 10 seconds until stopped
 * ENHANCED: Now integrates with new bookingSoundService for maximum reliability
 */
export const startContinuousNotifications = (bookingId: string): void => {
    console.log('[BOOKING SOUND] Starting legacy continuous notifications for booking:', bookingId);
    
    // Stop any existing notifications for this booking
    stopContinuousNotifications(bookingId);
    
    // Also start the new enhanced service for better reliability
    try {
        bookingSoundService.startBookingAlert(bookingId, 'pending');
    } catch (error) {
        console.warn('[BOOKING SOUND] Enhanced service failed, continuing with legacy:', error);
    }
    
    // Play initial sound immediately
    playNotificationSound();
    
    // Set up interval to play sound every 10 seconds
    const interval = setInterval(() => {
        playNotificationSound();
    }, 10000); // 10 seconds
    
    // Store interval reference
    notificationIntervals.set(bookingId, interval);
    
    console.log('[BOOKING SOUND] Legacy continuous notifications started for booking:', bookingId);
};

/**
 * Stop continuous notifications for a booking
 * ENHANCED: Also stops the new bookingSoundService
 */
export const stopContinuousNotifications = (bookingId: string): void => {
    const interval = notificationIntervals.get(bookingId);
    
    if (interval) {
        clearInterval(interval);
        notificationIntervals.delete(bookingId);
        console.log('[BOOKING SOUND] Stopped legacy continuous notifications for booking:', bookingId);
    }
    
    // Also stop the enhanced service
    try {
        bookingSoundService.stopBookingAlert(bookingId);
    } catch (error) {
        console.warn('[BOOKING SOUND] Error stopping enhanced service:', error);
    }
};

/**
 * Stop all continuous notifications
 * ENHANCED: Also stops all bookingSoundService alerts
 */
export const stopAllContinuousNotifications = (): void => {
    console.log('[BOOKING SOUND] Stopping all legacy notifications...');
    
    notificationIntervals.forEach((interval, bookingId) => {
        clearInterval(interval);
        console.log('[BOOKING SOUND] Stopped legacy notifications for booking:', bookingId);
    });
    
    notificationIntervals.clear();
    
    // Also stop all enhanced service alerts
    try {
        bookingSoundService.stopAllBookingAlerts();
    } catch (error) {
        console.warn('[BOOKING SOUND] Error stopping enhanced service alerts:', error);
    }
    
    console.log('[BOOKING SOUND] All continuous notifications stopped');
};

/**
 * Check if notifications are running for a booking
 * ENHANCED: Checks both legacy and enhanced services
 */
export const isNotificationRunning = (bookingId: string): boolean => {
    const legacyRunning = notificationIntervals.has(bookingId);
    const enhancedRunning = bookingSoundService.isAlertActive(bookingId);
    return legacyRunning || enhancedRunning;
};

/**
 * Get count of active notification sessions
 * ENHANCED: Includes both legacy and enhanced services
 */
export const getActiveNotificationCount = (): number => {
    const legacyCount = notificationIntervals.size;
    const enhancedCount = bookingSoundService.getActiveAlertCount();
    return Math.max(legacyCount, enhancedCount); // Return higher count to be safe
};

// Cleanup on page unload with enhanced error handling
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        try {
            stopAllContinuousNotifications();
        } catch (error) {
            console.error('[BOOKING SOUND] Error during cleanup:', error);
        }
    });
    
    // Enhanced cleanup on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('[BOOKING SOUND] Tab hidden - notifications continue running');
            console.log('[BOOKING SOUND] Active legacy notifications:', notificationIntervals.size);
            console.log('[BOOKING SOUND] Active enhanced notifications:', bookingSoundService.getActiveAlertCount());
        } else {
            console.log('[BOOKING SOUND] Tab visible - checking notification status');
        }
    });
}
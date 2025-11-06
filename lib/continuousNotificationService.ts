/**
 * Continuous Notification Service for Therapists
 * Plays MP3 notification sounds until therapist responds to booking
 */

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
        
        console.log('🔔 Booking notification sound played');
    } catch (error) {
        console.warn('⚠️ Could not play notification sound:', error);
    }
};

/**
 * Start continuous notifications for a booking
 * Plays sound every 10 seconds until stopped
 */
export const startContinuousNotifications = (bookingId: string): void => {
    console.log('🔔 Starting continuous notifications for booking:', bookingId);
    
    // Stop any existing notifications for this booking
    stopContinuousNotifications(bookingId);
    
    // Play initial sound immediately
    playNotificationSound();
    
    // Set up interval to play sound every 10 seconds
    const interval = setInterval(() => {
        playNotificationSound();
    }, 10000); // 10 seconds
    
    // Store interval reference
    notificationIntervals.set(bookingId, interval);
    
    console.log('✅ Continuous notifications started for booking:', bookingId);
};

/**
 * Stop continuous notifications for a booking
 */
export const stopContinuousNotifications = (bookingId: string): void => {
    const interval = notificationIntervals.get(bookingId);
    
    if (interval) {
        clearInterval(interval);
        notificationIntervals.delete(bookingId);
        console.log('🔇 Stopped continuous notifications for booking:', bookingId);
    }
};

/**
 * Stop all continuous notifications
 */
export const stopAllContinuousNotifications = (): void => {
    notificationIntervals.forEach((interval, bookingId) => {
        clearInterval(interval);
        console.log('🔇 Stopped notifications for booking:', bookingId);
    });
    
    notificationIntervals.clear();
    console.log('✅ All continuous notifications stopped');
};

/**
 * Check if notifications are running for a booking
 */
export const isNotificationRunning = (bookingId: string): boolean => {
    return notificationIntervals.has(bookingId);
};

/**
 * Get count of active notification sessions
 */
export const getActiveNotificationCount = (): number => {
    return notificationIntervals.size;
};

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        stopAllContinuousNotifications();
    });
}
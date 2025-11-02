/**
 * Countdown Timer Service for Booking Response
 * Shows animated countdown in chat window
 */

export interface CountdownState {
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isExpired: boolean;
    formattedTime: string;
}

export type CountdownCallback = (state: CountdownState) => void;
export type CountdownExpiredCallback = () => void;

class BookingCountdownTimer {
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private callbacks: Map<string, CountdownCallback> = new Map();
    private expiredCallbacks: Map<string, CountdownExpiredCallback> = new Map();
    
    /**
     * Start countdown timer for a booking
     */
    startCountdown(
        bookingId: string,
        durationMinutes: number,
        onUpdate: CountdownCallback,
        onExpired: CountdownExpiredCallback
    ): void {
        console.log(`⏰ Starting ${durationMinutes}-minute countdown for booking:`, bookingId);
        
        // Stop any existing timer for this booking
        this.stopCountdown(bookingId);
        
        // Store callbacks
        this.callbacks.set(bookingId, onUpdate);
        this.expiredCallbacks.set(bookingId, onExpired);
        
        // Calculate total seconds
        let totalSeconds = durationMinutes * 60;
        
        // Update immediately
        this.updateCountdown(bookingId, totalSeconds);
        
        // Set up interval to update every second
        const timer = setInterval(() => {
            totalSeconds--;
            
            if (totalSeconds <= 0) {
                // Timer expired
                this.handleExpired(bookingId);
            } else {
                // Update countdown
                this.updateCountdown(bookingId, totalSeconds);
            }
        }, 1000);
        
        // Store timer reference
        this.timers.set(bookingId, timer);
        
        console.log('✅ Countdown timer started for booking:', bookingId);
    }
    
    /**
     * Stop countdown timer for a booking
     */
    stopCountdown(bookingId: string): void {
        const timer = this.timers.get(bookingId);
        
        if (timer) {
            clearInterval(timer);
            this.timers.delete(bookingId);
            this.callbacks.delete(bookingId);
            this.expiredCallbacks.delete(bookingId);
            console.log('⏰ Stopped countdown for booking:', bookingId);
        }
    }
    
    /**
     * Stop all countdown timers
     */
    stopAllCountdowns(): void {
        this.timers.forEach((timer, bookingId) => {
            clearInterval(timer);
            console.log('⏰ Stopped countdown for booking:', bookingId);
        });
        
        this.timers.clear();
        this.callbacks.clear();
        this.expiredCallbacks.clear();
        console.log('✅ All countdown timers stopped');
    }
    
    /**
     * Update countdown state and call callback
     */
    private updateCountdown(bookingId: string, totalSeconds: number): void {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        const state: CountdownState = {
            minutes,
            seconds,
            totalSeconds,
            isExpired: false,
            formattedTime: `${minutes}:${seconds.toString().padStart(2, '0')}`
        };
        
        const callback = this.callbacks.get(bookingId);
        if (callback) {
            callback(state);
        }
    }
    
    /**
     * Handle timer expiration
     */
    private handleExpired(bookingId: string): void {
        console.log('⏰ Countdown expired for booking:', bookingId);
        
        // Update with expired state
        const expiredState: CountdownState = {
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
            isExpired: true,
            formattedTime: '0:00'
        };
        
        const callback = this.callbacks.get(bookingId);
        if (callback) {
            callback(expiredState);
        }
        
        // Call expired callback
        const expiredCallback = this.expiredCallbacks.get(bookingId);
        if (expiredCallback) {
            expiredCallback();
        }
        
        // Clean up
        this.stopCountdown(bookingId);
    }
    
    /**
     * Check if countdown is running for a booking
     */
    isCountdownRunning(bookingId: string): boolean {
        return this.timers.has(bookingId);
    }
    
    /**
     * Get active countdown count
     */
    getActiveCountdownCount(): number {
        return this.timers.size;
    }
}

// Create singleton instance
const countdownTimer = new BookingCountdownTimer();

// Export timer methods
export const startBookingCountdown = countdownTimer.startCountdown.bind(countdownTimer);
export const stopBookingCountdown = countdownTimer.stopCountdown.bind(countdownTimer);
export const stopAllBookingCountdowns = countdownTimer.stopAllCountdowns.bind(countdownTimer);
export const isBookingCountdownRunning = countdownTimer.isCountdownRunning.bind(countdownTimer);
export const getActiveBookingCountdownCount = countdownTimer.getActiveCountdownCount.bind(countdownTimer);

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        stopAllBookingCountdowns();
    });
}
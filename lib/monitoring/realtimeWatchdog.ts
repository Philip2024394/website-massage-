/**
 * 🔒 REALTIME SUBSCRIPTION WATCHDOG
 * 
 * Purpose: Monitor realtime subscriptions and alert if events stop flowing
 * Problem Solved: Silent realtime subscription failures that block therapist notifications
 * 
 * This watchdog MUST be initialized when therapist dashboard loads.
 * If no events received within timeout, system is BROKEN.
 */

import { bookingService, type Booking } from '../bookingService';

export interface WatchdogConfig {
    therapistId: string;
    timeoutSeconds: number; // Alert if no events within this time
    onTimeout: (message: string) => void;
    onEventReceived: (booking: Booking) => void;
    enabled: boolean;
}

export class RealtimeSubscriptionWatchdog {
    private config: WatchdogConfig;
    private lastEventTime: number = 0;
    private timeoutTimer: NodeJS.Timeout | null = null;
    private unsubscribe: (() => void) | null = null;
    private eventsReceived: number = 0;
    private started: boolean = false;

    constructor(config: WatchdogConfig) {
        this.config = config;
    }

    /**
     * Start monitoring realtime subscription
     */
    start(): void {
        if (!this.config.enabled) {
            console.log('⏸️ Watchdog disabled');
            return;
        }

        if (this.started) {
            console.warn('⚠️ Watchdog already started');
            return;
        }

        this.started = true;
        this.lastEventTime = Date.now();

        console.log(`🐕 Starting realtime subscription watchdog for therapist: ${this.config.therapistId}`);
        console.log(`   └─ Timeout: ${this.config.timeoutSeconds} seconds`);

        // Subscribe to provider bookings
        this.unsubscribe = bookingService.subscribeToProviderBookings(
            this.config.therapistId,
            (booking: Booking) => {
                this.handleEvent(booking);
            }
        );

        // Start timeout checker
        this.startTimeoutChecker();

        console.log('✅ Watchdog started successfully');
    }

    /**
     * Stop monitoring
     */
    stop(): void {
        if (!this.started) {
            return;
        }

        console.log('🛑 Stopping realtime subscription watchdog');

        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }

        if (this.timeoutTimer) {
            clearInterval(this.timeoutTimer);
            this.timeoutTimer = null;
        }

        this.started = false;

        console.log(`📊 Watchdog stats: ${this.eventsReceived} events received`);
    }

    /**
     * Handle received event
     */
    private handleEvent(booking: Booking): void {
        this.lastEventTime = Date.now();
        this.eventsReceived++;

        console.log(`🔔 Watchdog: Event #${this.eventsReceived} received at ${new Date().toISOString()}`);
        console.log(`   └─ Booking: ${booking.$id}`);

        // Notify callback
        this.config.onEventReceived(booking);
    }

    /**
     * Start timeout checker (runs every 30 seconds)
     */
    private startTimeoutChecker(): void {
        this.timeoutTimer = setInterval(() => {
            this.checkTimeout();
        }, 30000); // Check every 30 seconds
    }

    /**
     * Check if subscription timed out
     */
    private checkTimeout(): void {
        const now = Date.now();
        const timeSinceLastEvent = now - this.lastEventTime;
        const timeoutMs = this.config.timeoutSeconds * 1000;

        if (timeSinceLastEvent > timeoutMs) {
            const message = 
                `🔴 REALTIME SUBSCRIPTION TIMEOUT\n\n` +
                `No events received for ${Math.floor(timeSinceLastEvent / 1000)} seconds.\n` +
                `Timeout threshold: ${this.config.timeoutSeconds} seconds.\n` +
                `Events received total: ${this.eventsReceived}\n\n` +
                `⚠️ This means:\n` +
                `  • Realtime subscriptions may be broken\n` +
                `  • Therapist will NOT see new bookings\n` +
                `  • Revenue is at risk\n\n` +
                `🔧 Action required:\n` +
                `  1. Check Appwrite realtime service status\n` +
                `  2. Verify subscription is active\n` +
                `  3. Test with a booking\n` +
                `  4. Check browser console for errors`;

            console.error(message);
            
            // Notify callback
            this.config.onTimeout(message);

            // Log as SEV-1 incident
            this.logSev1Incident(message);
        } else {
            console.log(`✅ Watchdog: Subscription healthy (last event ${Math.floor(timeSinceLastEvent / 1000)}s ago)`);
        }
    }

    /**
     * Log SEV-1 incident
     */
    private logSev1Incident(message: string): void {
        // In production, this would send to monitoring system (Sentry, DataDog, etc.)
        console.error('🚨 SEV-1 INCIDENT:', {
            type: 'REALTIME_SUBSCRIPTION_FAILURE',
            therapistId: this.config.therapistId,
            eventsReceived: this.eventsReceived,
            lastEventTime: new Date(this.lastEventTime).toISOString(),
            message
        });

        // Send alert to admin dashboard
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sev1-incident', {
                detail: {
                    type: 'REALTIME_SUBSCRIPTION_FAILURE',
                    therapistId: this.config.therapistId,
                    message
                }
            }));
        }
    }

    /**
     * Get current stats
     */
    getStats(): {
        eventsReceived: number;
        lastEventTime: string;
        timeSinceLastEvent: number;
        isHealthy: boolean;
    } {
        const now = Date.now();
        const timeSinceLastEvent = now - this.lastEventTime;
        const timeoutMs = this.config.timeoutSeconds * 1000;

        return {
            eventsReceived: this.eventsReceived,
            lastEventTime: new Date(this.lastEventTime).toISOString(),
            timeSinceLastEvent: Math.floor(timeSinceLastEvent / 1000),
            isHealthy: timeSinceLastEvent < timeoutMs
        };
    }
}

/**
 * Create and start watchdog for therapist dashboard
 */
export function createTherapistWatchdog(
    therapistId: string,
    onBookingReceived: (booking: Booking) => void
): RealtimeSubscriptionWatchdog {
    const watchdog = new RealtimeSubscriptionWatchdog({
        therapistId,
        timeoutSeconds: 300, // 5 minutes
        enabled: true,
        onEventReceived: (booking) => {
            console.log('📥 New booking received via watchdog');
            onBookingReceived(booking);
        },
        onTimeout: (message) => {
            console.error(message);
            
            // Show alert to therapist
            if (typeof window !== 'undefined' && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                    new Notification('🔴 System Alert', {
                        body: 'Realtime notifications may not be working. Please refresh the page.',
                        requireInteraction: true
                    });
                }
            }
        }
    });

    watchdog.start();

    return watchdog;
}

interface HealthEvent {
    type: 'health_update' | 'error_logged' | 'circuit_breaker_change' | 'session_activity';
    data: any;
    timestamp: number;
}

type HealthEventListener = (event: HealthEvent) => void;

/**
 * Real-time health monitoring service
 * Simulates WebSocket-like real-time updates for health status
 */
class RealTimeHealthService {
    private static instance: RealTimeHealthService;
    private listeners: HealthEventListener[] = [];
    private isConnected = false;
    private intervalId: NodeJS.Timeout | null = null;
    private lastHealthData: any = null;

    static getInstance(): RealTimeHealthService {
        if (!RealTimeHealthService.instance) {
            RealTimeHealthService.instance = new RealTimeHealthService();
        }
        return RealTimeHealthService.instance;
    }

    // Connect to real-time updates
    connect(): void {
        if (this.isConnected) {
            console.log('🔄 Real-time health service already connected');
            return;
        }

        console.log('🚀 Starting real-time health monitoring...');
        this.isConnected = true;

        // Start polling for health updates every 5 seconds
        this.intervalId = setInterval(async () => {
            await this.checkForUpdates();
        }, 5000);

        // Emit initial connection event
        this.emitEvent({
            type: 'health_update',
            data: { connected: true },
            timestamp: Date.now()
        });
    }

    // Disconnect from real-time updates
    disconnect(): void {
        if (!this.isConnected) {
            return;
        }

        console.log('🛑 Stopping real-time health monitoring');
        this.isConnected = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // Emit disconnection event
        this.emitEvent({
            type: 'health_update',
            data: { connected: false },
            timestamp: Date.now()
        });
    }

    // Check for health updates and emit events if changed
    private async checkForUpdates(): Promise<void> {
        try {
            const { adminHealthService } = await import('../services/adminHealthService');
            const currentHealth = await adminHealthService.getHealthMetrics();

            // Check if health data has changed
            if (this.hasHealthChanged(currentHealth)) {
                console.log('📊 Health metrics changed, broadcasting update');
                
                this.emitEvent({
                    type: 'health_update',
                    data: currentHealth,
                    timestamp: Date.now()
                });

                this.lastHealthData = currentHealth;
            }

            // Check for specific events
            this.checkForSpecificEvents(currentHealth);

        } catch (error) {
            console.warn('⚠️ Failed to check health updates:', error);
            
            // Emit error event
            this.emitEvent({
                type: 'error_logged',
                data: {
                    type: 'HEALTH_CHECK_FAILED',
                    message: `Health check failed: ${error}`,
                    critical: false
                },
                timestamp: Date.now()
            });
        }
    }

    // Check if health data has meaningfully changed
    private hasHealthChanged(newHealth: any): boolean {
        if (!this.lastHealthData) {
            return true;
        }

        const old = this.lastHealthData;
        const current = newHealth;

        // Check key indicators for changes
        return (
            old.appwriteHealth.isHealthy !== current.appwriteHealth.isHealthy ||
            old.appwriteHealth.circuitOpen !== current.appwriteHealth.circuitOpen ||
            old.chatSessions.totalActive !== current.chatSessions.totalActive ||
            old.errorStats.criticalErrors !== current.errorStats.criticalErrors ||
            Math.abs(old.performance.successRate - current.performance.successRate) > 5
        );
    }

    // Check for specific events to broadcast
    private checkForSpecificEvents(healthData: any): void {
        // Circuit breaker state changes
        if (this.lastHealthData && 
            this.lastHealthData.appwriteHealth.circuitOpen !== healthData.appwriteHealth.circuitOpen) {
            
            this.emitEvent({
                type: 'circuit_breaker_change',
                data: {
                    isOpen: healthData.appwriteHealth.circuitOpen,
                    failures: healthData.appwriteHealth.consecutiveFailures
                },
                timestamp: Date.now()
            });
        }

        // Session activity changes
        if (this.lastHealthData && 
            this.lastHealthData.chatSessions.totalActive !== healthData.chatSessions.totalActive) {
            
            this.emitEvent({
                type: 'session_activity',
                data: {
                    previousCount: this.lastHealthData.chatSessions.totalActive,
                    currentCount: healthData.chatSessions.totalActive,
                    change: healthData.chatSessions.totalActive - this.lastHealthData.chatSessions.totalActive
                },
                timestamp: Date.now()
            });
        }
    }

    // Subscribe to health events
    subscribe(listener: HealthEventListener): () => void {
        this.listeners.push(listener);
        console.log(`📡 New health event subscriber (${this.listeners.length} total)`);

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
                console.log(`📡 Health event subscriber removed (${this.listeners.length} remaining)`);
            }
        };
    }

    // Emit event to all listeners
    private emitEvent(event: HealthEvent): void {
        this.listeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.warn('⚠️ Error in health event listener:', error);
            }
        });
    }

    // Manually emit events (for testing or admin actions)
    emitHealthUpdate(data: any): void {
        this.emitEvent({
            type: 'health_update',
            data,
            timestamp: Date.now()
        });
    }

    emitError(type: string, message: string, critical: boolean = false): void {
        this.emitEvent({
            type: 'error_logged',
            data: { type, message, critical },
            timestamp: Date.now()
        });
    }

    // Get connection status
    getConnectionStatus(): { connected: boolean; listeners: number } {
        return {
            connected: this.isConnected,
            listeners: this.listeners.length
        };
    }

    // Force health check (manual refresh)
    async forceHealthCheck(): Promise<void> {
        console.log('🔄 Forcing health check...');
        await this.checkForUpdates();
    }
}

export const realTimeHealthService = RealTimeHealthService.getInstance();

// Auto-start service when imported
if (typeof window !== 'undefined') {
    // Start service after a short delay to allow other services to initialize
    setTimeout(() => {
        realTimeHealthService.connect();
    }, 1000);

    // Clean disconnect on page unload
    window.addEventListener('beforeunload', () => {
        realTimeHealthService.disconnect();
    });
}

export type { HealthEvent, HealthEventListener };
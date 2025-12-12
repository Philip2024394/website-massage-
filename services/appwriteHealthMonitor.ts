import { databases, account } from '../lib/appwrite';

interface HealthStatus {
    isHealthy: boolean;
    lastCheckTime: number;
    consecutiveFailures: number;
    circuitOpen: boolean;
}

class AppwriteHealthMonitor {
    private static instance: AppwriteHealthMonitor;
    private healthStatus: HealthStatus = {
        isHealthy: true,
        lastCheckTime: Date.now(),
        consecutiveFailures: 0,
        circuitOpen: false
    };
    
    private readonly MAX_FAILURES = 3;
    private readonly CIRCUIT_RESET_TIMEOUT = 30000; // 30 seconds
    private readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute
    
    static getInstance(): AppwriteHealthMonitor {
        if (!AppwriteHealthMonitor.instance) {
            AppwriteHealthMonitor.instance = new AppwriteHealthMonitor();
        }
        return AppwriteHealthMonitor.instance;
    }
    
    // Check if Appwrite connection is healthy
    async isHealthy(): Promise<boolean> {
        // If circuit is open, check if enough time has passed to try again
        if (this.healthStatus.circuitOpen) {
            const timeElapsed = Date.now() - this.healthStatus.lastCheckTime;
            if (timeElapsed < this.CIRCUIT_RESET_TIMEOUT) {
                return false; // Circuit still open
            }
            // Try to reset circuit
            console.log('🔄 Attempting to reset circuit breaker...');
        }
        
        try {
            // Simple health check - try to get account (minimal operation)
            await account.get();
            
            // Reset failure count on success
            this.healthStatus = {
                isHealthy: true,
                lastCheckTime: Date.now(),
                consecutiveFailures: 0,
                circuitOpen: false
            };
            
            return true;
        } catch (error) {
            console.warn('🏥 Appwrite health check failed:', error);
            this.recordFailure();
            return false;
        }
    }
    
    private recordFailure(): void {
        this.healthStatus.consecutiveFailures++;
        this.healthStatus.lastCheckTime = Date.now();
        this.healthStatus.isHealthy = false;
        
        // Open circuit if too many failures
        if (this.healthStatus.consecutiveFailures >= this.MAX_FAILURES) {
            this.healthStatus.circuitOpen = true;
            console.error(`🚨 Circuit breaker opened after ${this.MAX_FAILURES} consecutive failures. Chat will use local fallback.`);
        }
    }
    
    // Get current connection status
    getStatus(): HealthStatus {
        return { ...this.healthStatus };
    }
    
    // Force circuit breaker open (for testing)
    openCircuit(): void {
        this.healthStatus.circuitOpen = true;
        this.healthStatus.lastCheckTime = Date.now();
        console.log('🔧 Circuit breaker manually opened');
    }
    
    // Force circuit breaker closed (for recovery)
    closeCircuit(): void {
        this.healthStatus = {
            isHealthy: true,
            lastCheckTime: Date.now(),
            consecutiveFailures: 0,
            circuitOpen: false
        };
        console.log('🔧 Circuit breaker manually closed');
    }
    
    // Start periodic health monitoring
    startHealthMonitoring(): void {
        setInterval(async () => {
            await this.isHealthy();
        }, this.HEALTH_CHECK_INTERVAL);
        
        console.log('🏥 Started Appwrite health monitoring');
    }
}

export const appwriteHealthMonitor = AppwriteHealthMonitor.getInstance();

// Auto-start health monitoring
if (typeof window !== 'undefined') {
    appwriteHealthMonitor.startHealthMonitoring();
}
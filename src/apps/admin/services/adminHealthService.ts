import { appwriteHealthMonitor } from '../../../../services/appwriteHealthMonitor';
import { chatSessionService } from '../../../../services/chatSessionService';

interface SystemHealthMetrics {
    appwriteHealth: {
        isHealthy: boolean;
        circuitOpen: boolean;
        consecutiveFailures: number;
        lastCheckTime: number;
    };
    chatSessions: {
        totalActive: number;
        expiredCount: number;
        lastCleanup: number;
    };
    errorStats: {
        last24Hours: number;
        lastHour: number;
        criticalErrors: number;
    };
    performance: {
        avgResponseTime: number;
        successRate: number;
        timeouts: number;
    };
}

class AdminHealthService {
    private static instance: AdminHealthService;
    private errorLog: Array<{ timestamp: number; type: string; message: string; critical: boolean }> = [];
    private performanceMetrics: Array<{ timestamp: number; responseTime: number; success: boolean }> = [];

    static getInstance(): AdminHealthService {
        if (!AdminHealthService.instance) {
            AdminHealthService.instance = new AdminHealthService();
        }
        return AdminHealthService.instance;
    }

    // Log errors for tracking
    logError(type: string, message: string, critical: boolean = false): void {
        this.errorLog.push({
            timestamp: Date.now(),
            type,
            message,
            critical
        });

        // Keep only last 1000 errors to prevent memory issues
        if (this.errorLog.length > 1000) {
            this.errorLog = this.errorLog.slice(-500);
        }

        console.log(`🚨 [${type}] ${message}`, { critical });
    }

    // Log performance metrics
    logPerformance(responseTime: number, success: boolean): void {
        this.performanceMetrics.push({
            timestamp: Date.now(),
            responseTime,
            success
        });

        // Keep only last 100 metrics
        if (this.performanceMetrics.length > 100) {
            this.performanceMetrics = this.performanceMetrics.slice(-50);
        }
    }

    // Get comprehensive health metrics
    async getHealthMetrics(): Promise<SystemHealthMetrics> {
        try {
            const now = Date.now();
            const oneHourAgo = now - (60 * 60 * 1000);
            const oneDayAgo = now - (24 * 60 * 60 * 1000);

            // Get Appwrite health status
            const appwriteStatus = appwriteHealthMonitor.getStatus();

            // Get active chat sessions
            let activeSessions = 0;
            let expiredCount = 0;
            try {
                const sessions = await chatSessionService.listActiveSessions(100);
                activeSessions = sessions.length;
                
                // Count potentially expired sessions
                sessions.forEach(session => {
                    if (session.expiresAt && new Date(session.expiresAt) <= new Date()) {
                        expiredCount++;
                    }
                });
            } catch (error) {
                console.warn('Could not fetch session metrics:', error);
            }

            // Calculate error statistics
            const recentErrors = this.errorLog.filter(err => err.timestamp >= oneDayAgo);
            const hourlyErrors = this.errorLog.filter(err => err.timestamp >= oneHourAgo);
            const criticalErrors = this.errorLog.filter(err => err.critical && err.timestamp >= oneDayAgo);

            // Calculate performance metrics
            const recentMetrics = this.performanceMetrics.filter(m => m.timestamp >= oneHourAgo);
            const avgResponseTime = recentMetrics.length > 0 
                ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length 
                : 0;
            const successRate = recentMetrics.length > 0 
                ? (recentMetrics.filter(m => m.success).length / recentMetrics.length) * 100 
                : 100;
            const timeouts = recentMetrics.filter(m => !m.success && m.responseTime > 10000).length;

            return {
                appwriteHealth: {
                    isHealthy: appwriteStatus.isHealthy,
                    circuitOpen: appwriteStatus.circuitOpen,
                    consecutiveFailures: appwriteStatus.consecutiveFailures,
                    lastCheckTime: appwriteStatus.lastCheckTime
                },
                chatSessions: {
                    totalActive: activeSessions,
                    expiredCount,
                    lastCleanup: now // TODO: Track actual cleanup times
                },
                errorStats: {
                    last24Hours: recentErrors.length,
                    lastHour: hourlyErrors.length,
                    criticalErrors: criticalErrors.length
                },
                performance: {
                    avgResponseTime: Math.round(avgResponseTime),
                    successRate: Math.round(successRate * 100) / 100,
                    timeouts
                }
            };
        } catch (error) {
            console.error('Failed to get health metrics:', error);
            throw error;
        }
    }

    // Admin controls
    async forceCircuitBreakerOpen(): Promise<void> {
        appwriteHealthMonitor.openCircuit();
        this.logError('ADMIN_ACTION', 'Circuit breaker manually opened', false);
    }

    async forceCircuitBreakerClose(): Promise<void> {
        appwriteHealthMonitor.closeCircuit();
        this.logError('ADMIN_ACTION', 'Circuit breaker manually closed', false);
    }

    async cleanupExpiredSessions(): Promise<{ cleaned: number }> {
        try {
            const beforeCount = (await chatSessionService.listActiveSessions(1000)).length;
            await chatSessionService.cleanupExpiredSessions();
            const afterCount = (await chatSessionService.listActiveSessions(1000)).length;
            
            const cleaned = beforeCount - afterCount;
            this.logError('ADMIN_ACTION', `Manually cleaned ${cleaned} expired sessions`, false);
            
            return { cleaned };
        } catch (error) {
            this.logError('CLEANUP_ERROR', `Failed to cleanup sessions: ${error}`, true);
            throw error;
        }
    }

    async testAppwriteConnection(): Promise<{ success: boolean; responseTime: number; error?: string }> {
        const startTime = Date.now();
        try {
            const isHealthy = await appwriteHealthMonitor.isHealthy();
            const responseTime = Date.now() - startTime;
            
            this.logPerformance(responseTime, isHealthy);
            
            return {
                success: isHealthy,
                responseTime
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.logPerformance(responseTime, false);
            this.logError('CONNECTION_TEST', `Connection test failed: ${error}`, false);
            
            return {
                success: false,
                responseTime,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    // Get recent error log for admin review
    getRecentErrors(limit: number = 50): Array<{ timestamp: number; type: string; message: string; critical: boolean }> {
        return this.errorLog
            .slice(-limit)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    // Clear error logs
    clearErrorLogs(): void {
        this.errorLog = [];
        console.log('🧹 Admin cleared error logs');
    }
}

export const adminHealthService = AdminHealthService.getInstance();

// Auto-integrate with existing error logging systems
if (typeof window !== 'undefined') {
    // Hook into console.error to automatically log errors
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
        originalConsoleError(...args);
        
        // Extract error information
        const errorMessage = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        adminHealthService.logError('CONSOLE_ERROR', errorMessage, false);
    };

    // Hook into window.onerror for unhandled errors
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
        adminHealthService.logError('UNHANDLED_ERROR', 
            `${message} at ${source}:${lineno}:${colno}`, 
            true
        );
        
        if (originalOnError) {
            return originalOnError(message, source, lineno, colno, error);
        }
        return false;
    };
}
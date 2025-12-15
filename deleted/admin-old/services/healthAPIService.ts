import { adminHealthService } from '../services/adminHealthService';
import { chatSessionService } from '../../../../services/chatSessionService';
import { appwriteHealthMonitor } from '../../../../services/appwriteHealthMonitor';

interface HealthAPIEndpoint {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    handler: (params?: any) => Promise<any>;
    requiresAuth: boolean;
}

/**
 * Mock API service for health monitoring
 * In a real app, these would be actual REST endpoints
 */
class HealthAPIService {
    private endpoints: HealthAPIEndpoint[] = [
        {
            path: '/api/health/status',
            method: 'GET',
            handler: this.getHealthStatus.bind(this),
            requiresAuth: true
        },
        {
            path: '/api/health/metrics',
            method: 'GET', 
            handler: this.getDetailedMetrics.bind(this),
            requiresAuth: true
        },
        {
            path: '/api/health/errors',
            method: 'GET',
            handler: this.getErrorLogs.bind(this),
            requiresAuth: true
        },
        {
            path: '/api/health/circuit-breaker/open',
            method: 'POST',
            handler: this.openCircuitBreaker.bind(this),
            requiresAuth: true
        },
        {
            path: '/api/health/circuit-breaker/close',
            method: 'POST', 
            handler: this.closeCircuitBreaker.bind(this),
            requiresAuth: true
        },
        {
            path: '/api/health/sessions/cleanup',
            method: 'POST',
            handler: this.cleanupSessions.bind(this),
            requiresAuth: true
        },
        {
            path: '/api/health/test-connection',
            method: 'POST',
            handler: this.testConnection.bind(this),
            requiresAuth: true
        },
        {
            path: '/api/health/errors/clear',
            method: 'DELETE',
            handler: this.clearErrorLogs.bind(this),
            requiresAuth: true
        }
    ];

    // Get basic health status
    private async getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        timestamp: number;
        services: Record<string, boolean>;
    }> {
        try {
            const metrics = await adminHealthService.getHealthMetrics();
            
            // Determine overall status
            let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
            
            if (metrics.appwriteHealth.circuitOpen || !metrics.appwriteHealth.isHealthy) {
                status = 'unhealthy';
            } else if (metrics.errorStats.criticalErrors > 0 || metrics.performance.successRate < 95) {
                status = 'degraded';
            }

            return {
                status,
                timestamp: Date.now(),
                services: {
                    appwrite: metrics.appwriteHealth.isHealthy,
                    chatSessions: metrics.chatSessions.totalActive >= 0,
                    circuitBreaker: !metrics.appwriteHealth.circuitOpen
                }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                timestamp: Date.now(),
                services: {
                    appwrite: false,
                    chatSessions: false,
                    circuitBreaker: false
                }
            };
        }
    }

    // Get detailed metrics
    private async getDetailedMetrics(): Promise<any> {
        return await adminHealthService.getHealthMetrics();
    }

    // Get error logs
    private async getErrorLogs(params?: { limit?: number }): Promise<any> {
        const limit = params?.limit || 50;
        return {
            errors: adminHealthService.getRecentErrors(limit),
            totalCount: adminHealthService.getRecentErrors(1000).length
        };
    }

    // Open circuit breaker
    private async openCircuitBreaker(): Promise<{ success: boolean; message: string }> {
        try {
            await adminHealthService.forceCircuitBreakerOpen();
            return {
                success: true,
                message: 'Circuit breaker opened successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to open circuit breaker: ${error}`
            };
        }
    }

    // Close circuit breaker
    private async closeCircuitBreaker(): Promise<{ success: boolean; message: string }> {
        try {
            await adminHealthService.forceCircuitBreakerClose();
            return {
                success: true,
                message: 'Circuit breaker closed successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to close circuit breaker: ${error}`
            };
        }
    }

    // Cleanup expired sessions
    private async cleanupSessions(): Promise<{ success: boolean; cleaned: number; message: string }> {
        try {
            const result = await adminHealthService.cleanupExpiredSessions();
            return {
                success: true,
                cleaned: result.cleaned,
                message: `Successfully cleaned ${result.cleaned} expired sessions`
            };
        } catch (error) {
            return {
                success: false,
                cleaned: 0,
                message: `Failed to cleanup sessions: ${error}`
            };
        }
    }

    // Test Appwrite connection
    private async testConnection(): Promise<{ success: boolean; responseTime: number; error?: string }> {
        return await adminHealthService.testAppwriteConnection();
    }

    // Clear error logs
    private async clearErrorLogs(): Promise<{ success: boolean; message: string }> {
        try {
            adminHealthService.clearErrorLogs();
            return {
                success: true,
                message: 'Error logs cleared successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to clear error logs: ${error}`
            };
        }
    }

    // Mock API call method (simulates HTTP requests)
    async callAPI(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', params?: any): Promise<any> {
        const endpoint = this.endpoints.find(e => e.path === path && e.method === method);
        
        if (!endpoint) {
            throw new Error(`API endpoint not found: ${method} ${path}`);
        }

        // In a real app, check authentication here
        if (endpoint.requiresAuth) {
            // Mock auth check - always pass for admin
            console.log(`🔒 API call authenticated: ${method} ${path}`);
        }

        try {
            const result = await endpoint.handler(params);
            console.log(`✅ API call successful: ${method} ${path}`, result);
            return {
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ API call failed: ${method} ${path}`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            };
        }
    }

    // Get all available endpoints (for documentation)
    getEndpoints(): HealthAPIEndpoint[] {
        return this.endpoints.map(e => ({
            path: e.path,
            method: e.method,
            requiresAuth: e.requiresAuth,
            handler: null as any // Don't expose handlers
        }));
    }

    // Health check endpoint (always available)
    async ping(): Promise<{ status: string; timestamp: number }> {
        return {
            status: 'ok',
            timestamp: Date.now()
        };
    }
}

export const healthAPIService = new HealthAPIService();

// Export types for use in components
export type { HealthAPIEndpoint };
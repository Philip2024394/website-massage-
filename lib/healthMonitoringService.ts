import { databases, account, DATABASE_ID, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';

/**
 * 🏥 System Health Monitoring Service
 * Comprehensive health checks for IndaStreet Massage Application
 * 
 * Features:
 * - Database connectivity checks
 * - Collection accessibility verification
 * - Authentication service health
 * - API response time monitoring
 * - Service dependency checks
 */

export interface HealthCheckResult {
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    message?: string;
    details?: Record<string, any>;
    timestamp: string;
}

export interface SystemHealthReport {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    score: number; // 0-100
    checks: HealthCheckResult[];
    summary: {
        total: number;
        healthy: number;
        degraded: number;
        unhealthy: number;
    };
    generatedAt: string;
    responseTime: number;
}

export interface ServiceEndpoint {
    name: string;
    url?: string;
    check: () => Promise<HealthCheckResult>;
    critical: boolean; // If true, failure affects overall health
}

class HealthMonitoringService {
    private readonly HEALTH_COLLECTION = 'system_health_logs';
    private readonly CHECK_TIMEOUT = 10000; // 10 seconds
    
    constructor() {
        console.log('🏥 Health monitoring service initialized');
    }

    /**
     * Perform comprehensive system health check
     */
    async performHealthCheck(): Promise<SystemHealthReport> {
        const startTime = Date.now();
        const checks: HealthCheckResult[] = [];

        console.log('🏥 Starting comprehensive health check...');

        // Define all health check endpoints
        const endpoints: ServiceEndpoint[] = [
            {
                name: 'Database Connection',
                check: this.checkDatabaseConnection.bind(this),
                critical: true
            },
            {
                name: 'Authentication Service',
                check: this.checkAuthenticationService.bind(this),
                critical: true
            },
            {
                name: 'Therapists Collection',
                check: () => this.checkCollectionHealth('therapists', COLLECTIONS.THERAPISTS),
                critical: true
            },
            {
                name: 'Places Collection',
                check: () => this.checkCollectionHealth('places', COLLECTIONS.PLACES),
                critical: true
            },
            {
                name: 'Bookings Collection',
                check: () => this.checkCollectionHealth('bookings', COLLECTIONS.BOOKINGS),
                critical: true
            },
            {
                name: 'Chat Messages Collection',
                check: () => this.checkCollectionHealth('messages', (COLLECTIONS as any).MESSAGES),
                critical: false
            },
            {
                name: 'Notifications Collection',
                check: () => this.checkCollectionHealth('notifications', COLLECTIONS.NOTIFICATIONS),
                critical: false
            },
            {
                name: 'Reviews Collection',
                check: () => this.checkCollectionHealth('reviews', 'reviews_collection_id'),
                critical: false
            },
            {
                name: 'Analytics Collection',
                check: () => this.checkCollectionHealth('analytics', 'user_analytics'),
                critical: false
            },
            {
                name: 'System Performance',
                check: this.checkSystemPerformance.bind(this),
                critical: false
            }
        ];

        // Run all health checks
        for (const endpoint of endpoints) {
            try {
                const result = await this.runWithTimeout(endpoint.check(), this.CHECK_TIMEOUT);
                checks.push(result);
                console.log(`✅ ${endpoint.name}: ${result.status} (${result.responseTime}ms)`);
            } catch (error) {
                const result: HealthCheckResult = {
                    service: endpoint.name,
                    status: 'unhealthy',
                    responseTime: this.CHECK_TIMEOUT,
                    message: `Timeout or error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    timestamp: new Date().toISOString()
                };
                checks.push(result);
                console.error(`❌ ${endpoint.name}: Failed`, error);
            }
        }

        // Calculate overall health
        const summary = this.calculateHealthSummary(checks);
        const overall = this.determineOverallHealth(checks, endpoints);
        const score = this.calculateHealthScore(checks);
        const totalResponseTime = Date.now() - startTime;

        const report: SystemHealthReport = {
            overall,
            score,
            checks,
            summary,
            generatedAt: new Date().toISOString(),
            responseTime: totalResponseTime
        };

        // Log health report to database for monitoring
        await this.logHealthReport(report);

        console.log(`🏥 Health check completed: ${overall} (Score: ${score}/100, Time: ${totalResponseTime}ms)`);
        return report;
    }

    /**
     * Check database connectivity
     */
    private async checkDatabaseConnection(): Promise<HealthCheckResult> {
        const startTime = Date.now();
        
        try {
            // Try to list databases to check connection
            const result = await databases.list();
            const responseTime = Date.now() - startTime;

            return {
                service: 'Database Connection',
                status: 'healthy',
                responseTime,
                message: `Connected successfully. Found ${result.databases?.length || 0} databases.`,
                details: {
                    databaseCount: result.databases?.length || 0,
                    endpoint: 'databases.list()'
                },
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            const responseTime = Date.now() - startTime;
            return {
                service: 'Database Connection',
                status: 'unhealthy',
                responseTime,
                message: `Database connection failed: ${error.message}`,
                details: {
                    error: error.code || 'unknown',
                    type: error.type || 'connection_error'
                },
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Check authentication service
     */
    private async checkAuthenticationService(): Promise<HealthCheckResult> {
        const startTime = Date.now();
        
        try {
            // Try to get current session (will fail if not logged in, but service is working)
            await account.get();
            const responseTime = Date.now() - startTime;

            return {
                service: 'Authentication Service',
                status: 'healthy',
                responseTime,
                message: 'Authentication service is working (user session found)',
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            const responseTime = Date.now() - startTime;
            
            // 401 is expected when not logged in - service is still healthy
            if (error.code === 401) {
                return {
                    service: 'Authentication Service',
                    status: 'healthy',
                    responseTime,
                    message: 'Authentication service is working (no active session)',
                    timestamp: new Date().toISOString()
                };
            }

            return {
                service: 'Authentication Service',
                status: 'unhealthy',
                responseTime,
                message: `Authentication service error: ${error.message}`,
                details: {
                    error: error.code || 'unknown',
                    type: error.type || 'auth_error'
                },
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Check specific collection health
     */
    private async checkCollectionHealth(name: string, collectionId: string): Promise<HealthCheckResult> {
        const startTime = Date.now();
        
        try {
            // Try to list documents with limit to check accessibility
            const result = await databases.listDocuments(
                DATABASE_ID,
                collectionId,
                [Query.limit(1)]
            );

            const responseTime = Date.now() - startTime;
            const documentCount = result.total || 0;

            let status: HealthCheckResult['status'] = 'healthy';
            let message = `Collection accessible with ${documentCount} total documents`;

            // Determine status based on collection importance and content
            if (name === 'therapists' || name === 'places') {
                if (documentCount === 0) {
                    status = 'degraded';
                    message += ' (Warning: No data found in critical collection)';
                }
            }

            return {
                service: `${name} Collection`,
                status,
                responseTime,
                message,
                details: {
                    collectionId,
                    documentCount,
                    sampleDocuments: result.documents?.length || 0
                },
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            const responseTime = Date.now() - startTime;
            
            let status: HealthCheckResult['status'] = 'unhealthy';
            let message = `Collection access failed: ${error.message}`;

            // 404 means collection doesn't exist
            if (error.code === 404) {
                status = 'degraded';
                message = 'Collection not found (may be optional)';
            }

            return {
                service: `${name} Collection`,
                status,
                responseTime,
                message,
                details: {
                    collectionId,
                    error: error.code || 'unknown',
                    type: error.type || 'collection_error'
                },
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Check system performance metrics
     */
    private async checkSystemPerformance(): Promise<HealthCheckResult> {
        const startTime = Date.now();
        
        try {
            // Perform a series of operations to test performance
            const testOperations = [
                () => databases.listDocuments(DATABASE_ID, COLLECTIONS.THERAPISTS, [Query.limit(5)]),
                () => databases.listDocuments(DATABASE_ID, COLLECTIONS.PLACES, [Query.limit(5)])
            ];

            const operationTimes: number[] = [];
            
            for (const operation of testOperations) {
                const opStart = Date.now();
                await operation();
                operationTimes.push(Date.now() - opStart);
            }

            const averageResponseTime = operationTimes.reduce((a, b) => a + b, 0) / operationTimes.length;
            const totalResponseTime = Date.now() - startTime;

            let status: HealthCheckResult['status'] = 'healthy';
            let message = `Performance test completed. Average response: ${Math.round(averageResponseTime)}ms`;

            if (averageResponseTime > 2000) {
                status = 'degraded';
                message += ' (Warning: Slow response times detected)';
            } else if (averageResponseTime > 5000) {
                status = 'unhealthy';
                message += ' (Critical: Very slow response times)';
            }

            return {
                service: 'System Performance',
                status,
                responseTime: totalResponseTime,
                message,
                details: {
                    averageResponseTime: Math.round(averageResponseTime),
                    operationCount: testOperations.length,
                    individualTimes: operationTimes.map(t => Math.round(t))
                },
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            return {
                service: 'System Performance',
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: `Performance test failed: ${error.message}`,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get health history for monitoring trends
     */
    async getHealthHistory(hours: number = 24): Promise<SystemHealthReport[]> {
        try {
            const startDate = new Date(Date.now() - (hours * 60 * 60 * 1000));
            
            const result = await databases.listDocuments(
                DATABASE_ID,
                this.HEALTH_COLLECTION,
                [
                    Query.greaterThan('generatedAt', startDate.toISOString()),
                    Query.orderDesc('generatedAt'),
                    Query.limit(100)
                ]
            );

            return result.documents as SystemHealthReport[];
        } catch (error) {
            console.error('Error fetching health history:', error);
            return [];
        }
    }

    /**
     * Get current system status summary
     */
    async getSystemStatus(): Promise<{
        status: 'operational' | 'degraded' | 'maintenance';
        uptime: number;
        lastCheck: string;
        criticalIssues: string[];
        activeIncidents: number;
    }> {
        try {
            const latestHealth = await this.performHealthCheck();
            const history = await this.getHealthHistory(24);

            // Calculate uptime (percentage of healthy checks in last 24h)
            const healthyChecks = history.filter(h => h.overall === 'healthy').length;
            const uptime = history.length > 0 ? (healthyChecks / history.length) * 100 : 100;

            // Find critical issues
            const criticalIssues = latestHealth.checks
                .filter(check => check.status === 'unhealthy')
                .map(check => check.message || `${check.service} is unhealthy`);

            return {
                status: latestHealth.overall === 'healthy' ? 'operational' : 
                       latestHealth.overall === 'degraded' ? 'degraded' : 'maintenance',
                uptime: Math.round(uptime * 100) / 100,
                lastCheck: latestHealth.generatedAt,
                criticalIssues,
                activeIncidents: criticalIssues.length
            };
        } catch (error) {
            console.error('Error getting system status:', error);
            return {
                status: 'maintenance',
                uptime: 0,
                lastCheck: new Date().toISOString(),
                criticalIssues: ['Unable to perform health checks'],
                activeIncidents: 1
            };
        }
    }

    /**
     * Helper methods
     */
    private async runWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Operation timeout')), timeout);
        });

        return Promise.race([promise, timeoutPromise]);
    }

    private calculateHealthSummary(checks: HealthCheckResult[]) {
        const healthy = checks.filter(c => c.status === 'healthy').length;
        const degraded = checks.filter(c => c.status === 'degraded').length;
        const unhealthy = checks.filter(c => c.status === 'unhealthy').length;

        return {
            total: checks.length,
            healthy,
            degraded,
            unhealthy
        };
    }

    private determineOverallHealth(checks: HealthCheckResult[], endpoints: ServiceEndpoint[]): SystemHealthReport['overall'] {
        // Check critical services first
        const criticalChecks = checks.filter((check, index) => endpoints[index]?.critical);
        const hasCriticalFailures = criticalChecks.some(check => check.status === 'unhealthy');
        
        if (hasCriticalFailures) {
            return 'unhealthy';
        }

        const hasAnyFailures = checks.some(check => check.status === 'unhealthy');
        const hasDegradedServices = checks.some(check => check.status === 'degraded');

        if (hasAnyFailures || hasDegradedServices) {
            return 'degraded';
        }

        return 'healthy';
    }

    private calculateHealthScore(checks: HealthCheckResult[]): number {
        if (checks.length === 0) return 0;

        const scores = checks.map(check => {
            switch (check.status) {
                case 'healthy': return 100;
                case 'degraded': return 50;
                case 'unhealthy': return 0;
                default: return 0;
            }
        });

        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    private async logHealthReport(report: SystemHealthReport): Promise<void> {
        try {
            await databases.createDocument(
                DATABASE_ID,
                this.HEALTH_COLLECTION,
                `health_${Date.now()}`,
                {
                    ...report,
                    // Store checks as JSON string for Appwrite
                    checks: JSON.stringify(report.checks),
                    summary: JSON.stringify(report.summary)
                }
            );
        } catch (error) {
            console.warn('Failed to log health report:', error);
            // Don't throw - health monitoring should be resilient
        }
    }
}

// Export singleton instance
export const healthMonitoringService = new HealthMonitoringService();

// Export convenience methods
export const performHealthCheck = () => healthMonitoringService.performHealthCheck();
export const getSystemStatus = () => healthMonitoringService.getSystemStatus();
export const getHealthHistory = (hours?: number) => healthMonitoringService.getHealthHistory(hours);

export default healthMonitoringService;
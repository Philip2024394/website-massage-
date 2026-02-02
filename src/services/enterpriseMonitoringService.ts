import { logger } from './enterpriseLogger';
/**
 * 🏢 ENTERPRISE MONITORING & OBSERVABILITY SERVICE
 * 
 * Real-time application health monitoring and observability
 * - System health checks
 * - Business metrics tracking
 * - Real-time alerting system
 * - Application performance insights
 * - User behavior analytics
 * - Error tracking and reporting
 * 
 * Based on Netflix Hystrix patterns and DataDog monitoring standards
 */

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: Date;
  details?: Record<string, any>;
  dependencies?: HealthCheck[];
}

export interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  alertThreshold?: number;
  critical?: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  cooldownMs: number;
  lastTriggered?: Date;
}

export interface MonitoringEvent {
  id: string;
  type: 'health' | 'business' | 'error' | 'performance' | 'user';
  message: string;
  data: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  network: {
    online: boolean;
    connectionType: string;
    downlink: number;
  };
  storage: {
    used: number;
    available: number;
    percentage: number;
  };
  timestamp: Date;
}

class EnterpriseMonitoringService {
  private healthChecks = new Map<string, HealthCheck>();
  private businessMetrics: BusinessMetric[] = [];
  private alertRules: AlertRule[] = [];
  private events: MonitoringEvent[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private sessionId: string;
  private isMonitoring = false;
  private healthCheckInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;
  private startupTime: number;

  // Service endpoints to monitor
  private services = [
    { name: 'appwrite', url: '/v1/health', critical: true },
    { name: 'database', url: '/v1/health/db', critical: true },
    { name: 'storage', url: '/v1/health/storage', critical: false },
    { name: 'messaging', url: '/v1/health/messaging', critical: false }
  ];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startupTime = Date.now();
    this.initializeDefaultAlerts();
    this.startMonitoring();
    logger.info('🏢 Enterprise monitoring service initialized');
  }

  /**
   * Start comprehensive monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    logger.info('🔍 Starting enterprise monitoring...');
    
    this.isMonitoring = true;
    
    // Start health checks every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.runHealthChecks();
    }, 30000);

    // Start system metrics collection every 10 seconds  
    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 10000);

    // Initial health check
    this.runHealthChecks();
    this.collectSystemMetrics();

    // Monitor page visibility for user engagement tracking
    this.setupVisibilityTracking();

    // Monitor unhandled errors
    this.setupErrorTracking();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    logger.info('⏹️ Stopping enterprise monitoring...');
    
    this.isMonitoring = false;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }

  /**
   * Run health checks on all services
   */
  private async runHealthChecks(): Promise<void> {
    logger.info('🏥 Running health checks...');
    
    const healthPromises = this.services.map(service => 
      this.checkServiceHealth(service.name, service.url, service.critical)
    );

    try {
      await Promise.allSettled(healthPromises);
      
      // Calculate overall system health
      const overallHealth = this.calculateOverallHealth();
      this.recordHealthCheck('system', overallHealth);
      
    } catch (error) {
      this.recordEvent({
        type: 'error',
        message: 'Health check execution failed',
        data: { error: String(error) },
        severity: 'critical'
      });
    }
  }

  /**
   * Check individual service health
   */
  private async checkServiceHealth(
    serviceName: string, 
    endpoint: string, 
    critical: boolean
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      // For demo purposes, we'll simulate health checks
      // In production, these would be actual API calls
      const isHealthy = Math.random() > 0.05; // 95% uptime simulation
      const responseTime = Math.random() * 200 + 50; // 50-250ms
      
      await new Promise(resolve => setTimeout(resolve, responseTime));
      
      const healthCheck: HealthCheck = {
        service: serviceName,
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        details: {
          endpoint,
          critical,
          simulatedCheck: true
        }
      };

      this.healthChecks.set(serviceName, healthCheck);

      if (!isHealthy && critical) {
        this.recordEvent({
          type: 'health',
          message: `Critical service ${serviceName} is degraded`,
          data: healthCheck,
          severity: 'critical'
        });
      }

    } catch (error) {
      const healthCheck: HealthCheck = {
        service: serviceName,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        details: {
          endpoint,
          critical,
          error: String(error)
        }
      };

      this.healthChecks.set(serviceName, healthCheck);

      this.recordEvent({
        type: 'health',
        message: `Service ${serviceName} health check failed`,
        data: healthCheck,
        severity: critical ? 'critical' : 'error'
      });
    }
  }

  /**
   * Calculate overall system health
   */
  private calculateOverallHealth(): HealthCheck['status'] {
    const allHealthChecks = Array.from(this.healthChecks.values());
    
    if (allHealthChecks.length === 0) return 'unhealthy';
    
    const unhealthyCount = allHealthChecks.filter(h => h.status === 'unhealthy').length;
    const degradedCount = allHealthChecks.filter(h => h.status === 'degraded').length;
    
    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0) return 'degraded';
    
    return 'healthy';
  }

  /**
   * Record health check result
   */
  private recordHealthCheck(serviceName: string, status: HealthCheck['status']): void {
    const healthCheck: HealthCheck = {
      service: serviceName,
      status,
      responseTime: 0,
      timestamp: new Date(),
      dependencies: Array.from(this.healthChecks.values())
    };

    this.healthChecks.set(serviceName, healthCheck);
    
    logger.info(`🏥 ${serviceName} health: ${status}`);
  }

  /**
   * Collect system metrics
   */
  private collectSystemMetrics(): void {
    if (typeof window === 'undefined') return;

    const metrics: SystemMetrics = {
      cpu: this.getCPUUsage(),
      memory: this.getMemoryUsage(),
      network: this.getNetworkInfo(),
      storage: this.getStorageInfo(),
      timestamp: new Date()
    };

    this.systemMetrics.push(metrics);

    // Keep only last 100 metric entries
    if (this.systemMetrics.length > 100) {
      this.systemMetrics = this.systemMetrics.slice(-100);
    }

    // Check for system alerts
    this.checkSystemAlerts(metrics);
  }

  /**
   * Get CPU usage (simulated for web environment)
   */
  private getCPUUsage(): number {
    // In a web environment, we can't directly measure CPU
    // This simulates CPU usage based on performance timing
    if ('performance' in window) {
      const now = performance.now();
      const lastTime = (window as any)._lastCPUCheck || now;
      (window as any)._lastCPUCheck = now;
      
      const delta = now - lastTime;
      return Math.min(100, Math.max(0, (delta - 16) / 16 * 100)); // Based on 60fps budget
    }
    return 0;
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if ('performance' in window && (performance as any).memory) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }

  /**
   * Get network information
   */
  private getNetworkInfo(): SystemMetrics['network'] {
    const defaultNetwork = {
      online: true,
      connectionType: 'unknown',
      downlink: 0
    };

    if (!('navigator' in window)) return defaultNetwork;

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    return {
      online: navigator.onLine,
      connectionType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0
    };
  }

  /**
   * Get storage information
   */
  private getStorageInfo(): SystemMetrics['storage'] {
    // Estimate localStorage usage
    let used = 0;
    
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      }
    } catch (error) {
      // Storage access denied or not available
    }

    const estimated = used * 2; // Rough estimate including overhead
    const limit = 5 * 1024 * 1024; // 5MB typical localStorage limit

    return {
      used: estimated,
      available: limit - estimated,
      percentage: (estimated / limit) * 100
    };
  }

  /**
   * Check system alerts
   */
  private checkSystemAlerts(metrics: SystemMetrics): void {
    // Skip memory alerts during initialization phase (first 10 seconds)
    const timeSinceStartup = Date.now() - this.startupTime;
    const isInitPhase = timeSinceStartup < 10000;
    
    // Memory usage alert (suppressed during initialization)
    if (metrics.memory > 80 && !isInitPhase) {
      this.recordEvent({
        type: 'performance',
        message: 'High memory usage detected',
        data: { memoryUsage: `${metrics.memory.toFixed(1)}%` },
        severity: metrics.memory > 90 ? 'critical' : 'warning'
      });
    }

    // Storage usage alert
    if (metrics.storage.percentage > 80) {
      this.recordEvent({
        type: 'performance',
        message: 'High storage usage detected',
        data: { storageUsage: `${metrics.storage.percentage.toFixed(1)}%` },
        severity: metrics.storage.percentage > 95 ? 'critical' : 'warning'
      });
    }

    // Network connectivity alert
    if (!metrics.network.online) {
      this.recordEvent({
        type: 'performance',
        message: 'Network connectivity lost',
        data: metrics.network,
        severity: 'warning'
      });
    }
  }

  /**
   * Record business metric
   */
  recordBusinessMetric(params: {
    name: string;
    value: number;
    unit: string;
    tags?: Record<string, string>;
    alertThreshold?: number;
    critical?: boolean;
  }): void {
    const metric: BusinessMetric = {
      id: this.generateMetricId(),
      name: params.name,
      value: params.value,
      unit: params.unit,
      timestamp: new Date(),
      tags: params.tags || {},
      alertThreshold: params.alertThreshold,
      critical: params.critical
    };

    this.businessMetrics.push(metric);

    // Check alert thresholds
    if (params.alertThreshold && params.value > params.alertThreshold) {
      this.recordEvent({
        type: 'business',
        message: `Business metric threshold exceeded: ${params.name}`,
        data: metric,
        severity: params.critical ? 'critical' : 'warning'
      });
    }

    logger.info(`📊 Business metric [${params.name}]: ${params.value}${params.unit}`);
  }

  /**
   * Record monitoring event
   */
  recordEvent(params: {
    type: MonitoringEvent['type'];
    message: string;
    data: Record<string, any>;
    severity: MonitoringEvent['severity'];
    userId?: string;
  }): void {
    const event: MonitoringEvent = {
      id: this.generateEventId(),
      type: params.type,
      message: params.message,
      data: params.data,
      severity: params.severity,
      timestamp: new Date(),
      userId: params.userId,
      sessionId: this.sessionId
    };

    this.events.push(event);

    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Log critical events
    if (params.severity === 'critical') {
      logger.error(`🚨 CRITICAL: ${params.message}`, params.data);
    } else if (params.severity === 'error') {
      logger.error(`❌ ERROR: ${params.message}`, params.data);
    } else if (params.severity === 'warning') {
      logger.warn(`⚠️ WARNING: ${params.message}`, params.data);
    } else {
      logger.info(`ℹ️ INFO: ${params.message}`, params.data);
    }

    // Trigger alerts if rules match
    this.checkAlertRules(event);
  }

  /**
   * Check alert rules against event
   */
  private checkAlertRules(event: MonitoringEvent): void {
    this.alertRules
      .filter(rule => rule.enabled)
      .forEach(rule => {
        if (this.evaluateAlertCondition(rule, event)) {
          this.triggerAlert(rule, event);
        }
      });
  }

  /**
   * Evaluate alert condition
   */
  private evaluateAlertCondition(rule: AlertRule, event: MonitoringEvent): boolean {
    // Check cooldown
    if (rule.lastTriggered) {
      const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
      if (timeSinceLastTrigger < rule.cooldownMs) {
        return false;
      }
    }

    // Simple condition evaluation (extend for complex rules)
    const condition = rule.condition.toLowerCase();
    const eventType = event.type.toLowerCase();
    const severity = event.severity.toLowerCase();

    return condition.includes(eventType) || condition.includes(severity);
  }

  /**
   * Trigger alert
   */
  private triggerAlert(rule: AlertRule, event: MonitoringEvent): void {
    rule.lastTriggered = new Date();
    
    logger.error(`🚨 ALERT TRIGGERED: ${rule.name}`, {
      rule: rule.name,
      condition: rule.condition,
      event: event.message,
      severity: rule.severity
    });

    // In production, this would send notifications
    if (typeof window !== 'undefined' && (window as any).monitoringAlert) {
      (window as any).monitoringAlert({
        rule,
        event,
        timestamp: new Date()
      });
    }
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultAlerts(): void {
    this.alertRules = [
      {
        id: 'critical_errors',
        name: 'Critical Error Alert',
        condition: 'severity:critical',
        threshold: 1,
        severity: 'critical',
        enabled: true,
        cooldownMs: 60000 // 1 minute
      },
      {
        id: 'health_degraded',
        name: 'Service Health Degraded',
        condition: 'type:health status:degraded',
        threshold: 1,
        severity: 'warning',
        enabled: true,
        cooldownMs: 300000 // 5 minutes
      },
      {
        id: 'high_memory',
        name: 'High Memory Usage',
        condition: 'type:performance memory',
        threshold: 1,
        severity: 'warning',
        enabled: true,
        cooldownMs: 180000 // 3 minutes
      }
    ];
  }

  /**
   * Setup visibility tracking
   */
  private setupVisibilityTracking(): void {
    if (typeof document === 'undefined') return;

    let startTime = Date.now();
    let isVisible = !document.hidden;

    document.addEventListener('visibilitychange', () => {
      const now = Date.now();
      
      if (document.hidden && isVisible) {
        // Page became hidden
        const sessionDuration = now - startTime;
        this.recordBusinessMetric({
          name: 'session_duration',
          value: sessionDuration,
          unit: 'ms',
          tags: { event: 'page_hidden' }
        });
        isVisible = false;
      } else if (!document.hidden && !isVisible) {
        // Page became visible
        startTime = now;
        isVisible = true;
        
        this.recordEvent({
          type: 'user',
          message: 'User returned to application',
          data: { timestamp: now },
          severity: 'info'
        });
      }
    });
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking(): void {
    if (typeof window === 'undefined') return;

    // Track unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordEvent({
        type: 'error',
        message: `Unhandled error: ${event.message}`,
        data: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        },
        severity: 'error'
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordEvent({
        type: 'error',
        message: `Unhandled promise rejection: ${event.reason}`,
        data: {
          reason: String(event.reason),
          stack: event.reason?.stack
        },
        severity: 'error'
      });
    });
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData(): {
    healthChecks: HealthCheck[];
    businessMetrics: BusinessMetric[];
    recentEvents: MonitoringEvent[];
    systemMetrics: SystemMetrics;
    alertSummary: {
      total: number;
      critical: number;
      warnings: number;
    };
  } {
    const recentEvents = this.events.slice(-50); // Last 50 events
    const latestSystemMetrics = this.systemMetrics[this.systemMetrics.length - 1] || {
      cpu: 0,
      memory: 0,
      network: { online: true, connectionType: 'unknown', downlink: 0 },
      storage: { used: 0, available: 0, percentage: 0 },
      timestamp: new Date()
    };

    const alertSummary = {
      total: recentEvents.length,
      critical: recentEvents.filter(e => e.severity === 'critical').length,
      warnings: recentEvents.filter(e => e.severity === 'warning').length
    };

    return {
      healthChecks: Array.from(this.healthChecks.values()),
      businessMetrics: this.businessMetrics.slice(-100), // Last 100 metrics
      recentEvents,
      systemMetrics: latestSystemMetrics,
      alertSummary
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `monitoring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique metric ID
   */
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear monitoring data
   */
  clearData(): void {
    this.events = [];
    this.businessMetrics = [];
    this.systemMetrics = [];
    this.healthChecks.clear();
    logger.info('🧹 Monitoring data cleared');
  }

  /**
   * Cleanup monitoring service
   */
  destroy(): void {
    this.stopMonitoring();
    this.clearData();
    logger.info('🧹 Monitoring service destroyed');
  }
}

// Export singleton instance
export const enterpriseMonitoringService = new EnterpriseMonitoringService();

// Export React hook
export const useMonitoring = () => {
  return {
    recordBusinessMetric: enterpriseMonitoringService.recordBusinessMetric.bind(enterpriseMonitoringService),
    recordEvent: enterpriseMonitoringService.recordEvent.bind(enterpriseMonitoringService),
    getDashboardData: enterpriseMonitoringService.getDashboardData.bind(enterpriseMonitoringService),
    startMonitoring: enterpriseMonitoringService.startMonitoring.bind(enterpriseMonitoringService),
    stopMonitoring: enterpriseMonitoringService.stopMonitoring.bind(enterpriseMonitoringService)
  };
};

// Global monitoring helpers
export const trackBusinessMetric = (
  name: string, 
  value: number, 
  unit: string, 
  tags?: Record<string, string>
) => {
  enterpriseMonitoringService.recordBusinessMetric({ name, value, unit, tags });
};

export const trackEvent = (
  type: MonitoringEvent['type'],
  message: string,
  data: Record<string, any>,
  severity: MonitoringEvent['severity'] = 'info'
) => {
  enterpriseMonitoringService.recordEvent({ type, message, data, severity });
};

export default enterpriseMonitoringService;
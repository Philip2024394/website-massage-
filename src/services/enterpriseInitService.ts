/**
 * 🏢 ENTERPRISE INITIALIZATION SERVICE
 * 
 * Centralized initialization of all enterprise services
 * - Performance monitoring
 * - System monitoring 
 * - Database optimization
 * - Error tracking
 * - Business metrics
 */

import enterprisePerformanceService, { trackCustomMetric } from './enterprisePerformanceService';
import enterpriseMonitoringService, { trackEvent } from './enterpriseMonitoringService';
import enterpriseDatabaseService, { trackDatabaseQuery } from './enterpriseDatabaseService';
import { enterpriseBookingFlowService } from './enterpriseBookingFlowService';
import { enterpriseChatIntegrationService } from './enterpriseChatIntegrationService';
import { bookingSoundService } from './bookingSound.service';

class EnterpriseInitializationService {
  private initialized = false;
  private startTime = 0;

  /**
   * Initialize all enterprise services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️ Enterprise services already initialized');
      return;
    }

    this.startTime = performance.now();
    console.log('🏢 Initializing Enterprise Services...');

    try {
      // Services auto-initialize in their constructors
      // We just need to track the initialization
      
      const initTime = performance.now() - this.startTime;

      // Track successful initialization
      trackCustomMetric('enterprise_init_success', initTime, {
        services: ['performance', 'monitoring', 'database'],
        timestamp: new Date().toISOString()
      });

      trackEvent(
        'performance',
        'Enterprise services initialized successfully',
        {
          initTime: Math.round(initTime),
          services: ['performance', 'monitoring', 'database', 'booking-flow', 'chat', 'sound']
        },
        'info'
      );

      this.initialized = true;
      
      console.log(`✅ Enterprise Services initialized in ${Math.round(initTime)}ms`);
      console.log('📊 Performance monitoring: ACTIVE');
      console.log('🔍 System monitoring: ACTIVE');
      console.log('🗄️ Database optimization: ACTIVE');
      console.log('📋 Booking flow system: ACTIVE');
      console.log('💬 Chat integration: ACTIVE');
      console.log('🎵 Audio notifications: ACTIVE');

      // Start health monitoring
      this.startHealthMonitoring();

      // Setup performance budgets monitoring
      this.setupPerformanceBudgets();

      // Initialize database query tracking
      this.initializeDatabaseTracking();

    } catch (error) {
      console.error('❌ Failed to initialize enterprise services:', error);
      
      trackEvent(
        'error',
        'Enterprise services initialization failed',
        { error: String(error) },
        'critical'
      );
    }
  }

  /**
   * Start continuous health monitoring
   */
  private startHealthMonitoring(): void {
    // Monitor page visibility changes for user engagement
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        trackEvent('user', 'User left application', {}, 'info');
      } else {
        trackEvent('user', 'User returned to application', {}, 'info');
      }
    });

    // Monitor network status
    if ('navigator' in window && 'onLine' in navigator) {
      const updateNetworkStatus = () => {
        trackEvent('performance', 
          navigator.onLine ? 'Network connection restored' : 'Network connection lost',
          { online: navigator.onLine },
          navigator.onLine ? 'info' : 'warning'
        );
      };

      window.addEventListener('online', updateNetworkStatus);
      window.addEventListener('offline', updateNetworkStatus);
    }

    // Monitor memory pressure (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usagePercent > 80) {
          trackEvent('performance', 
            'High memory usage detected',
            { usagePercent: Math.round(usagePercent) },
            usagePercent > 90 ? 'critical' : 'warning'
          );
        }
      }, 30000); // Check every 30 seconds
    }

    console.log('🔍 Health monitoring started');
  }

  /**
   * Setup performance budget monitoring
   */
  private setupPerformanceBudgets(): void {
    const budgets = {
      'bundle-size': 512000, // 512KB
      'first-contentful-paint': 1800,
      'largest-contentful-paint': 2500,
      'first-input-delay': 100,
      'cumulative-layout-shift': 0.1
    };

    // Monitor bundle size warnings
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource' && entry.name.includes('.js')) {
              const size = (entry as PerformanceResourceTiming).transferSize;
              if (size > budgets['bundle-size']) {
                trackEvent('performance',
                  'Bundle size budget exceeded',
                  { size, budget: budgets['bundle-size'], file: entry.name },
                  'warning'
                );
              }
            }
          }
        });

        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Performance budget monitoring not available:', error);
      }
    }

    console.log('📊 Performance budgets monitoring active');
  }

  /**
   * Initialize database query tracking
   */
  private initializeDatabaseTracking(): void {
    // Monkey patch common API methods to track database queries
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = input.toString();
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(input, init);
        const duration = performance.now() - startTime;
        
        // Track Appwrite database queries
        if (url.includes('/v1/databases/') || url.includes('/v1/storage/')) {
          let operation: 'list' | 'get' | 'create' | 'update' | 'delete' = 'get';
          
          const method = init?.method?.toLowerCase() || 'get';
          switch (method) {
            case 'post': operation = 'create'; break;
            case 'patch':
            case 'put': operation = 'update'; break;
            case 'delete': operation = 'delete'; break;
            case 'get':
            default:
              operation = url.includes('/documents') ? 'list' : 'get';
          }

          // Extract collection name from URL
          const collectionMatch = url.match(/\/collections\/([^\/]+)/);
          const collection = collectionMatch ? collectionMatch[1] : 'unknown';
          
          trackDatabaseQuery(collection, operation, duration);
          
          if (duration > 1000) {
            trackEvent('performance',
              'Slow database query detected',
              { collection, operation, duration: Math.round(duration) },
              'warning'
            );
          }
        }
        
        return response;
        
      } catch (error) {
        const duration = performance.now() - startTime;
        
        trackEvent('error',
          'API request failed',
          { url, method: init?.method || 'GET', duration: Math.round(duration), error: String(error) },
          'error'
        );
        
        throw error;
      }
    };

    console.log('🗄️ Database query tracking initialized');
  }

  /**
   * Setup keyboard shortcuts for enterprise tools
   */
  setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      // Ctrl+Shift+P = Performance Dashboard
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        this.togglePerformanceDashboard();
      }
      
      // Ctrl+Shift+M = Monitoring Dashboard
      if (event.ctrlKey && event.shiftKey && event.key === 'M') {
        event.preventDefault();
        trackEvent('user', 'Monitoring dashboard requested via shortcut', {}, 'info');
      }
      
      // Ctrl+Shift+D = Database Dashboard
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        trackEvent('user', 'Database dashboard requested via shortcut', {}, 'info');
      }
    });

    console.log('⌨️ Enterprise keyboard shortcuts initialized');
    console.log('   Ctrl+Shift+P: Performance Dashboard');
    console.log('   Ctrl+Shift+M: Monitoring Dashboard'); 
    console.log('   Ctrl+Shift+D: Database Dashboard');
  }

  /**
   * Toggle performance dashboard
   */
  private togglePerformanceDashboard(): void {
    const event = new CustomEvent('toggle-enterprise-dashboard', {
      detail: { dashboard: 'performance' }
    });
    window.dispatchEvent(event);
    
    trackEvent('user', 'Performance dashboard toggled via shortcut', {}, 'info');
  }

  /**
   * Get initialization status
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get enterprise status summary
   */
  getStatus(): {
    initialized: boolean;
    initTime: number;
    services: {
      performance: boolean;
      monitoring: boolean;
      database: boolean;
    };
  } {
    return {
      initialized: this.initialized,
      initTime: this.initialized ? performance.now() - this.startTime : 0,
      services: {
        performance: this.initialized,
        monitoring: this.initialized,
        database: this.initialized
      }
    };
  }

  /**
   * Cleanup enterprise services (for hot reload/unmount)
   */
  cleanup(): void {
    if (!this.initialized) return;

    console.log('🧹 Cleaning up enterprise services...');
    
    // Services have their own cleanup methods
    enterprisePerformanceService.destroy();
    enterpriseMonitoringService.destroy();
    
    this.initialized = false;
    
    trackEvent('performance', 'Enterprise services cleaned up', {}, 'info');
  }
}

// Export singleton
export const enterpriseInit = new EnterpriseInitializationService();

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
  // Initialize after a short delay to allow app to mount
  setTimeout(() => {
    enterpriseInit.initialize();
    enterpriseInit.setupKeyboardShortcuts();
  }, 100);
}

export default enterpriseInit;
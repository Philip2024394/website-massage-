import { useEffect, useCallback } from 'react';
import { analyticsService } from '../lib/analyticsService';

/**
 * 📊 React Analytics Hook
 * Easy-to-use analytics tracking for React components
 */

export const useAnalytics = () => {
    // Track page view on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            analyticsService.trackPageView(window.location.pathname);
        }
    }, []);

    const trackEvent = useCallback((eventType: string, metadata?: Record<string, any>) => {
        analyticsService.trackEvent(eventType as any, metadata);
    }, []);

    const trackPageView = useCallback((page: string) => {
        analyticsService.trackPageView(page);
    }, []);

    const trackBooking = useCallback((type: 'attempt' | 'completed', bookingData: any) => {
        analyticsService.trackBooking(type, bookingData);
    }, []);

    const trackChatActivity = useCallback((type: 'started' | 'message_sent', chatData: any) => {
        analyticsService.trackChatActivity(type, chatData);
    }, []);

    const trackSearch = useCallback((searchTerm: string, filters: any, resultsCount: number) => {
        analyticsService.trackSearch(searchTerm, filters, resultsCount);
    }, []);

    const trackError = useCallback((error: Error, context: string) => {
        analyticsService.trackError(error, context);
    }, []);

    const trackUserRegistration = useCallback((userType: string, method: string) => {
        analyticsService.trackUserRegistration(userType, method);
    }, []);

    return {
        trackEvent,
        trackPageView,
        trackBooking,
        trackChatActivity,
        trackSearch,
        trackError,
        trackUserRegistration
    };
};

/**
 * 📊 Page View Tracker Hook
 * Automatically tracks page views when pathname changes
 */
export const usePageTracking = () => {
    useEffect(() => {
        const trackPageView = () => {
            if (typeof window !== 'undefined') {
                analyticsService.trackPageView(window.location.pathname);
            }
        };

        // Track initial page view
        trackPageView();

        // Track navigation changes (for SPAs)
        const handlePopState = () => {
            trackPageView();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);
};

/**
 * 🏥 Health Monitoring Hook
 * Provides health check functionality for admin components
 */
export const useHealthMonitoring = () => {
    const runHealthCheck = useCallback(async () => {
        try {
            const { healthMonitoringService } = await import('../lib/healthMonitoringService');
            return await healthMonitoringService.performHealthCheck();
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }, []);

    const getSystemStatus = useCallback(async () => {
        try {
            const { healthMonitoringService } = await import('../lib/healthMonitoringService');
            return await healthMonitoringService.getSystemStatus();
        } catch (error) {
            console.error('Failed to get system status:', error);
            throw error;
        }
    }, []);

    const getHealthHistory = useCallback(async (hours?: number) => {
        try {
            const { healthMonitoringService } = await import('../lib/healthMonitoringService');
            return await healthMonitoringService.getHealthHistory(hours);
        } catch (error) {
            console.error('Failed to get health history:', error);
            throw error;
        }
    }, []);

    return {
        runHealthCheck,
        getSystemStatus,
        getHealthHistory
    };
};

/**
 * 🛡️ Backup Management Hook
 * Provides backup functionality for admin components
 */
export const useBackupManagement = () => {
    const performBackup = useCallback(async (collections?: string[], config?: any) => {
        try {
            const { automatedBackupService } = await import('../lib/automatedBackupService');
            return await automatedBackupService.performBackup(collections, config);
        } catch (error) {
            console.error('Backup failed:', error);
            throw error;
        }
    }, []);

    const getBackupHistory = useCallback(async (limit?: number) => {
        try {
            const { automatedBackupService } = await import('../lib/automatedBackupService');
            return await automatedBackupService.getBackupHistory(limit);
        } catch (error) {
            console.error('Failed to get backup history:', error);
            throw error;
        }
    }, []);

    const scheduleBackup = useCallback(async (config: any) => {
        try {
            const { automatedBackupService } = await import('../lib/automatedBackupService');
            return automatedBackupService.scheduleBackup(config);
        } catch (error) {
            console.error('Failed to schedule backup:', error);
            throw error;
        }
    }, []);

    const verifyBackup = useCallback(async (backupId: string) => {
        try {
            const { automatedBackupService } = await import('../lib/automatedBackupService');
            return await automatedBackupService.verifyBackupIntegrity(backupId);
        } catch (error) {
            console.error('Backup verification failed:', error);
            throw error;
        }
    }, []);

    return {
        performBackup,
        getBackupHistory,
        scheduleBackup,
        verifyBackup
    };
};

/**
 * 📈 Dashboard Data Hook
 * Provides unified dashboard data for monitoring components
 */
export const useDashboardData = () => {
    const getDashboardMetrics = useCallback(async () => {
        try {
            const [analyticsData, healthData, backupData] = await Promise.all([
                analyticsService.getDashboardMetrics(),
                (async () => {
                    const { healthMonitoringService } = await import('../lib/healthMonitoringService');
                    return await healthMonitoringService.getSystemStatus();
                })(),
                (async () => {
                    const { automatedBackupService } = await import('../lib/automatedBackupService');
                    return await automatedBackupService.getBackupHistory(10);
                })()
            ]);

            return {
                analytics: analyticsData,
                health: healthData,
                backups: backupData
            };
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            throw error;
        }
    }, []);

    const getUserBehaviorMetrics = useCallback(async (userId?: string, timeRange?: string) => {
        return await analyticsService.getUserBehaviorMetrics(userId, timeRange);
    }, []);

    const getSystemMetrics = useCallback(async (timeRange?: string) => {
        return await analyticsService.getSystemMetrics(timeRange);
    }, []);

    return {
        getDashboardMetrics,
        getUserBehaviorMetrics,
        getSystemMetrics
    };
};

export default useAnalytics;
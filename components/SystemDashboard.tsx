import React, { useState, useEffect } from 'react';
import { analyticsService } from '../lib/analyticsService';
import { healthMonitoringService } from '../lib/healthMonitoringService';
import { automatedBackupService } from '../lib/automatedBackupService';

/**
 * 📊 System Analytics & Monitoring Dashboard
 * Unified interface for analytics, health monitoring, and backup management
 */

interface DashboardStats {
    analytics: {
        activeUsers: number;
        todayBookings: number;
        chatSessions: number;
        errorRate: number;
        topPages: Array<{ page: string; views: number }>;
    };
    health: {
        status: 'operational' | 'degraded' | 'maintenance';
        uptime: number;
        lastCheck: string;
        criticalIssues: string[];
        activeIncidents: number;
    };
    backups: {
        lastBackup: string;
        backupCount: number;
        totalSize: string;
        status: 'healthy' | 'warning' | 'error';
    };
}

const SystemDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'health' | 'backups'>('overview');
    const [healthDetails, setHealthDetails] = useState<any>(null);
    const [backupHistory, setBackupHistory] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Load all dashboard data in parallel
            const [analyticsData, healthData, backupData] = await Promise.all([
                analyticsService.getDashboardMetrics(),
                healthMonitoringService.getSystemStatus(),
                automatedBackupService.getBackupHistory(10)
            ]);

            // Calculate backup stats
            const lastBackup = backupData[0];
            const totalSize = backupData.reduce((sum, backup) => sum + (backup.totalSizeBytes || 0), 0);
            const formatBytes = (bytes: number) => {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            };

            const backupStatus = 
                !lastBackup ? 'error' :
                new Date().getTime() - new Date(lastBackup.timestamp).getTime() > 24 * 60 * 60 * 1000 ? 'warning' :
                'healthy';

            setStats({
                analytics: analyticsData,
                health: healthData,
                backups: {
                    lastBackup: lastBackup?.timestamp || 'Never',
                    backupCount: backupData.length,
                    totalSize: formatBytes(totalSize),
                    status: backupStatus
                }
            });

            setBackupHistory(backupData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const runHealthCheck = async () => {
        try {
            setLoading(true);
            const healthReport = await healthMonitoringService.performHealthCheck();
            setHealthDetails(healthReport);
        } catch (error) {
            console.error('Health check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const performBackup = async () => {
        try {
            setLoading(true);
            await automatedBackupService.performBackup();
            await loadDashboardData(); // Refresh data after backup
        } catch (error) {
            console.error('Backup failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'operational':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'degraded':
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'unhealthy':
            case 'error':
            case 'maintenance':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading system dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">System Dashboard</h1>
                                <p className="text-gray-600">Analytics, Health Monitoring & Backup Management</p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={runHealthCheck}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Running...' : 'Health Check'}
                                </button>
                                <button
                                    onClick={performBackup}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Backing up...' : 'Run Backup'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {['overview', 'analytics', 'health', 'backups'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                                    activeTab === tab
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Analytics Card */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                            <span className="text-blue-600 text-lg">📊</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                                        <p className="text-sm text-gray-600">User activity tracking</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="text-2xl font-semibold text-gray-900">
                                        {stats?.analytics.activeUsers || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">Active users today</div>
                                    <div className="mt-2">
                                        <div className="text-sm">
                                            <span className="font-medium">{stats?.analytics.todayBookings || 0}</span> bookings
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium">{stats?.analytics.chatSessions || 0}</span> chat sessions
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Health Card */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                            <span className="text-green-600 text-lg">🏥</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">System Health</h3>
                                        <p className="text-sm text-gray-600">Service monitoring</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(stats?.health.status || 'unknown')}`}>
                                        {stats?.health.status || 'Unknown'}
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-sm">
                                            <span className="font-medium">{stats?.health.uptime || 0}%</span> uptime
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium">{stats?.health.activeIncidents || 0}</span> incidents
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Backup Card */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                                            <span className="text-purple-600 text-lg">🛡️</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Backups</h3>
                                        <p className="text-sm text-gray-600">Data protection</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(stats?.backups.status || 'unknown')}`}>
                                        {stats?.backups.status || 'Unknown'}
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-sm">
                                            <span className="font-medium">{stats?.backups.backupCount || 0}</span> backups
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium">{stats?.backups.totalSize || '0 KB'}</span> total
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Today's Activity</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-semibold text-indigo-600">
                                            {stats?.analytics.activeUsers || 0}
                                        </div>
                                        <div className="text-sm text-gray-600">Active Users</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-semibold text-green-600">
                                            {stats?.analytics.todayBookings || 0}
                                        </div>
                                        <div className="text-sm text-gray-600">Bookings</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-semibold text-blue-600">
                                            {stats?.analytics.chatSessions || 0}
                                        </div>
                                        <div className="text-sm text-gray-600">Chat Sessions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-semibold text-red-600">
                                            {stats?.analytics.errorRate.toFixed(1) || 0}%
                                        </div>
                                        <div className="text-sm text-gray-600">Error Rate</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Critical Issues */}
                        {stats?.health.criticalIssues && stats.health.criticalIssues.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <span className="text-red-600 text-lg mr-2">⚠️</span>
                                    <h3 className="text-lg font-medium text-red-800">Critical Issues</h3>
                                </div>
                                <ul className="mt-2 list-disc list-inside text-red-700">
                                    {stats.health.criticalIssues.map((issue, index) => (
                                        <li key={index}>{issue}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Analytics Overview</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Top Pages</h4>
                                        <div className="space-y-2">
                                            {stats?.analytics.topPages?.map((page, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">{page.page}</span>
                                                    <span className="text-sm font-medium text-gray-900">{page.views} views</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Error Rate</span>
                                                <span className="text-sm font-medium text-gray-900">{stats?.analytics.errorRate.toFixed(2)}%</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Active Users</span>
                                                <span className="text-sm font-medium text-gray-900">{stats?.analytics.activeUsers}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'health' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">System Health</h3>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stats?.health.status || 'unknown')}`}>
                                        {stats?.health.status || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                {healthDetails ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-semibold text-green-600">{healthDetails.summary.healthy}</div>
                                                <div className="text-sm text-gray-600">Healthy Services</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-semibold text-yellow-600">{healthDetails.summary.degraded}</div>
                                                <div className="text-sm text-gray-600">Degraded Services</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-semibold text-red-600">{healthDetails.summary.unhealthy}</div>
                                                <div className="text-sm text-gray-600">Unhealthy Services</div>
                                            </div>
                                        </div>
                                        <div className="mt-6">
                                            <h4 className="font-medium text-gray-900 mb-3">Service Details</h4>
                                            <div className="space-y-2">
                                                {healthDetails.checks.map((check: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{check.service}</div>
                                                            <div className="text-sm text-gray-600">{check.message}</div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm text-gray-500">{check.responseTime}ms</span>
                                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                                                                {check.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">Click "Health Check" to run a comprehensive system check</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'backups' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Backup History</h3>
                            </div>
                            <div className="p-6">
                                {backupHistory.length > 0 ? (
                                    <div className="space-y-3">
                                        {backupHistory.map((backup, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                <div>
                                                    <div className="font-medium text-gray-900">{backup.backupId}</div>
                                                    <div className="text-sm text-gray-600">
                                                        {new Date(backup.timestamp).toLocaleString()} • 
                                                        {backup.totalDocuments} documents • 
                                                        {Math.round(backup.totalSizeBytes / 1024)} KB
                                                    </div>
                                                </div>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status === 'completed' ? 'healthy' : backup.status)}`}>
                                                    {backup.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No backups found. Click "Run Backup" to create your first backup.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemDashboard;
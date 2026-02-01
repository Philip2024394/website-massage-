// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState, useEffect } from 'react';
import { 
    Activity, AlertCircle, CheckCircle, Clock, Zap, 
    RefreshCw, Shield, AlertTriangle, Play, Square,
    Trash2, TestTube, WifiOff, Wifi, Users, Timer
} from 'lucide-react';
// Legacy admin monitoring services are not part of the main app build
// Provide minimal mocks to satisfy TypeScript when compiling this unused component
type HealthEvent = any;
const adminHealthService: any = {};
const realTimeHealthService: any = { subscribe: () => () => {}, getConnectionStatus: () => ({}) };

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

const HealthMonitoringDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<SystemHealthMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [recentErrors, setRecentErrors] = useState<any[]>([]);
    const [showErrors, setShowErrors] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [realTimeConnected, setRealTimeConnected] = useState(false);
    const [liveEvents, setLiveEvents] = useState<HealthEvent[]>([]);

    // Fetch health metrics
    const fetchHealthMetrics = async () => {
        try {
            const healthData = await adminHealthService.getHealthMetrics();
            setMetrics(healthData);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Failed to fetch health metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch recent errors
    const fetchRecentErrors = async () => {
        const errors = adminHealthService.getRecentErrors(20);
        setRecentErrors(errors);
    };

    // Auto-refresh effect
    useEffect(() => {
        fetchHealthMetrics();
        fetchRecentErrors();

        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchHealthMetrics();
                fetchRecentErrors();
            }, 10000); // Refresh every 10 seconds

            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    // Real-time updates effect
    useEffect(() => {
        console.log('🔌 Setting up real-time health monitoring...');
        
        // Subscribe to real-time events
        const unsubscribe = realTimeHealthService.subscribe((event: HealthEvent) => {
            console.log('📡 Received health event:', event.type, event.data);
            
            // Add to live events (keep last 20)
            setLiveEvents(prev => {
                const newEvents = [event, ...prev].slice(0, 20);
                return newEvents;
            });

            // Handle specific event types
            switch (event.type) {
                case 'health_update':
                    if (event.data.connected !== undefined) {
                        setRealTimeConnected(event.data.connected);
                    } else {
                        // Full health data update
                        setMetrics(event.data);
                        setLastUpdate(new Date(event.timestamp));
                    }
                    break;

                case 'error_logged':
                    // Add new error to the list
                    setRecentErrors(prev => [
                        {
                            timestamp: event.timestamp,
                            type: event.data.type,
                            message: event.data.message,
                            critical: event.data.critical
                        },
                        ...prev
                    ].slice(0, 50));
                    break;

                case 'circuit_breaker_change':
                    // Force refresh metrics when circuit breaker changes
                    fetchHealthMetrics();
                    break;

                case 'session_activity':
                    // Update session count in real-time
                    setMetrics(prev => prev ? {
                        ...prev,
                        chatSessions: {
                            ...prev.chatSessions,
                            totalActive: event.data.currentCount
                        }
                    } : null);
                    break;
            }
        });

        // Check initial connection status
        const status = realTimeHealthService.getConnectionStatus();
        setRealTimeConnected(status.connected);

        // Cleanup subscription on unmount
        return () => {
            console.log('🔌 Cleaning up real-time health monitoring...');
            unsubscribe();
        };
    }, []);

    // Admin actions
    const handleCircuitBreakerToggle = async () => {
        if (!metrics) return;
        
        setActionLoading('circuit');
        try {
            if (metrics.appwriteHealth.circuitOpen) {
                await adminHealthService.forceCircuitBreakerClose();
            } else {
                await adminHealthService.forceCircuitBreakerOpen();
            }
            await fetchHealthMetrics();
        } catch (error) {
            console.error('Circuit breaker action failed:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCleanupSessions = async () => {
        setActionLoading('cleanup');
        try {
            const result = await adminHealthService.cleanupExpiredSessions();
            alert(`Cleaned up ${result.cleaned} expired sessions`);
            await fetchHealthMetrics();
        } catch (error) {
            console.error('Session cleanup failed:', error);
            alert('Session cleanup failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleConnectionTest = async () => {
        setActionLoading('test');
        try {
            const result = await adminHealthService.testAppwriteConnection();
            alert(`Connection Test:\n- Success: ${result.success}\n- Response Time: ${result.responseTime}ms${result.error ? '\n- Error: ' + result.error : ''}`);
        } catch (error) {
            alert('Connection test failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleClearErrors = () => {
        adminHealthService.clearErrorLogs();
        setRecentErrors([]);
        alert('Error logs cleared');
    };

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const getHealthStatusColor = (isHealthy: boolean) => {
        return isHealthy ? 'text-green-600' : 'text-red-600';
    };

    const getHealthStatusIcon = (isHealthy: boolean) => {
        return isHealthy ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading health metrics...</span>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">Failed to load health metrics</p>
                <button 
                    onClick={fetchHealthMetrics}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">System Health Monitor</h2>
                    <div className="flex items-center gap-4">
                        <p className="text-gray-600">
                            Last updated: {lastUpdate.toLocaleTimeString()}
                        </p>
                        <div className="flex items-center gap-2">
                            {realTimeConnected ? (
                                <Wifi className="w-4 h-4 text-green-600" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-xs font-medium ${
                                realTimeConnected ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {realTimeConnected ? 'Live' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            autoRefresh 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        {autoRefresh ? <Play className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        Auto-refresh
                    </button>
                    <button
                        onClick={fetchHealthMetrics}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Appwrite Health */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-700">Appwrite Health</h3>
                        <div className={getHealthStatusColor(metrics.appwriteHealth.isHealthy)}>
                            {getHealthStatusIcon(metrics.appwriteHealth.isHealthy)}
                        </div>
                    </div>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={getHealthStatusColor(metrics.appwriteHealth.isHealthy)}>
                                {metrics.appwriteHealth.isHealthy ? 'Healthy' : 'Unhealthy'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Circuit:</span>
                            <span className={metrics.appwriteHealth.circuitOpen ? 'text-red-600' : 'text-green-600'}>
                                {metrics.appwriteHealth.circuitOpen ? 'OPEN' : 'CLOSED'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Failures:</span>
                            <span>{metrics.appwriteHealth.consecutiveFailures}</span>
                        </div>
                    </div>
                </div>

                {/* Chat Sessions */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-700">Chat Sessions</h3>
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Active:</span>
                            <span className="font-semibold">{metrics.chatSessions.totalActive}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Expired:</span>
                            <span className={metrics.chatSessions.expiredCount > 0 ? 'text-orange-600' : 'text-gray-600'}>
                                {metrics.chatSessions.expiredCount}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Error Statistics */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-700">Error Stats</h3>
                        <AlertTriangle className={`w-5 h-5 ${
                            metrics.errorStats.criticalErrors > 0 ? 'text-red-600' : 'text-green-600'
                        }`} />
                    </div>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Last Hour:</span>
                            <span>{metrics.errorStats.lastHour}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Last 24h:</span>
                            <span>{metrics.errorStats.last24Hours}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Critical:</span>
                            <span className={metrics.errorStats.criticalErrors > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                                {metrics.errorStats.criticalErrors}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Performance */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-700">Performance</h3>
                        <Zap className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Avg Response:</span>
                            <span>{metrics.performance.avgResponseTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Success Rate:</span>
                            <span className={metrics.performance.successRate >= 95 ? 'text-green-600' : 'text-orange-600'}>
                                {metrics.performance.successRate}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Timeouts:</span>
                            <span className={metrics.performance.timeouts > 0 ? 'text-red-600' : 'text-gray-600'}>
                                {metrics.performance.timeouts}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Controls */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={handleCircuitBreakerToggle}
                        disabled={actionLoading === 'circuit'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                            metrics.appwriteHealth.circuitOpen
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                        } disabled:opacity-50`}
                    >
                        {actionLoading === 'circuit' ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <Shield className="w-4 h-4" />
                        )}
                        {metrics.appwriteHealth.circuitOpen ? 'Close Circuit' : 'Open Circuit'}
                    </button>

                    <button
                        onClick={handleCleanupSessions}
                        disabled={actionLoading === 'cleanup'}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium disabled:opacity-50"
                    >
                        {actionLoading === 'cleanup' ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        Cleanup Sessions
                    </button>

                    <button
                        onClick={handleConnectionTest}
                        disabled={actionLoading === 'test'}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium disabled:opacity-50"
                    >
                        {actionLoading === 'test' ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <TestTube className="w-4 h-4" />
                        )}
                        Test Connection
                    </button>

                    <button
                        onClick={() => setShowErrors(!showErrors)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {showErrors ? 'Hide Errors' : 'Show Errors'}
                    </button>
                </div>
            </div>

            {/* Error Log */}
            {showErrors && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Recent Errors</h3>
                        <button
                            onClick={handleClearErrors}
                            className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear Logs
                        </button>
                    </div>
                    <div className="space-y-2 max-h-64 ">
                        {recentErrors.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No recent errors</p>
                        ) : (
                            recentErrors.map((error, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border-l-4 ${
                                        error.critical 
                                            ? 'bg-red-50 border-red-500 text-red-800'
                                            : 'bg-yellow-50 border-yellow-500 text-yellow-800'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium">[{error.type}] {error.message}</div>
                                            <div className="text-sm opacity-75 mt-1">
                                                {formatTimestamp(error.timestamp)}
                                            </div>
                                        </div>
                                        {error.critical && (
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthMonitoringDashboard;
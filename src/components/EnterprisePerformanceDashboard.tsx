// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
/**
 * 🏢 ENTERPRISE PERFORMANCE MONITORING DASHBOARD
 * 
 * Real-time performance dashboard for enterprise monitoring
 * - Core Web Vitals visualization
 * - Database performance metrics
 * - System health monitoring
 * - Business metrics tracking
 * - Real-time alerts and notifications
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  enterprisePerformanceService, 
  usePerformanceMetrics,
  PerformanceMetric,
  DatabaseQueryMetric
} from '../services/enterprisePerformanceService';
import { 
  enterpriseMonitoringService,
  useMonitoring,
  HealthCheck,
  BusinessMetric,
  MonitoringEvent
} from '../services/enterpriseMonitoringService';
import {
  enterpriseDatabaseService,
  useDatabaseOptimization,
  SlowQuery,
  DatabaseIndex
} from '../services/enterpriseDatabaseService';

interface DashboardProps {
  onClose?: () => void;
}

export const EnterprisePerformanceDashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'monitoring' | 'database' | 'alerts'>('performance');
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { recordCustomMetric, generateReport, getMetrics } = usePerformanceMetrics();
  const { getDashboardData } = useMonitoring();
  const { getOptimizationReport } = useDatabaseOptimization();

  // Dashboard data state
  const [performanceData, setPerformanceData] = useState({
    metrics: [] as PerformanceMetric[],
    queryMetrics: [] as DatabaseQueryMetric[],
    summary: {
      avgFCP: 0,
      avgLCP: 0,
      avgFID: 0,
      poorMetrics: 0
    }
  });

  const [monitoringData, setMonitoringData] = useState({
    healthChecks: [] as HealthCheck[],
    businessMetrics: [] as BusinessMetric[],
    recentEvents: [] as MonitoringEvent[],
    alertSummary: { total: 0, critical: 0, warnings: 0 }
  });

  const [databaseData, setDatabaseData] = useState({
    slowQueries: [] as SlowQuery[],
    indexes: new Map<string, DatabaseIndex[]>(),
    summary: {
      totalIndexes: 0,
      slowQueryCount: 0,
      avgQueryTime: 0,
      indexUtilization: 0
    }
  });

  /**
   * Refresh dashboard data
   */
  const refreshData = useCallback(async () => {
    try {
      // Performance data
      const perfReport = generateReport();
      const fcpMetrics = perfReport.metrics.filter(m => m.metricType === 'FCP');
      const lcpMetrics = perfReport.metrics.filter(m => m.metricType === 'LCP');
      const fidMetrics = perfReport.metrics.filter(m => m.metricType === 'FID');
      
      setPerformanceData({
        metrics: perfReport.metrics.slice(-20), // Last 20 metrics
        queryMetrics: perfReport.queryMetrics.slice(-20),
        summary: {
          avgFCP: fcpMetrics.length > 0 ? fcpMetrics.reduce((sum, m) => sum + m.value, 0) / fcpMetrics.length : 0,
          avgLCP: lcpMetrics.length > 0 ? lcpMetrics.reduce((sum, m) => sum + m.value, 0) / lcpMetrics.length : 0,
          avgFID: fidMetrics.length > 0 ? fidMetrics.reduce((sum, m) => sum + m.value, 0) / fidMetrics.length : 0,
          poorMetrics: perfReport.metrics.filter(m => m.rating === 'poor').length
        }
      });

      // Monitoring data
      const monitoringReport = getDashboardData();
      setMonitoringData(monitoringReport);

      // Database data
      const dbReport = getOptimizationReport();
      setDatabaseData({
        slowQueries: dbReport.slowQueries.slice(-10),
        indexes: dbReport.indexes,
        summary: dbReport.summary
      });

    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    }
  }, [generateReport, getDashboardData, getOptimizationReport]);

  // Auto-refresh effect
  useEffect(() => {
    refreshData();
    
    if (autoRefresh) {
      const interval = setInterval(refreshData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [refreshData, autoRefresh]);

  /**
   * Get status color based on value and thresholds
   */
  const getStatusColor = (value: number, thresholds: { good: number; poor: number }): string => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Format duration in milliseconds
   */
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  /**
   * Performance Tab Component
   */
  const PerformanceTab = () => (
    <div className="space-y-6">
      {/* Core Web Vitals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor(performanceData.summary.avgFCP, { good: 1800, poor: 3000 })}`}>
              {formatDuration(performanceData.summary.avgFCP)}
            </div>
            <div className="text-sm text-gray-600">First Contentful Paint</div>
            <div className="text-xs text-gray-400">Target: &lt; 1.8s</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor(performanceData.summary.avgLCP, { good: 2500, poor: 4000 })}`}>
              {formatDuration(performanceData.summary.avgLCP)}
            </div>
            <div className="text-sm text-gray-600">Largest Contentful Paint</div>
            <div className="text-xs text-gray-400">Target: &lt; 2.5s</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor(performanceData.summary.avgFID, { good: 100, poor: 300 })}`}>
              {formatDuration(performanceData.summary.avgFID)}
            </div>
            <div className="text-sm text-gray-600">First Input Delay</div>
            <div className="text-xs text-gray-400">Target: &lt; 100ms</div>
          </div>
        </div>
      </div>

      {/* Performance Issues */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Issues</h3>
        <div className="space-y-2">
          {performanceData.metrics
            .filter(m => m.rating === 'poor')
            .slice(-5)
            .map(metric => (
              <div key={metric.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="text-sm">
                  {metric.metricType}: {formatDuration(metric.value)}
                </span>
                <span className="text-xs text-red-600 font-medium">
                  {metric.rating.toUpperCase()}
                </span>
              </div>
            ))}
          {performanceData.metrics.filter(m => m.rating === 'poor').length === 0 && (
            <div className="text-sm text-green-600 text-center py-4">
              ✅ No performance issues detected
            </div>
          )}
        </div>
      </div>

      {/* Database Query Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Database Query Performance</h3>
        <div className="space-y-2">
          {performanceData.queryMetrics
            .filter(q => q.duration > 500)
            .slice(-5)
            .map(query => (
              <div key={query.queryId} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                <span className="text-sm">
                  {query.collection}.{query.operation}
                </span>
                <span className={`text-xs font-medium ${query.isSlowQuery ? 'text-red-600' : 'text-yellow-600'}`}>
                  {formatDuration(query.duration)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  /**
   * Monitoring Tab Component
   */
  const MonitoringTab = () => (
    <div className="space-y-6">
      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monitoringData.healthChecks.map(health => (
            <div key={health.service} className="flex justify-between items-center p-3 border rounded">
              <span className="font-medium">{health.service}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                health.status === 'healthy' ? 'bg-green-100 text-green-800' :
                health.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {health.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
        <div className="space-y-2 max-h-64 ">
          {monitoringData.recentEvents.slice(-10).map(event => (
            <div key={event.id} className="p-2 border-l-4 border-l-blue-400 bg-gray-50 rounded">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">{event.message}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  event.severity === 'error' ? 'bg-red-100 text-red-800' :
                  event.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {event.severity}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {event.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Alert Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-800">{monitoringData.alertSummary.total}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{monitoringData.alertSummary.critical}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{monitoringData.alertSummary.warnings}</div>
            <div className="text-sm text-gray-600">Warnings</div>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Database Tab Component
   */
  const DatabaseTab = () => (
    <div className="space-y-6">
      {/* Database Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Database Performance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{databaseData.summary.totalIndexes}</div>
            <div className="text-sm text-gray-600">Total Indexes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{databaseData.summary.slowQueryCount}</div>
            <div className="text-sm text-gray-600">Slow Queries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{formatDuration(databaseData.summary.avgQueryTime)}</div>
            <div className="text-sm text-gray-600">Avg Query Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{Math.round(databaseData.summary.indexUtilization)}%</div>
            <div className="text-sm text-gray-600">Index Utilization</div>
          </div>
        </div>
      </div>

      {/* Slow Queries */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Slow Queries</h3>
        <div className="space-y-2">
          {databaseData.slowQueries.map(query => (
            <div key={query.id} className="p-3 border border-red-200 bg-red-50 rounded">
              <div className="flex justify-between items-center">
                <span className="font-medium">{query.collection}.{query.operation}</span>
                <span className="text-red-600 font-bold">{formatDuration(query.executionTime)}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {query.timestamp.toLocaleString()}
              </div>
              {query.optimizationSuggestions.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-700">Suggestions:</div>
                  <ul className="text-xs text-gray-600 ml-2">
                    {query.optimizationSuggestions.slice(0, 2).map((suggestion, idx) => (
                      <li key={idx}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {databaseData.slowQueries.length === 0 && (
            <div className="text-sm text-green-600 text-center py-4">
              ✅ No slow queries detected
            </div>
          )}
        </div>
      </div>

      {/* Index Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Database Indexes</h3>
        <div className="space-y-2">
          {Array.from(databaseData.indexes.entries()).map(([collection, indexes]) => (
            <div key={collection} className="border rounded p-3">
              <div className="font-medium text-gray-800 mb-2">{collection}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {indexes.slice(0, 4).map(index => (
                  <div key={index.name} className="text-sm">
                    <span className="font-medium">{index.name}:</span>
                    <span className={`ml-1 ${index.usage.effectiveness > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {Math.round(index.usage.effectiveness)}% effective
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          📊 Performance Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">🏢 Enterprise Performance Dashboard</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-sm">{autoRefresh ? 'Live' : 'Paused'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            >
              {autoRefresh ? '⏸️ Pause' : '▶️ Resume'}
            </button>
            <button
              onClick={refreshData}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            >
              ➖
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-100 border-b">
          <div className="flex">
            {(['performance', 'monitoring', 'database'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab === 'performance' && '⚡'} 
                {tab === 'monitoring' && '🔍'} 
                {tab === 'database' && '🗄️'} 
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6  max-h-[calc(90vh-140px)]">
          {activeTab === 'performance' && <PerformanceTab />}
          {activeTab === 'monitoring' && <MonitoringTab />}
          {activeTab === 'database' && <DatabaseTab />}
        </div>
      </div>
    </div>
  );
};

export default EnterprisePerformanceDashboard;
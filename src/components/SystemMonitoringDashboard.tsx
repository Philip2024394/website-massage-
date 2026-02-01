// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * ============================================================================
 * 🚨 UNIFIED SYSTEM MONITORING DASHBOARD
 * ============================================================================
 * 
 * Comprehensive monitoring system that combines all verification tools:
 * - Appwrite connection health monitoring
 * - Feature integrity and page verification  
 * - Performance monitoring integration
 * - Real-time error tracking and alerts
 * - System health overview with actionable insights
 * 
 * This dashboard provides a single view of your entire system's health
 * and ensures no features were lost during development.
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, AlertTriangle, CheckCircle, XCircle,
  RefreshCw, Database, FileText, TrendingUp, Settings,
  Bell, Clock, Users, MessageCircle, Zap
} from 'lucide-react';
import AppwriteHealthChecker from './AppwriteHealthChecker';
import FeatureIntegrityChecker from './FeatureIntegrityChecker';
import type { HealthStatus, HealthError } from './AppwriteHealthChecker';
import type { VerificationResults, FeatureError } from './FeatureIntegrityChecker';

export interface SystemMonitoringProps {
  onSystemAlert?: (alert: SystemAlert) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  category: 'appwrite' | 'features' | 'performance' | 'system';
  timestamp: Date;
  resolved?: boolean;
  actionRequired?: string;
}

export interface SystemOverview {
  status: 'healthy' | 'degraded' | 'critical';
  lastUpdated: Date;
  appwrite: {
    status: 'healthy' | 'degraded' | 'critical' | 'unknown';
    details: HealthStatus | null;
  };
  features: {
    status: 'pass' | 'warn' | 'fail' | 'unknown';
    details: VerificationResults | null;
  };
  alerts: SystemAlert[];
  metrics: {
    totalChecks: number;
    criticalIssues: number;
    warningIssues: number;
    uptime: number;
  };
}

export const SystemMonitoringDashboard: React.FC<SystemMonitoringProps> = ({
  onSystemAlert,
  autoRefresh = true,
  refreshInterval = 60000 // 1 minute
}) => {
  const [overview, setOverview] = useState<SystemOverview>({
    status: 'healthy',
    lastUpdated: new Date(),
    appwrite: { status: 'unknown', details: null },
    features: { status: 'unknown', details: null },
    alerts: [],
    metrics: { totalChecks: 0, criticalIssues: 0, warningIssues: 0, uptime: 0 }
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'appwrite' | 'features' | 'alerts'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate alert ID
  const generateAlertId = () => `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle Appwrite health updates
  const handleAppwriteHealthUpdate = (health: HealthStatus) => {
    const alerts: SystemAlert[] = [];
    
    // Generate alerts for critical Appwrite issues
    health.errors.forEach(error => {
      if (error.severity === 'critical' || error.severity === 'high') {
        alerts.push({
          id: generateAlertId(),
          type: error.severity === 'critical' ? 'critical' : 'warning',
          title: `Appwrite ${error.component} Issue`,
          message: error.message,
          category: 'appwrite',
          timestamp: error.timestamp,
          actionRequired: error.type === 'connection' ? 'Check Appwrite configuration and network connectivity' :
                         error.type === 'permission' ? 'Verify collection permissions and access rights' :
                         'Debug Appwrite integration'
        });
      }
    });

    setOverview(prev => ({
      ...prev,
      appwrite: { 
        status: health.overall,
        details: health
      },
      alerts: [...prev.alerts.filter(a => a.category !== 'appwrite'), ...alerts],
      lastUpdated: new Date()
    }));

    // Send alerts
    alerts.forEach(alert => onSystemAlert?.(alert));
  };

  // Handle feature verification updates
  const handleFeatureVerificationUpdate = (results: VerificationResults) => {
    const alerts: SystemAlert[] = [];
    
    // Generate alerts for critical feature issues
    Object.values(results.categories).forEach(category => {
      category.issues.forEach(issue => {
        if (issue.severity === 'critical' || issue.severity === 'high') {
          alerts.push({
            id: generateAlertId(),
            type: issue.severity === 'critical' ? 'critical' : 'warning',
            title: `Feature Issue: ${issue.item}`,
            message: issue.description,
            category: 'features',
            timestamp: new Date(),
            actionRequired: issue.recommendation
          });
        }
      });
    });

    setOverview(prev => ({
      ...prev,
      features: { 
        status: results.overall,
        details: results
      },
      alerts: [...prev.alerts.filter(a => a.category !== 'features'), ...alerts],
      lastUpdated: new Date()
    }));

    // Send alerts
    alerts.forEach(alert => onSystemAlert?.(alert));
  };

  // Update overall system status
  useEffect(() => {
    const { appwrite, features } = overview;
    
    let overallStatus: SystemOverview['status'] = 'healthy';
    
    if (appwrite.status === 'critical' || features.status === 'fail') {
      overallStatus = 'critical';
    } else if (appwrite.status === 'degraded' || features.status === 'warn') {
      overallStatus = 'degraded';
    }
    
    const criticalIssues = overview.alerts.filter(a => a.type === 'critical' && !a.resolved).length;
    const warningIssues = overview.alerts.filter(a => a.type === 'warning' && !a.resolved).length;
    
    setOverview(prev => ({
      ...prev,
      status: overallStatus,
      metrics: {
        ...prev.metrics,
        criticalIssues,
        warningIssues,
        totalChecks: (appwrite.details?.metrics.totalChecks || 0) + 
                    (features.details?.summary.totalChecks || 0)
      }
    }));
  }, [overview.appwrite, overview.features, overview.alerts]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setIsRefreshing(true);
        // Trigger refresh of child components
        setTimeout(() => setIsRefreshing(false), 2000);
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
        return { 
          color: 'text-green-600 bg-green-100', 
          icon: <CheckCircle className="w-5 h-5" />,
          text: 'Healthy'
        };
      case 'degraded':
      case 'warn':
        return { 
          color: 'text-yellow-600 bg-yellow-100', 
          icon: <AlertTriangle className="w-5 h-5" />,
          text: 'Degraded'
        };
      case 'critical':
      case 'fail':
        return { 
          color: 'text-red-600 bg-red-100', 
          icon: <XCircle className="w-5 h-5" />,
          text: 'Critical'
        };
      default:
        return { 
          color: 'text-gray-600 bg-gray-100', 
          icon: <Activity className="w-5 h-5" />,
          text: 'Unknown'
        };
    }
  };

  const overallDisplay = getStatusDisplay(overview.status);
  const appwriteDisplay = getStatusDisplay(overview.appwrite.status);
  const featuresDisplay = getStatusDisplay(overview.features.status);

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-7 h-7 text-blue-600" />
              System Monitoring Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive health monitoring for your massage booking platform
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Overall Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${overallDisplay.color}`}>
              {overallDisplay.icon}
              <span className="font-medium">System {overallDisplay.text}</span>
            </div>
            
            {/* Last Updated */}
            <div className="text-sm text-gray-600">
              Updated: {overview.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <nav className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'appwrite', label: 'Appwrite Health', icon: Database },
              { id: 'features', label: 'Feature Integrity', icon: FileText },
              { id: 'alerts', label: 'Alerts', icon: Bell }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {id === 'alerts' && overview.alerts.filter(a => !a.resolved).length > 0 && (
                  <span className="ml-1 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                    {overview.alerts.filter(a => !a.resolved).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${overallDisplay.color}`}>
                    {overallDisplay.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Overall System</h3>
                    <p className="text-sm text-gray-600">Complete system health</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {overallDisplay.text}
                </div>
                <div className="text-sm text-gray-600">
                  {overview.metrics.totalChecks} total checks performed
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${appwriteDisplay.color}`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Appwrite Backend</h3>
                    <p className="text-sm text-gray-600">Database & API connectivity</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {appwriteDisplay.text}
                </div>
                <div className="text-sm text-gray-600">
                  {overview.appwrite.details?.metrics.successRate.toFixed(1) || '0'}% success rate
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${featuresDisplay.color}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Feature Integrity</h3>
                    <p className="text-sm text-gray-600">Pages & components status</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {featuresDisplay.text}
                </div>
                <div className="text-sm text-gray-600">
                  {overview.features.details?.summary.passed || 0}/{overview.features.details?.summary.totalChecks || 0} verified
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {overview.metrics.totalChecks}
                  </div>
                  <div className="text-sm text-gray-600">Total Checks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {overview.metrics.criticalIssues}
                  </div>
                  <div className="text-sm text-gray-600">Critical Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">
                    {overview.metrics.warningIssues}
                  </div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {Math.floor((Date.now() - overview.lastUpdated.getTime()) / 1000 / 60)}m
                  </div>
                  <div className="text-sm text-gray-600">Last Check</div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            {overview.alerts.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
                <div className="space-y-3">
                  {overview.alerts.filter(a => !a.resolved).slice(0, 3).map((alert) => (
                    <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-lg border ${
                      alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className={`p-1 rounded-full ${
                        alert.type === 'critical' ? 'bg-red-100' :
                        alert.type === 'warning' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        {alert.type === 'critical' && <XCircle className="w-4 h-4 text-red-600" />}
                        {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                        {alert.type === 'info' && <Activity className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{alert.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                        {alert.actionRequired && (
                          <div className="text-sm font-medium text-gray-700 mt-2">
                            → {alert.actionRequired}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  
                  {overview.alerts.filter(a => !a.resolved).length === 0 && (
                    <div className="text-center py-4 text-green-600">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-medium">No Active Alerts</div>
                      <div className="text-sm text-gray-600">All systems are operating normally</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Appwrite Health Tab */}
        {activeTab === 'appwrite' && (
          <AppwriteHealthChecker
            onHealthUpdate={handleAppwriteHealthUpdate}
            autoCheck={true}
            showDashboard={true}
          />
        )}

        {/* Feature Integrity Tab */}
        {activeTab === 'features' && (
          <FeatureIntegrityChecker
            onVerificationComplete={handleFeatureVerificationUpdate}
            autoVerify={false}
            showDashboard={true}
          />
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
              <div className="text-sm text-gray-600">
                {overview.alerts.filter(a => !a.resolved).length} active alerts
              </div>
            </div>
            
            <div className="space-y-4">
              {overview.alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Alerts</h4>
                  <p className="text-gray-600">Your system is running smoothly with no alerts to report.</p>
                </div>
              ) : (
                overview.alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${
                    alert.resolved ? 'opacity-50' : ''
                  } ${
                    alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${
                          alert.type === 'critical' ? 'bg-red-100' :
                          alert.type === 'warning' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          {alert.type === 'critical' && <XCircle className="w-5 h-5 text-red-600" />}
                          {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                          {alert.type === 'info' && <Activity className="w-5 h-5 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{alert.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                          {alert.actionRequired && (
                            <div className="mt-3 p-3 bg-white rounded border">
                              <div className="text-sm font-medium text-gray-700 mb-1">Recommended Action:</div>
                              <div className="text-sm text-gray-600">{alert.actionRequired}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs font-medium mb-2 ${
                          alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.type}
                        </div>
                        <div className="text-xs text-gray-500">
                          {alert.timestamp.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {alert.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemMonitoringDashboard;
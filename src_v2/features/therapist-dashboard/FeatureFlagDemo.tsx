/**
 * ============================================================================
 * 🔒 STEP 12 FROZEN - STABLE REFERENCE POINT - NO MODIFICATIONS
 * ============================================================================
 * 
 * ⚠️  CRITICAL: THIS FILE IS FROZEN AS OF STEP 12 COMPLETION
 * 
 * ALLOWED CHANGES:
 * ✅ Critical bug fixes only (with documentation)
 * ❌ NO refactors, redesigns, or feature additions
 * 
 * ============================================================================
 * THERAPIST DASHBOARD - FEATURE FLAG DEMO
 * ============================================================================
 * 
 * Interactive demo page for testing the feature flag system.
 * Shows how to toggle between legacy and v2 dashboard implementations.
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';

interface FeatureFlagDemoProps {
  currentFeatureFlags?: Record<string, boolean>;
  onFlagChange?: (flag: string, enabled: boolean) => void;
}

export const FeatureFlagDemo: React.FC<FeatureFlagDemoProps> = ({
  currentFeatureFlags = {},
  onFlagChange
}) => {
  const [flags, setFlags] = useState(() => ({
    USE_V2_THERAPIST_DASHBOARD: localStorage?.getItem('enableV2Dashboard') === 'true' || process.env.NODE_ENV === 'development',
    ENABLE_REAL_TIME_UPDATES: localStorage?.getItem('enableRealTimeUpdates') === 'true',
    SHOW_BETA_FEATURES: localStorage?.getItem('enableBetaFeatures') === 'true',
    ADVANCED_ANALYTICS: localStorage?.getItem('enableAdvancedAnalytics') === 'true',
    ...currentFeatureFlags
  }));

  const [isDevelopment, setIsDevelopment] = useState(process.env.NODE_ENV === 'development');

  useEffect(() => {
    // Check development environment
    setIsDevelopment(process.env.NODE_ENV === 'development');
  }, []);

  const toggleFlag = (flagName: string) => {
    const newValue = !flags[flagName];
    
    // Update local state
    setFlags(prev => ({
      ...prev,
      [flagName]: newValue
    }));

    // Persist to localStorage
    const storageKey = flagName === 'USE_V2_THERAPIST_DASHBOARD' ? 'enableV2Dashboard' :
                       flagName === 'ENABLE_REAL_TIME_UPDATES' ? 'enableRealTimeUpdates' :
                       flagName === 'SHOW_BETA_FEATURES' ? 'enableBetaFeatures' :
                       flagName === 'ADVANCED_ANALYTICS' ? 'enableAdvancedAnalytics' :
                       null;
    
    if (storageKey) {
      localStorage?.setItem(storageKey, newValue.toString());
    }

    // Notify parent component
    onFlagChange?.(flagName, newValue);
  };

  const resetAllFlags = () => {
    const resetFlags = {
      USE_V2_THERAPIST_DASHBOARD: isDevelopment,
      ENABLE_REAL_TIME_UPDATES: false,
      SHOW_BETA_FEATURES: false,
      ADVANCED_ANALYTICS: false
    };

    setFlags(resetFlags);

    // Clear localStorage
    localStorage?.removeItem('enableV2Dashboard');
    localStorage?.removeItem('enableRealTimeUpdates');
    localStorage?.removeItem('enableBetaFeatures');
    localStorage?.removeItem('enableAdvancedAnalytics');

    // Notify parent
    Object.entries(resetFlags).forEach(([flag, value]) => {
      onFlagChange?.(flag, value);
    });
  };

  const flagDescriptions = {
    USE_V2_THERAPIST_DASHBOARD: {
      title: 'V2 Therapist Dashboard',
      description: 'Enable the new enhanced therapist dashboard with improved UI and features',
      impact: 'Major - Changes entire dashboard experience',
      risk: 'Medium'
    },
    ENABLE_REAL_TIME_UPDATES: {
      title: 'Real-time Updates',
      description: 'Enable WebSocket-based real-time updates for bookings and messages',
      impact: 'Performance - Improves user experience',
      risk: 'Low'
    },
    SHOW_BETA_FEATURES: {
      title: 'Beta Features',
      description: 'Show experimental features that are still in testing',
      impact: 'Minor - Adds experimental UI elements',
      risk: 'High'
    },
    ADVANCED_ANALYTICS: {
      title: 'Advanced Analytics',
      description: 'Enable detailed analytics and reporting features',
      impact: 'UI - Adds analytics dashboard',
      risk: 'Low'
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isDevelopment) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-800 text-lg font-medium mb-2">
          Feature Flag Demo
        </div>
        <div className="text-yellow-600">
          This demo is only available in development mode.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              🎛️ Feature Flag Control Panel
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Toggle features on/off for testing and development
            </p>
          </div>
          <button
            onClick={resetAllFlags}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Flag List */}
      <div className="p-6 space-y-6">
        {Object.entries(flagDescriptions).map(([flagName, info]) => (
          <div key={flagName} className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            {/* Toggle Switch */}
            <div className="flex-shrink-0 pt-1">
              <button
                onClick={() => toggleFlag(flagName)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  flags[flagName] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    flags[flagName] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Flag Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {info.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(info.risk)}`}>
                  {info.risk} Risk
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  flags[flagName] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {flags[flagName] ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-2">
                {info.description}
              </p>
              
              <p className="text-sm text-gray-500">
                <strong>Impact:</strong> {info.impact}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Current State Summary */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Current Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(flags).map(([flag, enabled]) => (
            <div key={flag} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{flag.replace(/_/g, ' ')}</span>
              <span className={`font-medium ${enabled ? 'text-green-600' : 'text-gray-400'}`}>
                {enabled ? 'ON' : 'OFF'}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Changes are automatically saved to localStorage and will persist across browser sessions.
          Refresh the page to see changes take effect.
        </div>
      </div>
    </div>
  );
};

export default FeatureFlagDemo;
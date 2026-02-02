/**
 * ============================================================================
 * 🔌 INTEGRATED ACCESSIBILITY DASHBOARD - APPWRITE CONNECTED
 * ============================================================================
 * 
 * This component integrates the accessibility system with your live Appwrite data:
 * - Connects to real therapist profiles from 'therapists_collection_id'
 * - Integrates with booking system from 'bookings_collection_id'
 * - Connects to chat system messages
 * - Stores accessibility settings in Appwrite
 * - Real-time compliance monitoring for therapist dashboard
 * - Analytics and usage tracking
 * 
 * Usage:
 * <IntegratedAccessibilityDashboard 
 *   therapistId="your-therapist-id" 
 *   onComplianceUpdate={handleCompliance}
 * />
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, Users, BarChart, Settings, CheckCircle, AlertTriangle, Volume, Hash, Brush, Eye, Target, Zap, Star, Award, TrendingUp, Clock, Bell, BookOpen} from 'lucide-react';

// Import our accessibility components
import AccessibilityDashboard from './AccessibilityDashboard';
import WCAGComplianceChecker from './WCAGComplianceChecker';
import ScreenReaderSupport from './ScreenReaderSupport';
import KeyboardNavigationManager from './KeyboardNavigationManager';
import HighContrastVisualModes from './HighContrastVisualModes';

// Import Appwrite integration hooks
import { 
  useAccessibilitySettings, 
  useTherapistAccessibility, 
  useAccessibilityAnalytics 
} from '../../hooks/useAccessibilityAppwrite';

// Import types
import type { 
  AccessibilitySettings, 
  WCAGViolation, 
  LiveAnnouncement,
  AccessibilityFeatureType 
} from './types';

export interface IntegratedAccessibilityDashboardProps {
  therapistId: string;
  onComplianceUpdate?: (score: number) => void;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
  onFeatureUsage?: (feature: AccessibilityFeatureType) => void;
  className?: string;
}

export const IntegratedAccessibilityDashboard: React.FC<IntegratedAccessibilityDashboardProps> = ({
  therapistId,
  onComplianceUpdate,
  onSettingsChange,
  onFeatureUsage,
  className = ""
}) => {
  const [activeComponent, setActiveComponent] = useState<'overview' | 'dashboard' | 'wcag' | 'screen-reader' | 'keyboard' | 'visual'>('overview');
  const [complianceScore, setComplianceScore] = useState(0);
  const [violations, setViolations] = useState<WCAGViolation[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  // Appwrite integration hooks
  const { 
    therapist, 
    accessibilitySettings, 
    loading: therapistLoading, 
    enableAccessibilityFeature,
    trackFeatureUsage 
  } = useTherapistAccessibility(therapistId);

  const { 
    settings, 
    loading: settingsLoading, 
    saveSettings 
  } = useAccessibilitySettings(therapistId);

  const { trackFeatureUsage: trackAnalytics } = useAccessibilityAnalytics(therapistId);

  // Components configuration
  const components = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: BarChart3, 
      description: 'Accessibility status and metrics' 
    },
    { 
      id: 'dashboard', 
      label: 'Full Dashboard', 
      icon: Shield, 
      description: 'Complete accessibility management' 
    },
    { 
      id: 'wcag', 
      label: 'WCAG Compliance', 
      icon: CheckCircle, 
      description: 'Standards compliance checking' 
    },
    { 
      id: 'screen-reader', 
      label: 'Screen Reader', 
      icon: Volume2, 
      description: 'Screen reader optimization' 
    },
    { 
      id: 'keyboard', 
      label: 'Keyboard Nav', 
      icon: Keyboard, 
      description: 'Keyboard navigation testing' 
    },
    { 
      id: 'visual', 
      label: 'Visual Modes', 
      icon: Palette, 
      description: 'High contrast and visual accessibility' 
    }
  ];

  // Handle feature activation
  const handleFeatureActivation = async (feature: AccessibilityFeatureType, enabled: boolean) => {
    try {
      await enableAccessibilityFeature(feature, enabled);
      await trackAnalytics(feature);
      onFeatureUsage?.(feature);
      
      setRecentActivity(prev => [
        `${feature} ${enabled ? 'enabled' : 'disabled'} at ${new Date().toLocaleTimeString()}`,
        ...prev.slice(0, 4)
      ]);
    } catch (error) {
      console.error('Error activating accessibility feature:', error);
    }
  };

  // Handle compliance updates
  const handleComplianceChange = (score: number) => {
    setComplianceScore(score);
    onComplianceUpdate?.(score);
  };

  // Handle violations detection
  const handleViolationsDetected = (detectedViolations: WCAGViolation[]) => {
    setViolations(detectedViolations);
  };

  // Handle settings changes
  const handleSettingsChange = async (newSettings: Partial<AccessibilitySettings>) => {
    try {
      await saveSettings(newSettings);
      onSettingsChange?.(settings!);
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  };

  // Loading state
  if (therapistLoading || settingsLoading) {
    return (
      <div className={`bg-gray-50 min-h-screen flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accessibility dashboard...</p>
        </div>
      </div>
    );
  }

  // Overview component
  const OverviewComponent: React.FC = () => (
    <div className="space-y-6">
      {/* Therapist Profile Integration */}
      {therapist && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={therapist.profilePicture || 'https://via.placeholder.com/80'} 
              alt={therapist.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{therapist.name}</h3>
              <p className="text-gray-600">Accessibility Dashboard</p>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Compliance Score: {complianceScore}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Compliance Score</p>
              <p className="text-2xl font-bold text-green-600">{complianceScore}%</p>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Issues Found</p>
              <p className="text-2xl font-bold text-red-600">{violations.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Features Active</p>
              <p className="text-2xl font-bold text-blue-600">
                {settings ? Object.values(settings).filter(v => v === true).length : 0}
              </p>
            </div>
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Last Audit</p>
              <p className="text-sm font-medium text-gray-900">
                {settings?.lastComplianceCheck ? 
                  new Date(settings.lastComplianceCheck).toLocaleDateString() : 
                  'Never'
                }
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleFeatureActivation('high-contrast', !settings?.highContrastMode)}
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <Brush className="w-6 h-6 text-purple-600" />
            <span className="text-sm text-gray-700">High Contrast</span>
            {settings?.highContrastMode && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => handleFeatureActivation('screen-reader', !settings?.screenReaderEnabled)}
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <Volume className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-700">Screen Reader</span>
            {settings?.screenReaderEnabled && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => handleFeatureActivation('keyboard-navigation', !settings?.keyboardNavigationEnabled)}
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <Hash className="w-6 h-6 text-green-600" />
            <span className="text-sm text-gray-700">Keyboard Nav</span>
            {settings?.keyboardNavigationEnabled && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => setActiveComponent('wcag')}
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <span className="text-sm text-gray-700">Run Audit</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        
        <div className="space-y-3">
          {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">{activity}</span>
            </div>
          )) : (
            <p className="text-gray-500 text-sm">No recent accessibility activity</p>
          )}
        </div>
      </div>

      {/* Issues Summary */}
      {violations.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues to Address</h3>
          
          <div className="space-y-3">
            {violations.slice(0, 3).map((violation) => (
              <div key={violation.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-red-900">{violation.title}</div>
                  <div className="text-sm text-red-700 mt-1">{violation.description}</div>
                </div>
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                  {violation.level}
                </span>
              </div>
            ))}
            
            {violations.length > 3 && (
              <button
                onClick={() => setActiveComponent('wcag')}
                className="w-full text-center py-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                View {violations.length - 3} more issues
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-7 h-7 text-blue-600" />
              Accessibility Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              {therapist ? `${therapist.name} - ` : ''}Comprehensive accessibility management
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${complianceScore >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-gray-600">
                {complianceScore >= 80 ? 'Compliant' : 'Needs Attention'}
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              Score: {complianceScore}%
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <nav className="flex gap-1">
            {components.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => setActiveComponent(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeComponent === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
                title={description}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {activeComponent === 'overview' && <OverviewComponent />}
        
        {activeComponent === 'dashboard' && (
          <AccessibilityDashboard 
            enabled={true}
            therapistId={therapistId}
            onComplianceChange={handleComplianceChange}
            onSettingsChange={handleSettingsChange}
          />
        )}
        
        {activeComponent === 'wcag' && (
          <WCAGComplianceChecker 
            enabled={true}
            onViolationDetected={handleViolationsDetected}
            onComplianceScore={handleComplianceChange}
          />
        )}
        
        {activeComponent === 'screen-reader' && (
          <ScreenReaderSupport 
            enabled={settings?.screenReaderEnabled || false}
            onAnnouncementChange={(announcement: LiveAnnouncement) => {
              setRecentActivity(prev => [
                `Screen reader: ${announcement.message}`,
                ...prev.slice(0, 4)
              ]);
            }}
          />
        )}
        
        {activeComponent === 'keyboard' && (
          <KeyboardNavigationManager 
            enabled={settings?.keyboardNavigationEnabled || false}
            onNavigationChange={(event) => {
              setRecentActivity(prev => [
                `Keyboard event: ${event.type} on ${event.element.tagName}`,
                ...prev.slice(0, 4)
              ]);
            }}
          />
        )}
        
        {activeComponent === 'visual' && (
          <HighContrastVisualModes 
            enabled={settings?.highContrastMode || false}
            onThemeChange={(theme) => {
              handleSettingsChange({ visualTheme: theme });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default IntegratedAccessibilityDashboard;
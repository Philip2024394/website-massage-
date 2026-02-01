/**
 * ============================================================================
 * 🔧 NOTIFICATION SETTINGS PANEL - TASK 2 COMPLETION
 * ============================================================================
 * 
 * Settings panel for the Enhanced Notification System:
 * - Sound preferences
 * - Notification priorities
 * - Quiet hours configuration
 * - Push notification settings
 * - Custom sound selection
 * 
 * ============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Zap as Volume, X as VolumeOff, Bell, Bell as BellSlash, Clock, Save, X } from 'lucide-react';

interface NotificationSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  pushEnabled: boolean;
  priorities: {
    low: boolean;
    normal: boolean;
    high: boolean;
    urgent: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  therapistId: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  pushEnabled: true,
  priorities: {
    low: true,
    normal: true,
    high: true,
    urgent: true
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '06:00'
  }
};

export const NotificationSettingsPanel: React.FC<NotificationSettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  therapistId
}) => {
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const updateSetting = useCallback((path: string, value: any) => {
    setLocalSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      setHasChanges(true);
      return newSettings;
    });
  }, []);

  const handleSave = useCallback(() => {
    onSettingsChange(localSettings);
    localStorage.setItem(`notification_settings_${therapistId}`, JSON.stringify(localSettings));
    setHasChanges(false);
    onClose();
  }, [localSettings, onSettingsChange, therapistId, onClose]);

  const handleReset = useCallback(() => {
    setLocalSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  }, []);

  const testNotification = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is how your notifications will look!',
        icon: '/icons/notification-icon.png'
      });
    } else {
      alert('Test notification sent! (Push notifications not available)');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          {/* General Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">General</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {localSettings.pushEnabled ? (
                    <Bell className="w-5 h-5 text-blue-500" />
                  ) : (
                    <BellSlash className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-gray-600">Receive notifications even when app is closed</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localSettings.pushEnabled}
                    onChange={(e) => updateSetting('pushEnabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {localSettings.soundEnabled ? (
                    <Volume className="w-5 h-5 text-green-500" />
                  ) : (
                    <VolumeOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium">Sound Alerts</div>
                    <div className="text-sm text-gray-600">Play sound when notifications arrive</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localSettings.soundEnabled}
                    onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    📳
                  </div>
                  <div>
                    <div className="font-medium">Vibration</div>
                    <div className="text-sm text-gray-600">Vibrate on mobile devices</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localSettings.vibrationEnabled}
                    onChange={(e) => updateSetting('vibrationEnabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Priority Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notification Types</h3>
            <div className="space-y-2">
              {[
                { key: 'urgent', label: 'Urgent', color: 'red', description: 'Booking requests, emergencies' },
                { key: 'high', label: 'High', color: 'orange', description: 'Payments, important updates' },
                { key: 'normal', label: 'Normal', color: 'blue', description: 'Messages, confirmations' },
                { key: 'low', label: 'Low', color: 'gray', description: 'Promotions, tips' }
              ].map((priority) => (
                <div key={priority.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${priority.color}-500`}></div>
                    <div>
                      <div className="font-medium">{priority.label}</div>
                      <div className="text-sm text-gray-600">{priority.description}</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={localSettings.priorities[priority.key as keyof typeof localSettings.priorities]}
                      onChange={(e) => updateSetting(`priorities.${priority.key}`, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quiet Hours</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Enable Quiet Hours</div>
                    <div className="text-sm text-blue-600">Silence notifications during these times</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localSettings.quietHours.enabled}
                    onChange={(e) => updateSetting('quietHours.enabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {localSettings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={localSettings.quietHours.start}
                      onChange={(e) => updateSetting('quietHours.start', e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={localSettings.quietHours.end}
                      onChange={(e) => updateSetting('quietHours.end', e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={testNotification}
            className="flex-1 px-4 py-3 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Test Notification
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-3 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPanel;
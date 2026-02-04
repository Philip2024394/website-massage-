/**
 * NOTIFICATION SOUND SETTINGS COMPONENT
 * UI toggle for notification sound preferences
 * 
 * PURPOSE: Allow users to control notification sound behavior
 * PLATFORM: Web + PWA (Android + iOS)
 * INTEGRATION: Uses notificationSoundSettings service
 */

import React, { useState, useEffect } from 'react';
import { notificationSoundSettings } from '../services/notificationSoundSettings';
import { pwaNotificationSoundHandler } from '../services/pwaNotificationSoundHandler';

interface NotificationSoundSettingsProps {
  className?: string;
  showVolumeControl?: boolean;
  showVibrationControl?: boolean;
}

export const NotificationSoundSettings: React.FC<NotificationSoundSettingsProps> = ({
  className = '',
  showVolumeControl = true,
  showVibrationControl = true
}) => {
  const [soundEnabled, setSoundEnabled] = useState(notificationSoundSettings.isSoundEnabled());
  const [volume, setVolume] = useState(notificationSoundSettings.getVolume());
  const [vibrationEnabled, setVibrationEnabled] = useState(notificationSoundSettings.isVibrationEnabled());

  // Update local state when settings change
  useEffect(() => {
    const checkSettings = () => {
      setSoundEnabled(notificationSoundSettings.isSoundEnabled());
      setVolume(notificationSoundSettings.getVolume());
      setVibrationEnabled(notificationSoundSettings.isVibrationEnabled());
    };

    // Check settings every second (in case changed elsewhere)
    const interval = setInterval(checkSettings, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const newState = notificationSoundSettings.toggleSound();
    setSoundEnabled(newState);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    notificationSoundSettings.setVolume(newVolume);
  };

  const handleToggleVibration = () => {
    const newState = !vibrationEnabled;
    setVibrationEnabled(newState);
    notificationSoundSettings.setVibrationEnabled(newState);
  };

  const handleTestSound = async () => {
    await pwaNotificationSoundHandler.testSound('booking');
  };

  return (
    <div className={`notification-sound-settings space-y-4 ${className}`}>
      {/* Sound Toggle */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <h3 className="font-semibold text-gray-800">Notification Sound</h3>
            <p className="text-sm text-gray-600">Play sound for new bookings and messages</p>
          </div>
        </div>
        <button
          onClick={handleToggleSound}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            soundEnabled ? 'bg-orange-500' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={soundEnabled}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              soundEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Volume Control */}
      {showVolumeControl && soundEnabled && (
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔊</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">Volume</h3>
              <p className="text-sm text-gray-600">{Math.round(volume * 100)}%</p>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>
      )}

      {/* Vibration Toggle */}
      {showVibrationControl && (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📳</span>
            <div>
              <h3 className="font-semibold text-gray-800">Vibration</h3>
              <p className="text-sm text-gray-600">Vibrate when notification arrives</p>
            </div>
          </div>
          <button
            onClick={handleToggleVibration}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              vibrationEnabled ? 'bg-orange-500' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={vibrationEnabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                vibrationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )}

      {/* Test Sound Button */}
      {soundEnabled && (
        <button
          onClick={handleTestSound}
          className="w-full p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
        >
          🧪 Test Notification Sound
        </button>
      )}

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">PWA Notification Requirements</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ <strong>Android:</strong> Sounds work in background with high-priority channel</li>
              <li>⚠️ <strong>iOS:</strong> Requires notification permission (tap "Enable" when prompted)</li>
              <li>🔊 <strong>Open App:</strong> Custom sound plays</li>
              <li>🔇 <strong>Closed App:</strong> System sound plays</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSoundSettings;

/**
 * iOS NOTIFICATION PERMISSION PROMPT
 * 🍎 iOS-SAFE NOTIFICATION PERMISSION HANDLING
 * 
 * PURPOSE: Handle iOS PWA notification permission with proper user education
 * REQUIREMENT: iOS requires user gesture to request notification permission
 * INTEGRATION: Must be triggered from user action (button click)
 * 
 * iOS RULES:
 * - Custom MP3 sounds ❌ NOT allowed
 * - System sound ✅ ONLY option
 * - User MUST grant permission via user gesture
 * - Cannot use Notification.requestPermission() without user action
 */

import React, { useState, useEffect } from 'react';
import { pwaNotificationSoundHandler } from '../services/pwaNotificationSoundHandler';

interface IOSNotificationPromptProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  autoShow?: boolean;
}

export const IOSNotificationPrompt: React.FC<IOSNotificationPromptProps> = ({
  onPermissionGranted,
  onPermissionDenied,
  autoShow = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isiOS);

    // Detect PWA
    const isPWAMode = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
    setIsPWA(isPWAMode);

    // Check current permission state
    if ('Notification' in window) {
      setPermissionState(Notification.permission);

      // Auto-show prompt if permission not granted and autoShow is true
      if (autoShow && Notification.permission === 'default' && isiOS && isPWAMode) {
        setIsVisible(true);
      }
    }
  }, [autoShow]);

  const handleRequestPermission = async () => {
    try {
      // 🍎 iOS CRITICAL: Must be called from user gesture
      // This function is ONLY called from button click, satisfying iOS requirement
      
      // Step 1: Request notification permission
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission === 'granted') {
        console.log('✅ iOS notification permission granted');

        // Step 2: Request audio playback permission (iOS-specific)
        await pwaNotificationSoundHandler.requestIOSAudioPermission();

        // Step 3: Hide prompt and call success callback
        setIsVisible(false);
        if (onPermissionGranted) {
          onPermissionGranted();
        }

        // Show success message
        alert('✅ Notifications enabled! You\'ll receive booking alerts with sound.');
      } else {
        console.log('❌ iOS notification permission denied');
        setIsVisible(false);
        if (onPermissionDenied) {
          onPermissionDenied();
        }
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      alert('⚠️ Failed to enable notifications. Please try again or check your browser settings.');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Don't call onPermissionDenied here, user just dismissed without deciding
  };

  // Don't show if permission already granted
  if (permissionState === 'granted') {
    return null;
  }

  // Don't show if permission explicitly denied
  if (permissionState === 'denied') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔇</span>
          <div>
            <h4 className="font-semibold text-red-900 mb-1">Notifications Blocked</h4>
            <p className="text-sm text-red-800 mb-2">
              Notification permission was denied. To receive booking alerts:
            </p>
            <ol className="text-sm text-red-800 space-y-1 list-decimal ml-4">
              <li>Open Safari Settings</li>
              <li>Find this website in the list</li>
              <li>Enable Notifications</li>
              <li>Reload this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Only show prompt if visible
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="w-full p-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
      >
        🔔 Enable Notification Sounds
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-3">🔔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Enable Booking Alerts
          </h2>
          <p className="text-gray-600">
            Get notified instantly when you receive new bookings
          </p>
        </div>

        {/* iOS-specific instructions */}
        {isIOS && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span>🍎</span> iOS PWA Notifications
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span>✅</span>
                <span>Sound notifications will work when app is installed</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🔊</span>
                <span>System sound will play (iOS limitation)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📱</span>
                <span>Notifications appear on lock screen</span>
              </li>
            </ul>
          </div>
        )}

        {/* Benefits list */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📬</span>
            <div>
              <div className="font-semibold text-gray-800">New Booking Alerts</div>
              <div className="text-sm text-gray-600">Instant notification with sound</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <div className="font-semibold text-gray-800">Message Notifications</div>
              <div className="text-sm text-gray-600">Never miss customer messages</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <div className="font-semibold text-gray-800">Status Updates</div>
              <div className="text-sm text-gray-600">Booking confirmations and changes</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRequestPermission}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
          >
            🔔 Enable Notifications
          </button>
          <button
            onClick={handleDismiss}
            className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          You can disable notifications anytime in settings
        </p>
      </div>
    </div>
  );
};

export default IOSNotificationPrompt;

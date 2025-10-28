import React, { useState, useEffect } from 'react';
import { pushNotificationService } from '../utils/pushNotificationService';
import Button from './Button';

interface PushNotificationSettingsProps {
    providerId: number;
    providerType: 'therapist' | 'place';
}

const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({ 
    providerId,
    providerType 
}) => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    useEffect(() => {
        checkSupport();
        checkSubscriptionStatus();
        checkInstallability();
    }, [providerId]);

    const checkSupport = async () => {
        const supported = await pushNotificationService.isSupported();
        setIsSupported(supported);
        
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    };

    const checkSubscriptionStatus = async () => {
        try {
            const subscribed = await pushNotificationService.isSubscribed(providerId);
            setIsSubscribed(subscribed);
        } catch (err) {
            console.error('Error checking subscription:', err);
        }
    };

    const checkInstallability = () => {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowInstallPrompt(false);
        } else {
            setShowInstallPrompt(true);
        }
    };

    const handleEnableNotifications = async () => {
        setLoading(true);
        setError('');

        try {
            // Request permission first
            const permissionGranted = await pushNotificationService.requestPermission();
            
            if (!permissionGranted) {
                setError('Notification permission denied. Please enable notifications in your browser settings.');
                setLoading(false);
                return;
            }

            // Subscribe to push notifications
            await pushNotificationService.subscribe(providerId);
            
            setIsSubscribed(true);
            setPermission('granted');
            
            // Show success notification
            alert('✅ Background notifications enabled! You will now receive alerts even when browsing other apps.');
            
        } catch (err: any) {
            console.error('Error enabling notifications:', err);
            setError(err.message || 'Failed to enable notifications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisableNotifications = async () => {
        setLoading(true);
        setError('');

        try {
            await pushNotificationService.unsubscribe(providerId);
            setIsSubscribed(false);
            alert('Background notifications disabled.');
        } catch (err: any) {
            console.error('Error disabling notifications:', err);
            setError(err.message || 'Failed to disable notifications.');
        } finally {
            setLoading(false);
        }
    };

    const handleTestNotification = async () => {
        try {
            await pushNotificationService.testNotification();
            alert('Test notification sent! Check your notifications.');
        } catch (err: any) {
            console.error('Error sending test notification:', err);
            alert('Failed to send test notification: ' + err.message);
        }
    };

    const handleInstallApp = () => {
        // Show install instructions
        alert(
            '📱 To install IndaStreet:\n\n' +
            'Android Chrome:\n' +
            '1. Tap the menu (⋮)\n' +
            '2. Select "Install app" or "Add to Home screen"\n\n' +
            'iOS Safari:\n' +
            '1. Tap the Share button\n' +
            '2. Select "Add to Home Screen"\n\n' +
            'Desktop Chrome:\n' +
            '1. Look for the install icon in the address bar\n' +
            '2. Click "Install"'
        );
    };

    if (!isSupported) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                            Push Notifications Not Supported
                        </h3>
                        <p className="text-sm text-gray-600">
                            Your browser doesn't support push notifications. 
                            Try using Chrome on Android or Safari 16.4+ on iOS.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Status Card */}
            <div className={`border rounded-lg p-4 ${
                isSubscribed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <span className="text-2xl">
                            {isSubscribed ? '✅' : '🔔'}
                        </span>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                                Background Notifications
                            </h3>
                            <p className="text-sm text-gray-600">
                                {isSubscribed 
                                    ? '✅ Active - You\'ll receive alerts even when browsing other apps or phone is locked'
                                    : '❌ Disabled - Enable to receive alerts in background'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Install App Prompt */}
            {showInstallPrompt && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <span className="text-2xl">📱</span>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                                Install IndaStreet App
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                For the best notification experience, install IndaStreet to your home screen.
                            </p>
                            <button
                                onClick={handleInstallApp}
                                className="w-full bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50 focus:ring-orange-500 font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300"
                            >
                                📲 Install App
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* How It Works */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">💡</span>
                    How Background Notifications Work
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-8">
                    <li className="list-disc">
                        Get alerts when customers contact you on WhatsApp
                    </li>
                    <li className="list-disc">
                        Receive booking requests instantly
                    </li>
                    <li className="list-disc">
                        Works even when browsing TikTok, Instagram, or other apps
                    </li>
                    <li className="list-disc">
                        Get notifications when your phone is locked
                    </li>
                    <li className="list-disc">
                        Custom sound alerts for each notification type
                    </li>
                </ul>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">
                        ❌ {error}
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                {!isSubscribed ? (
                    <Button
                        onClick={handleEnableNotifications}
                        disabled={loading}
                        className="flex-1"
                        variant="primary"
                    >
                        {loading ? '⏳ Enabling...' : '🔔 Enable Background Notifications'}
                    </Button>
                ) : (
                    <>
                        <Button
                            onClick={handleTestNotification}
                            variant="outline"
                            className="flex-1"
                        >
                            🧪 Send Test Notification
                        </Button>
                        <Button
                            onClick={handleDisableNotifications}
                            disabled={loading}
                            variant="outline"
                            className="flex-1"
                        >
                            {loading ? '⏳ Disabling...' : '🔕 Disable Notifications'}
                        </Button>
                    </>
                )}
            </div>

            {/* Permission Info */}
            {permission === 'denied' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                        ❌ Notifications Blocked
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                        You have blocked notifications for this site. To enable them:
                    </p>
                    <ol className="text-sm text-gray-600 space-y-1 ml-6">
                        <li className="list-decimal">
                            Click the lock icon in your browser's address bar
                        </li>
                        <li className="list-decimal">
                            Find "Notifications" in the permissions list
                        </li>
                        <li className="list-decimal">
                            Change from "Block" to "Allow"
                        </li>
                        <li className="list-decimal">
                            Refresh this page and try again
                        </li>
                    </ol>
                </div>
            )}

            {/* Technical Details */}
            <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                    🔧 Technical Details
                </summary>
                <div className="mt-3 text-sm text-gray-600 space-y-2">
                    <p>
                        <strong>Browser Support:</strong> {isSupported ? '✅ Supported' : '❌ Not Supported'}
                    </p>
                    <p>
                        <strong>Permission Status:</strong> {permission}
                    </p>
                    <p>
                        <strong>Subscription Status:</strong> {isSubscribed ? '✅ Active' : '❌ Inactive'}
                    </p>
                    <p>
                        <strong>Provider ID:</strong> {providerId}
                    </p>
                    <p>
                        <strong>Provider Type:</strong> {providerType}
                    </p>
                    <p>
                        <strong>Service Worker:</strong> {
                            'serviceWorker' in navigator ? '✅ Available' : '❌ Not Available'
                        }
                    </p>
                    <p className="pt-2 border-t border-gray-300">
                        <strong>Note:</strong> Background notifications use the Web Push API 
                        powered by Appwrite Realtime. No Firebase required.
                    </p>
                </div>
            </details>
        </div>
    );
};

export default PushNotificationSettings;

import React from 'react';
import { useNotifications } from '../providers/NotificationProvider';

const NotificationTester: React.FC = () => {
    const {
        notifyBookingConfirmed,
        notifyBookingCancelled,
        notifyChatMessage,
        notifyCoinsEarned,
        notifyCommissionRequest,
        testNotificationSound,
        areNotificationsEnabled,
        setNotificationsEnabled
    } = useNotifications();

    const testButtons = [
        {
            label: 'Test Booking Sound',
            action: () => testNotificationSound('booking'),
            color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
            label: 'Test Chat Sound',
            action: () => testNotificationSound('chat'),
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            label: 'Test Coin Sound',
            action: () => testNotificationSound('coin'),
            color: 'bg-yellow-500 hover:bg-yellow-600'
        },
        {
            label: 'Test Alert Sound',
            action: () => testNotificationSound('urgent'),
            color: 'bg-red-500 hover:bg-red-600'
        },
        {
            label: 'Test Success Sound',
            action: () => testNotificationSound('success'),
            color: 'bg-purple-500 hover:bg-purple-600'
        }
    ];

    const scenarioTests = [
        {
            label: 'Booking Confirmed',
            action: () => notifyBookingConfirmed('BOOK123', 'Sarah Johnson'),
            color: 'bg-blue-600 hover:bg-blue-700'
        },
        {
            label: 'Booking Cancelled',
            action: () => notifyBookingCancelled('BOOK123', 'Customer request'),
            color: 'bg-red-600 hover:bg-red-700'
        },
        {
            label: 'Chat Message',
            action: () => notifyChatMessage('John Doe', 'Hello, how are you?', 'chat123'),
            color: 'bg-green-600 hover:bg-green-700'
        },
        {
            label: 'Coins Earned (10)',
            action: () => notifyCoinsEarned(10, 'Profile completed', 'customer'),
            color: 'bg-yellow-600 hover:bg-yellow-700'
        },
        {
            label: 'Big Coin Reward (100)',
            action: () => notifyCoinsEarned(100, 'VIP booking completed', 'therapist'),
            color: 'bg-orange-600 hover:bg-orange-700'
        },
        {
            label: 'Commission Request',
            action: () => notifyCommissionRequest('Sarah Johnson', 25, 'comm123'),
            color: 'bg-purple-600 hover:bg-purple-700'
        }
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                🔊 Notification Sound System Tester
            </h2>
            
            {/* Notification Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                    <span className="text-gray-700">
                        Notifications: {areNotificationsEnabled ? '✅ Enabled' : '❌ Disabled'}
                    </span>
                    <button
                        onClick={() => setNotificationsEnabled(!areNotificationsEnabled)}
                        className={`px-4 py-2 rounded-md text-white transition-colors ${
                            areNotificationsEnabled 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-green-500 hover:bg-green-600'
                        }`}
                    >
                        {areNotificationsEnabled ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>

            {/* Sound Tests */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    🎵 Individual Sound Tests
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {testButtons.map((test, index) => (
                        <button
                            key={index}
                            onClick={test.action}
                            className={`${test.color} text-white px-4 py-3 rounded-md transition-colors duration-200 font-medium`}
                        >
                            {test.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scenario Tests */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    🎭 Full Notification Scenarios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {scenarioTests.map((test, index) => (
                        <button
                            key={index}
                            onClick={test.action}
                            className={`${test.color} text-white px-4 py-3 rounded-md transition-colors duration-200 font-medium text-left`}
                        >
                            {test.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📋 Testing Instructions:</h4>
                <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• Click "Individual Sound Tests" to hear each MP3 file</li>
                    <li>• Click "Full Notification Scenarios" to test complete notifications with sounds</li>
                    <li>• Check browser notifications (you may need to allow permissions)</li>
                    <li>• Test with app in background to verify background notifications work</li>
                    <li>• All sounds use your existing MP3 files in /public/sounds/</li>
                </ul>
            </div>

            {/* Available MP3 Files */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">🎵 Your Available MP3 Files:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-green-700">
                    <div>✅ booking-notification.mp3</div>
                    <div>✅ message-notification.mp3</div>
                    <div>✅ success-notification.mp3</div>
                    <div>✅ alert-notification.mp3</div>
                    <div>✅ indastreet.mp3</div>
                </div>
            </div>
        </div>
    );
};

export default NotificationTester;
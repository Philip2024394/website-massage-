import React, { useState, useEffect } from 'react';
import { soundNotificationService } from '../../utils/soundNotificationService';
import { badgeService } from '../../utils/badgeService';

interface NotificationSettingsProps {
    providerWhatsApp?: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
    providerWhatsApp = '' 
}) => {
    const [volume, setVolume] = useState(
        Math.round(soundNotificationService.getVolume() * 100)
    );
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        'Notification' in window ? Notification.permission : 'denied'
    );
    const [badgeSupported, setBadgeSupported] = useState(false);

    useEffect(() => {
        // Check badge support
        setBadgeSupported(badgeService.isSupported());

        // Store WhatsApp number in localStorage for sound service
        if (providerWhatsApp) {
            localStorage.setItem('providerWhatsApp', providerWhatsApp);
        }
    }, [providerWhatsApp]);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        soundNotificationService.setVolume(newVolume / 100);
    };

    const testSound = async () => {
        await soundNotificationService.playSound('booking');
    };

    const testNotification = async () => {
        await soundNotificationService.showBookingNotification(
            'Test Client',
            '60',
            'test-123'
        );
    };

    const requestNotificationPermission = async () => {
        const permission = await soundNotificationService.requestPermission();
        setNotificationPermission(permission);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">
                        Notification Settings
                    </h3>
                    <p className="text-sm text-gray-600">
                        Manage how you receive booking alerts
                    </p>
                </div>
            </div>

            {/* Sound Notifications - Always Enabled */}
            <div className="flex items-center justify-between mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex-1">
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                        Sound Notifications - Always Active
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                        🔊 Sound alerts are mandatory for all active members to ensure you never miss a booking
                    </p>
                </div>
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Enabled
                </div>
            </div>

            {/* Volume Control */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <label className="font-semibold text-gray-900">
                            Volume: {volume}%
                        </label>
                        <span className="text-sm text-gray-600">
                            {volume === 0 ? '🔇' : volume < 30 ? '🔈' : volume < 70 ? '🔉' : '🔊'}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Mute</span>
                        <span>Max</span>
                    </div>
                </div>

            {/* Desktop Notifications */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                            Desktop Notifications
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            Show popup alerts on your screen
                        </p>
                    </div>
                    {notificationPermission === 'granted' ? (
                        <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Enabled
                        </span>
                    ) : (
                        <button
                            onClick={requestNotificationPermission}
                            className="px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition-colors"
                        >
                            Enable
                        </button>
                    )}
                </div>
            </div>

            {/* Home Screen Badge */}
            {badgeSupported && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="font-semibold text-blue-900">
                            Home Screen Badge Enabled
                        </p>
                    </div>
                    <p className="text-sm text-blue-800">
                        A red badge with unread count will appear on your home screen app icon
                    </p>
                </div>
            )}

            {/* Test Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                    onClick={testSound}
                    disabled={!soundEnabled}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
                        soundEnabled
                            ? 'bg-brand-orange text-white hover:bg-orange-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                    Test Sound
                </button>

                <button
                    onClick={testNotification}
                    disabled={notificationPermission !== 'granted'}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
                        notificationPermission === 'granted'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    Test Notification
                </button>
            </div>

            {/* WhatsApp Integration Info */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-green-900 mb-1">
                            WhatsApp Notifications Active
                        </h4>
                        <p className="text-sm text-green-800 mb-2">
                            Critical booking requests are also sent to:
                        </p>
                        <p className="text-sm font-mono font-semibold text-green-900 bg-green-100 px-3 py-2 rounded">
                            +62{providerWhatsApp || '---'}
                        </p>
                        <p className="text-xs text-green-700 mt-2">
                            💡 Make sure WhatsApp notifications are enabled on your phone
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

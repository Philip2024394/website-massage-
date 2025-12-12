import React, { useState, useEffect } from 'react';
import { systemHealthService } from '@/lib/systemHealthService';

interface SystemHealthIndicatorProps {
    memberId: string;
}

export default function SystemHealthIndicator({ memberId }: SystemHealthIndicatorProps) {
    const [healthStatus, setHealthStatus] = useState<{
        notificationsEnabled: boolean;
        soundEnabled: boolean;
        isOnline: boolean;
        connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
        lastCheck: Date;
    }>({
        notificationsEnabled: false,
        soundEnabled: false,
        isOnline: true,
        connectionQuality: 'good',
        lastCheck: new Date()
    });
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Update health status every 10 seconds
        const interval = setInterval(updateHealthStatus, 10000);
        updateHealthStatus(); // Initial check
        
        return () => clearInterval(interval);
    }, []);

    const updateHealthStatus = () => {
        const notificationsEnabled = 'Notification' in window && Notification.permission === 'granted';
        const soundEnabled = localStorage.getItem('notificationSound') !== 'false';
        const isOnline = navigator.onLine;
        
        setHealthStatus({
            notificationsEnabled,
            soundEnabled,
            isOnline,
            connectionQuality: getConnectionQuality(),
            lastCheck: new Date()
        });
    };

    const getConnectionQuality = (): 'excellent' | 'good' | 'poor' | 'offline' => {
        if (!navigator.onLine) return 'offline';
        
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        if (connection) {
            const effectiveType = connection.effectiveType;
            if (effectiveType === '4g') return 'excellent';
            if (effectiveType === '3g') return 'good';
            return 'poor';
        }
        return 'good';
    };

    const getStatusIcon = () => {
        if (!healthStatus.isOnline) return '⚫';
        if (!healthStatus.notificationsEnabled || !healthStatus.soundEnabled) return '🚨';
        if (healthStatus.connectionQuality === 'poor') return '⚠️';
        return '✅';
    };

    const getStatusColor = () => {
        if (!healthStatus.isOnline) return 'bg-gray-500';
        if (!healthStatus.notificationsEnabled || !healthStatus.soundEnabled) return 'bg-red-500';
        if (healthStatus.connectionQuality === 'poor') return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStatusText = () => {
        if (!healthStatus.isOnline) return 'Offline';
        if (!healthStatus.notificationsEnabled) return 'Notifications Disabled';
        if (!healthStatus.soundEnabled) return 'Sound Disabled';
        if (healthStatus.connectionQuality === 'poor') return 'Poor Connection';
        return 'System Healthy';
    };

    const handleEnableNotifications = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                updateHealthStatus();
                alert('✅ Notifications enabled successfully!');
            } else {
                alert('❌ Please enable notifications in your browser settings.');
            }
        } catch (error) {
            console.error('Failed to request notification permission:', error);
        }
    };

    const handleEnableSound = () => {
        localStorage.setItem('notificationSound', 'true');
        updateHealthStatus();
        alert('✅ Notification sound enabled!');
    };

    const handleTestSystem = async () => {
        const success = await systemHealthService.testNotificationSystem();
        if (success) {
            alert('✅ Test successful! Check if you heard the notification sound.');
        } else {
            alert('❌ Test failed. Please check your settings.');
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Status Indicator */}
            <div 
                className="bg-white rounded-lg shadow-lg p-3 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setShowDetails(!showDetails)}
            >
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
                    <span className="text-sm font-medium text-gray-700">
                        {getStatusIcon()} {getStatusText()}
                    </span>
                </div>
            </div>

            {/* Details Panel */}
            {showDetails && (
                <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-4 w-80 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-gray-900">System Status</h3>
                        <button 
                            onClick={() => setShowDetails(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3 text-sm">
                        {/* Notifications Status */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                                <div className="font-medium text-gray-900">Notifications</div>
                                <div className="text-xs text-gray-600">
                                    {healthStatus.notificationsEnabled ? '✅ Enabled' : '❌ Disabled'}
                                </div>
                            </div>
                            {!healthStatus.notificationsEnabled && (
                                <button
                                    onClick={handleEnableNotifications}
                                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                >
                                    Enable
                                </button>
                            )}
                        </div>

                        {/* Sound Status */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                                <div className="font-medium text-gray-900">Sound</div>
                                <div className="text-xs text-gray-600">
                                    {healthStatus.soundEnabled ? '🔊 Enabled' : '🔇 Disabled'}
                                </div>
                            </div>
                            {!healthStatus.soundEnabled && (
                                <button
                                    onClick={handleEnableSound}
                                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                >
                                    Enable
                                </button>
                            )}
                        </div>

                        {/* Connection Status */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                                <div className="font-medium text-gray-900">Connection</div>
                                <div className="text-xs text-gray-600">
                                    {healthStatus.isOnline ? (
                                        <>
                                            {healthStatus.connectionQuality === 'excellent' && '📶 Excellent'}
                                            {healthStatus.connectionQuality === 'good' && '📶 Good'}
                                            {healthStatus.connectionQuality === 'poor' && '📶 Poor'}
                                        </>
                                    ) : '⚫ Offline'}
                                </div>
                            </div>
                        </div>

                        {/* Monitoring Status */}
                        <div className="p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-blue-600">👁️</span>
                                <div className="font-medium text-blue-900 text-xs">Admin Monitoring</div>
                            </div>
                            <div className="text-xs text-blue-700">
                                Your system is being monitored to ensure you receive all bookings
                            </div>
                        </div>

                        {/* Last Check */}
                        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
                            Last check: {healthStatus.lastCheck.toLocaleTimeString()}
                        </div>

                        {/* Test Button */}
                        <button
                            onClick={handleTestSystem}
                            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium text-sm"
                        >
                            🔔 Test Notification & Sound
                        </button>
                    </div>

                    {/* Warning Messages */}
                    {(!healthStatus.notificationsEnabled || !healthStatus.soundEnabled) && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                            <div className="text-xs text-red-800">
                                <strong>⚠️ Action Required:</strong> Enable notifications and sound to receive bookings!
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

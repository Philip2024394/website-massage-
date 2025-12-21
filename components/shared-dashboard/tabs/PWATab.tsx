/**
 * PWATab - Shared PWA installation tab
 */

import React from 'react';

export interface PWATabProps {
    onInstall?: () => void;
    isInstallable: boolean;
    isInstalled: boolean;
}

const PWATab: React.FC<PWATabProps> = ({
    onInstall,
    isInstallable,
    isInstalled,
}) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Progressive Web App</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="text-6xl">📱</div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Install Our App
                        </h3>
                        <p className="text-gray-700">
                            Get quick access and receive notifications
                        </p>
                    </div>
                </div>
                
                {isInstalled ? (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-green-800">
                            <span className="text-2xl">✓</span>
                            <span className="font-semibold">App is installed!</span>
                        </div>
                        <p className="text-sm text-green-700 mt-2">
                            You can now access the dashboard from your home screen
                        </p>
                    </div>
                ) : isInstallable && onInstall ? (
                    <button
                        onClick={onInstall}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                    >
                        Install Now
                    </button>
                ) : (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm">
                            To install the app, open this page in a supported browser (Chrome, Edge, Safari)
                        </p>
                    </div>
                )}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-3xl mb-3">⚡</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Fast Access</h4>
                    <p className="text-sm text-gray-600">
                        Launch directly from your home screen without opening a browser
                    </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-3xl mb-3">🔔</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Notifications</h4>
                    <p className="text-sm text-gray-600">
                        Receive instant alerts for new bookings and messages
                    </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-3xl mb-3">📴</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Offline Access</h4>
                    <p className="text-sm text-gray-600">
                        View your dashboard even when you're offline
                    </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-3xl mb-3">💾</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Save Data</h4>
                    <p className="text-sm text-gray-600">
                        Optimized to use less mobile data than websites
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PWATab;

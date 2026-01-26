/**
 * Simple Monitor Test Component
 * Basic component to verify React rendering works
 */

import React from 'react';

interface SimpleMonitorTestProps {
    onBack?: () => void;
}

const SimpleMonitorTest: React.FC<SimpleMonitorTestProps> = ({ onBack }) => {
    console.log('🧪 [SimpleMonitorTest] Component rendering...');
    
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">🛡️ Simple Monitor Test</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                This is a basic test component to verify React is working
                            </p>
                        </div>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                ← Back
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Content */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>React component is rendering ✅</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Tailwind CSS is working ✅</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Props are passed correctly ✅</span>
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-2">Debug Information:</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Component: SimpleMonitorTest</li>
                                <li>• onBack prop: {onBack ? 'Available' : 'Not provided'}</li>
                                <li>• Timestamp: {new Date().toLocaleString()}</li>
                            </ul>
                        </div>
                        
                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Next Steps:</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>1. If you can see this page, React rendering is working correctly</p>
                                <p>2. Check browser console for any AdminChatMonitor errors</p>
                                <p>3. Use the "🔍 Chat Debug" button to test database connections</p>
                                <p>4. Verify Appwrite collection permissions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleMonitorTest;
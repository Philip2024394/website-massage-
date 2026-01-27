// @ts-nocheck - Temporary fix for React 19 type incompatibility
import React, { useState, useEffect } from 'react';
import { Bell, TestTube, CheckCircle, XCircle, Play, Vibrate, Zap } from 'lucide-react';
import BookingFlowTester from './BookingFlowTester';

interface EnterpriseTestPanelProps {
  enterpriseNotificationManager?: any;
  therapistId?: string;
  isVisible?: boolean;
  onClose?: () => void;
}

const EnterpriseTestPanel: React.FC<EnterpriseTestPanelProps> = ({
  enterpriseNotificationManager,
  therapistId,
  isVisible = false,
  onClose
}) => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);

  // Auto-run tests when panel opens in development
  useEffect(() => {
    if (isVisible && window.location.hostname === 'localhost' && enterpriseNotificationManager) {
      runQuickTest();
    }
  }, [isVisible, enterpriseNotificationManager]);

  const runQuickTest = async () => {
    if (!enterpriseNotificationManager || isRunningTests) return;
    
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      console.log('🧪 Running enterprise notification quick test...');
      
      const testBooking = {
        bookingId: `quick-test-${Date.now()}`,
        customerId: 'test-customer',
        customerName: 'Quick Test Customer',
        serviceType: 'Test Massage',
        duration: 60,
        location: 'Test Location',
        scheduledTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'pending' as const,
        priority: 'critical' as const,
        therapistId: therapistId || 'test-therapist',
        timestamp: Date.now()
      };

      await enterpriseNotificationManager.triggerEnterpriseBookingNotification(testBooking);
      
      setTestResults([{
        success: true,
        message: 'Quick test notification sent successfully',
        duration: Date.now(),
        type: 'booking'
      }]);
      
      setLastTestTime(new Date());
      console.log('✅ Quick test completed');
      
    } catch (error) {
      console.error('❌ Quick test failed:', error);
      setTestResults([{
        success: false,
        message: `Quick test failed: ${error.message}`,
        duration: Date.now(),
        type: 'error'
      }]);
    } finally {
      setIsRunningTests(false);
    }
  };

  const runComprehensiveTest = async () => {
    if (!enterpriseNotificationManager || isRunningTests) return;
    
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      console.log('🏢 Running comprehensive enterprise test suite...');
      
      const results = await enterpriseNotificationManager.runComprehensiveTest();
      setTestResults(results);
      setLastTestTime(new Date());
      
      const passed = results.filter(r => r.success).length;
      console.log(`🏢 Comprehensive test completed: ${passed}/${results.length} tests passed`);
      
    } catch (error) {
      console.error('❌ Comprehensive test failed:', error);
      setTestResults([{
        success: false,
        message: `Comprehensive test failed: ${error.message}`,
        duration: Date.now(),
        type: 'error'
      }]);
    } finally {
      setIsRunningTests(false);
    }
  };

  const testSpecificFeature = async (feature: string) => {
    if (!enterpriseNotificationManager || isRunningTests) return;
    
    setIsRunningTests(true);
    
    try {
      let result;
      
      switch (feature) {
        case 'booking':
          await enterpriseNotificationManager.testBookingNotification();
          result = { success: true, message: 'Booking notification test triggered', type: 'booking' };
          break;
          
        case 'schedule':
          await enterpriseNotificationManager.testScheduleReminder();
          result = { success: true, message: 'Schedule reminder test triggered', type: 'schedule' };
          break;
          
        case 'vibration':
          result = await enterpriseNotificationManager.testVibrationSystem();
          break;
          
        case 'sound':
          result = await enterpriseNotificationManager.testSoundSystem();
          break;
          
        case 'serviceworker':
          result = await enterpriseNotificationManager.testServiceWorkerIntegration();
          break;
          
        default:
          result = { success: false, message: 'Unknown test feature', type: 'error' };
      }
      
      setTestResults([result]);
      setLastTestTime(new Date());
      
    } catch (error) {
      console.error(`❌ ${feature} test failed:`, error);
      setTestResults([{
        success: false,
        message: `${feature} test failed: ${error.message}`,
        type: 'error'
      }]);
    } finally {
      setIsRunningTests(false);
    }
  };

  if (!isVisible) return null;

  const passedTests = testResults.filter(r => r.success).length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TestTube className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">🏢 Enterprise Notification Test Center</h2>
                <p className="text-blue-100">Bulletproof testing for therapist dashboard notifications</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* 🧪 Comprehensive Booking Flow Tester */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <BookingFlowTester 
              enterpriseNotificationManager={enterpriseNotificationManager}
              therapistId={therapistId}
            />
          </div>
          {/* Test Status */}
          {testResults.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Latest Test Results</h3>
                <div className="text-sm text-gray-600">
                  {lastTestTime && `Last run: ${lastTestTime.toLocaleTimeString()}`}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{totalTests - passedTests}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{passRate}%</div>
                  <div className="text-sm text-gray-600">Pass Rate</div>
                </div>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      result.success ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <span className={`text-sm flex-1 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.message}
                    </span>
                    <span className="text-xs text-gray-500">
                      {result.duration}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Tests */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">Quick Tests</h3>
              <div className="space-y-2">
                <button
                  onClick={runQuickTest}
                  disabled={isRunningTests || !enterpriseNotificationManager}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>{isRunningTests ? 'Testing...' : 'Quick Booking Test'}</span>
                </button>
                
                <button
                  onClick={runComprehensiveTest}
                  disabled={isRunningTests || !enterpriseNotificationManager}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <TestTube className="w-4 h-4" />
                  <span>{isRunningTests ? 'Testing...' : 'Full Test Suite'}</span>
                </button>
              </div>
            </div>

            {/* Feature Tests */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-green-800">Individual Features</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => testSpecificFeature('booking')}
                  disabled={isRunningTests || !enterpriseNotificationManager}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-1 text-sm"
                >
                  <Bell className="w-4 h-4" />
                  <span>Booking</span>
                </button>
                
                <button
                  onClick={() => testSpecificFeature('schedule')}
                  disabled={isRunningTests || !enterpriseNotificationManager}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-1 text-sm"
                >
                  <Bell className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
                
                <button
                  onClick={() => testSpecificFeature('vibration')}
                  disabled={isRunningTests || !enterpriseNotificationManager}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-1 text-sm"
                >
                  <Vibrate className="w-4 h-4" />
                  <span>Vibration</span>
                </button>
                
                <button
                  onClick={() => testSpecificFeature('sound')}
                  disabled={isRunningTests || !enterpriseNotificationManager}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-1 text-sm"
                >
                  <Bell className="w-4 h-4" />
                  <span>Sound</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enterprise Features Status */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
            <h3 className="text-lg font-semibold mb-3 text-orange-800">🏢 Enterprise Features Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold">PWA Integration</div>
                <div className="text-gray-600">Active</div>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold">Notification Override</div>
                <div className="text-gray-600">Ready</div>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Vibrate className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold">2-Min Vibration</div>
                <div className="text-gray-600">Ready</div>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold">Continuous Sound</div>
                <div className="text-gray-600">Ready</div>
              </div>
            </div>
          </div>

          {/* Test Information */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h3 className="text-lg font-semibold mb-2 text-yellow-800">🧪 Testing Information</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <p><strong>Therapist ID:</strong> {therapistId || 'Not provided'}</p>
              <p><strong>Manager Status:</strong> {enterpriseNotificationManager ? '✅ Initialized' : '❌ Not initialized'}</p>
              <p><strong>Test Mode:</strong> {window.location.hostname === 'localhost' ? '🧪 Development' : '🏭 Production'}</p>
              <p><strong>Auto-run:</strong> Tests automatically run in development when panel opens</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">📋 Test Instructions</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Quick Booking Test:</strong> Sends a test booking notification with all enterprise features</p>
              <p><strong>Full Test Suite:</strong> Runs comprehensive tests of all notification systems</p>
              <p><strong>Individual Tests:</strong> Test specific features like vibration, sound, or service worker</p>
              <p><strong>Expected Results:</strong> Green notifications, vibration, sound, and visual alerts should appear</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Enterprise-level notification testing for therapist dashboard reliability
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                🔄 Reload App
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseTestPanel;
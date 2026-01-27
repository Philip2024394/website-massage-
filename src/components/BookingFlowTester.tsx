// @ts-nocheck - Temporary fix for React 19 type incompatibility
import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Clock, Zap, Bell, Vibrate, Volume2 } from 'lucide-react';

interface BookingFlowTesterProps {
  enterpriseNotificationManager?: any;
  therapistId?: string;
}

interface TestBooking {
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  therapistId: string;
  therapistName: string;
  therapistType: 'therapist';
  serviceType: string;
  duration: number;
  price: number;
  location: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'searching';
  responseDeadline?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
}

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  duration: number;
  details?: any;
}

const BookingFlowTester: React.FC<BookingFlowTesterProps> = ({
  enterpriseNotificationManager,
  therapistId = 'test-therapist-12345'
}) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [testProgress, setTestProgress] = useState(0);
  const [subscription, setSubscription] = useState<(() => void) | null>(null);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (subscription) {
        subscription();
      }
    };
  }, [subscription]);

  const runComprehensiveBookingFlowTest = async () => {
    if (isRunningTest) return;
    
    setIsRunningTest(true);
    setTestResults([]);
    setTestProgress(0);
    
    const allTests = [
      'Subscription Setup',
      'Enterprise Manager',
      'Booking Creation',
      'Notification Trigger',
      'Sound System',
      'Vibration System',
      'Visual Alerts',
      'Booking Acceptance',
      'Status Update',
      'Cleanup'
    ];

    try {
      console.log('🧪 Starting comprehensive booking flow test...');

      let results: TestResult[] = [];
      let testIndex = 0;

      // Test 1: Set up booking subscription
      setCurrentTest(allTests[testIndex]);
      setTestProgress((testIndex / allTests.length) * 100);
      testIndex++;
      
      const startTime = Date.now();
      let bookingService;
      let unsubscribe: (() => void) | null = null;
      
      try {
        // Import booking service
        const appwriteService = await import('../lib/appwriteService');
        bookingService = appwriteService.bookingService;
        
        // Set up subscription to capture booking events
        let subscriptionReceived = false;
        
        unsubscribe = bookingService.subscribeToProviderBookings(
          therapistId,
          (newBooking: any) => {
            console.log('🔔 Booking subscription received:', newBooking);
            subscriptionReceived = true;
          }
        );
        
        setSubscription(unsubscribe);
        
        results.push({
          testName: 'Subscription Setup',
          success: true,
          message: 'Booking subscription established successfully',
          duration: Date.now() - startTime
        });
        
      } catch (error) {
        results.push({
          testName: 'Subscription Setup',
          success: false,
          message: `Subscription setup failed: ${error.message}`,
          duration: Date.now() - startTime,
          details: error
        });
      }

      // Test 2: Check Enterprise Notification Manager
      setCurrentTest(allTests[testIndex]);
      setTestProgress((testIndex / allTests.length) * 100);
      testIndex++;
      
      const managerTestStart = Date.now();
      
      if (enterpriseNotificationManager) {
        results.push({
          testName: 'Enterprise Manager',
          success: true,
          message: 'Enterprise notification manager is initialized and ready',
          duration: Date.now() - managerTestStart
        });
      } else {
        results.push({
          testName: 'Enterprise Manager',
          success: false,
          message: 'Enterprise notification manager not found - initialize before testing',
          duration: Date.now() - managerTestStart
        });
      }

      // Test 3: Create test booking
      setCurrentTest(allTests[testIndex]);
      setTestProgress((testIndex / allTests.length) * 100);
      testIndex++;
      
      const bookingTestStart = Date.now();
      let testBooking: TestBooking | null = null;
      
      try {
        const testBookingData = {
          customerId: `test-customer-${Date.now()}`,
          customerName: 'Test Customer',
          customerPhone: '+6281234567890',
          therapistId: therapistId,
          therapistName: 'Test Therapist',
          therapistType: 'therapist' as const,
          serviceType: 'Swedish Massage',
          duration: 60,
          price: 350000,
          location: 'Test Location - Seminyak',
          date: new Date().toISOString().split('T')[0],
          time: new Date(Date.now() + 3600000).toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: 'pending' as const,
          notes: 'Enterprise notification test booking'
        };

        if (bookingService) {
          testBooking = await bookingService.createBooking(testBookingData);
          
          results.push({
            testName: 'Booking Creation',
            success: true,
            message: `Test booking created successfully: ${testBooking.bookingId}`,
            duration: Date.now() - bookingTestStart,
            details: testBooking
          });
        } else {
          throw new Error('Booking service not available');
        }
        
      } catch (error) {
        results.push({
          testName: 'Booking Creation',
          success: false,
          message: `Booking creation failed: ${error.message}`,
          duration: Date.now() - bookingTestStart,
          details: error
        });
      }

      // Test 4: Trigger enterprise notification
      setCurrentTest(allTests[testIndex]);
      setTestProgress((testIndex / allTests.length) * 100);
      testIndex++;
      
      const notificationTestStart = Date.now();
      
      try {
        if (enterpriseNotificationManager && testBooking) {
          await enterpriseNotificationManager.triggerEnterpriseBookingNotification({
            bookingId: testBooking.bookingId,
            customerId: testBooking.customerId,
            customerName: testBooking.customerName,
            serviceType: testBooking.serviceType,
            duration: testBooking.duration,
            location: { address: testBooking.location },
            scheduledTime: new Date(Date.now() + 3600000).toISOString(),
            status: 'pending',
            priority: 'high',
            therapistId: testBooking.therapistId,
            timestamp: Date.now()
          });
          
          results.push({
            testName: 'Notification Trigger',
            success: true,
            message: 'Enterprise booking notification triggered successfully',
            duration: Date.now() - notificationTestStart
          });
        } else {
          throw new Error('Enterprise manager or test booking not available');
        }
      } catch (error) {
        results.push({
          testName: 'Notification Trigger',
          success: false,
          message: `Notification trigger failed: ${error.message}`,
          duration: Date.now() - notificationTestStart,
          details: error
        });
      }

      // Test 5: Test sound system
      setCurrentTest(allTests[testIndex]);
      setTestProgress((testIndex / allTests.length) * 100);
      testIndex++;
      
      const soundTestStart = Date.now();
      
      try {
        if (enterpriseNotificationManager) {
          const soundResult = await enterpriseNotificationManager.testSoundSystem();
          
          results.push({
            testName: 'Sound System',
            success: soundResult.success,
            message: soundResult.message,
            duration: Date.now() - soundTestStart,
            details: soundResult
          });
        } else {
          throw new Error('Enterprise manager not available');
        }
      } catch (error) {
        results.push({
          testName: 'Sound System',
          success: false,
          message: `Sound system test failed: ${error.message}`,
          duration: Date.now() - soundTestStart,
          details: error
        });
      }

      // Test 6: Test vibration system
      setCurrentTest(allTests[testIndex]);
      setTestProgress((testIndex / allTests.length) * 100);
      testIndex++;
      
      const vibrationTestStart = Date.now();
      
      try {
        if (enterpriseNotificationManager) {
          const vibrationResult = await enterpriseNotificationManager.testVibrationSystem();
          
          results.push({
            testName: 'Vibration System',
            success: vibrationResult.success,
            message: vibrationResult.message,
            duration: Date.now() - vibrationTestStart,
            details: vibrationResult
          });
        } else {
          throw new Error('Enterprise manager not available');
        }
      } catch (error) {
        results.push({
          testName: 'Vibration System',
          success: false,
          message: `Vibration system test failed: ${error.message}`,
          duration: Date.now() - vibrationTestStart,
          details: error
        });
      }

      // Test 7: Test visual alerts
      setCurrentTest(allTests[testIndex]);
      setTestProgress((testIndex / allTests.length) * 100);
      testIndex++;
      
      const visualTestStart = Date.now();
      
      try {
        if (enterpriseNotificationManager) {
          await enterpriseNotificationManager.testVisualAlerts();
          
          results.push({
            testName: 'Visual Alerts',
            success: true,
            message: 'Visual alert system tested successfully',
            duration: Date.now() - visualTestStart
          });
        } else {
          throw new Error('Enterprise manager not available');
        }
      } catch (error) {
        results.push({
          testName: 'Visual Alerts',
          success: false,
          message: `Visual alerts test failed: ${error.message}`,
          duration: Date.now() - visualTestStart,
          details: error
        });
      }

      // Test 8: Test booking acceptance flow
      setCurrentTest(allTests[testIndex]);
      setTestProgress((testIndex / allTests.length) * 100);
      testIndex++;
      
      const acceptanceTestStart = Date.now();
      
      try {
        if (bookingService && testBooking) {
          const acceptanceResult = await bookingService.acceptBookingAndCreateCommission(
            testBooking.bookingId,
            therapistId,
            'Test Therapist'
          );
          
          results.push({
            testName: 'Booking Acceptance',
            success: true,
            message: `Booking accepted successfully: ${acceptanceResult.booking.status}`,
            duration: Date.now() - acceptanceTestStart,
            details: acceptanceResult
          });
        } else {
          throw new Error('Booking service or test booking not available');
        }
      } catch (error) {
        results.push({
          testName: 'Booking Acceptance',
          success: false,
          message: `Booking acceptance failed: ${error.message}`,
          duration: Date.now() - acceptanceTestStart,
          details: error
        });
      }

      // Test 9: Test status updates
      setCurrentTest(allTests[testIndex]);
      setTestProgress((testIndex / allTests.length) * 100);
      testIndex++;
      
      const statusTestStart = Date.now();
      
      try {
        if (enterpriseNotificationManager) {
          await enterpriseNotificationManager.testScheduleReminder();
          
          results.push({
            testName: 'Status Update',
            success: true,
            message: 'Schedule reminder system tested successfully',
            duration: Date.now() - statusTestStart
          });
        } else {
          throw new Error('Enterprise manager not available');
        }
      } catch (error) {
        results.push({
          testName: 'Status Update',
          success: false,
          message: `Status update test failed: ${error.message}`,
          duration: Date.now() - statusTestStart,
          details: error
        });
      }

      // Test 10: Cleanup
      setCurrentTest(allTests[testIndex]);
      setTestProgress((testIndex / allTests.length) * 100);
      testIndex++;
      
      const cleanupTestStart = Date.now();
      
      try {
        // Clean up subscription
        if (unsubscribe) {
          unsubscribe();
          setSubscription(null);
        }
        
        results.push({
          testName: 'Cleanup',
          success: true,
          message: 'Test cleanup completed successfully',
          duration: Date.now() - cleanupTestStart
        });
      } catch (error) {
        results.push({
          testName: 'Cleanup',
          success: false,
          message: `Cleanup failed: ${error.message}`,
          duration: Date.now() - cleanupTestStart,
          details: error
        });
      }

      setTestProgress(100);
      setCurrentTest('Completed');
      setTestResults(results);
      
      const passed = results.filter(r => r.success).length;
      console.log(`🧪 Comprehensive booking flow test completed: ${passed}/${results.length} tests passed`);
      
    } catch (error) {
      console.error('❌ Comprehensive test failed:', error);
      setTestResults([{
        testName: 'Complete Test Suite',
        success: false,
        message: `Complete test suite failed: ${error.message}`,
        duration: Date.now(),
        details: error
      }]);
    } finally {
      setIsRunningTest(false);
      setCurrentTest('');
      setTestProgress(0);
    }
  };

  const passedTests = testResults.filter(r => r.success).length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">🏢 Enterprise Booking Flow Tester</h3>
            <p className="text-gray-600">Comprehensive integration testing for booking notifications</p>
          </div>
        </div>
        
        {totalTests > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{passRate}%</div>
            <div className="text-sm text-gray-600">{passedTests}/{totalTests} passed</div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isRunningTest && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Running: {currentTest}</span>
            <span className="text-sm text-gray-500">{Math.round(testProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${testProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Test Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={runComprehensiveBookingFlowTest}
          disabled={isRunningTest || !therapistId}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-3 text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105"
        >
          <Play className="w-5 h-5" />
          <span>
            {isRunningTest ? 'Running Comprehensive Test...' : '🧪 Run Full Enterprise Test Suite'}
          </span>
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Test Results</h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 ${
                  result.success 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className={`font-semibold ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.testName}
                    </h5>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {result.duration}ms
                    </span>
                  </div>
                  
                  <p className={`text-sm ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                  
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer">Show details</summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Info */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">🧪 What This Test Does</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Therapist ID:</strong> {therapistId}</p>
          <p><strong>Test Coverage:</strong> Booking subscription, enterprise notifications, sound/vibration, acceptance flow</p>
          <p><strong>Integration Level:</strong> Full end-to-end test with real booking service and enterprise manager</p>
          <p><strong>Expected Result:</strong> All systems should work together seamlessly for bulletproof notifications</p>
        </div>
      </div>

      {/* Feature Indicators */}
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
          <Bell className="w-3 h-3" />
          <span>Notifications</span>
        </div>
        <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs">
          <Vibrate className="w-3 h-3" />
          <span>2-Min Vibration</span>
        </div>
        <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
          <Volume2 className="w-3 h-3" />
          <span>Continuous Sound</span>
        </div>
        <div className="flex items-center space-x-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs">
          <Zap className="w-3 h-3" />
          <span>Visual Alerts</span>
        </div>
      </div>
    </div>
  );
};

export default BookingFlowTester;
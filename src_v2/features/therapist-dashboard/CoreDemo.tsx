/**
 * ============================================================================
 * 🔒 STEP 12 FROZEN - STABLE REFERENCE POINT - NO MODIFICATIONS
 * ============================================================================
 * 
 * ⚠️  CRITICAL: THIS FILE IS FROZEN AS OF STEP 12 COMPLETION
 * 
 * ALLOWED CHANGES:
 * ✅ Critical bug fixes only (with documentation)
 * ❌ NO refactors, redesigns, or feature additions
 * 
 * ============================================================================
 * 🧪 CORE SERVICES DEMO - STEP 9 INTEGRATION TEST
 * ============================================================================
 * 
 * This component demonstrates the core services integration.
 * Shows how features connect to the centralized core layer.
 * 
 * THE FIX FOR: "Both message sending and booking creation failed"
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  testConnection,
  BookingService,
  ChatService,
  createBooking,
  sendMessage,
  type BookingRequest
} from '../../core';

export const CoreServicesDemo: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
    console.log(`[CORE DEMO] ${result}`);
  };

  const testCoreConnection = async () => {
    addTestResult('🔍 Testing core Appwrite connection...');
    try {
      const isConnected = await testConnection();
      if (isConnected) {
        setConnectionStatus('connected');
        addTestResult('✅ Core connection successful');
      } else {
        setConnectionStatus('failed');
        addTestResult('❌ Core connection failed');
      }
    } catch (error) {
      setConnectionStatus('failed');
      addTestResult(`❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testBookingCreation = async () => {
    addTestResult('📋 Testing booking creation via core service...');
    try {
      const testBookingRequest: BookingRequest = {
        customerName: 'John Doe',
        customerPhone: '+628123456789',
        serviceType: 'massage',
        duration: 90,
        location: {
          address: 'Seminyak, Bali, Indonesia',
          coordinates: { lat: -8.6905, lng: 115.1729 }
        },
        flexible: true,
        source: 'web'
      };

      const result = await createBooking(testBookingRequest);
      
      if (result.success) {
        addTestResult(`✅ Booking created successfully: ${result.bookingId}`);
        addTestResult(`💬 Chat session: ${result.chatSessionId}`);
        addTestResult(`💰 Estimated cost: ${result.estimatedCost}`);
        return result;
      } else {
        addTestResult(`❌ Booking creation failed: ${result.error?.message}`);
        return null;
      }
    } catch (error) {
      addTestResult(`❌ Booking error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const testChatMessage = async (chatSessionId?: string) => {
    if (!chatSessionId) {
      addTestResult('⚠️ No chat session ID provided for message test');
      return;
    }

    addTestResult('💬 Testing message sending via core service...');
    try {
      const message = await sendMessage({
        chatSessionId,
        senderId: 'system',
        senderType: 'system',
        content: 'Test message from core integration demo',
        messageType: 'system_notification'
      });

      addTestResult(`✅ Message sent successfully: ${message.id}`);
    } catch (error) {
      addTestResult(`❌ Message error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runFullTest = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    addTestResult('🚀 Starting full core integration test...');
    
    // Step 1: Test connection
    await testCoreConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Test booking creation (THE MAIN FIX)
    const bookingResult = await testBookingCreation();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Test message sending if booking succeeded
    if (bookingResult?.chatSessionId) {
      await testChatMessage(bookingResult.chatSessionId);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    addTestResult('🎉 Core integration test completed');
    setIsRunningTests(false);
  };

  // Auto-run connection test on mount
  useEffect(() => {
    testCoreConnection();
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '✅';
      case 'failed': return '❌';
      default: return '🔍';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🧪 Core Services Integration Demo
            </h1>
            <p className="text-gray-600 mt-1">
              Test the centralized core layer that fixes booking and messaging issues
            </p>
          </div>
          <div className={`px-3 py-2 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusIcon()} {connectionStatus.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="font-medium text-blue-900">Single Appwrite Client</div>
            <div className="text-blue-700">Eliminates client conflicts</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="font-medium text-green-900">Unified Booking Service</div>
            <div className="text-green-700">One function for all bookings</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="font-medium text-purple-900">Integrated Messaging</div>
            <div className="text-purple-700">Chat works with booking data</div>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Integration Tests</h2>
          <div className="space-x-3">
            <button
              onClick={testCoreConnection}
              disabled={isRunningTests}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Test Connection
            </button>
            <button
              onClick={runFullTest}
              disabled={isRunningTests}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isRunningTests ? 'Running Tests...' : 'Run Full Test'}
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Full Test Sequence:</strong></p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Test Appwrite connection via single client</li>
            <li>Create booking via BookingService.createBooking()</li>
            <li>Send message via ChatService.sendMessage()</li>
            <li>Verify no "Both message sending and booking creation failed" errors</li>
          </ol>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
        </div>
        <div className="p-6">
          {testResults.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No test results yet. Click "Run Full Test" to start.
            </div>
          ) : (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
              {isRunningTests && (
                <div className="text-yellow-400 animate-pulse">
                  Running tests...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Core Architecture</h2>
        <div className="text-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span><strong>/src_v2/features/*</strong> → Import from core only</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span><strong>/src_v2/core/services/*</strong> → Single service functions</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span><strong>/src_v2/core/clients/appwrite.ts</strong> → One Appwrite client</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span><strong>/src_v2/shell/*</strong> → Protected routing layer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreServicesDemo;
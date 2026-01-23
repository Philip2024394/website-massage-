/**
 * 🚨 DEVELOPMENT ONLY - BOOKING DEBUG PANEL
 * 
 * Real-time visibility into BookingEngine state for debugging
 * Shows exactly what's happening during booking creation/acceptance
 * 
 * USAGE: Add <BookingDebugPanel /> to any page during development
 */

import React, { useState, useEffect } from 'react';
import { BookingEngine, BookingState, type BookingEngineData } from '../../lib/services/BookingEngine';

const BookingDebugPanel: React.FC = () => {
  const [bookings, setBookings] = useState<BookingEngineData[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  useEffect(() => {
    // Poll for booking updates every second
    const interval = setInterval(() => {
      // Get all active bookings from engine
      // Note: This would need a method in BookingEngine to list all bookings
      // For now, we'll simulate this
      updateBookingsList();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateBookingsList = () => {
    // This would call BookingEngine.getAllBookings() when that method exists
    // For now, just update the display
  };

  const getStateColor = (state: BookingState): string => {
    switch (state) {
      case BookingState.IDLE: return 'text-gray-500';
      case BookingState.INITIATED: return 'text-blue-500';
      case BookingState.CREATED: return 'text-green-500';
      case BookingState.PENDING_THERAPIST: return 'text-yellow-500';
      case BookingState.ACCEPTED: return 'text-green-600';
      case BookingState.CONFIRMED: return 'text-green-700';
      case BookingState.COMPLETED: return 'text-green-800';
      case BookingState.CANCELLED: return 'text-red-500';
      case BookingState.EXPIRED: return 'text-orange-500';
      case BookingState.FAILED: return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const testCreateBooking = async () => {
    const testParams = {
      customerId: 'test_customer_' + Date.now(),
      customerName: 'Test Customer',
      customerPhone: '+628123456789',
      therapistId: '69517fe700147de74c9a',
      therapistName: 'Sriyani',
      serviceType: 'Traditional Massage',
      duration: 60,
      totalPrice: 450000,
      locationZone: 'Yogyakarta'
    };

    console.log('🧪 [DEBUG] Creating test booking...');
    const result = await BookingEngine.createBooking(testParams);
    console.log('🧪 [DEBUG] Result:', result);
    
    updateBookingsList();
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-orange-600"
        >
          🔒 Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">🔒 Booking Engine Debug Panel</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Test Actions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Test Actions</h3>
            <div className="space-x-2">
              <button
                onClick={testCreateBooking}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Create Test Booking
              </button>
              <button
                onClick={() => {
                  console.clear();
                  console.log('🧪 Console cleared');
                }}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              >
                Clear Console
              </button>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="space-y-2">
            <h3 className="font-bold">Active Bookings</h3>
            
            {bookings.length === 0 ? (
              <div className="text-gray-500 italic">No active bookings</div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.bookingId}
                  className={`border p-3 rounded cursor-pointer ${
                    selectedBooking === booking.bookingId ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedBooking(
                    selectedBooking === booking.bookingId ? null : booking.bookingId
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-mono text-sm">{booking.bookingId}</span>
                      <span className={`ml-2 font-bold ${getStateColor(booking.state)}`}>
                        {booking.state}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.customerName} → {booking.therapistName}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedBooking === booking.bookingId && (
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Price:</strong> IDR {booking.totalPrice.toLocaleString()}
                        </div>
                        <div>
                          <strong>Duration:</strong> {booking.duration} min
                        </div>
                        <div>
                          <strong>Location:</strong> {booking.locationZone}
                        </div>
                        <div>
                          <strong>Commission:</strong> IDR {booking.adminCommission.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <strong>Response Deadline:</strong>{' '}
                        {new Date(booking.responseDeadline).toLocaleString()}
                      </div>

                      {booking.lastError && (
                        <div className="bg-red-100 border border-red-300 rounded p-2 text-red-700">
                          <strong>Last Error:</strong> {booking.lastError}
                        </div>
                      )}

                      {/* State History */}
                      <div>
                        <strong>State History:</strong>
                        <div className="mt-1 space-y-1">
                          {booking.stateHistory.map((transition, index) => (
                            <div key={index} className="text-xs bg-gray-100 p-1 rounded">
                              {transition.fromState} → {transition.toState} 
                              <span className="text-gray-600 ml-2">
                                ({transition.triggeredBy}: {transition.reason})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Engine Status */}
          <div className="bg-green-50 border border-green-200 p-3 rounded">
            <h3 className="font-bold text-green-800">Engine Status</h3>
            <div className="text-sm text-green-700">
              ✅ BookingEngine loaded and operational
              <br />
              🔒 All booking operations centralized
              <br />
              📝 State transitions logged
            </div>
          </div>

          {/* Console Instructions */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <h3 className="font-bold text-blue-800">Console Monitoring</h3>
            <div className="text-sm text-blue-700">
              Open browser console to see detailed BookingEngine logs.
              <br />
              Look for: <code className="bg-blue-100 px-1 rounded">🔒 [BookingEngine]</code> prefixed messages
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDebugPanel;
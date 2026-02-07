/**
 * 🎛️ COUNTDOWN + MODAL MANAGER INTEGRATION
 * 
 * Example showing how to use the new Countdown component
 * with the Modal Manager system for booking timeouts
 */

import React, { useState } from 'react';
import { useTherapistCardModals } from '../hooks/useTherapistCardModals';
import Countdown from '../components/Countdown';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ModalCountdownIntegrationProps {
  therapist: any;
}

export const ModalCountdownIntegration: React.FC<ModalCountdownIntegrationProps> = ({ 
  therapist 
}) => {
  const {
    showPriceListModal,
    setShowPriceListModal,
    showBookingPopup,
    setShowBookingPopup,
    handleBookNowClick,
    closeAllModals
  } = useTherapistCardModals();

  const [bookingTimeRemaining, setBookingTimeRemaining] = useState(1500); // 25 minutes

  // Handle booking timeout - automatically closes modals and shows message
  const handleBookingTimeout = async () => {
    console.log('🔴 Booking timeout - closing all modals');
    
    // Close all open modals smoothly
    await closeAllModals();
    
    // Show timeout notification
    setTimeout(() => {
      alert(`Booking with ${therapist.name} has expired. The therapist didn't respond within 25 minutes.`);
    }, 300); // Small delay after modal closes
  };

  // Enhanced booking flow with countdown integration
  const startBookingWithCountdown = async () => {
    console.log('🎯 Starting booking with integrated countdown');
    
    // Use enhanced Book Now handler that manages modals properly
    await handleBookNowClick({
      onAfterClose: () => {
        // After modals close, show booking popup with countdown
        setShowBookingPopup(true);
        console.log('📋 Booking popup opened with countdown timer');
      }
    });
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-bold text-gray-900">
        Countdown + Modal Manager Integration
      </h2>

      {/* Example 1: Price List with Automatic Timeout */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3">Price List Auto-Close Example</h3>
        <p className="text-sm text-gray-600 mb-4">
          Price list will auto-close after 5 minutes of inactivity
        </p>
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowPriceListModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Open Price List
          </button>
          
          {showPriceListModal && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Auto-close in:</span>
              <Countdown
                secondsRemaining={300} // 5 minutes
                variant="warning"
                size="sm"
                onComplete={() => {
                  setShowPriceListModal(false);
                  console.log('✅ Price list auto-closed due to inactivity');
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Example 2: Booking Popup with Response Timer */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3">Booking Response Timer</h3>
        <p className="text-sm text-gray-600 mb-4">
          Start booking with 25-minute response countdown
        </p>
        
        <div className="space-y-3">
          <button
            onClick={startBookingWithCountdown}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Book Now with Timer
          </button>
          
          {showBookingPopup && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-900">
                    Waiting for {therapist.name}
                  </h4>
                  <p className="text-sm text-orange-700">
                    Therapist has 25 minutes to respond
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-700">
                  Time remaining:
                </span>
                <Countdown
                  secondsRemaining={bookingTimeRemaining}
                  variant="warning"
                  size="lg"
                  onComplete={handleBookingTimeout}
                />
              </div>
              
              <button
                onClick={() => setShowBookingPopup(false)}
                className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Cancel Booking
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Example 3: Multi-Modal Countdown Management */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3">Multi-Modal Management</h3>
        <p className="text-sm text-gray-600 mb-4">
          Demonstrates how countdowns work with modal switching
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowPriceListModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
          >
            Price List (5min)
          </button>
          <button
            onClick={() => setShowBookingPopup(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
          >
            Booking (25min)
          </button>
        </div>
        
        {/* Status indicator */}
        <div className="mt-3 text-center text-sm text-gray-500">
          {showPriceListModal && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Clock className="w-4 h-4" />
              Price list active
            </div>
          )}
          {showBookingPopup && (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Booking popup active
            </div>
          )}
          {!showPriceListModal && !showBookingPopup && (
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <AlertTriangle className="w-4 h-4" />
              No modals active
            </div>
          )}
        </div>

        {/* Close all button */}
        <button
          onClick={closeAllModals}
          className="mt-3 w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Close All Modals
        </button>
      </div>

      {/* Integration Code Example */}
      <div className="bg-gray-50 border rounded-xl p-4">
        <h3 className="font-semibold mb-3">Integration Code</h3>
        <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`// 1. Import the hooks and components
import { useTherapistCardModals } from '../hooks/useTherapistCardModals';
import Countdown from '../components/Countdown';

// 2. Use in your component
const { handleBookNowClick, closeAllModals } = useTherapistCardModals();

// 3. Enhanced booking with countdown
const startBooking = async () => {
  await handleBookNowClick({
    onAfterClose: () => {
      // Show booking UI with countdown
      setShowBookingPopup(true);
    }
  });
};

// 4. Add countdown with timeout handler
<Countdown
  secondsRemaining={1500} // 25 minutes
  onComplete={async () => {
    await closeAllModals(); // Close modals smoothly
    handleTimeout(); // Your timeout logic
  }}
/>`}
        </pre>
      </div>
    </div>
  );
};

// Usage in a real component
export const PracticalUsageExample = () => {
  const therapist = {
    name: 'Sarah Johnson',
    id: '12345'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <ModalCountdownIntegration therapist={therapist} />
      </div>
    </div>
  );
};
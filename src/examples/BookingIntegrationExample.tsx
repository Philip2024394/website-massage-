/**
 * 🏥 BOOKING INTEGRATION EXAMPLE
 * 
 * Practical example showing how to integrate the new Countdown component
 * with the existing booking system for massage appointments
 */

import React, { useState, useEffect } from 'react';
import Countdown from '../components/Countdown';
import { MessageCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface BookingIntegrationExampleProps {
  therapistName: string;
  sessionDuration: number; // in minutes
  bookingId: string;
}

export const BookingIntegrationExample: React.FC<BookingIntegrationExampleProps> = ({
  therapistName,
  sessionDuration,
  bookingId
}) => {
  const [bookingPhase, setBookingPhase] = useState<'pending' | 'confirmed' | 'arriving' | 'session' | 'completed'>('pending');
  const [isVisible, setIsVisible] = useState(true);

  // Phase configurations with countdown times
  const getPhaseConfig = () => {
    switch (bookingPhase) {
      case 'pending':
        return {
          title: `Waiting for ${therapistName}`,
          subtitle: 'Therapist has 25 minutes to respond',
          seconds: 1500, // 25 minutes
          variant: 'warning' as const,
          color: 'orange',
          icon: <Clock className="w-5 h-5" />
        };
      case 'confirmed':
        return {
          title: 'Booking Confirmed!',
          subtitle: `${therapistName} is preparing for your session`,
          seconds: 1800, // 30 minutes prep time
          variant: 'success' as const,
          color: 'green',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'arriving':
        return {
          title: `${therapistName} is on the way`,
          subtitle: 'Estimated arrival time',
          seconds: 900, // 15 minutes travel
          variant: 'success' as const,
          color: 'blue',
          icon: <MessageCircle className="w-5 h-5" />
        };
      case 'session':
        return {
          title: 'Massage Session in Progress',
          subtitle: `${sessionDuration}-minute session`,
          seconds: sessionDuration * 60,
          variant: 'default' as const,
          color: 'purple',
          icon: <Clock className="w-5 h-5" />
        };
      default:
        return {
          title: 'Session Complete',
          subtitle: 'Thank you for using our service!',
          seconds: 0,
          variant: 'success' as const,
          color: 'green',
          icon: <CheckCircle className="w-5 h-5" />
        };
    }
  };

  const config = getPhaseConfig();

  // Handle phase transitions
  const handlePhaseComplete = () => {
    switch (bookingPhase) {
      case 'pending':
        // In real app, this would be triggered by therapist acceptance
        setBookingPhase('confirmed');
        break;
      case 'confirmed':
        setBookingPhase('arriving');
        break;
      case 'arriving':
        setBookingPhase('session');
        break;
      case 'session':
        setBookingPhase('completed');
        break;
      default:
        setIsVisible(false);
        break;
    }
  };

  // Simulate real booking flow events
  useEffect(() => {
    // Simulate therapist accepting booking after some time
    if (bookingPhase === 'pending') {
      const acceptTimeout = setTimeout(() => {
        setBookingPhase('confirmed');
      }, 10000); // Accept after 10 seconds for demo

      return () => clearTimeout(acceptTimeout);
    }
  }, [bookingPhase]);

  if (!isVisible) return null;

  return (
    <div className="max-w-md mx-auto">
      {/* Main Booking Card */}
      <div className={`
        rounded-2xl shadow-lg border p-6 mb-4
        ${config.color === 'orange' ? 'bg-orange-50 border-orange-200' : ''}
        ${config.color === 'green' ? 'bg-green-50 border-green-200' : ''}
        ${config.color === 'blue' ? 'bg-blue-50 border-blue-200' : ''}
        ${config.color === 'purple' ? 'bg-purple-50 border-purple-200' : ''}
      `}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`
            p-3 rounded-full
            ${config.color === 'orange' ? 'bg-orange-100 text-orange-600' : ''}
            ${config.color === 'green' ? 'bg-green-100 text-green-600' : ''}
            ${config.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
            ${config.color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
          `}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{config.title}</h2>
            <p className="text-sm text-gray-600">{config.subtitle}</p>
          </div>
        </div>

        {/* Countdown Display */}
        {bookingPhase !== 'completed' && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Time remaining:</span>
              <Countdown
                secondsRemaining={config.seconds}
                variant={config.variant}
                size="lg"
                onComplete={handlePhaseComplete}
                className="font-bold"
              />
            </div>
          </div>
        )}

        {/* Phase-specific content */}
        {bookingPhase === 'pending' && (
          <div className="mt-4 space-y-2">
            <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Cancel Booking
            </button>
            <p className="text-xs text-gray-500 text-center">
              Booking ID: {bookingId}
            </p>
          </div>
        )}

        {bookingPhase === 'confirmed' && (
          <div className="mt-4">
            <div className="bg-green-100 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                ✅ Your booking is confirmed! {therapistName} is preparing for your session.
              </p>
            </div>
          </div>
        )}

        {bookingPhase === 'arriving' && (
          <div className="mt-4 space-y-2">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat with {therapistName}
            </button>
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                📍 Therapist is en route to your location
              </p>
            </div>
          </div>
        )}

        {bookingPhase === 'session' && (
          <div className="mt-4">
            <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-700">
                💆‍♀️ Enjoy your relaxing massage session!
              </p>
            </div>
          </div>
        )}

        {bookingPhase === 'completed' && (
          <div className="mt-4 space-y-3">
            <div className="bg-green-100 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 text-center">
                🎉 Session completed! We hope you enjoyed your massage.
              </p>
            </div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Rate Your Experience
            </button>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center gap-2">
        {['pending', 'confirmed', 'arriving', 'session', 'completed'].map((phase, index) => {
          const isActive = phase === bookingPhase;
          const isCompleted = ['pending', 'confirmed', 'arriving', 'session', 'completed'].indexOf(bookingPhase) > index;
          
          return (
            <div
              key={phase}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${isActive ? 'bg-orange-500 scale-125' : ''}
                ${isCompleted ? 'bg-green-500' : ''}
                ${!isActive && !isCompleted ? 'bg-gray-300' : ''}
              `}
            />
          );
        })}
      </div>
    </div>
  );
};

// Usage example in a real booking flow
export const BookingFlowWithCountdown = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Massage Booking Flow</h1>
        <BookingIntegrationExample
          therapistName="Sarah Johnson"
          sessionDuration={60}
          bookingId="BK-2026-001"
        />
        
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">How to integrate:</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`// Import the component
import Countdown from './components/Countdown';

// Use in your booking component
<Countdown 
  secondsRemaining={1500} // 25 minutes
  variant="warning"
  size="lg"
  onComplete={() => {
    // Handle timeout (e.g., cancel booking)
    handleBookingTimeout();
  }}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};
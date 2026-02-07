/**
 * 🕐 COUNTDOWN COMPONENT USAGE EXAMPLES
 * 
 * Examples showing how to use the new Countdown component
 * in various booking and massage session scenarios
 */

import React, { useState } from 'react';
import Countdown from './Countdown';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

// Example 1: Therapist Arrival Countdown
export const TherapistArrivalCountdown = () => {
  const [arrived, setArrived] = useState(false);
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-green-900">Therapist Arriving Soon</h3>
          <p className="text-sm text-green-700">Your massage therapist will arrive in:</p>
        </div>
        <Countdown 
          secondsRemaining={1800} // 30 minutes
          variant="success"
          size="lg"
          onComplete={() => setArrived(true)}
        />
      </div>
      {arrived && (
        <div className="mt-3 p-2 bg-green-100 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700 font-medium">Therapist should be arriving now!</span>
        </div>
      )}
    </div>
  );
};

// Example 2: Session Duration Timer
export const SessionTimer = ({ sessionDuration = 60 }: { sessionDuration?: number }) => {
  const [sessionEnded, setSessionEnded] = useState(false);
  const totalSeconds = sessionDuration * 60; // Convert minutes to seconds
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="text-center">
        <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
        <h3 className="font-semibold text-blue-900 mb-1">Massage Session</h3>
        <p className="text-sm text-blue-700 mb-3">{sessionDuration}-minute session in progress</p>
        
        <Countdown 
          secondsRemaining={totalSeconds}
          variant="default"
          size="lg"
          className="justify-center"
          onComplete={() => setSessionEnded(true)}
        />
        
        {sessionEnded && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">
              🎉 Session Complete! Please rate your experience.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Example 3: Payment Processing Timer
export const PaymentTimer = () => {
  const [paymentExpired, setPaymentExpired] = useState(false);
  
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-orange-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-orange-900">Complete Payment</h3>
          <p className="text-sm text-orange-700">Time remaining to complete your booking:</p>
        </div>
        <Countdown 
          secondsRemaining={600} // 10 minutes
          variant="warning"
          size="md"
          onComplete={() => setPaymentExpired(true)}
        />
      </div>
      
      {paymentExpired && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">
            ⏰ Payment time expired. Please start a new booking.
          </p>
        </div>
      )}
    </div>
  );
};

// Example 4: Multi-State Booking Progress
export const BookingProgressTimer = () => {
  const [currentPhase, setCurrentPhase] = useState<'waiting' | 'confirmed' | 'arriving' | 'session'>('waiting');
  
  const getPhaseConfig = () => {
    switch (currentPhase) {
      case 'waiting':
        return {
          title: 'Waiting for Therapist Response',
          seconds: 1500, // 25 minutes
          variant: 'warning' as const,
          message: 'The therapist has 25 minutes to accept your booking'
        };
      case 'confirmed':
        return {
          title: 'Booking Confirmed!',
          seconds: 3600, // 1 hour prep time
          variant: 'success' as const,
          message: 'Therapist confirmed. Arrival countdown:'
        };
      case 'arriving':
        return {
          title: 'Therapist En Route',
          seconds: 1800, // 30 minutes travel
          variant: 'success' as const,
          message: 'Your therapist is on the way'
        };
      case 'session':
        return {
          title: 'Session in Progress',
          seconds: 3600, // 60-minute session
          variant: 'default' as const,
          message: 'Enjoy your massage!'
        };
    }
  };

  const config = getPhaseConfig();

  const handlePhaseComplete = () => {
    if (currentPhase === 'waiting') setCurrentPhase('confirmed');
    else if (currentPhase === 'confirmed') setCurrentPhase('arriving');
    else if (currentPhase === 'arriving') setCurrentPhase('session');
  };

  return (
    <div className={`
      border rounded-xl p-6
      ${currentPhase === 'waiting' ? 'bg-orange-50 border-orange-200' : ''}
      ${currentPhase === 'confirmed' ? 'bg-green-50 border-green-200' : ''}
      ${currentPhase === 'arriving' ? 'bg-blue-50 border-blue-200' : ''}
      ${currentPhase === 'session' ? 'bg-purple-50 border-purple-200' : ''}
    `}>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{config.title}</h2>
        <p className="text-gray-600 mb-4">{config.message}</p>
        
        <Countdown 
          secondsRemaining={config.seconds}
          variant={config.variant}
          size="lg"
          className="justify-center mb-4"
          onComplete={handlePhaseComplete}
        />
        
        {/* Phase indicators */}
        <div className="flex justify-center gap-2">
          {['waiting', 'confirmed', 'arriving', 'session'].map((phase, index) => (
            <div 
              key={phase}
              className={`
                w-3 h-3 rounded-full
                ${currentPhase === phase ? 'bg-orange-500' : ''}
                ${['waiting', 'confirmed', 'arriving', 'session'].indexOf(currentPhase) > index ? 'bg-green-500' : 'bg-gray-300'}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Example 5: Simple Usage Examples
export const SimpleUsageExamples = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Countdown Component Examples</h2>
      
      {/* Basic countdown */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium mb-2">Basic 5-minute countdown:</h3>
        <Countdown secondsRemaining={300} />
      </div>
      
      {/* Different sizes */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium mb-2">Different sizes:</h3>
        <div className="space-y-2">
          <Countdown secondsRemaining={300} size="sm" />
          <Countdown secondsRemaining={300} size="md" />
          <Countdown secondsRemaining={300} size="lg" />
        </div>
      </div>
      
      {/* Different variants */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium mb-2">Different variants:</h3>
        <div className="space-y-2">
          <Countdown secondsRemaining={300} variant="default" />
          <Countdown secondsRemaining={300} variant="warning" />
          <Countdown secondsRemaining={300} variant="danger" />
          <Countdown secondsRemaining={300} variant="success" />
        </div>
      </div>
      
      {/* Without icon */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium mb-2">Without icon:</h3>
        <Countdown secondsRemaining={300} showIcon={false} />
      </div>
    </div>
  );
};
/**
 * Therapist "On the Way" Button Component
 * Shows after booking acceptance to allow therapist to notify customer they're traveling
 */

import React, { useState, useEffect } from 'react';
import { Car, MapPin, Clock, CheckCircle, Navigation, Phone } from 'lucide-react';
import { therapistOnTheWayService, OnTheWayStatus } from '../services/therapistOnTheWayService';

interface TherapistOnTheWayButtonProps {
  bookingId: string;
  therapistId: string;
  therapistName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  isBookingAccepted: boolean;
  onStatusUpdate?: (status: OnTheWayStatus) => void;
}

export const TherapistOnTheWayButton: React.FC<TherapistOnTheWayButtonProps> = ({
  bookingId,
  therapistId,
  therapistName,
  customerName,
  customerPhone,
  customerAddress,
  isBookingAccepted,
  onStatusUpdate
}) => {
  const [journeyStatus, setJourneyStatus] = useState<OnTheWayStatus | null>(null);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [isStartingJourney, setIsStartingJourney] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);

  useEffect(() => {
    // Check if there's already an active journey
    const existingJourney = therapistOnTheWayService.getJourneyStatus(bookingId);
    if (existingJourney) {
      setJourneyStatus(existingJourney);
    }
  }, [bookingId]);

  const handleStartJourney = async () => {
    setIsStartingJourney(true);
    try {
      const journey = await therapistOnTheWayService.setOnTheWay(
        bookingId,
        therapistId,
        therapistName,
        customerName,
        customerPhone,
        estimatedMinutes
      );

      setJourneyStatus(journey);
      onStatusUpdate?.(journey);

    } catch (error) {
      console.error('Failed to start journey:', error);
      alert('❌ Failed to notify customer. Please try again.');
    } finally {
      setIsStartingJourney(false);
      setShowTimeSelector(false);
    }
  };

  const handleConfirmArrival = async () => {
    try {
      await therapistOnTheWayService.confirmArrival(bookingId);
      
      // Update local status
      if (journeyStatus) {
        const updatedJourney = { ...journeyStatus, status: 'arrived' as const };
        setJourneyStatus(updatedJourney);
        onStatusUpdate?.(updatedJourney);
      }
    } catch (error) {
      console.error('Failed to confirm arrival:', error);
      alert('❌ Failed to confirm arrival. Please try again.');
    }
  };

  const handleUpdateArrivalTime = async (newMinutes: number) => {
    try {
      await therapistOnTheWayService.updateEstimatedArrival(bookingId, newMinutes);
      
      // Update local status
      if (journeyStatus) {
        const newArrival = new Date(Date.now() + newMinutes * 60000);
        const updatedJourney = { ...journeyStatus, estimatedArrival: newArrival };
        setJourneyStatus(updatedJourney);
        onStatusUpdate?.(updatedJourney);
      }
    } catch (error) {
      console.error('Failed to update arrival time:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    if (!journeyStatus) return '';
    
    const remaining = journeyStatus.estimatedArrival.getTime() - Date.now();
    if (remaining <= 0) return 'Should be arrived';
    
    const minutes = Math.round(remaining / 60000);
    return `${minutes} min`;
  };

  const getStatusIcon = () => {
    if (!journeyStatus) return <Car className="w-5 h-5" />;
    
    switch (journeyStatus.status) {
      case 'departed':
        return <Car className="w-5 h-5 text-blue-500" />;
      case 'en_route':
        return <Navigation className="w-5 h-5 text-orange-500" />;
      case 'nearby':
        return <MapPin className="w-5 h-5 text-yellow-500" />;
      case 'arrived':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    if (!journeyStatus) return 'Start Journey';
    
    switch (journeyStatus.status) {
      case 'departed':
        return 'On the Way';
      case 'en_route':
        return 'En Route';
      case 'nearby':
        return 'Nearby';
      case 'arrived':
        return 'Arrived';
      default:
        return 'On the Way';
    }
  };

  // Don't show if booking isn't accepted yet
  if (!isBookingAccepted) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* Customer Info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          📍 Journey to Customer
        </h3>
        <div className="text-sm text-blue-700 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">👤 Customer:</span>
            <span>{customerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">📞 Phone:</span>
            <span>{customerPhone}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">🏠 Address:</span>
            <span className="flex-1">{customerAddress}</span>
          </div>
        </div>
      </div>

      {!journeyStatus ? (
        // Before starting journey
        <>
          {showTimeSelector ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                ⏰ Estimated travel time:
              </label>
              <select 
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={25}>25 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
              </select>
              
              <div className="flex gap-2">
                <button
                  onClick={handleStartJourney}
                  disabled={isStartingJourney}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Car className="w-5 h-5" />
                  {isStartingJourney ? 'Notifying...' : 'Start Journey 🚗'}
                </button>
                
                <button
                  onClick={() => setShowTimeSelector(false)}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowTimeSelector(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <Car className="w-6 h-6" />
              🚗 On the Way - Notify Customer
            </button>
          )}
        </>
      ) : (
        // After starting journey
        <div className="space-y-4">
          {/* Journey Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <div className="font-semibold text-gray-800">{getStatusText()}</div>
                <div className="text-xs text-gray-600">
                  Started: {formatTime(journeyStatus.departureTime)}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">
                ETA: {formatTime(journeyStatus.estimatedArrival)}
              </div>
              <div className="text-xs text-gray-600">
                {getTimeRemaining()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {journeyStatus.status !== 'arrived' && (
              <>
                {/* Update Arrival Time */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateArrivalTime(15)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Clock className="w-4 h-4" />
                    15 min
                  </button>
                  <button
                    onClick={() => handleUpdateArrivalTime(30)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Clock className="w-4 h-4" />
                    30 min
                  </button>
                  <button
                    onClick={() => handleUpdateArrivalTime(45)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Clock className="w-4 h-4" />
                    45 min
                  </button>
                </div>
                
                {/* Confirm Arrival Button */}
                <button
                  onClick={handleConfirmArrival}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  ✅ I've Arrived - Start Massage
                </button>
              </>
            )}

            {journeyStatus.status === 'arrived' && (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-green-800">✅ Arrival Confirmed!</div>
                <div className="text-sm text-green-700">Customer has been notified. Enjoy the massage! 🧘‍♀️</div>
              </div>
            )}
          </div>

          {/* Customer Contact */}
          <div className="flex gap-2">
            <a
              href={`tel:${customerPhone}`}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call Customer
            </a>
            
            <a
              href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              💬 WhatsApp
            </a>
          </div>

          {/* Journey Timeline */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="font-medium">📋 Journey Status:</div>
            <div className={`${journeyStatus.notifications.customerNotified ? 'text-green-600' : 'text-gray-400'}`}>
              ✓ Customer notified of departure
            </div>
            <div className={`${journeyStatus.notifications.nearbyAlertSent ? 'text-green-600' : 'text-gray-400'}`}>
              ✓ Nearby location alert sent
            </div>
            <div className={`${journeyStatus.notifications.arrivalConfirmed ? 'text-green-600' : 'text-gray-400'}`}>
              ✓ Arrival confirmed
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-xs text-yellow-800">
          <strong>💡 How it works:</strong>
          <div className="mt-1 space-y-1">
            <div>1. Click "On the Way" when you start traveling</div>
            <div>2. Customer gets notified with your ETA</div>
            <div>3. Update arrival time if needed</div>
            <div>4. Confirm arrival when you reach the location</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistOnTheWayButton;
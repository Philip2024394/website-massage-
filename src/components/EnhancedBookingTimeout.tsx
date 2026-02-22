/**
 * Enhanced Booking Timeout Component
 * Handles timeout scenarios with location-based broadcasting and user options
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Users, X } from 'lucide-react';
import { handleBookingTimeout, BookingTimeoutRequest, TimeoutHandlerResult } from '../services/bookingTimeoutHandler';
import { logger } from '../utils/logger';

interface EnhancedBookingTimeoutProps {
  bookingId: string;
  originalTherapistId: string;
  providerType: 'therapist' | 'massage_place' | 'skincare_clinic'; // NEW: Provider type
  bookingType: 'immediate' | 'scheduled'; // NEW: Booking type
  therapistName: string;
  customerName: string;
  serviceType: string;
  duration: number;
  price: number;
  location?: {
    lat: number;
    lng: number;
  };
  onCancel: () => void;
  onProviderFound?: (providerCount: number) => void;
  onLocationRequired?: () => void;
}

export const EnhancedBookingTimeout: React.FC<EnhancedBookingTimeoutProps> = ({
  bookingId,
  originalTherapistId,
  providerType,
  bookingType,
  therapistName,
  customerName,
  serviceType,
  duration,
  price,
  location,
  onCancel,
  onProviderFound,
  onLocationRequired
}) => {
  const [timeoutResult, setTimeoutResult] = useState<TimeoutHandlerResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'granted' | 'denied' | 'unavailable'>('checking');

  useEffect(() => {
    handleTimeout();
  }, []);

  const handleTimeout = async () => {
    try {
      setIsProcessing(true);
      
      const timeoutRequest: BookingTimeoutRequest = {
        bookingId,
        originalTherapistId,
        providerType,
        bookingType,
        customerName,
        serviceType,
        duration,
        price,
        location
      };

      const result = await handleBookingTimeout(timeoutRequest);
      setTimeoutResult(result);
      
      if (result.action === 'broadcasted' && result.success && onProviderFound) {
        onProviderFound(result.providerCount || 0);
      } else if (result.action === 'location_required' && onLocationRequired) {
        setLocationStatus('denied');
        onLocationRequired();
      }
      
    } catch (error) {
      logger.error('❌ Timeout handling failed:', error);
      setTimeoutResult({
        success: false,
        action: 'failed',
        message: 'Unable to process timeout. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLocationRetry = async () => {
    if (navigator.geolocation) {
      setLocationStatus('checking');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLocationStatus('granted');
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Retry timeout handling with location
          const timeoutRequest: BookingTimeoutRequest = {
            bookingId,
            originalTherapistId,
            providerType,
            bookingType,
            customerName,
            serviceType,
            duration,
            price,
            location: newLocation
          };

          const result = await handleBookingTimeout(timeoutRequest);
          setTimeoutResult(result);
          
          if (result.success && onProviderFound) {
            onProviderFound(result.providerCount || 0);
          }
        },
        () => {
          setLocationStatus('denied');
        }
      );
    } else {
      setLocationStatus('unavailable');
    }
  };

  const handleCancelAndBrowse = () => {
    // Redirect to directory
    window.location.href = '/therapists';
    onCancel();
  };

  if (isProcessing) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">
            ⏰ Processing Timeout
          </h3>
          <p className="text-gray-600">
            {therapistName} didn't respond within the time limit. Finding alternatives...
          </p>
        </div>
      </div>
    );
  }

  if (!timeoutResult) {
    return null;
  }

  return (
    <div className={`border-2 rounded-xl p-6 mb-4 ${
      timeoutResult.success 
        ? 'bg-gradient-to-br from-blue-50 to-green-50 border-blue-200' 
        : 'bg-gradient-to-br from-yellow-50 to-red-50 border-yellow-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            timeoutResult.success ? 'bg-blue-100' : 'bg-yellow-100'
          }`}>
            {timeoutResult.action === 'broadcasted' ? (
              <Users className="w-5 h-5 text-blue-600" />
            ) : timeoutResult.action === 'location_required' ? (
              <MapPin className="w-5 h-5 text-yellow-600" />
            ) : (
              <Clock className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">
              {timeoutResult.action === 'broadcasted' && '📡 Finding Nearby Providers'}
              {timeoutResult.action === 'location_required' && '📍 Location Required'}
              {timeoutResult.action === 'failed' && '⚠️ No Response Received'}
            </h3>
            <p className="text-sm text-gray-600">
              {therapistName} • {serviceType} • {duration} minutes
            </p>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">
          {timeoutResult.message}
        </p>
        
        {timeoutResult.action === 'broadcasted' && timeoutResult.success && (
          <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Users className="w-4 h-4" />
              <span className="font-medium text-sm">
                {timeoutResult.providerCount} providers found in your area
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              First to accept gets the booking automatically
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {timeoutResult.action === 'location_required' && locationStatus !== 'granted' && (
          <div className="flex gap-2">
            <button
              onClick={handleLocationRetry}
              disabled={locationStatus === 'checking'}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {locationStatus === 'checking' ? 'Getting Location...' : 'Enable Location'}
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={handleCancelAndBrowse}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel & Browse Directory
          </button>
          
          {timeoutResult.action === 'broadcasted' && timeoutResult.success && (
            <button
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              disabled
            >
              <Clock className="w-4 h-4 mr-2" />
              Waiting for Acceptance
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-600 text-center mt-2">
          {timeoutResult.action === 'broadcasted' 
            ? 'Browse directory for your preferred Therapist / Places'
            : 'View directory for your preferred Therapist / Places'
          }
        </p>
      </div>
    </div>
  );
};

export default EnhancedBookingTimeout;
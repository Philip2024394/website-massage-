/**
 * ============================================================================
 * 📍 THERAPIST LOCATION VERIFICATION COMPONENT
 * ============================================================================
 * 
 * Displays customer-therapist distance verification for booking acceptance
 * Shows GPS-based proximity alerts and location sharing features
 * 
 * Features:
 * • Real-time distance calculation display
 * • Color-coded proximity status (green/yellow/red)
 * • Google Maps integration for navigation
 * • Location verification recommendations
 * • Booking acceptance/decline with GPS context
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import type { GPSEnhancedBookingData, TherapistGPSAlert } from '../services/bookingFlowGPSIntegration';
import { BookingGPSUtils } from '../services/bookingFlowGPSIntegration';

interface TherapistLocationVerificationProps {
  bookingData: GPSEnhancedBookingData;
  onAcceptBooking: () => void;
  onDeclineBooking: () => void;
  isProcessing?: boolean;
  className?: string;
}

interface LocationStatusConfig {
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TherapistLocationVerification: React.FC<TherapistLocationVerificationProps> = ({
  bookingData,
  onAcceptBooking,
  onDeclineBooking,
  isProcessing = false,
  className = ''
}) => {
  const [alert, setAlert] = useState<TherapistGPSAlert | null>(null);
  const [showFullAddress, setShowFullAddress] = useState(false);

  useEffect(() => {
    // Generate therapist alert when component mounts or booking data changes
    const generatedAlert = BookingGPSUtils.getTherapistAlert(bookingData);
    setAlert(generatedAlert);
  }, [bookingData]);

  if (!alert) {
    return null;
  }

  // Configuration for different proximity statuses
  const statusConfig: Record<string, LocationStatusConfig> = {
    verified: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      icon: CheckCircle
    },
    needs_check: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      icon: AlertTriangle
    },
    mismatch: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      icon: XCircle
    },
    unknown: {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-800',
      iconColor: 'text-gray-600',
      icon: MapPin
    }
  };

  const config = statusConfig[bookingData.proximityStatus] || statusConfig.unknown;
  const StatusIcon = config.icon;

  // Generate Google Maps URL for navigation
  const getMapsUrl = (): string | null => {
    if (!bookingData.customerGPS) return null;
    
    const { lat, lng } = bookingData.customerGPS.coordinates;
    return `https://maps.google.com/maps?q=${lat},${lng}`;
  };

  // Format address for display
  const getDisplayAddress = (): string => {
    const address = bookingData.customerGPS?.address || bookingData.location;
    
    if (showFullAddress || address.length <= 50) {
      return address;
    }
    
    return `${address.substring(0, 50)}...`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Location Status Card */}
      <div className={`rounded-xl border-2 ${config.bgColor} ${config.borderColor} p-4`}>
        <div className="flex items-start gap-3">
          <StatusIcon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-lg ${config.textColor} mb-1`}>
              {alert.title}
            </h3>
            
            <p className={`${config.textColor} mb-2 text-sm leading-relaxed`}>
              {alert.message}
            </p>

            {/* Distance and Address Info */}
            {bookingData.customerGPS && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className={`w-4 h-4 ${config.iconColor}`} />
                  <span className={`text-sm ${config.textColor} font-medium`}>
                    Customer Address:
                  </span>
                </div>
                
                <div className="bg-white/50 rounded-lg p-3 border border-white/60">
                  <p className={`text-sm ${config.textColor} break-words`}>
                    {getDisplayAddress()}
                  </p>
                  
                  {bookingData.customerGPS.address.length > 50 && (
                    <button
                      onClick={() => setShowFullAddress(!showFullAddress)}
                      className={`text-xs ${config.textColor} underline hover:no-underline mt-1`}
                    >
                      {showFullAddress ? 'Show less' : 'Show full address'}
                    </button>
                  )}
                </div>

                {/* Accuracy indicator */}
                {bookingData.customerGPS.accuracy && (
                  <p className={`text-xs ${config.textColor} opacity-75`}>
                    GPS accuracy: ±{bookingData.customerGPS.accuracy}m
                  </p>
                )}
              </div>
            )}

            {/* Recommendation */}
            {alert.recommendation && (
              <div className="mt-3 p-3 bg-white/30 rounded-lg border border-white/50">
                <p className={`text-sm ${config.textColor} font-medium`}>
                  💡 {alert.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation and Actions */}
      <div className="flex flex-col gap-3">
        {/* Navigation Button */}
        {getMapsUrl() && (
          <a
            href={getMapsUrl()!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            <Navigation className="w-5 h-5" />
            Open in Google Maps
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* Booking Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onAcceptBooking}
            disabled={isProcessing}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              bookingData.proximityStatus === 'verified'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : bookingData.proximityStatus === 'warning'
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <>
                ✅ Accept Booking
                {alert.distance && (
                  <span className="text-sm opacity-75 block mt-1">
                    ({alert.distance.toFixed(1)}km away)
                  </span>
                )}
              </>
            )}
          </button>

          <button
            onClick={onDeclineBooking}
            disabled={isProcessing}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ❌ Decline
          </button>
        </div>
      </div>

      {/* Booking Details Summary */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2">📋 Booking Summary</h4>
        <div className="space-y-1 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="font-medium">{bookingData.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="font-medium">{bookingData.duration} minutes</span>
          </div>
          <div className="flex justify-between">
            <span>Price:</span>
            <span className="font-medium">IDR {bookingData.price.toLocaleString()}</span>
          </div>
          {bookingData.estimatedDistance !== undefined && (
            <div className="flex justify-between">
              <span>Distance:</span>
              <span className="font-medium">{bookingData.estimatedDistance.toFixed(1)}km</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistLocationVerification;
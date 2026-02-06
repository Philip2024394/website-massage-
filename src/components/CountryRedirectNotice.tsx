/**
 * CountryRedirectNotice Component
 * Shows a user-friendly notification when their country is not supported
 * and they're being redirected to the nearest supported country
 */

import React, { useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import type { GeolocationResult } from '../lib/ipGeolocationService';

interface CountryRedirectNoticeProps {
  location: GeolocationResult;
  onDismiss?: () => void;
}

export const CountryRedirectNotice: React.FC<CountryRedirectNoticeProps> = ({
  location,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if user was redirected to nearest country
    if (location.method === 'nearest' && location.detectedCountry) {
      setIsVisible(true);
      
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || location.method !== 'nearest' || !location.detectedCountry) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-2xl max-w-md mx-4">
        <div className="p-4 flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Location Detected: {location.detectedCountry}
            </h3>
            <p className="text-xs opacity-90 leading-relaxed">
              We've automatically selected <strong>{location.countryName}</strong> as your nearest
              supported country for the best experience.
            </p>
            {location.latitude && location.longitude && (
              <p className="text-xs opacity-75 mt-2">
                📍 Your location: {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
              </p>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar for auto-dismiss */}
        <div className="h-1 bg-white/20 overflow-hidden">
          <div 
            className="h-full bg-white/50 animate-progress-10s"
            style={{
              animation: 'progress 10s linear forwards'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }

        .animate-progress-10s {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default CountryRedirectNotice;

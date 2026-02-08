import React, { useState, useEffect } from 'react';
import { enhancedDistanceService } from '../lib/googleMapsDistanceService';

interface DistanceDisplayProps {
  userLocation: { lat: number; lng: number } | null | undefined;
  providerLocation: { lat: number; lng: number };
  className?: string;
  showTravelTime?: boolean;
  showIcon?: boolean;
  mode?: 'DRIVING' | 'WALKING' | 'TRANSIT';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Distance Display Component
 * Shows accurate distance and travel time using Google Maps API with Haversine fallback
 */
const DistanceDisplay: React.FC<DistanceDisplayProps> = ({
  userLocation,
  providerLocation,
  className = '',
  showTravelTime = true,
  showIcon = true,
  mode = 'DRIVING',
  size = 'md'
}) => {
  const [distance, setDistance] = useState<string>('');
  const [travelTime, setTravelTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const calculateDistance = async () => {
      if (!userLocation || !providerLocation) {
        setDistance('');
        setTravelTime('');
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        const result = await enhancedDistanceService.getDistanceWithTravelTime(
          userLocation,
          providerLocation
        );

        setDistance(result.distanceText || enhancedDistanceService.formatDistance(result.distance));
        
        if (showTravelTime && result.duration) {
          setTravelTime(result.durationText || enhancedDistanceService.formatTravelTime(result.duration));
        }
      } catch (error) {
        logger.error('Error calculating distance:', error);
        setHasError(true);
        setDistance('Distance unavailable');
        setTravelTime('');
      } finally {
        setIsLoading(false);
      }
    };

    calculateDistance();
  }, [userLocation, providerLocation, showTravelTime, mode]);

  if (!userLocation || hasError) {
    return null; // Don't show distance if user location is not available or error occurred
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  return (
    <div className={`flex items-center gap-1 text-gray-600 ${getSizeClasses()} ${className}`}>
      {showIcon && (
        <svg className={`${getIconSize()} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
      
      {isLoading ? (
        <span className="text-gray-400">Calculating...</span>
      ) : (
        <div className="flex items-center gap-1">
          <span className="font-medium text-gray-700">{distance}</span>
          {showTravelTime && travelTime && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{travelTime}</span>
              {showIcon && (
                <span className="ml-1">{enhancedDistanceService.getTravelModeIcon(mode)}</span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DistanceDisplay;
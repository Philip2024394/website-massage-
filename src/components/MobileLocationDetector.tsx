import React, { useState, useEffect } from 'react';
import { locationService } from '../services/locationService';
import { deviceService } from '../services/deviceService';
import type { UserLocation } from '../types';
import { logger } from '../utils/logger';

interface MobileLocationDetectorProps {
  onLocationDetected: (location: UserLocation) => void;
  onLocationError?: (error: string) => void;
  autoDetectOnMount?: boolean;
  showLocationPrompt?: boolean;
  children?: React.ReactNode;
}

/**
 * Enhanced Mobile Location Detector
 * Optimized for phone devices with improved UX
 */
const MobileLocationDetector: React.FC<MobileLocationDetectorProps> = ({
  onLocationDetected,
  onLocationError,
  autoDetectOnMount = true,
  showLocationPrompt = true,
  children
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState(deviceService.getDeviceInfo());

  useEffect(() => {
    setDeviceInfo(deviceService.getDeviceInfo());
    
    if (autoDetectOnMount && deviceInfo.supportsGPS) {
      // Auto-detect for mobile devices
      if (deviceInfo.type === 'mobile') {
        setTimeout(() => {
          handleLocationDetection();
        }, 1000); // Small delay for better UX
      }
    }
  }, [autoDetectOnMount, deviceInfo.supportsGPS, deviceInfo.type]);

  const handleLocationDetection = async () => {
    logger.debug('📱 Starting location detection for device:', deviceInfo);
    
    setIsDetecting(true);
    setLocationStatus('detecting');
    setErrorMessage('');

    try {
      // Show permission prompt for first-time users
      if (showLocationPrompt && deviceInfo.type === 'mobile') {
        setShowPermissionPrompt(true);
        // Wait a bit for user to see the prompt
        await new Promise(resolve => setTimeout(resolve, 2000));
        setShowPermissionPrompt(false);
      }

      // Get location with device-optimized settings
      const location = await locationService.getCurrentLocation({
        enableHighAccuracy: deviceInfo.platform === 'android',
        timeout: deviceInfo.platform === 'android' ? 15000 : 10000,
        maximumAge: deviceInfo.type === 'mobile' ? 60000 : 300000
      });

      logger.info('✅ Location detected successfully:', location);
      
      setLocationStatus('success');
      onLocationDetected(location);

      // Mobile haptic feedback
      if ('vibrate' in navigator && deviceInfo.type === 'mobile') {
        navigator.vibrate([100, 50, 100]);
      }

    } catch (error: any) {
      logger.error('❌ Location detection failed:', error);
      
      const errorMsg = getLocationErrorMessage(error);
      setErrorMessage(errorMsg);
      setLocationStatus('error');
      
      if (onLocationError) {
        onLocationError(errorMsg);
      }

      // Use default location as fallback
      const defaultLocation = locationService.getDefaultLocation();
      onLocationDetected(defaultLocation);
      
    } finally {
      setIsDetecting(false);
    }
  };

  const getLocationErrorMessage = (error: any): string => {
    if (error.code === 1) {
      return 'Location access denied. Using default location (Jakarta, Indonesia).';
    } else if (error.code === 2) {
      return 'Location unavailable. Please check your GPS settings.';
    } else if (error.code === 3) {
      return 'Location request timed out. Using default location.';
    }
    return 'Unable to get your location. Using default location.';
  };

  const getLocationIcon = () => {
    switch (locationStatus) {
      case 'detecting':
        return (
          <div className="w-6 h-6 relative">
            <div className="absolute inset-0 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-1 bg-orange-500 rounded-full"></div>
          </div>
        );
      case 'success':
        return (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="mobile-location-detector">
      {/* Permission Prompt Overlay */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Enable Location</h3>
              <p className="text-gray-600 text-sm mb-4">
                Allow location access to find massage therapists and spas near you with accurate distances.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span>Detecting your location...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Status Display */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        {getLocationIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {locationStatus === 'detecting' && 'Detecting location...'}
              {locationStatus === 'success' && 'Location detected'}
              {locationStatus === 'error' && 'Location unavailable'}
              {locationStatus === 'idle' && 'Location service ready'}
            </span>
            {deviceInfo.type === 'mobile' && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                📱 Mobile
              </span>
            )}
          </div>
          
          {errorMessage && (
            <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
          )}
          
          {locationStatus === 'success' && (
            <p className="text-xs text-green-600 mt-1">
              ✅ Ready to show nearby providers
            </p>
          )}
        </div>

        {/* Manual Location Button */}
        {(locationStatus === 'error' || locationStatus === 'idle') && (
          <button
            onClick={handleLocationDetection}
            disabled={isDetecting}
            className="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white text-xs font-medium rounded-lg transition-colors"
          >
            {isDetecting ? 'Detecting...' : 'Get Location'}
          </button>
        )}
      </div>

      {/* Device Info for Debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <strong>Debug:</strong> {deviceInfo.type} | {deviceInfo.platform} | {deviceInfo.browser} | 
          GPS: {deviceInfo.supportsGPS ? '✅' : '❌'} | 
          Touch: {deviceInfo.hasTouch ? '✅' : '❌'}
        </div>
      )}

      {children}
    </div>
  );
};

export default MobileLocationDetector;
import React, { useState, useEffect } from 'react';
import { getStoredGoogleMapsApiKey } from '../utils/appConfig';
import { googleMapsDistanceService } from '../lib/googleMapsDistanceService';
import DistanceDisplay from './DistanceDisplay';

interface GoogleMapsAPIStatusProps {
  className?: string;
}

/**
 * Google Maps API Status Checker
 * Displays the current status of Google Maps API integration and provides testing
 */
const GoogleMapsAPIStatus: React.FC<GoogleMapsAPIStatusProps> = ({ className = '' }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiAvailable, setIsApiAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [testLocation] = useState({ lat: -6.2088, lng: 106.8456 }); // Jakarta coordinates for testing

  useEffect(() => {
    const checkApiStatus = async () => {
      setIsLoading(true);
      
      // Get stored API key
      const storedKey = getStoredGoogleMapsApiKey();
      setApiKey(storedKey);
      
      if (storedKey) {
        // Update service with current API key
        googleMapsDistanceService.updateApiKey(storedKey);
        
        // Test if API is available
        try {
          const available = await googleMapsDistanceService.isGoogleMapsAvailable();
          setIsApiAvailable(available);
        } catch (error) {
          console.error('Error checking Google Maps API availability:', error);
          setIsApiAvailable(false);
        }
      } else {
        setIsApiAvailable(false);
      }
      
      setIsLoading(false);
    };

    checkApiStatus();
  }, []);

  const getStatusColor = () => {
    if (isLoading) return 'bg-gray-100 text-gray-600';
    if (!apiKey) return 'bg-red-100 text-red-700';
    if (isApiAvailable) return 'bg-green-100 text-green-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking API status...';
    if (!apiKey) return 'No API key configured';
    if (isApiAvailable) return 'Google Maps API Active';
    return 'API key configured (Google Maps loading)';
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return (
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }
    
    if (!apiKey) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.598 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    
    if (isApiAvailable) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="space-y-4">
        {/* API Status */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Google Maps API Status</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
          </div>
        </div>

        {/* API Key Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">API Key:</span>
            <span className="font-mono text-xs text-gray-800">
              {apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'Not set'}
            </span>
          </div>
          
          {apiKey && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Services Available:</span>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-xs ${isApiAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  Distance Matrix
                </span>
                <span className={`px-2 py-1 rounded text-xs ${isApiAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  Geocoding
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Test Distance Calculation */}
        {apiKey && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Distance Calculation Test</h4>
            <div className="bg-gray-50 rounded p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Jakarta Test Location:</span>
                <DistanceDisplay
                  userLocation={{ lat: -6.2615, lng: 106.8106 }} // Monas Jakarta
                  providerLocation={testLocation} // Another Jakarta location
                  showTravelTime={true}
                  showIcon={true}
                  size="sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!apiKey && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              Configure your Google Maps API key in the dashboard settings to enable accurate distance calculations and travel times.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMapsAPIStatus;
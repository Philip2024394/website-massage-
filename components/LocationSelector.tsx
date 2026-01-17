import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, Loader, MapPin as MapPinIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { locationService, LocationOption, DetectedLocation } from '../lib/locationService';

interface LocationSelectorProps {
  selectedLocation?: LocationOption | null;
  onLocationChange: (location: LocationOption | null) => void;
  placeholder?: string;
  showGpsButton?: boolean;
  required?: boolean;
  className?: string;
  therapistMode?: boolean; // Special mode for therapist registration
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  onLocationChange,
  placeholder = "Search or select your location...",
  showGpsButton = true,
  required = false,
  className = "",
  therapistMode = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationOption[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [popularLocations, setPopularLocations] = useState<LocationOption[]>([]);

  // Initialize popular locations
  useEffect(() => {
    setPopularLocations(locationService.getPopularLocations());
  }, []);

  // Search functionality
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = locationService.searchLocations(query);
      setSearchResults(results);
    } else {
      setSearchResults(popularLocations);
    }
  }, [popularLocations]);

  // Initialize with popular locations
  useEffect(() => {
    setSearchResults(popularLocations);
  }, [popularLocations]);

  // GPS Detection
  const handleGpsDetection = async () => {
    setIsDetecting(true);
    setGpsError(null);
    
    try {
      const detected = await locationService.detectCurrentLocation();
      
      if (detected) {
        setDetectedLocation(detected);
        
        // Auto-select if high confidence
        if (detected.confidence === 'high') {
          const location = locationService.getLocationByName(detected.city);
          if (location) {
            onLocationChange(location);
            setIsOpen(false);
          }
        }
      } else {
        setGpsError('Could not detect your location. Please select manually.');
      }
    } catch (error) {
      setGpsError('Location detection failed. Please select manually.');
      console.error('GPS detection error:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  // Location selection
  const handleLocationSelect = (location: LocationOption) => {
    onLocationChange(location);
    setIsOpen(false);
    setSearchQuery('');
    setGpsError(null);
  };

  // Clear selection
  const handleClear = () => {
    onLocationChange(null);
    setSearchQuery('');
    setDetectedLocation(null);
    setGpsError(null);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Input */}
      <div 
        className={`
          flex items-center w-full px-4 py-3 border rounded-lg cursor-pointer
          ${selectedLocation ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}
          ${isOpen ? 'border-blue-500' : ''}
          ${required && !selectedLocation ? 'border-red-300' : ''}
          hover:border-gray-400 transition-colors
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MapPin className={`w-5 h-5 mr-3 ${selectedLocation ? 'text-green-600' : 'text-gray-400'}`} />
        
        <div className="flex-1">
          {selectedLocation ? (
            <div>
              <div className="font-medium text-gray-900">
                {locationService.formatLocationDisplay(selectedLocation)}
              </div>
              {therapistMode && (
                <div className="text-sm text-gray-500">
                  Service area: {selectedLocation.region}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">{placeholder}</div>
          )}
        </div>

        {selectedLocation && (
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
        )}

        {/* GPS Button */}
        {showGpsButton && !selectedLocation && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleGpsDetection();
            }}
            disabled={isDetecting}
            className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors mr-2 disabled:opacity-50"
          >
            {isDetecting ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <MapPinIcon className="w-4 h-4" />
            )}
            <span className="ml-1">GPS</span>
          </button>
        )}

        {/* Clear Button */}
        {selectedLocation && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            ×
          </button>
        )}
      </div>

      {/* GPS Detection Status */}
      {detectedLocation && !selectedLocation && (
        <div className={`
          mt-2 p-3 rounded-lg border-l-4
          ${detectedLocation.confidence === 'high' ? 'border-green-500 bg-green-50' : 
            detectedLocation.confidence === 'medium' ? 'border-yellow-500 bg-yellow-50' : 
            'border-red-500 bg-red-50'}
        `}>
          <div className="flex items-center">
            <MapPinIcon className={`w-4 h-4 mr-2 ${
              detectedLocation.confidence === 'high' ? 'text-green-600' : 
              detectedLocation.confidence === 'medium' ? 'text-yellow-600' : 
              'text-red-600'
            }`} />
            <div className="text-sm">
              <div className="font-medium">
                Detected: {detectedLocation.city}, {detectedLocation.region}
              </div>
              <div className="text-gray-600">
                Accuracy: ±{detectedLocation.accuracy}m • {detectedLocation.confidence} confidence
              </div>
            </div>
            <button
              onClick={() => {
                const location = locationService.getLocationByName(detectedLocation.city);
                if (location) handleLocationSelect(location);
              }}
              className={`ml-auto px-3 py-1 rounded text-sm font-medium ${
                detectedLocation.confidence === 'high' 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Use This
            </button>
          </div>
        </div>
      )}

      {/* GPS Error */}
      {gpsError && (
        <div className="mt-2 p-3 rounded-lg border-l-4 border-red-500 bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
            <div className="text-sm text-red-700">{gpsError}</div>
          </div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type city name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {searchResults.length > 0 ? (
              <>
                {/* Popular/Recent Section */}
                {!searchQuery && (
                  <div className="p-2">
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Popular Locations
                    </div>
                  </div>
                )}

                {searchResults.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {location.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {location.region}, {location.province}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {location.isPopular && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Popular
                          </span>
                        )}
                        {therapistMode && locationService.isMajorCity(location.id) && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Major City
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <div>No locations found</div>
                <div className="text-sm">Try a different search term</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              {therapistMode ? (
                <>Covering {locationService.getServiceAreaCoverage().totalCities} cities across Indonesia</>
              ) : (
                <>Can't find your location? Contact support to add it.</>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Required Field Error */}
      {required && !selectedLocation && (
        <div className="mt-1 text-sm text-red-600">
          Location is required
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
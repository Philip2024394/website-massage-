import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Settings } from 'lucide-react';
import LocationSelector from '../components/LocationSelector';
import { LocationOption, locationService } from '../lib/locationService';

interface CustomerLocationSearchProps {
  onLocationSelect: (location: LocationOption | null) => void;
  initialLocation?: LocationOption | null;
  showNearbyTherapists?: boolean;
}

const CustomerLocationSearch: React.FC<CustomerLocationSearchProps> = ({
  onLocationSelect,
  initialLocation,
  showNearbyTherapists = true
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(initialLocation || null);
  const [nearbyCount, setNearbyCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSelectedLocation(initialLocation || null);
  }, [initialLocation]);

  // Simulate fetching nearby therapists count
  useEffect(() => {
    if (selectedLocation && showNearbyTherapists) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        // Mock data based on location popularity
        const baseCount = selectedLocation.isPopular ? 25 : 8;
        const randomVariation = Math.floor(Math.random() * 15);
        setNearbyCount(baseCount + randomVariation);
        setIsLoading(false);
      }, 800);
    } else {
      setNearbyCount(0);
    }
  }, [selectedLocation, showNearbyTherapists]);

  const handleLocationChange = (location: LocationOption | null) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  return (
    <div className="space-y-4">
      {/* Main Location Selector */}
      <div className="relative">
        <LocationSelector
          selectedLocation={selectedLocation}
          onLocationChange={handleLocationChange}
          placeholder="Where do you need a massage?"
          showGpsButton={true}
          className="w-full"
        />

        {/* Search Enhancement Button */}
        {selectedLocation && (
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Location Results Summary */}
      {selectedLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <div className="font-medium text-blue-900">
                  {locationService.formatLocationDisplay(selectedLocation)}
                </div>
                <div className="text-sm text-blue-700">
                  Service area: {selectedLocation.region}
                </div>
              </div>
            </div>

            {showNearbyTherapists && (
              <div className="text-right">
                {isLoading ? (
                  <div className="flex items-center text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm">Finding therapists...</span>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{nearbyCount}</div>
                    <div className="text-sm text-blue-700">therapists available</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Service Area Coverage */}
          {selectedLocation && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between text-sm text-blue-700">
                <div className="flex items-center">
                  <span className="font-medium">Coverage:</span>
                  <span className="ml-1">Home visits available</span>
                </div>
                
                {locationService.isMajorCity(selectedLocation.id) && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Premium Coverage
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Location Suggestions */}
      {!selectedLocation && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Popular areas:</div>
          <div className="flex flex-wrap gap-2">
            {locationService.getPopularLocations().slice(0, 6).map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationChange(location)}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GPS Detection Hint */}
      {!selectedLocation && (
        <div className="text-center py-4">
          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <div className="text-gray-500 text-sm">
            <div>Use GPS to auto-detect your location</div>
            <div>or search/select from the list above</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLocationSearch;
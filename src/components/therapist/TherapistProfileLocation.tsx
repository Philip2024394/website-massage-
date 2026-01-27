import React, { useState, useEffect } from 'react';
import { Save, MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import LocationSelector from '../components/LocationSelector';
import { LocationOption } from '../../lib/locationService';

interface TherapistProfileLocationProps {
  therapistId: string;
  currentLocation?: LocationOption | null;
  onLocationUpdate?: (location: LocationOption) => void;
}

const TherapistProfileLocation: React.FC<TherapistProfileLocationProps> = ({
  therapistId,
  currentLocation,
  onLocationUpdate
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(currentLocation || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    setSelectedLocation(currentLocation || null);
  }, [currentLocation]);

  const handleSaveLocation = async () => {
    if (!selectedLocation) return;

    setSaveStatus('saving');
    setIsSaving(true);

    try {
      // Simulate API call to update therapist location
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update backend
      // await databases.updateDocument(
      //   DATABASE_ID,
      //   'therapists',
      //   therapistId,
      //   {
      //     locationId: selectedLocation.id,
      //     locationName: selectedLocation.name,
      //     locationRegion: selectedLocation.region,
      //     locationProvince: selectedLocation.province,
      //     locationCoordinates: selectedLocation.coordinates,
      //     locationUpdatedAt: new Date().toISOString()
      //   }
      // );

      setSaveStatus('success');
      setIsEditing(false);
      setLastUpdated(new Date().toLocaleString('id-ID'));
      
      if (onLocationUpdate) {
        onLocationUpdate(selectedLocation);
      }

      // Clear success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Error saving location:', error);
      setSaveStatus('error');
      
      // Clear error status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setSelectedLocation(currentLocation || null);
    setIsEditing(false);
    setSaveStatus('idle');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <MapPin className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Service Location</h3>
            <p className="text-sm text-gray-600">Where you provide massage services</p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Location
          </button>
        )}
      </div>

      {/* Current Location Display */}
      {!isEditing && selectedLocation && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 text-lg">
                {selectedLocation.name}
              </div>
              <div className="text-gray-600">
                {selectedLocation.region}, {selectedLocation.province}
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Last updated: {lastUpdated || 'Not set'}
              </div>
            </div>
            
            <div className="text-right">
              {selectedLocation.isPopular && (
                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mb-2">
                  Popular Area
                </span>
              )}
              <div className="text-sm text-gray-500">
                Service Coverage Area
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Selector (Edit Mode) */}
      {isEditing && (
        <div className="space-y-4">
          <LocationSelector
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            placeholder="Select your service location..."
            showGpsButton={true}
            required={true}
            therapistMode={true}
            className="mb-4"
          />

          {/* Helper Text for Therapists */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-700">
                <div className="font-medium mb-1">Location Selection Tips:</div>
                <ul className="list-disc list-inside space-y-1 text-blue-600">
                  <li>Choose the city where you primarily offer services</li>
                  <li>Customers will find you when searching in this area</li>
                  <li>You can travel within the region for bookings</li>
                  <li>Use GPS to auto-detect your current location</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveLocation}
              disabled={!selectedLocation || isSaving}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-400 rounded">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div className="text-sm text-green-700 font-medium">
              Location updated successfully! Customers can now find you in this area.
            </div>
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <div className="text-sm text-red-700">
              <div className="font-medium">Failed to update location</div>
              <div>Please check your connection and try again.</div>
            </div>
          </div>
        </div>
      )}

      {/* No Location Set */}
      {!selectedLocation && !isEditing && (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <div className="text-gray-500">
            <div className="font-medium mb-1">No service location set</div>
            <div className="text-sm">Click "Edit Location" to add your service area</div>
          </div>
        </div>
      )}

      {/* Location Benefits (for new therapists) */}
      {!selectedLocation && (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <div className="font-medium mb-1">Why set your location?</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Customers can find and book your services</li>
                <li>Get matched with nearby booking requests</li>
                <li>Build local reputation and reviews</li>
                <li>Receive location-based notifications</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistProfileLocation;
/**
 * Location Section Component
 * Handles location input, Google Maps integration, and coordinates
 * Max size: 15KB (Facebook/Amazon standard)
 */

import React from 'react';
import Button from '../../../../../components/Button';
import MapPinIcon from '../../../../../components/icons/MapPinIcon';
import ClockIcon from '../../../../../components/icons/ClockIcon';
import CityLocationDropdown from '../../../../../components/CityLocationDropdown';

interface LocationSectionProps {
  location: string;
  setLocation: (value: string) => void;
  coordinates: { lat: number; lng: number };
  setCoordinates: (value: { lat: number; lng: number }) => void;
  selectedCity: string;
  setSelectedCity: (value: string) => void;
  openingTime: string;
  setOpeningTime: (value: string) => void;
  closingTime: string;
  setClosingTime: (value: string) => void;
  isLocationManuallyEdited: boolean;
  setIsLocationManuallyEdited: (value: boolean) => void;
  mapsApiLoaded: boolean;
  handleSetLocation: () => void;
  locationInputRef: React.RefObject<HTMLInputElement>;
  setToast: (toast: { message: string; type: 'success' | 'error' } | null) => void;
  t: any;
  /** Country name for label; when set, dropdown shows that country's cities (matches main app filter). */
  country?: string;
  /** Country code (e.g. 'ID', 'MY'). When set, dropdown shows that country's cities only. */
  countryCode?: string;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  location,
  setLocation,
  coordinates,
  selectedCity,
  setSelectedCity,
  openingTime,
  setOpeningTime,
  closingTime,
  setClosingTime,
  setIsLocationManuallyEdited,
  mapsApiLoaded,
  handleSetLocation,
  locationInputRef,
  setToast,
  t,
  country,
  countryCode,
}: LocationSectionProps): JSX.Element => {
  return (
    <div className="space-y-6">
      {/* City Selection – per-country list, matches main app so customers find you when they select this city */}
      <div>
        <CityLocationDropdown
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          placeholder={country ? `Select City in ${country}` : 'Select Your City/Location'}
          label="🏙️ City / Tourist Location *"
          showLabel={true}
          includeAll={false}
          className="w-full"
          country={country}
          countryCode={countryCode}
        />
        <p className="text-xs text-gray-500 mt-1">
          Select the city or tourist area where your Facial Place is located. This helps customers find you easily.
        </p>
      </div>

      {/* Location Input */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {t?.locationLabel || 'Location'}
        </label>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={locationInputRef}
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setIsLocationManuallyEdited(true);
              }}
              placeholder={t?.locationPlaceholder || 'Enter your location'}
              className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm"
              readOnly={!mapsApiLoaded}
            />
          </div>
          <Button
            onClick={handleSetLocation}
            variant="secondary"
            className={`w-full flex items-center justify-center gap-2 py-3 text-white border-0 ${
              location ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            <MapPinIcon className="w-5 h-5" />
            <span className="font-semibold">
              {location ? 'Location Set ✓' : 'Set Location from Device'}
            </span>
          </Button>
          {location && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-500 text-center">
                📍 {location.substring(0, 50)}{location.length > 50 ? '...' : ''}
              </p>
              {coordinates && coordinates.lat && coordinates.lng && coordinates.lat !== 0 && coordinates.lng !== 0 && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Location Coordinates:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="bg-white rounded p-2 border">
                      <span className="text-gray-500">Lat:</span>
                      <span className="font-mono ml-1 text-gray-900">{Number(coordinates.lat).toFixed(6)}</span>
                    </div>
                    <div className="bg-white rounded p-2 border">
                      <span className="text-gray-500">Lng:</span>
                      <span className="font-mono ml-1 text-gray-900">{Number(coordinates.lng).toFixed(6)}</span>
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border">
                    <span className="text-gray-500 text-xs">Map ID:</span>
                    <div className="font-mono text-xs text-gray-900 mt-1 break-all">
                      {Number(coordinates.lat).toFixed(6)},{Number(coordinates.lng).toFixed(6)}
                    </div>
                    <button
                      onClick={() => {
                        const coordString = `${Number(coordinates.lat).toFixed(6)},${Number(coordinates.lng).toFixed(6)}`;
                        navigator.clipboard.writeText(coordString);
                        setToast({ message: '📋 Coordinates copied to clipboard!', type: 'success' });
                        setTimeout(() => setToast(null), 2000);
                      }}
                      className="mt-1 mr-3 text-xs text-orange-600 hover:text-orange-700 underline"
                    >
                      Copy Coordinates
                    </button>
                    <button
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
                        window.open(mapsUrl, '_blank');
                      }}
                      className="text-xs text-orange-600 hover:text-orange-700 underline"
                    >
                      Open in Google Maps
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Business Hours */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          <ClockIcon className="inline w-4 h-4 mr-1" />
          Business Hours
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Opening Time</label>
            <input
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Closing Time</label>
            <input
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 text-gray-900"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Set your daily operating hours
        </p>
      </div>
    </div>
  );
};

export default LocationSection;

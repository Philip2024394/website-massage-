// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import MapPinIcon from './icons/MapPinIcon';
import Button from './Button';

interface LocationPopupProps {
    isOpen: boolean;
    onLocationSet: (location: { lat: number; lng: number; address: string }) => void;
    onSkip: () => void;
}

const LocationPopup: React.FC<LocationPopupProps> = ({ isOpen, onLocationSet, onSkip }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentLocation, setCurrentLocation] = useState<string>('');

    const getCurrentLocation = () => {
        setIsLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser.');
            setIsLoading(false);
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // Cache for 1 minute
        };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    // Reverse geocoding to get address
                    const response = await fetch(
                        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY&limit=1`
                    );
                    
                    let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.results && data.results.length > 0) {
                            address = data.results[0].formatted;
                        }
                    }
                    
                    setCurrentLocation(address);
                    onLocationSet({
                        lat: latitude,
                        lng: longitude,
                        address: address
                    });
                } catch (__err) {
                    // Fallback to coordinates if geocoding fails
                    const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    setCurrentLocation(address);
                    onLocationSet({
                        lat: latitude,
                        lng: longitude,
                        address: address
                    });
                }
                
                setIsLoading(false);
            },
            (error) => {
                setIsLoading(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setError('Location access denied by user.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setError('Location information is unavailable.');
                        break;
                    case error.TIMEOUT:
                        setError('Location request timed out.');
                        break;
                    default:
                        setError('An unknown error occurred while retrieving location.');
                        break;
                }
            },
            options
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] ">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-orange to-orange-500 px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <MapPinIcon className="h-6 w-6 text-white" />
                        <h2 className="text-xl font-bold text-white">Set Your Location</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    <div className="text-center mb-6">
                        <div className="mb-4">
                            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                <MapPinIcon className="h-8 w-8 text-brand-orange" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Welcome Back!
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                To provide the best service to your clients, please update your current location. 
                                This helps customers find therapists near them.
                            </p>
                        </div>

                        {currentLocation && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-green-800">
                                    <span className="font-medium">Current Location:</span><br />
                                    {currentLocation}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={getCurrentLocation}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-brand-orange to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Getting Location...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <MapPinIcon className="h-4 w-4" />
                                    <span>Use Current Location</span>
                                </div>
                            )}
                        </Button>

                        <button
                            onClick={onSkip}
                            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors duration-300 border border-gray-200 hover:border-gray-300"
                        >
                            Skip for Now
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-400">
                            Location will be requested again on your next login
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPopup;
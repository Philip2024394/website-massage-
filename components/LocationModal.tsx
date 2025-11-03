import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import type { UserLocation } from '../types';

interface LocationModalProps {
    onConfirm: (location: UserLocation) => void;
    onClose: () => void;
    t: any;
}

const LocationModal: React.FC<LocationModalProps> = ({ onConfirm, onClose, t }) => {
    const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);

    // Debug logging for LocationModal translations
    console.log('🗺️ LocationModal received translations:', {
        t,
        tExists: !!t,
        tKeys: t ? Object.keys(t) : 'No t',
        fullStructure: t
    });

    // Improved translation handling to prevent flashing
    const getSafeTranslation = (key: string, fallback: string): string => {
        if (t && typeof t === 'object' && t[key]) {
            return t[key];
        }
        return fallback;
    };

    // Safety fallback for translations with proper mapping  
    const safeT = {
        title: getSafeTranslation('title', 'Atur Lokasi Anda'),
        prompt: getSafeTranslation('prompt', 'Kami memerlukan lokasi Anda untuk menemukan layanan terbaik di dekat Anda.'),
        searchPlaceholder: getSafeTranslation('placeholder', 'Masukkan alamat Anda atau atur di peta'),
        detectingLocation: getSafeTranslation('detectingLocation', 'Mendeteksi lokasi Anda...'),
        useCurrentLocation: getSafeTranslation('useCurrentLocationButton', 'Gunakan Lokasi Saya Saat Ini'),
        searchLocation: getSafeTranslation('searchLocation', 'Cari Lokasi'),
        confirm: getSafeTranslation('confirmButton', 'Konfirmasi Lokasi'),
        locationError: getSafeTranslation('locationError', 'Tidak dapat mendeteksi lokasi'),
        selectLocation: getSafeTranslation('selectLocation', 'Silakan pilih lokasi')
    };

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
                setMapsApiLoaded(true);
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);
    
    useEffect(() => {
        if (mapsApiLoaded && inputRef.current) {
            const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
                types: ['address'],
                componentRestrictions: { country: 'id' },
            });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry && place.geometry.location) {
                    const location = {
                        address: place.formatted_address || '',
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    };
                    setSelectedLocation(location);
                    setError('');
                }
            });
        }
    }, [mapsApiLoaded]);
    
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }
        
        // Check if Google Maps is loaded
        if (!(window as any).google || !(window as any).google.maps) {
            setError('Google Maps is loading... Please try again in a moment.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const geocoder = new (window as any).google.maps.Geocoder();
                geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any, status: string) => {
                    setIsLoading(false);
                    if (status === 'OK' && results[0]) {
                        const location = {
                            address: results[0].formatted_address,
                            lat: latitude,
                            lng: longitude,
                        };
                        setSelectedLocation(location);
                        if (inputRef.current) {
                            inputRef.current.value = location.address;
                        }
                    } else {
                        setError('Could not determine address from location.');
                    }
                });
            },
            () => {
                setIsLoading(false);
                setError('Unable to retrieve your location. Please enable location permissions.');
            }
        );
    };

    const handleConfirm = () => {
        if (selectedLocation) {
            onConfirm(selectedLocation);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{safeT.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-gray-600 mb-4 text-center">{safeT.prompt}</p>

                {/* World Map with Pulsing Red Dot */}
                <div className="relative h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/indostreet%20world%20map.png?updatedAt=1761327681427"
                        alt="World Map"
                        className="w-full h-full object-cover"
                    />
                    {/* Pulsing Red Dot with Satellite Signal Effect - Moved down 40px */}
                    <div className="absolute left-1/2 transform -translate-x-1/2" style={{ top: 'calc(50% + 40px)', transform: 'translate(-50%, -50%)' }}>
                        {/* Outer pulsing circle - satellite signal */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-16 h-16 bg-red-500 rounded-full opacity-30 animate-ping"></div>
                        </div>
                        {/* Middle pulsing circle */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-10 h-10 bg-red-500 rounded-full opacity-50 animate-pulse"></div>
                        </div>
                        {/* Inner solid red dot */}
                        <div className="w-4 h-4 bg-red-600 rounded-full shadow-lg"></div>
                    </div>
                </div>

                <div className="mb-4">
                     <input 
                        ref={inputRef}
                        type="text" 
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green"
                        placeholder={safeT.searchPlaceholder}
                        disabled={!mapsApiLoaded || isLoading}
                    />
                </div>
                
                <Button 
                    onClick={handleUseCurrentLocation} 
                    variant="primary" 
                    disabled={isLoading} 
                    className="text-sm py-2.5 bg-green-600 hover:bg-green-700 text-white"
                >
                    {isLoading ? (safeT.detectingLocation || 'Mendeteksi lokasi...') : safeT.useCurrentLocation}
                </Button>
                
                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

                <Button onClick={handleConfirm} disabled={!selectedLocation} className="mt-4">
                    {safeT.confirm}
                </Button>
            </div>
        </div>
    );
};

export default LocationModal;

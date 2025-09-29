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

    const inputRef = useRef<HTMLInputElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);

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
        if (mapsApiLoaded && mapRef.current && !mapInstance.current) {
            const defaultCenter = { lat: -2.548926, lng: 118.0148634 };
            mapInstance.current = new (window as any).google.maps.Map(mapRef.current, {
                center: defaultCenter,
                zoom: 5,
                disableDefaultUI: true,
            });
            markerInstance.current = new (window as any).google.maps.Marker({
                map: mapInstance.current,
                position: defaultCenter,
            });
            markerInstance.current.setVisible(false);
        }
    }, [mapsApiLoaded]);
    
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
                    updateMap(location.lat, location.lng);
                    setError('');
                }
            });
        }
    }, [mapsApiLoaded]);

    const updateMap = (lat: number, lng: number) => {
        if (mapInstance.current && markerInstance.current) {
            const newPos = { lat, lng };
            mapInstance.current.setCenter(newPos);
            mapInstance.current.setZoom(15);
            markerInstance.current.setPosition(newPos);
            markerInstance.current.setVisible(true);
        }
    };
    
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
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
                        updateMap(location.lat, location.lng);
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
                    <h2 className="text-xl font-bold text-gray-800">{t.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-gray-600 mb-4 text-center">{t.prompt}</p>

                <div ref={mapRef} className="h-48 bg-gray-200 rounded-lg mb-4"></div>

                <div className="mb-4">
                     <input 
                        ref={inputRef}
                        type="text" 
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green"
                        placeholder={t.placeholder}
                        disabled={!mapsApiLoaded || isLoading}
                    />
                </div>
                
                <Button onClick={handleUseCurrentLocation} variant="secondary" disabled={isLoading} className="text-sm py-2.5">
                    {isLoading ? 'Getting Location...' : (t.useCurrentLocationButton || 'Use My Current Location')}
                </Button>
                
                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

                <Button onClick={handleConfirm} disabled={!selectedLocation} className="mt-4">
                    {t.confirmButton}
                </Button>
            </div>
        </div>
    );
};

export default LocationModal;

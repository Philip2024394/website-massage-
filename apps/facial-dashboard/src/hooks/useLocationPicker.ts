/**
 * useLocationPicker Hook
 * Handles Google Maps integration, geolocation, and city matching
 * Max size: 8KB (Facebook/Amazon standard)
 */

import { useState, useCallback } from 'react';
import { matchProviderToCity } from '../../../../constants/indonesianCities';

interface Coordinates {
  lat: number;
  lng: number;
}

interface UseLocationPickerProps {
  location: string;
  setLocation: (location: string) => void;
  coordinates: Coordinates;
  setCoordinates: (coords: Coordinates) => void;
  isLocationManuallyEdited: boolean;
  setIsLocationManuallyEdited: (edited: boolean) => void;
  mapsApiLoaded: boolean;
  setMapsApiLoaded: (loaded: boolean) => void;
  locationInputRef: React.RefObject<HTMLInputElement>;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

export const useLocationPicker = ({
  location: _location,
  setLocation,
  coordinates,
  setCoordinates,
  isLocationManuallyEdited,
  setIsLocationManuallyEdited,
  mapsApiLoaded,
  setMapsApiLoaded,
  locationInputRef,
  selectedCity,
  setSelectedCity,
}: UseLocationPickerProps) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const proceedWithLocation = useCallback(() => {
    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoordinates(newCoords);

        // Use Google Maps Geocoding API to get address
        const geocoder = new (window as any).google.maps.Geocoder();
        const latLng = new (window as any).google.maps.LatLng(latitude, longitude);

        geocoder.geocode({ location: latLng }, (results: any[], status: string) => {
          setIsGettingLocation(false);

          if (status === 'OK' && results && results[0]) {
            const address = results[0].formatted_address;
            if (!isLocationManuallyEdited) {
              setLocation(address);
            }

            // Auto-detect city
            const matchedCity = matchProviderToCity(newCoords, 25);
            if (matchedCity && !selectedCity) {
              setSelectedCity(matchedCity.name);
            }

            // Initialize Google Places Autocomplete
            if (locationInputRef.current) {
              const autocomplete = new (window as any).google.maps.places.Autocomplete(
                locationInputRef.current,
                {
                  types: ['geocode'],
                  componentRestrictions: { country: 'id' },
                }
              );

              autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry) {
                  const newLat = place.geometry.location.lat();
                  const newLng = place.geometry.location.lng();
                  setCoordinates({ lat: newLat, lng: newLng });
                  setLocation(place.formatted_address || place.name);
                  setIsLocationManuallyEdited(true);

                  // Update city based on new coordinates
                  const newMatchedCity = matchProviderToCity({ lat: newLat, lng: newLng }, 25);
                  if (newMatchedCity) {
                    setSelectedCity(newMatchedCity.name);
                  }
                }
              });
            }
          } else {
            console.error('Geocoding failed:', status);
            alert('Could not retrieve address. Please try again.');
          }
        });
      },
      (error) => {
        setIsGettingLocation(false);
        console.error('Geolocation error:', error);
        
        let errorMessage = 'Unable to get your location. ';
        if (error.code === 1) {
          errorMessage += 'Please enable location permissions in your browser settings.';
        } else if (error.code === 2) {
          errorMessage += 'Location unavailable. Please try again.';
        } else if (error.code === 3) {
          errorMessage += 'Request timed out. Please try again.';
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [
    coordinates,
    setCoordinates,
    isLocationManuallyEdited,
    setLocation,
    setIsLocationManuallyEdited,
    locationInputRef,
    selectedCity,
    setSelectedCity,
  ]);

  const handleSetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    if (!mapsApiLoaded || !(window as any).google || !(window as any).google.maps) {
      setIsGettingLocation(true);
      
      let attempts = 0;
      const maxAttempts = 3;
      
      const waitForMaps = setInterval(() => {
        attempts++;
        if ((window as any).google && (window as any).google.maps) {
          clearInterval(waitForMaps);
          setMapsApiLoaded(true);
          proceedWithLocation();
        } else if (attempts >= maxAttempts) {
          clearInterval(waitForMaps);
          setIsGettingLocation(false);
          alert('Google Maps is still loading. Please try again in a moment.');
        }
      }, 1000);
      
      return;
    }

    proceedWithLocation();
  }, [mapsApiLoaded, setMapsApiLoaded, proceedWithLocation]);

  return {
    isGettingLocation,
    handleSetLocation,
  };
};

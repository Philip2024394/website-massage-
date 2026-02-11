import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { currencyService } from '../lib/currencyService';
import { ipGeolocationService, GeolocationResult } from '../lib/ipGeolocationService';
import { StoredUserLocation, loadUserLocation, saveUserLocation, clearUserLocation } from '../utils/userLocationStore';
import { convertLocationStringToId } from '../utils/locationNormalizationV2';

/**
 * CityContext - Smart location management with auto-detection
 * 
 * Architecture:
 * - Auto-detects country via IP (priority: saved > IP > default)
 * - City selection required (country auto-detected)
 * - City + Country persisted in user preferences
 * - Country selection automatically updates currency and language
 * - Manual country override available
 * - All data queries scoped to active city
 */

interface ConfirmLocationInput {
  cityId?: string;
  cityName: string;
  latitude?: number | null;
  longitude?: number | null;
  locationText?: string | null;
}

interface CityContextValue {
  country: string;
  countryCode: string;
  city: string | null;
  hasSelectedCity: boolean;
  hasConfirmedCity: boolean;
  confirmedLocation: StoredUserLocation | null;
  autoDetected: boolean;
  detectionMethod: 'saved' | 'ip' | 'manual' | 'default' | 'nearest';
  locationResult: GeolocationResult | null; // Full location data including nearest country info
  setCity: (city: string) => void;
  setCountry: (countryCode: string, savePreference?: boolean) => void;
  confirmLocation: (input: ConfirmLocationInput) => void;
  clearConfirmedLocation: () => void;
  clearCity: () => void;
  clearCountry: () => void;
  isLoading: boolean;
}

const CityContext = createContext<CityContextValue | undefined>(undefined);

export const CityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const savedLocation = loadUserLocation();
  const [city, setCityState] = useState<string | null>(savedLocation?.cityName ?? null);
  const [countryCode, setCountryCodeState] = useState<string>('ID');
  const [autoDetected, setAutoDetected] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState<'saved' | 'ip' | 'manual' | 'default' | 'nearest'>('default');
  const [locationResult, setLocationResult] = useState<GeolocationResult | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState<StoredUserLocation | null>(savedLocation);
  const [isLoading, setIsLoading] = useState(true);
  const hasConfirmedCity = !!confirmedLocation;

  // Auto-detect country on mount
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        // Get user location (saved > IP > default)
        const location: GeolocationResult = await ipGeolocationService.getUserLocation();
        
        console.log('📍 CityContext: Location initialized:', location);
        
        // Batch all state updates together to prevent multiple re-renders
        // React 18+ automatically batches these updates
        setLocationResult(location);
        setCountryCodeState(location.countryCode);
        setAutoDetected(location.detected);
        setDetectionMethod(location.method);
        if (!confirmedLocation && location.city) {
          setCityState(location.city);
        }
        setIsLoading(false);
        
        // Update currency service after state updates to prevent additional re-renders
        currencyService.setCountry(location.countryCode);
        
      } catch (error) {
        console.error('❌ CityContext: Failed to initialize location:', error);
        // Fallback to Indonesia - batch updates
        setCountryCodeState('ID');
        setDetectionMethod('default');
        setLocationResult(null);
        setIsLoading(false);
        currencyService.setCountry('ID');
      }
    };

    initializeLocation();
  }, [confirmedLocation]);

  // Set city
  const handleSetCity = (newCity: string) => {
    console.log('📍 CityContext: Setting city to:', newCity);
    console.log('📍 CityContext: Previous city was:', city);
    
    // ✅ CRITICAL FIX: Clear stale localStorage cache first
    // This prevents "Nearby in bandung" showing when "yogyakarta" is selected
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('user_location_preference');
        console.log('🗑️ CityContext: Cleared stale localStorage cache');
      } catch {
        // ignore storage failures (private mode, etc.)
      }
    }
    
    setCityState(newCity);
    setDetectionMethod('manual');
  };

  // Set country (with optional preference saving)
  const handleSetCountry = (newCountryCode: string, savePreference: boolean = true) => {
    console.log('📍 CityContext: Setting country to:', newCountryCode);
    setCountryCodeState(newCountryCode);
    currencyService.setCountry(newCountryCode);
    setDetectionMethod('manual');
    
    // Save preference if requested
    if (savePreference) {
      ipGeolocationService.saveLocation(newCountryCode, city || undefined);
    }
  };

  const handleConfirmLocation = (input: ConfirmLocationInput) => {
    const cityName = input.cityName?.trim();
    if (!cityName) {
      console.warn('⚠️ confirmLocation called without cityName');
      return;
    }

    const cityId = convertLocationStringToId(input.cityId || cityName);
    const normalized: StoredUserLocation = {
      cityId,
      cityName,
      latitude: typeof input.latitude === 'number' ? input.latitude : null,
      longitude: typeof input.longitude === 'number' ? input.longitude : null,
      locationText: input.locationText ?? null,
      confirmedAt: new Date().toISOString()
    };

    setCityState(cityName);
    setConfirmedLocation(normalized);
    saveUserLocation(normalized);
    ipGeolocationService.saveLocation(countryCode, cityName);
    setDetectionMethod('manual');
    setAutoDetected(false);
  };

  const handleClearConfirmedLocation = () => {
    setConfirmedLocation(null);
    clearUserLocation();
  };

  // Clear city
  const clearCity = () => {
    console.log('📍 CityContext: Clearing city selection');
    setCityState(null);
    handleClearConfirmedLocation();
  };

  // Clear country (reset to IP detection)
  const clearCountry = async () => {
    console.log('📍 CityContext: Resetting country to auto-detect');
    ipGeolocationService.clearSavedLocation();
    
    // Re-detect
    try {
      const location = await ipGeolocationService.getUserLocation();
      setCountryCodeState(location.countryCode);
      setAutoDetected(location.detected);
      setDetectionMethod(location.method);
      currencyService.setCountry(location.countryCode);
      setCityState(null); // Clear city when country changes
      handleClearConfirmedLocation();
    } catch (error) {
      console.error('Failed to re-detect country:', error);
    }
  };

  // Map country code to country name
  const getCountryName = (code: string): string => {
    const countryNames: Record<string, string> = {
      ID: 'Indonesia',
      MY: 'Malaysia',
      SG: 'Singapore',
      TH: 'Thailand',
      PH: 'Philippines',
      VN: 'Vietnam',
      GB: 'United Kingdom',
      US: 'United States',
      AU: 'Australia',
      DE: 'Germany'
    };
    return countryNames[code] || 'Indonesia';
  };

  const value: CityContextValue = {
    country: getCountryName(countryCode),
    countryCode,
    city,
    hasSelectedCity: !!city,
    hasConfirmedCity,
    confirmedLocation,
    autoDetected,
    detectionMethod,
    locationResult,
    setCity: handleSetCity,
    setCountry: handleSetCountry,
    confirmLocation: handleConfirmLocation,
    clearConfirmedLocation: handleClearConfirmedLocation,
    clearCity,
    clearCountry,
    isLoading,
  };

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

export const useCityContext = (): CityContextValue => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCityContext must be used within CityProvider');
  }
  return context;
};

// Hook to require city selection (for use in pages)
export const useRequireCity = (): { city: string; country: string } => {
  const { city, country, hasConfirmedCity } = useCityContext();
  
  if (!hasConfirmedCity || !city) {
    throw new Error('Confirmed city required but not available');
  }
  
  return { city, country };
};

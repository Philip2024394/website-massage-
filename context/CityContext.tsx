import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { currencyService } from '../src/lib/currencyService';
import { ipGeolocationService, GeolocationResult } from '../src/lib/ipGeolocationService';

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

interface CityContextValue {
  country: string;
  countryCode: string;
  city: string | null;
  hasSelectedCity: boolean;
  autoDetected: boolean;
  detectionMethod: 'saved' | 'ip' | 'manual' | 'default';
  setCity: (city: string) => void;
  setCountry: (countryCode: string, savePreference?: boolean) => void;
  clearCity: () => void;
  clearCountry: () => void;
  isLoading: boolean;
}

const CityContext = createContext<CityContextValue | undefined>(undefined);

export const CityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [city, setCity] = useState<string | null>(null);
  const [countryCode, setCountryCodeState] = useState<string>('ID');
  const [autoDetected, setAutoDetected] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState<'saved' | 'ip' | 'manual' | 'default'>('default');
  const [isLoading, setIsLoading] = useState(true);

  // Auto-detect country on mount
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        // Get user location (saved > IP > default)
        const location: GeolocationResult = await ipGeolocationService.getUserLocation();
        
        console.log('📍 CityContext: Location initialized:', location);
        
        // Batch all state updates together to prevent multiple re-renders
        // React 18+ automatically batches these updates
        setCountryCodeState(location.countryCode);
        setAutoDetected(location.detected);
        setDetectionMethod(location.method);
        if (location.city) {
          setCity(location.city);
        }
        setIsLoading(false);
        
        // Update currency service after state updates to prevent additional re-renders
        currencyService.setCountry(location.countryCode);
        
      } catch (error) {
        console.error('❌ CityContext: Failed to initialize location:', error);
        // Fallback to Indonesia - batch updates
        setCountryCodeState('ID');
        setDetectionMethod('default');
        setIsLoading(false);
        currencyService.setCountry('ID');
      }
    };

    initializeLocation();
  }, []);

  // Set city
  const handleSetCity = (newCity: string) => {
    console.log('📍 CityContext: Setting city to:', newCity);
    console.log('📍 CityContext: Previous city was:', city);
    
    // ✅ CRITICAL FIX: Clear stale localStorage cache first
    // This prevents "Nearby in bandung" showing when "yogyakarta" is selected
    localStorage.removeItem('user_location_preference');
    console.log('🗑️ CityContext: Cleared stale localStorage cache');
    
    setCity(newCity);
    
    // Save complete location preference to localStorage
    ipGeolocationService.saveLocation(countryCode, newCity);
    console.log('✅ CityContext: City saved to localStorage:', newCity);
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

  // Clear city
  const clearCity = () => {
    console.log('📍 CityContext: Clearing city selection');
    setCity(null);
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
      setCity(null); // Clear city when country changes
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
    autoDetected,
    detectionMethod,
    setCity: handleSetCity,
    setCountry: handleSetCountry,
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
  const { city, country, hasSelectedCity } = useCityContext();
  
  if (!hasSelectedCity || !city) {
    throw new Error('City selection required but not available');
  }
  
  return { city, country };
};

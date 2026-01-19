import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { locationService } from '../services/locationService';
import { deviceService } from '../services/deviceService';
import PageNumberBadge from '../components/PageNumberBadge';
import PWAInstallIOSModal from '../components/PWAInstallIOSModal';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { MapPin, Play, Globe, Search, X, ChevronDown } from 'lucide-react';
import { useCityContext } from '../context/CityContext';
import UniversalHeader from '../components/shared/UniversalHeader';
import { loadLanguageResources } from '../lib/i18n';
import { ipGeolocationService } from '../lib/ipGeolocationService';
import type { UserLocation } from '../types';
import type { Language } from '../types/pageTypes';

interface LandingPageProps {
    onLanguageSelect?: (lang: Language) => void;
    onEnterApp?: (language: Language, location: UserLocation) => void;
    handleEnterApp?: (lang: Language, location: UserLocation) => Promise<void>;
    handleLanguageSelect?: (lang: Language) => Promise<void>;
    language?: Language;
    onLanguageChange?: (lang: Language) => void;
}

const imageSrc = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?updatedAt=1761978080830';

// Multi-country data for location selectors with native language mapping
const COUNTRIES = [
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', description: 'Southeast Asian archipelago', language: 'id' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', description: 'Peninsula and Borneo', language: 'ms' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', description: 'City-state island nation', language: 'en' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', description: 'Land of smiles', language: 'th' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', description: 'Pearl of the Orient Seas', language: 'tl' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', description: 'S-shaped country', language: 'vi' },
];

interface CityOption {
  name: string;
  region: string;
  description: string;
  popular: boolean;
  country: string;
}

const CITIES_BY_COUNTRY: Record<string, CityOption[]> = {
  ID: [
    { name: 'Jakarta', region: 'DKI Jakarta', description: 'Capital of Indonesia', popular: true, country: 'ID' },
    { name: 'Canggu', region: 'Bali', description: 'Surfing & digital nomad hub', popular: true, country: 'ID' },
    { name: 'Seminyak', region: 'Bali', description: 'Luxury beach resort area', popular: true, country: 'ID' },
    { name: 'Kuta', region: 'Bali', description: 'Famous beach & nightlife', popular: true, country: 'ID' },
    { name: 'Ubud', region: 'Bali', description: 'Cultural heart of Bali', popular: true, country: 'ID' },
    { name: 'Sanur', region: 'Bali', description: 'Relaxed beachside town', popular: true, country: 'ID' },
    { name: 'Denpasar', region: 'Bali', description: 'Capital of Bali', popular: true, country: 'ID' },
    { name: 'Yogyakarta', region: 'DI Yogyakarta', description: 'Cultural & historical city', popular: true, country: 'ID' },
    { name: 'Bandung', region: 'West Java', description: 'Cool mountain city', popular: true, country: 'ID' },
    { name: 'Surabaya', region: 'East Java', description: 'Second largest city', popular: true, country: 'ID' },
  ],
  MY: [
    { name: 'Kuala Lumpur', region: 'Federal Territory', description: 'Capital of Malaysia', popular: true, country: 'MY' },
    { name: 'Penang', region: 'Penang', description: 'Pearl of the Orient', popular: true, country: 'MY' },
    { name: 'Johor Bahru', region: 'Johor', description: 'Southern gateway', popular: true, country: 'MY' },
    { name: 'Langkawi', region: 'Kedah', description: 'Tropical island paradise', popular: true, country: 'MY' },
  ],
  SG: [
    { name: 'Singapore', region: 'Singapore', description: 'City-state nation', popular: true, country: 'SG' },
  ],
  TH: [
    { name: 'Bangkok', region: 'Bangkok', description: 'Capital of Thailand', popular: true, country: 'TH' },
    { name: 'Phuket', region: 'Phuket', description: 'Famous beach destination', popular: true, country: 'TH' },
    { name: 'Pattaya', region: 'Chonburi', description: 'Beach resort city', popular: true, country: 'TH' },
    { name: 'Chiang Mai', region: 'Chiang Mai', description: 'Northern cultural hub', popular: true, country: 'TH' },
  ],
  PH: [
    { name: 'Manila', region: 'Metro Manila', description: 'Capital of Philippines', popular: true, country: 'PH' },
    { name: 'Cebu City', region: 'Cebu', description: 'Queen City of the South', popular: true, country: 'PH' },
    { name: 'Boracay', region: 'Aklan', description: 'World-famous beach island', popular: true, country: 'PH' },
  ],
  VN: [
    { name: 'Ho Chi Minh City', region: 'Ho Chi Minh', description: 'Economic center', popular: true, country: 'VN' },
    { name: 'Hanoi', region: 'Hanoi', description: 'Capital of Vietnam', popular: true, country: 'VN' },
    { name: 'Da Nang', region: 'Da Nang', description: 'Coastal city', popular: true, country: 'VN' },
  ]
};

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, handleEnterApp, onLanguageSelect, handleLanguageSelect, language = 'id', onLanguageChange }) => {
    console.log('🎬 LandingPage component mounted');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<Language>(language);
    const defaultLanguage: Language = 'id';
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const { requestInstall, isInstalled, isIOS, showIOSInstructions, setShowIOSInstructions } = usePWAInstall();
    const isMountedRef = React.useRef(true);
    
    // Location state - now using auto-detected country
    const { city: contextCity, countryCode, autoDetected, detectionMethod, setCity, setCountry, clearCountry } = useCityContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState<string | null>(contextCity || null);
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [cityNotListed, setCityNotListed] = useState(false);
    
    // Use either prop name for backward compatibility
    const enterAppCallback = handleEnterApp || onEnterApp;
    const selectLanguage = handleLanguageSelect || onLanguageSelect;

    // Handle language change
    const handleLanguageToggle = (newLang: Language) => {
        console.log('🌐 Language changed to:', newLang);
        setCurrentLanguage(newLang);
        
        if (onLanguageChange) {
            onLanguageChange(newLang);
        }
        
        if (selectLanguage) {
            selectLanguage(newLang);
        }
    };

    // Track component mount status
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Auto-detect location on component mount for mobile devices
    useEffect(() => {
        const autoDetectLocation = async () => {
            const deviceInfo = deviceService.getDeviceInfo();
            
            if (deviceInfo.type === 'mobile' && deviceInfo.supportsGPS) {
                try {
                    await locationService.requestLocationWithFallback();
                } catch (error) {
                    console.warn('⚠️ Failed to pre-load location:', error);
                }
            }
        };
        
        const timer = setTimeout(autoDetectLocation, 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => setImageLoaded(true);
        img.onerror = () => setImageLoaded(true);
    }, []);

    const handleEnterClick = async () => {
        if (isDetectingLocation) return;
        if (!isMountedRef.current) return;
        
        // If no city selected, do nothing (button should be disabled)
        if (!selectedCity) {
            console.log('⚠️ No city selected - cannot proceed');
            return;
        }
        
        setIsDetectingLocation(true);
        
        try {
            // First, try the provided callback
            if (enterAppCallback) {
                console.log('🚀 Using provided enterApp callback');
                const userLocation = await locationService.requestLocationWithFallback();
                if (!isMountedRef.current) return;
                await enterAppCallback(defaultLanguage, userLocation);
                return;
            }
            
            // Fallback: Direct navigation to home page
            console.log('🚀 Using fallback navigation to home');
            
            // If we have an onNavigate prop, use it
            if (selectLanguage || (window as any).setPage) {
                const userLocation = await locationService.requestLocationWithFallback();
                if (!isMountedRef.current) return;
                
                // Set language if possible
                if (selectLanguage) {
                    await selectLanguage(defaultLanguage);
                }
                
                // Navigate to home page
                if ((window as any).setPage) {
                    console.log('🚀 Navigating to home via global setPage');
                    (window as any).setPage('home');
                } else {
                    // Final fallback - redirect via URL
                    console.log('🚀 Fallback: Redirecting to /home');
                    window.location.href = '/home';
                }
                return;
            }
            
            // Final fallback - URL redirect
            console.log('🚀 Final fallback: URL redirect');
            window.location.href = '/home';
            
        } catch (error) {
            console.error('❌ Failed to handle enter click:', error);
            
            // Emergency fallback
            console.log('🚀 Emergency fallback: Direct URL navigation');
            window.location.href = '/home';
        } finally {
            // Don't reset loading state if component is unmounting
            if (isMountedRef.current) {
                setIsDetectingLocation(false);
            }
        }
    };

    // Location selector handlers - NEW UX: Only city selection, country auto-detected
    const handleCitySelectNew = async (city: CityOption) => {
        setSelectedCity(city.name);
        setCity(city.name);
        setSearchQuery('');
        
        console.log('📍 City selected:', city.name, 'in country:', city.country);
        
        // Auto-set language based on city's country
        const selectedCountryInfo = COUNTRIES.find(c => c.code === city.country);
        if (selectedCountryInfo && selectedCountryInfo.language !== currentLanguage) {
            console.log('🌍 Auto-switching to country language:', selectedCountryInfo.language);
            
            try {
                const newLang = selectedCountryInfo.language;
                
                // Load language resources
                await loadLanguageResources(newLang);
                
                // Change language
                handleLanguageToggle(newLang as Language);
                
                console.log('✅ Language auto-switched to:', newLang);
            } catch (error) {
                console.warn('⚠️ Language auto-switch failed, using English:', error);
                handleLanguageToggle('en');
            }
        }
        
        // Update country in context
        setCountry(city.country, false);
        
        console.log('📍 Navigating to home page...');
        
        // Small delay to show selection feedback
        setTimeout(async () => {
            try {
                // Try the provided callback first
                if (enterAppCallback) {
                    console.log('🚀 Using provided enterApp callback');
                    const userLocation = await locationService.requestLocationWithFallback();
                    await enterAppCallback(defaultLanguage, userLocation);
                    return;
                }
                
                // Fallback navigation methods
                if (selectLanguage || (window as any).setPage) {
                    if (selectLanguage) {
                        await selectLanguage(defaultLanguage);
                    }
                    
                    if ((window as any).setPage) {
                        console.log('🚀 Navigating to home via global setPage');
                        (window as any).setPage('home');
                        // Scroll to top to show therapist cards immediately
                        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                    } else {
                        console.log('🚀 Redirecting to /home');
                        window.location.href = '/home';
                    }
                    return;
                }
                
                // Final fallback - URL redirect
                console.log('🚀 Final fallback: URL redirect to home');
                window.location.href = '/home';
                
            } catch (error) {
                console.error('❌ Failed to navigate to home:', error);
                window.location.href = '/home';
            }
        }, 300);
    };
    
    // Handle manual country change via modal
    const handleManualCountrySelect = async (newCountryCode: string) => {
        const selectedCountryInfo = COUNTRIES.find(c => c.code === newCountryCode);
        
        setShowCountryModal(false);
        setSelectedCity(null);
        setSearchQuery('');
        
        // Update country in context (this will auto-update currency via CityContext)
        setCountry(newCountryCode, true); // Save preference
        console.log('🌍 Country manually changed to:', newCountryCode, '- Currency auto-updated');
        
        // Auto-translate to country's language (instant with English fallback)
        if (selectedCountryInfo && selectedCountryInfo.language !== currentLanguage) {
            console.log('🌍 Switching to:', selectedCountryInfo.language);
            
            try {
                const newLang = selectedCountryInfo.language;
                
                // Load language resources (instant with fallback)
                await loadLanguageResources(newLang);
                
                // Change language immediately
                handleLanguageToggle(newLang as Language);
                
                console.log('✅ Language switched to:', newLang);
            } catch (error) {
                console.warn('⚠️ Language switch failed, using English:', error);
                // Fallback to English
                handleLanguageToggle('en');
            }
        }
    };

    // Handle "My city is not listed" - use GPS to auto-detect user's actual location
    const handleCityNotListed = async () => {
        console.log('📍 City not listed - requesting GPS to auto-detect location...');
        setCityNotListed(true);
        setIsDetectingLocation(true);
        
        try {
            // Request GPS permission and get precise location
            console.log('🎯 Requesting GPS location...');
            const gpsLocation = await locationService.getCurrentLocation();
            
            // Extract city name from the GPS address
            const addressParts = gpsLocation.address.split(',');
            let detectedCity = addressParts[0].trim(); // Usually city is first part
            
            // If address has multiple parts, try to find the city (usually first or second part)
            if (addressParts.length > 1) {
                // Remove postal code and country from city name if present
                detectedCity = addressParts
                    .slice(0, 2) // Take first 2 parts (usually street/area and city)
                    .find(part => !part.match(/^\d{5}/) && part.length > 2) || addressParts[0];
                detectedCity = detectedCity.trim();
            }
            
            console.log('📍 GPS detected city:', detectedCity);
            console.log('📍 Full address:', gpsLocation.address);
            
            // Save the detected city
            setSelectedCity(detectedCity);
            setCity(detectedCity);
            
            // Small delay to show feedback
            setTimeout(async () => {
                // Navigate to home page
                try {
                    if (enterAppCallback) {
                        console.log('🚀 Using provided enterApp callback with GPS location');
                        await enterAppCallback(defaultLanguage, gpsLocation);
                        return;
                    }
                    
                    if (selectLanguage || (window as any).setPage) {
                        if (selectLanguage) {
                            await selectLanguage(defaultLanguage);
                        }
                        
                        if ((window as any).setPage) {
                            console.log('🚀 Navigating to home via global setPage');
                            (window as any).setPage('home');
                            // Scroll to top to show therapist cards immediately
                            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                        } else {
                            console.log('🚀 Redirecting to /home');
                            window.location.href = '/home';
                        }
                        return;
                    }
                    
                    // Final fallback - URL redirect
                    console.log('🚀 Final fallback: URL redirect to home');
                    window.location.href = '/home';
                    
                } catch (error) {
                    console.error('❌ Failed to navigate to home:', error);
                    window.location.href = '/home';
                }
            }, 500);
            
        } catch (error) {
            console.error('❌ GPS detection failed:', error);
            
            // Fallback: Navigate to home without specific city
            alert('Unable to detect your location. You\'ll see all available therapists.');
            
            try {
                if (enterAppCallback) {
                    const fallbackLocation = await locationService.requestLocationWithFallback();
                    await enterAppCallback(defaultLanguage, fallbackLocation);
                    return;
                }
                
                if ((window as any).setPage) {
                    (window as any).setPage('home');
                } else {
                    window.location.href = '/home';
                }
            } catch (navError) {
                console.error('❌ Navigation failed:', navError);
                window.location.href = '/home';
            }
        } finally {
            if (isMountedRef.current) {
                setIsDetectingLocation(false);
            }
        }
    };

    
    // Get cities for the currently detected/selected country
    const availableCities = CITIES_BY_COUNTRY[countryCode] || [];
    const filteredCities = searchQuery.trim()
        ? availableCities.filter(city =>
            city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city.region.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : availableCities;
    const currentCountryData = COUNTRIES.find(c => c.code === countryCode);

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-gray-900 overflow-auto">
            <PageNumberBadge pageNumber={1} pageName="LandingPage" />
            <div
                className="absolute inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out"
                style={{
                    backgroundImage: `url('${imageSrc}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    opacity: 1, // Always visible for debugging
                }}
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/60 pointer-events-none" />
            <div 
                className="relative z-20 flex flex-col items-center justify-start text-white px-4 sm:px-6 text-center w-full py-4 sm:py-8 pt-8 sm:pt-16 pb-4 sm:pb-8"
                style={{ opacity: 1, minHeight: '100vh' }} // Always visible for debugging
            >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
                    <span className="text-white">Inda</span><span className="text-orange-400">street</span>
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-8">
                    {currentCountryData?.name === 'Philippines' 
                        ? `${currentCountryData?.name}' Massage Hub`
                        : `${currentCountryData?.name}'s Massage Hub`
                    }
                </p>
                
                {/* Location Selector - NEW UX: Auto-detected country, city selection only */}
                <div className="w-full max-w-2xl px-2 sm:px-4 mb-6">
                    <div className="bg-black/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-xl">
                        {/* Auto-detected Country Header */}
                        <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="text-xl sm:text-2xl">{currentCountryData?.flag}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-white text-sm sm:text-base">{currentCountryData?.name}</h3>
                                            {autoDetected && (
                                                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white whitespace-nowrap">
                                                    {detectionMethod === 'ip' ? '📍 Auto-detected' : '✓ Saved'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-orange-100 mt-1">Select your city to continue</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCountryModal(true)}
                                    className="text-xs text-white hover:text-orange-200 underline font-medium whitespace-nowrap"
                                >
                                    Change country
                                </button>
                            </div>
                        </div>

                        {/* Search Box */}
                        <div className="mb-4 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search city in ${currentCountryData?.name}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-white placeholder-gray-400"
                            />
                        </div>

                        {/* Cities List */}
                        <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-700">
                            {filteredCities.length > 0 ? (
                                <>
                                    {filteredCities.map((city, index) => (
                                        <button
                                            key={`${city.name}-${index}`}
                                            onClick={() => handleCitySelectNew(city)}
                                            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                                                selectedCity === city.name
                                                    ? "border-orange-500 bg-orange-500 text-white shadow-lg"
                                                    : "border-gray-600 bg-gray-800 hover:border-orange-400 hover:bg-gray-700 text-white"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <MapPin className={`w-4 h-4 flex-shrink-0 ${
                                                    selectedCity === city.name ? "text-white" : "text-orange-400"
                                                }`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm">{city.name}</div>
                                                    <div className={`text-xs truncate ${
                                                        selectedCity === city.name ? "text-orange-100" : "text-gray-400"
                                                    }`}>{city.region} • {city.description}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    
                                    {/* "My city is not listed" option */}
                                    <button
                                        onClick={handleCityNotListed}
                                        disabled={isDetectingLocation}
                                        className="w-full p-3 mt-2 rounded-lg border-2 border-dashed border-gray-600 bg-gray-800/50 hover:border-orange-400 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                                            <div>
                                                <div className="text-sm font-medium">
                                                    {isDetectingLocation && cityNotListed 
                                                        ? 'Detecting your location...' 
                                                        : 'Use my GPS location'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {isDetectingLocation && cityNotListed
                                                        ? 'Please allow location access'
                                                        : 'Automatically detect your precise city'}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No cities found matching "{searchQuery}"</p>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-xs text-orange-400 hover:text-orange-300 mt-2 underline"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Country Change Modal */}
                {showCountryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Change Country</h3>
                                <button
                                    onClick={() => setShowCountryModal(false)}
                                    className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                {COUNTRIES.map((country) => (
                                    <button
                                        key={country.code}
                                        onClick={() => handleManualCountrySelect(country.code)}
                                        className={`p-3 rounded-lg transition-all text-left ${
                                            countryCode === country.code
                                                ? 'bg-orange-500 border-2 border-orange-400'
                                                : 'bg-gray-800 border-2 border-gray-700 hover:border-orange-400 hover:bg-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{country.flag}</span>
                                                <div>
                                                    <div className={`font-semibold text-sm ${
                                                        countryCode === country.code ? 'text-white' : 'text-white'
                                                    }`}>{country.name}</div>
                                                    <div className={`text-xs ${
                                                        countryCode === country.code ? 'text-orange-100' : 'text-gray-400'
                                                    }`}>{country.description}</div>
                                                </div>
                                            </div>
                                            {countryCode === country.code && (
                                                <ChevronDown className="w-4 h-4 text-white rotate-0" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            
                            <p className="text-xs text-gray-400 text-center mt-4">
                                Your city selection will be cleared when changing country
                            </p>
                        </div>
                    </div>
                )}
                
                <PWAInstallIOSModal
                    visible={
                        showIOSInstructions && isIOS && !isInstalled &&
                        (() => { try { return !localStorage.getItem('ios_a2hs_dismissed'); } catch { return true; } })()
                    }
                    onClose={() => setShowIOSInstructions(false)}
                />
            </div>
        </div>
    );
};

export default LandingPage;

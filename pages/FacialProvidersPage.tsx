import React, { useState, useEffect } from 'react';
import type { Place, UserLocation, Analytics } from '../types';
import FacialPlaceCard from '../components/FacialPlaceCard';
import PageContainer from '../components/layout/PageContainer';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import HomeIcon from '../components/icons/HomeIcon';
import { Building } from 'lucide-react';
import PageNumberBadge from '../components/PageNumberBadge';
import CityLocationDropdown from '../components/CityLocationDropdown';
import { matchProviderToCity, INDONESIAN_CITIES_CATEGORIZED, findCityByCoordinates } from '../constants/indonesianCities';

interface FacialProvidersPageProps {
    facialPlaces: Place[];
    userLocation: UserLocation | null;
    selectedCity?: string;
    onSetUserLocation: (location: UserLocation) => void;
    onSelectPlace: (place: Place) => void;
    onIncrementAnalytics: (id: number | string, type: 'therapist' | 'place', metric: keyof Analytics) => void;
    onShowRegisterPrompt?: () => void;
    onNavigate?: (page: string) => void;
    onBack: () => void;
    t: any;
    language?: 'en' | 'id';
    onLanguageChange?: (lang: string) => void;
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onFacialPortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
}

const FacialProvidersPage: React.FC<FacialProvidersPageProps> = ({
    facialPlaces,
    userLocation,
    selectedCity,
    onSetUserLocation,
    onSelectPlace,
    onIncrementAnalytics,
    onShowRegisterPrompt,
    onNavigate,
    onBack,
    t,
    language,
    onLanguageChange,
    onMassageJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onFacialPortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
    therapists,
    places
}) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [localSelectedCity, setLocalSelectedCity] = useState<string>(selectedCity || 'all');
    const [activeTab, setActiveTab] = useState('home'); // Track active tab like HomePage
    
    // Update local city when prop changes
    useEffect(() => {
        if (selectedCity) {
            setLocalSelectedCity(selectedCity);
        }
    }, [selectedCity]);

    // Auto-detect city from user location (same as HomePage)
    useEffect(() => {
        if (userLocation && userLocation.lat && userLocation.lng) {
            // Find the closest Indonesian city to user's location
            const detectedCity = findCityByCoordinates(userLocation.lat, userLocation.lng);
            if (detectedCity && detectedCity.name !== localSelectedCity && localSelectedCity === 'all') {
                console.log('🎯 FacialProvidersPage: Auto-detected city from user location:', detectedCity.name);
                setLocalSelectedCity(detectedCity.name);
            }
        }
    }, [userLocation, localSelectedCity]);

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    };

    // Filter facial places by selected city OR by 15km radius if user location available
    const filteredFacialPlaces = (() => {
        // If user has location, filter by 15km radius
        if (userLocation && userLocation.lat && userLocation.lng && localSelectedCity !== 'all') {
            return facialPlaces.filter(place => {
                // Parse coordinates from place
                let placeCoords = { lat: 0, lng: 0 };
                if (place.coordinates) {
                    try {
                        if (typeof place.coordinates === 'string') {
                            placeCoords = JSON.parse(place.coordinates);
                        } else {
                            placeCoords = place.coordinates;
                        }
                    } catch (e) {
                        console.error('Error parsing place coordinates:', e);
                        return false;
                    }
                }
                
                // Skip if no valid coordinates
                if (!placeCoords.lat || !placeCoords.lng) {
                    return false;
                }
                
                // Calculate distance
                const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    placeCoords.lat,
                    placeCoords.lng
                );
                
                console.log(`📍 ${place.name}: ${distance.toFixed(2)}km away`);
                
                // Only show places within 15km
                return distance <= 15;
            });
        }
        
        // If city selected but no user location, filter by city name
        if (localSelectedCity !== 'all') {
            return facialPlaces.filter(place => {
                return place.location === localSelectedCity || place.location?.includes(localSelectedCity);
            });
        }
        
        // Show all if "All Indonesia" selected
        return facialPlaces;
    })();

    const handleCityChange = (city: string) => {
        setLocalSelectedCity(city);
    };

    return (
        <div className="min-h-screen bg-gray-50 w-full max-w-[100vw] overflow-x-hidden">
            <PageNumberBadge pageNumber={400} pageName="FacialProviders" isLocked={false} />
            
            {/* Header - Same as HomePage */}
            <header className="bg-white shadow-md sticky top-0 z-[9997] w-full max-w-full">
                <PageContainer className="py-3 sm:py-4 max-w-full">
                <div className="flex justify-between items-center max-w-full">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-600 flex-shrink-0">
                        {/* Language Selector - Flag Icon */}
                        <button 
                            onClick={() => {
                                const currentLang = language || 'id';
                                const newLanguage = currentLang === 'id' ? 'en' : 'id';
                                console.log('🌐 Language Toggle:');
                                console.log('  - Current:', currentLang);
                                console.log('  - New:', newLanguage);
                                
                                // Call the language change handler from parent
                                if (onLanguageChange) {
                                    onLanguageChange(newLanguage);
                                    console.log('✅ Language change handler called');
                                } else {
                                    console.error('❌ No language change handler provided');
                                }
                            }} 
                            className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 hover:bg-orange-50 rounded-full transition-colors flex-shrink-0" 
                            title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
                        >
                            <span className="text-xl sm:text-2xl">
                                {language === 'id' ? '🇮🇩' : '🇬🇧'}
                            </span>
                        </button>

                        <button 
                            onClick={() => setDrawerOpen(true)}
                            title="Menu" 
                            className="hover:bg-orange-50 rounded-full transition-colors text-orange-500 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                        >
                            <BurgerMenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>
                </PageContainer>
            </header>
            <main className="w-full max-w-full overflow-x-hidden">
            <PageContainer className="pb-24 max-w-full">

            {/* Location Display & City Selector - Same as HomePage */}
            <div className="mb-3 w-full mt-4 px-4">
                {userLocation ? (
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center gap-2">
                            <svg 
                                className="w-5 h-5 text-orange-500" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor" 
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-800">
                                {(() => {
                                    if (!userLocation.address || userLocation.address.trim() === '') {
                                        return `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
                                    }
                                    try {
                                        const parts = String(userLocation.address).split(',').map(p => p.trim());
                                        return parts.slice(-2).join(', ');
                                    } catch (e) {
                                        return `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
                                    }
                                })()}
                            </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-xs font-medium text-orange-600">
                                {localSelectedCity === 'all' ? 'All Indonesia' : (() => {
                                    // Find city to show emoji
                                    for (const category of INDONESIAN_CITIES_CATEGORIZED) {
                                        const foundCity = category.cities.find(city => city.name === localSelectedCity);
                                        if (foundCity) {
                                            return `${foundCity.name}${foundCity.isTouristDestination ? ' 🏖️' : foundCity.isMainCity ? ' 🏙️' : ''}`;
                                        }
                                    }
                                    return localSelectedCity;
                                })()}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{language === 'id' ? 'Pusat Klinik Facial Indonesia' : 'Indonesia\'s Facial Clinic Hub'}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-gray-600 text-center">{language === 'id' ? 'Temukan klinik facial premium di seluruh Indonesia' : 'Discover premium facial clinics across Indonesia'}</p>
                        <p className="text-xs text-gray-500 font-medium">{language === 'id' ? 'Pusat Klinik Facial Indonesia' : 'Indonesia\'s Facial Clinic Hub'}</p>
                    </div>
                )}
            </div>

            {/* Toggle Tabs (Home Service / Massage Places) - Same as HomePage */}
            <div className="px-2 sm:px-4 mb-4">
                <div className="flex bg-gray-200 rounded-full p-1 mb-3">
                    <button 
                        onClick={() => {
                            setActiveTab('home');
                            onNavigate?.('home');
                        }} 
                        className={`w-1/2 py-2 px-2 sm:px-4 rounded-full flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 ${activeTab === 'home' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                    >
                        <HomeIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{t?.home?.homeServiceTab || 'Home Service'}</span>
                    </button>
                    <button 
                        onClick={() => {
                            setActiveTab('places');
                            onNavigate?.('home');
                        }} 
                        className={`w-1/2 py-2 px-2 sm:px-4 rounded-full flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 ${activeTab === 'places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                    >
                        <Building className="w-4 h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{t?.home?.massagePlacesTab || 'Massage Places'}</span>
                    </button>
                </div>
                <div className="space-y-2 mb-4 w-full max-w-full overflow-visible">
                    <div className="flex flex-wrap items-center w-full max-w-full gap-2">
                        <div className="relative flex-1 min-w-0 max-w-[280px] z-20">
                            <CityLocationDropdown
                                selectedCity={localSelectedCity}
                                onCityChange={handleCityChange}
                                placeholder={localSelectedCity === 'all' ? '🇮🇩 All Indonesia' : '📍 Select Different City'}
                                includeAll={true}
                                showLabel={false}
                                className="w-full min-w-0 max-w-full"
                            />
                        </div>
                        <button
                            className="inline-flex p-0 bg-transparent border-0 outline-none focus:outline-none active:outline-none ring-0 focus:ring-0 items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
                            title="Facials Indonesia - Current Page"
                            aria-label="Facials Indonesia - Current Page"
                        >
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/facials%20indonisea.png?updatedAt=1764934744400"
                                alt="Facials Indonesia"
                                className="select-none h-[168px] w-[168px] object-contain"
                                loading="lazy"
                                draggable={false}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Facial Places List */}
            <div className="px-2 sm:px-4 pb-24">
                <div className="mb-6 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{language === 'id' ? 'Klinik Facial' : 'Facial Clinics'}</h3>
                    <p className="text-gray-600">
                        {localSelectedCity === 'all' 
                            ? language === 'id' 
                                ? `Temukan klinik facial terbaik di seluruh Indonesia (${filteredFacialPlaces.length})`
                                : `Find the best facial clinics across Indonesia (${filteredFacialPlaces.length})`
                            : language === 'id'
                                ? `Perawatan facial premium di ${localSelectedCity}`
                                : `Premium facial treatments in ${localSelectedCity}`
                        }
                    </p>
                </div>

                {filteredFacialPlaces.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{language === 'id' ? 'Tidak Ada Klinik Facial' : 'No Facial Clinics Found'}</h4>
                        <p className="text-gray-600 mb-4">
                            {localSelectedCity === 'all' 
                                ? language === 'id' 
                                    ? 'Belum ada klinik facial tersedia. Cek kembali segera!'
                                    : 'No facial clinics available yet. Check back soon!'
                                : language === 'id'
                                    ? `Tidak ada klinik facial di ${localSelectedCity}. Coba pilih kota lain.`
                                    : `No facial clinics found in ${localSelectedCity}. Try selecting a different city.`
                            }
                        </p>
                        <button
                            onClick={() => setLocalSelectedCity('all')}
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            {language === 'id' ? 'Lihat Semua Kota' : 'View All Cities'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-full overflow-hidden">
                        {filteredFacialPlaces.map((place: Place) => (
                            <FacialPlaceCard
                                key={place.$id || place.id}
                                place={place}
                                onRate={(p) => console.log('Rate facial place:', p)}
                                onSelectPlace={onSelectPlace}
                                onNavigate={onNavigate}
                                onIncrementAnalytics={(metric) => 
                                    onIncrementAnalytics(place.$id || place.id || 0, 'place', metric)
                                }
                                onShowRegisterPrompt={onShowRegisterPrompt}
                                isCustomerLoggedIn={false}
                                t={t}
                                userLocation={userLocation}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Drawer - Same as HomePage */}
            <AppDrawer
                isHome={false}
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                t={t}
                onMassageJobsClick={onMassageJobsClick}
                onHotelPortalClick={onHotelPortalClick}
                onVillaPortalClick={onVillaPortalClick}
                onTherapistPortalClick={onTherapistPortalClick}
                onMassagePlacePortalClick={onMassagePlacePortalClick}
                onFacialPortalClick={onFacialPortalClick}
                onAgentPortalClick={onAgentPortalClick}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick}
                onNavigate={onNavigate}
                onTermsClick={onTermsClick}
                onPrivacyClick={onPrivacyClick}
                onQRCodeClick={() => onNavigate && onNavigate('qr-code')}
                therapists={therapists || []}
                places={places || []}
            />
            </PageContainer>
            </main>
        </div>
    );
};

export default FacialProvidersPage;

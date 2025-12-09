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
    const [activeTab, setActiveTab] = useState('facials');
    
    // DIAGNOSTIC: Log facial places prop on mount and updates
    useEffect(() => {
        console.log('🎭 [FacialProvidersPage] DIAGNOSTIC - Facial places received:', {
            count: facialPlaces?.length || 0,
            facialPlaces: facialPlaces,
            samplePlace: facialPlaces?.[0],
            allImages: facialPlaces?.map(p => ({
                name: p.name,
                mainImage: (p as any).mainImage,
                images: (p as any).images
            }))
        });
    }, [facialPlaces]);
    
    // Update local city when prop changes
    useEffect(() => {
        if (selectedCity) {
            setLocalSelectedCity(selectedCity);
        }
    }, [selectedCity]);

    // Auto-detect city from user location
    useEffect(() => {
        if (userLocation && userLocation.lat && userLocation.lng) {
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
        console.log('🔍 Facial Places Debug:', {
            totalFacialPlaces: facialPlaces.length,
            localSelectedCity,
            userLocation,
            facialPlaces: facialPlaces.map(p => ({ name: p.name, mainImage: (p as any).mainImage }))
        });
        
        // If user has location, filter by 15km radius
        if (userLocation && userLocation.lat && userLocation.lng && localSelectedCity !== 'all') {
            const filtered = facialPlaces.filter(place => {
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
                
                if (!placeCoords.lat || !placeCoords.lng) {
                    return false;
                }
                
                const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    placeCoords.lat,
                    placeCoords.lng
                );
                
                console.log(`📍 ${place.name}: ${distance.toFixed(2)}km away`);
                return distance <= 15;
            });
            return filtered;
        }
        
        // If city selected but no user location, filter by city name
        if (localSelectedCity !== 'all') {
            const filtered = facialPlaces.filter(place => {
                return place.location === localSelectedCity || place.location?.includes(localSelectedCity);
            });
            return filtered;
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
            
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-[9997] w-full max-w-full">
                <PageContainer className="py-2 sm:py-3 max-w-full">
                <div className="flex justify-between items-center max-w-full">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">
                        {/* Simplified brand markup to prevent production clipping of last letter */}
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

                        <button onClick={() => {
                            console.log('🍔 Burger menu clicked! Current drawerOpen:', drawerOpen);
                            console.log('🍔 Setting drawerOpen to true');
                            setDrawerOpen(true);
                            console.log('🍔 After setting - drawerOpen should be true');
                        }} title="Menu" className="hover:bg-orange-50 rounded-full transition-colors text-orange-500 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
                           <BurgerMenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>
                </PageContainer>
            </header>

            {/* Sticky Hero Section - Compact */}
            <div className="bg-white sticky top-[60px] z-10 border-b border-gray-100">
                <PageContainer className="px-3 sm:px-4 pt-4 sm:pt-5 pb-4">
                    <div className="space-y-4 max-w-6xl mx-auto">
                        {/* Location Display */}
                        <div className="w-full">
                            {userLocation ? (
                                <div className="flex flex-col items-center gap-0.5 py-1">
                                    <div className="flex items-center justify-center gap-2">
                                        <svg 
                                            className="w-4 h-4 text-gray-600" 
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
                                    <p className="text-xs text-gray-500 font-medium">
                                        {language === 'id' ? 'Pusat Klinik Facial Indonesia' : 'Indonesia\'s Facial Clinic Hub'}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1 py-1">
                                    <p className="text-sm text-gray-600 text-center">
                                        {language === 'id' ? 'Temukan klinik facial premium' : 'Discover premium facial clinics'}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {language === 'id' ? 'Pusat Klinik Facial Indonesia' : 'Indonesia\'s Facial Clinic Hub'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Toggle Buttons - Standard Height (44px min) */}
                        <div className="flex bg-gray-200 rounded-full p-1 max-w-md mx-auto">
                            <button 
                                onClick={() => {
                                    console.log('Switching to home service tab');
                                    setActiveTab('home');
                                }} 
                                className={`w-1/2 py-2.5 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 min-h-[44px] ${activeTab === 'home' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                            >
                                <HomeIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{t?.home?.homeServiceTab || 'Home Service'}</span>
                            </button>
                            <button 
                                onClick={() => {
                                    console.log('Switching to massage places tab');
                                    setActiveTab('places');
                                }} 
                                className={`w-1/2 py-2.5 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 min-h-[44px] ${activeTab === 'places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                            >
                                <Building className="w-4 h-4 flex-shrink-0" />
                                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{t?.home?.massagePlacesTab || 'Massage Places'}</span>
                            </button>
                        </div>

                        {/* City Dropdown + Facial Button - Responsive Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center max-w-2xl mx-auto">
                            {/* City Dropdown */}
                            <div className="relative w-full z-20">
                                <CityLocationDropdown
                                    selectedCity={localSelectedCity}
                                    onCityChange={handleCityChange}
                                    placeholder={localSelectedCity === 'all' ? 
                                        (language === 'id' ? '🇮🇩 Seluruh Indonesia' : '🇮🇩 All Indonesia') : 
                                        '📍 Select Different City'
                                    }
                                    includeAll={true}
                                    showLabel={false}
                                    className="w-full"
                                />
                            </div>
                            
                            {/* Facial Button - Compact size (120x120) */}
                            <div className="flex justify-center sm:justify-end">
                                <button
                                    className="inline-flex p-1 bg-transparent border-0 outline-none focus:outline-none hover:opacity-90 active:opacity-75 transition-opacity"
                                    style={{ 
                                        WebkitTapHighlightColor: 'rgba(255, 165, 0, 0.3)',
                                        touchAction: 'manipulation',
                                        userSelect: 'none'
                                    } as React.CSSProperties}
                                    title="Facials Indonesia"
                                    aria-label="Facials Indonesia - Current Page"
                                >
                                    <img 
                                        src="https://ik.imagekit.io/7grri5v7d/facials%20indonisea.png?updatedAt=1764934744400"
                                        alt="Facials Indonesia"
                                        className="select-none transition-opacity hover:opacity-90 h-[120px] w-[120px] sm:h-[140px] sm:w-[140px] object-contain pointer-events-none"
                                        loading="lazy"
                                        draggable={false}
                                        style={{ userSelect: 'none', WebkitUserSelect: 'none' } as React.CSSProperties}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </PageContainer>
            </div>
            
            {/* Scrollable Content Area */}
            <PageContainer className="px-3 sm:px-4 pt-4 pb-24">
                {/* Content changes based on active tab */}
                {activeTab === 'facials' && (
                    <div>
                        {/* SEO-Optimized Header Section */}
                        <div className="mb-6 text-center">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                {language === 'id' ? 'Klinik Facial & Perawatan Wajah Profesional Indonesia' : 'Professional Facial Clinics & Skincare Centers Indonesia'}
                            </h1>
                            <h2 className="text-lg sm:text-xl font-semibold text-orange-600 mb-3">
                                {language === 'id' 
                                    ? 'Perawatan Kulit Premium - Microdermabrasion, Anti-Aging, Deep Cleansing'
                                    : 'Premium Skincare Treatments - Microdermabrasion, Anti-Aging, Deep Cleansing'
                                }
                            </h2>
                            <p className="text-gray-700 text-sm sm:text-base max-w-4xl mx-auto mb-4 leading-relaxed">
                                {language === 'id' 
                                    ? `Direktori terlengkap klinik kecantikan & spa facial di Indonesia. Temukan ${filteredFacialPlaces.length} klinik facial profesional untuk perawatan wajah berjerawat, flek hitam, pencerah kulit, anti-penuaan, hydrating facial, chemical peeling, dan microdermabrasion. Layanan perawatan kulit wajah oleh terapis kecantikan bersertifikat di ${localSelectedCity === 'all' ? 'seluruh Indonesia' : localSelectedCity}.`
                                    : `Indonesia's most comprehensive facial clinic & beauty spa directory. Discover ${filteredFacialPlaces.length} professional facial clinics for acne treatment, dark spot removal, skin brightening, anti-aging, hydrating facials, chemical peeling, and microdermabrasion. Professional skincare services by certified beauty therapists in ${localSelectedCity === 'all' ? 'all of Indonesia' : localSelectedCity}.`
                                }
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm text-gray-600 mb-4">
                                {language === 'id' ? (
                                    <>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Facial Acne</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Perawatan Flek Hitam</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Pencerah Wajah</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Anti-Aging</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Microdermabrasion</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Chemical Peeling</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Hydrating Facial</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Deep Cleansing</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Korean Skincare</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Facial Whitening</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Acne Treatment</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Dark Spot Removal</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Skin Brightening</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Anti-Aging</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Microdermabrasion</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Chemical Peeling</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Hydrating Facial</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Deep Cleansing</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Korean Skincare</span>
                                        <span className="bg-orange-50 px-3 py-1 rounded-full">Facial Whitening</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Facial Places List */}
                        <div className="mb-6 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {language === 'id' ? 'Klinik Facial Terverifikasi' : 'Verified Facial Clinics'}
                            </h3>
                    <p className="text-gray-600 text-sm">
                        {localSelectedCity === 'all' 
                            ? language === 'id' 
                                ? `${filteredFacialPlaces.length} klinik facial terpercaya di seluruh Indonesia`
                                : `${filteredFacialPlaces.length} trusted facial clinics across Indonesia`
                            : language === 'id'
                                ? `Perawatan facial premium di ${localSelectedCity} (${filteredFacialPlaces.length} klinik)`
                                : `Premium facial treatments in ${localSelectedCity} (${filteredFacialPlaces.length} clinics)`
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
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {language === 'id' ? 'Tidak Ada Klinik Facial' : 'No Facial Clinics Found'}
                        </h4>
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
                    <div className="space-y-3 max-w-full overflow-hidden">
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

                        {/* SEO-Rich Informational Section */}
                        {filteredFacialPlaces.length > 0 && (
                            <div className="mt-12 bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 sm:p-8 border border-orange-100 shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                                    {language === 'id' ? 'Perawatan Facial Profesional di Indonesia' : 'Professional Facial Treatments in Indonesia'}
                                </h2>
                                
                                <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                                    {/* Microdermabrasion */}
                                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-semibold text-orange-600 mb-2">
                                            {language === 'id' ? 'Microdermabrasion & Eksfoliasi' : 'Microdermabrasion & Exfoliation'}
                                        </h3>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {language === 'id' 
                                                ? 'Perawatan eksfoliasi mendalam menggunakan teknologi microdermabrasion untuk mengangkat sel kulit mati, mencerahkan wajah, dan meratakan tekstur kulit. Efektif mengatasi bekas jerawat, flek hitam, dan tanda penuaan. Dilakukan oleh terapis kecantikan profesional dengan alat modern dan aman untuk semua jenis kulit.'
                                                : 'Advanced exfoliation treatment using microdermabrasion technology to remove dead skin cells, brighten complexion, and smooth skin texture. Effectively treats acne scars, dark spots, and aging signs. Performed by professional beauty therapists with modern, safe equipment for all skin types.'
                                            }
                                        </p>
                                    </div>

                                    {/* Anti-Aging */}
                                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-semibold text-orange-600 mb-2">
                                            {language === 'id' ? 'Anti-Aging & Peremajaan Kulit' : 'Anti-Aging & Skin Rejuvenation'}
                                        </h3>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {language === 'id' 
                                                ? 'Treatment anti-penuaan untuk mengurangi kerutan, garis halus, dan meningkatkan elastisitas kulit. Menggunakan serum berkualitas tinggi dengan vitamin C, retinol, dan hyaluronic acid. Stimulasi produksi kolagen alami untuk kulit lebih kencang, kenyal, dan awet muda. Cocok untuk usia 30+ tahun.'
                                                : 'Anti-aging treatment to reduce wrinkles, fine lines, and improve skin elasticity. Uses premium serums with vitamin C, retinol, and hyaluronic acid. Stimulates natural collagen production for firmer, more youthful skin. Ideal for ages 30 and above.'
                                            }
                                        </p>
                                    </div>

                                    {/* Acne Treatment */}
                                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-semibold text-orange-600 mb-2">
                                            {language === 'id' ? 'Facial Acne & Perawatan Jerawat' : 'Acne Facial & Treatment'}
                                        </h3>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {language === 'id' 
                                                ? 'Perawatan khusus kulit berjerawat dengan deep cleansing, ekstraksi komedo, dan masker antibakteri. Membersihkan pori-pori tersumbat, mengurangi inflamasi, dan mencegah jerawat baru. Menggunakan produk non-comedogenic dan hypoallergenic. Termasuk LED light therapy untuk mempercepat penyembuhan.'
                                                : 'Specialized acne treatment with deep cleansing, blackhead extraction, and antibacterial masks. Clears clogged pores, reduces inflammation, and prevents new breakouts. Uses non-comedogenic and hypoallergenic products. Includes LED light therapy for faster healing.'
                                            }
                                        </p>
                                    </div>

                                    {/* Brightening & Whitening */}
                                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-semibold text-orange-600 mb-2">
                                            {language === 'id' ? 'Pencerah Wajah & Whitening' : 'Skin Brightening & Whitening'}
                                        </h3>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {language === 'id' 
                                                ? 'Treatment pencerah kulit untuk mengatasi hiperpigmentasi, flek hitam, dan warna kulit tidak merata. Menggunakan bahan aktif seperti glutathione, niacinamide, dan alpha arbutin. Chemical peeling ringan untuk hasil maksimal. Kulit tampak lebih cerah, glowing, dan bercahaya alami dalam 4-6 sesi.'
                                                : 'Skin brightening treatment for hyperpigmentation, dark spots, and uneven skin tone. Uses active ingredients like glutathione, niacinamide, and alpha arbutin. Gentle chemical peeling for maximum results. Achieves brighter, glowing, naturally radiant skin in 4-6 sessions.'
                                            }
                                        </p>
                                    </div>

                                    {/* Hydrating Facial */}
                                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-semibold text-orange-600 mb-2">
                                            {language === 'id' ? 'Hydrating Facial & Moisturizing' : 'Hydrating Facial & Moisturizing'}
                                        </h3>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {language === 'id' 
                                                ? 'Perawatan hidrasi intensif untuk kulit kering dan dehidrasi. Menggunakan sheet mask premium dengan hyaluronic acid, ceramide, dan peptides. Mengembalikan kelembaban alami kulit, meredakan kemerahan, dan memperbaiki skin barrier. Cocok untuk semua jenis kulit terutama yang sensitif.'
                                                : 'Intensive hydration treatment for dry and dehydrated skin. Uses premium sheet masks with hyaluronic acid, ceramides, and peptides. Restores natural moisture, soothes redness, and repairs skin barrier. Suitable for all skin types, especially sensitive skin.'
                                            }
                                        </p>
                                    </div>

                                    {/* Korean Skincare */}
                                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-semibold text-orange-600 mb-2">
                                            {language === 'id' ? 'Korean Facial & K-Beauty' : 'Korean Facial & K-Beauty'}
                                        </h3>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {language === 'id' 
                                                ? 'Metode perawatan wajah ala Korea dengan 10-step skincare routine. Double cleansing, essence, ampoule, dan sheet mask asli Korea. Glass skin effect untuk kulit halus, bercahaya, dan sehat alami. Menggunakan produk K-beauty original seperti COSRX, Innisfree, dan Laneige. Populer untuk hasil instan.'
                                                : 'Korean-style facial treatment with 10-step skincare routine. Double cleansing, essence, ampoule, and authentic Korean sheet masks. Achieve glass skin effect for smooth, radiant, naturally healthy skin. Uses original K-beauty products like COSRX, Innisfree, and Laneige. Popular for instant results.'
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Call to Action */}
                                <div className="mt-8 text-center bg-orange-100 rounded-xl p-6">
                                    <p className="text-gray-800 font-medium mb-2">
                                        {language === 'id' 
                                            ? '🌟 Semua klinik telah terverifikasi dengan terapis kecantikan bersertifikat dan produk berkualitas tinggi'
                                            : '🌟 All clinics are verified with certified beauty therapists and premium quality products'
                                        }
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        {language === 'id' 
                                            ? 'Booking langsung via WhatsApp • Konsultasi gratis • Harga transparan • Treatment aman & higienis'
                                            : 'Direct booking via WhatsApp • Free consultation • Transparent pricing • Safe & hygienic treatments'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Home Service Tab - Show therapists */}
                {activeTab === 'home' && (
                    <div className="text-center py-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {language === 'id' ? 'Terapis Home Service' : 'Home Service Therapists'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {language === 'id' ? 'Silakan kembali ke halaman utama untuk melihat terapis' : 'Please return to the main page to view therapists'}
                        </p>
                        <button
                            onClick={() => onNavigate?.('home')}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                        >
                            {language === 'id' ? 'Ke Halaman Utama' : 'Go to Home Page'}
                        </button>
                    </div>
                )}

                {/* Massage Places Tab - Show places */}
                {activeTab === 'places' && (
                    <div className="text-center py-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {language === 'id' ? 'Tempat Pijat' : 'Massage Places'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {language === 'id' ? 'Silakan kembali ke halaman utama untuk melihat tempat pijat' : 'Please return to the main page to view massage places'}
                        </p>
                        <button
                            onClick={() => onNavigate?.('home')}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                        >
                            {language === 'id' ? 'Ke Halaman Utama' : 'Go to Home Page'}
                        </button>
                    </div>
                )}
            </PageContainer>

            {/* Drawer */}
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
                onQRCodeClick={() => onNavigate && onNavigate('qr-code')}
                therapists={therapists || []}
                places={places || []}
            />

            {/* Directory footer: Brand + Terms & Privacy */}
            <div className="mt-12 mb-6 flex flex-col items-center gap-2">
                <div className="font-bold text-base">
                    <span className="text-black">Inda</span>
                    <span className="text-orange-500">Street</span>
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={() => onTermsClick && onTermsClick()} className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
                        Terms
                    </button>
                    <span className="text-sm text-gray-400">•</span>
                    <button onClick={() => onPrivacyClick && onPrivacyClick()} className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
                        Privacy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FacialProvidersPage;

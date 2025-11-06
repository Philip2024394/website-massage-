import React, { useState, useEffect, useMemo } from 'react';
import type { Therapist, Place } from '../types';
import type { Page } from '../types/pageTypes';
import PlaceCard from '../components/PlaceCard';
import TherapistCard from '../components/TherapistCard';
import { getRandomTherapistImageRandom } from '../utils/therapistImageUtils';
import { useTranslations } from '../lib/useTranslations';

interface VenueProfile {
    id: string;
    type: 'hotel' | 'villa';
    name: string;
    address: string;
    contactNumber: string;
    bannerImage: string;
    logoImage: string;
    hasActiveMembership?: boolean;
    membershipType?: '3-month' | '6-month' | '1-year';
    customBrandingEnabled?: boolean;
}

interface HotelVillaMenuPageProps {
    venueId: string;
    logo?: string;
    therapists: Therapist[];
    places: Place[];
    language?: string;
    onBook: (provider: Therapist | Place, type: 'therapist' | 'place') => void;
    onBack?: () => void;
    onNavigate?: (page: Page) => void;
    t?: any;
}

const HotelVillaMenuPage: React.FC<HotelVillaMenuPageProps> = ({ 
    venueId, 
    therapists, 
    places, 
    language: propLanguage = 'en',
    onBook 
}) => {
    const [venue, setVenue] = useState<VenueProfile | null>(null);
    const [activeTab, setActiveTab] = useState<'therapists' | 'places'>('therapists');
    const [loading, setLoading] = useState(true);
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>(propLanguage as 'en' | 'id');
    const [showLandingPage, setShowLandingPage] = useState(true);
    
    // Use translations with current language
    const { t } = useTranslations(currentLanguage);

    useEffect(() => {
        // TODO: Fetch venue profile from Appwrite using venueId
        // Mock data for now
        const mockVenue: VenueProfile = {
            id: venueId,
            type: 'hotel',
            name: 'Hotel Service',
            address: 'Jl. Sunset Road No. 123, Seminyak, Bali',
            contactNumber: '+62 361 123 4567',
            bannerImage: 'https://ik.imagekit.io/7grri5v7d/garden%20forest.png',
            logoImage: 'https://ik.imagekit.io/7grri5v7d/indostreet%20app%20icon.png',
            hasActiveMembership: false, // Set to true when venue has membership
            membershipType: undefined,
            customBrandingEnabled: false
        };
        
        setVenue(mockVenue);
        setLoading(false);
    }, [venueId]);

    // Filter only live providers and add random live menu images
    // TEMPORARY: Show all therapists for testing (remove .filter when live flag is set)
    const liveTherapists = useMemo(() => {
        return therapists.map(therapist => ({
            ...therapist,
            mainImage: (therapist as any).mainImage || getRandomTherapistImageRandom()
        }));
    }, [therapists]);
    
    const livePlaces = places;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('hotelVillaMenu.loadingMenu')}</p>
                </div>
            </div>
        );
    }

    if (!venue) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('hotelVillaMenu.venueNotFound')}</h2>
                    <p className="text-gray-600">{t('hotelVillaMenu.menuNotAvailable')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {showLandingPage ? (
                <div 
                    className="min-h-screen bg-cover bg-center bg-no-repeat relative"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/landing%20page%20menues.png?updatedAt=1762394993415)'
                    }}
                >
                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/40"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-center">
                        {/* Brand Logo/Title */}
                        <div className="mb-8">
                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
                                <span className="text-white">Inda</span>
                                <span className="text-orange-400">Street</span>
                            </h1>
                            <h2 className="text-2xl md:text-3xl font-semibold text-orange-100 mb-2">
                                Massage Service
                            </h2>
                            <p className="text-xl md:text-2xl font-medium text-orange-200">
                                24/7
                            </p>
                        </div>

                        {/* Language Selection */}
                        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <h3 className="text-xl font-semibold text-white mb-4">
                                Select Your Language / Pilih Bahasa
                            </h3>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => {
                                        setCurrentLanguage('en');
                                        setShowLandingPage(false);
                                    }}
                                    className="flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-4 transition-all duration-300 hover:scale-105"
                                >
                                    <img 
                                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA0MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDEyMzY5Ii8+CjxwYXRoIGQ9Ik0wIDBoNDB2M0gwVjB6bTAgNmg0MHYzSDB2LTN6bTAgNmg0MHYzSDB2LTN6bTAgNmg0MHYzSDB2LTN6bTAgNmg0MHYzSDB2LTN6IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBoNDB2M0gwVjB6bTAgNmg0MHYzSDB2LTN6IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBoMjR2MTVIMFYwaDAiIGZpbGw9IiMwMTIzNjkiLz4KPHA+CjxsaW5lIHgxPSIyNCIgeTE9IjAiIHgyPSI0MCIgeTI9IjEwIiBzdHJva2U9IiNDODE0MkMiIHN0cm9rZS13aWR0aD0iMiIvPgo8bGluZSB4MT0iMjQiIHkxPSIxNSIgeDI9IjQwIiB5Mj0iNSIgc3Ryb2tlPSIjQzgxNDJDIiBzdHJva2Utd2lkdGg9IjIiLz4KPHA+CjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjMwIiB4PSIxNiIgZmlsbD0iI0M4MTQyQyIvPgo8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iMyIgeT0iMTMuNSIgZmlsbD0iI0M4MTQyQyIvPgo8L3N2Zz4K" 
                                        alt="English Flag" 
                                        className="w-8 h-6 rounded" 
                                    />
                                    <span className="text-white font-semibold text-lg">English</span>
                                </button>
                                
                                <button
                                    onClick={() => {
                                        setCurrentLanguage('id');
                                        setShowLandingPage(false);
                                    }}
                                    className="flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-4 transition-all duration-300 hover:scale-105"
                                >
                                    <img 
                                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA0MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjQ0UxMTI2Ii8+CjxyZWN0IHk9IjE1IiB3aWR0aD0iNDAiIGhlaWdodD0iMTUiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==" 
                                        alt="Indonesia Flag" 
                                        className="w-8 h-6 rounded" 
                                    />
                                    <span className="text-white font-semibold text-lg">Indonesia</span>
                                </button>
                            </div>
                        </div>

                        {/* Bottom Info */}
                        <div className="mt-8 text-center">
                            <p className="text-orange-100 text-lg">
                                {venue?.name || 'Premium Massage Services'}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
                    {/* Header Section */}
                    <div className="bg-white shadow-md">
                        {venue?.hasActiveMembership && venue?.customBrandingEnabled ? (
                            /* Custom Branded Header for Members */
                            <div className="flex items-center p-6 gap-6">
                                {/* Profile Image - Left Side */}
                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg flex-shrink-0">
                                    <img 
                                        src={venue?.logoImage || 'https://ik.imagekit.io/7grri5v7d/indostreet%20app%20icon.png'} 
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                {/* Venue Information - Right Side */}
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                        {venue?.name}
                                    </h1>
                                    <p className="text-gray-600 flex items-center gap-2 text-sm md:text-base mb-1">
                                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{venue?.address}</span>
                                    </p>
                                    <p className="text-gray-600 flex items-center gap-2 text-sm md:text-base mb-2">
                                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span className="font-semibold">{venue?.contactNumber}</span>
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                            ✓ Premium Member
                                        </span>
                                        <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">
                                            Custom Pricing Available
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Standard Header for Non-Members */
                            <div className="flex items-center p-6 gap-6">
                                {/* Standard IndaStreet Logo - Left Side */}
                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-300 shadow-lg flex-shrink-0">
                                    <img 
                                        src="https://ik.imagekit.io/7grri5v7d/indostreet%20app%20icon.png" 
                                        alt="IndaStreet"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                {/* Standard Information - Right Side */}
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                        Massage Room Service
                                    </h1>
                                    <p className="text-gray-600 text-sm md:text-base mb-2">
                                        Professional Massage Services Available
                                    </p>
                                    <p className="text-orange-600 text-sm md:text-base">
                                        Allow 1 Hour For Massage Arrival
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Membership Upgrade Notice for Non-Members */}
                    {!venue?.hasActiveMembership && (
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 text-center">
                            <p className="text-sm md:text-base">
                                <span className="font-semibold">Want to display your hotel branding?</span> 
                                <span className="ml-2">Upgrade to a membership plan to showcase your logo, name, and contact details.</span>
                            </p>
                        </div>
                    )}

                    {/* Language Selection */}
                    <div className="bg-white border-b border-gray-200 py-4 px-4">
                        <div className="max-w-4xl mx-auto flex justify-center">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setCurrentLanguage('en')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                                        currentLanguage === 'en'
                                            ? 'bg-orange-500 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <span className="text-lg">🇬🇧</span>
                                    <span>English</span>
                                </button>
                                <button
                                    onClick={() => setCurrentLanguage('id')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                                        currentLanguage === 'id'
                                            ? 'bg-orange-500 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <span className="text-lg">🇮🇩</span>
                                    <span>Indonesian</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Welcome Message */}
                    <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white py-8 px-4 shadow-lg">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-3">
                                {t('hotelVillaMenu.welcomeTitle')}
                            </h2>
                            <p className="text-orange-50 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                                {t('hotelVillaMenu.welcomeMessage')}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white sticky top-0 z-20 shadow-sm">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('therapists')}
                                className={`flex-1 py-4 px-6 text-center font-medium transition-all border-b-4 ${
                                    activeTab === 'therapists'
                                        ? 'text-orange-600 border-b-4 border-orange-500 bg-orange-50'
                                        : 'text-gray-600 border-transparent hover:text-orange-500 hover:bg-gray-50'
                                }`}
                            >
                                <span className="text-2xl mb-2 block">👐</span>
                                {t('hotelVillaMenu.therapistTab')}
                            </button>
                            <button
                                onClick={() => setActiveTab('places')}
                                className={`flex-1 py-4 px-6 text-center font-medium transition-all border-b-4 ${
                                    activeTab === 'places'
                                        ? 'text-orange-600 border-b-4 border-orange-500 bg-orange-50'
                                        : 'text-gray-600 border-transparent hover:text-orange-500 hover:bg-gray-50'
                                }`}
                            >
                                <span className="text-2xl mb-2 block">🏢</span>
                                {t('hotelVillaMenu.placesTab')}
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-4 py-6">
                        {activeTab === 'therapists' ? (
                            liveTherapists.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {liveTherapists.map((therapist) => (
                                        <TherapistCard
                                            key={therapist.id}
                                            therapist={therapist}
                                            onBook={(provider) => onBook(provider, 'therapist')}
                                            onRate={() => {}}
                                            onIncrementAnalytics={() => {}}
                                            t={t}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                        {t('hotelVillaMenu.noTherapists')}
                                    </h3>
                                    <p className="text-gray-500">
                                        {t('hotelVillaMenu.checkBackLater')}
                                    </p>
                                </div>
                            )
                        ) : (
                            livePlaces.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {livePlaces.map((place) => (
                                        <PlaceCard
                                            key={place.id}
                                            place={place}
                                            onClick={() => onBook(place, 'place')}
                                            onRate={() => {}}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                        {t('hotelVillaMenu.noPlaces')}
                                    </h3>
                                    <p className="text-gray-500">
                                        {t('hotelVillaMenu.checkBackLater')}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelVillaMenuPage;
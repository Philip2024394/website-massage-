import React, { useState, useEffect, useMemo } from 'react';
import type { Therapist, Place } from '../types';
import { HotelVillaServiceStatus } from '../types';
import type { Page } from '../types/pageTypes';
import PlaceCard from '../components/PlaceCard';
import TherapistCard from '../components/TherapistCard';
import { getRandomTherapistImageRandom } from '../utils/therapistImageUtils';
import { useTranslations } from '../lib/useTranslations';

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
    const [activeTab, setActiveTab] = useState<'therapists' | 'places'>('therapists');
    const [loading, setLoading] = useState(true);
    const [showLandingPage, setShowLandingPage] = useState(true);
    const [currentLanguage] = useState<'en' | 'id'>(propLanguage as 'en' | 'id');
    
    // Use translations with current language
    const { t } = useTranslations(currentLanguage);

    useEffect(() => {
        // Minimal loading simulation
        setLoading(false);
    }, [venueId]);

    // Filter providers that have opted into hotel services with discounts
    const liveTherapists = useMemo(() => {
        return therapists
            .filter(therapist => 
                therapist.hotelVillaServiceStatus === HotelVillaServiceStatus.OptedIn && 
                (therapist.hotelDiscount || 0) > 0
            )
            .map(therapist => ({
                ...therapist,
                mainImage: (therapist as any).mainImage || getRandomTherapistImageRandom()
            }));
    }, [therapists]);
    
    const livePlaces = useMemo(() => {
        return places.filter(place => 
            place.hotelVillaServiceStatus === HotelVillaServiceStatus.OptedIn && 
            (place.hotelDiscount || 0) > 0
        );
    }, [places]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading menu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {showLandingPage ? (
                /* Landing Page */
                <div 
                    className="min-h-screen bg-cover bg-center bg-no-repeat relative"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20app%20back%20ground%20indastreets.png?updatedAt=1762389590920)'
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
                                Live Massage Menu
                            </h2>
                            <p className="text-xl md:text-2xl font-medium text-orange-200">
                                24/7 Room Service
                            </p>
                        </div>

                        {/* Enter Button */}
                        <button
                            onClick={() => setShowLandingPage(false)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                            View Live Menu
                        </button>

                        {/* Profile Image - Large on Right Side */}
                        <div className="absolute top-8 right-8 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-orange-400 shadow-xl">
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/indostreet%20app%20icon.png" 
                                alt="IndaStreet Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                /* App Page */
                <div className="min-h-screen bg-gray-50">
                    {/* Clean Header with Profile Image and Essential Text */}
                    <div className="bg-white shadow-sm border-b">
                        <div className="flex items-center justify-between p-4">
                            {/* Left Side Text */}
                            <div className="flex-1">
                                <h1 className="text-xl font-bold text-gray-900">
                                    Live Massage Menu
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Room Service Available 24/7
                                </p>
                            </div>
                            
                            {/* Right Side Profile Image - Enlarged */}
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 shadow-lg">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/indostreet%20app%20icon.png" 
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white border-b">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('therapists')}
                                className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                                    activeTab === 'therapists'
                                        ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                                        : 'text-gray-600 hover:text-orange-500'
                                }`}
                            >
                                Room Massage ({liveTherapists.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('places')}
                                className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                                    activeTab === 'places'
                                        ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                                        : 'text-gray-600 hover:text-orange-500'
                                }`}
                            >
                                Massage Places ({livePlaces.length})
                            </button>
                        </div>
                    </div>

                    {/* Provider Cards Content */}
                    <div className="p-4">
                        {activeTab === 'therapists' ? (
                            liveTherapists.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {liveTherapists.map((therapist) => (
                                        <div key={therapist.id} className="relative">
                                            {/* Hotel Discount Badge */}
                                            <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                {therapist.hotelDiscount}% OFF
                                            </div>
                                            <TherapistCard
                                                therapist={therapist}
                                                onBook={(provider) => onBook(provider, 'therapist')}
                                                onRate={() => {}}
                                                onIncrementAnalytics={() => {}}
                                                t={t}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="text-gray-400 text-6xl mb-4">�‍♂️</div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        No Room Massage Available
                                    </h3>
                                    <p className="text-gray-500">
                                        Check back later for available therapists
                                    </p>
                                </div>
                            )
                        ) : (
                            livePlaces.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {livePlaces.map((place) => (
                                        <div key={place.id} className="relative">
                                            {/* Hotel Discount Badge */}
                                            <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                {place.hotelDiscount}% OFF
                                            </div>
                                            <PlaceCard
                                                place={place}
                                                onClick={() => onBook(place, 'place')}
                                                onRate={() => {}}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="text-gray-400 text-6xl mb-4">🏢</div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        No Massage Places Available
                                    </h3>
                                    <p className="text-gray-500">
                                        Check back later for available places
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

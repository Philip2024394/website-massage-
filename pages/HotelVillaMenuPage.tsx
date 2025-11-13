import React, { useState, useEffect, useMemo } from 'react';
import type { Therapist, Place, Booking } from '../types';
import { HotelVillaServiceStatus } from '../types';
import type { Page } from '../types/pageTypes';
import PlaceCard from '../components/PlaceCard';
import TherapistCard from '../components/TherapistCard';
import ScheduleBookingPopup from '../components/ScheduleBookingPopup';
import { getRandomTherapistImageRandom } from '../utils/therapistImageUtils';
import { useTranslations } from '../lib/useTranslations';

interface HotelVillaMenuPageProps {
    venueId: string;
    venueName: string;
    venueType?: 'hotel' | 'villa'; // Add venue type for proper booking flow
    therapists: Therapist[];
    places: Place[];
    language?: string;
    _onBook?: (provider: Therapist | Place, type: 'therapist' | 'place') => void;
    _onBookingSubmit?: (bookingData: Partial<Booking>) => Promise<void>;
    setPage?: (page: Page) => void;
    onBackToDashboard?: () => void; // New prop for back to dashboard functionality
}

const HotelVillaMenuPage: React.FC<HotelVillaMenuPageProps> = ({ 
    venueId,
    venueName,
    venueType = 'hotel', // Default to hotel if not specified
    therapists, 
    places,
    language: propLanguage = 'en',
    _onBook,
    _onBookingSubmit,
    onBackToDashboard
}) => {
    const [activeTab, setActiveTab] = useState<'therapists' | 'places'>('therapists');
    const [loading, setLoading] = useState(true);
    const [showLandingPage, setShowLandingPage] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<Therapist | Place | null>(null);
    const [selectedProviderType, setSelectedProviderType] = useState<'therapist' | 'place'>('therapist');
    const [currentLanguage] = useState<'en' | 'id'>(propLanguage as 'en' | 'id');
    
    // Use translations with current language
    // Use translations with current language
    const { t } = useTranslations(currentLanguage);

    // Render therapist content
    const renderTherapistContent = () => {
        if (liveTherapists.length > 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {liveTherapists.map((therapist) => (
                        <div key={therapist.id} className="relative">
                            <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                {therapist.hotelDiscount}% OFF
                            </div>
                            <TherapistCard
                                therapist={therapist}
                                onBook={(provider) => handleBookProvider(provider, 'therapist')}
                                onRate={() => {}}
                                onIncrementAnalytics={() => {}}
                                t={t}
                            />
                        </div>
                    ))}
                </div>
            );
        }
        
        return (
            <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">💆‍♂️</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Room Massage Available
                </h3>
                <p className="text-gray-500">
                    Check back later for available therapists
                </p>
            </div>
        );
    };

    // Render place content
    const renderPlaceContent = () => {
        if (livePlaces.length > 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {livePlaces.map((place) => (
                        <div key={place.id} className="relative">
                            <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                {place.hotelDiscount}% OFF
                            </div>
                            <PlaceCard
                                place={place}
                                onClick={() => handleBookProvider(place, 'place')}
                                onRate={() => {}}
                            />
                        </div>
                    ))}
                </div>
            );
        }
        
        return (
            <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">🏢</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Massage Places Available
                </h3>
                <p className="text-gray-500">
                    Check back later for available places
                </p>
            </div>
        );
    };

    // Handle booking modal opening
    const handleBookProvider = (provider: Therapist | Place, type: 'therapist' | 'place') => {
        setSelectedProvider(provider);
        setSelectedProviderType(type);
        setShowBookingModal(true);
    };

    // Note: Booking submission now handled by ScheduleBookingPopup with accept links and status management

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
                <div 
                    className="min-h-screen bg-cover bg-center bg-no-repeat relative"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20app%20back%20ground%20indastreets.png?updatedAt=1762389590920)'
                    }}
                >
                    <div className="absolute inset-0 bg-black/40"></div>
                    
                    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-center">
                        <div className="mb-8">
                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
                                <span className="text-white">Inda</span>
                                <span className="text-orange-400">Street</span>
                            </h1>
                            <h2 className="text-2xl md:text-3xl font-semibold text-orange-100 mb-2">
                                Live Massage Menu
                            </h2>
                            <p className="text-xl md:text-2xl font-medium text-orange-200">
                                Room Service Available 24/7
                            </p>
                        </div>

                        <button
                            onClick={() => setShowLandingPage(false)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                            View Live Menu
                        </button>
                    </div>

                    {/* Circular Back to Dashboard Button - Bottom Position for Landing */}
                    {onBackToDashboard && (
                        <button
                            onClick={onBackToDashboard}
                            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg"
                            title="Back to Dashboard"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                </div>
            ) : (
                <div className="min-h-screen bg-gray-50 relative">

                    <div className="bg-white shadow-sm border-b">
                        <div className="flex items-center justify-between p-4">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-500 shadow-lg flex-shrink-0">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/massage%20app%20back%20ground%20indastreets.png?updatedAt=1762389590920" 
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            <div className="flex-1 ml-4">
                                <h1 className="text-xl font-bold text-gray-900">
                                    Live Massage Menu
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Room Service Available 24/7
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-b">
                        <div className="flex bg-gray-200 rounded-full p-1 mx-4 my-4">
                            <button
                                onClick={() => setActiveTab('therapists')}
                                className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${
                                    activeTab === 'therapists'
                                        ? 'bg-orange-500 text-white shadow'
                                        : 'text-gray-600'
                                }`}
                            >
                                Room Service
                            </button>
                            <button
                                onClick={() => setActiveTab('places')}
                                className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${
                                    activeTab === 'places'
                                        ? 'bg-orange-500 text-white shadow'
                                        : 'text-gray-600'
                                }`}
                            >
                                Massage Places
                            </button>
                        </div>
                        <div className="text-center pb-4">
                            <p className="text-sm text-gray-600 font-medium">
                                Allow 1 Hour For Therapist To Arrive
                            </p>
                        </div>
                    </div>

                    <div className="p-4 pb-20">
                        {activeTab === 'therapists' ? renderTherapistContent() : renderPlaceContent()}
                    </div>

                    {/* Circular Back to Dashboard Button - Bottom Position */}
                    {onBackToDashboard && (
                        <button
                            onClick={onBackToDashboard}
                            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-all duration-300 hover:scale-110 shadow-lg"
                            title="Back to Dashboard"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                </div>
            )}

            {/* Enhanced Booking Modal with Accept Links */}
            {showBookingModal && selectedProvider && (
                <ScheduleBookingPopup
                    isOpen={showBookingModal}
                    onClose={() => {
                        setShowBookingModal(false);
                        setSelectedProvider(null);
                    }}
                    therapistId={selectedProvider.id?.toString() || ''}
                    therapistName={selectedProvider.name}
                    therapistType={selectedProviderType}
                    profilePicture={selectedProvider.profilePicture || selectedProvider.mainImage}
                    hotelVillaId={venueId}
                    hotelVillaName={venueName}
                    hotelVillaType={venueType}
                />
            )}
        </div>
    );
};

export default HotelVillaMenuPage;
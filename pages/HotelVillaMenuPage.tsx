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
    language = 'en',
    onBook 
}) => {
    const [venue, setVenue] = useState<VenueProfile | null>(null);
    const [activeTab, setActiveTab] = useState<'therapists' | 'places'>('therapists');
    const [loading, setLoading] = useState(true);
    
    // Use translations
    const { t } = useTranslations(language as 'en' | 'id');

    useEffect(() => {
        // TODO: Fetch venue profile from Appwrite using venueId
        // Mock data for now
        const mockVenue: VenueProfile = {
            id: venueId,
            type: 'hotel',
            name: 'Paradise Hotel Bali',
            address: 'Jl. Sunset Road No. 123, Seminyak, Bali',
            contactNumber: '+62 361 123 4567',
            bannerImage: 'https://ik.imagekit.io/7grri5v7d/garden%20forest.png',
            logoImage: 'https://ik.imagekit.io/7grri5v7d/indostreet%20app%20icon.png'
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
        <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
            {/* Banner Section */}
            <div className="relative h-72 md:h-96 overflow-hidden">
                <img 
                    src={venue.bannerImage} 
                    alt={venue.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                
                {/* Logo */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center transform translate-y-1/2 z-10">
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-6 border-white shadow-2xl overflow-hidden bg-white ring-4 ring-orange-100">
                        <img 
                            src={venue.logoImage} 
                            alt={`${venue.name} logo`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Venue Info Section */}
            <div className="pt-20 pb-8 px-4 text-center bg-white shadow-md">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                    {venue.name}
                </h1>
                <div className="max-w-2xl mx-auto space-y-3">
                    <p className="text-gray-600 flex items-center justify-center gap-2 text-base md:text-lg">
                        <svg className="w-6 h-6 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{venue.address}</span>
                    </p>
                    <p className="text-gray-600 flex items-center justify-center gap-2 text-base md:text-lg">
                        <svg className="w-6 h-6 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="font-semibold">{venue.contactNumber}</span>
                    </p>
                </div>
            </div>

            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white py-8 px-4 shadow-lg">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">
                        {t('hotelVillaMenu.welcomeTitle')}
                    </h2>
                    <p className="text-orange-50 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                        {t('hotelVillaMenu.welcomeDescription')}
                        <span className="block mt-2 font-semibold">{t('hotelVillaMenu.bookingNote')}</span>
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-0 z-10 bg-white shadow-md">
                <div className="max-w-4xl mx-auto flex">
                    <button
                        onClick={() => setActiveTab('therapists')}
                        className={`flex-1 py-4 px-6 font-semibold transition-all ${
                            activeTab === 'therapists'
                                ? 'text-orange-600 border-b-4 border-orange-500 bg-orange-50'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{t('hotelVillaMenu.therapistsTab')} ({liveTherapists.length})</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('places')}
                        className={`flex-1 py-4 px-6 font-semibold transition-all ${
                            activeTab === 'places'
                                ? 'text-orange-600 border-b-4 border-orange-500 bg-orange-50'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{t('hotelVillaMenu.wellnessCentersTab')} ({livePlaces.length})</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {activeTab === 'therapists' ? (
                    <div>
                        {liveTherapists.length === 0 ? (
                            <div className="text-center py-16">
                                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-gray-500 text-lg">{t('hotelVillaMenu.noTherapistsAvailable')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {liveTherapists.map((therapist) => (
                                    <div key={therapist.id} className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100">
                                        <TherapistCard
                                            therapist={therapist}
                                            onRate={() => {}}
                                            onBook={() => onBook(therapist, 'therapist')}
                                            onIncrementAnalytics={() => {}}
                                            t={t}
                                        />
                                        {/* ID Number Badge */}
                                        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 px-6 py-4 text-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                                            <p className="text-white/90 text-sm font-semibold mb-1 tracking-wide relative z-10">{t('hotelVillaMenu.bookingId')}</p>
                                            <p className="text-white text-3xl md:text-4xl font-bold tracking-wider relative z-10 drop-shadow-lg">
                                                #{String(therapist.id).padStart(4, '0')}
                                            </p>
                                            <p className="text-white/80 text-xs mt-2 relative z-10">{t('hotelVillaMenu.showToFrontDesk')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {livePlaces.length === 0 ? (
                            <div className="text-center py-16">
                                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <p className="text-gray-500 text-lg">{t('hotelVillaMenu.noWellnessCentersAvailable')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {livePlaces.map((place) => (
                                    <div key={place.id} className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100">
                                        <PlaceCard
                                            place={place}
                                            onClick={() => onBook(place, 'place')}
                                            onRate={() => {}}
                                        />
                                        {/* ID Number Badge */}
                                        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 px-6 py-4 text-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                                            <p className="text-white/90 text-sm font-semibold mb-1 tracking-wide relative z-10">{t('hotelVillaMenu.bookingId')}</p>
                                            <p className="text-white text-3xl md:text-4xl font-bold tracking-wider relative z-10 drop-shadow-lg">
                                                #{String(place.id).padStart(4, '0')}
                                            </p>
                                            <p className="text-white/80 text-xs mt-2 relative z-10">{t('hotelVillaMenu.showToFrontDesk')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-8 px-4 mt-20 border-t-4 border-orange-500">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} | {t('hotelVillaMenu.allRightsReserved')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HotelVillaMenuPage;

import React, { useState, useEffect } from 'react';
import type { Therapist, Place } from '../types';
import PlaceCard from '../components/PlaceCard';
import TherapistCard from '../components/TherapistCard';

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
    therapists: Therapist[];
    places: Place[];
    onBook: (provider: Therapist | Place, type: 'therapist' | 'place') => void;
}

const HotelVillaMenuPage: React.FC<HotelVillaMenuPageProps> = ({ 
    venueId, 
    therapists, 
    places, 
    onBook 
}) => {
    const [venue, setVenue] = useState<VenueProfile | null>(null);
    const [activeTab, setActiveTab] = useState<'therapists' | 'places'>('therapists');
    const [loading, setLoading] = useState(true);

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

    // Filter only live providers
    const liveTherapists = therapists.filter(t => t.isLive);
    const livePlaces = places.filter(p => p.isLive);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading menu...</p>
                </div>
            </div>
        );
    }

    if (!venue) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Venue Not Found</h2>
                    <p className="text-gray-600">This menu is not available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
            {/* Banner Section */}
            <div className="relative h-64 md:h-80 overflow-hidden">
                <img 
                    src={venue.bannerImage} 
                    alt={venue.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                
                {/* Logo */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center transform translate-y-1/2">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                        <img 
                            src={venue.logoImage} 
                            alt={`${venue.name} logo`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Venue Info Section */}
            <div className="pt-16 pb-6 px-4 text-center bg-white shadow-sm">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    {venue.name}
                </h1>
                <div className="max-w-2xl mx-auto space-y-2">
                    <p className="text-gray-600 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {venue.address}
                    </p>
                    <p className="text-gray-600 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {venue.contactNumber}
                    </p>
                </div>
            </div>

            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                        Welcome to Our Wellness Menu
                    </h2>
                    <p className="text-orange-100 text-sm md:text-base">
                        Browse our exclusive selection of professional therapists and wellness centers. 
                        Note the ID number and contact our front desk to book your perfect relaxation experience.
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
                            <span>Therapists ({liveTherapists.length})</span>
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
                            <span>Wellness Centers ({livePlaces.length})</span>
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
                                <p className="text-gray-500 text-lg">No therapists available at the moment</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {liveTherapists.map((therapist) => (
                                    <div key={therapist.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                        <TherapistCard
                                            therapist={therapist}
                                            onRate={() => {}}
                                            onBook={() => onBook(therapist, 'therapist')}
                                            onIncrementAnalytics={() => {}}
                                            t={{}}
                                        />
                                        {/* ID Number Badge */}
                                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-center">
                                            <p className="text-white text-sm font-medium mb-1">Booking ID</p>
                                            <p className="text-white text-2xl font-bold tracking-wider">
                                                #{String(therapist.id).padStart(4, '0')}
                                            </p>
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
                                <p className="text-gray-500 text-lg">No wellness centers available at the moment</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {livePlaces.map((place) => (
                                    <div key={place.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                        <PlaceCard
                                            place={place}
                                            onClick={() => onBook(place, 'place')}
                                            onRate={() => {}}
                                        />
                                        {/* ID Number Badge */}
                                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-center">
                                            <p className="text-white text-sm font-medium mb-1">Booking ID</p>
                                            <p className="text-white text-2xl font-bold tracking-wider">
                                                #{String(place.id).padStart(4, '0')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gray-900 text-white py-8 px-4 mt-16">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold mb-2">
                            <span className="text-white">Inda</span>
                            <span className="text-orange-400">Street</span>
                        </h3>
                        <p className="text-gray-400 text-sm">Professional Wellness Services</p>
                    </div>
                    <p className="text-gray-500 text-xs">
                        Powered by IndaStreet © {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HotelVillaMenuPage;

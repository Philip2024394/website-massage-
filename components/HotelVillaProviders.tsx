import React, { useState } from 'react';
import { Therapist, Place, HotelVillaServiceStatus } from '../types';
import { parsePricing } from '../utils/appwriteHelpers';

interface ProviderWithDiscount {
    id: number;
    name: string;
    type: 'therapist' | 'place';
    image: string;
    location: string;
    rating: number;
    reviewCount: number;
    originalPricing: any;
    hotelDiscount: number;
    villaDiscount: number;
    whatsappNumber: string;
    description: string;
}

interface HotelVillaProvidersProps {
    therapists: Therapist[];
    places: Place[];
    viewerType: 'hotel' | 'villa';
    onContactProvider: (providerId: number, providerType: 'therapist' | 'place') => void;
}

const HotelVillaProviders: React.FC<HotelVillaProvidersProps> = ({
    therapists,
    places,
    viewerType,
    onContactProvider
}) => {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'therapist' | 'place'>('all');
    const [sortBy, setSortBy] = useState<'discount' | 'rating' | 'name'>('discount');

    // Filter providers that have opted in to hotel/villa services
    const getAvailableProviders = (): ProviderWithDiscount[] => {
        const providers: ProviderWithDiscount[] = [];

        // Add therapists
        therapists
            .filter(t => t.hotelVillaServiceStatus === HotelVillaServiceStatus.OptedIn)
            .forEach(therapist => {
                const discount = viewerType === 'hotel' ? (therapist.hotelDiscount || 0) : (therapist.villaDiscount || 0);
                if (discount > 0) {
                    providers.push({
                        id: therapist.id,
                        name: therapist.name,
                        type: 'therapist',
                        image: therapist.profilePicture,
                        location: therapist.location,
                        rating: therapist.rating,
                        reviewCount: therapist.reviewCount,
                        originalPricing: parsePricing(therapist.pricing),
                        hotelDiscount: therapist.hotelDiscount || 0,
                        villaDiscount: therapist.villaDiscount || 0,
                        whatsappNumber: therapist.whatsappNumber,
                        description: therapist.description
                    });
                }
            });

        // Add places
        places
            .filter(p => p.hotelVillaServiceStatus === HotelVillaServiceStatus.OptedIn)
            .forEach(place => {
                const discount = viewerType === 'hotel' ? (place.hotelDiscount || 0) : (place.villaDiscount || 0);
                if (discount > 0) {
                    providers.push({
                        id: place.id,
                        name: place.name,
                        type: 'place',
                        image: place.mainImage,
                        location: place.location,
                        rating: place.rating,
                        reviewCount: place.reviewCount,
                        originalPricing: parsePricing(place.pricing),
                        hotelDiscount: place.hotelDiscount || 0,
                        villaDiscount: place.villaDiscount || 0,
                        whatsappNumber: place.whatsappNumber,
                        description: place.description
                    });
                }
            });

        return providers;
    };

    const filteredProviders = getAvailableProviders()
        .filter(provider => selectedFilter === 'all' || provider.type === selectedFilter)
        .sort((a, b) => {
            switch (sortBy) {
                case 'discount':
                    const aDiscount = viewerType === 'hotel' ? a.hotelDiscount : a.villaDiscount;
                    const bDiscount = viewerType === 'hotel' ? b.hotelDiscount : b.villaDiscount;
                    return bDiscount - aDiscount;
                case 'rating':
                    return b.rating - a.rating;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

    const calculateDiscountedPrice = (originalPrice: number, discount: number) => {
        return Math.round(originalPrice * (1 - discount / 100));
    };

    const currentDiscount = viewerType === 'hotel' ? 'hotelDiscount' : 'villaDiscount';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 capitalize">
                            {viewerType} Massage Partners
                        </h2>
                        <p className="text-gray-600">
                            Therapists and massage places offering exclusive discounts for your guests
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-600">Available Partners</div>
                        <div className="text-3xl font-bold text-orange-500">{filteredProviders.length}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setSelectedFilter('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                selectedFilter === 'all'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All ({getAvailableProviders().length})
                        </button>
                        <button
                            onClick={() => setSelectedFilter('therapist')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                selectedFilter === 'therapist'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Therapists ({getAvailableProviders().filter(p => p.type === 'therapist').length})
                        </button>
                        <button
                            onClick={() => setSelectedFilter('place')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                selectedFilter === 'place'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Massage Places ({getAvailableProviders().filter(p => p.type === 'place').length})
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        >
                            <option value="discount">Highest Discount</option>
                            <option value="rating">Highest Rating</option>
                            <option value="name">Name A-Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map(provider => {
                    const discount = viewerType === 'hotel' ? provider.hotelDiscount : provider.villaDiscount;
                    return (
                        <div key={`${provider.type}-${provider.id}`} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Provider Image */}
                            <div className="relative">
                                <img
                                    src={provider.image}
                                    alt={provider.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        {discount}% OFF
                                    </span>
                                </div>
                                <div className="absolute top-2 left-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        provider.type === 'therapist' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {provider.type === 'therapist' ? 'Personal Therapist' : 'Massage Place'}
                                    </span>
                                </div>
                            </div>

                            {/* Provider Info */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{provider.name}</h3>
                                        <p className="text-sm text-gray-600">{provider.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center text-yellow-500">
                                            <span className="text-sm font-medium">{provider.rating}</span>
                                            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-gray-500">{provider.reviewCount} reviews</p>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{provider.description}</p>

                                {/* Pricing */}
                                <div className="space-y-2 mb-4">
                                    <h4 className="font-medium text-gray-800">Your Guest Pricing:</h4>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <div className="text-xs text-gray-600">60 min</div>
                                            <div className="line-through text-gray-400 text-xs">
                                                Rp {provider.originalPricing["60"].toLocaleString()}
                                            </div>
                                            <div className="font-bold text-orange-600">
                                                Rp {calculateDiscountedPrice(provider.originalPricing["60"], discount).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-600">ID: {provider.id}01</div>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <div className="text-xs text-gray-600">90 min</div>
                                            <div className="line-through text-gray-400 text-xs">
                                                Rp {provider.originalPricing["90"].toLocaleString()}
                                            </div>
                                            <div className="font-bold text-orange-600">
                                                Rp {calculateDiscountedPrice(provider.originalPricing["90"], discount).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-600">ID: {provider.id}02</div>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <div className="text-xs text-gray-600">120 min</div>
                                            <div className="line-through text-gray-400 text-xs">
                                                Rp {provider.originalPricing["120"].toLocaleString()}
                                            </div>
                                            <div className="font-bold text-orange-600">
                                                Rp {calculateDiscountedPrice(provider.originalPricing["120"], discount).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-600">ID: {provider.id}03</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Button */}
                                <button
                                    onClick={() => onContactProvider(provider.id, provider.type)}
                                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors font-medium"
                                >
                                    Contact Provider
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredProviders.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">No Partners Available</h3>
                    <p className="text-gray-600">
                        No therapists or massage places have opted in for {viewerType} services yet.
                        Check back later or contact us to invite specific providers.
                    </p>
                </div>
            )}
        </div>
    );
};

export default HotelVillaProviders;
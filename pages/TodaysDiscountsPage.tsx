import React, { useState } from 'react';
import { ArrowLeft, Clock, MapPin, Star } from 'lucide-react';
import type { Page } from '../types/pageTypes';

interface Therapist {
    id: string;
    name: string;
    profilePicture: string;
    location: string;
    rating: number;
    discount: number;
    timeLeft: string;
    services: string[];
    whatsappNumber: string;
}

interface TodaysDiscountsPageProps {
    onBack: () => void;
    onNavigate?: (page: Page) => void;
    t?: any;
}

const TodaysDiscountsPage: React.FC<TodaysDiscountsPageProps> = ({ onBack }) => {
    // Sample therapists with active discounts
    const [discountedTherapists] = useState<Therapist[]>([
        {
            id: '1',
            name: 'Sarah Thompson',
            profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
            location: 'Seminyak, Bali',
            rating: 4.9,
            discount: 30,
            timeLeft: '2h 45m',
            services: ['Swedish Massage', 'Deep Tissue', 'Hot Stone'],
            whatsappNumber: '+6281234567890'
        },
        {
            id: '2',
            name: 'Made Wijaya',
            profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            location: 'Ubud, Bali',
            rating: 4.8,
            discount: 25,
            timeLeft: '4h 15m',
            services: ['Balinese Massage', 'Aromatherapy', 'Reflexology'],
            whatsappNumber: '+6281234567891'
        },
        {
            id: '3',
            name: 'Lisa Anderson',
            profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
            location: 'Canggu, Bali',
            rating: 5.0,
            discount: 40,
            timeLeft: '1h 30m',
            services: ['Thai Massage', 'Sports Massage', 'Prenatal'],
            whatsappNumber: '+6281234567892'
        },
        {
            id: '4',
            name: 'Ketut Sari',
            profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
            location: 'Sanur, Bali',
            rating: 4.7,
            discount: 20,
            timeLeft: '5h 20m',
            services: ['Traditional Balinese', 'Lomi Lomi', 'Shiatsu'],
            whatsappNumber: '+6281234567893'
        },
        {
            id: '5',
            name: 'David Chen',
            profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
            location: 'Kuta, Bali',
            rating: 4.6,
            discount: 35,
            timeLeft: '3h 10m',
            services: ['Deep Tissue', 'Trigger Point', 'Cupping'],
            whatsappNumber: '+6281234567894'
        },
        {
            id: '6',
            name: 'Wayan Putra',
            profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
            location: 'Denpasar, Bali',
            rating: 4.9,
            discount: 15,
            timeLeft: '6h 45m',
            services: ['Swedish', 'Hot Stone', 'Couples Massage'],
            whatsappNumber: '+6281234567895'
        }
    ]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-600 text-white sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onBack}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="flex-grow">
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                🔥 Today's Discounts
                            </h1>
                            <p className="text-sm text-orange-100">
                                Limited time offers • {discountedTherapists.length} active deals
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Info Banner */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 pb-20 mb-6 shadow-lg animate-pulse">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">⚡</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Flash Sales Ending Soon!</h3>
                            <p className="text-sm text-gray-800">Book now to secure these amazing discounts</p>
                        </div>
                    </div>
                </div>

                {/* Therapists Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {discountedTherapists.map((therapist) => (
                        <div 
                            key={therapist.id}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border-2 border-transparent hover:border-orange-400 relative"
                        >
                            {/* Discount Badge */}
                            <div className="absolute top-3 right-3 z-10">
                                <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg animate-bounce">
                                    -{therapist.discount}% OFF
                                </div>
                            </div>

                            {/* Timer Badge */}
                            <div className="absolute top-3 left-3 z-10">
                                <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-semibold text-sm flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {therapist.timeLeft}
                                </div>
                            </div>

                            {/* Profile Image */}
                            <div className="relative h-64 overflow-hidden">
                                <img 
                                    src={therapist.profilePicture} 
                                    alt={therapist.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>

                            {/* Therapist Info */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{therapist.name}</h3>
                                
                                {/* Location */}
                                <div className="flex items-center gap-2 text-gray-600 mb-3">
                                    <MapPin className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm">{therapist.location}</span>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
                                        <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                                        <span className="font-semibold text-gray-900">{therapist.rating}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">(250+ reviews)</span>
                                </div>

                                {/* Services */}
                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {therapist.services.map((service, index) => (
                                            <span 
                                                key={index}
                                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                                            >
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Price & Book Button */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-orange-600">
                                                ${Math.round(100 * (1 - therapist.discount / 100))}
                                            </span>
                                            <span className="text-lg text-gray-400 line-through">$100</span>
                                        </div>
                                        <span className="text-xs text-gray-500">per session</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            // Use global booking popup
                                            const openBookingPopup = (window as any).openBookingPopup;
                                            if (openBookingPopup) {
                                                openBookingPopup(
                                                    therapist.name,
                                                    therapist.whatsappNumber,
                                                    therapist.id,
                                                    'therapist'
                                                );
                                            }
                                        }}
                                        className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State (hidden when we have therapists) */}
                {discountedTherapists.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">😴</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Discounts</h3>
                        <p className="text-gray-600">Check back later for amazing deals!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodaysDiscountsPage;


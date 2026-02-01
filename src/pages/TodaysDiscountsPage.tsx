// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useMemo } from 'react';
import { ArrowLeft, Clock, MapPin, Star } from 'lucide-react';
import type { Page } from '../types/pageTypes';

// Using real Appwrite therapist type subset
interface LiveDiscountTherapist {
    id: string;
    name: string;
    profilePicture?: string;
    location?: string;
    rating?: number;
    reviewCount?: number;
    discountPercentage?: number;
    discountEndTime?: string;
    whatsappNumber?: string;
    massageTypes?: string; // JSON string
}

interface TodaysDiscountsPageProps {
    onBack: () => void;
    onNavigate?: (page: Page) => void;
    t?: any;
}

const TodaysDiscountsPage: React.FC<TodaysDiscountsPageProps & { therapists?: any[] }> = ({ onBack, therapists = [] }) => {
    // Derive discounted therapists strictly from live Appwrite data
    const discountedTherapists: LiveDiscountTherapist[] = useMemo(() => {
        return (therapists || [])
            .filter(t => t && t.isLive === true)
            .filter(t => t.discountPercentage && t.discountPercentage > 0 && t.discountEndTime && t.isDiscountActive === true)
            .map(t => ({
                id: String(t.$id || t.id),
                name: t.name,
                profilePicture: t.profilePicture || t.mainImage,
                location: t.location,
                rating: t.rating,
                reviewCount: t.reviewCount,
                discountPercentage: t.discountPercentage,
                discountEndTime: t.discountEndTime,
                whatsappNumber: t.whatsappNumber,
                massageTypes: t.massageTypes
            }))
            .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    }, [therapists]);

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 via-white to-pink-50">
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
                                    -{therapist.discountPercentage}% OFF
                                </div>
                            </div>

                            {/* Timer Badge */}
                            <div className="absolute top-3 left-3 z-10">
                                <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-semibold text-sm flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {(() => {
                                        if (!therapist.discountEndTime) return '—';
                                        try {
                                            const end = new Date(therapist.discountEndTime).getTime();
                                            const now = Date.now();
                                            const diff = end - now;
                                            if (diff <= 0) return 'Expired';
                                            const hours = Math.floor(diff / (1000 * 60 * 60));
                                            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                            return `${hours}h ${mins}m`;
                                        } catch { return '—'; }
                                    })()}
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
                                    <span className="text-sm">{therapist.location || 'Location updating'}</span>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
                                        <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                                        <span className="font-semibold text-gray-900">{therapist.rating || '—'}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">{therapist.reviewCount ? `(${therapist.reviewCount}+ reviews)` : ''}</span>
                                </div>

                                {/* Services */}
                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {(() => {
                                            try {
                                                const arr = therapist.massageTypes ? JSON.parse(therapist.massageTypes) : [];
                                                return Array.isArray(arr) ? arr.slice(0,5).map((service: string, index: number) => (
                                                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">{service}</span>
                                                )) : null;
                                            } catch { return null; }
                                        })()}
                                    </div>
                                </div>

                                {/* Price & Book Button */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Discount ends</span>
                                            <span className="text-sm font-semibold text-orange-600">
                                                {therapist.discountEndTime ? new Date(therapist.discountEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">Live discount</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            console.warn('⚠️ DEPRECATED: Book Now from TodaysDiscountsPage - global booking removed');
                                            console.log('ℹ️ Navigate to therapist profile to use local booking modal');
                                            // TODO: Navigate to therapist profile instead of broken global booking
                                        }}
                                        className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                                        disabled
                                    >
                                        Book Now (Disabled)
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
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Live Discounts</h3>
                        <p className="text-gray-600">Live therapist discounts will appear here automatically.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodaysDiscountsPage;


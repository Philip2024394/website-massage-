import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, Zap, Filter, Search } from 'lucide-react';
import Button from '../components/Button';
import { getAllActiveDiscounts, subscribeToDiscounts, type ActiveDiscount as AppwriteDiscount } from '../lib/discountService';

interface ActivePromotion {
    id: string;
    providerId: string;
    providerName: string;
    providerType: 'therapist' | 'place';
    percentage: number;
    imageUrl: string;
    expiresAt: Date;
    location: string;
    rating: number;
    profilePicture: string;
}

interface TodaysDiscountsPageProps {
    onNavigateToProvider: (providerId: string, providerType: 'therapist' | 'place') => void;
    onNavigateToHome: () => void;
}

// Countdown Timer Component
const CountdownTimer: React.FC<{ expiresAt: Date }> = ({ expiresAt }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = expiresAt.getTime() - now;

            if (distance < 0) {
                setTimeLeft('EXPIRED');
                clearInterval(interval);
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Mark as urgent if less than 2 hours left
            setIsUrgent(hours < 2);
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    return (
        <div className={`flex items-center gap-2 font-bold ${isUrgent ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
            <Clock size={18} />
            <span className="text-sm">{timeLeft}</span>
        </div>
    );
};

const TodaysDiscountsPage: React.FC<TodaysDiscountsPageProps> = ({
    onNavigateToProvider,
    onNavigateToHome,
}) => {
    const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
    const [filteredPromotions, setFilteredPromotions] = useState<ActivePromotion[]>([]);
    const [filterType, setFilterType] = useState<'all' | 'therapist' | 'place'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'discount' | 'time' | 'rating'>('discount');
    const [loading, setLoading] = useState(true);

    // Load active promotions from Appwrite with real-time updates
    useEffect(() => {
        const unsubscribe = subscribeToDiscounts((discounts: AppwriteDiscount[]) => {
            const mapped = discounts.map(d => ({
                id: d.$id || '',
                providerId: d.providerId,
                providerName: d.providerName,
                providerType: d.providerType,
                percentage: d.percentage,
                imageUrl: d.imageUrl,
                expiresAt: new Date(d.expiresAt),
                location: d.location || '',
                rating: d.rating || 0,
                profilePicture: d.profilePicture || ''
            }));
            setPromotions(mapped);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Filter and sort promotions
    useEffect(() => {
        let filtered = [...promotions];

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(p => p.providerType === filterType);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(p => 
                p.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'discount':
                    return b.percentage - a.percentage;
                case 'time':
                    return a.expiresAt.getTime() - b.expiresAt.getTime();
                case 'rating':
                    return b.rating - a.rating;
                default:
                    return 0;
            }
        });

        setFilteredPromotions(filtered);
    }, [promotions, filterType, searchQuery, sortBy]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white p-6 shadow-lg sticky top-0 z-10">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={onNavigateToHome}
                        className="text-white hover:text-orange-200 mb-3 flex items-center gap-2"
                    >
                        ← Back
                    </button>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Zap className="animate-pulse" />
                        Today's Discounts
                    </h1>
                    <p className="text-orange-100">Limited-time offers from massage providers near you!</p>
                    <div className="mt-4 bg-white bg-opacity-20 rounded-lg px-4 py-2 inline-block">
                        <p className="text-sm font-semibold">⚡ {filteredPromotions.length} Active Offers Available</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        {/* Provider Type Filter */}
                        <div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                            >
                                <option value="all">All Providers</option>
                                <option value="therapist">Therapists Only</option>
                                <option value="place">Spas/Places Only</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                            >
                                <option value="discount">Highest Discount</option>
                                <option value="time">Ending Soon</option>
                                <option value="rating">Top Rated</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Promotions Grid */}
                {filteredPromotions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPromotions.map((promo) => (
                            <div
                                key={promo.id}
                                className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-2xl transform hover:scale-105 cursor-pointer"
                                onClick={() => onNavigateToProvider(promo.providerId, promo.providerType)}
                            >
                                {/* Discount Badge */}
                                <div className="relative">
                                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-600 text-white px-4 py-2 rounded-full shadow-lg z-10 animate-pulse">
                                        <p className="text-2xl font-bold">{promo.percentage}% OFF</p>
                                    </div>
                                    <img
                                        src={promo.imageUrl}
                                        alt={`${promo.percentage}% discount`}
                                        className="w-full h-48 object-cover"
                                    />
                                </div>

                                {/* Provider Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{promo.providerName}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                <MapPin size={14} />
                                                <span>{promo.location}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
                                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                            <span className="font-bold text-sm">{promo.rating}</span>
                                        </div>
                                    </div>

                                    {/* Provider Type Badge */}
                                    <div className="mb-3">
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                            promo.providerType === 'therapist' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'bg-purple-100 text-purple-700'
                                        }`}>
                                            {promo.providerType === 'therapist' ? '👤 Therapist' : '🏢 Spa/Place'}
                                        </span>
                                    </div>

                                    {/* Countdown Timer */}
                                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 mb-3">
                                        <p className="text-xs text-gray-600 mb-1">⏰ Offer ends in:</p>
                                        <CountdownTimer expiresAt={promo.expiresAt} />
                                    </div>

                                    {/* Book Button */}
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNavigateToProvider(promo.providerId, promo.providerType);
                                        }}
                                        className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Zap size={20} />
                                        Book Now & Save {promo.percentage}%
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Active Discounts Found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery || filterType !== 'all' 
                                ? 'Try adjusting your filters or search query' 
                                : 'Check back soon for new limited-time offers!'}
                        </p>
                        <Button
                            onClick={onNavigateToHome}
                            className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-purple-700 transition-all"
                        >
                            Browse All Providers
                        </Button>
                    </div>
                )}

                {/* Info Banner */}
                {filteredPromotions.length > 0 && (
                    <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                        <h3 className="font-bold text-blue-900 mb-2">💡 Pro Tip</h3>
                        <p className="text-sm text-blue-800">
                            Discounts are time-limited! Book quickly to secure your savings. 
                            New offers are added throughout the day.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodaysDiscountsPage;

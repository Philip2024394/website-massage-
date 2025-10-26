import React, { useState, useEffect } from 'react';
import { analyticsService, PlatformAnalytics } from '../services/analyticsService';
import { TrendingUp, Users, DollarSign, Calendar, Star, MapPin, Award, Activity } from 'lucide-react';

const PlatformAnalyticsPage: React.FC = () => {
    const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const endDate = new Date().toISOString();
            const startDate = getStartDate(dateRange);
            
            const data = await analyticsService.getPlatformAnalytics(startDate, endDate);
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching platform analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStartDate = (range: '7d' | '30d' | '90d' | 'all'): string => {
        const now = new Date();
        switch (range) {
            case '7d':
                return new Date(now.setDate(now.getDate() - 7)).toISOString();
            case '30d':
                return new Date(now.setDate(now.getDate() - 30)).toISOString();
            case '90d':
                return new Date(now.setDate(now.getDate() - 90)).toISOString();
            case 'all':
                return new Date('2024-01-01').toISOString();
            default:
                return new Date(now.setDate(now.getDate() - 30)).toISOString();
        }
    };

    const formatCurrency = (amount: number): string => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">No analytics data available</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">IndaStreet Platform Analytics</h1>
                    <p className="text-gray-600">Complete overview of platform performance and success metrics</p>
                </div>

                {/* Date Range Selector */}
                <div className="mb-6 flex gap-2">
                    {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                dateRange === range
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {range === '7d' && 'Last 7 Days'}
                            {range === '30d' && 'Last 30 Days'}
                            {range === '90d' && 'Last 90 Days'}
                            {range === 'all' && 'All Time'}
                        </button>
                    ))}
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Users */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="w-8 h-8" />
                            <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                                Total Users
                            </div>
                        </div>
                        <div className="text-4xl font-bold mb-2">{formatNumber(analytics.totalUsers)}</div>
                        <div className="text-sm text-blue-100">
                            {formatNumber(analytics.activeUsers)} active
                        </div>
                    </div>

                    {/* Total Providers */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <MapPin className="w-8 h-8" />
                            <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                                Providers
                            </div>
                        </div>
                        <div className="text-4xl font-bold mb-2">
                            {formatNumber(analytics.totalTherapists + analytics.totalPlaces)}
                        </div>
                        <div className="text-sm text-purple-100">
                            {formatNumber(analytics.liveTherapists + analytics.livePlaces)} live now
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign className="w-8 h-8" />
                            <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                                Revenue
                            </div>
                        </div>
                        <div className="text-4xl font-bold mb-2">{formatCurrency(analytics.totalRevenue)}</div>
                        <div className="text-sm text-green-100">
                            Avg: {formatCurrency(analytics.averageBookingValue)}/booking
                        </div>
                    </div>

                    {/* Total Bookings */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Calendar className="w-8 h-8" />
                            <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                                Bookings
                            </div>
                        </div>
                        <div className="text-4xl font-bold mb-2">{formatNumber(analytics.totalBookings)}</div>
                        <div className="text-sm text-orange-100">
                            {analytics.bookingCompletionRate.toFixed(1)}% completion rate
                        </div>
                    </div>
                </div>

                {/* Provider Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Therapist Stats */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity className="w-6 h-6 text-brand-500" />
                            Therapist Network
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-700 font-medium">Total Therapists</span>
                                <span className="text-2xl font-bold text-gray-900">{analytics.totalTherapists}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                                <span className="text-gray-700 font-medium">Live & Available</span>
                                <span className="text-2xl font-bold text-green-600">{analytics.liveTherapists}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                                <span className="text-gray-700 font-medium">Avg Bookings/Therapist</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    {analytics.averageBookingsPerProvider.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Place Stats */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-purple-500" />
                            Massage Places
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-700 font-medium">Total Places</span>
                                <span className="text-2xl font-bold text-gray-900">{analytics.totalPlaces}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                                <span className="text-gray-700 font-medium">Live & Available</span>
                                <span className="text-2xl font-bold text-green-600">{analytics.livePlaces}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                                <span className="text-gray-700 font-medium">Avg Bookings/Place</span>
                                <span className="text-2xl font-bold text-purple-600">
                                    {analytics.averageBookingsPerProvider.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hotel/Villa Network */}
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-6 h-6 text-brand-500" />
                        Hotel & Villa Network
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl">
                            <div className="text-sm text-gray-600 mb-1">Total Hotels</div>
                            <div className="text-3xl font-bold text-brand-600">{analytics.totalHotels}</div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                            <div className="text-sm text-gray-600 mb-1">Total Villas</div>
                            <div className="text-3xl font-bold text-orange-600">{analytics.totalVillas}</div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                            <div className="text-sm text-gray-600 mb-1">Total Commissions</div>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(analytics.totalCommissions)}</div>
                        </div>
                    </div>
                </div>

                {/* Booking Performance */}
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                        Booking Performance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
                            <div className="text-3xl font-bold text-blue-600">{analytics.totalBookings}</div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-1">Completed</div>
                            <div className="text-3xl font-bold text-green-600">{analytics.completedBookings}</div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-1">Cancelled</div>
                            <div className="text-3xl font-bold text-red-600">{analytics.cancelledBookings}</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-1">Success Rate</div>
                            <div className="text-3xl font-bold text-purple-600">{analytics.bookingCompletionRate.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>

                {/* Top Performers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Therapists */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />
                            Top Therapists
                        </h3>
                        <div className="space-y-3">
                            {analytics.topTherapists.length > 0 ? (
                                analytics.topTherapists.map((therapist, idx) => (
                                    <div key={therapist.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{therapist.name}</div>
                                                <div className="text-sm text-gray-500">{therapist.bookings} bookings • ⭐ {therapist.rating.toFixed(1)}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-green-600">{formatCurrency(therapist.revenue)}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">No data available</p>
                            )}
                        </div>
                    </div>

                    {/* Top Places */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />
                            Top Massage Places
                        </h3>
                        <div className="space-y-3">
                            {analytics.topPlaces.length > 0 ? (
                                analytics.topPlaces.map((place, idx) => (
                                    <div key={place.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{place.name}</div>
                                                <div className="text-sm text-gray-500">{place.bookings} bookings • ⭐ {place.rating.toFixed(1)}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-green-600">{formatCurrency(place.revenue)}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">No data available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    Last updated: {new Date(analytics.lastUpdated).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                    })}
                </div>
            </div>
        </div>
    );
};

export default PlatformAnalyticsPage;

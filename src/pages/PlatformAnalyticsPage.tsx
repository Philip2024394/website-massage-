// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
import React, { useState, useEffect } from 'react';
import { analyticsService, PlatformAnalytics } from '../services/analyticsService';
import { TrendingUp, Users, DollarSign, Calendar, Star, MapPin, Award, BarChart } from 'lucide-react';

interface KpiProps { icon: React.ReactNode; label: string; value: string; sub?: string; }
const KpiCard: React.FC<KpiProps> = ({ icon, label, value, sub }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col gap-1 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-600">{icon}<span>{label}</span></div>
        <div className="text-lg font-semibold text-gray-900 leading-none">{value}</div>
        {sub && <div className="text-[10px] text-gray-500">{sub}</div>}
    </div>
);

const PlatformAnalyticsPage: React.FC = () => {
    const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
    const [showDetailed, setShowDetailed] = useState(false);

    useEffect(() => { fetchAnalytics(); }, [dateRange]);

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
            case '7d': return new Date(now.setDate(now.getDate() - 7)).toISOString();
            case '30d': return new Date(now.setDate(now.getDate() - 30)).toISOString();
            case '90d': return new Date(now.setDate(now.getDate() - 90)).toISOString();
            case 'all': return new Date('2024-01-01').toISOString();
            default: return new Date(now.setDate(now.getDate() - 30)).toISOString();
        }
    };

    const formatCurrency = (amount: number): string => `Rp ${amount.toLocaleString('id-ID')}`;
    const formatNumber = (num: number): string => {
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
        if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
        return num.toString();
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex items-center justify-center bg-gray-50">
                <p className="text-gray-600">No analytics data available</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
                        <p className="text-sm text-gray-600">Key live KPIs. Toggle for full analytics.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {(['7d', '30d', '90d', 'all'] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${dateRange === range ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                            >
                                {range.toUpperCase()}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowDetailed(d => !d)}
                            className="ml-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-900 text-white hover:bg-black"
                        >
                            {showDetailed ? 'Minimal View' : 'Detailed View'}
                        </button>
                    </div>
                </div>

                {/* Minimal KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <KpiCard icon={<Users className="w-4 h-4 text-blue-600" />} label="Users" value={formatNumber(analytics.totalUsers)} sub={`${formatNumber(analytics.activeUsers)} active`} />
                    <KpiCard icon={<MapPin className="w-4 h-4 text-purple-600" />} label="Providers" value={formatNumber(analytics.totalTherapists + analytics.totalPlaces)} sub={`${formatNumber(analytics.liveTherapists + analytics.livePlaces)} live`} />
                    <KpiCard icon={<Calendar className="w-4 h-4 text-orange-600" />} label="Bookings" value={formatNumber(analytics.totalBookings)} sub={`${analytics.bookingCompletionRate.toFixed(1)}% success`} />
                    <KpiCard icon={<DollarSign className="w-4 h-4 text-green-600" />} label="Revenue" value={formatCurrency(analytics.totalRevenue)} sub={`Avg ${formatCurrency(analytics.averageBookingValue)}`} />
                    <KpiCard icon={<TrendingUp className="w-4 h-4 text-indigo-600" />} label="Growth" value={`${(analytics.userGrowthRate || 0).toFixed(1)}%`} sub={`Providers ${(analytics.providerGrowthRate || 0).toFixed(1)}%`} />
                    <KpiCard icon={<BarChart className="w-4 h-4 text-red-600" />} label="Conversion" value={`${(analytics.platformConversionRate || 0).toFixed(1)}%`} sub={`${formatNumber(analytics.averageBookingsPerUser)} bk/user`} />
                </div>

                {showDetailed && (
                    <div className="space-y-8">
                        {/* Original Gradient Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4"><Users className="w-8 h-8" /><div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">Total Users</div></div>
                                <div className="text-4xl font-bold mb-2">{formatNumber(analytics.totalUsers)}</div>
                                <div className="text-sm text-blue-100">{formatNumber(analytics.activeUsers)} active</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4"><MapPin className="w-8 h-8" /><div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">Providers</div></div>
                                <div className="text-4xl font-bold mb-2">{formatNumber(analytics.totalTherapists + analytics.totalPlaces)}</div>
                                <div className="text-sm text-purple-100">{formatNumber(analytics.liveTherapists + analytics.livePlaces)} live now</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4"><DollarSign className="w-8 h-8" /><div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">Revenue</div></div>
                                <div className="text-4xl font-bold mb-2">{formatCurrency(analytics.totalRevenue)}</div>
                                <div className="text-sm text-green-100">Avg: {formatCurrency(analytics.averageBookingValue)}/booking</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4"><Calendar className="w-8 h-8" /><div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">Bookings</div></div>
                                <div className="text-4xl font-bold mb-2">{formatNumber(analytics.totalBookings)}</div>
                                <div className="text-sm text-orange-100">{analytics.bookingCompletionRate.toFixed(1)}% completion rate</div>
                            </div>
                        </div>

                        {/* Provider Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart className="w-6 h-6 text-brand-500" />Therapist Network</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 pb-20 bg-gray-50 rounded-xl"><span className="text-gray-700 font-medium">Total Therapists</span><span className="text-2xl font-bold text-gray-900">{analytics.totalTherapists}</span></div>
                                    <div className="flex justify-between items-center p-4 pb-20 bg-green-50 rounded-xl"><span className="text-gray-700 font-medium">Live & Available</span><span className="text-2xl font-bold text-green-600">{analytics.liveTherapists}</span></div>
                                    <div className="flex justify-between items-center p-4 pb-20 bg-blue-50 rounded-xl"><span className="text-gray-700 font-medium">Avg Bookings/Therapist</span><span className="text-2xl font-bold text-blue-600">{analytics.averageBookingsPerProvider.toFixed(1)}</span></div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-6 h-6 text-purple-500" />Massage Places</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 pb-20 bg-gray-50 rounded-xl"><span className="text-gray-700 font-medium">Total Places</span><span className="text-2xl font-bold text-gray-900">{analytics.totalPlaces}</span></div>
                                    <div className="flex justify-between items-center p-4 pb-20 bg-green-50 rounded-xl"><span className="text-gray-700 font-medium">Live & Available</span><span className="text-2xl font-bold text-green-600">{analytics.livePlaces}</span></div>
                                    <div className="flex justify-between items-center p-4 pb-20 bg-purple-50 rounded-xl"><span className="text-gray-700 font-medium">Avg Bookings/Place</span><span className="text-2xl font-bold text-purple-600">{analytics.averageBookingsPerProvider.toFixed(1)}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Hotel/Villa Network */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Award className="w-6 h-6 text-brand-500" />Hotel & Villa Network</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-20">
                                <div className="p-4 pb-20 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl"><div className="text-sm text-gray-600 mb-1">Total Hotels</div><div className="text-3xl font-bold text-brand-600">{analytics.totalHotels}</div></div>
                                <div className="p-4 pb-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl"><div className="text-sm text-gray-600 mb-1">Total Villas</div><div className="text-3xl font-bold text-orange-600">{analytics.totalVillas}</div></div>
                                <div className="p-4 pb-20 bg-gradient-to-br from-green-50 to-green-100 rounded-xl"><div className="text-sm text-gray-600 mb-1">Total Commissions</div><div className="text-2xl font-bold text-green-600">{formatCurrency(analytics.totalCommissions)}</div></div>
                            </div>
                        </div>

                        {/* Booking Performance */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-green-500" />Booking Performance</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-20">
                                <div className="p-4 pb-20 bg-blue-50 rounded-xl"><div className="text-sm text-gray-600 mb-1">Total Bookings</div><div className="text-3xl font-bold text-blue-600">{analytics.totalBookings}</div></div>
                                <div className="p-4 pb-20 bg-green-50 rounded-xl"><div className="text-sm text-gray-600 mb-1">Completed</div><div className="text-3xl font-bold text-green-600">{analytics.completedBookings}</div></div>
                                <div className="p-4 pb-20 bg-red-50 rounded-xl"><div className="text-sm text-gray-600 mb-1">Cancelled</div><div className="text-3xl font-bold text-red-600">{analytics.cancelledBookings}</div></div>
                                <div className="p-4 pb-20 bg-purple-50 rounded-xl"><div className="text-sm text-gray-600 mb-1">Success Rate</div><div className="text-3xl font-bold text-purple-600">{analytics.bookingCompletionRate.toFixed(1)}%</div></div>
                            </div>
                        </div>

                        {/* Top Performers */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Star className="w-6 h-6 text-yellow-500" fill="currentColor" />Top Therapists</h3>
                                <div className="space-y-3">
                                    {analytics.topTherapists.length > 0 ? analytics.topTherapists.map((therapist, idx) => (
                                        <div key={therapist.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-4 pb-20">
                                                <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white font-bold">{idx + 1}</div>
                                                <div><div className="font-semibold text-gray-900">{therapist.name}</div><div className="text-sm text-gray-500">{therapist.bookings} bookings • ⭐ {therapist.rating.toFixed(1)}</div></div>
                                            </div>
                                            <div className="text-right"><div className="font-bold text-green-600">{formatCurrency(therapist.revenue)}</div></div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 py-8">No data available</p>}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Star className="w-6 h-6 text-yellow-500" fill="currentColor" />Top Massage Places</h3>
                                <div className="space-y-3">
                                    {analytics.topPlaces.length > 0 ? analytics.topPlaces.map((place, idx) => (
                                        <div key={place.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-4 pb-20">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">{idx + 1}</div>
                                                <div><div className="font-semibold text-gray-900">{place.name}</div><div className="text-sm text-gray-500">{place.bookings} bookings • ⭐ {place.rating.toFixed(1)}</div></div>
                                            </div>
                                            <div className="text-right"><div className="font-bold text-green-600">{formatCurrency(place.revenue)}</div></div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 py-8">No data available</p>}
                                </div>
                            </div>
                        </div>
                        <div className="text-center text-xs text-gray-500">Last updated {new Date(analytics.lastUpdated).toLocaleString()}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlatformAnalyticsPage;


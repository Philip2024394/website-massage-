import React from 'react';
import { QrCode, Users, Star } from 'lucide-react';

interface PropertyAnalyticsSectionProps {
    analytics: any;
    isLoadingAnalytics: boolean;
}

const PropertyAnalyticsSection: React.FC<PropertyAnalyticsSectionProps> = ({
    analytics,
    isLoadingAnalytics
}) => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
                    <p className="text-xs text-gray-500">Track your guest engagement and service usage</p>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <QrCode className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">This Month</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                        {isLoadingAnalytics ? '...' : (analytics?.totalQRScans || 0).toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">QR Code Scans</p>
                    <div className="mt-4 flex items-center text-xs">
                        <span className="text-orange-600 font-semibold">Real-time</span>
                        <span className="text-gray-400 ml-2">Last 30 days</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Unique</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                        {isLoadingAnalytics ? '...' : (analytics?.uniqueGuestViews || 0).toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Guest Views</p>
                    <div className="mt-4 flex items-center text-xs">
                        <span className="text-orange-600 font-semibold">Real-time</span>
                        <span className="text-gray-400 ml-2">Last 30 days</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Total</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                        {isLoadingAnalytics ? '...' : (analytics?.totalBookings || 0).toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Bookings Made</p>
                    <div className="mt-4 flex items-center text-xs">
                        <span className="text-orange-600 font-semibold">Real-time</span>
                        <span className="text-gray-400 ml-2">Last 30 days</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Star className="w-6 h-6 text-orange-600" fill="currentColor" />
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Average</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">4.8</h3>
                    <p className="text-sm text-gray-600 mt-1">Guest Rating</p>
                    <div className="mt-4 flex items-center text-xs">
                        <span className="text-green-600 font-semibold">↑ 0.2</span>
                        <span className="text-gray-400 ml-2">vs last month</span>
                    </div>
                </div>
            </div>

            {/* Top Providers */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Providers</h3>
                <div className="space-y-3">
                    {[
                        { name: 'Ayu Prameswari', type: 'Therapist', bookings: 45, rating: 4.9 },
                        { name: 'Serenity Spa', type: 'Place', bookings: 38, rating: 4.8 },
                        { name: 'Made Wijaya', type: 'Therapist', bookings: 32, rating: 4.7 },
                    ].map((provider, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors border border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{provider.name}</p>
                                    <p className="text-xs text-gray-500">{provider.type}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900 text-sm">{provider.bookings} bookings</p>
                                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                    <Star size={14} fill="currentColor" />
                                    <span className="font-semibold">{provider.rating}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Peak Hours Chart */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Peak Booking Hours</h3>
                <div className="grid grid-cols-12 gap-2 items-end h-40">
                    {[20, 35, 45, 60, 80, 95, 100, 85, 70, 50, 30, 15].map((height, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <div 
                                className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg hover:from-orange-600 hover:to-orange-400 transition-all cursor-pointer"
                                style={{ height: `${height}%` }}
                            />
                            <span className="text-xs text-gray-500 mt-2">{idx + 9}h</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PropertyAnalyticsSection;
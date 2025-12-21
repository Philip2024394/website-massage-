/**
 * AnalyticsTab - Shared analytics display tab
 */

import React from 'react';
import AnalyticsCard from '../cards/AnalyticsCard';

export interface AnalyticsTabProps {
    analytics: {
        profileViews: number;
        bookingsTotal: number;
        bookingsCompleted: number;
        bookingsPending: number;
        revenue?: number;
        rating?: number;
        reviewCount?: number;
    };
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ analytics }) => {
    const completionRate = analytics.bookingsTotal > 0
        ? Math.round((analytics.bookingsCompleted / analytics.bookingsTotal) * 100)
        : 0;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard
                    title="Profile Views"
                    value={analytics.profileViews}
                    icon="👁️"
                />
                
                <AnalyticsCard
                    title="Total Bookings"
                    value={analytics.bookingsTotal}
                    icon="📅"
                />
                
                <AnalyticsCard
                    title="Completed"
                    value={analytics.bookingsCompleted}
                    trend={completionRate >= 80 ? 'up' : completionRate >= 50 ? 'neutral' : 'down'}
                    change={completionRate}
                    changeLabel="rate"
                    icon="✅"
                />
                
                <AnalyticsCard
                    title="Pending"
                    value={analytics.bookingsPending}
                    icon="⏳"
                />
            </div>
            
            {analytics.revenue !== undefined && (
                <div className="grid gap-4 md:grid-cols-2">
                    <AnalyticsCard
                        title="Total Revenue"
                        value={`Rp ${analytics.revenue.toLocaleString()}`}
                        icon="💰"
                    />
                    
                    {analytics.rating !== undefined && analytics.reviewCount !== undefined && (
                        <AnalyticsCard
                            title="Average Rating"
                            value={`${analytics.rating.toFixed(1)} / 5`}
                            icon="⭐"
                        />
                    )}
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">Completion Rate</span>
                        <span className="font-semibold text-gray-900">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsTab;

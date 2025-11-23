import React from 'react';
import type { Page } from '../../types/pageTypes';
import type { Therapist } from '../../types';
import { AnalyticsCard } from '../therapist-dashboard';

interface AnalyticsPanelProps {
    therapist: Therapist | null;
    bookings?: any[];
    onNavigate?: (page: Page) => void;
    t: any;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
    therapist,
    bookings,
    onNavigate,
    t
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t.analytics || 'Analytics'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnalyticsCard
                    title="Total Bookings"
                    value={bookings?.length || 0}
                    description="All time bookings"
                />
                <AnalyticsCard
                    title="This Week"
                    value={0}
                    description="Weekly bookings"
                />
                <AnalyticsCard
                    title="Rating"
                    value={therapist?.rating || 0}
                    description="Average rating"
                />
                <AnalyticsCard
                    title="Reviews"
                    value={therapist?.reviewCount || 0}
                    description="Total reviews"
                />
            </div>

            {/* Coin Rewards Section - Removed since coin system was deprecated */}
        </div>
    );
};

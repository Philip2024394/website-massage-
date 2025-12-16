import React from 'react';
import { TrendingUp } from 'lucide-react';

interface Analytics {
    impressions?: number;
    profileViews?: number;
    whatsappClicks?: number;
}

interface AnalyticsTabProps {
    place: any;
    t: any;
    AnalyticsCard: React.ComponentType<any>;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ place, t, AnalyticsCard }) => {
    const analytics: Analytics = (() => {
        try {
            return typeof place?.analytics === 'string' 
                ? JSON.parse(place.analytics) 
                : (place?.analytics || { impressions: 0, profileViews: 0, whatsappClicks: 0 });
        } catch {
            return { impressions: 0, profileViews: 0, whatsappClicks: 0 };
        }
    })();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t?.analytics?.title || 'Analytics'}</h2>
                    <p className="text-xs text-gray-500">Track your performance metrics</p>
                </div>
            </div>
            <div className="grid gap-4">
                <AnalyticsCard 
                    title={t?.analytics?.impressions || 'Impressions'} 
                    value={analytics.impressions ?? 0} 
                    description={t?.analytics?.impressionsDesc || 'Total profile impressions'} 
                />
                <AnalyticsCard 
                    title={t?.analytics?.profileViews || 'Profile Views'} 
                    value={analytics.profileViews ?? 0} 
                    description={t?.analytics?.profileViewsDesc || 'Profile view count'} 
                />
                <AnalyticsCard 
                    title={t?.analytics?.whatsappClicks || 'WhatsApp Clicks'} 
                    value={analytics.whatsappClicks ?? 0} 
                    description={t?.analytics?.whatsappClicksDesc || 'WhatsApp contact clicks'} 
                />
            </div>
        </div>
    );
};

export default AnalyticsTab;

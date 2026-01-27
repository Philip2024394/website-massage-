/**
 * AnalyticsCard - Shared analytics display component
 */

import React from 'react';

export interface AnalyticsCardProps {
    title: string;
    value: number | string;
    change?: number;
    changeLabel?: string;
    icon?: string;
    trend?: 'up' | 'down' | 'neutral';
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
    title,
    value,
    change,
    changeLabel,
    icon,
    trend = 'neutral',
}) => {
    const trendColors = {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-gray-600',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                {icon && <span className="text-2xl">{icon}</span>}
            </div>
            
            <div className="flex items-baseline">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                
                {change !== undefined && (
                    <span className={`ml-2 text-sm ${trendColors[trend]}`}>
                        {change > 0 ? '+' : ''}{change}%
                        {changeLabel && <span className="ml-1">{changeLabel}</span>}
                    </span>
                )}
            </div>
        </div>
    );
};

export default AnalyticsCard;

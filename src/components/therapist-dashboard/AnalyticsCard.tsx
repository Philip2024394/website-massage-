import React from 'react';

interface AnalyticsCardProps {
    title: string;
    value: number;
    description: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, description }) => (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-4xl font-bold text-orange-600 mt-2">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
);

export default AnalyticsCard;
import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: 'orange' | 'green' | 'purple' | 'blue';
}

const colorClasses = {
    orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/50',
        text: 'text-orange-600 dark:text-orange-400',
    },
    green: {
        bg: 'bg-green-100 dark:bg-green-900/50',
        text: 'text-green-600 dark:text-green-400',
    },
    purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/50',
        text: 'text-purple-600 dark:text-purple-400',
    },
    blue: {
        bg: 'bg-gray-900 dark:bg-gray-950',
        text: 'text-white dark:text-gray-100',
    },
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
    const classes = colorClasses[color];
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${classes.bg} ${classes.text}`}>
                    {icon}
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default StatCard;

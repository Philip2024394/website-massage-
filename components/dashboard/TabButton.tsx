import React from 'react';

interface TabButtonProps {
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    badge?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick, badge }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-brand-50 text-brand-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl shadow-lg bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 border-2 border-white transform hover:scale-105 transition-transform">
                    {icon}
                </span>
                <span className="font-semibold drop-shadow text-base">{label}</span>
            </div>
            {badge !== undefined && badge > 0 && (
                <span className="bg-brand-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {badge}
                </span>
            )}
        </button>
    );
};

export default TabButton;

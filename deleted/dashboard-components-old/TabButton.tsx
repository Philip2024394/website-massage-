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
            className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-1.5 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-all duration-200 text-[9px] sm:text-sm font-semibold whitespace-nowrap ${
                isActive
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
            }`}
        >
            <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-orange-500'}`}>
                {icon}
            </span>
            <span className="truncate leading-tight">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1 -right-1 sm:relative sm:top-0 sm:right-0 flex-shrink-0 bg-white text-orange-500 text-[8px] sm:text-xs font-bold rounded-full h-3 w-3 sm:h-5 sm:w-5 flex items-center justify-center">
                    {badge}
                </span>
            )}
        </button>
    );
};

export default TabButton;

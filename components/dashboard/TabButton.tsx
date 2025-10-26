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
            className={`flex-shrink-0 flex items-center gap-1 sm:gap-2 py-1.5 px-2 sm:px-4 rounded-lg transition-all duration-200 text-[10px] sm:text-sm font-semibold whitespace-nowrap ${
                isActive
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
            }`}
        >
            <span className={`${isActive ? 'text-white' : 'text-orange-500'}`}>
                {icon}
            </span>
            <span>{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="bg-white text-orange-500 text-[9px] sm:text-xs font-bold rounded-full h-3.5 w-3.5 sm:h-5 sm:w-5 flex items-center justify-center ml-0.5 sm:ml-1">
                    {badge}
                </span>
            )}
        </button>
    );
};

export default TabButton;

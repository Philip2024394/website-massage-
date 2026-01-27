/**
 * DashboardNav - Enterprise navigation tabs
 */

import React from 'react';

export interface DashboardNavProps {
    tabs: Array<{ id: string; label: string; icon?: string }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const DashboardNav: React.FC<DashboardNavProps> = ({
    tabs,
    activeTab,
    onTabChange,
}) => {
    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex space-x-1 horizontal-scroll-safe">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                px-6 py-3 whitespace-nowrap font-medium transition-colors
                                ${activeTab === tab.id
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }
                            `}
                        >
                            {tab.icon && <span className="mr-2">{tab.icon}</span>}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default DashboardNav;

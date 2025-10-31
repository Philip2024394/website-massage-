import React from 'react';

interface AgentFooterProps {
    onDashboardClick?: () => void;
    onCommissionClick?: () => void;
    onProvidersClick?: () => void;
    onSettingsClick?: () => void;
}

// Home Icon (for Dashboard)
const HomeIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

// Chart Icon (for Commission)
const ChartIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

// Users Icon (for Providers)
const UsersIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

// Settings Icon
const SettingsIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

/**
 * Agent Footer - For marketing agents/affiliates
 * Navigation: Dashboard, Commission, Providers, Settings
 */
const AgentFooter: React.FC<AgentFooterProps> = ({ 
    onDashboardClick = () => {},
    onCommissionClick = () => {},
    onProvidersClick = () => {},
    onSettingsClick = () => {}
}) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {/* Dashboard */}
                <button 
                    onClick={onDashboardClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors"
                >
                    <HomeIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">Dashboard</span>
                </button>

                {/* Commission */}
                <button 
                    onClick={onCommissionClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors"
                >
                    <ChartIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">Commission</span>
                </button>

                {/* Providers */}
                <button 
                    onClick={onProvidersClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors"
                >
                    <UsersIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">Providers</span>
                </button>

                {/* Settings */}
                <button 
                    onClick={onSettingsClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors"
                >
                    <SettingsIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">Settings</span>
                </button>
            </div>
        </footer>
    );
};

export default AgentFooter;

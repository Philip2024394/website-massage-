import React from 'react';

interface DashboardHeaderProps {
    title: string;
    onMenuClick: () => void;
    children?: React.ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, onMenuClick, children }) => {
    return (
        <header className="bg-white sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 border-b border-gray-200">
                    {/* Header: Left side */}
                    <div className="flex items-center gap-4">
                         {/* Hamburger button */}
                        <button
                            className="text-gray-500 hover:text-gray-600 md:hidden"
                            onClick={onMenuClick}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 hidden md:block">
                            {title}
                        </h1>
                    </div>

                    {/* Header: Right side */}
                    <div className="flex items-center space-x-3">
                        {children}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;

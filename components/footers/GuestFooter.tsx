import React from 'react';
import HomeIcon from '../icons/HomeIcon';

interface GuestFooterProps {
    onHomeClick?: () => void;
    onSearchClick?: () => void;
    onSignUpClick?: () => void;
    onMenuClick?: () => void;
}

// Search Icon
const SearchIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

// User Plus Icon
const UserPlusIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
);

// Menu Icon
const MenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

/**
 * Guest Footer - For non-registered users browsing the home page
 * Navigation: Home, Search, Sign Up, Menu
 */
const GuestFooter: React.FC<GuestFooterProps> = ({ 
    onHomeClick = () => {},
    onSearchClick = () => {},
    onSignUpClick = () => {},
    onMenuClick = () => {}
}) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {/* Home */}
                <button 
                    onClick={onHomeClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors"
                >
                    <HomeIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">Home</span>
                </button>

                {/* Search */}
                <button 
                    onClick={onSearchClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors"
                >
                    <SearchIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">Search</span>
                </button>

                {/* Sign Up */}
                <button 
                    onClick={onSignUpClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors"
                >
                    <UserPlusIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">Sign Up</span>
                </button>

                {/* Menu */}
                <button 
                    onClick={onMenuClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors"
                >
                    <MenuIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">Menu</span>
                </button>
            </div>
        </footer>
    );
};

export default GuestFooter;

import React from 'react';
import HomeIcon from '../icons/HomeIcon';

interface GuestFooterProps {
    onHomeClick?: () => void;
    onNotificationsClick?: () => void;
    onSignUpClick?: () => void;
    onMenuClick?: () => void;
    unreadNotifications?: number;
}

// (Removed unused Search icon to satisfy linting without UI changes)

// User Plus Icon
const UserPlusIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
);

// Bell Icon for Notifications
const BellIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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
    onNotificationsClick = () => {},
    onSignUpClick = () => {},
    onMenuClick = () => {},
    unreadNotifications = 0
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

                {/* Notifications */}
                <button 
                    onClick={onNotificationsClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors relative"
                >
                    <div className="relative">
                        <BellIcon className="w-6 h-6 text-orange-500" />
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                            </span>
                        )}
                    </div>
                    <span className="text-xs mt-1 text-gray-700 font-medium">Notifications</span>
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

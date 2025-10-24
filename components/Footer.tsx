

import React from 'react';
import HomeIcon from './icons/HomeIcon';
// import BriefcaseIcon from './icons/BriefcaseIcon';

interface FooterProps {
    userRole?: 'user' | 'therapist' | 'place' | null;
    currentPage?: string;
    unreadNotifications?: number;
    hasNewBookings?: boolean;
    hasWhatsAppClick?: boolean;
    onHomeClick?: () => void;
    onNotificationsClick?: () => void;
    onBookingsClick?: () => void;
    onProfileClick?: () => void;
    t: any;
}

// Calendar Icon
const CalendarIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

// Bell Icon
const BellIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

// User Icon
const UserIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

// Search Icon
const SearchIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

// Heart Icon
const HeartIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

// Dashboard Icon for Therapist Footer
const DashboardIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const Footer: React.FC<FooterProps> = ({ 
    userRole, 
    currentPage = 'home',
    unreadNotifications = 0,
    hasNewBookings = false,
    hasWhatsAppClick = false,
    onHomeClick = () => {},
    onNotificationsClick = () => {},
    onBookingsClick = () => {},
    onProfileClick = () => {}
}) => {
    // Therapist Footer
    if (userRole === 'therapist' || userRole === 'place') {
        return (
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                    {/* Home */}
                    <button 
                        onClick={onHomeClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <HomeIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-gray-900">Home</span>
                    </button>

                    {/* Bookings/Calendar with alert dot */}
                    <button 
                        onClick={onBookingsClick}
                        className="flex flex-col items-center justify-center flex-1 h-full relative"
                    >
                        <div className="relative">
                            <CalendarIcon className="w-6 h-6 text-orange-500" />
                            {hasNewBookings && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </div>
                        <span className="text-xs mt-1 text-gray-900">Bookings</span>
                    </button>

                    {/* Notifications with badge and WhatsApp alert */}
                    <button 
                        onClick={onNotificationsClick}
                        className="flex flex-col items-center justify-center flex-1 h-full relative"
                    >
                        <div className="relative">
                            <BellIcon className="w-6 h-6 text-orange-500" />
                            {(unreadNotifications > 0 || hasWhatsAppClick) && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                            {unreadNotifications > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                </span>
                            )}
                        </div>
                        <span className="text-xs mt-1 text-gray-900">Alerts</span>
                    </button>

                    {/* Profile */}
                    <button 
                        onClick={onProfileClick}
                        className="flex flex-col items-center justify-center flex-1 h-full relative"
                    >
                        <div className={`${currentPage === 'profile' ? 'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' : ''}`}>
                            <DashboardIcon className="w-6 h-6 text-orange-500" />
                        </div>
                        <span className="text-xs mt-1 text-gray-900">Dashboard</span>
                    </button>
                </div>
            </footer>
        );
    }

    // User Footer
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {/* Home */}
                <button 
                    onClick={onHomeClick}
                    className="flex flex-col items-center justify-center flex-1 h-full"
                >
                    <HomeIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-900">Home</span>
                </button>

                {/* Search */}
                <button 
                    onClick={onHomeClick}
                    className="flex flex-col items-center justify-center flex-1 h-full"
                >
                    <SearchIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-900">Search</span>
                </button>

                {/* Bookings */}
                <button 
                    onClick={onBookingsClick}
                    className="flex flex-col items-center justify-center flex-1 h-full"
                >
                    <CalendarIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-900">Bookings</span>
                </button>

                {/* Favorites */}
                <button 
                    onClick={onProfileClick}
                    className="flex flex-col items-center justify-center flex-1 h-full"
                >
                    <HeartIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-900">Saved</span>
                </button>

                {/* Profile */}
                <button 
                    onClick={onProfileClick}
                    className="flex flex-col items-center justify-center flex-1 h-full"
                >
                    <UserIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-900">Profile</span>
                </button>
            </div>
        </footer>
    );
};

export default Footer;
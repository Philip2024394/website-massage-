import React from 'react';
import HomeIcon from './icons/HomeIcon';

interface FooterProps {
    userRole?: 'user' | 'therapist' | 'place' | 'admin' | 'hotel' | 'villa' | 'agent' | null;
    currentPage?: string;
    unreadNotifications?: number;
    hasNewBookings?: boolean;
    hasWhatsAppClick?: boolean;
    onHomeClick?: () => void;
    onNotificationsClick?: () => void;
    onBookingsClick?: () => void;
    onProfileClick?: () => void;
    onDashboardClick?: () => void;
    onSearchClick?: () => void;
    onMenuClick?: () => void;
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

// Dashboard Icon for Therapist Footer
const DashboardIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

// Menu Icon for Admin/Hotel/Villa
const MenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

// Building Icon for Hotel
const BuildingIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

// Chart Icon for Agent
const ChartIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

// Settings Icon for Admin
const SettingsIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
    onProfileClick = () => {},
    onDashboardClick = () => {},
    onSearchClick = () => {},
    onMenuClick = () => {}
}) => {
    // Admin Footer
    if (userRole === 'admin') {
        return (
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                    {/* Home/Dashboard */}
                    <button 
                        onClick={onDashboardClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <HomeIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Dashboard</span>
                    </button>

                    {/* Members */}
                    <button 
                        onClick={onProfileClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <UserIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Members</span>
                    </button>

                    {/* Notifications */}
                    <button 
                        onClick={onNotificationsClick}
                        className="flex flex-col items-center justify-center flex-1 h-full relative"
                    >
                        <div className="relative">
                            <BellIcon className="w-6 h-6 text-orange-500" />
                            {unreadNotifications > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                </span>
                            )}
                        </div>
                        <span className="text-xs mt-1 text-black">Alerts</span>
                    </button>

                    {/* Settings */}
                    <button 
                        onClick={onMenuClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <SettingsIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Settings</span>
                    </button>
                </div>
            </footer>
        );
    }

    // Hotel Footer
    if (userRole === 'hotel') {
        return (
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                    {/* Dashboard */}
                    <button 
                        onClick={onDashboardClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <BuildingIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Dashboard</span>
                    </button>

                    {/* QR Menu */}
                    <button 
                        onClick={onMenuClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <MenuIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">QR Menu</span>
                    </button>

                    {/* Bookings */}
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
                        <span className="text-xs mt-1 text-black">Bookings</span>
                    </button>

                    {/* Profile */}
                    <button 
                        onClick={onProfileClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <UserIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Profile</span>
                    </button>
                </div>
            </footer>
        );
    }

    // Villa Footer (same as Hotel)
    if (userRole === 'villa') {
        return (
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                    {/* Dashboard */}
                    <button 
                        onClick={onDashboardClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <BuildingIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Dashboard</span>
                    </button>

                    {/* QR Menu */}
                    <button 
                        onClick={onMenuClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <MenuIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">QR Menu</span>
                    </button>

                    {/* Bookings */}
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
                        <span className="text-xs mt-1 text-black">Bookings</span>
                    </button>

                    {/* Profile */}
                    <button 
                        onClick={onProfileClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <UserIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Profile</span>
                    </button>
                </div>
            </footer>
        );
    }

    // Agent Footer
    if (userRole === 'agent') {
        return (
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                    {/* Dashboard */}
                    <button 
                        onClick={onDashboardClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <HomeIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Dashboard</span>
                    </button>

                    {/* Commission */}
                    <button 
                        onClick={onProfileClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <ChartIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Commission</span>
                    </button>

                    {/* Providers */}
                    <button 
                        onClick={onSearchClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <UserIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Providers</span>
                    </button>

                    {/* Profile */}
                    <button 
                        onClick={onMenuClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <SettingsIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Settings</span>
                    </button>
                </div>
            </footer>
        );
    }

    // Therapist Footer
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
                        <span className="text-xs mt-1 text-black">Home</span>
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
                        <span className="text-xs mt-1 text-black">Bookings</span>
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
                        <span className="text-xs mt-1 text-black">Alerts</span>
                    </button>

                    {/* Profile */}
                    <button 
                        onClick={onProfileClick}
                        className="flex flex-col items-center justify-center flex-1 h-full relative"
                    >
                        <div className={`${currentPage === 'profile' ? 'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' : ''}`}>
                            <DashboardIcon className="w-6 h-6 text-orange-500" />
                        </div>
                        <span className="text-xs mt-1 text-black">Dashboard</span>
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
                    <span className="text-xs mt-1 text-black">Home</span>
                </button>

                {/* Join */}
                <button 
                    onClick={onMenuClick}
                    className="flex flex-col items-center justify-center flex-1 h-full"
                >
                    <UserIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-black">Join</span>
                </button>

                {/* Alerts */}
                <button 
                    onClick={onNotificationsClick}
                    className="flex flex-col items-center justify-center flex-1 h-full relative"
                >
                    <div className="relative">
                        <BellIcon className="w-6 h-6 text-orange-500" />
                    </div>
                    <span className="text-xs mt-1 text-black">Alerts</span>
                </button>

                {/* Profile */}
                <button 
                    onClick={onProfileClick}
                    className="flex flex-col items-center justify-center flex-1 h-full"
                >
                    <UserIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-black">Profile</span>
                </button>
            </div>
        </footer>
    );
};

export default Footer;
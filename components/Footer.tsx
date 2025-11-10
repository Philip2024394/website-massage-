import React from 'react';
import HomeIcon from './icons/HomeIcon';

interface FooterProps {
    userRole?: 'user' | 'therapist' | 'place' | 'admin' | 'hotel' | 'villa' | 'agent' | null;
    currentPage?: string;
    unreadNotifications?: number;
    unreadChats?: number;
    hasWhatsAppClick?: boolean;
    user?: any; // Add user prop to check if logged in
    onHomeClick?: () => void;
    onNotificationsClick?: () => void;
    onProfileClick?: () => void;
    onDashboardClick?: () => void;
    onSearchClick?: () => void;
    onMenuClick?: () => void;
    onChatClick?: () => void;
    onLoginClick?: () => void; // Add login callback
    t: any;
}

// Bell Icon
const BellIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

// Chat Icon
const ChatIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
    unreadChats = 0,
    hasWhatsAppClick = false,
    user = null,
    onHomeClick = () => {},
    onNotificationsClick = () => {},
    onProfileClick = () => {},
    onDashboardClick = () => {},
    onSearchClick = () => {},
    onMenuClick = () => {},
    onChatClick = () => {},
    onLoginClick = () => {}
}) => {
    // Admin Footer
    if (userRole === 'admin') {
        return (
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                    {/* Dashboard */}
                    <button 
                        onClick={onDashboardClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <DashboardIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Dashboard</span>
                    </button>

                    {/* Members (Confirm Accounts) */}
                    <button 
                        onClick={onProfileClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <UserIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Members</span>
                    </button>

                    {/* Messages (Chat) */}
                    <button 
                        onClick={onChatClick}
                        className="flex flex-col items-center justify-center flex-1 h-full relative"
                    >
                        <div className="relative">
                            <ChatIcon className="w-6 h-6 text-orange-500" />
                            {unreadChats > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {unreadChats > 9 ? '9+' : unreadChats}
                                </span>
                            )}
                        </div>
                        <span className="text-xs mt-1 text-black">Messages</span>
                    </button>

                    {/* Notifications/Alerts */}
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

                    {/* Settings (Drawer Buttons) */}
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
                        <span className="text-xs mt-1 text-black">Notifications</span>
                    </button>

                    {/* Profile */}
                    <button 
                        onClick={onProfileClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <UserIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Profile</span>
                    </button>

                    {/* Home */}
                    <button 
                        onClick={onHomeClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <HomeIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Home</span>
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
                        <span className="text-xs mt-1 text-black">Notifications</span>
                    </button>

                    {/* QR Menu */}
                    <button 
                        onClick={onMenuClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <MenuIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">QR Menu</span>
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

    // Therapist Footer - Enhanced with prominent notifications
    if (userRole === 'therapist' || userRole === 'place') {
        return (
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-300 shadow-2xl z-50" style={{minHeight: '64px'}}>
                <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                    {/* Home */}
                    <button 
                        onClick={onHomeClick}
                        className="flex flex-col items-center justify-center flex-1 h-full"
                    >
                        <HomeIcon className="w-6 h-6 text-orange-500" />
                        <span className="text-xs mt-1 text-black">Home</span>
                    </button>

                    {/* Notifications - Enhanced and More Prominent */}
                    <button 
                        onClick={onNotificationsClick}
                        className="flex flex-col items-center justify-center flex-1 h-full relative"
                    >
                        <div className="relative">
                            <BellIcon className="w-7 h-7 text-orange-500" />
                            {(unreadNotifications > 0 || hasWhatsAppClick) && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                            {unreadNotifications > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold border-2 border-white">
                                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                </span>
                            )}
                        </div>
                        <span className="text-xs mt-1 text-black font-semibold">Notifications</span>
                    </button>

                    {/* Chat */}
                    <button 
                        onClick={onChatClick}
                        className="flex flex-col items-center justify-center flex-1 h-full relative"
                    >
                        <div className="relative">
                            <ChatIcon className="w-6 h-6 text-orange-500" />
                            {unreadChats > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {unreadChats > 9 ? '9+' : unreadChats}
                                </span>
                            )}
                        </div>
                        <span className="text-xs mt-1 text-black">Chat</span>
                    </button>

                    {/* Dashboard */}
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

                {/* Chat */}
                <button 
                    onClick={onChatClick}
                    className="flex flex-col items-center justify-center flex-1 h-full relative"
                >
                    <div className="relative">
                        <ChatIcon className="w-6 h-6 text-orange-500" />
                        {unreadChats > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {unreadChats > 9 ? '9+' : unreadChats}
                            </span>
                        )}
                    </div>
                    <span className="text-xs mt-1 text-black">Chat</span>
                </button>

                {/* Notifications */}
                <button 
                    onClick={onNotificationsClick}
                    className="flex flex-col items-center justify-center flex-1 h-full relative"
                >
                    <div className="relative">
                        <BellIcon className="w-6 h-6 text-orange-500" />
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                            </span>
                        )}
                    </div>
                    <span className="text-xs mt-1 text-black">Notifications</span>
                </button>

                {/* Profile - Different behavior for signed in vs signed out */}
                <button 
                    onClick={user ? onProfileClick : onLoginClick}
                    className="flex flex-col items-center justify-center flex-1 h-full"
                >
                    <UserIcon className={`w-6 h-6 ${user ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span className={`text-xs mt-1 ${user ? 'text-black' : 'text-gray-400'}`}>
                        {user ? 'Profile' : 'Sign In'}
                    </span>
                </button>
            </div>
        </footer>
    );
};

export default Footer;
import React from 'react';
import HomeIcon from '../icons/HomeIcon';

interface ProviderFooterProps {
    unreadChats?: number;
    unreadNotifications?: number;
    hasNewBookings?: boolean;
    hasWhatsAppClick?: boolean;
    onHomeClick?: () => void;
    onChatClick?: () => void;
    onBookingsClick?: () => void;
    onAlertsClick?: () => void;
    onDashboardClick?: () => void;
}

// Chat Icon
const ChatIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

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

// Dashboard Icon
const DashboardIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

/**
 * Provider Footer - For therapists and massage places
 * Navigation: Home, Chat, Bookings, Alerts, Dashboard
 */
const ProviderFooter: React.FC<ProviderFooterProps> = ({ 
    unreadChats = 0,
    unreadNotifications = 0,
    hasNewBookings = false,
    hasWhatsAppClick = false,
    onHomeClick = () => {},
    onChatClick = () => {},
    onBookingsClick = () => {},
    onAlertsClick = () => {},
    onDashboardClick = () => {}
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

                {/* Chat */}
                <button 
                    onClick={onChatClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors relative"
                >
                    <div className="relative">
                        <ChatIcon className="w-6 h-6 text-orange-500" />
                        {unreadChats > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                {unreadChats > 9 ? '9+' : unreadChats}
                            </span>
                        )}
                    </div>
                    <span className="text-xs mt-1 text-gray-700 font-medium">Chat</span>
                </button>

                {/* Bookings */}
                <button 
                    onClick={onBookingsClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors relative"
                >
                    <div className="relative">
                        <CalendarIcon className="w-6 h-6 text-orange-500" />
                        {hasNewBookings && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </div>
                    <span className="text-xs mt-1 text-gray-700 font-medium">Bookings</span>
                </button>

                {/* Alerts */}
                <button 
                    onClick={onAlertsClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors relative"
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
                    <span className="text-xs mt-1 text-gray-700 font-medium">Alerts</span>
                </button>

                {/* Dashboard */}
                <button 
                    onClick={onDashboardClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors"
                >
                    <DashboardIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">Dashboard</span>
                </button>
            </div>
        </footer>
    );
};

export default ProviderFooter;

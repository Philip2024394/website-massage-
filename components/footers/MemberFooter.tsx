import React from 'react';
import HomeIcon from '../icons/HomeIcon';

interface MemberFooterProps {
    unreadNotifications?: number;
    unreadChats?: number;
    onHomeClick?: () => void;
    onChatClick?: () => void;
    onNotificationsClick?: () => void;
    onProfileClick?: () => void;
}

// Chat Icon
const ChatIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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

/**
 * Member Footer - For registered customers/users
 * Navigation: Home, Chat, Notifications, Profile
 */
const MemberFooter: React.FC<MemberFooterProps> = ({ 
    unreadNotifications = 0,
    unreadChats = 0,
    onHomeClick = () => {},
    onChatClick = () => {},
    onNotificationsClick = () => {},
    onProfileClick = () => {}
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
                    <span className="text-xs mt-1 text-gray-700 font-medium">Alerts</span>
                </button>

                {/* Profile */}
                <button 
                    onClick={onProfileClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors"
                >
                    <UserIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">Profile</span>
                </button>
            </div>
        </footer>
    );
};

export default MemberFooter;

import React from 'react';

interface AdminFooterProps {
    unreadNotifications?: number;
    unreadChats?: number;
    onDashboardClick?: () => void;
    onMembersClick?: () => void;
    onMessagesClick?: () => void;
    onAlertsClick?: () => void;
    onSettingsClick?: () => void;
}

// Dashboard Icon
const DashboardIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

// Users Icon
const UsersIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

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

// Settings Icon
const SettingsIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

/**
 * Admin Footer - For platform administrators
 * Navigation: Dashboard, Members, Messages, Alerts, Settings
 */
const AdminFooter: React.FC<AdminFooterProps> = ({ 
    unreadNotifications = 0,
    unreadChats = 0,
    onDashboardClick = () => {},
    onMembersClick = () => {},
    onMessagesClick = () => {},
    onAlertsClick = () => {},
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
                    <DashboardIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">Dashboard</span>
                </button>

                {/* Members */}
                <button 
                    onClick={onMembersClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors"
                >
                    <UsersIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">Members</span>
                </button>

                {/* Messages */}
                <button 
                    onClick={onMessagesClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors relative"
                >
                    <div className="relative">
                        <ChatIcon className="w-6 h-6 text-orange-500" />
                        {unreadChats > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                {unreadChats > 9 ? '9+' : unreadChats}
                            </span>
                        )}
                    </div>
                    <span className="text-xs mt-1 text-gray-700 font-medium">Messages</span>
                </button>

                {/* Alerts */}
                <button 
                    onClick={onAlertsClick}
                    className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors relative"
                >
                    <div className="relative">
                        <BellIcon className="w-6 h-6 text-orange-500" />
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                            </span>
                        )}
                    </div>
                    <span className="text-xs mt-1 text-gray-700 font-medium">Alerts</span>
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

export default AdminFooter;

import React from 'react';

interface UnifiedFooterProps {
    userRole: 'user' | 'therapist' | 'place' | 'admin' | 'hotel' | 'villa' | 'agent' | 'customer' | null;
    currentPage: string;
    unreadNotifications?: number;
    unreadChats?: number;
    hasNewBookings?: boolean;
    user?: any; // Add user prop to check if logged in
    onHomeClick?: () => void;
    onNotificationsClick?: () => void;
    onChatClick?: () => void;
    onDashboardClick?: () => void;
    onProfileClick?: () => void;
    onBookingsClick?: () => void;
    onMenuClick?: () => void;
    onLoginClick?: () => void; // Add login callback
    t: any;
}

// Icon components
const HomeIcon = ({ className = 'w-6 h-6', isActive = false }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill={isActive ? "currentColor" : "none"} 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const BellIcon = ({ className = 'w-6 h-6', isActive = false }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill={isActive ? "currentColor" : "none"} 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const ChatIcon = ({ className = 'w-6 h-6', isActive = false }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill={isActive ? "currentColor" : "none"} 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const DashboardIcon = ({ className = 'w-6 h-6', isActive = false }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill={isActive ? "currentColor" : "none"} 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const UserIcon = ({ className = 'w-6 h-6', isActive = false }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill={isActive ? "currentColor" : "none"} 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const CalendarIcon = ({ className = 'w-6 h-6', isActive = false }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill={isActive ? "currentColor" : "none"} 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const SettingsIcon = ({ className = 'w-6 h-6', isActive = false }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill={isActive ? "currentColor" : "none"} 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ChartIcon = ({ className = 'w-6 h-6', isActive = false }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill={isActive ? "currentColor" : "none"} 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const UnifiedFooter: React.FC<UnifiedFooterProps> = ({
    userRole,
    currentPage,
    unreadNotifications = 0,
    unreadChats = 0,
    hasNewBookings = false,
    user = null,
    onHomeClick = () => {},
    onNotificationsClick = () => {},
    onChatClick = () => {},
    onDashboardClick = () => {},
    onProfileClick = () => {},
    onBookingsClick = () => {},
    onMenuClick = () => {},
    onLoginClick = () => {},
    t
}) => {
    // Helper function to determine if a button is active
    const isActive = (buttonType: string) => {
        const homePages = ['home', 'landing'];
        const dashboardPages = ['therapistDashboard', 'hotelDashboard', 'villaDashboard', 'agentDashboard', 'customerDashboard'];
        const chatPages = ['chatList', 'chat'];
        const notificationPages = ['notifications'];
        const profilePages = ['profile'];
        const bookingPages = ['bookings'];

        switch (buttonType) {
            case 'home':
                return homePages.includes(currentPage);
            case 'dashboard':
                return dashboardPages.includes(currentPage);
            case 'chat':
                return chatPages.includes(currentPage);
            case 'notifications':
                return notificationPages.includes(currentPage);
            case 'profile':
                return profilePages.includes(currentPage);
            case 'bookings':
                return bookingPages.includes(currentPage);
            default:
                return false;
        }
    };

    // Helper function to get the icon color based on active state
    const getIconColor = (buttonType: string) => {
        return isActive(buttonType) ? 'text-orange-600' : 'text-orange-500';
    };

    // Helper function to get the text color based on active state
    const getTextColor = (buttonType: string) => {
        return isActive(buttonType) ? 'text-orange-600 font-semibold' : 'text-black';
    };

    // Define navigation items based on user role
    const getNavigationItems = () => {
        switch (userRole) {
            case 'admin':
                return [
                    {
                        key: 'dashboard',
                        icon: <DashboardIcon className={`w-6 h-6 ${getIconColor('dashboard')}`} isActive={isActive('dashboard')} />,
                        label: t?.('footer.dashboard') || 'Dashboard',
                        onClick: onDashboardClick,
                        badgeCount: 0
                    },
                    {
                        key: 'profile',
                        icon: <UserIcon className={`w-6 h-6 ${getIconColor('profile')}`} isActive={isActive('profile')} />,
                        label: t?.('footer.members') || 'Members',
                        onClick: onProfileClick,
                        badgeCount: 0
                    },
                    {
                        key: 'notifications',
                        icon: <BellIcon className={`w-6 h-6 ${getIconColor('notifications')}`} isActive={isActive('notifications')} />,
                        label: t?.('footer.alerts') || 'Alerts',
                        onClick: onNotificationsClick,
                        badgeCount: unreadNotifications
                    },
                    {
                        key: 'settings',
                        icon: <SettingsIcon className={`w-6 h-6 ${getIconColor('settings')}`} isActive={isActive('settings')} />,
                        label: t?.('footer.settings') || 'Settings',
                        onClick: onMenuClick,
                        badgeCount: 0
                    }
                ];

            case 'therapist':
            case 'place':
                return [
                    {
                        key: 'home',
                        icon: <HomeIcon className={`w-6 h-6 ${getIconColor('home')}`} isActive={isActive('home')} />,
                        label: t?.('footer.home') || 'Home',
                        onClick: onHomeClick,
                        badgeCount: 0
                    },
                    {
                        key: 'bookings',
                        icon: <CalendarIcon className={`w-6 h-6 ${getIconColor('bookings')}`} isActive={isActive('bookings')} />,
                        label: t?.('footer.bookings') || 'Bookings',
                        onClick: onBookingsClick,
                        badgeCount: hasNewBookings ? 1 : 0,
                        showDot: hasNewBookings
                    },
                    {
                        key: 'notifications',
                        icon: <BellIcon className={`w-6 h-6 ${getIconColor('notifications')}`} isActive={isActive('notifications')} />,
                        label: t?.('footer.alerts') || 'Alerts',
                        onClick: onNotificationsClick,
                        badgeCount: unreadNotifications
                    },
                    {
                        key: 'dashboard',
                        icon: <DashboardIcon className={`w-6 h-6 ${getIconColor('dashboard')}`} isActive={isActive('dashboard')} />,
                        label: t?.('footer.dashboard') || 'Dashboard',
                        onClick: onDashboardClick,
                        badgeCount: 0
                    }
                ];

            case 'agent':
                return [
                    {
                        key: 'home',
                        icon: <HomeIcon className={`w-6 h-6 ${getIconColor('home')}`} isActive={isActive('home')} />,
                        label: t?.('footer.home') || 'Home',
                        onClick: onHomeClick,
                        badgeCount: 0
                    },
                    {
                        key: 'dashboard',
                        icon: <ChartIcon className={`w-6 h-6 ${getIconColor('dashboard')}`} isActive={isActive('dashboard')} />,
                        label: t?.('footer.dashboard') || 'Dashboard',
                        onClick: onDashboardClick,
                        badgeCount: 0
                    },
                    {
                        key: 'chat',
                        icon: <ChatIcon className={`w-6 h-6 ${getIconColor('chat')}`} isActive={isActive('chat')} />,
                        label: t?.('footer.messages') || 'Messages',
                        onClick: onChatClick,
                        badgeCount: unreadChats
                    },
                    {
                        key: 'notifications',
                        icon: <BellIcon className={`w-6 h-6 ${getIconColor('notifications')}`} isActive={isActive('notifications')} />,
                        label: t?.('footer.notifications') || 'Notifications',
                        onClick: onNotificationsClick,
                        badgeCount: unreadNotifications
                    }
                ];

            case 'hotel':
            case 'villa':
                return [
                    {
                        key: 'dashboard',
                        icon: <DashboardIcon className={`w-6 h-6 ${getIconColor('dashboard')}`} isActive={isActive('dashboard')} />,
                        label: t?.('footer.dashboard') || 'Dashboard',
                        onClick: onDashboardClick,
                        badgeCount: 0
                    },
                    {
                        key: 'chat',
                        icon: <ChatIcon className={`w-6 h-6 ${getIconColor('chat')}`} isActive={isActive('chat')} />,
                        label: t?.('footer.chat') || 'Chat',
                        onClick: onChatClick,
                        badgeCount: unreadChats
                    },
                    {
                        key: 'bookings',
                        icon: <CalendarIcon className={`w-6 h-6 ${getIconColor('bookings')}`} isActive={isActive('bookings')} />,
                        label: t?.('footer.bookings') || 'Bookings',
                        onClick: onBookingsClick,
                        badgeCount: hasNewBookings ? 1 : 0,
                        showDot: hasNewBookings
                    },
                    {
                        key: 'home',
                        icon: <HomeIcon className={`w-6 h-6 ${getIconColor('home')}`} isActive={isActive('home')} />,
                        label: t?.('footer.home') || 'Home',
                        onClick: onHomeClick,
                        badgeCount: 0
                    }
                ];

            case 'user':
            case 'customer':
            default:
                return [
                    {
                        key: 'home',
                        icon: <HomeIcon className={`w-6 h-6 ${getIconColor('home')}`} isActive={isActive('home')} />,
                        label: t?.('footer.home') || 'Home',
                        onClick: onHomeClick,
                        badgeCount: 0
                    },
                    {
                        key: 'chat',
                        icon: <ChatIcon className={`w-6 h-6 ${getIconColor('chat')}`} isActive={isActive('chat')} />,
                        label: t?.('footer.chat') || 'Chat',
                        onClick: onChatClick,
                        badgeCount: unreadChats
                    },
                    {
                        key: 'notifications',
                        icon: <BellIcon className={`w-6 h-6 ${getIconColor('notifications')}`} isActive={isActive('notifications')} />,
                        label: t?.('footer.notifications') || 'Notifications',
                        onClick: onNotificationsClick,
                        badgeCount: unreadNotifications
                    },
                    {
                        key: 'profile',
                        icon: <UserIcon className={`w-6 h-6 ${user ? getIconColor('profile') : 'text-gray-400'}`} isActive={user && isActive('profile')} />,
                        label: user ? (t?.('footer.profile') || 'Profile') : (t?.('footer.signIn') || 'Sign In'),
                        onClick: user ? onProfileClick : onLoginClick,
                        badgeCount: 0
                    }
                ];
        }
    };

    const navigationItems = getNavigationItems();

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {navigationItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={item.onClick}
                        className="flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 hover:bg-gray-50"
                    >
                        <div className="relative">
                            {item.icon}
                            {/* Badge for count */}
                            {item.badgeCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                    {item.badgeCount > 9 ? '9+' : item.badgeCount}
                                </span>
                            )}
                            {/* Dot indicator for new items */}
                            {item.showDot && !item.badgeCount && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </div>
                        <span className={`text-xs mt-1 ${getTextColor(item.key)}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </footer>
    );
};

export default UnifiedFooter;
import React from 'react';

interface GlobalFooterProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    userRole?: 'user' | 'therapist' | 'place' | 'admin' | 'hotel' | 'agent' | null;
    unreadNotifications?: number;
    hasNewBookings?: boolean;
}

const GlobalFooter: React.FC<GlobalFooterProps> = ({
    currentPage,
    onNavigate,
    userRole,
    unreadNotifications = 0,
    hasNewBookings: _hasNewBookings = false
}) => {
    // Helper function to determine if a button is active
    const isActive = (buttonType: string) => {
        const homePages = ['home', 'landing'];
        const searchPages = ['search', 'therapists', 'places', 'massageTypes'];
        const notificationPages = ['notifications'];
        const shopPages = ['shop', 'membership'];
                const profilePages = ['profile', 'therapistPortal', 'agentDashboard'];

        switch (buttonType) {
            case 'home':
                return homePages.includes(currentPage);
            case 'search':
                return searchPages.includes(currentPage);
            case 'notifications':
                return notificationPages.includes(currentPage);
            case 'shop':
                return shopPages.includes(currentPage);
            case 'profile':
                return profilePages.includes(currentPage);
            default:
                return false;
        }
    };

    // Helper to build image icons with active state opacity
    const imageIcon = (key: string, src: string, alt: string) => (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            className={`w-7 h-7 object-contain transition-opacity ${isActive(key) ? 'opacity-100' : 'opacity-60'}`}
        />
    );

    // Navigation items configuration - Always show notifications instead of search
    const getSecondButton = () => ({
        key: 'notifications',
        icon: imageIcon('notifications', 'https://ik.imagekit.io/7grri5v7d/home%20buttons.png', 'Notifications'),
        label: 'Notifications',
        onClick: () => onNavigate('notifications'),
        badgeCount: unreadNotifications
    });

    let navigationItems = [
        {
            key: 'home',
            icon: imageIcon('home', 'https://ik.imagekit.io/7grri5v7d/home%20button.png', 'Home'),
            label: 'Home',
            onClick: () => onNavigate('home'),
            badgeCount: 0
        },
        getSecondButton(),
        {
            key: 'profile',
            icon: imageIcon('profile', 'https://ik.imagekit.io/7grri5v7d/home%20buttonsss.png?updatedAt=1763217899529', 'Profile'),
            label: 'Profile',
            onClick: () => {
                switch (userRole) {
                    case 'therapist':
                    case 'place':
                        onNavigate('therapistPortal');
                        break;
                    case 'hotel':
                        onNavigate('agentDashboard');
                        break;
                    case 'agent':
                        onNavigate('agentDashboard');
                        break;
                    default:
                        onNavigate('profile');
                        break;
                }
            },
            badgeCount: unreadNotifications
        }
    ];

    return (
        <footer
            className="fixed left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[9999]"
            style={{
                // Elevate footer above device gesture/nav bar by adding extra offset
                bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)'
            }}
        >
            <div className="flex justify-around items-center h-20 max-w-md mx-auto px-2">
                {navigationItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={item.onClick}
                        className="flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 hover:bg-gray-50 rounded-lg group"
                    >
                        <div className="relative">
                            {item.icon}
                            {/* Badge for count */}
                            {item.badgeCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                    {item.badgeCount > 9 ? '9+' : item.badgeCount}
                                </span>
                            )}

                        </div>
                        <span className={`text-xs mt-1 font-medium transition-colors ${
                            isActive(item.key) ? 'text-orange-600' : 'text-gray-500 group-hover:text-gray-700'
                        }`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
            
            {/* Orange active indicator line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 opacity-20"></div>
        </footer>
    );
};

export default GlobalFooter;
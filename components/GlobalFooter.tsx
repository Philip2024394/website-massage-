import React from 'react';

interface GlobalFooterProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    userRole?: 'user' | 'therapist' | 'place' | 'admin' | 'hotel' | 'villa' | 'agent' | 'customer' | null;
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
        const shopPages = ['coin-shop', 'shop', 'membership'];
        const profilePages = ['profile', 'customerDashboard', 'therapistDashboard', 'hotelDashboard', 'villaDashboard', 'agentDashboard', 'adminDashboard'];

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

    const navigationItems = [
        {
            key: 'home',
            icon: imageIcon('home', 'https://ik.imagekit.io/7grri5v7d/home%20button.png', 'Home'),
            label: 'Home',
            onClick: () => onNavigate('home'),
            badgeCount: 0
        },
        getSecondButton(),
        {
            key: 'shop',
            icon: imageIcon('shop', 'https://ik.imagekit.io/7grri5v7d/home%20buttonss.png', 'Shop'),
            label: 'Shop',
            onClick: () => onNavigate('coin-shop'),
            badgeCount: 0
        },
        {
            key: 'profile',
            icon: imageIcon('profile', 'https://ik.imagekit.io/7grri5v7d/home%20buttonsss.png?updatedAt=1763217899529', 'Profile'),
            label: 'Profile',
            onClick: () => {
                switch (userRole) {
                    case 'admin':
                        onNavigate('adminDashboard');
                        break;
                    case 'therapist':
                    case 'place':
                        onNavigate('therapistDashboard');
                        break;
                    case 'hotel':
                        onNavigate('hotelDashboard');
                        break;
                    case 'villa':
                        onNavigate('villaDashboard');
                        break;
                    case 'agent':
                        onNavigate('agentDashboard');
                        break;
                    case 'customer':
                        onNavigate('customerDashboard');
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
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
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
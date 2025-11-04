import React from 'react';
import { Home, Search, Calendar, ShoppingBag, User } from 'lucide-react';

interface GlobalFooterProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    userRole?: 'user' | 'therapist' | 'place' | 'admin' | 'hotel' | 'villa' | 'agent' | 'customer' | null;
    unreadNotifications?: number;
    hasNewBookings?: boolean;
    t?: any;
}

const GlobalFooter: React.FC<GlobalFooterProps> = ({
    currentPage,
    onNavigate,
    userRole,
    unreadNotifications = 0,
    hasNewBookings = false,
    t
}) => {
    // Helper function to determine if a button is active
    const isActive = (buttonType: string) => {
        const homePages = ['home', 'landing'];
        const searchPages = ['search', 'therapists', 'places', 'massageTypes'];
        const bookingPages = ['bookings', 'booking', 'bookingHistory'];
        const shopPages = ['coin-shop', 'shop', 'membership'];
        const profilePages = ['profile', 'customerDashboard', 'therapistDashboard', 'hotelDashboard', 'villaDashboard', 'agentDashboard', 'adminDashboard'];

        switch (buttonType) {
            case 'home':
                return homePages.includes(currentPage);
            case 'search':
                return searchPages.includes(currentPage);
            case 'booking':
                return bookingPages.includes(currentPage);
            case 'shop':
                return shopPages.includes(currentPage);
            case 'profile':
                return profilePages.includes(currentPage);
            default:
                return false;
        }
    };

    // Helper function to get icon and text color
    const getColor = (buttonType: string) => {
        const active = isActive(buttonType);
        return active ? 'text-orange-600' : 'text-gray-500';
    };

    // Navigation items configuration
    const navigationItems = [
        {
            key: 'home',
            icon: <Home className={`w-6 h-6 ${getColor('home')}`} />,
            onClick: () => onNavigate('home'),
            badgeCount: 0
        },
        {
            key: 'search',
            icon: <Search className={`w-6 h-6 ${getColor('search')}`} />,
            onClick: () => onNavigate('therapists'),
            badgeCount: 0
        },
        {
            key: 'booking',
            icon: <Calendar className={`w-6 h-6 ${getColor('booking')}`} />,
            onClick: () => {
                // Navigate based on user role
                if (userRole === 'therapist' || userRole === 'place') {
                    onNavigate('bookings'); // Provider bookings
                } else if (userRole === 'customer') {
                    onNavigate('bookingHistory'); // Customer booking history
                } else {
                    onNavigate('bookings'); // Default bookings
                }
            },
            badgeCount: hasNewBookings ? 1 : 0,
            showDot: hasNewBookings
        },
        {
            key: 'shop',
            icon: <ShoppingBag className={`w-6 h-6 ${getColor('shop')}`} />,
            onClick: () => onNavigate('coin-shop'),
            badgeCount: 0
        },
        {
            key: 'profile',
            icon: <User className={`w-6 h-6 ${getColor('profile')}`} />,
            onClick: () => {
                // Navigate to appropriate profile/dashboard based on user role
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
                            {/* Dot indicator for new items */}
                            {item.showDot && !item.badgeCount && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
            
            {/* Orange active indicator line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 opacity-20"></div>
        </footer>
    );
};

export default GlobalFooter;
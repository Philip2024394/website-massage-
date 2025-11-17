import type { LoggedInProvider, Page } from '../types/pageTypes';
import type { Agent, Notification, Booking, ChatRoom } from '../types';

interface UseDerivedStateProps {
    isAdminLoggedIn: boolean;
    loggedInProvider: LoggedInProvider | null;
    loggedInAgent: Agent | null;
    loggedInCustomer: any | null;
    isHotelLoggedIn: boolean;
    notifications: Notification[];
    bookings: Booking[];
    page: Page;
    activeChatRoom: ChatRoom | null;
}

export const useDerivedState = ({
    isAdminLoggedIn,
    loggedInProvider,
    loggedInAgent,
    loggedInCustomer,
    isHotelLoggedIn,
    notifications,
    bookings,
    page,
    activeChatRoom
}: UseDerivedStateProps) => {
    const getUserRole = () => {
        if (isAdminLoggedIn) return 'admin';
        if (loggedInProvider) return loggedInProvider.type === 'therapist' ? 'therapist' : 'place';
        if (loggedInAgent) return 'agent';
        if (loggedInCustomer) return 'customer';
        if (isHotelLoggedIn) return 'hotel';
        return null;
    };

    const unreadNotifications = notifications.filter(
        n => !n.isRead && n.providerId === loggedInProvider?.id
    ).length;

    const hasNewBookings = bookings.some(
        b => b.providerId === loggedInProvider?.id
    );

    const pagesWithoutFooter: Page[] = [
        'adminDashboard', 'hotelVillaMenu'
    ];

    // Detect PWA standalone (Android Chrome, iOS Safari)
    const isStandalone = typeof window !== 'undefined' && (
        window.matchMedia('(display-mode: standalone)').matches ||
        // iOS Safari exposes navigator.standalone when launched from home screen
        (window.navigator as any)?.standalone === true
    );

    // Base rule: hide on specific pages and when chat is open
    const baseShowFooter = !pagesWithoutFooter.includes(page) && !(page === 'chatList' && activeChatRoom);

    // Hide footer explicitly on landing page, regardless of PWA standalone
    // Otherwise: in standalone show on all pages, else follow base rules
    const showFooter = page === 'landing' ? false : (isStandalone ? true : baseShowFooter);

    return {
        getUserRole,
        unreadNotifications,
        hasNewBookings,
        showFooter
    };
};

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

    // @ts-expect-error - Page type needs updating
    const pagesWithoutFooter: Page[] = ['landing', 'language', 'login', 'register', 'adminLogin', 'adminDashboard'];
    const showFooter = !pagesWithoutFooter.includes(page) && !(page === 'chatList' && activeChatRoom);

    return {
        getUserRole,
        unreadNotifications,
        hasNewBookings,
        showFooter
    };
};

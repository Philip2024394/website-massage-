/**
 * useAllHooks - Centralized hook initialization
 * Combines all feature hooks into a single hook for cleaner App.tsx
 */

import { useAppState } from './useAppState';
import { useDataFetching } from './useDataFetching';
import { useNavigation } from './useNavigation';
import { useAuthHandlers } from './useAuthHandlers';
import { useBookingHandlers } from './useBookingHandlers';
import { useProviderAgentHandlers } from './useProviderAgentHandlers';
import { useFooterNavigation } from './useFooterNavigation';
import { useDerivedState } from './useDerivedState';
import { useHomeHandlers } from './useHomeHandlers';

export const useAllHooks = () => {
    // @ts-ignore - Centralized state
    const state = useAppState();
    const dataFetching = useDataFetching();
    
    // @ts-ignore - Navigation hook
    const navigation = useNavigation({
        setPage: state.setPage,
        setSelectedPlace: state.setSelectedPlace,
        setProviderAuthInfo: state.setProviderAuthInfo,
        setProviderForBooking: state.setProviderForBooking,
        setIsAdminLoggedIn: state.setIsAdminLoggedIn,
        setLoggedInUser: state.setLoggedInUser,
        setAdminDashboardTab: state.setAdminDashboardTab,
        loggedInProvider: state.loggedInProvider,
        loggedInCustomer: state.loggedInCustomer,
        // Additional props for landing page navigation
        setLanguage: state.setLanguage,
        setUserLocation: state.setUserLocation,
        setIsHotelLoggedIn: state.setIsHotelLoggedIn,
        setIsVillaLoggedIn: state.setIsVillaLoggedIn,
        setLoggedInProvider: state.setLoggedInProvider,
        setLoggedInAgent: state.setLoggedInAgent,
        setImpersonatedAgent: state.setImpersonatedAgent,
        setLoggedInCustomer: state.setLoggedInCustomer,
        // Registration prompt
        setShowRegisterPrompt: state.setShowRegisterPrompt
    });
    
    // @ts-ignore - Auth handlers
    const authHandlers = useAuthHandlers({
        setPage: state.setPage,
        setIsAdminLoggedIn: state.setIsAdminLoggedIn,
        setLoggedInUser: state.setLoggedInUser,
        setLoggedInProvider: state.setLoggedInProvider,
        setLoggedInAgent: state.setLoggedInAgent,
        setLoggedInCustomer: state.setLoggedInCustomer,
        setIsHotelLoggedIn: state.setIsHotelLoggedIn,
        setIsVillaLoggedIn: state.setIsVillaLoggedIn
    });
    
    // @ts-ignore - Booking handlers
    const bookingHandlers = useBookingHandlers({
        language: state.language,
        user: state.user,
        loggedInCustomer: state.loggedInCustomer,
        isHotelLoggedIn: state.isHotelLoggedIn,
        isVillaLoggedIn: state.isVillaLoggedIn,
        providerForBooking: state.providerForBooking,
        bookings: state.bookings,
        setBookings: state.setBookings,
        setActiveChatRoom: state.setActiveChatRoom,
        setChatBooking: state.setChatBooking,
        setIsChatWindowVisible: state.setIsChatWindowVisible,
        setPage: state.setPage,
        setLoyaltyEvent: state.setLoyaltyEvent,
        setShowRegisterPrompt: state.setShowRegisterPrompt,
        setRegisterPromptContext: (context: string) => state.setRegisterPromptContext(context as 'booking' | 'chat'),
        t: {} // Will be provided by App.tsx
    });
    
    // @ts-ignore - Provider/Agent handlers
    const providerAgentHandlers = useProviderAgentHandlers({
        loggedInProvider: state.loggedInProvider,
        loggedInAgent: state.loggedInAgent,
        impersonatedAgent: state.impersonatedAgent,
        therapists: state.therapists,
        setLoggedInAgent: state.setLoggedInAgent,
        setImpersonatedAgent: state.setImpersonatedAgent,
        setAdminMessages: state.setAdminMessages,
        setPage: state.setPage
    });
    
    // @ts-ignore - Footer navigation
    const footerNav = useFooterNavigation({
        setPage: state.setPage,
        loggedInUser: state.loggedInUser,
        loggedInProvider: state.loggedInProvider,
        loggedInAgent: state.loggedInAgent,
        loggedInCustomer: state.loggedInCustomer,
        isHotelLoggedIn: state.isHotelLoggedIn
    });
    
    // @ts-ignore - Derived state
    const derived = useDerivedState({
        isAdminLoggedIn: state.isAdminLoggedIn,
        loggedInProvider: state.loggedInProvider,
        loggedInAgent: state.loggedInAgent,
        loggedInCustomer: state.loggedInCustomer,
        isHotelLoggedIn: state.isHotelLoggedIn,
        notifications: state.notifications,
        bookings: state.bookings,
        page: state.page,
        activeChatRoom: state.activeChatRoom
    });

    // @ts-ignore - Home page handlers
    const homeHandlers = useHomeHandlers({
        user: state.user,
        language: state.language,
        loggedInCustomer: state.loggedInCustomer,
        isHotelLoggedIn: state.isHotelLoggedIn,
        isVillaLoggedIn: state.isVillaLoggedIn,
        setPage: state.setPage,
        setProviderForBooking: state.setProviderForBooking,
        setShowRegisterPrompt: state.setShowRegisterPrompt,
        setRegisterPromptContext: state.setRegisterPromptContext as any,
        setActiveChatRoom: state.setActiveChatRoom,
        setChatBooking: state.setChatBooking,
        setIsChatWindowVisible: state.setIsChatWindowVisible,
        setBookings: state.setBookings
    });

    return {
        state,
        dataFetching,
        navigation,
        authHandlers,
        bookingHandlers,
        providerAgentHandlers,
        footerNav,
        derived,
        homeHandlers
    };
};

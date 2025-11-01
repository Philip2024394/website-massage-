import React from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AppFooterLayout } from './components/layout/AppFooterLayout';
import { AppRouter } from './AppRouter';
import { useAppState } from './hooks/useAppState';
import { useDataFetching } from './hooks/useDataFetching';
import { useNavigation } from './hooks/useNavigation';
import { useAuthHandlers } from './hooks/useAuthHandlers';
import { useBookingHandlers } from './hooks/useBookingHandlers';
import { useProviderAgentHandlers } from './hooks/useProviderAgentHandlers';
import { useFooterNavigation } from './hooks/useFooterNavigation';
import { useDerivedState } from './hooks/useDerivedState';
import { useAppInitialization } from './hooks/useAppInitialization';
import { translations } from './translations/index.ts';

const App: React.FC = () => {
    // @ts-ignore - State management
    const state = useAppState();
    const dataFetching = useDataFetching();
    
    // @ts-ignore - Feature hooks
    const navigation = useNavigation({
        setPage: state.setPage,
        setSelectedPlace: state.setSelectedPlace,
        setProviderAuthInfo: state.setProviderAuthInfo,
        setProviderForBooking: state.setProviderForBooking,
        setIsAdminLoggedIn: state.setIsAdminLoggedIn,
        setLoggedInUser: state.setLoggedInUser,
        setAdminDashboardTab: state.setAdminDashboardTab,
        loggedInProvider: state.loggedInProvider
    });
    
    // @ts-ignore - Auth handlers
    const authHandlers = useAuthHandlers({
        setPage: state.setPage,
        setUser: state.setUser,
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
        venueMenuId: state.venueMenuId,
        setPage: state.setPage,
        setUser: state.setUser,
        setBookings: state.setBookings,
        setShowRegisterPrompt: state.setShowRegisterPrompt,
        setRegisterPromptContext: state.setRegisterPromptContext,
        setLoggedInCustomer: state.setLoggedInCustomer,
        setLoyaltyEvent: state.setLoyaltyEvent
    });
    
    // @ts-ignore - Provider/Agent handlers
    const providerAgentHandlers = useProviderAgentHandlers({
        loggedInProvider: state.loggedInProvider,
        loggedInAgent: state.loggedInAgent,
        therapists: state.therapists,
        setLoggedInProvider: state.setLoggedInProvider,
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
    
    // @ts-ignore - App initialization
    useAppInitialization({ state, dataFetching, authHandlers });
    
    const t = (key: string) => (translations as any)[state.language][key] || key;

    return (
        <AppLayout
            showRegisterPrompt={state.showRegisterPrompt}
            onRegisterPromptClose={navigation.handleRegisterPromptClose}
            onRegisterPromptRegister={navigation.handleRegisterPromptRegister}
            loyaltyEvent={state.loyaltyEvent}
            onLoyaltyEventClose={() => state.setLoyaltyEvent(null)}
            activeChatRoom={state.activeChatRoom}
            chatBooking={state.chatBooking}
            isChatWindowVisible={state.isChatWindowVisible}
            loggedInCustomer={state.loggedInCustomer}
            user={state.user}
            language={state.language}
            onChatClose={() => state.setIsChatWindowVisible(false)}
            isFullScreen={state.isFullScreen}
        >
            <div className={state.isFullScreen ? "flex-grow" : "flex-grow pb-16"}>
                <AppRouter {...state} {...navigation} {...authHandlers} {...bookingHandlers} {...providerAgentHandlers} t={t} />
            </div>

            <AppFooterLayout
                showFooter={derived.showFooter}
                userRole={derived.getUserRole()}
                currentPage={state.page}
                unreadNotifications={derived.unreadNotifications}
                hasNewBookings={derived.hasNewBookings}
                hasWhatsAppClick={derived.hasWhatsAppClick}
                onHomeClick={footerNav.handleFooterHome}
                onNotificationsClick={() => state.setPage('notifications')}
                onBookingsClick={() => state.setPage('bookings')}
                onProfileClick={footerNav.handleFooterProfile}
                onDashboardClick={footerNav.handleFooterDashboard}
                onMenuClick={footerNav.handleFooterMenu}
                onChatClick={() => state.setPage('chatList')}
            />
        </AppLayout>
    );
};

export default App;

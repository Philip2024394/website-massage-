import { AppLayout } from './components/layout/AppLayout';
import { AppFooterLayout } from './components/layout/AppFooterLayout';
import { AppRouter } from './AppRouter';
import { useDataFetching } from './hooks/useDataFetching';
import { useNavigation } from './hooks/useNavigation';
import { useAuthHandlers } from './hooks/useAuthHandlers';
import { useBookingHandlers } from './hooks/useBookingHandlers';
import { useProviderAgentHandlers } from './hooks/useProviderAgentHandlers';
import { useFooterNavigation } from './hooks/useFooterNavigation';
import { useDerivedState } from './hooks/useDerivedState';
import { useTranslations } from './translations';

const App = () => {
    // Data fetching
    const dataHook = useDataFetching();
    
    // Navigation
    const navHook = useNavigation({ setPage: dataHook.setPage });
    
    // Auth handlers
    const authHook = useAuthHandlers({ setPage: dataHook.setPage, language: dataHook.language });
    
    // Booking handlers
    const bookingHook = useBookingHandlers({ setPage: dataHook.setPage });
    
    // Provider/Agent handlers
    const providerAgentHook = useProviderAgentHandlers({
        loggedInProvider: dataHook.loggedInProvider,
        loggedInAgent: dataHook.loggedInAgent,
        setTherapists: dataHook.setTherapists
    });
    
    // Footer navigation
    const footerNav = useFooterNavigation({
        setPage: dataHook.setPage,
        loggedInUser: dataHook.loggedInUser,
        loggedInProvider: dataHook.loggedInProvider,
        loggedInAgent: dataHook.loggedInAgent,
        loggedInCustomer: dataHook.loggedInCustomer,
        isHotelLoggedIn: dataHook.isHotelLoggedIn
    });
    
    // Derived state
    const derived = useDerivedState({
        isAdminLoggedIn: dataHook.isAdminLoggedIn,
        loggedInProvider: dataHook.loggedInProvider,
        loggedInAgent: dataHook.loggedInAgent,
        loggedInCustomer: dataHook.loggedInCustomer,
        isHotelLoggedIn: dataHook.isHotelLoggedIn,
        notifications: dataHook.notifications,
        bookings: dataHook.bookings,
        page: dataHook.page,
        activeChatRoom: dataHook.activeChatRoom
    });
    
    // Translations
    const t = useTranslations(dataHook.language);

    return (
        <AppLayout
            showRegisterPrompt={dataHook.showRegisterPrompt}
            onRegisterPromptClose={navHook.handleRegisterPromptClose}
            onRegisterPromptRegister={navHook.handleRegisterPromptRegister}
            loyaltyEvent={dataHook.loyaltyEvent}
            onLoyaltyEventClose={() => dataHook.setLoyaltyEvent(null)}
            activeChatRoom={dataHook.activeChatRoom}
            chatBooking={dataHook.chatBooking}
            isChatWindowVisible={dataHook.isChatWindowVisible}
            loggedInCustomer={dataHook.loggedInCustomer}
            user={dataHook.user}
            language={dataHook.language}
            onChatClose={() => dataHook.setIsChatWindowVisible(false)}
            isFullScreen={dataHook.isFullScreen}
        >
            <div className={dataHook.isFullScreen ? "flex-grow" : "flex-grow pb-16"}>
                <AppRouter
                    {...dataHook}
                    {...navHook}
                    {...authHook}
                    {...bookingHook}
                    {...providerAgentHook}
                    t={t}
                />
            </div>

            <AppFooterLayout
                showFooter={derived.showFooter}
                userRole={derived.getUserRole()}
                currentPage={dataHook.page}
                unreadNotifications={derived.unreadNotifications}
                hasNewBookings={derived.hasNewBookings}
                hasWhatsAppClick={derived.hasWhatsAppClick}
                onHomeClick={footerNav.handleFooterHome}
                onNotificationsClick={() => dataHook.setPage('notifications')}
                onBookingsClick={() => dataHook.setPage('bookings')}
                onProfileClick={footerNav.handleFooterProfile}
                onDashboardClick={footerNav.handleFooterDashboard}
                onMenuClick={footerNav.handleFooterMenu}
                onChatClick={() => dataHook.setPage('chatList')}
            />
        </AppLayout>
    );
};

export default App;

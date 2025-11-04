import React from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AppFooterLayout } from './components/layout/AppFooterLayout';
import { AppRouter } from './AppRouter';
import { useAllHooks } from './hooks/useAllHooks';
import { translations } from './translations/index.ts';

const App: React.FC = () => {
    const { state, navigation, authHandlers, bookingHandlers, providerAgentHandlers, footerNav, derived } = useAllHooks();
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

import React, { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AppFooterLayout } from './components/layout/AppFooterLayout';
import { AppRouter } from './AppRouter';
import { useAllHooks } from './hooks/useAllHooks';
import { translations } from './translations/index.ts';

const App: React.FC = () => {
    const { state, dataFetching, navigation, authHandlers, bookingHandlers, providerAgentHandlers, footerNav, derived, homeHandlers } = useAllHooks();
    
    // Get translations for current language
    const t = translations[state.language];

    // Fetch initial data on mount
    useEffect(() => {
        const loadData = async () => {
            console.log(' Loading therapists and places...');
            const { therapists, places } = await dataFetching.fetchPublicData();
            console.log(' Loaded:', therapists.length, 'therapists,', places.length, 'places');
            state.setTherapists(therapists);
            state.setPlaces(places);
        };
        loadData();
    }, []);

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
                <AppRouter {...state} {...navigation} {...authHandlers} {...bookingHandlers} {...providerAgentHandlers} {...homeHandlers} isLoading={dataFetching.isLoading} t={t} />
            </div>

            <AppFooterLayout
                showFooter={derived.showFooter}
                showFloatingButton={true}
                page={state.page}
                language={state.language}
                userLocation={state.userLocation}
                unreadNotifications={derived.unreadNotifications}
                hasNewBookings={derived.hasNewBookings}
                hasWhatsAppClick={derived.hasWhatsAppClick}
                isAdminLoggedIn={state.isAdminLoggedIn}
                isHotelLoggedIn={state.isHotelLoggedIn}
                isVillaLoggedIn={state.isVillaLoggedIn}
                loggedInUser={state.loggedInUser}
                loggedInAgent={state.loggedInAgent}
                loggedInCustomer={state.loggedInCustomer}
                user={state.user}
                showRegisterPrompt={state.showRegisterPrompt}
                registerPromptContext={state.registerPromptContext}
                loyaltyEvent={state.loyaltyEvent}
                activeChatRoom={state.activeChatRoom}
                chatBooking={state.chatBooking}
                isChatWindowVisible={state.isChatWindowVisible}
                getUserRole={derived.getUserRole}
                handleFooterHome={footerNav.handleFooterHome}
                handleFooterProfile={footerNav.handleFooterProfile}
                handleFooterDashboard={footerNav.handleFooterDashboard}
                handleFooterMenu={footerNav.handleFooterMenu}
                handleFooterSearch={() => {}}
                handleRegisterPromptClose={navigation.handleRegisterPromptClose}
                handleRegisterPromptRegister={navigation.handleRegisterPromptRegister}
                setPage={state.setPage}
                setAdminDashboardTab={state.setAdminDashboardTab}
                setRegisterPromptContext={state.setRegisterPromptContext}
                setShowRegisterPrompt={state.setShowRegisterPrompt}
                setLoyaltyEvent={state.setLoyaltyEvent}
                setIsChatWindowVisible={state.setIsChatWindowVisible}
                t={t}
            />
        </AppLayout>
    );
};

export default App;
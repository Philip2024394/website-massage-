import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AppFooterLayout } from './components/layout/AppFooterLayout';
import { AppRouter } from './AppRouter';
import { APP_CONFIG } from './config/appConfig';
import { useDataFetching } from './hooks/useDataFetching';
import { useNavigation } from './hooks/useNavigation';
import { useAuthHandlers } from './hooks/useAuthHandlers';
import { useBookingHandlers } from './hooks/useBookingHandlers';
import { useProviderAgentHandlers } from './hooks/useProviderAgentHandlers';
import { useFooterNavigation } from './hooks/useFooterNavigation';
import { useDerivedState } from './hooks/useDerivedState';
import { useTranslations } from './utils/translations';
import { LoyaltyRewardModal } from './components/LoyaltyRewardModal';
import { BookingChatWindow } from './components/chat/BookingChatWindow';
import type { Page } from './types/pageTypes';

const App = () => {
    // Core hooks
    const {
        language,
        setLanguage,
        page,
        setPage,
        isLoading,
        therapists,
        setTherapists,
        places,
        massageTypes,
        notifications,
        bookings,
        hotelsAndVillas,
        jobPostings,
        selectedTherapist,
        selectedPlace,
        selectedMassageType,
        providerForBooking,
        setProviderForBooking,
        registrationType,
        setRegistrationType,
        selectedMembershipPackage,
        setSelectedMembershipPackage,
        activeChatRoom,
        setActiveChatRoom,
        chatMessages,
        unreadMessagesCount,
        isChatWindowVisible,
        setIsChatWindowVisible,
        chatBooking,
        loyaltyEvent,
        setLoyaltyEvent,
        isFullScreen,
        adminDashboardTab,
        adminMessages,
        setAdminMessages,
        showRegisterPrompt,
        setShowRegisterPrompt,
        user,
        handleSendAdminMessage,
        handleStartImpersonating,
        handleStopImpersonating,
        handleMarkMessagesAsRead,
        handleUpdateJobPosting,
        handleDeleteJobPosting
    } = useDataFetching();

    const {
        handleBackToHome,
        handleNavigateToTherapistAuth,
        handleNavigateToAgentAuth,
        handleBackToProviderDashboard,
        handleNavigateToTherapistDashboard,
        handleIncrementAnalytics,
        handleRegisterPromptClose,
        handleRegisterPromptRegister,
        handleShowRegisterPromptForChat,
        handleNavigateToBooking,
        handleQuickBookWithChat,
        handleChatWithBusyTherapist,
        handleMarkNotificationAsRead,
        handleSetSelectedPlace,
        handleSelectRegistration,
        handleSelectMembershipPackage,
        handleSelectMembershipCheckout
    } = useNavigation({ 
        setPage, 
        setProviderForBooking, 
        setRegistrationType, 
        setSelectedMembershipPackage,
        setActiveChatRoom,
        setIsChatWindowVisible,
        setShowRegisterPrompt
    });

    const {
        loggedInUser,
        loggedInProvider,
        loggedInCustomer,
        loggedInAgent,
        isAdminLoggedIn,
        isHotelLoggedIn,
        handleLanguageSelect,
        handleEnterApp,
        handleSetUserLocation,
        handleLogout,
        handleAdminLogin,
        handleAdminLogout,
        handleProviderLogin,
        handleProviderRegister,
        handleProviderLogout,
        handleCustomerAuthSuccess,
        handleCustomerLogout,
        handleAgentRegister,
        handleAgentLogin,
        handleAgentLogout,
        handleAgentAcceptTerms,
        handleHotelLogout,
        providerAuthInfo
    } = useAuthHandlers({ setPage, language });

    const {
        handleCreateBooking
    } = useBookingHandlers({ setPage });

    const {
        handleTherapistStatusChange,
        handleSaveTherapistProfile,
        handleSavePlaceProfile,
        handleSaveAgentProfile
    } = useProviderAgentHandlers({ 
        loggedInProvider, 
        loggedInAgent, 
        setTherapists 
    });

    const t = useTranslations(language);

    // Calculate derived state
    const getUserRole = () => {
        if (isAdminLoggedIn) return 'admin';
        if (loggedInProvider) return loggedInProvider.type === 'therapist' ? 'therapist' : 'place';
        if (loggedInAgent) return 'agent';
        if (loggedInCustomer) return 'customer';
        if (isHotelLoggedIn) return 'hotel';
        return null;
    };

    const unreadNotifications = notifications.filter(n => !n.isRead && n.providerId === loggedInProvider?.id).length;
    const hasNewBookings = bookings.some(b => !b.isRead && b.providerId === loggedInProvider?.id);
    const hasWhatsAppClick = false;

    // Footer navigation handlers
    const pagesWithoutFooter: Page[] = ['landing', 'language', 'login', 'register', 'adminLogin', 'therapistDashboard', 'placeDashboard'];
    const showFooter = !pagesWithoutFooter.includes(page) && !(page === 'chatList' && activeChatRoom);

    const handleFooterHome = () => {
        if (loggedInUser) {
            switch(loggedInUser.type) {
                case 'admin': setPage('adminDashboard'); break;
                case 'hotel': setPage('home'); break;
                case 'villa': setPage('home'); break;
                case 'agent': setPage('agentDashboard'); break;
            }
        } else if (loggedInProvider) {
            if (loggedInProvider.type === 'therapist') {
                setPage('therapistDashboard');
            } else {
                setPage('placeDashboard');
            }
        } else if (loggedInAgent) {
            setPage('agentDashboard');
        } else if (loggedInCustomer) {
            setPage('home');
        } else if (isHotelLoggedIn) {
            setPage('hotelDashboard');
        } else {
            setPage('home');
        }
    };

    const handleFooterDashboard = () => {
        if (loggedInProvider) {
            if (loggedInProvider.type === 'therapist') {
                setPage('therapistDashboard');
            } else {
                setPage('placeDashboard');
            }
        } else if (loggedInAgent) {
            setPage('agentDashboard');
        } else if (loggedInCustomer) {
            setPage('customerDashboard');
        } else if (isHotelLoggedIn) {
            setPage('hotelDashboard');
        }
    };

    const handleFooterProfile = () => {
        if (loggedInProvider) {
            if (loggedInProvider.type === 'therapist') {
                setPage('therapistDashboard');
            } else {
                setPage('placeDashboard');
            }
        } else if (loggedInAgent) {
            setPage('agentDashboard');
        } else if (loggedInCustomer) {
            setPage('customerDashboard');
        }
    };

    const handleFooterMenu = () => {
        setPage('home');
    };

    return (
        <AppLayout
            showRegisterPrompt={showRegisterPrompt}
            onRegisterPromptClose={handleRegisterPromptClose}
            onRegisterPromptRegister={handleRegisterPromptRegister}
            loyaltyEvent={loyaltyEvent}
            onLoyaltyEventClose={() => setLoyaltyEvent(null)}
            activeChatRoom={activeChatRoom}
            chatBooking={chatBooking}
            isChatWindowVisible={isChatWindowVisible}
            loggedInCustomer={loggedInCustomer}
            user={user}
            language={language}
            onChatClose={() => {
                setIsChatWindowVisible(false);
                console.log('🔥 Chat window closed - can be reopened from footer');
            }}
            isFullScreen={isFullScreen}
        >
            <div className={isFullScreen ? "flex-grow" : "flex-grow pb-16"}>
                <AppRouter
                    page={page}
                    language={language}
                    t={t}
                    isLoading={isLoading}
                    loggedInUser={loggedInUser}
                    loggedInProvider={loggedInProvider}
                    loggedInCustomer={loggedInCustomer}
                    loggedInAgent={loggedInAgent}
                    isAdminLoggedIn={isAdminLoggedIn}
                    isHotelLoggedIn={isHotelLoggedIn}
                    adminDashboardTab={adminDashboardTab}
                    adminMessages={adminMessages}
                    therapists={therapists}
                    places={places}
                    massageTypes={massageTypes}
                    selectedTherapist={selectedTherapist}
                    selectedPlace={selectedPlace}
                    selectedMassageType={selectedMassageType}
                    providerForBooking={providerForBooking}
                    notifications={notifications}
                    bookings={bookings}
                    activeChatRoom={activeChatRoom}
                    chatMessages={chatMessages}
                    unreadMessagesCount={unreadMessagesCount}
                    providerAuthInfo={providerAuthInfo}
                    registrationType={registrationType}
                    selectedMembershipPackage={selectedMembershipPackage}
                    hotelsAndVillas={hotelsAndVillas}
                    jobPostings={jobPostings}
                    onSetPage={setPage}
                    onSetLanguage={setLanguage}
                    onBackToHome={handleBackToHome}
                    onNavigateToBooking={handleNavigateToBooking}
                    onNavigateToTherapistAuth={handleNavigateToTherapistAuth}
                    onNavigateToAgentAuth={handleNavigateToAgentAuth}
                    onIncrementAnalytics={handleIncrementAnalytics}
                    onAdminLogin={handleAdminLogin}
                    onAdminLogout={handleAdminLogout}
                    onProviderLogin={handleProviderLogin}
                    onProviderRegister={handleProviderRegister}
                    onProviderLogout={handleProviderLogout}
                    onCustomerAuthSuccess={handleCustomerAuthSuccess}
                    onCustomerLogout={handleCustomerLogout}
                    onAgentRegister={handleAgentRegister}
                    onAgentLogin={handleAgentLogin}
                    onAgentLogout={handleAgentLogout}
                    onAgentAcceptTerms={handleAgentAcceptTerms}
                    onHotelLogout={handleHotelLogout}
                    onSelectRegistration={handleSelectRegistration}
                    onBackToProviderDashboard={handleBackToProviderDashboard}
                    onNavigateToTherapistDashboard={handleNavigateToTherapistDashboard}
                    onTherapistStatusChange={handleTherapistStatusChange}
                    onSaveTherapistProfile={handleSaveTherapistProfile}
                    onSavePlaceProfile={handleSavePlaceProfile}
                    onSaveAgentProfile={handleSaveAgentProfile}
                    onSelectMembershipPackage={handleSelectMembershipPackage}
                    onSelectMembershipCheckout={handleSelectMembershipCheckout}
                    onCreateBooking={handleCreateBooking}
                    onMarkNotificationAsRead={handleMarkNotificationAsRead}
                    onSendAdminMessage={handleSendAdminMessage}
                    onStartImpersonating={handleStartImpersonating}
                    onStopImpersonating={handleStopImpersonating}
                    onMarkMessagesAsRead={handleMarkMessagesAsRead}
                    onUpdateJobPosting={handleUpdateJobPosting}
                    onDeleteJobPosting={handleDeleteJobPosting}
                />
            </div>

            <AppFooterLayout
                showFooter={showFooter}
                userRole={getUserRole()}
                currentPage={page}
                unreadNotifications={unreadNotifications}
                hasNewBookings={hasNewBookings}
                hasWhatsAppClick={hasWhatsAppClick}
                onHomeClick={handleFooterHome}
                onNotificationsClick={() => setPage('notifications')}
                onBookingsClick={() => setPage('bookings')}
                onProfileClick={handleFooterProfile}
                onDashboardClick={handleFooterDashboard}
                onMenuClick={handleFooterMenu}
                onChatClick={() => setPage('chatList')}
            />
        </AppLayout>
    );
};

export default App;
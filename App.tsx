import { AppLayout } from './components/layout/AppLayout';
import { AppRouter } from './AppRouter';
import { useAllHooks } from './hooks/useAllHooks';
import { useTranslations } from './lib/useTranslations';

const App = () => {
    // All hooks combined
    const hooks = useAllHooks();
    const { state, navigation, authHandlers } = hooks;
    
    // Get translations
    const { t } = useTranslations(state.language);

    return (
        <AppLayout
            isFullScreen={state.isFullScreen}
        >
            <AppRouter
                page={state.page}
                language={state.language}
                t={t}
                isLoading={state.isLoading}
                loggedInUser={state.loggedInUser}
                loggedInProvider={state.loggedInProvider}
                loggedInCustomer={state.loggedInCustomer}
                loggedInAgent={state.loggedInAgent}
                isAdminLoggedIn={state.isAdminLoggedIn}
                isHotelLoggedIn={state.isHotelLoggedIn}
                isVillaLoggedIn={state.isVillaLoggedIn}
                therapists={state.therapists}
                places={state.places}
                notifications={state.notifications}
                bookings={state.bookings}
                user={state.user}
                userLocation={state.userLocation}
                selectedPlace={state.selectedPlace}
                selectedMassageType={state.selectedMassageType}
                providerForBooking={state.providerForBooking}
                adminMessages={state.adminMessages}
                providerAuthInfo={state.providerAuthInfo}
                selectedTherapist={null}
                selectedJobId={null}
                venueMenuId={state.venueMenuId}
                hotelVillaLogo={null}
                impersonatedAgent={state.impersonatedAgent}
                handleLanguageSelect={navigation?.handleLanguageSelect || (() => Promise.resolve())}
                handleEnterApp={navigation?.handleEnterApp || (() => Promise.resolve())}
                handleSetUserLocation={navigation?.handleSetUserLocation || (() => {})}
                handleSetSelectedPlace={navigation?.handleSetSelectedPlace || (() => {})}
                handleLogout={authHandlers?.handleProviderLogout || (() => Promise.resolve())}
                handleNavigateToTherapistLogin={navigation?.handleNavigateToTherapistLogin || (() => {})}
                handleNavigateToRegistrationChoice={navigation?.handleNavigateToRegistrationChoice || (() => {})}
                handleNavigateToBooking={navigation?.handleNavigateToBooking || (() => {})}
                handleQuickBookWithChat={() => Promise.resolve()}
                handleChatWithBusyTherapist={() => Promise.resolve()}
                handleShowRegisterPromptForChat={() => {}}
                handleIncrementAnalytics={() => Promise.resolve()}
                handleNavigateToHotelLogin={navigation?.handleNavigateToHotelLogin || (() => {})}
                handleNavigateToVillaLogin={navigation?.handleNavigateToVillaLogin || (() => {})}
                handleNavigateToMassagePlaceLogin={navigation?.handleNavigateToMassagePlaceLogin || (() => {})}
                handleNavigateToAdminLogin={navigation?.handleNavigateToAdminLogin || (() => {})}
                handleNavigateToServiceTerms={navigation?.handleNavigateToServiceTerms || (() => {})}
                handleNavigateToPrivacyPolicy={navigation?.handleNavigateToPrivacyPolicy || (() => {})}
                handleNavigateToCustomerDashboard={navigation?.handleNavigateToCustomerDashboard || (() => {})}
                handleBackToHome={navigation?.handleBackToHome || (() => {})}
                handleSelectRegistration={navigation?.handleSelectRegistration || (() => {})}
                handleTherapistStatusChange={() => Promise.resolve()}
                handleSaveTherapist={() => Promise.resolve()}
                handleSavePlace={() => Promise.resolve()}
                handleAgentRegister={() => Promise.resolve({ success: true, message: '' })}
                handleAgentLogin={() => Promise.resolve({ success: true, message: '' })}
                handleAgentAcceptTerms={() => Promise.resolve()}
                handleSaveAgentProfile={() => Promise.resolve()}
                handleStopImpersonating={() => {}}
                handleSendAdminMessage={() => Promise.resolve()}
                handleMarkMessagesAsRead={() => Promise.resolve()}
                handleSelectMembershipPackage={() => {}}
                handleProviderLogin={() => {}}
                handleProviderLogout={() => Promise.resolve()}
                handleCustomerAuthSuccess={() => Promise.resolve()}
                handleCustomerLogout={() => Promise.resolve()}
                handleAgentLogout={() => Promise.resolve()}
                handleHotelLogout={() => Promise.resolve()}
                handleVillaLogout={() => Promise.resolve()}
                handleAdminLogout={() => Promise.resolve()}
                handleCreateBooking={() => Promise.resolve()}
                handleNavigateToBookingPage={navigation?.handleNavigateToBookingPage || (() => {})}
                handleUpdateBookingStatus={() => Promise.resolve()}
                handleMarkNotificationAsRead={() => {}}
                handleAdminLogin={() => {}}
                handleNavigateToNotifications={navigation?.handleNavigateToNotifications || (() => {})}
                handleNavigateToAgentAuth={navigation?.handleNavigateToAgentAuth || (() => {})}
                handleNavigateToTherapistDashboard={navigation?.handleNavigateToTherapistDashboard || (() => {})}
                handleNavigateToTherapistProfileCreation={() => {}}
                setPage={state.setPage}
                setLoggedInProvider={state.setLoggedInProvider}
                setProviderAuthInfo={state.setProviderAuthInfo}
                setProviderForBooking={state.setProviderForBooking}
                setSelectedTherapist={() => {}}
                setSelectedJobId={() => {}}
            />
        </AppLayout>
    );
};

export default App;
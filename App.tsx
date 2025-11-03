import { AppLayout } from './components/layout/AppLayout';
import { AppFooterLayout } from './components/layout/AppFooterLayout';
import { AppRouter } from './AppRouter';
import { useAllHooks } from './hooks/useAllHooks';
import { useTranslations } from './lib/useTranslations';
// Temporarily removed: import { useSimpleLanguage } from './context/SimpleLanguageContext';
// Temporarily removed: import SimpleLanguageSelector from './components/SimpleLanguageSelector';

const App = () => {
    // Temporarily use fallback language while debugging
    const language: 'en' | 'id' = 'id';
    const setLanguage = (lang: 'en' | 'id') => {
        console.log('🌍 App.tsx: Language change to:', lang);
    };
    
    // All hooks combined (but override language with our working one)
    const hooks = useAllHooks();
    const { state, navigation, authHandlers, providerAgentHandlers, footerNav, derived } = hooks;
    
    // Override the language state with our working one
    const overriddenState = { ...state, language };
    
    // Debug: Check what navigation handlers we have
    console.log('🔧 App.tsx with SimpleLanguage:', {
        handleLanguageSelect: !!setLanguage,
        currentLanguage: language
    });
    
    // Get translations using our working language
    const { t } = useTranslations(language);
    
    // Debug: Check what translations we're getting and t function type
    console.log('🔍 App.tsx translation debug:', {
        language,
        tType: typeof t,
        tIsFunction: typeof t === 'function',
        headerWelcome: typeof t === 'function' ? t('header.welcome') : 'T_NOT_FUNCTION',
        landingGetStarted: typeof t === 'function' ? t('landing.getStarted') : 'T_NOT_FUNCTION',
        sampleTranslation: typeof t === 'function' ? t('common.loading') : 'T_NOT_FUNCTION',
        currentPage: overriddenState.page
    });

    // Create a simple language handler that works
    const handleLanguageSelect = async (lang: 'en' | 'id') => {
        console.log('🌍 App.tsx: Simple handleLanguageSelect called with:', lang);
        setLanguage(lang);
        return Promise.resolve();
    };

    return (
        <AppLayout
            isFullScreen={overriddenState.isFullScreen}
        >
            <div className={overriddenState.isFullScreen ? "flex-grow" : "flex-grow pb-16"}>
                <AppRouter
                    page={overriddenState.page}
                    language={language}
                    t={t}
                    isLoading={overriddenState.isLoading}
                    loggedInUser={overriddenState.loggedInUser}
                    loggedInProvider={overriddenState.loggedInProvider}
                    loggedInCustomer={overriddenState.loggedInCustomer}
                    loggedInAgent={overriddenState.loggedInAgent}
                    isAdminLoggedIn={overriddenState.isAdminLoggedIn}
                    isHotelLoggedIn={overriddenState.isHotelLoggedIn}
                    isVillaLoggedIn={overriddenState.isVillaLoggedIn}
                    therapists={overriddenState.therapists}
                    places={overriddenState.places}
                    notifications={overriddenState.notifications}
                    bookings={overriddenState.bookings}
                    user={overriddenState.user}
                    userLocation={overriddenState.userLocation}
                    selectedPlace={overriddenState.selectedPlace}
                    selectedMassageType={overriddenState.selectedMassageType}
                    providerForBooking={overriddenState.providerForBooking}
                    adminMessages={overriddenState.adminMessages}
                    providerAuthInfo={overriddenState.providerAuthInfo}
                    selectedTherapist={null}
                    selectedJobId={null}
                    venueMenuId={overriddenState.venueMenuId}
                    hotelVillaLogo={null}
                    impersonatedAgent={overriddenState.impersonatedAgent}
                    handleLanguageSelect={handleLanguageSelect}
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
                    handleTherapistStatusChange={(status: string) => 
                        providerAgentHandlers?.handleTherapistStatusChange 
                            ? providerAgentHandlers.handleTherapistStatusChange(status, providerAgentHandlers.handleSaveTherapist)
                            : Promise.resolve()
                    }
                    handleSaveTherapist={providerAgentHandlers?.handleSaveTherapist || (() => Promise.resolve())}
                    handleSavePlace={providerAgentHandlers?.handleSavePlace || (() => Promise.resolve())}
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
                    handleAdminLogout={authHandlers?.handleAdminLogout || (() => Promise.resolve())}
                    handleCreateBooking={() => Promise.resolve()}
                    handleNavigateToBookingPage={navigation?.handleNavigateToBookingPage || (() => {})}
                    handleUpdateBookingStatus={() => Promise.resolve()}
                    handleMarkNotificationAsRead={() => {}}
                    handleAdminLogin={authHandlers?.handleAdminLogin || (() => {})}
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
                getUserRole={() => {
                    const role = derived.getUserRole();
                    if (role === 'customer') return 'user';
                    return role;
                }}
                handleFooterHome={footerNav.handleFooterHome}
                handleFooterProfile={footerNav.handleFooterProfile}
                handleFooterDashboard={footerNav.handleFooterDashboard}
                handleFooterMenu={footerNav.handleFooterMenu}
                handleFooterSearch={() => state.setPage('home')}
                handleRegisterPromptClose={() => state.setShowRegisterPrompt(false)}
                handleRegisterPromptRegister={() => state.setPage('registrationChoice')}
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
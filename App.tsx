import { AppLayout } from './components/layout/AppLayout';
import { AppFooterLayout } from './components/layout/AppFooterLayout';
import { AppRouter } from './AppRouter';
import { useAllHooks } from './hooks/useAllHooks';
import { useTranslations } from './lib/useTranslations';
import { vscodeTranslateService } from './lib/vscodeTranslateService';
import { DeviceStylesProvider } from './components/DeviceAware';
import BookingPopup from './components/BookingPopup';
import BookingStatusTracker from './components/BookingStatusTracker';
import ScheduleBookingPopup from './components/ScheduleBookingPopup';
import { useState, useEffect } from 'react';
import { bookingExpirationService } from './services/bookingExpirationService';
// Temporarily removed: import { useSimpleLanguage } from './context/SimpleLanguageContext';
// Temporarily removed: import SimpleLanguageSelector from './components/SimpleLanguageSelector';

const App = () => {
    console.log('🏗️ App.tsx: App component rendering...');
    
    // Booking popup state
    const [isBookingPopupOpen, setIsBookingPopupOpen] = useState(false);
    const [bookingProviderInfo, setBookingProviderInfo] = useState<{
        name: string;
        whatsappNumber: string;
        providerId: string;
        providerType: 'therapist' | 'place';
        profilePicture?: string;
        hotelVillaId?: string;
        hotelVillaName?: string;
        hotelVillaType?: 'hotel' | 'villa';
        hotelVillaLocation?: string;
    } | null>(null);

    // Booking Status Tracker state
    const [isStatusTrackerOpen, setIsStatusTrackerOpen] = useState(false);
    const [bookingStatusInfo, setBookingStatusInfo] = useState<{
        bookingId: string;
        therapistName: string;
        duration: number;
        price: number;
        responseDeadline: Date;
    } | null>(null);

    // Schedule Booking Popup state
    const [isScheduleBookingOpen, setIsScheduleBookingOpen] = useState(false);
    const [scheduleBookingInfo, setScheduleBookingInfo] = useState<{
        therapistId: string;
        therapistName: string;
        therapistType: 'therapist' | 'place';
        profilePicture?: string;
        hotelVillaId?: string;
        hotelVillaName?: string;
        hotelVillaType?: 'hotel' | 'villa';
        hotelVillaLocation?: string;
    } | null>(null);

    // Start booking expiration service on mount
    useEffect(() => {
        bookingExpirationService.start();
        
        // Initialize VS Code translation service
        vscodeTranslateService.init();
        
        return () => {
            bookingExpirationService.stop();
        };
    }, []);

    // All hooks combined - ALWAYS call this hook at the same point
    const hooks = useAllHooks();
    const { state, navigation, authHandlers, providerAgentHandlers, derived } = hooks;
    
    // Use the actual language from hooks, not hardcoded
    const { language, setLanguage } = state;
    
    // Global VS Code translation activation on language change
    useEffect(() => {
        if (language) {
            vscodeTranslateService.activateOnLanguageChange(language);
        }
    }, [language]);
    
    // Get translations using the actual language state - ALWAYS call this hook
    const { t } = useTranslations(language);

    // Use the actual language handler from hooks
    const handleLanguageSelect = async (lang: 'en' | 'id') => {
        console.log('🌍 App.tsx: handleLanguageSelect called with:', lang);
        setLanguage(lang);
        return Promise.resolve();
    };

    // Global booking popup handler - can be called from anywhere
    const handleOpenBookingPopup = (
        providerName: string, 
        whatsappNumber?: string,
        providerId?: string,
        providerType?: 'therapist' | 'place',
        hotelVillaId?: string,
        hotelVillaName?: string,
        hotelVillaType?: 'hotel' | 'villa',
        profilePicture?: string,
        hotelVillaLocation?: string
    ) => {
        console.log('📱 Opening booking popup for:', {
            providerName,
            providerId,
            providerType,
            profilePicture,
            hotelVillaId,
            hotelVillaName,
            hotelVillaType,
            hotelVillaLocation
        });
        setBookingProviderInfo({
            name: providerName,
            whatsappNumber: whatsappNumber || '1234567890', // Default number
            providerId: providerId || '',
            providerType: providerType || 'therapist',
            profilePicture,
            hotelVillaId,
            hotelVillaName,
            hotelVillaType,
            hotelVillaLocation
        });
        setIsBookingPopupOpen(true);
    };

    // Make booking popup available globally
    (window as any).openBookingPopup = handleOpenBookingPopup;

    // Global booking status tracker handler
    const handleOpenBookingStatusTracker = (statusInfo: {
        bookingId: string;
        therapistName: string;
        duration: number;
        price: number;
        responseDeadline: Date;
    }) => {
        console.log('📊 Opening booking status tracker:', statusInfo);
        setBookingStatusInfo(statusInfo);
        setIsStatusTrackerOpen(true);
    };

    // Make status tracker available globally
    (window as any).openBookingStatusTracker = handleOpenBookingStatusTracker;

    // Global schedule booking handler
    const handleOpenScheduleBookingPopup = (bookingInfo: {
        therapistId: string;
        therapistName: string;
        therapistType: 'therapist' | 'place';
        profilePicture?: string;
        hotelVillaId?: string;
        hotelVillaName?: string;
        hotelVillaType?: 'hotel' | 'villa';
        hotelVillaLocation?: string;
    }) => {
        console.log('📅 Opening schedule booking popup:', bookingInfo);
        setScheduleBookingInfo(bookingInfo);
        setIsScheduleBookingOpen(true);
    };

    // Make schedule booking available globally
    (window as any).openScheduleBookingPopup = handleOpenScheduleBookingPopup;

    const handleFindNewTherapist = () => {
        setIsStatusTrackerOpen(false);
        // Optionally navigate back to therapist list
        state.setPage('home');
    };

    return (
        <DeviceStylesProvider>
            <AppLayout
                isFullScreen={state.isFullScreen}
            >
            <div className={state.isFullScreen ? "flex-grow" : "flex-grow pb-16"}>
                <AppRouter
                    page={state.page}
                    t={t}
                    isLoading={state.isLoading}

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

                    selectedJobId={null}
                    venueMenuId={state.venueMenuId}
                    hotelVillaLogo={null}
                    impersonatedAgent={state.impersonatedAgent}
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
                    handleShowRegisterPromptForChat={() => {
                        state.setRegisterPromptContext('booking');
                        state.setShowRegisterPrompt(true);
                    }}
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

                    handleProviderLogout={() => Promise.resolve()}
                    handleCustomerAuthSuccess={() => Promise.resolve()}
                    handleCustomerLogout={() => Promise.resolve()}
                    handleAgentLogout={() => Promise.resolve()}
                    handleHotelLogout={authHandlers?.handleHotelLogout || (() => Promise.resolve())}
                    handleVillaLogout={authHandlers?.handleVillaLogout || (() => Promise.resolve())}
                    handleAdminLogout={authHandlers?.handleAdminLogout || (() => Promise.resolve())}
                    handleHotelLogin={authHandlers?.handleHotelLogin || (() => {})}
                    handleCreateBooking={() => Promise.resolve()}

                    handleUpdateBookingStatus={() => Promise.resolve()}
                    handleMarkNotificationAsRead={() => {}}
                    handleAdminLogin={authHandlers?.handleAdminLogin || (() => {})}
                    handleNavigateToNotifications={navigation?.handleNavigateToNotifications || (() => {})}
                    handleNavigateToAgentAuth={navigation?.handleNavigateToAgentAuth || (() => {})}


                    setPage={state.setPage}
                    setLoggedInProvider={state.setLoggedInProvider}



                    setSelectedJobId={() => {}}
                />
            </div>

            <AppFooterLayout
                showFooter={derived.showFooter}
                showFloatingButton={false}
                page={state.page}
                language={state.language}
                userLocation={state.userLocation}
                unreadNotifications={derived.unreadNotifications}
                hasNewBookings={derived.hasNewBookings}
                showRegisterPrompt={state.showRegisterPrompt}
                registerPromptContext={state.registerPromptContext}
                loyaltyEvent={state.loyaltyEvent}
                getUserRole={() => {
                    const role = derived.getUserRole();
                    if (role === 'customer') return 'user';
                    return role;
                }}
                handleRegisterPromptClose={() => state.setShowRegisterPrompt(false)}
                handleRegisterPromptRegister={() => state.setPage('customerAuth')}
                setPage={state.setPage}
                setLoyaltyEvent={state.setLoyaltyEvent}
            />
            
            {/* Global Booking Popup */}
            <BookingPopup
                isOpen={isBookingPopupOpen}
                onClose={() => setIsBookingPopupOpen(false)}
                therapistId={bookingProviderInfo?.providerId || ''}
                therapistName={bookingProviderInfo?.name || ''}
                profilePicture={bookingProviderInfo?.profilePicture}
                providerType={bookingProviderInfo?.providerType}
                hotelVillaId={bookingProviderInfo?.hotelVillaId}
                hotelVillaName={bookingProviderInfo?.hotelVillaName}
                hotelVillaType={bookingProviderInfo?.hotelVillaType}
                hotelVillaLocation={bookingProviderInfo?.hotelVillaLocation}
            />

            {/* Global Booking Status Tracker */}
            <BookingStatusTracker
                isOpen={isStatusTrackerOpen}
                onClose={() => setIsStatusTrackerOpen(false)}
                bookingId={bookingStatusInfo?.bookingId || ''}
                therapistName={bookingStatusInfo?.therapistName || ''}
                duration={bookingStatusInfo?.duration || 60}
                price={bookingStatusInfo?.price || 0}
                responseDeadline={bookingStatusInfo?.responseDeadline || new Date()}
                onFindNewTherapist={handleFindNewTherapist}
            />

            {/* Global Schedule Booking Popup */}
            <ScheduleBookingPopup
                isOpen={isScheduleBookingOpen}
                onClose={() => setIsScheduleBookingOpen(false)}
                therapistId={scheduleBookingInfo?.therapistId || ''}
                therapistName={scheduleBookingInfo?.therapistName || ''}
                therapistType={scheduleBookingInfo?.therapistType || 'therapist'}
                profilePicture={scheduleBookingInfo?.profilePicture}
                hotelVillaId={scheduleBookingInfo?.hotelVillaId}
                hotelVillaName={scheduleBookingInfo?.hotelVillaName}
                hotelVillaType={scheduleBookingInfo?.hotelVillaType}
            />
            </AppLayout>
        </DeviceStylesProvider>
    );
};

export default App;
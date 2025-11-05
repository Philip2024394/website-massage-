import React from 'react';
import type { Page, Language, LoggedInProvider, LoggedInUser } from './types/pageTypes';
import type { User, Place, Therapist, UserLocation, Booking, Notification, Agent, AdminMessage, Analytics } from './types';
import { BookingStatus } from './types';

// Page imports
import LandingPage from './pages/LandingPage';
import UnifiedLoginPage from './pages/UnifiedLoginPage';
import TherapistLoginPage from './pages/TherapistLoginPage';
import HomePage from './pages/HomePage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import MassagePlaceProfilePage from './pages/MassagePlaceProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegistrationChoicePage from './pages/RegistrationChoicePage';
import TherapistDashboardPage from './pages/TherapistDashboardPage';
import TherapistStatusPage from './pages/TherapistStatusPage';
// import PlaceDashboardPage from './pages/PlaceDashboardPage'; // Unused import
import MassagePlaceAdminDashboard from './pages/MassagePlaceAdminDashboard';
import AgentPage from './pages/AgentPage';
import AgentAuthPage from './pages/AgentAuthPage';
import AgentDashboardPage from './pages/AgentDashboardPage';
import AgentTermsPage from './pages/AgentTermsPage';
import ServiceTermsPage from './pages/ServiceTermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CookiesPolicyPage from './pages/CookiesPolicyPage';
import MembershipPage from './pages/MembershipPage';
import BookingPage from './pages/BookingPage';
import NotificationsPage from './pages/NotificationsPage';
import MassageTypesPage from './pages/MassageTypesPage';
import HotelDashboardPage from './pages/HotelDashboardPage';
import VillaDashboardPage from './pages/VillaDashboardPage';
import HotelLoginPage from './pages/HotelLoginPage';
import VillaLoginPage from './pages/VillaLoginPage';
import MassagePlaceLoginPage from './pages/MassagePlaceLoginPage';
import EmployerJobPostingPage from './pages/EmployerJobPostingPage';
import JobPostingPaymentPage from './pages/JobPostingPaymentPage';
import BrowseJobsPage from './pages/BrowseJobsPage';
import MassageJobsPage from './pages/MassageJobsPage';
import TherapistJobRegistrationPage from './pages/TherapistJobRegistrationPage';
import JobUnlockPaymentPage from './pages/JobUnlockPaymentPage';
import AdminBankSettingsPage from './pages/AdminBankSettingsPage';
import CustomerAuthPage from './pages/CustomerAuthPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
// import ChatListPage from './pages/ChatListPage'; // Chat system removed
import AboutUsPage from './pages/AboutUsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import MassageBaliPage from './pages/MassageBaliPage';
import BlogIndexPage from './pages/BlogIndexPage';
import FAQPage from './pages/FAQPage';
import BalineseMassagePage from './pages/BalineseMassagePage';
import DeepTissueMassagePage from './pages/DeepTissueMassagePage';
// import SwedishMassagePage from './pages/SwedishMassagePage';
// import HotStoneMassagePage from './pages/HotStoneMassagePage';
// import AromatherapyMassagePage from './pages/AromatherapyMassagePage';
// import ThaiMassagePage from './pages/ThaiMassagePage';
// import ReflexologyMassagePage from './pages/ReflexologyMassagePage';
// import ShiatsuMassagePage from './pages/ShiatsuMassagePage';
// import SportsMassagePage from './pages/SportsMassagePage';
// import PregnancyMassagePage from './pages/PregnancyMassagePage';
// import ReviewsTestimonialsPage from './pages/ReviewsTestimonialsPage';
import PressMediaPage from './pages/PressMediaPage';
import CareerOpportunitiesPage from './pages/CareerOpportunitiesPage';
import TherapistInfoPage from './pages/TherapistInfoPage';
import HotelInfoPage from './pages/HotelInfoPage';
import EmployerInfoPage from './pages/EmployerInfoPage';
import PaymentInfoPage from './pages/PaymentInfoPage';
import BaliSpaIndustryTrends2025Page from './pages/blog/BaliSpaIndustryTrends2025Page';
import Top10MassageTechniquesPage from './pages/blog/Top10MassageTechniquesPage';
import MassageCareerIndonesiaPage from './pages/blog/MassageCareerIndonesiaPage';
import BenefitsRegularMassageTherapyPage from './pages/blog/BenefitsRegularMassageTherapyPage';
import HiringMassageTherapistsGuidePage from './pages/blog/HiringMassageTherapistsGuidePage';
import TraditionalBalineseMassagePage from './pages/blog/TraditionalBalineseMassagePage';
import SpaTourismIndonesiaPage from './pages/blog/SpaTourismIndonesiaPage';
import AromatherapyMassageOilsPage from './pages/blog/AromatherapyMassageOilsPage';
import PricingGuideMassageTherapistsPage from './pages/blog/PricingGuideMassageTherapistsPage';
import DeepTissueVsSwedishMassagePage from './pages/blog/DeepTissueVsSwedishMassagePage';
import OnlinePresenceMassageTherapistPage from './pages/blog/OnlinePresenceMassageTherapistPage';
import WellnessTourismUbudPage from './pages/blog/WellnessTourismUbudPage';
import GuestAlertsPage from './pages/GuestAlertsPage';
import HotelVillaMenuPage from './pages/HotelVillaMenuPage';
import CoinShopPage from './pages/CoinShopPage';
import AdminShopManagementPage from './pages/AdminShopManagementPage';
import RewardBannersTestPage from './pages/RewardBannersTestPage';
import ReferralPage from './pages/ReferralPage';
import CoinHistoryPage from './pages/CoinHistoryPage';
import CoinSystemTestPage from './pages/CoinSystemTestPage';
import TodaysDiscountsPage from './pages/TodaysDiscountsPage';
import { APP_CONFIG } from './config/appConfig';

interface AppRouterProps {
    page: Page;
    isLoading: boolean;
    user: User | null;
    loggedInAgent: Agent | null;
    loggedInProvider: LoggedInProvider | null;
    loggedInCustomer: any;
    therapists: Therapist[];
    places: Place[];
    userLocation: UserLocation | null;
    selectedMassageType: string | null;
    selectedPlace: Place | null;
    language: Language;
    isAdminLoggedIn: boolean;
    isHotelLoggedIn: boolean;
    isVillaLoggedIn: boolean;
    loggedInUser: LoggedInUser | null;
    bookings: Booking[];
    notifications: Notification[];
    impersonatedAgent: Agent | null;
    adminMessages: AdminMessage[];
    providerForBooking: { provider: Therapist | Place; type: 'therapist' | 'place' } | null;
    providerAuthInfo: { type: 'therapist' | 'place'; mode: 'login' | 'register' } | null;
    selectedTherapist: Therapist | null;
    selectedJobId: string | null;
    venueMenuId: string | null;
    hotelVillaLogo: string | null;
    // Handlers
    handleLanguageSelect: (lang: Language) => Promise<void>;
    handleEnterApp: (lang: Language, location: UserLocation) => Promise<void>;
    handleSetUserLocation: (location: UserLocation) => void;
    handleSetSelectedPlace: (place: Place) => void;
    handleLogout: () => Promise<void>;
    handleNavigateToTherapistLogin: () => void;
    handleNavigateToRegistrationChoice: () => void;
    handleNavigateToBooking: (provider: Therapist | Place, type: 'therapist' | 'place') => void;
    handleQuickBookWithChat: (provider: Therapist | Place, type: 'therapist' | 'place') => Promise<void>;
    handleChatWithBusyTherapist: (therapist: Therapist) => Promise<void>;
    handleShowRegisterPromptForChat: () => void;
    handleIncrementAnalytics: (providerId: string | number, providerType: 'therapist' | 'place', metric: 'whatsapp_clicks' | 'phone_clicks' | 'directions_clicks' | 'views' | 'bookings') => Promise<void>;
    handleNavigateToHotelLogin: () => void;
    handleNavigateToVillaLogin: () => void;
    handleNavigateToMassagePlaceLogin: () => void;
    handleNavigateToAdminLogin: () => void;
    handleNavigateToServiceTerms: () => void;
    handleNavigateToPrivacyPolicy: () => void;
    handleNavigateToCustomerDashboard: () => void;
    handleBackToHome: () => void;
    handleSelectRegistration: (type: 'therapist' | 'place') => void;
    handleTherapistStatusChange: (status: string) => Promise<void>;
    handleSaveTherapist: (therapistData: any) => Promise<void>;
    handleSavePlace: (placeData: any) => Promise<void>;
    handleAgentRegister: (name: string, email: string) => Promise<{ success: boolean; message: string }>;
    handleAgentLogin: (email: string) => Promise<{ success: boolean; message: string }>;
    handleAgentAcceptTerms: () => Promise<void>;
    handleSaveAgentProfile: (agentData: Partial<Agent>) => Promise<void>;
    handleStopImpersonating: () => void;
    handleSendAdminMessage: (message: string) => Promise<void>;
    handleMarkMessagesAsRead: () => Promise<void>;
    handleSelectMembershipPackage: (packageName: string, price: string) => void;
    handleProviderLogin: (type: 'therapist' | 'place', mode: 'login' | 'register') => void;
    handleNavigateToBookingPage: (therapist: Therapist) => void;
    handleCreateBooking: (bookingData: any) => Promise<void>;
    handleUpdateBookingStatus: (bookingId: number, newStatus: BookingStatus) => Promise<void>;
    handleMarkNotificationAsRead: (notificationId: number) => void;
    handleAdminLogin: () => void;
    handleCustomerAuthSuccess: (customer: any, isNewUser?: boolean) => Promise<void>;
    handleProviderLogout: () => Promise<void>;
    handleHotelLogout: () => Promise<void>;
    handleVillaLogout: () => Promise<void>;
    handleAdminLogout: () => Promise<void>;
    handleCustomerLogout: () => Promise<void>;
    handleAgentLogout: () => Promise<void>;
    handleNavigateToNotifications: () => void;
    handleNavigateToAgentAuth: () => void;
    handleNavigateToTherapistDashboard: () => void;
    handleNavigateToTherapistProfileCreation: () => void;
    setPage: (page: Page) => void;
    setLoggedInProvider: (provider: LoggedInProvider | null) => void;
    setProviderAuthInfo: (info: { type: 'therapist' | 'place'; mode: 'login' | 'register' } | null) => void;
    setProviderForBooking: (provider: { provider: Therapist | Place; type: 'therapist' | 'place' } | null) => void;
    setSelectedTherapist: (therapist: Therapist | null) => void;
    setSelectedJobId: (id: string | null) => void;
    t: any;
}

export const AppRouter: React.FC<AppRouterProps> = (props) => {
    const {
        page,
        isLoading,
        user,
        loggedInAgent,
        loggedInProvider,
        loggedInCustomer,
        therapists,
        places,
        userLocation,
        selectedMassageType,
        selectedPlace,
        // language, // Unused variable
        isAdminLoggedIn,
        isHotelLoggedIn,
        isVillaLoggedIn,
        bookings,
        notifications,
        impersonatedAgent,
        adminMessages,
        providerForBooking,
        providerAuthInfo,
        selectedJobId,
        venueMenuId,
        hotelVillaLogo,
        handleLanguageSelect,
        handleEnterApp,
        handleSetUserLocation,
        handleSetSelectedPlace,
        handleLogout,
        handleNavigateToTherapistLogin,
        handleNavigateToRegistrationChoice,
        handleNavigateToBooking,
        handleQuickBookWithChat,
        handleChatWithBusyTherapist,
        handleShowRegisterPromptForChat,
        handleIncrementAnalytics,
        handleNavigateToHotelLogin,
        handleNavigateToVillaLogin,
        handleNavigateToMassagePlaceLogin,
        handleNavigateToAdminLogin,
        handleNavigateToServiceTerms,
        handleNavigateToPrivacyPolicy,
        handleNavigateToCustomerDashboard,
        handleBackToHome,
        handleSelectRegistration,
        handleTherapistStatusChange,
        handleSaveTherapist,
        // handleSavePlace, // Unused function
        handleAgentRegister,
        handleAgentLogin,
        handleAgentAcceptTerms,
        handleSaveAgentProfile,
        handleStopImpersonating,
        handleSendAdminMessage,
        handleMarkMessagesAsRead,
        handleSelectMembershipPackage,
        handleCreateBooking,
        handleUpdateBookingStatus,
        handleMarkNotificationAsRead,
        handleAdminLogin,
        handleCustomerAuthSuccess,
        handleProviderLogout,
        handleHotelLogout,
        handleVillaLogout,
        handleAdminLogout,
        handleCustomerLogout,
        handleAgentLogout,
        handleNavigateToNotifications,
        handleNavigateToAgentAuth,
        setPage,
        setLoggedInProvider,
        // setSelectedJobId, // Unused function
        t
    } = props;

    if (isLoading && page !== 'landing') {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-green"></div></div>;
    }

    switch (page) {
        case 'landing': 
            return <LandingPage onLanguageSelect={handleLanguageSelect} onEnterApp={handleEnterApp} />;
            
        case 'unifiedLogin': 
            return <UnifiedLoginPage />;
            
        case 'therapistLogin': 
            return <TherapistLoginPage 
                onSuccess={(therapistId) => {
                    setLoggedInProvider({ id: therapistId, type: 'therapist' });
                    setPage('therapistDashboard');
                }} 
                onBack={handleBackToHome} 
            />;
            
        case 'home':
            return <HomePage 
                user={user} 
                loggedInAgent={loggedInAgent}
                loggedInProvider={loggedInProvider ? {
                    id: typeof loggedInProvider.id === 'string' ? parseInt(loggedInProvider.id) : loggedInProvider.id,
                    type: loggedInProvider.type
                } : null}
                loggedInCustomer={loggedInCustomer}
                therapists={therapists}
                places={places}
                userLocation={userLocation}
                selectedMassageType={selectedMassageType ?? undefined}
                onSetUserLocation={handleSetUserLocation}
                onSelectPlace={handleSetSelectedPlace}
                onLogout={handleLogout}
                onLoginClick={handleNavigateToTherapistLogin}
                onCreateProfileClick={handleNavigateToRegistrationChoice}
                onAgentPortalClick={loggedInAgent ? () => setPage('agentDashboard') : () => setPage('agent')}
                onCustomerPortalClick={handleNavigateToCustomerDashboard}
                onBook={handleNavigateToBooking}
                onQuickBookWithChat={handleQuickBookWithChat}
                onChatWithBusyTherapist={handleChatWithBusyTherapist}
                onShowRegisterPrompt={handleShowRegisterPromptForChat}
                // @ts-ignore - Analytics type mismatch
                onIncrementAnalytics={handleIncrementAnalytics}
                onMassageTypesClick={() => setPage('massageTypes')}
                onHotelPortalClick={handleNavigateToHotelLogin}
                onVillaPortalClick={handleNavigateToVillaLogin}
                onTherapistPortalClick={handleNavigateToTherapistLogin}
                onMassagePlacePortalClick={handleNavigateToMassagePlaceLogin}
                onAdminPortalClick={handleNavigateToAdminLogin}
                onBrowseJobsClick={() => setPage('browseJobs')}
                onEmployerJobPostingClick={() => setPage('employerJobPosting')}
                onMassageJobsClick={() => setPage('massageJobs')}
                onTherapistJobsClick={() => setPage('therapistJobs')}
                onTermsClick={handleNavigateToServiceTerms}
                onPrivacyClick={handleNavigateToPrivacyPolicy}
                // @ts-ignore - Page type mismatch
                onNavigate={(page: Page) => setPage(page as Page)}
                isLoading={isLoading}
                t={t} 
            />;
            
        case 'detail': 
            return selectedPlace && <PlaceDetailPage 
                place={selectedPlace} 
                onBack={handleBackToHome} 
                onBook={(place) => handleNavigateToBooking(place, 'place')} 
                // @ts-ignore - Analytics type mismatch
                onIncrementAnalytics={(metric: keyof Analytics) => handleIncrementAnalytics(selectedPlace.id, 'place', metric)} 
                loggedInProviderId={typeof loggedInProvider?.id === 'string' ? parseInt(loggedInProvider.id) : loggedInProvider?.id} 
                t={t.detail} 
            />;
            
        case 'massagePlaceProfile': 
            if (!selectedPlace) {
                setPage('home');
                return null;
            }
            return <MassagePlaceProfilePage 
                place={selectedPlace}
                userLocation={userLocation}
                loggedInCustomer={loggedInCustomer}
                onBack={handleBackToHome}
                onBook={() => handleNavigateToBooking(selectedPlace, 'place')}
                onMassageJobsClick={() => setPage('massageJobs')}
                onTherapistJobsClick={() => setPage('therapistJobs')}
                onHotelPortalClick={handleNavigateToHotelLogin}
                onVillaPortalClick={handleNavigateToVillaLogin}
                onTherapistPortalClick={handleNavigateToTherapistLogin}
                onMassagePlacePortalClick={handleNavigateToMassagePlaceLogin}
                onAgentPortalClick={loggedInAgent ? () => setPage('agentDashboard') : () => setPage('agent')}
                onCustomerPortalClick={handleNavigateToCustomerDashboard}
                onAdminPortalClick={handleNavigateToAdminLogin}
                onNavigate={(page: string) => setPage(page as Page)}
                onTermsClick={handleNavigateToServiceTerms}
                onPrivacyClick={handleNavigateToPrivacyPolicy}
                therapists={therapists}
                places={places}
            />;
            
        case 'therapistStatus': 
            // @ts-ignore - Prop interface mismatch
            return loggedInProvider && loggedInProvider.type === 'therapist' && <TherapistStatusPage 
                therapist={therapists.find(t => t.id === loggedInProvider.id) ?? null}
                onStatusChange={handleTherapistStatusChange}
                onLogout={handleProviderLogout}
                t={t.therapistStatus} 
            /> || null;
            
        case 'adminLogin': 
            {/* @ts-expect-error - AdminLoginPage prop interface needs updating */}
            return <AdminLoginPage onSuccess={handleAdminLogin} onBack={handleBackToHome} />;
            
        case 'adminDashboard': 
            // @ts-ignore - Prop interface mismatch
            return isAdminLoggedIn && <AdminDashboardPage 
                // @ts-ignore - Props interface mismatch
                therapists={therapists}
                places={places}
                agents={[]}
                onLogout={handleAdminLogout}
                onImpersonateAgent={(_agent: Agent) => setPage('agentDashboard')}
                t={t.admin} 
            /> || null;
            
        case 'providerAuth': 
            return providerAuthInfo && <UnifiedLoginPage /> || null;
            
        case 'therapistDashboard': 
            // @ts-ignore - Prop interface mismatch
            return loggedInProvider && loggedInProvider.type === 'therapist' ? <TherapistDashboardPage 
                // @ts-ignore - Props interface mismatch
                therapist={therapists.find(t => t.id === loggedInProvider.id)}
                onSaveProfile={handleSaveTherapist}
                onLogout={handleProviderLogout}
                onNavigateToNotifications={handleNavigateToNotifications}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onSelectMembership={handleSelectMembershipPackage}
                t={t.providerDashboard}
                therapistId={typeof loggedInProvider.id === 'string' ? parseInt(loggedInProvider.id) : loggedInProvider.id}
                bookings={bookings.filter(b => b.providerId === loggedInProvider.id && b.providerType === 'therapist')}
                notifications={notifications.filter(n => n.providerId === loggedInProvider.id)}
            /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice} />;
            
        case 'placeDashboard': {
            const currentPlace = places.find(p => p.id === loggedInProvider?.id);
            return loggedInProvider && loggedInProvider.type === 'place' && currentPlace ? <MassagePlaceAdminDashboard 
                place={currentPlace}
                onLogout={handleProviderLogout}
                onNavigate={(page) => setPage(page as Page)}
            /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice} />;
        }
            
        case 'agent': 
            return <AgentPage onBack={handleBackToHome} onNavigateToAgentAuth={handleNavigateToAgentAuth} t={t.agentPage} contactNumber={APP_CONFIG.CONTACT_NUMBER} />;
            
        case 'agentAuth': 
            return <AgentAuthPage onRegister={handleAgentRegister} onLogin={handleAgentLogin} onBack={handleBackToHome} t={t.agentAuth} />;
            
        case 'agentTerms': 
            return loggedInAgent ? <AgentTermsPage onAccept={handleAgentAcceptTerms} onLogout={handleAgentLogout} t={t.agentTermsPage} /> : null;
            
        case 'agentDashboard': 
            if (impersonatedAgent) {
                return <AgentDashboardPage 
                    agent={impersonatedAgent} 
                    onLogout={() => {}} 
                    isAdminView={true}
                    onStopImpersonating={handleStopImpersonating}
                    messages={adminMessages}
                    onSendMessage={handleSendAdminMessage}
                    t={t.agentDashboard} 
                />;
            }
            if (loggedInAgent) {
                if (!loggedInAgent.hasAcceptedTerms) {
                    return <AgentTermsPage onAccept={handleAgentAcceptTerms} onLogout={handleAgentLogout} t={t.agentTermsPage} />;
                }
                return <AgentDashboardPage 
                    agent={loggedInAgent} 
                    onLogout={handleAgentLogout} 
                    messages={adminMessages}
                    onMarkMessagesAsRead={handleMarkMessagesAsRead}
                    onSaveProfile={handleSaveAgentProfile}
                    t={t.agentDashboard} 
                />;
            }
            return null;
            
        case 'serviceTerms': 
            return <ServiceTermsPage onBack={handleBackToHome} t={t.serviceTerms} contactNumber={APP_CONFIG.CONTACT_NUMBER} />;
            
        case 'privacy': 
            return <PrivacyPolicyPage onBack={handleBackToHome} t={t.privacyPolicy} />;
            
        case 'cookies-policy': 
            return <CookiesPolicyPage onBack={handleBackToHome} t={t} />;
            
        case 'customerAuth': 
            return <CustomerAuthPage onSuccess={handleCustomerAuthSuccess} onBack={handleBackToHome} userLocation={userLocation} />;
            
        case 'customerDashboard': 
            {/* @ts-ignore - Customer dashboard props type mismatch */}
            return loggedInCustomer && <CustomerDashboardPage 
                customer={loggedInCustomer}
                onLogout={handleCustomerLogout}
                onBack={handleBackToHome}
                t={t.customerDashboard}
            /> || null;
            
        case 'membership': 
            // @ts-ignore - Prop interface mismatch 
            return <MembershipPage 
                onSelectPackage={handleSelectMembershipPackage}
                onBack={handleBackToHome}
                t={t.membership}
            />;
            
        case 'booking': 
            {/* @ts-ignore - BookingPage props type mismatch */}
            return providerForBooking && <BookingPage 
                provider={providerForBooking.provider}
                providerType={providerForBooking.type}
                onBack={handleBackToHome}
                onCreateBooking={handleCreateBooking}
                t={t.bookingPage}
                contactNumber={APP_CONFIG.CONTACT_NUMBER}
            /> || null;
            
        case 'bookings': 
            return <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">{t.bookings.title}</h1>
                {bookings.length === 0 ? (
                    <p className="text-gray-500">{t.bookings.noBookings}</p>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(booking => (
                            <div key={booking.id} className="bg-white p-4 rounded shadow">
                                <p className="font-bold">{booking.providerName}</p>
                                <p className="text-sm text-gray-600">{booking.status}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>;
            
        case 'notifications': 
            return <NotificationsPage 
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onBack={handleBackToHome}
                t={t.notifications}
            />;
            
        case 'massageTypes': 
            // @ts-ignore - Prop interface mismatch 
            return <MassageTypesPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t.massageTypes} />;
            
        case 'hotelLogin': 
            return <HotelLoginPage onSuccess={() => {}} onBack={handleBackToHome} t={t} />;
            
        case 'villaLogin': 
            return <VillaLoginPage onSuccess={() => {}} onBack={handleBackToHome} t={t} />;
            
        case 'massagePlaceLogin': 
            return <MassagePlaceLoginPage 
                onSuccess={(placeId) => {
                    setLoggedInProvider({ id: placeId, type: 'place' });
                    setPage('placeDashboard');
                }} 
                onBack={handleBackToHome}
                t={t}
            />;
            
        case 'hotelDashboard': 
            // @ts-ignore - Prop interface mismatch 
            return isHotelLoggedIn && <HotelDashboardPage onLogout={handleHotelLogout} t={t.hotelDashboard} /> || null;
            
        case 'villaDashboard': 
            // @ts-ignore - Prop interface mismatch 
            return isVillaLoggedIn && <VillaDashboardPage onLogout={handleVillaLogout} t={t.villaDashboard} /> || null;
            
        case 'employerJobPosting': 
            // @ts-ignore - Prop interface mismatch 
            return <EmployerJobPostingPage 
                onBack={() => {
                    console.log('🎯 AppRouter: EmployerJobPosting onBack - going back to massageJobs');
                    setPage('massageJobs');
                }} 
                onNavigate={(page: Page) => setPage(page as Page)} 
                t={t} 
            />;
        
        case 'therapistJobRegistration':
            // @ts-ignore - Prop interface mismatch 
            return <TherapistJobRegistrationPage 
                onBack={() => {
                    console.log('🎯 AppRouter: TherapistJobRegistration onBack - going back to massageJobs');
                    setPage('massageJobs');
                }} 
                onSuccess={() => {
                    alert('Profile submitted successfully!');
                    setPage('massageJobs');
                }}
            />;
            
            
        case 'jobPostingPayment': 
            // @ts-ignore - Prop interface mismatch 
            return <JobPostingPaymentPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'browseJobs': 
            // @ts-ignore - Prop interface mismatch 
            return <BrowseJobsPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'massageJobs': 
            console.log('🔥🔥🔥 AppRouter: RENDERING MassageJobsPage - VERSION 2025-01-11-17:30:00');
            // @ts-ignore - Prop interface mismatch 
            return <MassageJobsPage 
                onBack={handleBackToHome} 
                onPostJob={() => {
                    console.log('🎯 AppRouter: onPostJob called - navigating to employerJobPosting');
                    setPage('employerJobPosting');
                }} 
                onNavigateToPayment={() => {
                    console.log('🎯 AppRouter: onNavigateToPayment called - navigating to jobUnlockPayment');
                    setPage('jobUnlockPayment');
                }} 
                onCreateTherapistProfile={() => {
                    console.log('🎯 AppRouter: onCreateTherapistProfile called - navigating to therapistJobRegistration');
                    setPage('therapistJobRegistration');
                }}
            />;
            
        case 'therapistJobs': 
            // @ts-ignore - Prop interface mismatch 
            return <TherapistJobRegistrationPage 
                jobId={selectedJobId || ''}
                onBack={handleBackToHome} 
                onNavigate={(page: Page) => setPage(page as Page)} 
                t={t} 
            />;
            
        case 'jobUnlockPayment': 
            // @ts-ignore - Prop interface mismatch 
            return <JobUnlockPaymentPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'adminBankSettings': 
            return isAdminLoggedIn && <AdminBankSettingsPage onBack={() => setPage('adminDashboard')} t={t} /> || null;
            
        case 'chatList': 
            // Chat system removed - redirecting to home
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Chat Feature Coming Soon</h2>
                        <button 
                            onClick={handleBackToHome}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            );
            
        case 'about-us' as any: 
            // @ts-ignore - Prop interface mismatch 
            return <AboutUsPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'how-it-works': 
            // @ts-ignore - Prop interface mismatch 
            return <HowItWorksPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'massage-bali': 
            // @ts-ignore - Prop interface mismatch 
            return <MassageBaliPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'blog': 
            // @ts-ignore - Prop interface mismatch 
            return <BlogIndexPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'faq': 
            // @ts-ignore - Prop interface mismatch 
            return <FAQPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'balinese-massage': 
            // @ts-ignore - Prop interface mismatch 
            return <BalineseMassagePage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'deep-tissue-massage': 
            // @ts-ignore - Prop interface mismatch 
            return <DeepTissueMassagePage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        // case 'swedish-massage': 
        //     return <SwedishMassagePage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        // case 'hot-stone-massage': 
        //     return <HotStoneMassagePage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        // case 'aromatherapy-massage': 
        //     return <AromatherapyMassagePage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        // case 'thai-massage':\n        //     return <ThaiMassagePage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        // case 'reflexology-massage':\n        //     return <ReflexologyMassagePage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        // case 'shiatsu-massage':\n        //     return <ShiatsuMassagePage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        // case 'sports-massage':\n        //     return <SportsMassagePage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        // case 'pregnancy-massage':\n        //     return <PregnancyMassagePage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        // case 'reviews-testimonials':
        //     return <ReviewsTestimonialsPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'press-media': 
            // @ts-ignore - Prop interface mismatch 
            return <PressMediaPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'career-opportunities': 
            // @ts-ignore - Prop interface mismatch 
            return <CareerOpportunitiesPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'therapist-info': 
            // @ts-ignore - Prop interface mismatch 
            return <TherapistInfoPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'hotel-info': 
            // @ts-ignore - Prop interface mismatch 
            return <HotelInfoPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'employer-info': 
            // @ts-ignore - Prop interface mismatch 
            return <EmployerInfoPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'payment-info': 
            // @ts-ignore - Prop interface mismatch 
            return <PaymentInfoPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'blog-bali-spa-trends-2025' as any: 
            // @ts-ignore - Prop interface mismatch 
            return <BaliSpaIndustryTrends2025Page onBack={() => setPage('blog')} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'blog-top-10-massage-techniques' as any: 
            // @ts-ignore - Prop interface mismatch 
            return <Top10MassageTechniquesPage onBack={() => setPage('blog')} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'blog-massage-career-indonesia' as any: 
            // @ts-ignore - Prop interface mismatch 
            return <MassageCareerIndonesiaPage onBack={() => setPage('blog')} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'blog-benefits-regular-massage' as any: 
            // @ts-ignore - Prop interface mismatch 
            return <BenefitsRegularMassageTherapyPage onBack={() => setPage('blog')} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'blog-hiring-massage-therapists' as any: 
            // @ts-ignore - Prop interface mismatch 
            return <HiringMassageTherapistsGuidePage onBack={() => setPage('blog')} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'blog-traditional-balinese-massage' as any: 
            // @ts-ignore - Prop interface mismatch 
            return <TraditionalBalineseMassagePage onBack={() => setPage('blog')} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'blog-spa-tourism-indonesia': 
            {/* @ts-ignore - Blog navigation callback type mismatch */}
            return <SpaTourismIndonesiaPage onBack={() => setPage('blog')} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'blog-aromatherapy-massage-oils': 
            {/* @ts-ignore - Blog navigation callback type mismatch */}
            return <AromatherapyMassageOilsPage onBack={() => setPage('blog')} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'blog-pricing-guide-therapists': 
            {/* @ts-ignore - Blog navigation callback type mismatch */}
            return <PricingGuideMassageTherapistsPage onBack={() => setPage('blog')} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'blog-deep-tissue-vs-swedish': 
            {/* @ts-ignore - Blog navigation callback type mismatch */}
            return <DeepTissueVsSwedishMassagePage onBack={() => setPage('blog')} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'blog-online-presence-therapist': 
            {/* @ts-ignore - Blog navigation callback type mismatch */}
            return <OnlinePresenceMassageTherapistPage onBack={() => setPage('blog')} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'blog-wellness-tourism-ubud': 
            {/* @ts-ignore - Blog navigation callback type mismatch */}
            return <WellnessTourismUbudPage onBack={() => setPage('blog')} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'guestAlerts': 
            return <GuestAlertsPage onBack={handleBackToHome} t={t} />;
            
        case 'hotelVillaMenu': 
            {/* @ts-ignore - Hotel villa menu props type mismatch */}
            return <HotelVillaMenuPage 
                venueId={venueMenuId || ''}
                logo={hotelVillaLogo || ''}
                onBack={handleBackToHome}
                onNavigate={(page: Page) => setPage(page as Page)}
                t={t}
            />;
            
        case 'coin-shop': 
            {/* @ts-ignore - CoinShop navigation callback type mismatch */}
            return <CoinShopPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        case 'adminShopManagement': 
            return isAdminLoggedIn && <AdminShopManagementPage onBack={() => setPage('adminDashboard')} t={t} /> || null;
            
        case 'rewardBannersTest': 
            return <RewardBannersTestPage onBack={handleBackToHome} t={t} />;
            
        case 'referral': 
            {/* @ts-ignore - ReferralPage user prop type mismatch */}
            return <ReferralPage onBack={handleBackToHome} t={t} />;
            
        case 'coinHistory': 
            return <CoinHistoryPage onBack={handleBackToHome} t={t} />;
            
        case 'coinSystemTest': 
            return <CoinSystemTestPage onBack={handleBackToHome} t={t} />;
            
        case 'todaysDiscounts': 
            return <TodaysDiscountsPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page as Page)} t={t} />;
            
        default: 
            return null;
    }
};



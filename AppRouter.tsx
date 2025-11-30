 
import { useTranslations } from './lib/useTranslations';
import { useLanguage } from './hooks/useLanguage';
import type { Page, Language, LoggedInProvider } from './types/pageTypes';
import type { User, Place, Therapist, UserLocation, Booking, Notification, Agent, AdminMessage, AvailabilityStatus } from './types';
import { BookingStatus } from './types';
import { validateDashboardAccess, clearAllAuthStates, createSecureDashboardRenderer, type AuthenticationState } from './utils/dashboardGuards';

// Page imports
import LandingPage from './pages/LandingPage';
// UnifiedLoginPage removed from active routes; kept in deleted folder
import TherapistLoginPage from './pages/TherapistLoginPage';
import HomePage from './pages/HomePage';
import CustomerProvidersPage from './pages/CustomerProvidersPage';
import CustomerReviewsPage from './pages/CustomerReviewsPage';
import CustomerSupportPage from './pages/CustomerSupportPage';
import React, { useState, useEffect } from 'react';
import { therapistService } from './lib/appwriteService';

// Lazy-load heavy/non-critical pages to shrink initial JS bundle
const PlaceDetailPage = React.lazy(() => import('./pages/PlaceDetailPage'));
const MassagePlaceProfilePage = React.lazy(() => import('./pages/MassagePlaceProfilePage'));
const RegistrationChoicePage = React.lazy(() => import('./pages/RegistrationChoicePage'));
const JoinIndastreetPage = React.lazy(() => import('./pages/JoinIndastreetPage'));
const TherapistPortalPage = React.lazy(() => import('./pages/TherapistPortalPage'));
const TherapistProfilePage = React.lazy(() => import('./pages/TherapistProfilePage'));
const TherapistStatusPage = React.lazy(() => import('./pages/TherapistStatusPage'));
const PlaceDashboardPage = React.lazy(() => import('./pages/PlaceDashboardPage'));

// Agent pages deprecated: routes now redirect to Indastreet Partner (villa) routes
const ServiceTermsPage = React.lazy(() => import('./pages/ServiceTermsPage'));
const PlaceTermsPage = React.lazy(() => import('./pages/PlaceTermsPage'));
const PlaceDiscountBadgePage = React.lazy(() => import('./pages/PlaceDiscountBadgePage'));
const VerifiedProBadgePage = React.lazy(() => import('./pages/VerifiedProBadgePage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const CookiesPolicyPage = React.lazy(() => import('./pages/CookiesPolicyPage'));
const MembershipPage = React.lazy(() => import('./pages/MembershipPage'));
const BookingPage = React.lazy(() => import('./pages/BookingPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
import MassageTypesPage from './pages/MassageTypesPage';
const MassagePlaceLoginPage = React.lazy(() => import('./pages/MassagePlaceLoginPage'));
const AcceptBookingPage = React.lazy(() => import('./pages/AcceptBookingPage'));
const DeclineBookingPage = React.lazy(() => import('./pages/DeclineBookingPage'));
const EmployerJobPostingPage = React.lazy(() => import('./pages/EmployerJobPostingPage'));
const JobPostingPaymentPage = React.lazy(() => import('./pages/JobPostingPaymentPage'));
const BrowseJobsPage = React.lazy(() => import('./pages/BrowseJobsPage'));
const MassageJobsPage = React.lazy(() => import('./pages/MassageJobsPage'));
const IndastreetPartnersPage = React.lazy(() => import('./pages/IndastreetPartnersPage'));
const PartnershipApplicationPage = React.lazy(() => import('./pages/PartnershipApplicationPage'));
const TherapistJobRegistrationPage = React.lazy(() => import('./pages/TherapistJobRegistrationPage'));
const JobUnlockPaymentPage = React.lazy(() => import('./pages/JobUnlockPaymentPage'));
// Customer auth unified into UnifiedLoginPage; legacy CustomerAuthPage removed
// Eager-load pages to avoid dynamic import fetch issues during dev
const AboutUsPage = React.lazy(() => import('./pages/AboutUsPage'));
const ContactUsPage = React.lazy(() => import('./pages/ContactUsPage'));
const HowItWorksPage = React.lazy(() => import('./pages/HowItWorksPage'));
const MassageBaliPage = React.lazy(() => import('./pages/MassageBaliPage'));
const BlogIndexPage = React.lazy(() => import('./pages/BlogIndexPage'));
import FAQPage from './pages/FAQPage';
const BalineseMassagePage = React.lazy(() => import('./pages/BalineseMassagePage'));
const DeepTissueMassagePage = React.lazy(() => import('./pages/DeepTissueMassagePage'));
const PressMediaPage = React.lazy(() => import('./pages/PressMediaPage'));
const CareerOpportunitiesPage = React.lazy(() => import('./pages/CareerOpportunitiesPage'));
const TherapistInfoPage = React.lazy(() => import('./pages/TherapistInfoPage'));
const HotelInfoPage = React.lazy(() => import('./pages/HotelInfoPage'));
const EmployerInfoPage = React.lazy(() => import('./pages/EmployerInfoPage'));
const PaymentInfoPage = React.lazy(() => import('./pages/PaymentInfoPage'));
const BaliSpaIndustryTrends2025Page = React.lazy(() => import('./pages/blog/BaliSpaIndustryTrends2025Page'));
const Top10MassageTechniquesPage = React.lazy(() => import('./pages/blog/Top10MassageTechniquesPage'));
const MassageCareerIndonesiaPage = React.lazy(() => import('./pages/blog/MassageCareerIndonesiaPage'));
const BenefitsRegularMassageTherapyPage = React.lazy(() => import('./pages/blog/BenefitsRegularMassageTherapyPage'));
const HiringMassageTherapistsGuidePage = React.lazy(() => import('./pages/blog/HiringMassageTherapistsGuidePage'));
const TraditionalBalineseMassagePage = React.lazy(() => import('./pages/blog/TraditionalBalineseMassagePage'));
const SpaTourismIndonesiaPage = React.lazy(() => import('./pages/blog/SpaTourismIndonesiaPage'));
const AromatherapyMassageOilsPage = React.lazy(() => import('./pages/blog/AromatherapyMassageOilsPage'));
const PricingGuideMassageTherapistsPage = React.lazy(() => import('./pages/blog/PricingGuideMassageTherapistsPage'));
const DeepTissueVsSwedishMassagePage = React.lazy(() => import('./pages/blog/DeepTissueVsSwedishMassagePage'));
const OnlinePresenceMassageTherapistPage = React.lazy(() => import('./pages/blog/OnlinePresenceMassageTherapistPage'));
const WellnessTourismUbudPage = React.lazy(() => import('./pages/blog/WellnessTourismUbudPage'));
const GuestAlertsPage = React.lazy(() => import('./pages/GuestAlertsPage'));
const RewardBannersTestPage = React.lazy(() => import('./pages/RewardBannersTestPage'));
// Eager-load WebsiteManagementPage to avoid dev dynamic import fetch issue
import WebsiteManagementPage from './pages/WebsiteManagementPage';
import TodaysDiscountsPage from './pages/TodaysDiscountsPage';
import GuestProfilePage from './pages/GuestProfilePage'; // 🎯 NEW: Guest profile for non-registered users
import QRCodePage from './pages/QRCodePage'; // QR Code sharing page
import { APP_CONFIG } from './config/appConfig';

interface AppRouterProps {
    page: Page;
    isLoading: boolean;
    user: User | null;
    language?: Language;
    loggedInAgent: Agent | null;
    loggedInProvider: LoggedInProvider | null;
    loggedInCustomer: any;
    therapists: Therapist[];
    places: Place[];
    userLocation: UserLocation | null;
    selectedMassageType: string | null;
    selectedPlace: Place | null;
    selectedTherapist: Therapist | null; // 🎯 NEW: Selected therapist for profile view

    isAdminLoggedIn: boolean;
    isHotelLoggedIn: boolean;
    isVillaLoggedIn: boolean;

    bookings: Booking[];
    notifications: Notification[];
    impersonatedAgent: Agent | null;
    adminMessages: AdminMessage[];
    providerForBooking: { provider: Therapist | Place; type: 'therapist' | 'place' } | null;
    providerAuthInfo: { type: 'therapist' | 'place'; mode: 'login' | 'register' } | null;

    selectedJobId: string | null;
    venueMenuId: string | null;
    hotelVillaLogo: string | null;
    // Handlers
    handleLanguageSelect: (lang: Language) => Promise<void>;
    handleEnterApp: (lang: Language, location: UserLocation) => Promise<void>;
    handleSetUserLocation: (location: UserLocation) => void;
    handleSetSelectedPlace: (place: Place) => void;
    handleSetSelectedTherapist: (therapist: Therapist) => void; // 🎯 NEW: Set selected therapist
    handleLogout: () => Promise<void>;
    handleNavigateToTherapistLogin: () => void;
    handleNavigateToRegistrationChoice: () => void;
    handleNavigateToBooking: (provider: Therapist | Place, type: 'therapist' | 'place') => void;
    handleQuickBookWithChat: (provider: Therapist | Place, type: 'therapist' | 'place') => Promise<void>;
    handleChatWithBusyTherapist: (therapist: Therapist) => Promise<void>;
    handleShowRegisterPromptForChat: () => void;
    handleIncrementAnalytics: (providerId: string | number, providerType: 'therapist' | 'place', metric: 'whatsapp_clicks' | 'phone_clicks' | 'directions_clicks' | 'views' | 'bookings') => Promise<void>;
    handleNavigateToHotelLogin: () => void;
    handleNavigateToMassagePlaceLogin: () => void;
    handleNavigateToServiceTerms: () => void;
    handleNavigateToPrivacyPolicy: () => void;
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


    handleCreateBooking: (bookingData: any) => Promise<void>;
    handleUpdateBookingStatus: (bookingId: number, newStatus: BookingStatus) => Promise<void>;
    handleMarkNotificationAsRead: (notificationId: number) => void;
    handleCustomerAuthSuccess: (customer: any, isNewUser?: boolean) => Promise<void>;
    handleProviderLogout: () => Promise<void>;
    handleHotelLogout: () => Promise<void>;
    handleCustomerLogout: () => Promise<void>;
    handleAgentLogout: () => Promise<void>;
    handleHotelLogin: (hotelId?: string) => void; // Add hotel login handler
    handleNavigateToNotifications: () => void;
    handleNavigateToAgentAuth: () => void;


    setPage: (page: Page) => void;
    setLoggedInProvider: (provider: LoggedInProvider | null) => void;
    setLoggedInCustomer: (customer: any) => void;



    setSelectedJobId: (id: string | null) => void;
}

export const AppRouter: React.FC<AppRouterProps> = (props) => {
    const {
        page,
        isLoading,
        user,
        language,
        loggedInAgent,
        loggedInProvider,
        loggedInCustomer,
        therapists,
        places,
        userLocation,
        selectedMassageType,
        selectedPlace,
        selectedTherapist, // 🎯 NEW: Selected therapist
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
        handleLanguageSelect,
        handleEnterApp,
        handleSetUserLocation,
        handleSetSelectedPlace,
        // _handleSetSelectedTherapist, // 🎯 NEW: Handler for selecting therapist (unused)
        handleLogout,
        handleNavigateToTherapistLogin,
        handleNavigateToRegistrationChoice,
        handleNavigateToBooking,
        handleQuickBookWithChat,
        handleChatWithBusyTherapist,
        handleShowRegisterPromptForChat,
        handleIncrementAnalytics,
        handleNavigateToMassagePlaceLogin,
        handleNavigateToServiceTerms,
        handleNavigateToPrivacyPolicy,
        handleBackToHome,
        handleSelectRegistration,
        handleTherapistStatusChange,
        handleSaveTherapist,
        handleSavePlace,
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
        handleCustomerAuthSuccess,
        handleProviderLogout,
        handleHotelLogout,
        handleCustomerLogout,
        handleAgentLogout,
        handleHotelLogin, // Add hotel login handler
        handleNavigateToNotifications,
        setPage,
        setLoggedInProvider,
        setSelectedJobId
    } = props;

    // Industry-standard portal loading state separate from public list
    const [portalTherapist, setPortalTherapist] = useState<Therapist | null>(null);
    const [portalLoading, setPortalLoading] = useState(false);
    const [portalError, setPortalError] = useState<string | null>(null);

    // Fetch therapist document after successful login when navigating to portal
    useEffect(() => {
        const shouldLoad = page === 'therapistPortal' && loggedInProvider?.type === 'therapist';
        if (!shouldLoad) return;
        // If already loaded or currently loading, skip
        if (portalTherapist || portalLoading) return;
        const load = async () => {
            setPortalLoading(true);
            setPortalError(null);
            try {
                console.log('🔄 [PortalFetch] Starting therapist portal fetch for id:', loggedInProvider.id);
                let doc: Therapist | null = null;
                // Primary: direct getById
                if (loggedInProvider.id) {
                    const byId = await therapistService.getById(String(loggedInProvider.id));
                    if (byId) {
                        console.log('✅ [PortalFetch] Loaded via getById:', byId.name);
                        doc = byId;
                    }
                }
                // Fallback: email lookup via existing user or account
                if (!doc) {
                    let email: string | undefined = user?.email;
                    if (!email) {
                        const currentUser = await therapistService.getCurrentUser();
                        email = currentUser?.email;
                        console.log('🔍 [PortalFetch] Using currentUser email fallback:', email);
                    }
                    if (email) {
                        const matches = await therapistService.getByEmail(email);
                        if (matches && matches.length > 0) {
                            const first = matches[0];
                            if (first) {
                                console.log('✅ [PortalFetch] Loaded via email fallback:', first.name);
                                doc = first;
                            }
                        } else {
                            console.warn('⚠️ [PortalFetch] No document found by email');
                        }
                    }
                }
                if (!doc) {
                    setPortalError('Unable to load therapist profile. Please refresh or retry login.');
                }
                setPortalTherapist(doc);
            } catch (e: any) {
                console.error('❌ [PortalFetch] Error:', e);
                setPortalError(e?.message || 'Unexpected portal load error');
            } finally {
                setPortalLoading(false);
            }
        };
        load();
    }, [page, loggedInProvider, portalTherapist, portalLoading, user]);

    // 🔄 Refresh portal therapist data when profile updates
    useEffect(() => {
        if (page !== 'therapistPortal' || loggedInProvider?.type !== 'therapist') return;
        
        const handlePortalRefresh = async () => {
            console.log('🔄 [PortalRefresh] Refreshing therapist portal data after profile update');
            try {
                if (loggedInProvider.id) {
                    const updated = await therapistService.getById(String(loggedInProvider.id));
                    if (updated) {
                        console.log('✅ [PortalRefresh] Updated portal therapist:', updated.name);
                        setPortalTherapist(updated);
                    }
                }
            } catch (e) {
                console.error('❌ [PortalRefresh] Failed to refresh portal data:', e);
            }
        };
        
        window.addEventListener('refreshTherapistData', handlePortalRefresh);
        
        return () => {
            window.removeEventListener('refreshTherapistData', handlePortalRefresh);
        };
    }, [page, loggedInProvider]);
    


    // Restore provider from sessionStorage on mount (since localStorage is disabled)
    React.useEffect(() => {
        const storedProvider = sessionStorage.getItem('logged_in_provider');
        if (storedProvider && !loggedInProvider) {
            try {
                const providerData = JSON.parse(storedProvider);
                console.log('🔄 Restoring provider from sessionStorage:', providerData);
                setLoggedInProvider(providerData);
            } catch (e) {
                console.error('Failed to restore provider from sessionStorage:', e);
            }
        }
    }, []);
    
    // Build a translation adapter from the active language dictionary
    const { language: ctxLanguage } = useLanguage();
    const activeLanguage = (language as any) || ctxLanguage;
    const { t: tFn, dict } = useTranslations(activeLanguage as any);
    const t: any = ((key: string) => tFn(key)) as any;
    // Spread all top-level namespaces for object-style access (e.g., t.home, t.common)
    if (dict && typeof dict === 'object') {
        Object.keys(dict).forEach(ns => {
            const val = (dict as any)[ns];
            if (val && typeof val === 'object') {
                t[ns] = val;
            }
        });
    }
    // Provide commonly used generic namespaces if missing, localized by language
    const isId = (language === 'id');
    t.tabs = t.tabs || {
        clients: isId ? 'Klien' : 'Clients',
        renewals: isId ? 'Perpanjangan' : 'Renewals',
        earnings: isId ? 'Pendapatan' : 'Earnings',
        messages: isId ? 'Pesan' : 'Messages',
        profile: isId ? 'Profil' : 'Profile',
        visits: isId ? 'Kunjungan' : 'Visits',
        stats: isId ? 'Statistik' : 'Stats'
    };
    t.messages = t.messages || {
        impersonationBanner: isId ? 'Anda melihat sebagai {agentName}' : 'You are viewing as {agentName}',
        returnToAdmin: isId ? 'Kembali ke Admin' : 'Return to Admin',
        adminMessageTitle: isId ? 'Pesan Admin' : 'Admin Messages',
        unreadMessages: isId ? 'Anda memiliki pesan belum dibaca' : 'You have unread messages',
        noMessages: isId ? 'Belum ada pesan' : 'No messages yet',
        adminChatPlaceholder: isId ? 'Ketik pesan ke admin...' : 'Type a message to admin...',
        sendButton: isId ? 'Kirim' : 'Send'
    };
    t.clients = t.clients || {
        membershipExpires: isId ? 'Keanggotaan berakhir pada {date}' : 'Membership expires on {date}',
        therapists: isId ? 'Terapis' : 'Therapists',
        places: isId ? 'Tempat' : 'Places',
        noClients: isId ? 'Belum ada klien' : 'No clients yet'
    };
    t.renewals = t.renewals || {
        contact: isId ? 'Kontak' : 'Contact'
    };
    t.earnings = t.earnings || {
        toptierTier: isId ? 'Tingkat atas' : 'Top tier',
        standardTier: isId ? 'Standar' : 'Standard'
    };
    // Ensure Agent Profile translations exist to prevent runtime errors on Profile tab
    t.profile = t.profile || {
        title: isId ? 'Profil Mitra Indastreet' : 'Indastreet Partner Profile',
        bankName: isId ? 'Nama Bank' : 'Bank Name',
        accountNumber: isId ? 'Nomor Rekening' : 'Account Number',
        accountName: isId ? 'Nama Pemilik Rekening' : 'Account Name',
        contactNumber: isId ? 'Nomor Kontak' : 'Contact Number',
        homeAddress: isId ? 'Alamat Rumah' : 'Home Address',
        idCard: isId ? 'Kartu Identitas' : 'ID Card',
        saveButton: isId ? 'Simpan Perubahan' : 'Save Changes'
    };

    // 🚀 OPTIMIZATION: Common handlers to reduce repetition
    const navToMassageJobs = () => setPage('massageJobs');
    const navToEmployerJobPosting = () => setPage('employerJobPosting');
    const navToJobUnlockPayment = () => setPage('jobUnlockPayment');
    const navToTherapistJobRegistration = () => setPage('therapistJobRegistration');
    const commonNavigateHandler = (page: string) => setPage(page as Page);
    const navToBlog = () => setPage('blog');
    
    // Helper for blog pages with consistent props
    const renderBlogPage = (Component: any) => (
        <Component onBack={navToBlog} onNavigate={commonNavigateHandler} t={t} />
    );
    
    // Helper for content pages with handleBackToHome pattern (unused)
    // const _renderContentPage = (Component: any) => (
    //     <Component onBack={handleBackToHome} setPage={setPage} />
    // );
    
    // Helper for "Coming Soon" pages
    const renderComingSoon = (title: string) => (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
                <button onClick={handleBackToHome} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Back to Home
                </button>
            </div>
        </div>
    );
    
    // Helper for simple pages with just onNavigate
    const renderSimplePage = (Component: React.ComponentType<any>, extraProps: any = {}) => (
        <Component onNavigate={commonNavigateHandler} {...extraProps} />
    );
    
    // Helper for pages with onBack and t props
    const renderBackPage = (Component: React.ComponentType<any>, tKey?: any, extraProps: any = {}) => (
        <Component 
            onBack={handleBackToHome} 
            t={tKey || t} 
            // Navigation handlers for AppDrawer
            onMassageJobsClick={portalHandlers.onMassageJobsClick}
            onTherapistPortalClick={portalHandlers.onTherapistPortalClick}
            onMassagePlacePortalClick={portalHandlers.onMassagePlacePortalClick}
            onCustomerPortalClick={portalHandlers.onCustomerPortalClick}
            onAdminPortalClick={portalHandlers.onAdminPortalClick}
            onTermsClick={portalHandlers.onTermsClick}
            onPrivacyClick={handleNavigateToPrivacyPolicy}
            onNavigate={setPage}
            {...extraProps} 
        />
    );
    
    // Helper for guest notifications (sign-in required)
    const renderGuestNotifications = () => (
        <div className="min-h-screen bg-gray-50 pb-16">
            <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
                <button onClick={handleBackToHome} className="mr-4">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            </div>
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <svg className="w-12 h-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Required</h2>
                <p className="text-gray-600 mb-8 max-w-sm">Notifications are available for registered users. Guest access is currently limited.</p>
                <div className="space-y-4 w-full max-w-xs">
                    <button onClick={handleBackToHome} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg">Back to Home</button>
                </div>
                <div className="mt-8 bg-blue-50 rounded-lg p-4 max-w-sm">
                    <h3 className="font-semibold text-blue-900 mb-2">With an account, you'll get:</h3>
                    <ul className="text-sm text-blue-700 space-y-1 text-left">
                        <li>• Booking confirmations & updates</li>
                        <li>• Special offers & promotions</li>
                        <li>• Therapist availability alerts</li>
                        <li>• Payment & loyalty updates</li>
                    </ul>
                </div>
            </div>
        </div>
    );
    
    // Helper for hotel/villa secure navigation
    const hotelVillaAllowedPages = ['coinHistory', 'coin-shop', 'hotelVillaMenu'];
    const createSecureNavHandler = (type: string) => (page: string | Page) => {
        if (hotelVillaAllowedPages.includes(page as string)) {
            setPage(page as Page);
        } else {
            console.error(`🚨 SECURITY: ${type} dashboard attempted to navigate to unauthorized page:`, page);
        }
    };

    // Common portal handlers
    const portalHandlers = {
        onMassageJobsClick: () => {
            console.log('🔥 Navigating to massageJobs');
            setPage('massageJobs');
        },
        onTherapistPortalClick: () => {
            console.log('🔥 Navigating to therapistLogin');
            setPage('therapistLogin');
        },
        onMassagePlacePortalClick: () => {
            console.log('🔥 Navigating to massagePlaceLogin');
            setPage('massagePlaceLogin');
        },
        onCustomerPortalClick: () => {
            console.log('🔥 Customer portal disabled → redirecting to profile');
            setPage('profile');
        },
        onAdminPortalClick: () => {
            console.log('🔥 Admin portal removed → redirecting to home');
            setPage('home');
        },
        onTermsClick: () => {
            console.log('🔥 Navigating to serviceTerms');
            setPage('serviceTerms');
        }
    };
    
    // Common data props
    const commonDataProps = { therapists, places, t };
    
    // Common dashboard props
    const commonDashboardProps = {
        onNavigateToNotifications: handleNavigateToNotifications,
        onUpdateBookingStatus: handleUpdateBookingStatus,
        bookings,
        notifications
    };

    if (isLoading && page !== 'landing') {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-green"></div></div>;
    }

    // 🛡️ SECURITY: Validate authentication states and prevent dashboard cross-contamination
    const authState: AuthenticationState = {
        isHotelLoggedIn,
        isVillaLoggedIn, 
        isAdminLoggedIn,
        loggedInProvider,
        loggedInAgent,
        loggedInCustomer,
        loggedInUser: user as { id: string; type: 'admin' | 'hotel' | 'villa' | 'agent' } | null
    };

    const dashboardAccess = validateDashboardAccess(authState);
    
    // Handle security errors
    if (dashboardAccess.errorMessage) {
        console.error('🚨 DASHBOARD SECURITY ERROR:', dashboardAccess.errorMessage);
        
        // Clear all auth states to prevent contamination
        clearAllAuthStates({
            setIsHotelLoggedIn: (_value: boolean) => {
                props.handleHotelLogout?.();
            },
            setLoggedInProvider,
            setLoggedInAgent: (_agent: any) => {
                props.handleAgentLogout?.();
            },
            setLoggedInCustomer: (_customer: any) => {
                props.handleCustomerLogout?.();
            }
        });
        
        // Redirect to home with error message
        setPage('home');
        
        // Show security error message
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-red-50 p-4">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
                    <div className="text-6xl mb-4">🚨</div>
                    <h2 className="text-xl font-bold text-red-600 mb-2">Security Alert</h2>
                    <p className="text-gray-700 mb-4">{dashboardAccess.errorMessage}</p>
                    <button 
                        onClick={() => setPage('home')}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    // Create secure dashboard renderer
    const secureRenderer = createSecureDashboardRenderer(authState, (message, redirectTo) => {
        console.error('🚨 Dashboard access denied:', message);
        if (redirectTo) setPage(redirectTo as Page);
    });

    // If renderer is null (security error already handled above), don't continue
    if (!secureRenderer) {
        return null;
    }

    switch (page) {
        // ========================
        // 🏠 CORE APPLICATION ROUTES  
        // ========================
        case 'landing': 
            return <LandingPage 
                onLanguageSelect={handleLanguageSelect} 
                onEnterApp={handleEnterApp} 
            />;
            
        case 'home':
            console.log('🏠 AppRouter: Rendering HomePage component');
            return <HomePage 
                user={user} 
                language={activeLanguage as 'en' | 'id'}
                loggedInAgent={loggedInAgent}
                loggedInProvider={loggedInProvider ? {
                    id: loggedInProvider.id,
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
                onBook={handleNavigateToBooking}
                onQuickBookWithChat={handleQuickBookWithChat}
                onChatWithBusyTherapist={handleChatWithBusyTherapist}
                onShowRegisterPrompt={handleShowRegisterPromptForChat}
                onIncrementAnalytics={(id: any, type: any, metric: any) => handleIncrementAnalytics(id, type, metric)}
                onTherapistPortalClick={portalHandlers.onTherapistPortalClick}
                onMassagePlacePortalClick={portalHandlers.onMassagePlacePortalClick}
                onAdminPortalClick={portalHandlers.onAdminPortalClick}
                onBrowseJobsClick={() => setPage('browseJobs')}
                onEmployerJobPostingClick={() => setPage('employerJobPosting')}
                onMassageJobsClick={portalHandlers.onMassageJobsClick}
                onTherapistJobsClick={() => setPage('therapistJobs')}
                onTermsClick={handleNavigateToServiceTerms}
                onPrivacyClick={handleNavigateToPrivacyPolicy}
                onNavigate={commonNavigateHandler}
                onLanguageChange={(lang) => handleLanguageSelect(lang)}
                isLoading={isLoading}
                t={t} 
            />;

        case 'joinIndastreet':
            return <JoinIndastreetPage 
                onBack={handleBackToHome}
                onNavigateToTherapistLogin={handleNavigateToTherapistLogin}
                onNavigateToMassagePlaceLogin={handleNavigateToMassagePlaceLogin}
                t={t}
            />;

        case 'therapistProfile':
            return selectedTherapist && <TherapistProfilePage 
                therapist={selectedTherapist}
                onBack={() => setPage('home')}
                onQuickBookWithChat={(therapist: Therapist) => handleQuickBookWithChat(therapist, 'therapist')}
                userLocation={userLocation}
                loggedInCustomer={loggedInCustomer}
                onMassageJobsClick={portalHandlers.onMassageJobsClick}
                onTherapistJobsClick={() => setPage('therapistJobs')}
                onTherapistPortalClick={portalHandlers.onTherapistPortalClick}
                onMassagePlacePortalClick={portalHandlers.onMassagePlacePortalClick}
                onCustomerPortalClick={portalHandlers.onCustomerPortalClick}
                onNavigate={commonNavigateHandler}
                onTermsClick={handleNavigateToServiceTerms}
                onPrivacyClick={handleNavigateToPrivacyPolicy}
                therapists={therapists}
                places={places}
            /> || null;

        case 'profile': // 🎯 NEW: Guest profile page for non-registered users
            return <GuestProfilePage 
                onBack={handleBackToHome}
                onRegisterClick={handleNavigateToRegistrationChoice} // 🎯 Opens registration drawer
                t={t}
                // AppDrawer navigation props
                onMassageJobsClick={portalHandlers.onMassageJobsClick}
                onTherapistPortalClick={portalHandlers.onTherapistPortalClick}
                onMassagePlacePortalClick={portalHandlers.onMassagePlacePortalClick}
                onCustomerPortalClick={portalHandlers.onCustomerPortalClick}
                onAdminPortalClick={portalHandlers.onAdminPortalClick}
                onNavigate={commonNavigateHandler}
                onTermsClick={portalHandlers.onTermsClick}
                onPrivacyClick={handleNavigateToPrivacyPolicy}
                therapists={therapists}
                places={places}
            />;

        case 'qr-code': // QR Code sharing page
            return <QRCodePage 
                onNavigate={commonNavigateHandler}
            />;
            
        case 'detail': 
            return selectedPlace && <PlaceDetailPage 
                place={selectedPlace} 
                onBack={handleBackToHome} 
                onBook={(place) => handleNavigateToBooking(place, 'place')} 
                onIncrementAnalytics={(metric: any) => handleIncrementAnalytics(selectedPlace.id, 'place', metric)} 
                loggedInProviderId={loggedInProvider?.id} 
                t={t} 
                agentCode={loggedInAgent?.agentCode}
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
                onTherapistPortalClick={handleNavigateToTherapistLogin}
                onMassagePlacePortalClick={handleNavigateToMassagePlaceLogin}
                onNavigate={commonNavigateHandler}
                onTermsClick={handleNavigateToServiceTerms}
                onPrivacyClick={handleNavigateToPrivacyPolicy}
                therapists={therapists}
                places={places}
            />;

        case 'therapistLogin': 
            return <TherapistLoginPage 
                onSuccess={(therapistId) => {
                    console.log('🚀 AppRouter: TherapistLogin onSuccess called with ID:', therapistId);
                    setLoggedInProvider({ id: therapistId, type: 'therapist' });
                    // First page after login: status page with availability & discount controls
                    setPage('therapistStatus');
                }} 
                onBack={handleBackToHome} 
            />;
        case 'therapistPortal': {
            console.log('🎯 AppRouter: THERAPIST DASHBOARD CASE TRIGGERED!');
            console.log('🔍 AppRouter: Current loggedInProvider:', loggedInProvider);
            
            // Find therapist by document ID (now passed from login)
            const existingTherapist = therapists.find(t => 
                t.id === loggedInProvider?.id || 
                (t as any).$id === loggedInProvider?.id ||
                String(t.id) === String(loggedInProvider?.id) ||
                String((t as any).$id) === String(loggedInProvider?.id)
            );
            
            console.log('🎯 AppRouter: Found therapist:', !!existingTherapist, existingTherapist?.name);
            
            if (loggedInProvider?.type === 'therapist') {
                const finalTherapist = portalTherapist || existingTherapist || null;
                // Industry-standard loading skeleton
                if (portalLoading && !finalTherapist) {
                    return (
                        <div className="min-h-screen flex items-center justify-center bg-white">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                                <p className="text-sm text-gray-600">Loading therapist dashboard...</p>
                            </div>
                        </div>
                    );
                }
                if (portalError && !finalTherapist) {
                    return (
                        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                            <div className="bg-white border border-red-400 rounded-lg p-6 max-w-sm w-full">
                                <h2 className="text-lg font-semibold text-red-700 mb-2">Dashboard Load Error</h2>
                                <p className="text-sm text-red-600 mb-4">{portalError}</p>
                                <button
                                    onClick={() => { setPortalTherapist(null); setPortalError(null); }}
                                    className="px-4 py-2 text-sm rounded bg-orange-600 text-white hover:bg-orange-700"
                                >Retry</button>
                            </div>
                        </div>
                    );
                }
                return (
                    <TherapistPortalPage 
                        therapist={finalTherapist}
                        onNavigateToStatus={() => setPage('therapistStatus')}
                        onLogout={handleProviderLogout}
                        onNavigateHome={() => setPage('home')}
                    />
                );
            }
            return null;
        }

        case 'therapistStatus':
            return loggedInProvider?.type === 'therapist' && <TherapistStatusPage 
                therapist={therapists.find(t => t.id === loggedInProvider.id) ?? null}
                onStatusChange={async (status: AvailabilityStatus) => {
                    await handleTherapistStatusChange(status as string);
                }}
                onLogout={handleProviderLogout}
                onNavigateToDashboard={() => setPage('therapistPortal')}
                t={t} 
            /> || null;
            
        case 'providerAuth': 
            // Route provider auth to registration choice to avoid removed UnifiedLoginPage
            return <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t} />;
        
        // unifiedLogin removed
            
        case 'placeDashboard': {
            console.log('🎯 AppRouter: PLACE DASHBOARD CASE TRIGGERED!');
            console.log('🔍 AppRouter: Current loggedInProvider:', loggedInProvider);
            
            // localStorage disabled - using Appwrite session only
            const effectiveProvider = loggedInProvider;
            if (!effectiveProvider) {
                console.log('⚠️ loggedInProvider is null (localStorage disabled - check Appwrite session)');
            }
            
            console.log('🔍 AppRouter: Effective provider after restore:', effectiveProvider);
            console.log('🔍 AppRouter: places array length:', places.length);
            
            // Show error banner if provider not set
            if (!effectiveProvider) {
                console.error('❌ CRITICAL: loggedInProvider is null/undefined in placeDashboard case!');
                return (
                    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full border-2 border-red-500">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-2xl">⚠️</span>
                                </div>
                                <h2 className="text-xl font-bold text-red-900">Dashboard Error</h2>
                            </div>
                            <p className="text-red-700 mb-4">
                                <strong>Provider not authenticated.</strong> The dashboard could not load because no provider information was found.
                            </p>
                            <div className="bg-red-100 p-3 rounded mb-4 text-xs text-red-800">
                                <strong>Debug Info:</strong><br/>
                                • loggedInProvider: {effectiveProvider ? 'exists' : 'NULL'}<br/>
                                • localStorage: disabled (using Appwrite only)<br/>
                                • Check browser console for detailed logs
                            </div>
                            <button 
                                onClick={() => {
                                    console.log('🔄 Redirecting to massage place login...');
                                    setPage('massagePlaceLogin');
                                }}
                                className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 font-semibold"
                            >
                                Return to Login
                            </button>
                        </div>
                    </div>
                );
            }
            
            if (effectiveProvider.type !== 'place') {
                console.error('❌ CRITICAL: loggedInProvider.type is not "place"!', effectiveProvider);
                return (
                    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full border-2 border-yellow-500">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-2xl">⚠️</span>
                                </div>
                                <h2 className="text-xl font-bold text-yellow-900">Wrong Provider Type</h2>
                            </div>
                            <p className="text-yellow-700 mb-4">
                                <strong>Invalid provider type detected.</strong> Expected 'place' but received '{effectiveProvider.type}'.
                            </p>
                            <div className="bg-yellow-100 p-3 rounded mb-4 text-xs text-yellow-800">
                                <strong>Debug Info:</strong><br/>
                                • Provider Type: {effectiveProvider.type}<br/>
                                • Provider ID: {effectiveProvider.id}<br/>
                                • Expected: place<br/>
                                <pre className="mt-2 overflow-auto">{JSON.stringify(effectiveProvider, null, 2)}</pre>
                            </div>
                            <button 
                                onClick={() => {
                                    console.log('🔄 Clearing state and redirecting...');
                                    setLoggedInProvider(null);
                                    setPage('massagePlaceLogin');
                                }}
                                className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 font-semibold"
                            >
                                Clear & Return to Login
                            </button>
                        </div>
                    </div>
                );
            }
            
            // Find place or create basic object for dashboard loading
            let currentPlace = places.find(p => p.id == effectiveProvider?.id || p.id === effectiveProvider?.id || String(p.id) === String(effectiveProvider?.id));
            
            console.log('🔍 AppRouter: Found place in places array:', !!currentPlace);
            
            if (!currentPlace && effectiveProvider?.id) {
                console.log('🔧 AppRouter: Creating stub place object for dashboard loading');
                // Create basic place object - PlaceDashboardPage will handle loading saved data
                currentPlace = {
                    id: effectiveProvider.id,
                    name: '', description: '', rating: 0, isLive: false,
                    openingTime: '09:00', closingTime: '21:00', location: '', phoneNumber: '', whatsappNumber: '',
                    images: [], services: [], therapists: [], lat: 0, lng: 0, $id: String(effectiveProvider.id),
                    mainImage: '', pricing: '{}', coordinates: '{"lat":0,"lng":0}', massageTypes: '[]',
                    languages: [], additionalServices: []
                } as any;
            }
            
            console.log('✅ AppRouter: Rendering PlaceDashboardPage with placeId:', effectiveProvider.id);
            return <PlaceDashboardPage 
                placeId={effectiveProvider.id}
                place={currentPlace}
                userLocation={userLocation}
                onSave={handleSavePlace}
                onLogout={handleProviderLogout}
                onNavigate={(page) => setPage(page as Page)}
                {...commonDashboardProps}
                bookings={bookings?.filter(b => b.providerId === loggedInProvider.id && b.providerType === 'place') || []}
                t={t || {}}
            />;
        }
        
        case 'serviceTerms': 
            return <ServiceTermsPage onBack={handleBackToHome} t={(t as any)?.serviceTerms || t} contactNumber={APP_CONFIG.CONTACT_NUMBER} />;
            
        case 'placeTerms':
            return renderBackPage(PlaceTermsPage, t);
            
        case 'placeDiscountBadge': 
            return <PlaceDiscountBadgePage 
                onBack={handleBackToHome} 
                placeId={loggedInProvider?.id as number || 0}
                placeName={loggedInProvider?.type === 'place' ? 'Massage Place' : 'Place'}
                t={t} 
            />;
        case 'verifiedProBadge': {
            const providerId = (loggedInProvider?.id as number) || 0;
            const providerType = (loggedInProvider?.type as 'therapist' | 'place') || 'therapist';
            return (
                <VerifiedProBadgePage
                    onBack={handleBackToHome}
                    providerId={providerId}
                    providerType={providerType}
                    providerName={providerType === 'therapist' ? selectedTherapist?.name || 'Provider' : selectedPlace?.name || 'Provider'}
                />
            );
        }
            
        case 'privacy':
            // Pass only the privacyPolicy translation namespace to avoid runtime errors
            return renderBackPage(PrivacyPolicyPage, (t as any)?.privacyPolicy || t);
        case 'cookies-policy':
            return renderBackPage(CookiesPolicyPage);
            
        case 'membership':
            return <MembershipPage 
                onSelectPackage={handleSelectMembershipPackage}
                onPackageSelect={handleSelectMembershipPackage}
                onBack={handleBackToHome}
                t={t}
            />;
            
        case 'booking': 
            return providerForBooking && <BookingPage 
                provider={providerForBooking.provider}
                providerType={providerForBooking.type}
                onBack={handleBackToHome}
                onBook={(bookingData) => {
                    // Convert booking data to the expected format
                    handleCreateBooking(bookingData);
                }}
                onCreateBooking={handleCreateBooking}
                bookings={[]} // Load actual bookings from state - implemented via bookings prop
                t={t}
                contactNumber={APP_CONFIG.CONTACT_NUMBER}
            /> || null;

        case 'accept-booking':
            // Render accept booking flow when deep-linked or path-detected
            return <AcceptBookingPage />;
        case 'decline-booking':
            return <DeclineBookingPage />;
            
        case 'bookings':
            return (
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">{t('bookings.title')}</h1>
                    {bookings.length === 0 ? (
                        <p className="text-gray-500">{t('bookings.noBookings')}</p>
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
                </div>
            );
            
        case 'notifications': {
            if (!user && !loggedInProvider && !loggedInCustomer && !isAdminLoggedIn) {
                return renderGuestNotifications();
            }
            
            // Determine user role and dashboard context for header styling
            let userRole: string | undefined;
            let notificationsDashboardType: 'hotel' | 'villa' | 'therapist' | 'customer' | 'admin' | 'place' | 'standalone' = 'standalone';
            
            if (isHotelLoggedIn) {
                userRole = 'hotel';
                notificationsDashboardType = 'hotel';
            } else if (loggedInProvider?.type === 'therapist') {
                userRole = 'therapist';
                notificationsDashboardType = 'therapist';
            } else if (loggedInProvider?.type === 'place') {
                userRole = 'place';
                notificationsDashboardType = 'place';
            } else if (loggedInCustomer) {
                userRole = 'customer';
                notificationsDashboardType = 'customer';
            } else if (isAdminLoggedIn) {
                userRole = 'admin';
                notificationsDashboardType = 'admin';
            }

            return <NotificationsPage 
                notifications={notifications || []}
                onMarkAsRead={handleMarkNotificationAsRead}
                onBack={handleBackToHome}
                t={t}
                userRole={userRole}
                dashboardType={notificationsDashboardType}
            />;
        }
            
        case 'massageTypes':
            return <MassageTypesPage _onBack={handleBackToHome} onNavigate={setPage} {...portalHandlers} onPrivacyClick={() => setPage('privacy')} therapists={therapists} places={places} t={t} />;
            
        // 'hotelLogin' and 'villaLogin' routes removed

        case 'massagePlaceLogin': 
            return <MassagePlaceLoginPage 
                onSuccess={(placeId) => {
                    console.log('🚀 MassagePlaceLogin success callback received placeId:', placeId);
                    
                    // localStorage disabled - using Appwrite session only
                    const providerData = { id: placeId, type: 'place' as const };
                    console.log('✅ Provider data ready (localStorage disabled):', providerData);
                    
                    // Update React state
                    console.log('📦 Setting loggedInProvider with:', providerData);
                    setLoggedInProvider(providerData);
                    
                    // Persist to sessionStorage for page refresh
                    sessionStorage.setItem('logged_in_provider', JSON.stringify(providerData));
                    
                    // Mark that user has entered the app
                    sessionStorage.setItem('has_entered_app', 'true');
                    sessionStorage.setItem('current_page', 'placeDashboard');
                    
                    // Defer page change to ensure all state commits
                    setTimeout(() => {
                        console.log('🔄 Navigating to placeDashboard after provider set');
                        setPage('placeDashboard');
                    }, 50); // Increased delay for reliability
                }} 
                onBack={handleBackToHome}
                t={t}
            />;
            
        case 'employerJobPosting':
            return <EmployerJobPostingPage 
                onBack={navToMassageJobs}
                onNavigateToPayment={(jobId: string) => {
                    setSelectedJobId(jobId);
                    setPage('jobPostingPayment');
                }}
                onNavigate={(page: Page) => setPage(page)}
                onMassageJobsClick={navToMassageJobs}
                onTherapistPortalClick={portalHandlers.onTherapistPortalClick}
                onMassagePlacePortalClick={portalHandlers.onMassagePlacePortalClick}
                onCustomerPortalClick={portalHandlers.onCustomerPortalClick}
                onAdminPortalClick={portalHandlers.onAdminPortalClick}
                onTermsClick={portalHandlers.onTermsClick}
                onPrivacyClick={() => setPage('privacy')}
                therapists={therapists}
                places={places}
                t={t} 
            />;
        
        case 'therapistJobRegistration':
            return <TherapistJobRegistrationPage 
                onBack={navToMassageJobs}
                onSuccess={() => {
                    alert('Profile submitted successfully!');
                    navToMassageJobs();
                }}
            />;
            
        case 'jobPostingPayment':
            return <JobPostingPaymentPage jobId={selectedJobId || ''} onBack={handleBackToHome} onNavigate={commonNavigateHandler} />;
            
        case 'browseJobs':
            return <BrowseJobsPage onBack={handleBackToHome} onPostJob={navToMassageJobs} t={t} />;
            
        case 'massageJobs': 
            return <MassageJobsPage 
                onBack={handleBackToHome} 
                onPostJob={navToEmployerJobPosting}
                onNavigateToPayment={navToJobUnlockPayment}
                onCreateTherapistProfile={navToTherapistJobRegistration}
                onNavigate={commonNavigateHandler}
            />;
            
        case 'therapistJobs':
            return <TherapistJobRegistrationPage 
                jobId={selectedJobId || ''}
                onBack={handleBackToHome} 
                onNavigate={(page: Page) => setPage(page)} 
                t={t} 
            />;
            
        case 'jobUnlockPayment':
            return <JobUnlockPaymentPage />;
            
        case 'chatList': 
            return renderComingSoon('Chat Feature Coming Soon');
            
        case 'about-us' as any:
            return <AboutUsPage onBack={handleBackToHome} onNavigate={commonNavigateHandler} t={t} />;
            
        case 'contact-us' as any:
            return <ContactUsPage onNavigate={commonNavigateHandler} {...portalHandlers} {...commonDataProps} />;
            
        case 'indastreet-partners':
            return <IndastreetPartnersPage onNavigate={commonNavigateHandler} {...portalHandlers} {...commonDataProps} />;
            
        case 'partnership-application': 
            return <PartnershipApplicationPage 
                onBack={() => setPage('indastreet-partners' as Page)} 
                t={t} 
            />;
            
        case 'how-it-works':
            return renderSimplePage(HowItWorksPage);
        case 'massage-bali':
            return <MassageBaliPage onNavigate={commonNavigateHandler} {...portalHandlers} {...commonDataProps} />;
        case 'blog':
            return renderSimplePage(BlogIndexPage);
        case 'faq':
            return renderSimplePage(FAQPage);
            
        case 'balinese-massage':
            return <BalineseMassagePage onNavigate={commonNavigateHandler} t={t} />;
            
        case 'deep-tissue-massage':
            return <DeepTissueMassagePage onNavigate={commonNavigateHandler} {...portalHandlers} {...commonDataProps} />;
            
        case 'press-media':
            return renderSimplePage(PressMediaPage);
        case 'career-opportunities':
            return renderSimplePage(CareerOpportunitiesPage);
        case 'therapist-info':
            return renderSimplePage(TherapistInfoPage);
        case 'hotel-info':
            return renderSimplePage(HotelInfoPage);
        case 'employer-info':
            return renderSimplePage(EmployerInfoPage);
            
        case 'payment-info':
            return renderSimplePage(PaymentInfoPage);
            
        case 'blog-bali-spa-trends-2025' as any:
            return renderBlogPage(BaliSpaIndustryTrends2025Page);
            
        case 'blog-top-10-massage-techniques' as any:
            return renderBlogPage(Top10MassageTechniquesPage);
            
        case 'blog-massage-career-indonesia' as any:
            return renderBlogPage(MassageCareerIndonesiaPage);
            
        case 'blog-benefits-regular-massage' as any:
            return renderBlogPage(BenefitsRegularMassageTherapyPage);
            
        case 'blog-hiring-massage-therapists' as any:
            return renderBlogPage(HiringMassageTherapistsGuidePage);
            
        case 'blog-traditional-balinese-massage' as any:
            return renderBlogPage(TraditionalBalineseMassagePage);
            
        case 'blog-spa-tourism-indonesia': return renderBlogPage(SpaTourismIndonesiaPage);
        case 'blog-aromatherapy-massage-oils': return renderBlogPage(AromatherapyMassageOilsPage);
        case 'blog-pricing-guide-therapists': return renderBlogPage(PricingGuideMassageTherapistsPage);
        case 'blog-deep-tissue-vs-swedish': return renderBlogPage(DeepTissueVsSwedishMassagePage);
        case 'blog-online-presence-therapist': return renderBlogPage(OnlinePresenceMassageTherapistPage);
            
        case 'blog-wellness-tourism-ubud':
            return renderBlogPage(WellnessTourismUbudPage);
            
        case 'guestAlerts': 
            return <GuestAlertsPage onBack={handleBackToHome} t={t} />;
            
        case 'rewardBannersTest': 
            return <RewardBannersTestPage onBack={handleBackToHome} t={t} />;
            
        case 'todaysDiscounts': 
            return <TodaysDiscountsPage onBack={handleBackToHome} onNavigate={(page: Page) => setPage(page)} t={t} />;
            
        case 'website-management':
            return <WebsiteManagementPage 
                onBack={handleBackToHome}
                currentUser={{
                    id: loggedInProvider?.id?.toString() || '',
                    name: 'User',
                    type: loggedInProvider?.type || 'therapist'
                }}
                initialData={{
                    websiteUrl: '',
                    websiteTitle: '',
                    websiteDescription: ''
                }}
                onSave={handleSavePlace}
                t={t}
            />;
            
        default: 
            console.error('🚨 AppRouter: Unknown page case reached!', {
                page,
                loggedInProvider,
                expectedCases: ['therapistPortal', 'therapistLogin', 'home', 'landing'],
                allProps: Object.keys(props)
            });
            return null;
    }
};

export default AppRouter;



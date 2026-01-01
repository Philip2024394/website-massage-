/**
 * AppRouter - Enterprise-grade routing architecture
 * 
 * Architecture:
 * - Modular route configuration
 * - Lazy-loaded components
 * - Type-safe navigation
 * - Centralized state management
 * - Performance optimized
 */

import React, { Suspense } from 'react';
import { useTranslations } from './lib/useTranslations';
import { useLanguage } from './hooks/useLanguage';
import type { Page, Language, LoggedInProvider } from './types/pageTypes';
import type { User, Place, Therapist, UserLocation, Booking, Notification, Agent, AdminMessage } from './types';
import { BookingStatus } from './types';
import LoadingSpinner from './components/LoadingSpinner';

// Route configurations
import { publicRoutes } from './router/routes/publicRoutes';
import { authRoutes } from './router/routes/authRoutes';
import { profileRoutes } from './router/routes/profileRoutes';
import { legalRoutes } from './router/routes/legalRoutes';
import { blogRoutes } from './router/routes/blogRoutes';
import { therapistRoutes } from './router/routes/therapistRoutes';
import { adminRoutes } from './router/routes/adminRoutes';

// Specialized pages not in route modules
const CreateAccountPage = React.lazy(() => import('./pages/auth/CreateAccountPage'));
const ConfirmTherapistsPage = React.lazy(() => import('./pages/ConfirmTherapistsPage'));
const EmployerJobPostingPage = React.lazy(() => import('./pages/EmployerJobPostingPage'));
const IndastreetPartnersPage = React.lazy(() => import('./pages/IndastreetPartnersPage'));
const WebsiteManagementPage = React.lazy(() => import('./pages/WebsiteManagementPage'));
const GuestProfilePage = React.lazy(() => import('./pages/GuestProfilePage'));
const QRCodePage = React.lazy(() => import('./pages/QRCodePage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const BookingPage = React.lazy(() => import('./pages/BookingPage'));
const MembershipPage = React.lazy(() => import('./pages/MembershipPage'));
const AcceptBookingPage = React.lazy(() => import('./pages/AcceptBookingPage'));
const DeclineBookingPage = React.lazy(() => import('./pages/DeclineBookingPage'));
const LeadAcceptPage = React.lazy(() => import('./pages/LeadAcceptPage'));
const LeadDeclinePage = React.lazy(() => import('./pages/LeadDeclinePage'));
const JobPostingPaymentPage = React.lazy(() => import('./pages/JobPostingPaymentPage'));
const BrowseJobsPage = React.lazy(() => import('./pages/BrowseJobsPage'));
const MassageJobsPage = React.lazy(() => import('./pages/MassageJobsPage'));
const PartnershipApplicationPage = React.lazy(() => import('./pages/PartnershipApplicationPage'));
const TherapistJobRegistrationPage = React.lazy(() => import('./pages/TherapistJobRegistrationPage'));
const ReviewsPage = React.lazy(() => import('./pages/ReviewsPage'));
const JobUnlockPaymentPage = React.lazy(() => import('./pages/JobUnlockPaymentPage'));
const TherapistStatusPage = React.lazy(() => import('./pages/TherapistStatusPage'));
const CustomerReviewsPage = React.lazy(() => import('./pages/CustomerReviewsPage'));
const RoleSelectionPage = React.lazy(() => import('./pages/auth/RoleSelectionPage'));
const CustomerSupportPage = React.lazy(() => import('./pages/CustomerSupportPage'));
const PlaceDiscountBadgePage = React.lazy(() => import('./pages/PlaceDiscountBadgePage'));
const VerifiedProBadgePage = React.lazy(() => import('./pages/VerifiedProBadgePage'));
const MobileTherapistStandardsPage = React.lazy(() => import('./pages/MobileTherapistStandardsPage'));
const GuestAlertsPage = React.lazy(() => import('./pages/GuestAlertsPage'));
const PartnerSettingsPage = React.lazy(() => import('./pages/PartnerSettingsPage'));
const AdminLoginPage = React.lazy(() => import('./pages/AdminLoginPage'));
const CareerOpportunitiesPage = React.lazy(() => import('./pages/CareerOpportunitiesPage'));
const TherapistInfoPage = React.lazy(() => import('./pages/TherapistInfoPage'));
const EmployerInfoPage = React.lazy(() => import('./pages/EmployerInfoPage'));
const PaymentInfoPage = React.lazy(() => import('./pages/PaymentInfoPage'));
const MobileTermsAndConditionsPage = React.lazy(() => import('./pages/MobileTermsAndConditionsPage'));
const TherapistTermsAndConditions = React.lazy(() => import('./src/pages/TherapistTermsAndConditions'));

// Blog posts
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
    facialPlaces: Place[];
    hotels: any[];
    userLocation: UserLocation | null;
    selectedMassageType: string | null;
    selectedPlace: Place | null;
    selectedTherapist: Therapist | null;
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
    handleSetSelectedTherapist: (therapist: Therapist) => void;
    handleLogout: () => Promise<void>;
    handleNavigateToTherapistLogin: () => void;
    handleNavigateToRegistrationChoice: () => void;
    handleNavigateToBooking: (provider: Therapist | Place, type: 'therapist' | 'place') => void;
    handleQuickBookWithChat: (provider: Therapist | Place, type: 'therapist' | 'place') => Promise<void>;
    handleChatWithBusyTherapist: (therapist: Therapist) => Promise<void>;
    handleShowRegisterPromptForChat: () => void;
    handleIncrementAnalytics: (providerId: string | number, providerType: 'therapist' | 'place', metric: string) => Promise<void>;
    handleNavigateToHotelLogin: () => void;
    handleNavigateToMassagePlaceLogin: () => void;
    handleNavigateToServiceTerms: () => void;
    handleNavigateToPrivacyPolicy: () => void;
    handleBackToHome: () => void;
    handleSelectRegistration: (type: 'therapist' | 'place' | 'facial') => void;
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
    handleHotelLogin: (hotelId?: string) => void;
    handleAdminLogin: () => void;
    handleAdminLogout: () => Promise<void>;
    handleNavigateToNotifications: () => void;
    handleNavigateToAgentAuth: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onFacialPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onBrowseJobsClick?: () => void;
    onEmployerJobPostingClick?: () => void;
    onMassageJobsClick?: () => void;
    onTherapistJobsClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    setPage: (page: Page) => void;
    setLoggedInProvider: (provider: LoggedInProvider | null) => void;
    setLoggedInCustomer: (customer: any) => void;
    setSelectedJobId: (id: string | null) => void;
    restoreUserSession?: () => Promise<void>;
    
    // Missing properties for header/navigation
    onLanguageChange?: (lang: Language) => void;
    selectedCity?: string;
    onCityChange?: (city: string) => void;
    onNavigate?: (page: Page) => void;
}

/**
 * Enterprise Router Component
 * Uses modular route configuration for maintainability
 */
export const AppRouter: React.FC<AppRouterProps> = (props) => {
    const { page, language, handleLanguageSelect } = props;
    const { t } = useTranslations();

    const resolveTherapistProfile = () => {
        if (props.loggedInProvider?.type !== 'therapist') return null;
        const providerId = ((props.loggedInProvider as any).$id || props.loggedInProvider.id || '').toString();
        const match = props.therapists.find((th: any) => ((th.$id || th.id || '').toString() === providerId));
        return match || (props.loggedInProvider as any);
    };

    // Loading state
    if (props.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    /**
     * Render route with suspense boundary and proper language props
     */
    const renderRoute = (Component: React.LazyExoticComponent<any>, componentProps: any = {}) => (
        <Suspense fallback={<LoadingSpinner />}>
            <Component 
                {...props} 
                {...componentProps} 
                t={t}
                language={language}
                onLanguageChange={handleLanguageSelect}
                onNavigate={props.setPage}
            />
        </Suspense>
    );

    /**
     * Route matcher - Enterprise pattern for clean routing
     */
    switch (page) {
        // ===== PUBLIC ROUTES =====
        case 'landing':
            return renderRoute(publicRoutes.landing.component);
        
        case 'home':
            return renderRoute(publicRoutes.home.component, {
                onNavigate: props.onNavigate,
                onBook: props.handleOpenBookingPopup,
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces,
                hotels: props.hotels,
                userLocation: props.userLocation,
                loggedInCustomer: props.loggedInCustomer,
                loggedInProvider: props.loggedInProvider,
                onQuickBookWithChat: props.handleQuickBookWithChat,
                onChatWithBusyTherapist: props.handleChatWithBusyTherapist,
                onShowRegisterPrompt: props.handleShowRegisterPrompt,
                onIncrementAnalytics: props.handleIncrementAnalytics,
                onSelectTherapist: props.handleSetSelectedTherapist,
                onSelectPlace: props.handleSetSelectedPlace,
                onSetUserLocation: props.handleSetUserLocation,
                selectedCity: props.selectedCity,
                onCityChange: props.setSelectedCity,
                onLoginClick: props.handleNavigateToTherapistLogin,
                t: props.t,
                language: props.language
            });
        
        case 'about':
            return renderRoute(publicRoutes.about.component);
        
        case 'contact':
            return renderRoute(publicRoutes.contact.component);
        
        case 'company':
            return renderRoute(publicRoutes.company.component);
        
        case 'how-it-works':
            return renderRoute(publicRoutes.howItWorks.component);
        
        case 'faq':
            return renderRoute(publicRoutes.faq.component);
        
        case 'massage-types':
            return renderRoute(publicRoutes.massageTypes.component);
        
        case 'facial-types':
            return renderRoute(publicRoutes.facialTypes.component);
        
        case 'providers':
            return renderRoute(publicRoutes.providers.component);
        
        case 'facial-providers':
            return renderRoute(publicRoutes.facialProviders.component);
        
        case 'discounts':
            return renderRoute(publicRoutes.discounts.component);

        // ===== JOIN ROUTES =====
        case 'joinIndastreet':
            // Redirect Join Indastreet to role selection page
            return renderRoute(RoleSelectionPage);

        // ===== AUTH ROUTES =====
        case 'auth':
            return renderRoute(authRoutes.auth.component, {
                onAuthSuccess: (userType: string) => {
                    // Redirect to appropriate dashboard based on role
                    const dashboardMap: Record<string, string> = {
                        'therapist': '/dashboard/therapist',
                        'massage-place': '/dashboard/massage-place', 
                        'facial-place': '/dashboard/facial-place'
                    };
                    
                    const dashboardUrl = dashboardMap[userType];
                    if (dashboardUrl) {
                        window.location.href = dashboardUrl;
                    } else {
                        console.error('Unknown user type:', userType);
                    }
                },
                onBack: () => props.onNavigate('home')
            });
            
        case 'signin':
            return renderRoute(authRoutes.signin.component, {
                mode: 'signin',
                onAuthSuccess: async (userType: string) => {
                    console.log('✅ Sign in successful - navigating to dashboard for:', userType);
                    
                    // Restore user session to populate loggedInUser state
                    if (props.restoreUserSession) {
                        console.log('🔄 Restoring user session after sign-in...');
                        await props.restoreUserSession();
                        console.log('✅ User session restored');
                    }
                    
                    // Navigate within React app instead of external redirect
                    const dashboardPageMap: Record<string, string> = {
                        'therapist': 'therapist-status',
                        'massage-place': 'massage-place-dashboard', 
                        'facial-place': 'facial-place-dashboard'
                    };
                    
                    const dashboardPage = dashboardPageMap[userType];
                    if (dashboardPage) {
                        props.onNavigate(dashboardPage);
                    } else {
                        console.error('Unknown user type:', userType);
                        props.onNavigate('home');
                    }
                },
                onBack: () => props.onNavigate('home')
            });
            
        case 'sign-in':
        case 'signIn':
            return renderRoute(authRoutes.signIn.component, {
                mode: 'signin',
                onAuthSuccess: async (userType: string) => {
                    if (props.restoreUserSession) {
                        await props.restoreUserSession();
                    }
                    const dashboardPageMap: Record<string, string> = {
                        'therapist': 'therapist-status',
                        'massage-place': 'massage-place-dashboard', 
                        'facial-place': 'facial-place-dashboard'
                    };
                    const dashboardPage = dashboardPageMap[userType] || 'home';
                    props.onNavigate(dashboardPage);
                },
                onBack: () => props.onNavigate('home')
            });
            
        case 'login':
            return renderRoute(authRoutes.login.component, {
                mode: 'signin',
                onAuthSuccess: async (userType: string) => {
                    if (props.restoreUserSession) {
                        await props.restoreUserSession();
                    }
                    const dashboardPageMap: Record<string, string> = {
                        'therapist': 'therapist-status',
                        'massage-place': 'massage-place-dashboard', 
                        'facial-place': 'facial-place-dashboard'
                    };
                    const dashboardPage = dashboardPageMap[userType] || 'home';
                    props.onNavigate(dashboardPage);
                },
                onBack: () => props.onNavigate('home')
            });
            
        case 'signup':
        case 'createAccount':
        case 'create-account':
            return renderRoute(authRoutes.signup.component, {
                mode: 'signup',
                onAuthSuccess: async (userType: string) => {
                    console.log('✅ Signup successful - navigating to dashboard for:', userType);
                    
                    // Restore user session to populate loggedInUser state
                    if (props.restoreUserSession) {
                        console.log('🔄 Restoring user session after signup...');
                        await props.restoreUserSession();
                        console.log('✅ User session restored');
                    }
                    
                    // Navigate within React app instead of external redirect
                    const dashboardPageMap: Record<string, string> = {
                        'therapist': 'therapist-status',
                        'massage-place': 'massage-place-dashboard', 
                        'facial-place': 'facial-place-dashboard'
                    };
                    
                    const dashboardPage = dashboardPageMap[userType];
                    if (dashboardPage) {
                        props.onNavigate(dashboardPage);
                    } else {
                        console.error('Unknown user type:', userType);
                        props.onNavigate('home');
                    }
                },
                onBack: () => props.onNavigate('home')
            });
            
        case 'role-selection':
            return renderRoute(RoleSelectionPage);
            
        case 'onboarding-package':
            return renderRoute(authRoutes.onboardingPackage.component);
            
        case 'therapist-login':
        case 'therapistLogin':
            return renderRoute(authRoutes.therapistLogin.component);
        
        case 'place-login':
        case 'massagePlaceLogin':
            return renderRoute(authRoutes.placeLogin.component);
        
        case 'facial-portal':
            return renderRoute(authRoutes.facialPortal.component);
        
        case 'simple-signup':
            return renderRoute(authRoutes.simpleSignup.component);

        // ===== PROFILE ROUTES =====
        case 'therapist-profile':
            console.log('🔧 [TherapistProfile] Rendering therapist profile page');
            console.log('  - selectedTherapist:', props.selectedTherapist);
            console.log('  - URL path:', window.location.pathname);
            
            // Check if accessing via URL with ID parameter
            const pathMatch = window.location.pathname.match(/\/profile\/therapist\/(\d+-[\w-]+)/);
            if (pathMatch && !props.selectedTherapist) {
                // Extract ID from URL and find therapist
                const urlId = pathMatch[1].split('-')[0];
                const foundTherapist = props.therapists.find((t: any) => 
                    (t.id || t.$id || '').toString() === urlId
                );
                if (foundTherapist) {
                    return renderRoute(profileRoutes.therapistProfile.component, {
                        therapist: foundTherapist
                    });
                }
            }
            
            return renderRoute(profileRoutes.therapistProfile.component, {
                therapist: props.selectedTherapist,
                // Header props
                onLanguageChange: props.onLanguageChange,
                language: props.language,
                selectedCity: props.selectedCity,
                onCityChange: props.onCityChange,
                therapists: props.therapists,
                places: props.places,
                onMassageJobsClick: props.onMassageJobsClick,
                onHotelPortalClick: props.onHotelPortalClick,
                onVillaPortalClick: props.onVillaPortalClick,
                onTherapistPortalClick: props.onTherapistPortalClick,
                onMassagePlacePortalClick: props.onMassagePlacePortalClick,
                onFacialPortalClick: props.onFacialPortalClick,
                onAgentPortalClick: props.onAgentPortalClick,
                onCustomerPortalClick: props.onCustomerPortalClick,
                onAdminPortalClick: props.onAdminPortalClick,
                onTermsClick: props.onTermsClick,
                onPrivacyClick: props.onPrivacyClick,
                onNavigate: props.onNavigate
            });
        
        // NEW: Simple share routes
        case 'share-therapist':
            console.log('🔧 [ShareTherapist] Rendering new share page');
            console.log('  - Therapists available:', props.therapists?.length || 0);
            console.log('  - URL:', window.location.href);
            return renderRoute(profileRoutes.shareTherapist.component);
        
        case 'share-place':
            console.log('🔧 [SharePlace] Rendering share page');
            return renderRoute(profileRoutes.sharePlace.component);
        
        case 'share-facial':
            console.log('🔧 [ShareFacial] Rendering share page');
            return renderRoute(profileRoutes.shareFacial.component);
        
        // LEGACY: Keep old shared-therapist-profile working
        case 'shared-therapist-profile':
            // Debug logging for therapist private link issues
            console.log('🔧 [SharedTherapistProfile] Rendering with props:', {
                therapistsCount: props.therapists?.length || 0,
                selectedTherapist: props.selectedTherapist ? 'Present' : 'None',
                userLocation: props.userLocation ? 'Present' : 'None',
                currentPath: window.location.pathname
            });
            return renderRoute(profileRoutes.sharedTherapist.component);
        
        case 'massage-place-profile':
            console.log('🔧 [MassagePlaceProfile] Rendering massage place profile page');
            console.log('  - selectedPlace:', props.selectedPlace);
            console.log('  - URL path:', window.location.pathname);
            
            // Check if accessing via URL with ID parameter
            const placePathMatch = window.location.pathname.match(/\/profile\/place\/(\d+-[\w-]+)/);
            if (placePathMatch && !props.selectedPlace) {
                // Extract ID from URL and find place
                const urlId = placePathMatch[1].split('-')[0];
                const foundPlace = props.places.find((p: any) => 
                    (p.id || p.$id || '').toString() === urlId
                );
                if (foundPlace) {
                    return renderRoute(profileRoutes.massagePlace.component, {
                        place: foundPlace,
                        // Header props
                        onLanguageChange: props.onLanguageChange,
                        language: props.language,
                        selectedCity: props.selectedCity,
                        onCityChange: props.onCityChange,
                        therapists: props.therapists,
                        places: props.places,
                        onMassageJobsClick: props.onMassageJobsClick,
                        onHotelPortalClick: props.onHotelPortalClick,
                        onVillaPortalClick: props.onVillaPortalClick,
                        onTherapistPortalClick: props.onTherapistPortalClick,
                        onMassagePlacePortalClick: props.onMassagePlacePortalClick,
                        onFacialPortalClick: props.onFacialPortalClick,
                        onAgentPortalClick: props.onAgentPortalClick,
                        onCustomerPortalClick: props.onCustomerPortalClick,
                        onAdminPortalClick: props.onAdminPortalClick,
                        onTermsClick: props.onTermsClick,
                        onPrivacyClick: props.onPrivacyClick,
                        onNavigate: props.onNavigate
                    });
                }
            }
            
            return renderRoute(profileRoutes.massagePlace.component, {
                place: props.selectedPlace,
                // Header props
                onLanguageChange: props.onLanguageChange,
                language: props.language,
                selectedCity: props.selectedCity,
                onCityChange: props.onCityChange,
                therapists: props.therapists,
                places: props.places,
                onMassageJobsClick: props.onMassageJobsClick,
                onHotelPortalClick: props.onHotelPortalClick,
                onVillaPortalClick: props.onVillaPortalClick,
                onTherapistPortalClick: props.onTherapistPortalClick,
                onMassagePlacePortalClick: props.onMassagePlacePortalClick,
                onFacialPortalClick: props.onFacialPortalClick,
                onAgentPortalClick: props.onAgentPortalClick,
                onCustomerPortalClick: props.onCustomerPortalClick,
                onAdminPortalClick: props.onAdminPortalClick,
                onTermsClick: props.onTermsClick,
                onPrivacyClick: props.onPrivacyClick,
                onNavigate: props.onNavigate
            });
        
        case 'facial-place-profile':
            console.log('🔧 [FacialPlaceProfile] Rendering facial place profile page');
            console.log('  - selectedPlace:', props.selectedPlace);
            
            return renderRoute(profileRoutes.facialPlace.component, {
                place: props.selectedPlace,
                onBack: () => props.setPage('home'),
                onBook: () => {
                    // Open WhatsApp booking for facial treatments
                    if (props.selectedPlace?.whatsappNumber) {
                        const message = `Hi! I'd like to book a facial treatment at ${props.selectedPlace.name}. When are you available?`;
                        window.open(`https://wa.me/${props.selectedPlace.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                    }
                },
                onNavigate: props.onNavigate,
                onMassageJobsClick: props.onMassageJobsClick,
                onVillaPortalClick: props.onVillaPortalClick,
                onTherapistPortalClick: props.onTherapistPortalClick,
                onFacialPlacePortalClick: props.onFacialPortalClick,
                onAgentPortalClick: props.onAgentPortalClick,
                onCustomerPortalClick: props.onCustomerPortalClick,
                onAdminPortalClick: props.onAdminPortalClick,
                onTermsClick: props.onTermsClick,
                onPrivacyClick: props.onPrivacyClick,
                therapists: props.therapists,
                places: props.places,
                userLocation: props.userLocation,
                loggedInCustomer: props.loggedInCustomer,
                language: props.language,
                onLanguageChange: props.onLanguageChange
            });
        
        case 'place-detail':
            return renderRoute(profileRoutes.placeDetail.component);

        case 'therapistStatus': {
            const therapistProfile = resolveTherapistProfile();
            return renderRoute(TherapistStatusPage, {
                therapist: therapistProfile,
                onStatusChange: props.handleTherapistStatusChange,
                onNavigateToDashboard: () => props.setPage('therapistDashboard'),
                onNavigateToHome: () => props.setPage('home')
            });
        }

        // ===== LEGAL ROUTES =====
        case 'privacy-policy':
            return renderRoute(legalRoutes.privacy.component);
        
        case 'cookies-policy':
            return renderRoute(legalRoutes.cookies.component);
        
        case 'service-terms':
            return renderRoute(legalRoutes.serviceTerms.component);
        
        case 'place-terms':
            return renderRoute(legalRoutes.placeTerms.component);
        
        case 'package-terms':
            return renderRoute(legalRoutes.packageTerms.component);
        
        case 'membership-terms':
            return renderRoute(legalRoutes.membershipTerms.component);
        
        case 'mobile-terms-and-conditions':
            return renderRoute(MobileTermsAndConditionsPage);
        
        case 'therapist-terms-and-conditions':
        case 'therapist-terms':
            return renderRoute(TherapistTermsAndConditions);

        // ===== BLOG ROUTES =====
        case 'blog':
            return renderRoute(blogRoutes.index.component);
        
        case 'massage-bali':
            return renderRoute(blogRoutes.massageBali.component);
        
        case 'balinese-massage':
            return renderRoute(blogRoutes.balinese.component);
        
        case 'deep-tissue-massage':
            return renderRoute(blogRoutes.deepTissue.component);
        
        case 'press':
            return renderRoute(blogRoutes.press.component);

        // ===== BLOG POSTS =====
        case 'blog-bali-spa-trends-2025':
            return renderRoute(BaliSpaIndustryTrends2025Page);
        
        case 'blog-top-10-massage-techniques':
            return renderRoute(Top10MassageTechniquesPage);
        
        case 'blog-massage-career-indonesia':
            return renderRoute(MassageCareerIndonesiaPage);
        
        case 'blog-benefits-regular-massage':
            return renderRoute(BenefitsRegularMassageTherapyPage);
        
        case 'blog-hiring-massage-therapists':
            return renderRoute(HiringMassageTherapistsGuidePage);
        
        case 'blog-traditional-balinese-massage':
            return renderRoute(TraditionalBalineseMassagePage);
        
        case 'blog-spa-tourism-indonesia':
            return renderRoute(SpaTourismIndonesiaPage);
        
        case 'blog-aromatherapy-massage-oils':
            return renderRoute(AromatherapyMassageOilsPage);
        
        case 'blog-pricing-guide-massage':
            return renderRoute(PricingGuideMassageTherapistsPage);
        
        case 'blog-deep-tissue-vs-swedish':
            return renderRoute(DeepTissueVsSwedishMassagePage);
        
        case 'blog-online-presence-therapist':
            return renderRoute(OnlinePresenceMassageTherapistPage);
        
        case 'blog-wellness-tourism-ubud':
            return renderRoute(WellnessTourismUbudPage);

        // ===== SPECIALIZED PAGES =====
        case 'confirm-therapists':
            return renderRoute(ConfirmTherapistsPage);
        
        case 'employer-job-posting':
            return renderRoute(EmployerJobPostingPage);
        
        case 'indastreet-partners':
            return renderRoute(IndastreetPartnersPage);
        
        case 'website-management':
            return renderRoute(WebsiteManagementPage);
        
        case 'guest-profile':
            return renderRoute(GuestProfilePage);
        
        case 'qr-code':
            return renderRoute(QRCodePage);
        
        case 'notifications':
            return renderRoute(NotificationsPage);
        
        case 'booking':
            return renderRoute(BookingPage);
        
        case 'membership':
            return renderRoute(MembershipPage);
        
        case 'accept-booking':
            return renderRoute(AcceptBookingPage);
        
        case 'decline-booking':
            return renderRoute(DeclineBookingPage);
        
        case 'lead-accept':
            return renderRoute(LeadAcceptPage);
        
        case 'lead-decline':
            return renderRoute(LeadDeclinePage);
        
        case 'job-posting-payment':
            return renderRoute(JobPostingPaymentPage);
        
        case 'browse-jobs':
        case 'browseJobs':
            return renderRoute(BrowseJobsPage);
        
        case 'massage-jobs':
        case 'massageJobs':
            return renderRoute(MassageJobsPage);
        
        case 'partnership-application':
            return renderRoute(PartnershipApplicationPage);
        
        case 'therapist-job-registration':
            return renderRoute(TherapistJobRegistrationPage);
        
        case 'reviews':
            return renderRoute(ReviewsPage, {
                onBack: () => props.setPage('home')
            });
        
        case 'job-unlock-payment':
            return renderRoute(JobUnlockPaymentPage);
        
        case 'customer-reviews':
            return renderRoute(CustomerReviewsPage, {
                onBack: () => props.setPage('home')
            });
        
        case 'customer-support':
            return renderRoute(CustomerSupportPage);
        
        case 'place-discount-badge':
            return renderRoute(PlaceDiscountBadgePage);
        
        case 'verifiedProBadge':
        case 'verified-pro-badge':
            return renderRoute(VerifiedProBadgePage);
        
        case 'mobileTherapistStandards':
        case 'mobile-therapist-standards':
            return renderRoute(MobileTherapistStandardsPage);
        
        case 'guest-alerts':
            return renderRoute(GuestAlertsPage);
        
        case 'partner-settings':
            return renderRoute(PartnerSettingsPage);
        
        case 'admin-login':
            return renderRoute(AdminLoginPage);
        
        case 'career-opportunities':
            return renderRoute(CareerOpportunitiesPage);
        
        case 'therapist-info':
            return renderRoute(TherapistInfoPage);
        
        case 'employer-info':
            return renderRoute(EmployerInfoPage);
        
        case 'payment-info':
            return renderRoute(PaymentInfoPage);

        // ===== GENERIC DASHBOARD ROUTE - Redirects to appropriate dashboard =====
        case 'dashboard':
            // Redirect to appropriate dashboard based on logged-in user type
            if (props.user) {
                const userType = props.user.userType || props.user.role;
                if (userType === 'therapist' || props.user.therapistId) {
                    // Redirect to therapist dashboard
                    return renderRoute(therapistRoutes.dashboard.component, {
                        therapist: props.user,
                        onLogout: props.handleLogout,
                        onNavigateToStatus: () => props.onNavigate?.('therapist-status'),
                        onNavigateToBookings: () => props.onNavigate?.('therapist-bookings'),
                        onNavigateToEarnings: () => props.onNavigate?.('therapist-earnings'),
                        onNavigateToChat: () => props.onNavigate?.('therapist-chat'),
                        onNavigateToNotifications: () => props.onNavigate?.('therapist-notifications'),
                        onNavigateToLegal: () => props.onNavigate?.('therapist-legal'),
                        onNavigateToCalendar: () => props.onNavigate?.('therapist-calendar'),
                        onNavigateToPayment: () => props.onNavigate?.('therapist-payment'),
                        onNavigateToPaymentStatus: () => props.onNavigate?.('therapist-payment-status'),
                        onNavigateToCommission: () => props.onNavigate?.('therapist-commission'),
                        onNavigateToPremium: () => props.onNavigate?.('therapist-premium'),
                        onNavigateToSchedule: () => props.onNavigate?.('therapist-schedule'),
                        onNavigateToMenu: () => props.onNavigate?.('therapist-menu'),
                        onNavigateHome: () => props.onNavigate?.('home'),
                        language: props.language
                    });
                } else if (userType === 'massage-place' || userType === 'massage_place') {
                    return renderRoute(placeRoutes.dashboard.component, {
                        place: props.user,
                        onBack: () => props.onNavigate?.('home'),
                        language: props.language
                    });
                } else if (userType === 'facial-place' || userType === 'facial_place') {
                    return renderRoute(facialRoutes.dashboard.component, {
                        place: props.user,
                        onBack: () => props.onNavigate?.('home'),
                        language: props.language
                    });
                }
            }
            // No user logged in - show home page
            return renderRoute(publicRoutes.home.component, {
                onNavigate: props.onNavigate,
                onBook: props.handleOpenBookingPopup,
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces,
                hotels: props.hotels,
                userLocation: props.userLocation,
                loggedInCustomer: props.loggedInCustomer,
                loggedInProvider: props.loggedInProvider,
                onQuickBookWithChat: props.handleQuickBookWithChat,
                onChatWithBusyTherapist: props.handleChatWithBusyTherapist,
                onShowRegisterPrompt: props.handleShowRegisterPrompt,
                onIncrementAnalytics: props.handleIncrementAnalytics,
                selectedCity: props.selectedCity,
                onCityChange: props.setSelectedCity,
                t: props.t,
                language: props.language
            });

        // ===== THERAPIST DASHBOARD ROUTES =====
        case 'therapist':
        case 'therapistDashboard':
        case 'therapist-dashboard':
            return renderRoute(therapistRoutes.dashboard.component, {
                therapist: props.user,
                onLogout: props.handleLogout,
                onNavigateToStatus: () => props.onNavigate?.('therapist-status'),
                onNavigateToBookings: () => props.onNavigate?.('therapist-bookings'),
                onNavigateToEarnings: () => props.onNavigate?.('therapist-earnings'),
                onNavigateToChat: () => props.onNavigate?.('therapist-chat'),
                onNavigateToNotifications: () => props.onNavigate?.('therapist-notifications'),
                onNavigateToLegal: () => props.onNavigate?.('therapist-legal'),
                onNavigateToCalendar: () => props.onNavigate?.('therapist-calendar'),
                onNavigateToPayment: () => props.onNavigate?.('therapist-payment'),
                onNavigateToPaymentStatus: () => props.onNavigate?.('therapist-payment-status'),
                onNavigateToCommission: () => props.onNavigate?.('therapist-commission'),
                onNavigateToPremium: () => props.onNavigate?.('therapist-premium'),
                onNavigateToSchedule: () => props.onNavigate?.('therapist-schedule'),
                onNavigateToMenu: () => props.onNavigate?.('therapist-menu'),
                onNavigateHome: () => props.onNavigate?.('home'),
                language: props.language
            });
        
        case 'therapist-status':
            return renderRoute(therapistRoutes.status.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        case 'therapist-bookings':
            return renderRoute(therapistRoutes.bookings.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        case 'therapist-earnings':
            return renderRoute(therapistRoutes.earnings.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        case 'therapist-chat':
            return renderRoute(therapistRoutes.chat.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        case 'therapist-notifications':
            return renderRoute(therapistRoutes.notifications.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        case 'therapist-legal':
            return renderRoute(therapistRoutes.legal.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        case 'therapist-calendar':
            return renderRoute(therapistRoutes.calendar.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        case 'therapist-payment':
            return renderRoute(therapistRoutes.payment.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        case 'therapist-payment-status':
            return renderRoute(therapistRoutes.paymentStatus.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        case 'therapist-menu':
            return renderRoute(therapistRoutes.menu.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        case 'therapist-premium':
            return renderRoute(therapistRoutes.premium.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        case 'therapist-commission':
            return renderRoute(therapistRoutes.commission.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        case 'therapist-schedule':
            return renderRoute(therapistRoutes.schedule.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        case 'therapist-package-terms':
            return renderRoute(therapistRoutes.packageTerms.component, {
                therapist: props.user,
                language: props.language
            });

        // ===== OTHER DASHBOARD ROUTES =====
        
        case 'placeDashboard':
        case 'place-dashboard':
            return renderRoute(authRoutes.placeLogin.component, {
                redirectToDashboard: true
            });

        // ===== ADMIN ROUTES =====
        case 'admin-live-listings':
            return renderRoute(adminRoutes.liveListings.component, {
                therapists: props.therapists || [],
                loggedInAgent: props.loggedInAgent,
                onNavigate: props.onNavigate
            });

        // ===== FALLBACK =====
        default:
            return renderRoute(publicRoutes.home.component);
    }
};

export default AppRouter;

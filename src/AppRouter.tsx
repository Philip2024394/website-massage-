// 🎯 AUTO-FIXED: Mobile scroll architecture violations (6 fixes)
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

import React, { Suspense, useEffect } from 'react';
import { useTranslations } from './lib/useTranslations';
import { useLanguage } from './hooks/useLanguage';
import { logger } from './utils/logger';
import type { Page, Language, LoggedInProvider } from './types/pageTypes';
import type { User, Place, Therapist, UserLocation, Booking, Notification, Agent, AdminMessage } from './types';
import { BookingStatus } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import { SkeletonLoader } from './components/SkeletonLoader';
import { databases, APPWRITE_DATABASE_ID as DATABASE_ID, COLLECTIONS } from './lib/appwrite';

// 🚀 ENTERPRISE LOADING SYSTEM
import { useLoading, useComponentLoading } from './context/LoadingContext';
import { EnterpriseLoader } from './components/EnterpriseLoader';
import { SkeletonLoader as EnterpriseSkeleton, PageSkeleton } from './components/ui/SkeletonLoader';

// Error Boundary for lazy loading failures
class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // TEMPORARY DIAGNOSTIC LOGGING - ISOLATION MODE
    logger.error('[LazyLoadErrorBoundary] ERROR CAUGHT');
    logger.error('Error Message:', error?.message);
    logger.error('Error Name:', error?.name);
    logger.error('Error Stack:', error?.stack);
    logger.error('Component Stack:', errorInfo?.componentStack);
    logger.error('Full Error Object:', error);
    logger.error('Full ErrorInfo Object:', errorInfo);
    
    logger.error('[LAZY LOAD ERROR]', error, errorInfo);
        if (typeof window !== 'undefined') {
            (window as any).__lazyErrorMessage = error?.message || 'Unknown error';
            (window as any).__lazyErrorStack = (error as any)?.stack || '';
        }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Landing page error boundary: shows Try again/Reload if MainLandingPage throws (admin-approved for UX)
import { LandingPageErrorBoundary } from './components/error-boundaries/LandingPageErrorBoundary';
// Route configurations
import { publicRoutes } from './router/routes/publicRoutes';
import { authRoutes } from './router/routes/authRoutes';
import { profileRoutes } from './router/routes/profileRoutes';
import { legalRoutes } from './router/routes/legalRoutes';
import { blogRoutes } from './router/routes/blogRoutes';
import { therapistRoutes } from './router/routes/therapistRoutes';
import { adminRoutes } from './router/routes/adminRoutes';
import { placeRoutes } from './router/routes/placeRoutes';
import { facialRoutes } from './router/routes/facialRoutes';

// Specialized pages not in route modules
// LoadingGate - NOT lazy loaded for immediate availability (prevents loops)
import LoadingGate from './pages/LoadingGate';

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
const ApplyForJobPage = React.lazy(() => import('./pages/ApplyForJobPage'));
const BrowseJobsPage = React.lazy(() => import('./pages/BrowseJobsPage'));
const MassageJobsPage = React.lazy(() => import('./pages/MassageJobsPage'));
const PartnershipApplicationPage = React.lazy(() => import('./pages/PartnershipApplicationPage'));
const TherapistJobRegistrationPage = React.lazy(() => import('./pages/TherapistJobRegistrationPage'));
const ReviewsPage = React.lazy(() => import('./pages/ReviewsPage'));
const JobUnlockPaymentPage = React.lazy(() => import('./pages/JobUnlockPaymentPage'));
const TherapistListingPaymentPage = React.lazy(() => import('./pages/TherapistListingPaymentPage'));
const AppwriteDiagnostic = React.lazy(() => import('./pages/AppwriteDiagnostic').then(m => ({ default: m.AppwriteDiagnostic })));
const DiagnosticPage = React.lazy(() => import('./pages/DiagnosticPage').then(m => ({ default: m.DiagnosticPage })));
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
const TherapistTermsAndConditions = React.lazy(() => import('./pages/TherapistTermsAndConditions'));

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

// Shared profile components
const SharedTherapistProfileLazy = React.lazy(() => import('./features/shared-profiles/SharedTherapistProfile'));
// Import full shared profile directly (non-lazy) to guarantee rendering
import SharedTherapistProfileDirect from './features/shared-profiles/SharedTherapistProfile';

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
    handleShowRegisterPrompt: () => void;
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
    restoreUserSession: () => Promise<void>;
    
    // Missing properties for header/navigation
    onLanguageChange?: (lang: Language) => void;
    selectedCity?: string;
    onCityChange?: (city: string) => void;
    setSelectedCity?: (city: string) => void;
    onNavigate: (page: Page) => void;
    t: any;
    currentPage: Page;
}

/**
 * Helper component to fetch therapist from Appwrite when not in memory
 * Used for direct link sharing (cold starts)
 * 🚀 UPDATED: Uses enterprise loading patterns
 */
const TherapistProfileWithFetch: React.FC<any> = ({ therapistId, ...props }) => {
    const [therapist, setTherapist] = React.useState<any>(null);
    const [error, setError] = React.useState<string | null>(null);
    
    // 🚀 ENTERPRISE LOADING: Component-specific loading state
    const { isLoading, setLoading } = useComponentLoading(`therapist-profile-${therapistId}`);

    // Official images constants (same as SharedTherapistProfile)
    const OFFICIAL_HERO_IMAGE = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258';
    const OFFICIAL_MAIN_IMAGE = 'https://ik.imagekit.io/7grri5v7d/garden%20forest.png?updatedAt=1761334454082';

    React.useEffect(() => {
        const fetchTherapist = async () => {
            try {
                setLoading(true);
                
                // CRITICAL FIX: Extract actual document ID (remove name suffix if present)
                // URL may be: "692467a3001f6f05aaa1-budi" but Appwrite ID is: "692467a3001f6f05aaa1"
                const cleanId = therapistId.includes('-') ? therapistId.split('-')[0] : therapistId;
                
                logger.debug('[FETCH] Loading therapist from Appwrite:', { 
                    originalId: therapistId, 
                    cleanId,
                    hasNameSuffix: therapistId.includes('-')
                });
                
                const fetchedTherapist = await databases.getDocument(
                    DATABASE_ID, 
                    COLLECTIONS.THERAPISTS, 
                    cleanId
                );
                
                // Apply official images
                const therapistWithImages = {
                    ...fetchedTherapist,
                    heroImageUrl: OFFICIAL_HERO_IMAGE,
                    mainImage: OFFICIAL_MAIN_IMAGE
                };
                
                logger.debug('[FETCH] Therapist loaded:', therapistWithImages.name);
                setTherapist(therapistWithImages);
                setError(null);
            } catch (err: any) {
                logger.error('[FETCH] Failed to load therapist:', err);
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchTherapist();
    }, [therapistId, setLoading]);

    // 🚀 ENTERPRISE LOADING: Skeleton loader instead of spinner
    if (isLoading) {
        return <PageSkeleton variant="therapist-dashboard" />;
    }

    if (error || !therapist) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'Unable to load therapist profile'}</p>
                    <button
                        onClick={() => props.onNavigate?.('home')}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // Import the TherapistProfilePage component
    const TherapistProfilePage = profileRoutes.therapistProfile.component;
    
    return (
        <React.Suspense fallback={<div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto my-8"></div>}> 
            <TherapistProfilePage
                therapist={therapist}
                onBack={() => props.onNavigate?.('home')}
                onLanguageChange={props.onLanguageChange}
                language={props.language}
                selectedCity={props.selectedCity}
                onCityChange={props.onCityChange}
                therapists={props.therapists}
                places={props.places}
                onNavigate={props.onNavigate}
                // Chat/booking handlers - SIMPLIFIED: Direct PersistentChatProvider integration
                // onQuickBookWithChat={props.handleQuickBookWithChat} // ❌ REMOVED: Complex event chain
                onChatWithBusyTherapist={props.handleChatWithBusyTherapist}
                onShowRegisterPrompt={props.handleShowRegisterPromptForChat}
                onIncrementAnalytics={props.handleIncrementAnalytics}
                // Location and auth context
                userLocation={props.userLocation}
                loggedInCustomer={props.loggedInCustomer}
                loggedInProvider={props.loggedInProvider}
                // Portal navigation
                onMassageJobsClick={props.onMassageJobsClick}
                onHotelPortalClick={props.onHotelPortalClick}
                onVillaPortalClick={props.onVillaPortalClick}
                onTherapistPortalClick={props.onTherapistPortalClick}
                onMassagePlacePortalClick={props.onMassagePlacePortalClick}
                onFacialPortalClick={props.onFacialPortalClick}
                onAgentPortalClick={props.onAgentPortalClick}
                onCustomerPortalClick={props.onCustomerPortalClick}
                onAdminPortalClick={props.onAdminPortalClick}
                onTermsClick={props.onTermsClick}
                onPrivacyClick={props.onPrivacyClick}
                t={props.t}
            />
        </React.Suspense>
    );
};

/**
 * Enterprise Router Component
 * Uses modular route configuration for maintainability
 */
export const AppRouter: React.FC<AppRouterProps> = (props) => {
    const { page, language, handleLanguageSelect } = props;
    const { t, dict, loading: translationsLoading } = useTranslations();
    
    // 🚀 ENTERPRISE LOADING SYSTEM Integration
    const { loading, setPageLoading } = useLoading();

    const resolveTherapistProfile = () => {
        if (props.loggedInProvider?.type !== 'therapist') return null;
        const providerId = ((props.loggedInProvider as any).$id || props.loggedInProvider.id || '').toString();
        const match = props.therapists.find((th: any) => ((th.$id || th.id || '').toString() === providerId));
        return match || (props.loggedInProvider as any);
    };

    // 🔄 REPLACED: Legacy loading pattern with enterprise system
    React.useEffect(() => {
        // Set page loading state when isLoading prop changes
        if (page !== 'landing') {
            setPageLoading(props.isLoading);
        }
    }, [props.isLoading, page, setPageLoading]);

    /**
     * Render route with suspense boundary and proper language props
     * Includes error boundary to catch lazy loading failures
     */
    const renderRoute = (Component: React.ComponentType<any>, componentProps: any = {}, routeName?: string) => {
        // DEBUG TRACE: Log renderRoute entry
        logger.debug('[renderRoute ENTRY]', {
            routeName: routeName || page,
            hasComponent: !!Component,
            componentType: typeof Component,
            componentName: Component?.name,
            propsKeys: Object.keys(componentProps),
            timestamp: new Date().toISOString()
        });

        const ErrorFallback = () => {
            // DEBUG TRACE: Log ErrorFallback render
            logger.error('[ErrorFallback RENDERED] Route failed, displaying error UI', {
                routeName: routeName || page,
                windowError: (typeof window !== 'undefined' && (window as any).__lazyErrorMessage) || 'No error message',
                timestamp: new Date().toISOString()
            });
            
            return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Component Load Error (patched)</h2>
                    <p className="text-gray-600 mb-4">Failed to load page component</p>
                    <div className="bg-gray-100 rounded p-3 mb-4">
                        <code className="text-sm text-gray-700">Route: {routeName || page}</code>
                    </div>
                    {(typeof window !== 'undefined' && (window as any).__lazyErrorMessage) && (
                        <div className="bg-red-50 border border-red-200 text-left rounded p-3 mb-4">
                            <div className="text-sm font-semibold text-red-700">Error:</div>
                            <div className="text-xs text-red-600 break-words">{(window as any).__lazyErrorMessage}</div>
                        </div>
                    )}
                    <p className="text-sm text-gray-500 mb-4">
                        The component file may be missing or have a syntax error. Check the console for details.
                    </p>
                    <button
                        onClick={async () => {
                            try {
                                const { softRecover } = await import('./utils/softNavigation');
                                softRecover();
                            } catch {
                                window.location.reload();
                            }
                        }}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors mr-2"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={() => props.onNavigate?.('home')}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
            );
        };

        // DEBUG TRACE: Log before rendering Component
        logger.debug('[renderRoute] About to render Component', {
            routeName: routeName || page,
            componentName: Component?.name,
            willRenderComponent: true,
            timestamp: new Date().toISOString()
        });

        return (
            <LazyLoadErrorBoundary fallback={<ErrorFallback />}>
                <Suspense fallback={<EnterpriseSkeleton variant="card" className="mx-auto my-8" />}>
                    <Component 
                        {...props} 
                        {...componentProps} 
                        t={t}
                        language={language}
                        onLanguageChange={handleLanguageSelect}
                        onNavigate={props.setPage}
                    />
                </Suspense>
            </LazyLoadErrorBoundary>
        );
    };

    /**
     * Route matcher - Enterprise pattern for clean routing
     * 🚀 WRAPPED: With enterprise page loading system
     */
    logger.debug('[ROUTER] Resolving page:', { page, type: typeof page });
    
    // ⚠️ CRITICAL: LoadingGate must be completely isolated - NO WRAPPERS
    if (page === 'loading') {
        logger.debug('[ROUTER] Rendering isolated LoadingGate (no providers, no loaders)');
        return <LoadingGate />;
    }
    
    // P0 FIX: Landing page renders IMMEDIATELY, no loading wrappers
    if (page === 'landing') {
        console.log('🧭 Router resolved - rendering landing page');
        const LandingComponent = publicRoutes.landing.component;
        return (
            <LandingPageErrorBoundary>
                <LandingComponent 
                    language={props.language}
                    onLanguageChange={props.onLanguageChange}
                    onLanguageSelect={props.handleLanguageSelect}
                    onEnterApp={props.handleEnterApp}
                    handleEnterApp={props.handleEnterApp}
                    handleLanguageSelect={props.handleLanguageSelect}
                />
            </LandingPageErrorBoundary>
        );
    }
    
    return (
        <EnterpriseLoader
            variant="page"
            pageVariant={
                page.includes('therapist') ? 'therapist-dashboard' : 
                page === 'home' ? 'home' : 
                'generic'
            }
        >
            {(() => {
                switch (page) {
        // ===== PUBLIC ROUTES =====
        // Note: 'landing' case removed - already handled by early return at line 496
        
        case 'home':
            // Allow everyone to access home page
            // Note: Providers can still access their dashboards via direct navigation
            return renderRoute(publicRoutes.home.component, {
                page: page, // Pass the current page prop to HomePage
                user: props.user, // Pass user prop for chat system
                onNavigate: props.onNavigate,
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces,
                hotels: props.hotels,
                userLocation: props.userLocation,
                loggedInCustomer: props.loggedInCustomer,
                loggedInProvider: props.loggedInProvider,
                // onQuickBookWithChat: props.handleQuickBookWithChat, // ❌ REMOVED: Complex event chain
                onChatWithBusyTherapist: props.handleChatWithBusyTherapist,
                onShowRegisterPrompt: props.handleShowRegisterPromptForChat,
                onIncrementAnalytics: props.handleIncrementAnalytics,
                onSelectTherapist: props.handleSetSelectedTherapist,
                onSelectPlace: props.handleSetSelectedPlace,
                onSetUserLocation: props.handleSetUserLocation,
                selectedCity: props.selectedCity,
                onCityChange: props.setSelectedCity || props.onCityChange,
                onLoginClick: props.handleNavigateToTherapistLogin,
                t: t,
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
        
        case 'facialProviders':
        case 'facial-providers':
            return renderRoute(publicRoutes.facialProviders.component);
        
        case 'discounts':
            return renderRoute(publicRoutes.discounts.component);
        
        case 'women-reviews':
            return renderRoute(publicRoutes.womenReviews.component, {
                t: t,
                language: props.language,
                onNavigate: props.onNavigate
            });
        
        case 'advanced-search':
            return renderRoute(publicRoutes.advancedSearch.component, {
                t: t,
                language: props.language,
                onNavigate: props.onNavigate
            });
        
        case 'help-faq':
            return renderRoute(publicRoutes.helpFaq.component, {
                t: t,
                language: props.language,
                onNavigate: props.onNavigate
            });

        // � Appwrite Connection Diagnostic
        case 'appwrite-diagnostic':
            return renderRoute(AppwriteDiagnostic, {
                t: t,
                language: props.language,
                onNavigate: props.onNavigate
            });

        // �🔬 Appwrite Connection Diagnostic
        case 'diagnostic':
            return renderRoute(DiagnosticPage, {
                t: t,
                language: props.language,
                onNavigate: props.onNavigate
            });
        
        case 'top-therapists':
            return renderRoute(publicRoutes.topTherapists.component, {
                t: t,
                language: props.language,
                therapists: props.therapists,
                onNavigate: props.onNavigate,
                onSelectTherapist: props.handleSetSelectedTherapist
            });
        
        case 'special-offers':
            return renderRoute(publicRoutes.specialOffers.component, {
                t: t,
                language: props.language,
                onNavigate: props.onNavigate
            });
        
        case 'video-center':
            return renderRoute(publicRoutes.videoCenter.component, {
                t: t,
                language: props.language,
                onNavigate: props.onNavigate
            });

        case 'hotels-and-villas':
            return renderRoute(publicRoutes.hotelsVillas.component, {
                onNavigate: props.onNavigate,
                onMassageJobsClick: () => props.onNavigate('massage-jobs'),
                onVillaPortalClick: () => props.onNavigate('villa-portal'),
                onTherapistPortalClick: props.onTherapistPortalClick,
                onMassagePlacePortalClick: props.onMassagePlacePortalClick,
                onAgentPortalClick: props.onAgentPortalClick,
                onCustomerPortalClick: props.onCustomerPortalClick,
                onAdminPortalClick: () => props.handleAdminLogin(),
                onTermsClick: () => props.onNavigate('terms'),
                onPrivacyClick: () => props.onNavigate('privacy'),
                therapists: props.therapists,
                places: props.places
            });
        
        case 'hotel-villa-safe-pass':
        case 'safePass':
            return renderRoute(publicRoutes.safePass.component, {
                onNavigate: props.onNavigate,
                onTherapistPortalClick: props.onTherapistPortalClick,
                language: props.language
            });

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
                        logger.error('Unknown user type:', userType);
                    }
                },
                onBack: () => props.onNavigate('home'),
                language: props.language || 'id'
            });
            
        case 'signin':
            return renderRoute(authRoutes.signin.component, {
                mode: 'signin',
                onAuthSuccess: async (userType: string) => {
                    logger.info('Sign in successful - navigating to dashboard for:', { userType });
                    
                    // Restore user session to populate loggedInUser state
                    if (props.restoreUserSession) {
                        logger.debug('Restoring user session after sign-in...');
                        await props.restoreUserSession();
                        logger.debug('User session restored');
                    }
                    
                    // Check for PWA redirect flag
                    const pwaRedirect = sessionStorage.getItem('pwa-redirect-after-login');
                    if (pwaRedirect) {
                        logger.info('PWA redirect detected - navigating to:', { pwaRedirect });
                        sessionStorage.removeItem('pwa-redirect-after-login');
                        props.onNavigate(pwaRedirect as Page);
                        return;
                    }
                    
                    // Navigate within React app instead of external redirect
                    const dashboardPageMap: Record<string, string> = {
                        'therapist': 'therapist-status',
                        'massage-place': 'massage-place-dashboard', 
                        'facial-place': 'facial-place-dashboard'
                    };
                    
                    const dashboardPage = dashboardPageMap[userType];
                    if (dashboardPage) {
                        props.onNavigate(dashboardPage as Page);
                    } else {
                        logger.error('Unknown user type:', userType);
                        props.onNavigate('home');
                    }
                },
                onBack: () => props.onNavigate('home'),
                language: props.language || 'id'
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
                    props.onNavigate(dashboardPage as Page);
                },
                onBack: () => props.onNavigate('home'),
                language: props.language || 'id'
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
                    props.onNavigate(dashboardPage as Page);
                },
                onBack: () => props.onNavigate('home'),
                language: props.language || 'id'
            });
            
        case 'signup':
        case 'createAccount':
        case 'create-account':
            return renderRoute(authRoutes.signup.component, {
                mode: 'signup',
                onAuthSuccess: async (userType: string) => {
                    logger.info('Signup successful - navigating to dashboard for:', { userType });
                    
                    // Restore user session to populate loggedInUser state
                    if (props.restoreUserSession) {
                        logger.debug('Restoring user session after signup...');
                        await props.restoreUserSession();
                        logger.debug('User session restored');
                    }
                    
                    // Navigate within React app instead of external redirect
                    const dashboardPageMap: Record<string, string> = {
                        'therapist': 'therapist-status',
                        'massage-place': 'massage-place-dashboard', 
                        'facial-place': 'facial-place-dashboard'
                    };
                    
                    const dashboardPage = dashboardPageMap[userType];
                    if (dashboardPage) {
                        props.onNavigate(dashboardPage as Page);
                    } else {
                        logger.error('Unknown user type:', userType);
                        props.onNavigate('home');
                    }
                },
                onBack: () => props.onNavigate('home'),
                language: props.language || 'id'
            });
            
        case 'therapist-signup':
            // Redirect to unified signup with therapist role
            return renderRoute(authRoutes.signup.component, {
                mode: 'signup',
                defaultRole: 'therapist',
                onAuthSuccess: async (userType: string) => {
                    if (props.restoreUserSession) {
                        await props.restoreUserSession();
                    }
                    props.onNavigate('therapist-status');
                },
                onBack: () => props.onNavigate('home'),
                language: props.language || 'id'
            });
            
        case 'massage-place-signup':
        case 'place-signup':
            // Redirect to unified signup with massage place role
            return renderRoute(authRoutes.signup.component, {
                mode: 'signup',
                defaultRole: 'massage-place',
                onAuthSuccess: async (userType: string) => {
                    if (props.restoreUserSession) {
                        await props.restoreUserSession();
                    }
                    props.onNavigate('massage-place-dashboard');
                },
                onBack: () => props.onNavigate('home'),
                language: props.language || 'id'
            });
            
        case 'facial-place-signup':
            // Redirect to unified signup with facial place role
            return renderRoute(authRoutes.signup.component, {
                mode: 'signup',
                defaultRole: 'facial-place',
                onAuthSuccess: async (userType: string) => {
                    if (props.restoreUserSession) {
                        await props.restoreUserSession();
                    }
                    props.onNavigate('facial-place-dashboard' as Page);
                },
                onBack: () => props.onNavigate('home'),
                language: props.language || 'id'
            });
            
        case 'role-selection':
            return renderRoute(RoleSelectionPage, {
                language: props.language || 'id'
            });
            
        case 'onboarding-package':
            return renderRoute(authRoutes.onboardingPackage.component, {
                language: props.language || 'id'
            });
            
        case 'therapist-login':
        case 'therapistLogin':
            return renderRoute(authRoutes.therapistLogin.component, {
                language: props.language || 'id'
            });

        case 'therapist-login-for-jobs':
            return renderRoute(authRoutes.therapistLogin.component, {
                language: props.language || 'id',
                restoreUserSession: props.restoreUserSession,
                onNavigate: (p: string) => props.onNavigate?.(p === 'therapist' ? 'therapist-job-registration' : p),
                onSuccess: () => props.onNavigate?.('therapist-job-registration'),
            });

        case 'place-login-for-jobs':
            return renderRoute(authRoutes.placeLogin.component, {
                language: props.language || 'id',
                onSuccess: async (_placeId: string) => {
                    if (props.restoreUserSession) await props.restoreUserSession();
                    props.onNavigate?.('therapist-job-registration');
                },
                onBack: () => props.onNavigate?.('massage-jobs'),
            });

        case 'therapist-signup-for-jobs':
            return renderRoute(authRoutes.signup.component, {
                mode: 'signup',
                defaultRole: 'therapist',
                onAuthSuccess: async () => {
                    if (props.restoreUserSession) await props.restoreUserSession();
                    props.onNavigate?.('therapist-job-registration');
                },
                onBack: () => props.onNavigate?.('massage-jobs'),
                language: props.language || 'id',
            });

        case 'place-signup-for-jobs':
            return renderRoute(authRoutes.signup.component, {
                mode: 'signup',
                defaultRole: 'massage-place',
                onAuthSuccess: async () => {
                    if (props.restoreUserSession) await props.restoreUserSession();
                    props.onNavigate?.('therapist-job-registration');
                },
                onBack: () => props.onNavigate?.('massage-jobs'),
                language: props.language || 'id',
            });
        
        case 'place-login':
        case 'massagePlaceLogin':
            return renderRoute(authRoutes.placeLogin.component, {
                language: props.language || 'id'
            });

        case 'employer-login':
            return renderRoute(authRoutes.employerLogin.component, {
                onSuccess: async (employerId: string) => {
                    if (props.restoreUserSession) await props.restoreUserSession();
                    props.onNavigate?.('employer-job-posting');
                },
                onBack: () => props.onNavigate?.('massage-jobs'),
                returnTo: 'employer-job-posting',
            });
        
        case 'facial-portal':
            return renderRoute(authRoutes.facialPortal.component, {
                language: props.language || 'id'
            });
        
        case 'simple-signup':
        case 'simpleSignup': // camelCase variant used by setPage elsewhere
            return renderRoute(authRoutes.simpleSignup.component, {
                language: props.language || 'id'
            });

        // ===== PROFILE ROUTES =====
        case 'therapist-profile':
            logger.debug('[TherapistProfile] Unified profile route');
            logger.debug('  - selectedTherapist:', { therapist: props.selectedTherapist });
            logger.debug('  - URL:', { url: window.location.href });
            
            // Parse ID from hash URL (/#/therapist-profile/123) or pathname first
            let pathForId = window.location.pathname;
            const hashForId = window.location.hash;
            if (hashForId.startsWith('#/')) {
                pathForId = hashForId.substring(1); // Remove # to get /therapist-profile/123
            }
            
            // Extract the therapist ID from URL
            const pathMatch = pathForId.match(/\/(?:therapist-profile|profile\/therapist)\/([a-z0-9-]+)/);
            let profileTherapistId = null;
            
            if (pathMatch) {
                const urlId = pathMatch[1];
                const idWithoutName = urlId.split('-')[0]; // Get ID before first hyphen
                profileTherapistId = idWithoutName;
                logger.debug('  - Extracted profile therapist ID:', { urlId, profileTherapistId });
            } else if (props.selectedTherapist) {
                profileTherapistId = (props.selectedTherapist.$id || props.selectedTherapist.id || '').toString();
                logger.debug('  - Using selectedTherapist ID:', { profileTherapistId });
            }
            
            // 🔒 SMART SAFETY GUARD: Allow therapists to view profiles (including their own) but prevent inappropriate booking
            if (props.user && (props.user.role === 'therapist' || props.user.userType === 'therapist' || props.user.type === 'therapist')) {
                const currentTherapistId = (props.user.$id || props.user.id || props.user.therapistId || '').toString();
                
                if (profileTherapistId && currentTherapistId && profileTherapistId === currentTherapistId) {
                    // Therapist viewing their own profile - allow but show special message
                    logger.debug('✅ PROFILE ACCESS: Therapist viewing own profile - allowing with dashboard suggestion');
                    props.showToast?.('💡 Tip: Use your dashboard to manage your profile', 'info');
                } else if (profileTherapistId) {
                    // Therapist viewing another therapist's profile - allow for reference/learning
                    logger.debug('✅ PROFILE ACCESS: Therapist viewing another therapist profile - allowing for reference');
                } else {
                    // No clear profile ID - redirect to dashboard as safety measure
                    logger.warn('⚠️ REDIRECT PREVENTION: Unclear profile access by therapist - redirecting to dashboard');
                    props.showToast?.('🔄 Redirecting to your dashboard...', 'info');
                    setTimeout(() => {
                        props.setPage?.('therapist-dashboard');
                    }, 500);
                    return <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                            <p className="text-gray-600">Redirecting to your dashboard...</p>
                        </div>
                    </div>;
                }
            }
            
            // UPDATED: Support both URL patterns:
            // 1. /therapist-profile/[id] (hash router)
            // 2. /profile/therapist/[id] (SEO-friendly URLs)
            if (pathMatch) {
                const urlId = pathMatch[1];
                logger.debug('  - Extracted ID:', { urlId });
                
                // Extract actual ID (may include name, e.g., "692467a3001f6f05aaa1-budi")
                // Try exact match first, then match by ID prefix
                const idWithoutName = urlId.split('-')[0]; // Get ID before first hyphen
                
                // Try to find in memory first (fast path)
                const foundTherapist = props.therapists.find((t: any) => {
                    const therapistId = (t.$id || t.id || '').toString();
                    return therapistId === urlId || therapistId === idWithoutName || therapistId.startsWith(urlId);
                });
                
                if (foundTherapist) {
                    logger.debug('  Found in memory:', { name: foundTherapist.name });
                    return renderRoute(profileRoutes.therapistProfile.component, {
                        therapist: foundTherapist,
                        onBack: () => props.setPage?.('home'),
                        onLanguageChange: props.onLanguageChange,
                        language: props.language,
                        selectedCity: props.selectedCity,
                        onCityChange: props.onCityChange,
                        therapists: props.therapists,
                        places: props.places,
                        onNavigate: props.onNavigate,
                        // Chat/booking handlers - SIMPLIFIED: Direct PersistentChatProvider integration  
                        // onQuickBookWithChat: props.handleQuickBookWithChat, // ❌ REMOVED: Complex event chain
                        onChatWithBusyTherapist: props.handleChatWithBusyTherapist,
                        onShowRegisterPrompt: props.handleShowRegisterPromptForChat,
                        onIncrementAnalytics: props.handleIncrementAnalytics,
                        // Location and auth context
                        userLocation: props.userLocation,
                        loggedInCustomer: props.loggedInCustomer,
                        loggedInProvider: props.loggedInProvider,
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
                        t: props.t
                    });
                } else {
                    logger.warn('  Not in memory, attempting Appwrite fetch...', {
                        searchedId: urlId,
                        idPrefix: urlId.split('-')[0],
                        availableIds: props.therapists.slice(0, 5).map((t: any) => ({
                            id: t.$id || t.id,
                            name: t.name
                        })),
                        totalTherapists: props.therapists.length
                    });
                    // Fallback: Render a wrapper that fetches from Appwrite
                    return <TherapistProfileWithFetch 
                        therapistId={urlId} 
                        {...props}
                    />;
                }
            }
            
            // Fall back to props.selectedTherapist (if available)
            if (props.selectedTherapist) {
                return renderRoute(profileRoutes.therapistProfile.component, {
                    therapist: props.selectedTherapist,
                    onBack: () => props.setPage?.('home'), // Navigate back to home
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
                    onNavigate: props.onNavigate,
                    // Chat/booking handlers - SIMPLIFIED: Direct PersistentChatProvider integration
                    // onQuickBookWithChat: props.handleQuickBookWithChat, // ❌ REMOVED: Complex event chain
                    onChatWithBusyTherapist: props.handleChatWithBusyTherapist,
                    onShowRegisterPrompt: props.handleShowRegisterPromptForChat,
                    onIncrementAnalytics: props.handleIncrementAnalytics,
                    // Location and auth context
                    userLocation: props.userLocation,
                    loggedInCustomer: props.loggedInCustomer,
                    loggedInProvider: props.loggedInProvider,
                    t: props.t
                });
            }
            
            // No therapist data available - show error page
            logger.error('[TherapistProfile] No therapist data available');
            logger.error('  - selectedTherapist:', props.selectedTherapist);
            logger.error('  - URL path:', window.location.pathname);
            logger.error('  - URL hash:', window.location.hash);
            logger.error('  - Route issue: No therapist ID in URL or selectedTherapist missing');
            
            return (
                <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Component Load Error (patched)</h2>
                        <p className="text-gray-600 mb-2"><strong>Route:</strong> therapist-profile</p>
                        <p className="text-gray-600 mb-4">The component file may be missing or have a syntax error. Check the console for details.</p>
                        <div className="text-xs text-gray-500 mb-4 text-left bg-gray-50 p-3 rounded">
                            <strong>Debug Info:</strong><br/>
                            URL: {window.location.href}<br/>
                            Issue: Missing therapist ID in URL or no selected therapist
                        </div>
                        <button
                            onClick={() => props.onNavigate?.('home')}
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            );
        
        // NEW: Simple share routes
        case 'share-therapist':
            logger.debug('[ShareTherapist] Rendering new share page');
            logger.debug('  - Therapists available:', { count: props.therapists?.length || 0 });
            logger.debug('  - URL:', { url: window.location.href });
            return renderRoute(profileRoutes.shareTherapist.component);
        
        case 'share-place':
            logger.debug('[SharePlace] Rendering share page');
            return renderRoute(profileRoutes.sharePlace.component);
        
        case 'share-facial':
            logger.debug('[ShareFacial] Rendering share page');
            return renderRoute(profileRoutes.shareFacial.component);
        
        // 🔒 PROTECTED ROUTE - PRODUCTION CRITICAL 🔒
        // LEGACY: Keep old shared-therapist-profile working - Use new SharedTherapistProfile
        // ⚠️ DO NOT MODIFY - This route handles ALL /therapist-profile/:id URLs
        // ⚠️ Used by thousands of shared links in production
        case 'shared-therapist-profile':
            logger.debug('[ROUTER] Route matched: shared-therapist-profile');
            logger.debug('Current path:', { path: window.location.pathname });
            logger.debug('Full URL:', { url: window.location.href });
            logger.debug('Route name:', { page });
            logger.debug('Has loggedInCustomer:', { hasCustomer: !!props.loggedInCustomer });
            logger.debug('Has userLocation:', { hasLocation: !!props.userLocation });
            logger.debug('Language:', { language: props.language });
            logger.debug('[ROUTER] Rendering SharedTherapistProfile component...');
            
            // Restore full shared profile UI (direct import, non-lazy)
            return (
                <SharedTherapistProfileDirect
                    {...props}
                    userLocation={props.userLocation}
                    loggedInCustomer={props.loggedInCustomer}
                    // handleQuickBookWithChat={props.handleQuickBookWithChat} // ❌ REMOVED: Complex event chain
                    onNavigate={props.onNavigate}
                    language={props.language as 'id' | 'en' | 'gb'}
                />
            );
        
        case 'massage-place-profile':
            logger.debug('[MassagePlaceProfile] Rendering massage place profile page');
            logger.debug('  - selected Place:', { place: props.selectedPlace });
            logger.debug('  - URL path:', { path: window.location.pathname });
            
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
            logger.debug('[FacialPlaceProfile] Rendering facial place profile page');
            logger.debug('  - selectedPlace:', { place: props.selectedPlace });
            
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
            logger.error('[ROUTE DEBUG] therapistStatus case matched - THIS SHOULD NOT HAPPEN FOR therapist-status');
            const therapistProfile = resolveTherapistProfile();
            return renderRoute(TherapistStatusPage, {
                therapist: therapistProfile,
                onStatusChange: props.handleTherapistStatusChange,
                onNavigateToDashboard: () => props.setPage('therapistDashboard'),
                onNavigateToHome: () => props.setPage('therapist-dashboard') // ✅ STAY IN THERAPIST SYSTEM
            });
        }

        // ===== LEGAL ROUTES =====
        case 'privacy-policy':
        case 'privacy':
            return renderRoute(legalRoutes.privacy.component, {
                onBack: () => {
                    // Smart back navigation based on user role
                    if (props.user && (props.user.role === 'therapist' || props.user.userType === 'therapist' || props.user.type === 'therapist')) {
                        props.onNavigate?.('therapist-dashboard');
                    } else {
                        props.onNavigate?.('home');
                    }
                },
                t: dict?.privacyPolicy
            });
        
        case 'cookies-policy':
            return renderRoute(legalRoutes.cookies.component);
        
        case 'service-terms':
        case 'serviceTerms':
            return renderRoute(legalRoutes.serviceTerms.component, {
                onBack: () => {
                    // Smart back navigation based on user role  
                    if (props.user && (props.user.role === 'therapist' || props.user.userType === 'therapist' || props.user.type === 'therapist')) {
                        props.onNavigate?.('therapist-dashboard');
                    } else {
                        props.onNavigate?.('home');
                    }
                },
                t: dict?.serviceTerms,
                contactNumber: '+62 812-3456-7890'
            });
        
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
        
        case 'employer-job-posting': {
            const isEmployer = props.user && (props.user as any).type === 'employer';
            if (!isEmployer) {
                return renderRoute(authRoutes.employerLogin.component, {
                    onSuccess: async (employerId: string) => {
                        if (props.restoreUserSession) await props.restoreUserSession();
                        props.onNavigate?.('employer-job-posting');
                    },
                    onBack: () => props.onNavigate?.('massage-jobs'),
                    returnTo: 'employer-job-posting',
                });
            }
            return renderRoute(EmployerJobPostingPage, {
                onNavigateToPayment: (jobId: string) => {
                    props.setSelectedJobId?.(jobId);
                    props.onNavigate?.('job-posting-payment');
                },
                onNavigate: props.onNavigate,
                onMassageJobsClick: () => props.onNavigate?.('massage-jobs'),
            });
        }
        
        case 'indastreet-partners':
            return renderRoute(IndastreetPartnersPage);
        
        case 'website-management':
            return renderRoute(WebsiteManagementPage);
        
        case 'guest-profile':
            return renderRoute(GuestProfilePage);
        
        case 'qr-code':
            return renderRoute(QRCodePage);
        
        case 'notifications':
            // Redirect therapists to proper dashboard notifications page
            if (props.user && (props.user as any).type === 'therapist') {
                logger.debug('[ROUTE] notifications → redirecting therapist to therapist-notifications');
                props.setPage('therapist-notifications');
                return renderRoute(therapistRoutes.notifications.component, {
                    therapist: props.user,
                    onBack: () => props.onNavigate?.('therapist-status'),
                    onNavigate: props.onNavigate,
                    language: props.language
                });
            }
            return renderRoute(NotificationsPage);
        
        case 'chat-room':
            // Chat room is handled by App.tsx activeChat state
            // Redirect to home - chat will open via openChat event
            logger.debug('[ROUTE] chat-room accessed - redirecting to home');
            props.setPage('home');
            return renderRoute(publicRoutes.home.component);
        
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
            return renderRoute(JobPostingPaymentPage, {
                jobId: props.selectedJobId || '',
                onBack: () => props.onNavigate?.('massage-jobs'),
                onNavigate: props.onNavigate,
            });
        
        case 'apply-for-job':
            return renderRoute(ApplyForJobPage, {
                jobId: props.selectedJobId || '',
                onBack: () => props.onNavigate?.('massage-jobs'),
                onNavigate: props.onNavigate,
            });
        
        case 'browse-jobs':
        case 'browseJobs':
            return renderRoute(BrowseJobsPage);
        
        case 'massage-jobs':
        case 'massageJobs':
            return renderRoute(MassageJobsPage, {
                onBack: () => props.setPage('home'),
                onPostJob: () => props.onNavigate?.('employer-job-posting'),
                onNavigateToPayment: (jobId?: string) => {
                    if (jobId) {
                        (props as any).setSelectedJobId?.(jobId);
                        props.onNavigate?.('job-posting-payment');
                    } else {
                        props.onNavigate?.('job-unlock-payment');
                    }
                },
                onApplyForJob: (jobId: string) => {
                    (props as any).setSelectedJobId?.(jobId);
                    props.onNavigate?.('apply-for-job');
                },
                onCreateTherapistProfile: () => props.onNavigate?.('therapist-job-registration'),
                onNavigate: props.onNavigate,
            });
        
        case 'partnership-application':
            return renderRoute(PartnershipApplicationPage);
        
        case 'therapist-job-registration': {
            const isServicePersonnel = props.user && (
                (props.user as any).type === 'therapist' ||
                (props.user as any).type === 'place' ||
                (props.loggedInProvider as any)?.type === 'therapist' ||
                (props.loggedInProvider as any)?.type === 'place'
            );
            if (!isServicePersonnel) {
                return renderRoute(authRoutes.servicePersonnelLogin.component, {
                    onTherapistLogin: () => props.onNavigate?.('therapist-login-for-jobs'),
                    onPlaceLogin: () => props.onNavigate?.('place-login-for-jobs'),
                    onTherapistSignup: () => props.onNavigate?.('therapist-signup-for-jobs'),
                    onPlaceSignup: () => props.onNavigate?.('place-signup-for-jobs'),
                    onBack: () => props.onNavigate?.('massage-jobs'),
                });
            }
            return renderRoute(TherapistJobRegistrationPage, {
                onBack: () => props.onNavigate?.('massage-jobs'),
                onSuccess: () => props.onNavigate?.('massage-jobs'),
                onNavigateToPayment: (listingId: string) => {
                    (props as any).setSelectedJobId?.(listingId);
                    props.onNavigate?.('therapist-listing-payment');
                },
                onNavigate: props.onNavigate,
            });
        }
        
        case 'reviews':
            return renderRoute(ReviewsPage, {
                onBack: () => props.setPage('home')
            });
        
        case 'job-unlock-payment':
            return renderRoute(JobUnlockPaymentPage);

        case 'therapist-listing-payment':
            return renderRoute(TherapistListingPaymentPage, {
                listingId: props.selectedJobId || '',
                onBack: () => props.onNavigate?.('massage-jobs'),
                onNavigate: props.onNavigate,
            });
        
        case 'customer-reviews':
            return renderRoute(CustomerReviewsPage, {
                onBack: () => props.setPage('home')
            });
        
        case 'customer-support':
            return renderRoute(CustomerSupportPage);
            
        // ===== FLOATING BUTTON ROUTES =====
        case 'chat-support':
            return renderRoute(CustomerSupportPage, {
                defaultTab: 'chat',
                source: 'floating-button'
            });
            
        case 'booking-quick':
            return renderRoute(BookingPage, {
                quickMode: true,
                source: 'floating-button'
            });
            
        case 'emergency-contact':
            return renderRoute(CustomerSupportPage, {
                emergencyMode: true,
                source: 'floating-button'
            });
            
        case 'help':
            return renderRoute(publicRoutes.faq.component, {
                source: 'floating-button'
            });
            
        case 'feedback':
            return renderRoute(CustomerSupportPage, {
                defaultTab: 'feedback',
                source: 'floating-button'
            });
        
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

        // ===== PROFILE / UPLOAD PROFILE (same as dashboard for therapist) =====
        case 'profile':
            if ((props.loggedInProvider as any)?.type === 'therapist' || (props.user as any)?.therapistId) {
                return renderRoute(therapistRoutes.dashboard.component, {
                    therapist: props.loggedInProvider || props.user,
                    onLogout: props.handleLogout,
                    onNavigate: props.onNavigate,
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
                    onNavigateToSchedule: () => props.onNavigate?.('therapist-schedule'),
                    onNavigateToMenu: () => props.onNavigate?.('therapist-menu'),
                    onNavigateHome: () => props.onNavigate?.('home'),
                    language: props.language
                });
            }
            // fall through to dashboard when not therapist

        // ===== GENERIC DASHBOARD ROUTE - Redirects to appropriate dashboard =====
        case 'dashboard':
            // Redirect to appropriate dashboard based on logged-in user type
            const dashboardUser = props.user || props.loggedInProvider;
            const isTherapist = dashboardUser && (
                (dashboardUser as any).userType === 'therapist' ||
                (dashboardUser as any).role === 'therapist' ||
                (dashboardUser as any).therapistId ||
                (props.loggedInProvider as any)?.type === 'therapist'
            );
            if (dashboardUser && isTherapist) {
                return renderRoute(therapistRoutes.dashboard.component, {
                        therapist: props.loggedInProvider || props.user,
                        onLogout: props.handleLogout,
                        onNavigate: props.onNavigate,
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
                        onNavigateToSchedule: () => props.onNavigate?.('therapist-schedule'),
                        onNavigateToMenu: () => props.onNavigate?.('therapist-menu'),
                        onNavigateHome: () => props.onNavigate?.('home'),
                        language: props.language
                    });
                }
            if (dashboardUser) {
                const userType = (dashboardUser as any).userType || (dashboardUser as any).role;
                if (userType === 'massage-place' || userType === 'massage_place') {
                    return renderRoute(placeRoutes.dashboard.component, {
                        place: dashboardUser,
                        onBack: () => props.onNavigate?.('home'),
                        language: props.language
                    });
                } else if (userType === 'facial-place' || userType === 'facial_place') {
                    return renderRoute(facialRoutes.dashboard.component, {
                        place: dashboardUser,
                        onBack: () => props.onNavigate?.('home'),
                        language: props.language
                    });
                }
            }
            // No user logged in - show home page
            return renderRoute(publicRoutes.home.component, {
                page: page, // Pass the current page prop to HomePage
                onNavigate: props.onNavigate,
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces,
                hotels: props.hotels,
                userLocation: props.userLocation,
                loggedInCustomer: props.loggedInCustomer,
                loggedInProvider: props.loggedInProvider,
                onQuickBookWithChat: props.handleQuickBookWithChat,
                onChatWithBusyTherapist: props.handleChatWithBusyTherapist,
                onShowRegisterPrompt: props.handleShowRegisterPromptForChat,
                onIncrementAnalytics: props.handleIncrementAnalytics,
                selectedCity: props.selectedCity,
                onCityChange: props.setSelectedCity || props.onCityChange,
                t: t,
                language: props.language
            });

        // ===== THERAPIST DASHBOARD ROUTES =====
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'therapist':
        case 'therapistDashboard':
        case 'therapist-dashboard':
            logger.debug('[SWITCH CASE] therapist-dashboard MATCHED - REDIRECTING TO STATUS');
            logger.debug('[FIRST PAGE] Showing Online Status as first page');
            logger.debug('[DEBUG] therapist data:', props.loggedInProvider);
            // Redirect to status page instead of dashboard (First page after login)
            return renderRoute(therapistRoutes.status.component, {
                therapist: props.loggedInProvider || props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'status':
        case 'therapist-status':
            logger.debug('[ROUTE DEBUG] therapist-status case matched!');
            logger.debug('[FIRST PAGE] Therapist Online Status Page');
            logger.debug('[DEBUG] therapist data:', props.loggedInProvider);
            logger.debug('[ROUTE RESOLVE] therapist-status → TherapistOnlineStatus');
            return renderRoute(therapistRoutes.status.component, {
                therapist: props.loggedInProvider || props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'bookings':
        case 'therapist-bookings':
            logger.debug('[ROUTE RESOLVE] therapist-bookings → TherapistBookings');
            logger.debug('[ROUTER OK] therapist-bookings', { route: '/dashboard/therapist/bookings' });
            return renderRoute(therapistRoutes.bookings.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            }, 'therapist-bookings');
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'earnings':
        case 'therapist-earnings':
            logger.debug('[ROUTE RESOLVE] therapist-earnings → TherapistEarnings');
            return renderRoute(therapistRoutes.earnings.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'chat':
        case 'therapist-chat':
            logger.debug('[ROUTE RESOLVE] therapist-chat → TherapistChat');
            return renderRoute(therapistRoutes.chat.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'therapist-notifications':
            logger.debug('[ROUTE RESOLVE] therapist-notifications → TherapistNotifications');
            return renderRoute(therapistRoutes.notifications.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'legal':
        case 'therapist-legal':
            logger.debug('[ROUTE RESOLVE] therapist-legal → TherapistLegal');
            return renderRoute(therapistRoutes.legal.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'therapist-how-it-works':
            logger.debug('[ROUTE RESOLVE] therapist-how-it-works → HowItWorksPage');
            return renderRoute(therapistRoutes.howItWorks.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'calendar':
        case 'therapist-calendar':
            logger.debug('[ROUTE RESOLVE] therapist-calendar → TherapistCalendar');
            return renderRoute(therapistRoutes.calendar.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'payment':
        case 'therapist-payment':
            logger.debug('[ROUTE RESOLVE] therapist-payment → TherapistPaymentInfo');
            return renderRoute(therapistRoutes.payment.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'payment-status':
        case 'therapist-payment-status':
            logger.debug('[ROUTE RESOLVE] payment-status/therapist-payment-status → TherapistPaymentStatus');
            const paymentStatusComponent = renderRoute(therapistRoutes.paymentStatus.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
            logger.debug('[ROUTER OK] payment-status component bound successfully');
            return paymentStatusComponent;
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'custom-menu':
        case 'therapist-menu':
            logger.debug('[ROUTE RESOLVE] custom-menu/therapist-menu → TherapistMenu');
            const menuComponent = renderRoute(therapistRoutes.menu.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
            logger.debug('[ROUTER OK] therapist-menu component bound successfully');
            return menuComponent;
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'commission-payment':
        case 'therapist-commission':
            logger.debug('[ROUTE RESOLVE] therapist-commission → CommissionPayment');
            return renderRoute(therapistRoutes.commission.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'send-discount':
            logger.debug('[ROUTE RESOLVE] send-discount → SendDiscountPage');
            return renderRoute(therapistRoutes.sendDiscount.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE (Customers List with booking history)
        case 'customers':
        case 'therapist-customers':
            logger.debug('[ROUTE RESOLVE] customers → TherapistCustomersPage');
            return renderRoute(therapistRoutes.customers.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE (Guide page for getting more customers)
        case 'more-customers':
            logger.debug('[ROUTE RESOLVE] more-customers → MoreCustomersPage');
            return renderRoute(therapistRoutes.moreCustomers.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE (Dedicated Analytics Page)
        case 'analytics':
        case 'therapist-analytics':
            logger.debug('[ROUTE RESOLVE] analytics → TherapistAnalyticsPage');
            return renderRoute(therapistRoutes.analytics.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE (Banner Discount / Voucher System)
        case 'banner-discount':
        case 'therapist-banner-discount':
            logger.debug('[ROUTE RESOLVE] banner-discount → BannerDiscountPage');
            return renderRoute(therapistRoutes.bannerDiscount.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-customers' as Page),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE (Therapist-specific)
        case 'therapist-hotel-villa-safe-pass':
            logger.debug('[ROUTE RESOLVE] therapist-hotel-villa-safe-pass → TherapistHotelVillaSafePassPage');
            return renderRoute(therapistRoutes.hotelVillaSafePass.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                language: props.language || 'id'
            });
        
        // SafePass Application (New System)
        case 'therapist-safepass-apply':
            logger.debug('[ROUTE RESOLVE] therapist-safepass-apply → TherapistSafePassWrapper');
            return renderRoute(therapistRoutes.safePassApplication.component, {
                onBack: () => props.onNavigate?.('therapist-dashboard')
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'schedule':
        case 'therapist-schedule':
            logger.debug('[ROUTE RESOLVE] therapist-schedule → TherapistSchedule');
            logger.debug('[ROUTER OK] therapist-schedule', { route: '/dashboard/therapist/schedule' });
            return renderRoute(therapistRoutes.schedule.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            }, 'therapist-schedule');
        
        case 'therapist-package-terms':
            return renderRoute(therapistRoutes.packageTerms.component, {
                therapist: props.user,
                language: props.language || 'id'
            });

        // ===== OTHER DASHBOARD ROUTES =====
        
        case 'placeDashboard':
        case 'place-dashboard':
            return renderRoute(authRoutes.placeLogin.component, {
                redirectToDashboard: true
            });
        
        // Place SafePass Application
        case 'place-safepass-apply':
            logger.debug('[ROUTE RESOLVE] place-safepass-apply → PlaceSafePassWrapper');
            return renderRoute(placeRoutes.safePassApplication.component, {
                onBack: () => props.onNavigate?.('place-dashboard')
            });

        // ===== ADMIN ROUTES (PROTECTED BY ROLE-BASED ACCESS CONTROL) =====
        case 'admin':
        case 'adminDashboard': // camelCase variant
        case 'admin-dashboard':
        case 'agentPortal': // drawer "Admin" / agent portal → same as admin dashboard
        case 'agent-portal':
            return renderRoute(adminRoutes.dashboard.component, {
                onNavigateHome: () => props.onNavigate('home')
            });
            
        case 'admin-therapists':
            return renderRoute(adminRoutes.therapists.component, {
                onNavigateHome: () => props.onNavigate('home')
            });
            
        case 'admin-bookings':
            return renderRoute(adminRoutes.bookings.component, {
                onNavigateHome: () => props.onNavigate('home')
            });
            
        case 'admin-chat':
            return renderRoute(adminRoutes.chat.component, {
                onNavigateHome: () => props.onNavigate('home')
            });
            
        case 'admin-revenue':
            return renderRoute(adminRoutes.revenue.component, {
                onNavigateHome: () => props.onNavigate('home')
            });
            
        case 'admin-commissions':
            return renderRoute(adminRoutes.commissions.component, {
                onNavigateHome: () => props.onNavigate('home')
            });
            
        case 'admin-ktp':
            return renderRoute(adminRoutes.ktpVerification.component, {
                onNavigateHome: () => props.onNavigate('home')
            });
            
        case 'admin-achievements':
            return renderRoute(adminRoutes.achievements.component, {
                onNavigateHome: () => props.onNavigate('home')
            });
            
        case 'admin-system-health':
            return renderRoute(adminRoutes.systemHealth.component, {
                onNavigateHome: () => props.onNavigate('home')
            });
            
        case 'admin-settings':
            return renderRoute(adminRoutes.settings.component, {
                onNavigateHome: () => props.onNavigate('home')
            });
        
        case 'admin-safepass':
            return renderRoute(adminRoutes.safePass.component, {
                onNavigateHome: () => props.onNavigate('home')
            });
        
        case 'admin-live-listings':
            return renderRoute(adminRoutes.liveListings.component, {
                therapists: props.therapists || [],
                loggedInAgent: props.loggedInAgent,
                onNavigate: props.onNavigate
            });

        // ===== FALLBACK =====
        // Auto-redirect unknown routes to home so stray setPage('typo') never leaves user on a dead screen
        default: {
            logger.error('[ROUTE RESOLVE] Unknown route, redirecting to home:', page);
            const UnknownRouteRedirect: React.FC<{ onNavigate?: (p: Page) => void }> = ({ onNavigate }) => {
                useEffect(() => {
                    onNavigate?.('home');
                }, [onNavigate]);
                return (
                    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center p-4">
                        <p className="text-gray-600">Redirecting to home…</p>
                    </div>
                );
            };
            return <UnknownRouteRedirect onNavigate={props.onNavigate} />;
        }
                }
            })()}
        </EnterpriseLoader>
    );
};

export default AppRouter;






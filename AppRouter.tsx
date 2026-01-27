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
import { useTranslations } from './src/lib/useTranslations';
import { useLanguage } from './src/hooks/useLanguage';
import { logger } from './src/utils/logger';
import type { Page, Language, LoggedInProvider } from './src/types/pageTypes';
import type { User, Place, Therapist, UserLocation, Booking, Notification, Agent, AdminMessage } from './src/types';
import { BookingStatus } from './src/types';
import LoadingSpinner from './src/components/LoadingSpinner';
import { databases, APPWRITE_DATABASE_ID as DATABASE_ID, COLLECTIONS } from './src/lib/appwrite';

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
    console.error('🚨 [LazyLoadErrorBoundary] ERROR CAUGHT:');
    console.error('📛 Error Message:', error?.message);
    console.error('📛 Error Name:', error?.name);
    console.error('📛 Error Stack:', error?.stack);
    console.error('📛 Component Stack:', errorInfo?.componentStack);
    console.error('📛 Full Error Object:', error);
    console.error('📛 Full ErrorInfo Object:', errorInfo);
    
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

// Route configurations
import { publicRoutes } from './src/router/routes/publicRoutes';
import { authRoutes } from './src/router/routes/authRoutes';
import { profileRoutes } from './src/router/routes/profileRoutes';
import { legalRoutes } from './src/router/routes/legalRoutes';
import { blogRoutes } from './src/router/routes/blogRoutes';
import { therapistRoutes } from './src/router/routes/therapistRoutes';
import { adminRoutes } from './src/router/routes/adminRoutes';
import { placeRoutes } from './src/router/routes/placeRoutes';
import { facialRoutes } from './src/router/routes/facialRoutes';

// Specialized pages not in route modules
const CreateAccountPage = React.lazy(() => import('./src/pages/auth/CreateAccountPage'));
const ConfirmTherapistsPage = React.lazy(() => import('./src/pages/ConfirmTherapistsPage'));
const EmployerJobPostingPage = React.lazy(() => import('./src/pages/EmployerJobPostingPage'));
const IndastreetPartnersPage = React.lazy(() => import('./src/pages/IndastreetPartnersPage'));
const WebsiteManagementPage = React.lazy(() => import('./src/pages/WebsiteManagementPage'));
const GuestProfilePage = React.lazy(() => import('./src/pages/GuestProfilePage'));
const QRCodePage = React.lazy(() => import('./src/pages/QRCodePage'));
const NotificationsPage = React.lazy(() => import('./src/pages/NotificationsPage'));
const BookingPage = React.lazy(() => import('./src/pages/BookingPage'));
const MembershipPage = React.lazy(() => import('./src/pages/MembershipPage'));
const AcceptBookingPage = React.lazy(() => import('./src/pages/AcceptBookingPage'));
const DeclineBookingPage = React.lazy(() => import('./src/pages/DeclineBookingPage'));
const LeadAcceptPage = React.lazy(() => import('./src/pages/LeadAcceptPage'));
const LeadDeclinePage = React.lazy(() => import('./src/pages/LeadDeclinePage'));
const JobPostingPaymentPage = React.lazy(() => import('./src/pages/JobPostingPaymentPage'));
const BrowseJobsPage = React.lazy(() => import('./src/pages/BrowseJobsPage'));
const MassageJobsPage = React.lazy(() => import('./src/pages/MassageJobsPage'));
const PartnershipApplicationPage = React.lazy(() => import('./src/pages/PartnershipApplicationPage'));
const TherapistJobRegistrationPage = React.lazy(() => import('./src/pages/TherapistJobRegistrationPage'));
const ReviewsPage = React.lazy(() => import('./src/pages/ReviewsPage'));
const JobUnlockPaymentPage = React.lazy(() => import('./src/pages/JobUnlockPaymentPage'));
const TherapistStatusPage = React.lazy(() => import('./src/pages/TherapistStatusPage'));
const CustomerReviewsPage = React.lazy(() => import('./src/pages/CustomerReviewsPage'));
const RoleSelectionPage = React.lazy(() => import('./src/pages/auth/RoleSelectionPage'));
const CustomerSupportPage = React.lazy(() => import('./src/pages/CustomerSupportPage'));
const PlaceDiscountBadgePage = React.lazy(() => import('./src/pages/PlaceDiscountBadgePage'));
const VerifiedProBadgePage = React.lazy(() => import('./src/pages/VerifiedProBadgePage'));
const MobileTherapistStandardsPage = React.lazy(() => import('./src/pages/MobileTherapistStandardsPage'));
const GuestAlertsPage = React.lazy(() => import('./src/pages/GuestAlertsPage'));
const PartnerSettingsPage = React.lazy(() => import('./src/pages/PartnerSettingsPage'));
const AdminLoginPage = React.lazy(() => import('./src/pages/AdminLoginPage'));
const CareerOpportunitiesPage = React.lazy(() => import('./src/pages/CareerOpportunitiesPage'));
const TherapistInfoPage = React.lazy(() => import('./src/pages/TherapistInfoPage'));
const EmployerInfoPage = React.lazy(() => import('./src/pages/EmployerInfoPage'));
const PaymentInfoPage = React.lazy(() => import('./src/pages/PaymentInfoPage'));
const MobileTermsAndConditionsPage = React.lazy(() => import('./src/pages/MobileTermsAndConditionsPage'));
const TherapistTermsAndConditions = React.lazy(() => import('./src/pages/TherapistTermsAndConditions'));

// Blog posts
const BaliSpaIndustryTrends2025Page = React.lazy(() => import('./src/pages/blog/BaliSpaIndustryTrends2025Page'));
const Top10MassageTechniquesPage = React.lazy(() => import('./src/pages/blog/Top10MassageTechniquesPage'));
const MassageCareerIndonesiaPage = React.lazy(() => import('./src/pages/blog/MassageCareerIndonesiaPage'));
const BenefitsRegularMassageTherapyPage = React.lazy(() => import('./src/pages/blog/BenefitsRegularMassageTherapyPage'));
const HiringMassageTherapistsGuidePage = React.lazy(() => import('./src/pages/blog/HiringMassageTherapistsGuidePage'));
const TraditionalBalineseMassagePage = React.lazy(() => import('./src/pages/blog/TraditionalBalineseMassagePage'));
const SpaTourismIndonesiaPage = React.lazy(() => import('./src/pages/blog/SpaTourismIndonesiaPage'));
const AromatherapyMassageOilsPage = React.lazy(() => import('./src/pages/blog/AromatherapyMassageOilsPage'));
const PricingGuideMassageTherapistsPage = React.lazy(() => import('./src/pages/blog/PricingGuideMassageTherapistsPage'));
const DeepTissueVsSwedishMassagePage = React.lazy(() => import('./src/pages/blog/DeepTissueVsSwedishMassagePage'));
const OnlinePresenceMassageTherapistPage = React.lazy(() => import('./src/pages/blog/OnlinePresenceMassageTherapistPage'));
const WellnessTourismUbudPage = React.lazy(() => import('./src/pages/blog/WellnessTourismUbudPage'));

// Shared profile components
const SharedTherapistProfileLazy = React.lazy(() => import('./src/features/shared-profiles/SharedTherapistProfile'));
// Import full shared profile directly (non-lazy) to guarantee rendering
import SharedTherapistProfileDirect from './src/features/shared-profiles/SharedTherapistProfile';

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
 */
const TherapistProfileWithFetch: React.FC<any> = ({ therapistId, ...props }) => {
    const [therapist, setTherapist] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Official images constants (same as SharedTherapistProfile)
    const OFFICIAL_HERO_IMAGE = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258';
    const OFFICIAL_MAIN_IMAGE = 'https://ik.imagekit.io/7grri5v7d/garden%20forest.png?updatedAt=1761334454082';

    React.useEffect(() => {
        const fetchTherapist = async () => {
            try {
                console.log('🔍 [FETCH] Loading therapist from Appwrite:', therapistId);
                const fetchedTherapist = await databases.getDocument(
                    DATABASE_ID, 
                    COLLECTIONS.THERAPISTS, 
                    therapistId
                );
                
                // Apply official images
                const therapistWithImages = {
                    ...fetchedTherapist,
                    heroImageUrl: OFFICIAL_HERO_IMAGE,
                    mainImage: OFFICIAL_MAIN_IMAGE
                };
                
                console.log('✅ [FETCH] Therapist loaded:', therapistWithImages.name);
                setTherapist(therapistWithImages);
                setLoading(false);
            } catch (err: any) {
                console.error('❌ [FETCH] Failed to load therapist:', err);
                setError(err.message || 'Failed to load profile');
                setLoading(false);
            }
        };

        fetchTherapist();
    }, [therapistId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !therapist) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
        <React.Suspense fallback={<LoadingSpinner />}>
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
     * Includes error boundary to catch lazy loading failures
     */
    const renderRoute = (Component: React.ComponentType<any>, componentProps: any = {}, routeName?: string) => {
        // DEBUG TRACE: Log renderRoute entry
        console.log('🔵 [renderRoute ENTRY]', {
            routeName: routeName || page,
            hasComponent: !!Component,
            componentType: typeof Component,
            componentName: Component?.name,
            propsKeys: Object.keys(componentProps),
            timestamp: new Date().toISOString()
        });

        const ErrorFallback = () => {
            // DEBUG TRACE: Log ErrorFallback render
            console.log('🔴 [ErrorFallback RENDERED] Route failed, displaying error UI', {
                routeName: routeName || page,
                windowError: (typeof window !== 'undefined' && (window as any).__lazyErrorMessage) || 'No error message',
                timestamp: new Date().toISOString()
            });
            
            return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
                                const { softRecover } = await import('./src/utils/softNavigation');
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
        console.log('🟢 [renderRoute] About to render Component', {
            routeName: routeName || page,
            componentName: Component?.name,
            willRenderComponent: true,
            timestamp: new Date().toISOString()
        });

        return (
            <LazyLoadErrorBoundary fallback={<ErrorFallback />}>
                {/* PRODUCTION-FREEZE FIX: Temporarily disable Suspense to fix React 19 AsyncMode errors */}
                {/* <Suspense fallback={<LoadingSpinner />}> */}
                    <Component 
                        {...props} 
                        {...componentProps} 
                        t={t}
                        language={language}
                        onLanguageChange={handleLanguageSelect}
                        onNavigate={props.setPage}
                    />
                {/* </Suspense> */}
            </LazyLoadErrorBoundary>
        );
    };

    /**
     * Route matcher - Enterprise pattern for clean routing
     */
    console.log('[ROUTER] Resolving page:', page, '| Type:', typeof page);
    
    switch (page) {
        // ===== PUBLIC ROUTES =====
        case 'landing':
            return renderRoute(publicRoutes.landing.component);
        
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
                    
                    // Check for PWA redirect flag
                    const pwaRedirect = sessionStorage.getItem('pwa-redirect-after-login');
                    if (pwaRedirect) {
                        console.log('🏠 PWA redirect detected - navigating to:', pwaRedirect);
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
                    props.onNavigate(dashboardPage as Page);
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
                    props.onNavigate(dashboardPage as Page);
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
                        props.onNavigate(dashboardPage as Page);
                    } else {
                        console.error('Unknown user type:', userType);
                        props.onNavigate('home');
                    }
                },
                onBack: () => props.onNavigate('home')
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
                onBack: () => props.onNavigate('home')
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
                onBack: () => props.onNavigate('home')
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
            console.log('🔧 [TherapistProfile] Unified profile route');
            console.log('  - selectedTherapist:', props.selectedTherapist);
            console.log('  - URL:', window.location.href);
            
            // Parse ID from hash URL (/#/therapist-profile/123) or pathname
            let pathForId = window.location.pathname;
            const hashForId = window.location.hash;
            if (hashForId.startsWith('#/')) {
                pathForId = hashForId.substring(1); // Remove # to get /therapist-profile/123
            }
            
            const pathMatch = pathForId.match(/\/therapist-profile\/([a-z0-9]+)/);
            if (pathMatch) {
                const urlId = pathMatch[1];
                console.log('  - Extracted ID:', urlId);
                
                // Try to find in memory first (fast path)
                const foundTherapist = props.therapists.find((t: any) => 
                    (t.$id || t.id || '').toString() === urlId
                );
                
                if (foundTherapist) {
                    console.log('  ✅ Found in memory:', foundTherapist.name);
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
                    console.log('  🔍 Not in memory, fetching from Appwrite...');
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
            console.log('❌ [TherapistProfile] No therapist data available');
            console.log('  - selectedTherapist:', props.selectedTherapist);
            console.log('  - URL path:', window.location.pathname);
            console.log('  - URL hash:', window.location.hash);
            
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
                        <p className="text-gray-600 mb-4">Unable to load therapist profile. The therapist may not exist or the link may be invalid.</p>
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
        
        // 🔒 PROTECTED ROUTE - PRODUCTION CRITICAL 🔒
        // LEGACY: Keep old shared-therapist-profile working - Use new SharedTherapistProfile
        // ⚠️ DO NOT MODIFY - This route handles ALL /therapist-profile/:id URLs
        // ⚠️ Used by thousands of shared links in production
        case 'shared-therapist-profile':
            console.log('\n' + '🔧'.repeat(50));
            console.log('🔧 [ROUTER] Route matched: shared-therapist-profile');
            console.log('🔧'.repeat(50));
            console.log('📍 Current path:', window.location.pathname);
            console.log('🔗 Full URL:', window.location.href);
            console.log('📦 Route name:', page);
            console.log('👤 Has loggedInCustomer:', !!props.loggedInCustomer);
            console.log('📍 Has userLocation:', !!props.userLocation);
            console.log('🌐 Language:', props.language);
            console.log('🔧'.repeat(50));
            console.log('🚀 [ROUTER] Rendering SharedTherapistProfile component...');
            console.log('🔧'.repeat(50) + '\n');
            
            // Restore full shared profile UI (direct import, non-lazy)
            return (
                <SharedTherapistProfileDirect
                    {...props}
                    userLocation={props.userLocation}
                    loggedInCustomer={props.loggedInCustomer}
                    // handleQuickBookWithChat={props.handleQuickBookWithChat} // ❌ REMOVED: Complex event chain
                    onNavigate={props.onNavigate}
                    language={props.language}
                />
            );
        
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
        case 'privacy':
            return renderRoute(legalRoutes.privacy.component, {
                onBack: () => props.onNavigate?.('home'),
                t: dict?.privacyPolicy
            });
        
        case 'cookies-policy':
            return renderRoute(legalRoutes.cookies.component);
        
        case 'service-terms':
        case 'serviceTerms':
            return renderRoute(legalRoutes.serviceTerms.component, {
                onBack: () => props.onNavigate?.('home'),
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
        
        case 'chat-room':
            // Chat room is handled by App.tsx activeChat state
            // Redirect to home - chat will open via openChat event
            console.log('[ROUTE] chat-room accessed - redirecting to home');
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
            console.log('🔷 [SWITCH CASE] therapist-dashboard MATCHED');
            console.log('🔷 [ROUTE DEBUG] Component reference:', {
                component: therapistRoutes.dashboard.component,
                componentName: therapistRoutes.dashboard.component?.name,
                componentType: typeof therapistRoutes.dashboard.component,
                isFunction: typeof therapistRoutes.dashboard.component === 'function'
            });
            console.log('[ROUTE RESOLVE] therapist-dashboard → TherapistDashboard');
            console.log('[ROUTE DEBUG] props.user:', {
                hasUser: !!props.user,
                userId: props.user?.$id || props.user?.id,
                userName: props.user?.name,
                userType: props.user?.type || props.user?.userType,
                timestamp: new Date().toISOString()
            });
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
                onNavigateToSchedule: () => props.onNavigate?.('therapist-schedule'),
                onNavigateToMenu: () => props.onNavigate?.('therapist-menu'),
                onNavigateHome: () => props.onNavigate?.('home'),
                language: props.language
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'status':
        case 'therapist-status':
            console.log('[ROUTE RESOLVE] therapist-status → TherapistOnlineStatus');
            return renderRoute(therapistRoutes.status.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'bookings':
        case 'therapist-bookings':
            console.log('[ROUTE RESOLVE] therapist-bookings → TherapistBookings');
            console.log('[ROUTER OK] therapist-bookings', '/dashboard/therapist/bookings');
            return renderRoute(therapistRoutes.bookings.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            }, 'therapist-bookings');
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'earnings':
        case 'therapist-earnings':
            console.log('[ROUTE RESOLVE] therapist-earnings → TherapistEarnings');
            return renderRoute(therapistRoutes.earnings.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'chat':
        case 'therapist-chat':
            console.log('[ROUTE RESOLVE] therapist-chat → TherapistChat');
            return renderRoute(therapistRoutes.chat.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'therapist-notifications':
            console.log('[ROUTE RESOLVE] therapist-notifications → TherapistNotifications');
            return renderRoute(therapistRoutes.notifications.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'legal':
        case 'therapist-legal':
            console.log('[ROUTE RESOLVE] therapist-legal → TherapistLegal');
            return renderRoute(therapistRoutes.legal.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'calendar':
        case 'therapist-calendar':
            console.log('[ROUTE RESOLVE] therapist-calendar → TherapistCalendar');
            return renderRoute(therapistRoutes.calendar.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'payment':
        case 'therapist-payment':
            console.log('[ROUTE RESOLVE] therapist-payment → TherapistPaymentInfo');
            return renderRoute(therapistRoutes.payment.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'payment-status':
        case 'therapist-payment-status':
            console.log('[ROUTE RESOLVE] payment-status/therapist-payment-status → TherapistPaymentStatus');
            const paymentStatusComponent = renderRoute(therapistRoutes.paymentStatus.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language
            });
            console.log('[ROUTER OK] ✅ payment-status component bound successfully');
            return paymentStatusComponent;
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'custom-menu':
        case 'therapist-menu':
            console.log('[ROUTE RESOLVE] custom-menu/therapist-menu → TherapistMenu');
            const menuComponent = renderRoute(therapistRoutes.menu.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language
            });
            console.log('[ROUTER OK] ✅ therapist-menu component bound successfully');
            return menuComponent;
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'commission-payment':
        case 'therapist-commission':
            console.log('[ROUTE RESOLVE] therapist-commission → CommissionPayment');
            return renderRoute(therapistRoutes.commission.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'send-discount':
            console.log('[ROUTE RESOLVE] send-discount → SendDiscountPage');
            return renderRoute(therapistRoutes.sendDiscount.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language
            });
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'schedule':
        case 'therapist-schedule':
            console.log('[ROUTE RESOLVE] therapist-schedule → TherapistSchedule');
            console.log('[ROUTER OK] therapist-schedule', '/dashboard/therapist/schedule');
            return renderRoute(therapistRoutes.schedule.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language
            }, 'therapist-schedule');
        
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

        // ===== ADMIN ROUTES (PROTECTED BY ROLE-BASED ACCESS CONTROL) =====
        case 'admin':
        case 'adminDashboard': // camelCase variant
        case 'admin-dashboard':
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
        
        case 'admin-live-listings':
            return renderRoute(adminRoutes.liveListings.component, {
                therapists: props.therapists || [],
                loggedInAgent: props.loggedInAgent,
                onNavigate: props.onNavigate
            });

        // ===== FALLBACK =====
        // 🚫 DO NOT REDIRECT — FAIL VISIBLE
        default:
            console.error('[ROUTE RESOLVE] ❌ Unknown route:', page);
            console.error('[ROUTE RESOLVE] ❌ Route type:', typeof page);
            console.error('[ROUTE RESOLVE] ❌ props.currentPage:', props.currentPage);
            console.error('[ROUTE RESOLVE] ❌ All props keys:', Object.keys(props));
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Route Not Found</h2>
                        <p className="text-gray-600 mb-4">Page exists but component not implemented yet</p>
                        <div className="bg-gray-100 rounded p-3 mb-4">
                            <code className="text-sm text-gray-700">Route: {page}</code>
                            <br />
                            <code className="text-sm text-gray-700">Type: {typeof page}</code>
                        </div>
                        <button
                            onClick={() => props.onNavigate?.('home')}
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            );
    }
};

export default AppRouter;






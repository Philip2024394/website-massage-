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

/** Shown when a therapist route has been removed from dashboard; redirects to therapist-dashboard. */
function TherapistRedirectToDashboard({ onNavigate }: { onNavigate?: (p: string) => void }) {
  useEffect(() => { onNavigate?.('therapist-dashboard'); }, [onNavigate]);
  return <div className="min-h-[120px] flex items-center justify-center text-gray-500 text-sm">Redirecting...</div>;
}
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
import { getTermsAgreed, setTermsAgreed } from './lib/termsAgreementStorage';
import { facialPlaceService } from './lib/appwriteService';
import { MOCK_FACIAL_PLACE, MOCK_FACIAL_PLACE_ID } from './constants/mockFacialPlace';
import { MOCK_MASSAGE_PLACE, MOCK_MASSAGE_PLACE_ID } from './constants/mockMassagePlace';
import { MOCK_BEAUTY_PLACE, MOCK_BEAUTY_PLACE_ID } from './constants/mockBeautyPlace';
import { MOCK_BEAUTY_THERAPIST, MOCK_BEAUTY_THERAPIST_ID } from './constants/mockHomeServiceTherapists';
import DashboardTermsGate from './components/DashboardTermsGate';
import UserTermsGate from './components/UserTermsGate';

// Specialized pages not in route modules
// LoadingGate - NOT lazy loaded for immediate availability (prevents loops)
import LoadingGate from './pages/LoadingGate';

const CreateAccountPage = React.lazy(() => import('./pages/auth/CreateAccountPage'));
const ConfirmTherapistsPage = React.lazy(() => import('./pages/ConfirmTherapistsPage'));
const EmployerJobPostingPage = React.lazy(() => import('./pages/EmployerJobPostingPage'));
const IndastreetPartnersPage = React.lazy(() => import('./pages/IndastreetPartnersPage'));
const IndastreetNewsPage = React.lazy(() => import('./pages/IndastreetNewsPage'));
const WebsiteManagementPage = React.lazy(() => import('./pages/WebsiteManagementPage'));
const GuestProfilePage = React.lazy(() => import('./pages/GuestProfilePage'));
const QRCodePage = React.lazy(() => import('./pages/QRCodePage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const BookingPage = React.lazy(() => import('./pages/BookingPage'));
const MembershipPage = React.lazy(() => import('./pages/MembershipPage'));
const MembershipPartnerPage = React.lazy(() => import('./pages/MembershipPartnerPage').then(m => ({ default: m.MembershipPartnerPage })));
const MembershipSuccessPage = React.lazy(() => import('./pages/MembershipSuccessPage').then(m => ({ default: m.MembershipSuccessPage })));
const AcceptBookingPage = React.lazy(() => import('./pages/AcceptBookingPage'));
const DeclineBookingPage = React.lazy(() => import('./pages/DeclineBookingPage'));
const LeadAcceptPage = React.lazy(() => import('./pages/LeadAcceptPage'));
const LeadDeclinePage = React.lazy(() => import('./pages/LeadDeclinePage'));
const JobPostingPaymentPage = React.lazy(() => import('./pages/JobPostingPaymentPage'));
const ApplyForJobPage = React.lazy(() => import('./pages/ApplyForJobPage'));
const BrowseJobsPage = React.lazy(() => import('./pages/BrowseJobsPage'));
const MassageJobsPage = React.lazy(() => import('./pages/MassageJobsPage'));
const PartnershipApplicationPage = React.lazy(() => import('./pages/PartnershipApplicationPage'));
const PartnerContactPage = React.lazy(() => import('./pages/PartnerContactPage'));
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
const MassageCityPlacesSignupPage = React.lazy(() => import('./pages/auth/MassageCityPlacesSignupPage'));
const IncreaseYourEarningsPage = React.lazy(() => import('./pages/place/IncreaseYourEarningsPage'));

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
const WellnessSoutheastAsiaPage = React.lazy(() => import('./pages/blog/WellnessSoutheastAsiaPage'));
const MassageSpaStandardsAsiaEuropePage = React.lazy(() => import('./pages/blog/MassageSpaStandardsAsiaEuropePage'));
const SkinClinicTrendsInternationalPage = React.lazy(() => import('./pages/blog/SkinClinicTrendsInternationalPage'));
const BuildingWellnessBusinessInternationalPage = React.lazy(() => import('./pages/blog/BuildingWellnessBusinessInternationalPage'));

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
    setSelectedMassageType?: (type: string) => void;
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
    const attemptedId = therapistId || null;
    const looksLikePlaceholder = attemptedId && /^therapist_\d+$/i.test(attemptedId);
    
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
        const errMsg = error || 'Unable to load therapist profile';
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 mb-2 font-mono text-sm break-all">{errMsg}</p>
                    {looksLikePlaceholder && (
                        <p className="text-sm text-amber-700 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            The ID <strong>{attemptedId}</strong> looks like a sample or demo link. Browse from the homepage to find a therapist.
                        </p>
                    )}
                    {attemptedId && !looksLikePlaceholder && (
                        <p className="text-xs text-gray-500 mb-4">Attempted ID: {attemptedId}</p>
                    )}
                    <button
                        onClick={() => props.onNavigate?.('home')}
                        className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
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
        <React.Suspense fallback={<div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto my-8"></div>}> 
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
                        className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors mr-2"
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

    // Wrap consumer pages with user terms gate (tracking agreement for services on indastreetmassage.com)
    const consumerPagesForUserTerms: Page[] = ['home', 'about', 'contact', 'company', 'how-it-works', 'faq', 'massage-types', 'facial-types', 'providers', 'facialProviders', 'facial-providers', 'facial-places', 'facial-home-service', 'discounts', 'women-reviews', 'advanced-search', 'help-faq', 'top-therapists', 'special-offers', 'video-center', 'hotels-and-villas', 'hotel-villa-safe-pass', 'safePass', 'therapist-profile', 'place-profile', 'booking', 'terms', 'privacy'];
    const wrapWithUserTermsIfNeeded = (currentPage: Page, content: React.ReactNode) => {
        if (!consumerPagesForUserTerms.includes(currentPage)) return content;
        return (
            <UserTermsGate userId={props.loggedInCustomer?.$id} t={t}>
                {content}
            </UserTermsGate>
        );
    };
    
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
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.home.component, {
                page: page,
                user: props.user,
                onNavigate: props.onNavigate,
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces,
                hotels: props.hotels,
                userLocation: props.userLocation,
                loggedInCustomer: props.loggedInCustomer,
                loggedInProvider: props.loggedInProvider,
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
                language: props.language,
                selectedMassageType: props.selectedMassageType ?? undefined,
            }));
        
        case 'about':
        case 'about-us':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.about.component, {
                onNavigate: props.onNavigate,
                language: props.language,
                t: t,
            }));
        
        case 'contact':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.contact.component));
        
        case 'company':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.company.component));
        
        case 'how-it-works':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.howItWorks.component));
        
        case 'faq':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.faq.component));

        case 'indonesia':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.indonesia.component, {
                onNavigate: props.onNavigate,
                handleSetSelectedTherapist: props.handleSetSelectedTherapist,
                handleSetSelectedPlace: props.handleSetSelectedPlace,
                language: props.language,
                countryName: 'Indonesia',
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
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces ?? [],
            }));

        case 'uk':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.uk.component, {
                onNavigate: props.onNavigate,
                handleSetSelectedTherapist: props.handleSetSelectedTherapist,
                language: props.language === 'id' ? 'en' : (props.language ?? 'gb'),
                countryName: 'United Kingdom',
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
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces ?? [],
            }));

        case 'malaysia':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.malaysia.component, {
                onNavigate: props.onNavigate,
                handleSetSelectedTherapist: props.handleSetSelectedTherapist,
                language: props.language === 'id' ? 'en' : (props.language ?? 'en'),
                countryName: 'Malaysia',
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
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces ?? [],
            }));

        case 'singapore':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.singapore.component, {
                onNavigate: props.onNavigate,
                handleSetSelectedTherapist: props.handleSetSelectedTherapist,
                language: props.language === 'id' ? 'en' : (props.language ?? 'en'),
                countryName: 'Singapore',
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
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces ?? [],
            }));

        case 'thailand':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.thailand.component, {
                onNavigate: props.onNavigate,
                handleSetSelectedTherapist: props.handleSetSelectedTherapist,
                language: props.language === 'id' ? 'en' : (props.language ?? 'en'),
                countryName: 'Thailand',
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
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces ?? [],
            }));

        case 'philippines':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.philippines.component, {
                onNavigate: props.onNavigate,
                handleSetSelectedTherapist: props.handleSetSelectedTherapist,
                language: props.language === 'id' ? 'en' : (props.language ?? 'en'),
                countryName: 'Philippines',
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
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces ?? [],
            }));

        case 'vietnam':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.vietnam.component, {
                onNavigate: props.onNavigate,
                handleSetSelectedTherapist: props.handleSetSelectedTherapist,
                language: props.language === 'id' ? 'en' : (props.language ?? 'en'),
                countryName: 'Vietnam',
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
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces ?? [],
            }));

        case 'united-states':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes['united-states'].component, {
                onNavigate: props.onNavigate,
                handleSetSelectedTherapist: props.handleSetSelectedTherapist,
                language: props.language === 'id' ? 'en' : (props.language ?? 'en'),
                countryName: 'United States',
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
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces ?? [],
            }));

        case 'australia':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.australia.component, {
                onNavigate: props.onNavigate,
                handleSetSelectedTherapist: props.handleSetSelectedTherapist,
                language: props.language === 'id' ? 'en' : (props.language ?? 'en'),
                countryName: 'Australia',
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
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces ?? [],
            }));

        case 'germany':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.germany.component, {
                onNavigate: props.onNavigate,
                handleSetSelectedTherapist: props.handleSetSelectedTherapist,
                language: props.language === 'id' ? 'en' : (props.language ?? 'en'),
                countryName: 'Germany',
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
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces ?? [],
            }));
        
        case 'massage-types':
        case 'massageTypes':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.massageTypes.component, {
                onNavigate: props.onNavigate,
                t: t,
                language: props.language,
                therapists: props.therapists,
                places: props.places,
                onFindTherapists: (massageType: string) => {
                    try { sessionStorage.setItem('massage_type_filter_view', 'therapists'); } catch (_) {}
                    props.setSelectedMassageType?.(massageType);
                    props.onNavigate?.('home');
                },
                onFindPlaces: (massageType: string) => {
                    try { sessionStorage.setItem('massage_type_filter_view', 'places'); } catch (_) {}
                    props.setSelectedMassageType?.(massageType);
                    props.onNavigate?.('home');
                },
                onMassageJobsClick: props.onMassageJobsClick,
                onHotelPortalClick: props.onHotelPortalClick,
                onVillaPortalClick: props.onVillaPortalClick,
                onTherapistPortalClick: props.onTherapistPortalClick,
                onMassagePlacePortalClick: props.onMassagePlacePortalClick,
                onAgentPortalClick: props.onAgentPortalClick,
                onCustomerPortalClick: props.onCustomerPortalClick,
                onAdminPortalClick: props.onAdminPortalClick,
                onTermsClick: props.onTermsClick,
                onPrivacyClick: props.onPrivacyClick,
            }));
        
        case 'facial-types':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.facialTypes.component, {
                onNavigate: props.onNavigate,
                t: t,
                language: props.language,
                therapists: props.therapists,
                places: props.places,
                onFindTherapists: () => {
                    try { sessionStorage.setItem('home_initial_tab', 'facials'); } catch (_) {}
                    props.onNavigate?.('home');
                },
                onFindPlaces: () => props.onNavigate?.('facial-places'),
                onMassageJobsClick: props.onMassageJobsClick,
                onTherapistPortalClick: props.onTherapistPortalClick,
                onMassagePlacePortalClick: props.onMassagePlacePortalClick,
                onFacialPortalClick: props.onFacialPortalClick,
                onAgentPortalClick: props.onAgentPortalClick,
                onCustomerPortalClick: props.onCustomerPortalClick,
                onAdminPortalClick: props.onAdminPortalClick,
                onTermsClick: props.onTermsClick,
                onPrivacyClick: props.onPrivacyClick,
            }));
        
        case 'providers':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.providers.component));
        
        case 'facialProviders':
        case 'facial-providers':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.facialProviders.component, {
                facialPlaces: props.facialPlaces ?? [],
                userLocation: props.userLocation,
                selectedCity: props.selectedCity,
                onSetUserLocation: props.handleSetUserLocation,
                onSelectPlace: props.handleSetSelectedPlace,
                onIncrementAnalytics: (id: number | string, type: 'therapist' | 'place', metric: string) => props.handleIncrementAnalytics?.(id, type, metric),
                onShowRegisterPrompt: props.handleShowRegisterPrompt,
                onBack: () => props.onNavigate?.('home'),
                t: t,
                language: props.language,
                onMassageJobsClick: props.onMassageJobsClick,
                onTherapistPortalClick: props.onTherapistPortalClick,
                onMassagePlacePortalClick: props.onMassagePlacePortalClick,
                onFacialPortalClick: props.onFacialPortalClick,
                onAgentPortalClick: props.onAgentPortalClick,
                onCustomerPortalClick: props.onCustomerPortalClick,
                onAdminPortalClick: props.onAdminPortalClick,
                onTermsClick: props.onTermsClick,
                onPrivacyClick: props.onPrivacyClick,
                therapists: props.therapists,
                places: props.places,
            }));

        case 'facial-places':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.facialPlaces.component, {
                facialPlaces: props.facialPlaces ?? [],
                userLocation: props.userLocation,
                selectedCity: props.selectedCity,
                onSelectPlace: props.handleSetSelectedPlace,
                onIncrementAnalytics: (id: number | string, type: 'therapist' | 'place', metric: string) => props.handleIncrementAnalytics?.(id, type, metric),
                onShowRegisterPrompt: props.handleShowRegisterPrompt,
                onNavigate: props.onNavigate,
                t: t,
                language: props.language,
                onMassageJobsClick: props.onMassageJobsClick,
                onTherapistPortalClick: props.onTherapistPortalClick,
                onMassagePlacePortalClick: props.onMassagePlacePortalClick,
                onFacialPortalClick: props.onFacialPortalClick,
                onAgentPortalClick: props.onAgentPortalClick,
                onCustomerPortalClick: props.onCustomerPortalClick,
                onAdminPortalClick: props.onAdminPortalClick,
                onTermsClick: props.onTermsClick,
                onPrivacyClick: props.onPrivacyClick,
                therapists: props.therapists,
                places: props.places,
            }));

        case 'facial-home-service':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.facialHomeService.component, {
                onNavigate: props.onNavigate,
                t: t,
                language: props.language,
                onMassageJobsClick: props.onMassageJobsClick,
                onTherapistPortalClick: props.onTherapistPortalClick,
                onMassagePlacePortalClick: props.onMassagePlacePortalClick,
                onFacialPortalClick: props.onFacialPortalClick,
                onAgentPortalClick: props.onAgentPortalClick,
                onCustomerPortalClick: props.onCustomerPortalClick,
                onAdminPortalClick: props.onAdminPortalClick,
                onTermsClick: props.onTermsClick,
                onPrivacyClick: props.onPrivacyClick,
                therapists: props.therapists,
                places: props.places,
            }));
        
        case 'discounts':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.discounts.component));
        
        case 'women-reviews':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.womenReviews.component, {
                t: t,
                language: props.language,
                onNavigate: props.onNavigate,
                onSelectTherapist: props.handleSetSelectedTherapist,
                onSelectPlace: props.handleSetSelectedPlace,
                therapists: props.therapists,
                places: props.places,
                facialPlaces: props.facialPlaces
            }));
        
        case 'advanced-search':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.advancedSearch.component, {
                t: t,
                language: props.language,
                onNavigate: props.onNavigate
            }));
        
        case 'help-faq':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.helpFaq.component, {
                t: t,
                language: props.language,
                onNavigate: props.onNavigate
            }));

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
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.topTherapists.component, {
                t: t,
                language: props.language,
                therapists: props.therapists,
                onNavigate: props.onNavigate,
                onSelectTherapist: props.handleSetSelectedTherapist
            }));
        
        case 'special-offers':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.specialOffers.component, {
                t: t,
                language: props.language,
                onNavigate: props.onNavigate
            }));
        
        case 'video-center':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.videoCenter.component, {
                t: t,
                language: props.language,
                onNavigate: props.onNavigate
            }));

        case 'hotels-and-villas':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.hotelsVillas.component, {
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
            }));
        
        case 'hotel-villa-safe-pass':
        case 'safePass':
            return wrapWithUserTermsIfNeeded(page, renderRoute(publicRoutes.safePass.component, {
                onNavigate: props.onNavigate,
                onTherapistPortalClick: props.onTherapistPortalClick,
                language: props.language
            }));

        // ===== JOIN ROUTES =====
        case 'joinIndastreet':
            return wrapWithUserTermsIfNeeded(page, renderRoute(RoleSelectionPage, {
                onNavigate: props.onNavigate,
                language: props.language,
                onLanguageChange: props.onLanguageChange,
                onMassageJobsClick: () => props.onNavigate('massage-jobs'),
                onHotelPortalClick: props.onHotelPortalClick,
                onVillaPortalClick: props.onVillaPortalClick,
                onTherapistPortalClick: props.onTherapistPortalClick,
                onMassagePlacePortalClick: props.onMassagePlacePortalClick,
                onFacialPortalClick: props.onFacialPortalClick,
                onAgentPortalClick: props.onAgentPortalClick,
                onCustomerPortalClick: props.onCustomerPortalClick,
                onAdminPortalClick: () => props.handleAdminLogin?.(),
                onTermsClick: () => props.onNavigate('terms'),
                onPrivacyClick: () => props.onNavigate('privacy'),
                onLoginClick: props.handleNavigateToTherapistLogin,
                therapists: props.therapists,
                places: props.places,
                t: t,
            }));

        // ===== AUTH ROUTES =====
        case 'auth':
            return renderRoute(authRoutes.auth.component, {
                onAuthSuccess: (userType: string) => {
                    const dashboardPageMap: Record<string, string> = {
                        'therapist': 'massage-therapist-dashboard',
                        'facial-therapist': 'facial-therapist-dashboard',
                        'beauty-therapist': 'beautician-therapist-dashboard',
                        'massage-place': 'massage-place-dashboard',
                        'facial-place': 'facial-place-dashboard'
                    };
                    const page = dashboardPageMap[userType];
                    if (page) {
                        props.onNavigate(page as Page);
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
                onNavigate: (page: string) => props.onNavigate(page as Page),
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
                        'therapist': 'massage-therapist-dashboard',
                        'facial-therapist': 'facial-therapist-dashboard',
                        'beauty-therapist': 'beautician-therapist-dashboard',
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
                onNavigate: (page: string) => props.onNavigate(page as Page),
                onAuthSuccess: async (userType: string) => {
                    if (props.restoreUserSession) {
                        await props.restoreUserSession();
                    }
                    const dashboardPageMap: Record<string, string> = {
                        'therapist': 'massage-therapist-dashboard',
                        'facial-therapist': 'facial-therapist-dashboard',
                        'beauty-therapist': 'beautician-therapist-dashboard',
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
                onNavigate: (page: string) => props.onNavigate(page as Page),
                onAuthSuccess: async (userType: string) => {
                    if (props.restoreUserSession) {
                        await props.restoreUserSession();
                    }
                    const dashboardPageMap: Record<string, string> = {
                        'therapist': 'massage-therapist-dashboard',
                        'facial-therapist': 'facial-therapist-dashboard',
                        'beauty-therapist': 'beautician-therapist-dashboard',
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
                    
                    if (props.restoreUserSession) {
                        logger.debug('Restoring user session after signup...');
                        await props.restoreUserSession();
                        logger.debug('User session restored');
                    }
                    
                    const dashboardPageMap: Record<string, string> = {
                        'therapist': 'massage-therapist-dashboard',
                        'facial-therapist': 'facial-therapist-dashboard',
                        'beauty-therapist': 'beautician-therapist-dashboard',
                        'massage-place': 'massage-place-dashboard',
                        'facial-place': 'facial-place-dashboard',
                        'employer': 'employer-job-posting'
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
        
        case 'create-account-employer':
            return renderRoute(authRoutes.signup.component, {
                mode: 'signup',
                defaultRole: 'employer',
                onAuthSuccess: async (userType: string) => {
                    logger.info('Signup successful (employer) - navigating to employer dashboard:', { userType });
                    
                    if (props.restoreUserSession) {
                        await props.restoreUserSession();
                    }
                    
                    props.onNavigate('employer-job-posting' as Page);
                },
                onBack: () => props.onNavigate('home'),
                language: props.language || 'id'
            });
            
        case 'therapist-signup':
        case 'massage-therapist-signup':
            return renderRoute(authRoutes.signup.component, {
                mode: 'signup',
                defaultRole: 'therapist',
                onAuthSuccess: async (userType: string) => {
                    if (props.restoreUserSession) await props.restoreUserSession();
                    props.onNavigate('massage-therapist-dashboard');
                },
                onBack: () => props.onNavigate('home'),
                language: props.language || 'id',
                onNavigate: props.onNavigate,
            });

        case 'facial-therapist-signup':
            return renderRoute(authRoutes.signup.component, {
                mode: 'signup',
                defaultRole: 'facial-therapist',
                onAuthSuccess: async (userType: string) => {
                    if (props.restoreUserSession) await props.restoreUserSession();
                    props.onNavigate('facial-therapist-dashboard');
                },
                onBack: () => props.onNavigate('home'),
                language: props.language || 'id',
                onNavigate: props.onNavigate,
            });

        case 'beautician-therapist-signup':
            return renderRoute(authRoutes.signup.component, {
                mode: 'signup',
                defaultRole: 'beauty-therapist',
                onAuthSuccess: async (userType: string) => {
                    if (props.restoreUserSession) await props.restoreUserSession();
                    props.onNavigate('beautician-therapist-dashboard');
                },
                onBack: () => props.onNavigate('home'),
                language: props.language || 'id',
                onNavigate: props.onNavigate,
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

        case 'massage-city-places-signup':
            // Massage City Places (Indonesia): no pricing shown, Name/Phone/WhatsApp/Business/City + OTP → dashboard
            return renderRoute(MassageCityPlacesSignupPage, {
                onNavigate: props.onNavigate,
                onBack: () => props.onNavigate('home'),
                onAuthSuccess: async () => {
                    if (props.restoreUserSession) await props.restoreUserSession();
                },
            });
            
        case 'increase-your-earnings':
            // Shown after place publishes listing (Step 4 – membership upsell)
            return renderRoute(IncreaseYourEarningsPage, {
                onBack: () => props.onNavigate?.('massage-place-dashboard'),
                onSelectPlan: (planId: string) => {
                    // TODO: wire to payment/plan upgrade
                    props.onNavigate?.('massage-place-dashboard');
                },
                currentPlanId: 'free',
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
                language: props.language || 'id',
                restoreUserSession: props.restoreUserSession,
                onNavigate: (p: string) => props.onNavigate?.(p),
                onBack: () => props.onNavigate?.('home'),
                onSuccess: () => props.onNavigate?.('therapist'),
                serviceType: 'massage',
                redirectToPage: 'massage-therapist-dashboard',
            });

        case 'massage-therapist-login':
            return renderRoute(authRoutes.therapistLogin.component, {
                language: props.language || 'id',
                restoreUserSession: props.restoreUserSession,
                onNavigate: (p: string) => props.onNavigate?.(p),
                onBack: () => props.onNavigate?.('home'),
                onSuccess: () => props.onNavigate?.('massage-therapist-dashboard'),
                serviceType: 'massage',
                redirectToPage: 'massage-therapist-dashboard',
            });

        case 'facial-therapist-login':
            return renderRoute(authRoutes.therapistLogin.component, {
                language: props.language || 'id',
                restoreUserSession: props.restoreUserSession,
                onNavigate: (p: string) => props.onNavigate?.(p),
                onBack: () => props.onNavigate?.('home'),
                onSuccess: () => props.onNavigate?.('facial-therapist-dashboard'),
                serviceType: 'facial',
                redirectToPage: 'facial-therapist-dashboard',
            });

        case 'beautician-therapist-login':
            return renderRoute(authRoutes.therapistLogin.component, {
                language: props.language || 'id',
                restoreUserSession: props.restoreUserSession,
                onNavigate: (p: string) => props.onNavigate?.(p),
                onBack: () => props.onNavigate?.('home'),
                onSuccess: () => props.onNavigate?.('beautician-therapist-dashboard'),
                serviceType: 'beautician',
                redirectToPage: 'beautician-therapist-dashboard',
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
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
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
                        onChatWithBusyTherapist: props.handleChatWithBusyTherapist,
                        onShowRegisterPrompt: props.handleShowRegisterPromptForChat,
                        onIncrementAnalytics: props.handleIncrementAnalytics,
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
                }
                // Use selectedTherapist when ID matches (e.g. mock Facial/Beauty cards)
                const urlSlug = pathMatch[1];
                const selectedId = (props.selectedTherapist?.$id || props.selectedTherapist?.id || '').toString();
                const urlMatchesSelected = selectedId && (urlSlug === selectedId || urlSlug.startsWith(selectedId + '-'));
                if (props.selectedTherapist && urlMatchesSelected) {
                    logger.debug('  Using selectedTherapist (e.g. mock or just-selected):', { name: (props.selectedTherapist as any).name });
                    return renderRoute(profileRoutes.therapistProfile.component, {
                        therapist: props.selectedTherapist,
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
                    // Mock beautician profile: use static mock so treatment containers show (no Appwrite document)
                    const isMockBeauty = urlId === MOCK_BEAUTY_THERAPIST_ID || urlId.startsWith(MOCK_BEAUTY_THERAPIST_ID + '-');
                    if (isMockBeauty) {
                        logger.debug('  Using mock beautician profile (URL match):', { urlId });
                        return renderRoute(profileRoutes.therapistProfile.component, {
                            therapist: MOCK_BEAUTY_THERAPIST,
                            onBack: () => props.setPage?.('home'),
                            onLanguageChange: props.onLanguageChange,
                            language: props.language,
                            selectedCity: props.selectedCity,
                            onCityChange: props.onCityChange,
                            therapists: props.therapists,
                            places: props.places,
                            onNavigate: props.onNavigate,
                            onChatWithBusyTherapist: props.handleChatWithBusyTherapist,
                            onShowRegisterPrompt: props.handleShowRegisterPromptForChat,
                            onIncrementAnalytics: props.handleIncrementAnalytics,
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
                    }
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
                            className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
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
            
            // Resolve place: selectedPlace, or from URL (numeric or string ID including mock)
            const placePathMatch = window.location.pathname.match(/\/profile\/place\/([^/]+)/) || (typeof window !== 'undefined' && (window.location.hash || '').match(/profile\/place\/([^/]+)/));
            let resolvedMassagePlace = props.selectedPlace;
            if (!resolvedMassagePlace && placePathMatch) {
                const fullSegment = placePathMatch[1];
                const urlId = fullSegment.split('-')[0];
                if (urlId === MOCK_MASSAGE_PLACE_ID || fullSegment.startsWith(MOCK_MASSAGE_PLACE_ID + '-')) {
                    resolvedMassagePlace = MOCK_MASSAGE_PLACE as Place;
                } else {
                    const foundPlace = props.places?.find((p: any) =>
                        (p.id || p.$id || '').toString() === urlId
                    );
                    if (foundPlace) resolvedMassagePlace = foundPlace;
                }
            }
            if (resolvedMassagePlace) {
                return renderRoute(profileRoutes.massagePlace.component, {
                        place: resolvedMassagePlace,
                        onBack: () => props.setPage?.('home'),
                        onSelectPlace: props.handleSetSelectedPlace,
                        userLocation: props.userLocation,
                        loggedInCustomer: props.loggedInCustomer,
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

            // No place resolved (no URL match and no selectedPlace): show inline fallback
            // so we never mount MassagePlaceProfilePage without a place (avoids component load errors)
            return (
                <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-6xl mb-4">🏨</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Place not found</h2>
                        <p className="text-gray-600 mb-4">This place may not exist or the link may be incorrect.</p>
                        <button
                            onClick={() => props.onNavigate?.('home')}
                            className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            );
        
        case 'facial-place-profile': {
            logger.debug('[FacialPlaceProfile] Rendering facial place profile page');
            logger.debug('  - selectedPlace:', { place: props.selectedPlace });
            const pathForFacial = typeof window !== 'undefined' ? (window.location.pathname || '').replace(/^\/+/, '') : '';
            const hashForFacial = typeof window !== 'undefined' ? (window.location.hash || '').replace(/^#\/?/, '') : '';
            const pathOrHash = pathForFacial || hashForFacial;
            const facialPathMatch = pathOrHash ? pathOrHash.match(/profile\/facial\/([^/]+)/) : null;
            const fullSegment = facialPathMatch ? facialPathMatch[1] : null;
            const slugFromName = (name: string) => (name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const findPlaceByUrlSegment = (segment: string) => {
                if (!segment || !props.facialPlaces?.length) return null;
                const fromList = props.facialPlaces.find((p: any) => {
                    const id = (p.$id || p.id || '').toString();
                    const slug = slugFromName(p.name);
                    return (id + '-' + slug) === segment || segment === id;
                });
                return fromList || null;
            };
            const mockSlug = slugFromName((MOCK_FACIAL_PLACE as any).name);
            const isMockUrl = fullSegment === (MOCK_FACIAL_PLACE_ID + '-' + mockSlug) || fullSegment === MOCK_FACIAL_PLACE_ID || (fullSegment != null && fullSegment.startsWith(MOCK_FACIAL_PLACE_ID + '-'));
            const resolvedPlace = props.selectedPlace
                || findPlaceByUrlSegment(fullSegment || '')
                || (isMockUrl ? (MOCK_FACIAL_PLACE as Place) : null)
                || (MOCK_FACIAL_PLACE as Place);
            const placeId = (resolvedPlace?.$id || resolvedPlace?.id || fullSegment?.split('-')[0] || '') as string;
            return renderRoute(profileRoutes.facialPlace.component, {
                place: resolvedPlace,
                placeId: placeId || (resolvedPlace ? (resolvedPlace.$id || resolvedPlace.id) : undefined),
                facialPlaces: props.facialPlaces ?? [],
                onBack: () => props.setPage('home'),
                onBook: () => {
                    const p = resolvedPlace || props.selectedPlace;
                    if (p?.whatsappNumber) {
                        const message = `Hi! I'd like to book a facial treatment at ${p.name}. When are you available?`;
                        window.open(`https://wa.me/${p.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
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
        }

        case 'beauty-place-profile': {
            logger.debug('[BeautyPlaceProfile] Rendering beauty place profile page');
            const pathForBeauty = typeof window !== 'undefined' ? (window.location.pathname || '').replace(/^\/+/, '') : '';
            const hashForBeauty = typeof window !== 'undefined' ? (window.location.hash || '').replace(/^#\/?/, '') : '';
            const pathOrHashBeauty = pathForBeauty || hashForBeauty;
            const beautyPathMatch = pathOrHashBeauty ? pathOrHashBeauty.match(/profile\/beauty\/([^/]+)/) : null;
            const fullSegmentBeauty = beautyPathMatch ? beautyPathMatch[1] : null;
            const slugFromNameB = (name: string) => (name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const isMockBeautyUrl = fullSegmentBeauty === MOCK_BEAUTY_PLACE_ID || (fullSegmentBeauty != null && fullSegmentBeauty.startsWith(MOCK_BEAUTY_PLACE_ID + '-'));
            const resolvedBeautyPlace = props.selectedPlace
                || (isMockBeautyUrl ? (MOCK_BEAUTY_PLACE as Place) : null)
                || (MOCK_BEAUTY_PLACE as Place);
            const beautyPlaceId = (resolvedBeautyPlace?.$id || resolvedBeautyPlace?.id || fullSegmentBeauty?.split('-')[0] || '') as string;
            return renderRoute(profileRoutes.beautyPlace.component, {
                place: resolvedBeautyPlace,
                placeId: beautyPlaceId || (resolvedBeautyPlace ? (resolvedBeautyPlace.$id || resolvedBeautyPlace.id) : undefined),
                beautyPlaces: [MOCK_BEAUTY_PLACE],
                onBack: () => props.setPage('home'),
                onBook: () => {
                    const p = resolvedBeautyPlace || props.selectedPlace;
                    if (p?.whatsappNumber) {
                        const message = `Hi! I'd like to book at ${p.name}. When are you available?`;
                        window.open(`https://wa.me/${(p as any).whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
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
                language: props.language,
                onLanguageChange: props.onLanguageChange
            });
        }
        
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

        // ===== BLOG / INDASTREET NEWS (single page: IndaStreet News for all posts) =====
        case 'blog':
            // Redirect to same content as indastreet-news
        case 'indastreet-news':
            return renderRoute(IndastreetNewsPage, {
                onNavigate: props.onNavigate,
                onLanguageChange: props.onLanguageChange,
                language: props.language,
                t: t,
                loggedInCustomer: props.loggedInCustomer,
                onMassageJobsClick: () => props.onNavigate?.('massage-jobs'),
                onVillaPortalClick: props.onVillaPortalClick,
                onTherapistPortalClick: props.onTherapistPortalClick,
                onMassagePlacePortalClick: props.onMassagePlacePortalClick,
                onAgentPortalClick: props.onAgentPortalClick,
                onCustomerPortalClick: props.onCustomerPortalClick,
                onAdminPortalClick: () => props.handleAdminLogin?.(),
                onTermsClick: () => props.onNavigate?.('terms'),
                onPrivacyClick: () => props.onNavigate?.('privacy'),
                therapists: props.therapists,
                places: props.places,
            });
        
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

        case 'blog-wellness-southeast-asia':
            return renderRoute(WellnessSoutheastAsiaPage);

        case 'blog-massage-spa-standards-asia-europe':
            return renderRoute(MassageSpaStandardsAsiaEuropePage);

        case 'blog-skin-clinic-trends-international':
            return renderRoute(SkinClinicTrendsInternationalPage);

        case 'blog-building-wellness-business-international':
            return renderRoute(BuildingWellnessBusinessInternationalPage);

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
        
        case 'membership-partner':
            return renderRoute(MembershipPartnerPage, {
                initialCountryCode: (props as any).countryCode ?? '',
                onJoinCommission: (countryCode: string) => {
                    props.onNavigate?.('create-account' as Page);
                },
                onBack: () => props.onNavigate?.('home'),
            });
        
        case 'membership-success':
            return renderRoute(MembershipSuccessPage, {
                onNavigateToSignup: () => props.onNavigate?.('create-account' as Page),
                onNavigateToLogin: () => props.onNavigate?.('therapist-login' as Page),
                onBack: () => props.onNavigate?.('home'),
            });
        
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
                language: props.language,
                onLanguageChange: props.onLanguageChange,
                onMassageJobsClick: () => props.onNavigate?.('massage-jobs'),
                onTermsClick: () => props.onNavigate?.('terms'),
                onPrivacyClick: () => props.onNavigate?.('privacy'),
                therapists: props.therapists,
                places: props.places,
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
                    try { sessionStorage.setItem('indastreet_apply_for_job_id', jobId); } catch (_) {}
                    (props as any).setSelectedJobId?.(jobId);
                    props.onNavigate?.('apply-for-job');
                },
                onCreateTherapistProfile: () => props.onNavigate?.('therapist-job-registration'),
                onNavigate: props.onNavigate,
            });
        
        case 'partnership-application':
            return renderRoute(PartnershipApplicationPage);

        case 'partner-contact':
            return renderRoute(PartnerContactPage, {
                onBack: () => props.onNavigate?.('indastreet-partners'),
                onNavigate: props.onNavigate,
                onMassageJobsClick: () => props.onNavigate?.('massage-jobs'),
                onHotelPortalClick: () => props.onNavigate?.('hotelVillaMenu'),
                onVillaPortalClick: () => props.onNavigate?.('villa-portal'),
                onTherapistPortalClick: () => props.onNavigate?.('therapist-login-for-jobs'),
                onMassagePlacePortalClick: () => props.onNavigate?.('place-login-for-jobs'),
                onAgentPortalClick: () => props.onNavigate?.('agent'),
                onCustomerPortalClick: () => props.onNavigate?.('home'),
                onAdminPortalClick: () => props.onNavigate?.('admin-login'),
                onTermsClick: () => props.onNavigate?.('terms'),
                onPrivacyClick: () => props.onNavigate?.('privacy'),
                therapists: props.therapists,
                places: props.places,
            });
        
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
                    onLogout: undefined, // Home service: account is active; only admin can deactivate
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
                        onLogout: undefined, // Home service: account is active; only admin can deactivate
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

        // ===== PLACE DASHBOARDS (with first-time terms gate) =====
        case 'massage-place-dashboard': {
            const massagePlaceUser = props.loggedInProvider || props.user;
            const massagePlaceId = (massagePlaceUser as any)?.$id;
            return renderRoute(DashboardTermsGate, {
                userId: massagePlaceId,
                providerType: 'place',
                t: dict?.serviceTerms,
                ChildComponent: placeRoutes.dashboard.component,
                childProps: {
                    place: massagePlaceUser,
                    onBack: () => props.onNavigate?.('home'),
                    onNavigate: props.onNavigate,
                    language: props.language
                }
            });
        }
        case 'facial-place-dashboard': {
            const facialPlaceUser = props.loggedInProvider || props.user;
            const facialPlaceId = (facialPlaceUser as any)?.$id ?? '';
            return renderRoute(DashboardTermsGate, {
                userId: facialPlaceId,
                providerType: 'facial',
                t: dict?.serviceTerms,
                ChildComponent: facialRoutes.dashboard.component,
                childProps: {
                    place: facialPlaceUser,
                    placeId: facialPlaceId,
                    onSave: (data: any) => {
                        if (facialPlaceId) {
                            // Home services: set Available and live immediately so place displays right away
                            const payload = { ...data, status: 'available', availability: 'Available', isLive: true };
                            facialPlaceService.update(facialPlaceId, payload).catch((e) => logger.error('[Facial dashboard] Save failed', e));
                        }
                    },
                    onBack: () => props.onNavigate?.('home'),
                    language: props.language
                }
            });
        }

        // ===== THERAPIST DASHBOARD ROUTES =====
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE
        case 'therapist':
        case 'therapistDashboard':
        case 'therapist-dashboard': {
            const therapistDashboardUser = props.loggedInProvider || props.user;
            const therapistDashboardId = (therapistDashboardUser as any)?.$id;
            return renderRoute(DashboardTermsGate, {
                userId: therapistDashboardId ?? undefined,
                providerType: 'therapist',
                t: dict?.serviceTerms,
                ChildComponent: therapistRoutes.status.component,
                childProps: {
                    therapist: therapistDashboardUser,
                    onBack: () => props.onNavigate?.('therapist-status'),
                    onNavigate: props.onNavigate,
                    language: props.language || 'id'
                }
            });
        }

        case 'massage-therapist-dashboard': {
            const therapistDashboardUser = props.loggedInProvider || props.user;
            const therapistDashboardId = (therapistDashboardUser as any)?.$id;
            return renderRoute(DashboardTermsGate, {
                userId: therapistDashboardId ?? undefined,
                providerType: 'therapist',
                t: dict?.serviceTerms,
                ChildComponent: therapistRoutes.status.component,
                childProps: {
                    therapist: therapistDashboardUser,
                    onBack: () => props.onNavigate?.('massage-therapist-dashboard'),
                    onNavigate: props.onNavigate,
                    language: props.language || 'id'
                }
            });
        }

        case 'facial-therapist-dashboard': {
            const therapistDashboardUser = props.loggedInProvider || props.user;
            const therapistDashboardId = (therapistDashboardUser as any)?.$id;
            return renderRoute(DashboardTermsGate, {
                userId: therapistDashboardId ?? undefined,
                providerType: 'therapist',
                t: dict?.serviceTerms,
                ChildComponent: therapistRoutes.status.component,
                childProps: {
                    therapist: therapistDashboardUser,
                    onBack: () => props.onNavigate?.('facial-therapist-dashboard'),
                    onNavigate: props.onNavigate,
                    language: props.language || 'id'
                }
            });
        }

        case 'beautician-therapist-dashboard': {
            const therapistDashboardUser = props.loggedInProvider || props.user;
            const therapistDashboardId = (therapistDashboardUser as any)?.$id;
            return renderRoute(DashboardTermsGate, {
                userId: therapistDashboardId ?? undefined,
                providerType: 'therapist',
                t: dict?.serviceTerms,
                ChildComponent: therapistRoutes.status.component,
                childProps: {
                    therapist: therapistDashboardUser,
                    onBack: () => props.onNavigate?.('beautician-therapist-dashboard'),
                    onNavigate: props.onNavigate,
                    language: props.language || 'id'
                }
            });
        }
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE (terms gate applied at therapist-dashboard; status shares same gate when opened directly)
        case 'status':
        case 'therapist-status': {
            const therapistUser = props.loggedInProvider || props.user;
            const therapistId = (therapistUser as any)?.$id;
            return renderRoute(DashboardTermsGate, {
                userId: therapistId ?? undefined,
                providerType: 'therapist',
                t: dict?.serviceTerms,
                ChildComponent: therapistRoutes.status.component,
                childProps: {
                    therapist: therapistUser,
                    onBack: () => props.onNavigate?.('therapist-status'),
                    onNavigate: props.onNavigate,
                    language: props.language || 'id'
                }
            });
        }
        
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
        
        // Removed from dashboard – redirect to dashboard
        case 'earnings':
        case 'therapist-earnings':
        case 'chat':
        case 'therapist-chat':
        case 'calendar':
        case 'therapist-calendar':
        case 'payment':
        case 'therapist-payment':
        case 'payment-status':
        case 'therapist-payment-status':
        case 'commission-payment':
        case 'therapist-commission':
        case 'therapist-commission-payment':
        case 'send-discount':
        case 'customers':
        case 'therapist-customers':
        case 'more-customers':
        case 'banner-discount':
        case 'therapist-banner-discount':
        case 'schedule':
        case 'therapist-schedule':
        case 'therapist-package-terms':
            return renderRoute(TherapistRedirectToDashboard, { onNavigate: props.onNavigate });
        
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

        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE (Job applications / CV for Massage Jobs)
        case 'therapist-job-applications':
            logger.debug('[ROUTE RESOLVE] therapist-job-applications → TherapistJobApplicationsPage');
            return renderRoute(therapistRoutes.jobApplications.component, {
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

        case 'therapist-massage-types-directory':
            return renderRoute(therapistRoutes.massageTypesDirectory.component, {
                variant: 'therapist',
                provider: props.user,
                onBackToStatus: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });

        // 🚫 DO NOT REDIRECT — Membership plans (post profile-save live)
        case 'therapist-membership-plans':
            logger.debug('[ROUTE RESOLVE] therapist-membership-plans → TherapistMembershipPlansPage');
            return renderRoute(therapistRoutes.membershipPlans.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-dashboard'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });

        // 🚫 DO NOT REDIRECT — Premium upgrade (payment proof)
        case 'therapist-premium-upgrade':
            logger.debug('[ROUTE RESOLVE] therapist-premium-upgrade → PremiumUpgrade');
            return renderRoute(therapistRoutes.premium.component, {
                therapist: props.user,
                onNavigate: props.onNavigate
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
        
        // 🚫 DO NOT REDIRECT — ENTERPRISE ROUTE (Therapist-specific)
        case 'therapist-safe-pass-apply':
            logger.debug('[ROUTE RESOLVE] therapist-safe-pass-apply → SafePassApplyLandingPage');
            return renderRoute(therapistRoutes.safePassApply.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-status'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });

        case 'therapist-hotel-villa-safe-pass':
            logger.debug('[ROUTE RESOLVE] therapist-hotel-villa-safe-pass → TherapistHotelVillaSafePassPage');
            return renderRoute(therapistRoutes.hotelVillaSafePass.component, {
                therapist: props.user,
                onBack: () => props.onNavigate?.('therapist-safe-pass-apply'),
                onNavigate: props.onNavigate,
                language: props.language || 'id'
            });

        // SafePass Application (New System)
        case 'therapist-safepass-apply':
            logger.debug('[ROUTE RESOLVE] therapist-safepass-apply → TherapistSafePassWrapper');
            return renderRoute(therapistRoutes.safePassApplication.component, {
                onBack: () => props.onNavigate?.('therapist-dashboard')
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






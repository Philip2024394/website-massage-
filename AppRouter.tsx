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

// Specialized pages not in route modules
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
            return renderRoute(publicRoutes.home.component);
        
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

        // ===== AUTH ROUTES =====
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
            return renderRoute(profileRoutes.therapist.component);
        
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
            return renderRoute(profileRoutes.massagePlace.component);
        
        case 'facial-place-profile':
            return renderRoute(profileRoutes.facialPlace.component);
        
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

        // ===== DASHBOARD ROUTES =====
        case 'therapistDashboard':
        case 'therapist-dashboard':
            return renderRoute(authRoutes.therapistLogin.component, {
                redirectToDashboard: true
            });
        
        case 'placeDashboard':
        case 'place-dashboard':
            return renderRoute(authRoutes.placeLogin.component, {
                redirectToDashboard: true
            });

        // ===== FALLBACK =====
        default:
            return renderRoute(publicRoutes.home.component);
    }
};

export default AppRouter;

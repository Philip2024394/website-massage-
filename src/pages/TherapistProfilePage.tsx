// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * 🛡️ SEALED THERAPIST OPERATIONAL DASHBOARD (STOD) - TIER 1 PROTECTED
 * This dashboard is a sealed operational surface; do not modify unless explicitly instructed by the owner.
 * 
 * SEALED PROFILE MANAGEMENT - Business-Critical Profile Interface
 * Protection Level: TIER 1 - Owner-Sealed Operational Interface
 */
import React, { useState, useEffect, useRef } from 'react';
import TherapistProfileBase from '../components/TherapistProfileBase';
import { therapistOffersService, SERVICE_TYPES } from '../constants/serviceTypes';
import { FloatingChatWindow } from '../chat';
import HomeIcon from '../components/icons/HomeIcon';
import { Building, Sparkles, Scissors, SlidersHorizontal } from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import UniversalHeader from '../components/shared/UniversalHeader';
import { logger } from '../utils/logger';

interface TherapistProfilePageProps {
    therapist: any;
    onBack: () => void;
    distance?: number;
    onQuickBookWithChat?: (therapist: any) => void;
    userLocation?: { lat: number; lng: number } | null;
    loggedInCustomer?: any;
    loggedInProvider?: { id: number | string; type: 'therapist' | 'place' } | null;
    onBook?: (provider: any, type: 'therapist' | 'place') => void;
    onChatWithBusyTherapist?: (therapist: any) => void;
    onShowRegisterPrompt?: () => void;
    onIncrementAnalytics?: (id: number | string, type: 'therapist' | 'place', metric: string) => void;
    onNavigate?: (route: string, data?: any) => void;
    t?: any;
    // Shared view mode props
    isSharedView?: boolean; // When true: hide header, show hero logo + SEO footer
    // New props for header functionality
    onLanguageChange?: (lang: string) => void;
    language?: string;
    selectedCity?: string;
    onCityChange?: (city: string) => void;
    therapists?: any[];
    places?: any[];
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onFacialPortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
}

const TherapistProfilePage: React.FC<TherapistProfilePageProps> = ({
    therapist,
    onBack,
    userLocation,
    loggedInCustomer,
    loggedInProvider,
    onBook,
    onQuickBookWithChat,
    onChatWithBusyTherapist,
    onShowRegisterPrompt,
    onIncrementAnalytics,
    onNavigate,
    t,
    isSharedView = false,
    onLanguageChange,
    language = 'id',
    selectedCity = 'all',
    onCityChange,
    therapists,
    places,
    onMassageJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onFacialPortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick
}) => {
    // Initial state: prefer source from navigation (so the button/tab user came from is highlighted)
    const [mainTab, setMainTab] = useState<'home-service' | 'places'>(() => {
        try {
            const tab = sessionStorage.getItem('profile_source_tab');
            if (tab === 'places' || tab === 'home-service') return tab;
        } catch (_) {}
        return 'home-service';
    });
    const [serviceButton, setServiceButton] = useState<'massage' | 'facial' | 'beautician'>(() => {
        try {
            const service = sessionStorage.getItem('profile_source_service');
            if (service === 'massage' || service === 'facial' || service === 'beautician') return service;
        } catch (_) {}
        return 'massage';
    });
    const [cityState, setCityState] = useState<string>(selectedCity);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const goToHomeWithTab = (tab: string) => {
        try {
            sessionStorage.setItem('home_initial_tab', tab);
        } catch (_) {}
        onNavigate?.('home');
    };

    const appliedSourceFromNavigation = useRef(false);

    // Apply stored source on mount (from View profile click) so the correct button/tab is highlighted
    useEffect(() => {
        try {
            const service = sessionStorage.getItem('profile_source_service');
            const tab = sessionStorage.getItem('profile_source_tab');
            if (service === 'massage' || service === 'facial' || service === 'beautician') {
                setServiceButton(service);
                appliedSourceFromNavigation.current = true;
            }
            if (tab === 'places' || tab === 'home-service') {
                setMainTab(tab);
            }
            sessionStorage.removeItem('profile_source_service');
            sessionStorage.removeItem('profile_source_tab');
        } catch (_) {}
    }, []);

    // If no stored source (e.g. direct link), infer service from therapist so the right button is still highlighted
    useEffect(() => {
        if (!therapist || appliedSourceFromNavigation.current) return;
        if (therapistOffersService(therapist, SERVICE_TYPES.FACIAL)) {
            setServiceButton('facial');
        } else if (therapistOffersService(therapist, SERVICE_TYPES.BEAUTICIAN)) {
            setServiceButton('beautician');
        } else {
            setServiceButton('massage');
        }
    }, [therapist?.$id, therapist?.id]);
    
    // 🔥 CRITICAL LOG: Track TherapistProfilePage mount
    console.log('🎯 TherapistProfilePage MOUNTED:', {
        therapistExists: !!therapist,
        therapistId: therapist?.id || therapist?.$id,
        therapistName: therapist?.name,
        currentPath: window.location.pathname,
        currentHash: window.location.hash,
        propsReceived: {
            therapist: !!therapist,
            onBack: !!onBack,
            userLocation: !!userLocation,
            loggedInCustomer: !!loggedInCustomer,
            loggedInProvider: !!loggedInProvider,
            onBook: !!onBook,
            onChatWithBusyTherapist: !!onChatWithBusyTherapist,
            onShowRegisterPrompt: !!onShowRegisterPrompt,
            onIncrementAnalytics: !!onIncrementAnalytics,
            onNavigate: !!onNavigate,
            t: !!t,
            isSharedView: !!isSharedView,
            onLanguageChange: !!onLanguageChange,
            language: !!language,
            selectedCity: !!selectedCity,
            onCityChange: !!onCityChange,
            therapists: Array.isArray(therapists) ? therapists.length : 'not-array',
            places: Array.isArray(places) ? places.length : 'not-array'
        }
    });
    
    // ⚠️ GRACEFUL ERROR HANDLING - Show user-friendly error instead of throwing
    if (!therapist) {
        console.warn('⚠️ TherapistProfilePage rendered WITHOUT therapist data');
        console.log('🚨 Debug info:', {
            currentURL: window.location.href,
            referrer: document.referrer
        });
        
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Component Load Error</h2>
                    <p className="text-gray-600 mb-4">Failed to load page component. The component file may be missing or have a syntax error.</p>
                    <button
                        onClick={onBack}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="bg-gray-50">
            {/* Header - Hidden in shared view */}
            {!isSharedView && (
                <UniversalHeader 
                    language={language}
                    onLanguageChange={onLanguageChange}
                    onMenuClick={() => setIsMenuOpen(true)}
                />
            )}

            {/* App Drawer - Hidden in shared view */}
            {!isSharedView && isMenuOpen && (
                <AppDrawer
                    isHome={false}
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    t={t || {}}
                    language={(language || 'id') as 'en' | 'id' | 'gb'}
                    onMassageJobsClick={onMassageJobsClick}
                    onHotelPortalClick={onHotelPortalClick}
                    onVillaPortalClick={onVillaPortalClick}
                    onTherapistPortalClick={onTherapistPortalClick}
                    onMassagePlacePortalClick={onMassagePlacePortalClick}
                    onFacialPortalClick={onFacialPortalClick}
                    onAgentPortalClick={onAgentPortalClick}
                    onCustomerPortalClick={onCustomerPortalClick}
                    onAdminPortalClick={onAdminPortalClick}
                    onNavigate={onNavigate}
                    onTermsClick={onTermsClick}
                    onPrivacyClick={onPrivacyClick}
                    onQRCodeClick={() => onNavigate?.('qr-code')}
                    therapists={therapists || []}
                    places={places || []}
                />
            )}

            {/* Hero Logo - Only shown in shared view */}
            {isSharedView && (
                <div className="bg-white pt-6 pb-4">
                    <div className="flex justify-center">
                        <img 
                            src={`https://ik.imagekit.io/7grri5v7d/logo%20yoga.png?t=${Date.now()}`}
                            alt="IndaStreet Massage Logo" 
                            className="h-32 w-auto object-contain"
                        />
                    </div>
                </div>
            )}

            {/* Hero Section - Same as Home: Home Service | City Places, Massage | Facial | Beauty, Filter (no location container) */}
            <div className="bg-white border-b border-gray-100 pt-16">
                <div className="px-3 sm:px-4 pb-3 max-w-2xl mx-auto">
                    {/* Two tabs – Home Service | City Places (label is City Places, not Massage Places) */}
                    <div className="flex bg-gray-200 rounded-full p-1 overflow-x-auto">
                        <button
                            onClick={() => { setMainTab('home-service'); goToHomeWithTab('home'); }}
                            className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-full flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-colors duration-300 min-h-[42px] ${mainTab === 'home-service' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <HomeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">Home Service</span>
                        </button>
                        <button
                            onClick={() => { setMainTab('places'); goToHomeWithTab('places'); }}
                            className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-full flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-colors duration-300 min-h-[42px] ${mainTab === 'places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">City Places</span>
                        </button>
                    </div>

                    {/* Service buttons: Massage | Facial | Beauty | Filter */}
                    <div className="mt-4 flex flex-row gap-2 sm:gap-3 items-center min-h-[54px]">
                        <button
                            onClick={() => { setServiceButton('massage'); goToHomeWithTab('home'); }}
                            title="Massage"
                            className={`flex-1 min-w-0 h-[42px] px-2 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors border ${serviceButton === 'massage' ? 'bg-orange-500 text-white border-orange-500 shadow' : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300'}`}
                        >
                            <HomeIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">Massage</span>
                        </button>
                        <button
                            onClick={() => { setServiceButton('facial'); goToHomeWithTab('facials'); }}
                            title="Facial"
                            className={`flex-1 min-w-0 h-[42px] px-2 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors border ${serviceButton === 'facial' ? 'bg-orange-500 text-white border-orange-500 shadow' : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300'}`}
                        >
                            <Sparkles className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap truncate min-w-0">Facial</span>
                        </button>
                        <button
                            onClick={() => { setServiceButton('beautician'); goToHomeWithTab('beautician'); }}
                            title="Beauty"
                            className={`flex-1 min-w-0 h-[42px] px-2 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors border ${serviceButton === 'beautician' ? 'bg-orange-500 text-white border-orange-500 shadow' : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300'}`}
                        >
                            <Scissors className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap truncate min-w-0">Beauty</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => goToHomeWithTab('home')}
                            title="Filter"
                            aria-label="Open filters"
                            className="flex-shrink-0 h-[42px] w-[42px] rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Therapist Profile Content - Use Base Component */}
            <TherapistProfileBase
                therapist={therapist}
                mode="authenticated"
                userLocation={userLocation ? { ...userLocation, address: userLocation.address || 'Unknown' } : null}
                showHeader={false}
                showSEOFooter={isSharedView}
                selectedCity={cityState}
                onRate={() => console.log('Rate therapist:', therapist)}
                onQuickBookWithChat={onQuickBookWithChat ? () => onQuickBookWithChat(therapist) : undefined}
                onChatWithBusyTherapist={() => onChatWithBusyTherapist?.(therapist)}
                onShowRegisterPrompt={onShowRegisterPrompt}
                onIncrementAnalytics={(metric) => onIncrementAnalytics?.(therapist.id || therapist.$id, 'therapist', metric)}
                isCustomerLoggedIn={!!loggedInCustomer}
                loggedInProviderId={loggedInProvider?.id}
                onNavigate={onNavigate}
                t={t || {}}
                language={language}
            />

            {/* Quick Links Footer - Only for authenticated view */}
            {!isSharedView && (
                <div className="max-w-4xl mx-auto px-4">
                    <div className="mt-12 mb-6 flex flex-col items-center gap-2">
                        <div className="font-bold text-lg">
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500">Street</span>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 w-full">
                            <h3 className="text-center text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
                            <div className="flex flex-wrap justify-center gap-1 max-w-2xl mx-auto">
                                <button
                                onClick={() => onNavigate?.('home')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Home
                            </button>
                            <button
                                onClick={() => onNavigate?.('massage-types')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Massage Types
                            </button>
                            <button
                                onClick={() => onNavigate?.('facial-types')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Facial Types
                            </button>
                            <button
                                onClick={() => onNavigate?.('therapist-signup')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Join as a Therapist Today
                            </button>
                            <button
                                onClick={() => onNavigate?.('place-signup')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Join Massage Place
                            </button>
                            <button
                                onClick={() => onNavigate?.('about-us')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                About Us
                            </button>
                            <button
                                onClick={() => onNavigate?.('contact-us')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Contact Us
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        {/* Floating Chat Window */}
        <FloatingChatWindow userId={'guest'} userName={'Guest User'} userRole="customer" />
        </>
    );
};

TherapistProfilePage.displayName = 'TherapistProfilePage';

export default TherapistProfilePage;

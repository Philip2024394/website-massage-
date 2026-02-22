/**
 * useNavigation Hook
 * Handles all page navigation and routing logic
 */

import { useCallback } from 'react';
import type { Page, LoggedInProvider, LoggedInUser, Language } from '../types/pageTypes';
import type { Therapist, Place, UserLocation } from '../types';
import { logout } from '../lib/sessionManager';

interface UseNavigationProps {
    setPage: (page: Page) => void;
    setSelectedPlace: (place: Place | null) => void;
    setProviderAuthInfo: (info: { type: 'therapist' | 'place', mode: 'login' | 'register' } | null) => void;
    setProviderForBooking: (provider: { provider: Therapist | Place; type: 'therapist' | 'place' } | null) => void;
    setIsAdminLoggedIn: (value: boolean) => void;
    setLoggedInUser: (user: LoggedInUser | null) => void;
    loggedInProvider: LoggedInProvider | null;
    loggedInCustomer: any;
    // Additional props for landing page navigation
    setLanguage: (lang: Language) => void;
    setUserLocation: (location: UserLocation) => void;
    setIsHotelLoggedIn: (value: boolean) => void;
    setIsVillaLoggedIn: (value: boolean) => void;
    setLoggedInProvider: (provider: any) => void;
    setLoggedInAgent: (agent: any) => void;
    setImpersonatedAgent: (agent: any) => void;
    setLoggedInCustomer: (customer: any) => void;
    // Props for registration prompt
    setShowRegisterPrompt: (show: boolean) => void;
}

export const useNavigation = ({
    setPage,
    setSelectedPlace,
    setProviderAuthInfo,
    setProviderForBooking,
    setIsAdminLoggedIn,
    setLoggedInUser,
    loggedInProvider,
    loggedInCustomer,
    setLanguage,
    setUserLocation,
    setIsHotelLoggedIn,
    setIsVillaLoggedIn,
    setLoggedInProvider,
    setLoggedInAgent,
    setImpersonatedAgent,
    setLoggedInCustomer,
    setShowRegisterPrompt
}: UseNavigationProps) => {

    // Registration prompt handlers
    const handleRegisterPromptClose = useCallback(() => {
        setShowRegisterPrompt(false);
    }, [setShowRegisterPrompt]);

    const handleRegisterPromptRegister = useCallback(() => {
        setShowRegisterPrompt(false);
        setPage('profile');
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [setShowRegisterPrompt, setPage]);

    // Back navigation handlers
    const handleBackToHome = useCallback(() => {
        setSelectedPlace(null);
        setProviderAuthInfo(null);
        setProviderForBooking(null);
        
        // � CRITICAL FIX: Clear any redirect-causing session storage items when going to home
        sessionStorage.removeItem('pending_deeplink');
        sessionStorage.removeItem('direct_therapist_id');
        console.log('🗑️ [HOME_NAV] Cleared all redirect-causing session storage items');
        
        // �🔐 IMPORTANT: If therapist or place is logged in, go to their dashboard instead of public home
        // This ensures providers stay in their workspace when clicking home button
        if (loggedInProvider) {
            console.log('🏠 Provider logged in, redirecting to dashboard:', loggedInProvider.type);
            if (loggedInProvider.type === 'therapist') {
                setPage('therapistDashboard');
            } else if (loggedInProvider.type === 'place') {
                setPage('placeDashboard');
            } else {
                setPage('home'); // Fallback for other types
            }
        } else if (loggedInCustomer) {
            // Customer logged in - stay on public home but maintain session
            console.log('🏠 Customer logged in, going to public home (session maintained)');
            setPage('home');
        } else {
            // No one logged in - public home
            console.log('🏠 No session, going to public home');
            setPage('home');
        }
    }, [setSelectedPlace, setProviderAuthInfo, setProviderForBooking, setPage, loggedInProvider, loggedInCustomer]);

    const handleBackToProviderDashboard = useCallback(() => {
        if (loggedInProvider?.type === 'therapist') {
            setPage('therapistStatus');
        } else if (loggedInProvider?.type === 'place') {
            setPage('placeDashboard');
        } else {
            setPage('home');
        }
    }, [loggedInProvider, setPage]);

    // Simple page navigation handlers
    const handleNavigateToAuth = useCallback(() => setPage('profile'), [setPage]);
    // Sign In - goes to multi-portal selection page
    const handleNavigateToTherapistLogin = useCallback(() => setPage('signIn'), [setPage]);
    const handleNavigateToMassagePlaceLogin = useCallback(() => setPage('massagePlaceLogin'), [setPage]);
    // Redirect to simpleSignup instead of redundant registrationChoice page
    const handleNavigateToRegistrationChoice = useCallback(() => setPage('simpleSignup'), [setPage]);
    
    // Registration selection handler - now redirects to simpleSignup
    const handleSelectRegistration = useCallback((type: 'therapist' | 'place' | 'facial') => {
        console.log('🎯 HANDLER: Registration type selected:', type);
        
        // Store portal type in localStorage
        const portalTypeMap = {
            'therapist': 'massage_therapist',
            'place': 'massage_place',
            'facial': 'facial_place'
        };
        localStorage.setItem('selectedPortalType', portalTypeMap[type]);
        
        // Go to simpleSignup page (portal type is already pre-selected)
        setPage('simpleSignup');
    }, [setPage]);
    
    const handleNavigateToServiceTerms = useCallback(() => {
        console.log('📜 Terms navigation triggered');
        setPage('serviceTerms');
    }, [setPage]);
    const handleNavigateToPrivacyPolicy = useCallback(() => {
        console.log('🔒 Privacy navigation triggered');
        setPage('privacy');
    }, [setPage]);
    const handleNavigateToNotifications = useCallback(() => setPage('notifications'), [setPage]);
    
    // Portal handlers - for LOGIN (existing users)
    const handleNavigateToTherapistPortal = useCallback(() => {
        // Check if provider is logged in, route to dashboard, otherwise to login
        if (loggedInProvider?.type === 'therapist') {
            setPage('therapistDashboard');
        } else {
            setPage('therapistLogin');
        }
    }, [setPage, loggedInProvider]);
    
    const handleNavigateToMassagePlacePortal = useCallback(() => {
        // Check if provider is logged in, route to dashboard, otherwise to login
        if (loggedInProvider?.type === 'place') {
            setPage('placeDashboard');
        } else {
            setPage('massagePlaceLogin');
        }
    }, [setPage, loggedInProvider]);
    
    // Legacy handlers - kept for backward compatibility but functionality moved to URL-based routing
    // These are deprecated and should not be used for new implementations
    const handleNavigateToTherapistSignup = useCallback(() => {
        console.log('⚠️ DEPRECATED: Use URL-based routing instead: /signup?role=therapist');
        window.location.href = '/signup?role=therapist';
    }, []);
    
    const handleNavigateToMassagePlaceSignup = useCallback(() => {
        console.log('⚠️ DEPRECATED: Use URL-based routing instead: /signup?role=massage_place');
        window.location.href = '/signup?role=massage_place';
    }, []);
    
    const handleNavigateToFacialPlaceSignup = useCallback(() => {
        console.log('⚠️ DEPRECATED: Use URL-based routing instead: /signup?role=facial_place');
        window.location.href = '/signup?role=facial_place';
    }, []);
    
    const handleNavigateToTherapistProfileCreation = useCallback(() => {
        console.log('🎯 HANDLER: Navigating to therapist job registration');
        alert('🎯 APP.TSX CALLBACK EXECUTING!');
        setPage('therapistJobRegistration');
    }, [setPage]);

    // ❌ DEPRECATED: Legacy booking navigation - use local booking modals in components instead
    const handleNavigateToBooking = useCallback((provider: Therapist | Place, type: 'therapist' | 'place') => {
        console.warn('⚠️ DEPRECATED: handleNavigateToBooking called - functionality removed.');
        console.log('ℹ️ Use local booking modals in TherapistCard or SharedTherapistProfile instead.');
        console.log('❌ openChat events are no longer supported - use ChatProvider directly.');
        
        // No-op - legacy function kept for compatibility
        console.log('🚫 Function disabled - please update calling code to use modern booking flow');
    }, []);

    const handleNavigateToBookingPage = useCallback((therapist: Therapist) => {
        setProviderForBooking({ provider: therapist, type: 'therapist' });
        setPage('booking');
    }, [setProviderForBooking, setPage]);

    // Landing page navigation handlers
    const handleLanguageSelect = useCallback(async (lang: Language) => {
        console.log('🌐 Language selection on landing page:', lang);
        // Only set language, don't navigate or logout
        setLanguage(lang);
    }, [setLanguage]);

    const handleEnterApp = useCallback(async (lang: Language, location: UserLocation) => {
        console.log('🚀 handleEnterApp called with language:', lang, 'location:', location);
        
        try {
            console.log('🚀 Starting app entry process...');
            
            // Set flag to start fresh (prevent session restore)
            sessionStorage.setItem('start_fresh', 'true');
            // Mark that user has entered the app for this session
            sessionStorage.setItem('has_entered_app', 'true');
            
            // Clear dashboard sessions (using Appwrite session only)
            const existingProvider = null; // localStorage disabled
            if (!existingProvider) {
                console.log('🚀 No existing provider - clearing dashboard states');
                setIsAdminLoggedIn(false);
                setIsHotelLoggedIn(false);
                setIsVillaLoggedIn(false);
                setLoggedInProvider(null);
                setLoggedInAgent(null);
                setImpersonatedAgent(null);
                setLoggedInCustomer(null);
            } else {
                console.log('🚀 Existing provider found - preserving login state:', existingProvider);
            }
            
            // Set user preferences immediately (no delays)
            console.log('🚀 Setting language to:', lang);
            setLanguage(lang);
            
            console.log('🚀 Setting user location to:', location);
            setUserLocation(location);
            // localStorage disabled - using Appwrite only
            
            // Navigate to home page immediately
            console.log('🚀 Navigating to home page');
            setPage('home');
            
            // No need to call logout() - user is starting fresh, not logging out
            // The app handles fresh state via sessionStorage flags
            
            console.log('✅ App entry completed successfully');
        } catch (error) {
            console.error('❌ Navigation error during app entry:', error);
            // Ensure navigation happens even if other operations fail
            setLanguage(lang);
            setUserLocation(location);
            localStorage.setItem('user_location', JSON.stringify(location));
            sessionStorage.setItem('has_entered_app', 'true');
            setPage('home');
        }
    }, [setIsAdminLoggedIn, setIsHotelLoggedIn, setIsVillaLoggedIn, setLoggedInProvider, 
        setLoggedInAgent, setImpersonatedAgent, setLoggedInCustomer, setLanguage, 
        setUserLocation, setPage]);

    const handleSetUserLocation = useCallback((location: UserLocation) => {
        setUserLocation(location);
        localStorage.setItem('user_location', JSON.stringify(location));
    }, [setUserLocation]);

    const handleSetSelectedPlace = useCallback((place: Place | null) => {
        console.log('🏨 handleSetSelectedPlace called with:', place);
        setSelectedPlace(place);
        if (place) {
            const placeType = (place as any).type;
            const hasFacialTypes = (place as any).facialTypes !== undefined;
            const hasFacialServices = (place as any).facialServices !== undefined;
            const isBeauty = placeType === 'beauty';
            const isFacial = placeType === 'facial' || (hasFacialTypes || hasFacialServices) && !isBeauty;

            const id = (place as any).$id ?? (place as any).id ?? '';
            const slug = (place.name || 'place').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            if (isBeauty) {
                setPage('beauty-place-profile');
                const hash = `#/profile/beauty/${id}-${slug}`;
                if (typeof window !== 'undefined' && (window.location.hash || '') !== hash) {
                    window.history.pushState({ page: 'beauty-place-profile' }, '', hash);
                }
            } else if (isFacial) {
                setPage('facial-place-profile');
                const hash = `#/profile/facial/${id}-${slug}`;
                if (typeof window !== 'undefined' && (window.location.hash || '') !== hash) {
                    window.history.pushState({ page: 'facial-place-profile' }, '', hash);
                }
            } else {
                setPage('massage-place-profile');
                const hash = `#/profile/place/${id}-${slug}`;
                if (typeof window !== 'undefined' && (window.location.hash || '') !== hash) {
                    window.history.pushState({ page: 'massage-place-profile' }, '', hash);
                }
            }
        }
    }, [setSelectedPlace, setPage]);

    return {
        // Back navigation
        handleBackToHome,
        handleBackToProviderDashboard,
        
        // Simple navigation
        handleNavigateToAuth,
        handleNavigateToTherapistLogin,
        handleNavigateToMassagePlaceLogin,
        handleNavigateToRegistrationChoice,
        handleSelectRegistration,
        handleNavigateToServiceTerms,
        handleNavigateToPrivacyPolicy,
        handleNavigateToNotifications,
        handleNavigateToTherapistPortal,
        handleNavigateToMassagePlacePortal,
        handleNavigateToTherapistProfileCreation,
        
        // Signup navigation (new members - sets localStorage)
        handleNavigateToTherapistSignup,
        handleNavigateToMassagePlaceSignup,
        handleNavigateToFacialPlaceSignup,
        
        // Booking navigation
        handleNavigateToBooking,
        handleNavigateToBookingPage,
        
        // Landing page handlers
        handleLanguageSelect,
        handleEnterApp,
        handleSetUserLocation,
        handleSetSelectedPlace,
        
        // Registration prompt handlers
        handleRegisterPromptClose,
        handleRegisterPromptRegister,
    };
};

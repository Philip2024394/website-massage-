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
    setAdminDashboardTab: React.Dispatch<React.SetStateAction<any>>;
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
    setAdminDashboardTab,
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
        setPage('home');
    }, [setSelectedPlace, setProviderAuthInfo, setProviderForBooking, setPage]);

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
    const handleNavigateToTherapistLogin = useCallback(() => setPage('therapistLogin'), [setPage]);
    const handleNavigateToHotelLogin = useCallback(() => setPage('home'), [setPage]);
    const handleNavigateToVillaLogin = useCallback(() => setPage('home'), [setPage]);
    const handleNavigateToMassagePlaceLogin = useCallback(() => setPage('massagePlaceLogin'), [setPage]);
    const handleNavigateToAdminLogin = useCallback(() => setPage('adminLogin'), [setPage]);
    const handleNavigateToRegistrationChoice = useCallback(() => setPage('registrationChoice'), [setPage]);
    
    // Registration selection handler
    const handleSelectRegistration = useCallback((type: 'therapist' | 'place') => {
        console.log('🎯 HANDLER: Registration type selected:', type);
        setProviderAuthInfo({ type, mode: 'register' });
        setPage('registrationChoice');
    }, [setProviderAuthInfo, setPage]);
    
    const handleNavigateToServiceTerms = useCallback(() => setPage('serviceTerms'), [setPage]);
    const handleNavigateToPrivacyPolicy = useCallback(() => setPage('privacy'), [setPage]);
    const handleNavigateToNotifications = useCallback(() => setPage('notifications'), [setPage]);
    const handleNavigateToAgentAuth = useCallback(() => setPage('home'), [setPage]);
    const handleNavigateToCustomerAuth = useCallback(() => setPage('profile'), [setPage]);
    const handleNavigateToTherapistDashboard = useCallback(() => setPage('therapistDashboard'), [setPage]);
    const handleNavigateToCustomerDashboard = useCallback(() => {
        if (loggedInCustomer) {
            setPage('customerDashboard');
        } else {
            setPage('profile');
        }
    }, [loggedInCustomer, setPage]);
    const handleNavigateToTherapistProfileCreation = useCallback(() => {
        console.log('🎯 HANDLER: Navigating to therapist job registration');
        alert('🎯 APP.TSX CALLBACK EXECUTING!');
        setPage('therapistJobRegistration');
    }, [setPage]);

    // Booking navigation handlers - Updated to use advanced booking system
    const handleNavigateToBooking = useCallback((provider: Therapist | Place, type: 'therapist' | 'place') => {
        // Use the global booking popup system with orange Indastreet branding
        const globalBookingOpener = (window as any).openBookingPopup;
        if (globalBookingOpener) {
            console.log('🔥 Hotel/Villa booking using advanced system:', {
                providerName: provider.name,
                providerId: provider.id?.toString(),
                providerType: type,
                profilePicture: (provider as any).profilePicture || (provider as any).mainImage
            });
            
            globalBookingOpener(
                provider.name,
                (provider as any).whatsappNumber || '+6281234567890', // Default WhatsApp
                provider.id?.toString(),
                type,
                undefined, // hotelVillaId - will be handled by venue context
                undefined, // hotelVillaName - will be handled by venue context  
                undefined, // hotelVillaType - will be handled by venue context
                (provider as any).profilePicture || (provider as any).mainImage
            );
        } else {
            // Fallback to old booking page if global handler not available
            console.warn('⚠️ Global booking popup not available, using fallback');
            setProviderForBooking({ provider, type });
            setPage('booking');
        }
    }, [setProviderForBooking, setPage]);

    const handleNavigateToBookingPage = useCallback((therapist: Therapist) => {
        setProviderForBooking({ provider: therapist, type: 'therapist' });
        setPage('booking');
    }, [setProviderForBooking, setPage]);

    // Complex navigation handlers
    const handleAdminLogin = useCallback(() => {
        // Clear the start_fresh flag to allow session restoration
        sessionStorage.removeItem('start_fresh');
        
        setIsAdminLoggedIn(true);
        setLoggedInUser({ id: 'admin', type: 'admin' });
        setAdminDashboardTab('membership-pricing'); // Set membership pricing as first page
        setPage('adminDashboard');
    }, [setIsAdminLoggedIn, setLoggedInUser, setAdminDashboardTab, setPage]);

    // Landing page navigation handlers
    const handleLanguageSelect = useCallback(async (lang: Language) => {
        console.log('🌐 Language selection on landing page:', lang);
        // Only set language, don't navigate or logout
        setLanguage(lang);
    }, [setLanguage]);

    const handleEnterApp = useCallback(async (lang: Language, location: UserLocation) => {
        console.log('🚀 handleEnterApp called with language:', lang, 'location:', location);
        console.log('🚀 localStorage before enter:', localStorage.getItem('app_language'));
        
        try {
            console.log('🚀 Starting app entry process...');
            
            // Set flag to start fresh (prevent session restore)
            sessionStorage.setItem('start_fresh', 'true');
            // Mark that user has entered the app for this session
            sessionStorage.setItem('has_entered_app', 'true');
            
            // Clear all dashboard sessions when entering from landing page
            setIsAdminLoggedIn(false);
            setIsHotelLoggedIn(false);
            setIsVillaLoggedIn(false);
            setLoggedInProvider(null);
            setLoggedInAgent(null);
            setImpersonatedAgent(null);
            setLoggedInCustomer(null);
            
            // Set user preferences immediately (no delays)
            console.log('🚀 Setting language to:', lang);
            setLanguage(lang);
            
            console.log('🚀 Setting user location to:', location);
            setUserLocation(location);
            localStorage.setItem('user_location', JSON.stringify(location));
            
            // Navigate to home page immediately
            console.log('🚀 Navigating to home page');
            setPage('home');
            
            // Clean up session in background (non-blocking)
            logout().catch(error => console.warn('Background logout failed:', error));
            
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
        setSelectedPlace(place);
    }, [setSelectedPlace]);

    return {
        // Back navigation
        handleBackToHome,
        handleBackToProviderDashboard,
        
        // Simple navigation
        handleNavigateToAuth,
        handleNavigateToTherapistLogin,
        handleNavigateToHotelLogin,
        handleNavigateToVillaLogin,
        handleNavigateToMassagePlaceLogin,
        handleNavigateToAdminLogin,
        handleNavigateToRegistrationChoice,
        handleSelectRegistration,
        handleNavigateToServiceTerms,
        handleNavigateToPrivacyPolicy,
        handleNavigateToNotifications,
        handleNavigateToAgentAuth,
        handleNavigateToCustomerAuth,
        handleNavigateToTherapistDashboard,
        handleNavigateToCustomerDashboard,
        handleNavigateToTherapistProfileCreation,
        
        // Booking navigation
        handleNavigateToBooking,
        handleNavigateToBookingPage,
        
        // Complex navigation
        handleAdminLogin,
        
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

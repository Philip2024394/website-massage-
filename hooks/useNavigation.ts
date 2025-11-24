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
    const handleNavigateToMassagePlaceLogin = useCallback(() => setPage('massagePlaceLogin'), [setPage]);
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
    const handleNavigateToTherapistPortal = useCallback(() => setPage('therapistPortal'), [setPage]);
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
        setSelectedPlace(place);
    }, [setSelectedPlace]);

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
        handleNavigateToTherapistProfileCreation,
        
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

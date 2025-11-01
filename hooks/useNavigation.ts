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
    setLoggedInUser: React.Dispatch<React.SetStateAction<LoggedInUser | null>>;
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
        setPage('customerAuth');
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
    const handleNavigateToAuth = useCallback(() => setPage('unifiedLogin'), [setPage]);
    const handleNavigateToTherapistLogin = useCallback(() => setPage('therapistLogin'), [setPage]);
    const handleNavigateToHotelLogin = useCallback(() => setPage('hotelLogin'), [setPage]);
    const handleNavigateToVillaLogin = useCallback(() => setPage('villaLogin'), [setPage]);
    const handleNavigateToMassagePlaceLogin = useCallback(() => setPage('massagePlaceLogin'), [setPage]);
    const handleNavigateToAdminLogin = useCallback(() => setPage('adminLogin'), [setPage]);
    const handleNavigateToRegistrationChoice = useCallback(() => setPage('registrationChoice'), [setPage]);
    const handleNavigateToServiceTerms = useCallback(() => setPage('serviceTerms'), [setPage]);
    const handleNavigateToPrivacyPolicy = useCallback(() => setPage('privacy'), [setPage]);
    const handleNavigateToNotifications = useCallback(() => setPage('notifications'), [setPage]);
    const handleNavigateToAgentAuth = useCallback(() => setPage('agentAuth'), [setPage]);
    const handleNavigateToCustomerAuth = useCallback(() => setPage('customerAuth'), [setPage]);
    const handleNavigateToTherapistDashboard = useCallback(() => setPage('therapistDashboard'), [setPage]);
    const handleNavigateToCustomerDashboard = useCallback(() => {
        if (loggedInCustomer) {
            setPage('customerDashboard');
        } else {
            setPage('customerAuth');
        }
    }, [loggedInCustomer, setPage]);
    const handleNavigateToTherapistProfileCreation = useCallback(() => {
        console.log('🎯 HANDLER: Navigating to therapist job registration');
        alert('🎯 APP.TSX CALLBACK EXECUTING!');
        setPage('therapistJobRegistration');
    }, [setPage]);

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
        // Set flag to start fresh (prevent session restore)
        sessionStorage.setItem('start_fresh', 'true');
        
        // Clear all dashboard sessions when entering from landing page
        setIsAdminLoggedIn(false);
        setIsHotelLoggedIn(false);
        setIsVillaLoggedIn(false);
        setLoggedInProvider(null);
        setLoggedInAgent(null);
        setImpersonatedAgent(null);
        setLoggedInCustomer(null);
        
        // Clear session storage
        await logout();
        
        setLanguage(lang);
        setPage('home');
    }, [setIsAdminLoggedIn, setIsHotelLoggedIn, setIsVillaLoggedIn, setLoggedInProvider, 
        setLoggedInAgent, setImpersonatedAgent, setLoggedInCustomer, setLanguage, setPage]);

    const handleEnterApp = useCallback(async (lang: Language, location: UserLocation) => {
        // Set flag to start fresh (prevent session restore)
        sessionStorage.setItem('start_fresh', 'true');
        
        // Clear all dashboard sessions when entering from landing page
        setIsAdminLoggedIn(false);
        setIsHotelLoggedIn(false);
        setIsVillaLoggedIn(false);
        setLoggedInProvider(null);
        setLoggedInAgent(null);
        setImpersonatedAgent(null);
        setLoggedInCustomer(null);
        
        // Clear session storage
        await logout();
        
        setLanguage(lang);
        setUserLocation(location);
        localStorage.setItem('user_location', JSON.stringify(location));
        setPage('home');
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
        handleNavigateToServiceTerms,
        handleNavigateToPrivacyPolicy,
        handleNavigateToNotifications,
        handleNavigateToAgentAuth,
        handleNavigateToCustomerAuth,
        handleNavigateToTherapistDashboard,
        handleNavigateToCustomerDashboard,
        handleNavigateToTherapistProfileCreation,
        
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

/**
 * useAllHooks - Centralized hook initialization
 * Combines all feature hooks into a single hook for cleaner App.tsx
 */

import { useAppState } from './useAppState';
import { useDataFetching } from './useDataFetching';
import { useNavigation } from './useNavigation';
import { useAuthHandlers } from './useAuthHandlers';
import { useBookingHandlers } from './useBookingHandlers';
import { useProviderAgentHandlers } from './useProviderAgentHandlers';
// Local database handlers removed - using Appwrite only
import { useFooterNavigation } from './useFooterNavigation';
import { useDerivedState } from './useDerivedState';
import { useHomeHandlers } from './useHomeHandlers';
import { useSessionRestore } from './useSessionRestore';
import { useURLRouting } from './useURLRouting';
import { useEffect } from 'react';
import { getClient, APPWRITE_CONFIG } from '../lib/appwrite/config';

export const useAllHooks = () => {
    // ALWAYS call hooks in the same order - never conditionally
    const state = useAppState();
    const dataFetching = useDataFetching();
    
    // URL routing - sync page state with browser URL; city from /indonesia/:city/:service
    useURLRouting(state.page, state.setPage, state.setSelectedCity);
    
    // Loading coordinator: switch from loading → landing after 300ms (or when therapists ready)
    useEffect(() => {
        if (state.page !== 'loading') return;
        const timer = setTimeout(() => {
            state.setPage('landing');
            sessionStorage.removeItem('LOADING_LOCKED');
        }, 300);
        return () => clearTimeout(timer);
    }, [state.page, state.setPage]);
    
    // Fetch therapists and places on app init (always all; HomePage filters by selectedCity client-side)
    useEffect(() => {
        const initializeData = async () => {
            try {
                console.log('� [STAGE 3 - useAllHooks] Starting data fetch...');
                const { therapists, places, facialPlaces, hotels } = await dataFetching.fetchPublicData(undefined);
                console.log('✅ [STAGE 3 - useAllHooks] Received from fetchPublicData:', {
                    therapists: therapists?.length || 0,
                    places: places?.length || 0,
                    facialPlaces: facialPlaces?.length || 0,
                    hotels: hotels?.length || 0
                });
                console.log('🔍 [STAGE 3] Setting therapists in App state...');
                state.setTherapists(therapists);
                console.log('✅ [STAGE 3] Therapists set in state:', therapists?.length || 0);
                state.setPlaces(places);
                state.setFacialPlaces(facialPlaces);
                console.log('✅ [useAllHooks] Facial places set in state:', facialPlaces?.length || 0);
                state.setHotels(hotels);
            } catch (error) {
                console.error('❌ Failed to initialize app data:', error);
                // Set empty arrays to prevent loading state
                state.setTherapists([]);
                state.setPlaces([]);
                state.setFacialPlaces([]);
                state.setHotels([]);
            }
        };

        initializeData();
    }, []); // Fetch once on mount; city filtering is done client-side in HomePage

    // Live therapist feed: refetch when therapists collection changes (status/availability/approved)
    useEffect(() => {
        const databaseId = APPWRITE_CONFIG.databaseId;
        const collectionId = APPWRITE_CONFIG.collections.therapists;
        const channel = `databases.${databaseId}.collections.${collectionId}.documents`;

        const refetchTherapists = async () => {
            try {
                const { therapists, places, facialPlaces, hotels } = await dataFetching.fetchPublicData(undefined);
                state.setTherapists(therapists);
                state.setPlaces(places);
                state.setFacialPlaces(facialPlaces);
                state.setHotels(hotels);
            } catch (e) {
                console.warn('[APPWRITE therapists] Realtime refetch failed:', e);
            }
        };

        let unsubscribe: (() => void) | undefined;
        try {
            unsubscribe = getClient().subscribe(channel, () => {
                refetchTherapists();
            });
        } catch (err) {
            console.warn('[APPWRITE therapists] Realtime subscription setup failed:', err);
        }
        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, []); // Subscribe once; refetch uses stable fetchPublicData and state setters

    // 🔄 Listen for discount activation events and refresh data
    useEffect(() => {
        const handleDataRefresh = async (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log('🔄 [REFRESH EVENT] Data refresh triggered:', customEvent.detail);
            try {
                console.log('🔄 [REFRESH EVENT] Calling fetchPublicData without city filter (fetch all)');
                const { therapists, places, hotels } = await dataFetching.fetchPublicData();
                console.log('🔄 [REFRESH EVENT] Fetched data:', { 
                    therapistCount: therapists.length, 
                    placeCount: places.length,
                    hotelCount: hotels.length,
                    therapistNames: therapists.map((t: any) => t.name).join(', ')
                });
                
                console.log('🔄 [REFRESH EVENT] Updating state with new data...');
                state.setTherapists(therapists);
                state.setPlaces(places);
                state.setHotels(hotels);
                console.log('✅ [REFRESH EVENT] HomePage therapists updated successfully!');
            } catch (error) {
                console.error('❌ [REFRESH EVENT] Failed to refresh data:', error);
            }
        };

        window.addEventListener('refreshTherapistData', handleDataRefresh);
        
        return () => {
            window.removeEventListener('refreshTherapistData', handleDataRefresh);
        };
    }, [dataFetching, state]);
    
    // ALWAYS call navigation hook in the same order
    const navigation = useNavigation({
        setPage: state.setPage,
        setSelectedPlace: state.setSelectedPlace,
        setProviderAuthInfo: state.setProviderAuthInfo,
        setProviderForBooking: state.setProviderForBooking,
        setIsAdminLoggedIn: state.setIsAdminLoggedIn,
        setLoggedInUser: state.setLoggedInUser,
        loggedInProvider: state.loggedInProvider,
        loggedInCustomer: state.loggedInCustomer,
        // Additional props for landing page navigation
        setLanguage: state.setLanguage,
        setUserLocation: state.setUserLocation,
        setIsHotelLoggedIn: state.setIsHotelLoggedIn,
        setIsVillaLoggedIn: state.setIsVillaLoggedIn,
        setLoggedInProvider: state.setLoggedInProvider,
        setLoggedInAgent: state.setLoggedInAgent,
        setImpersonatedAgent: state.setImpersonatedAgent,
        setLoggedInCustomer: state.setLoggedInCustomer,
        // Registration prompt
        setShowRegisterPrompt: state.setShowRegisterPrompt
    });
    
    // ALWAYS call auth handlers in the same order
    const authHandlers = useAuthHandlers({
        setPage: state.setPage,
        setIsAdminLoggedIn: state.setIsAdminLoggedIn,
        setLoggedInUser: state.setLoggedInUser,
        setUser: state.setUser,
        setLoggedInProvider: state.setLoggedInProvider,
        setLoggedInAgent: state.setLoggedInAgent,
        setLoggedInCustomer: state.setLoggedInCustomer,
        setIsHotelLoggedIn: state.setIsHotelLoggedIn,
        setIsVillaLoggedIn: state.setIsVillaLoggedIn,
        getLoggedInProvider: () => state.loggedInProvider
    });
    
    // Session restoration on app startup
    const { restoreUserSession } = useSessionRestore({
        setLoggedInProvider: state.setLoggedInProvider,
        setLoggedInCustomer: state.setLoggedInCustomer,
        setLoggedInAgent: state.setLoggedInAgent,
        setIsHotelLoggedIn: state.setIsHotelLoggedIn,
        setIsVillaLoggedIn: state.setIsVillaLoggedIn,
        setLoggedInUser: state.setLoggedInUser
    });
    // ALWAYS call booking handlers in the same order
    const bookingHandlers = useBookingHandlers({
        language: state.language,
        user: state.user,
        loggedInCustomer: state.loggedInCustomer,
        isHotelLoggedIn: state.isHotelLoggedIn,
        isVillaLoggedIn: state.isVillaLoggedIn,
        providerForBooking: state.providerForBooking,
        bookings: state.bookings,
        setBookings: state.setBookings,
        setActiveChatRoom: state.setActiveChatRoom,
        setChatBooking: state.setChatBooking,
        setIsChatWindowVisible: state.setIsChatWindowVisible,
        setPage: state.setPage,
        setLoyaltyEvent: state.setLoyaltyEvent,
        setShowRegisterPrompt: state.setShowRegisterPrompt,
        setRegisterPromptContext: (context: string) => state.setRegisterPromptContext(context as 'booking' | 'chat'),
        t: {} // Will be provided by App.tsx
    });
    
    // Create a refresh function that re-fetches data from the database
    const refreshData = async () => {
        try {
            console.log('🔄 Refreshing therapists and places data...');
            const { therapists, places } = await dataFetching.fetchPublicData();
            state.setTherapists(therapists);
            state.setPlaces(places);
            console.log('✅ Data refresh completed');
        } catch (error) {
            console.error('❌ Failed to refresh data:', error);
            throw error;
        }
    };

    // Local database handlers removed - using Appwrite only
    
    // ALWAYS call provider/agent handlers in the same order (keeping for compatibility)
    const originalProviderAgentHandlers = useProviderAgentHandlers({
        loggedInProvider: state.loggedInProvider,
        loggedInAgent: state.loggedInAgent,
        impersonatedAgent: state.impersonatedAgent,
        therapists: state.therapists,
        places: state.places,
        setLoggedInAgent: state.setLoggedInAgent,
        setImpersonatedAgent: state.setImpersonatedAgent,
        setAdminMessages: state.setAdminMessages,
        setPage: state.setPage,
        setTherapists: state.setTherapists,
        setPlaces: state.setPlaces,
        refreshData: refreshData
    });
    
    // ✅ APPWRITE ONLY: Use original provider/agent handlers for all functions
    const providerAgentHandlers = originalProviderAgentHandlers;
    
    // ALWAYS call footer navigation in the same order
    const footerNav = useFooterNavigation({
        setPage: state.setPage,
        loggedInUser: state.loggedInUser,
        loggedInProvider: state.loggedInProvider,
        loggedInAgent: state.loggedInAgent,
        loggedInCustomer: state.loggedInCustomer,
        isHotelLoggedIn: state.isHotelLoggedIn
    });

    // ALWAYS call derived state in the same order
    const derived = useDerivedState({
        isAdminLoggedIn: state.isAdminLoggedIn,
        loggedInProvider: state.loggedInProvider,
        loggedInAgent: state.loggedInAgent,
        loggedInCustomer: state.loggedInCustomer,
        isHotelLoggedIn: state.isHotelLoggedIn,
        notifications: state.notifications,
        bookings: state.bookings,
        page: state.page,
        activeChatRoom: state.activeChatRoom
    });

    // ALWAYS call home handlers in the same order
    const homeHandlers = useHomeHandlers({
        user: state.user,
        language: state.language,
        loggedInCustomer: state.loggedInCustomer,
        isHotelLoggedIn: state.isHotelLoggedIn,
        isVillaLoggedIn: state.isVillaLoggedIn,
        setPage: state.setPage,
        setProviderForBooking: state.setProviderForBooking,
        setShowRegisterPrompt: state.setShowRegisterPrompt,
        setRegisterPromptContext: state.setRegisterPromptContext as any,
        setActiveChatRoom: state.setActiveChatRoom,
        setChatBooking: state.setChatBooking,
        setIsChatWindowVisible: state.setIsChatWindowVisible,
        setBookings: state.setBookings
    });

    return {
        state,
        dataFetching,
        navigation,
        authHandlers,
        bookingHandlers,
        providerAgentHandlers,
        footerNav,
        derived,
        homeHandlers,
        restoreUserSession
    };
};
